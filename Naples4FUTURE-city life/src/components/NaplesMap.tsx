import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  CityScenario,
  Lang,
  LatLng,
  NAPLES_CENTER,
  NaplesPlace,
  TransportMode,
  UI_COPY,
} from '../data/naplesData';
import { PLACE_IMAGES } from '../data/placeImages';
import { AlertTriangle, Clock, Navigation, Ticket, Users } from 'lucide-react';

export interface ActiveRouteRequest {
  origin: LatLng | string;
  destination: LatLng | string;
  originLabel: string;
  destinationLabel: string;
  mode: TransportMode;
  nonce: number;
}

export interface ComputedRouteStats {
  distanceMeters: number;
  durationMillis: number;
  steps: string[];
  modeUsed: string;
}

interface NaplesMapProps {
  places: NaplesPlace[];
  selectedPlace: NaplesPlace | null;
  onSelectPlace: (place: NaplesPlace | null) => void;
  activeScenario: CityScenario;
  routeRequest: ActiveRouteRequest | null;
  onRouteComputed: (stats: ComputedRouteStats | null, error: string | null, loading: boolean) => void;
  itineraryPlaces: NaplesPlace[];
  showHazardZone: boolean;
  onBookPlace: (place: NaplesPlace) => void;
  onRouteToPlace: (place: NaplesPlace) => void;
  lang: Lang;
  layerFilter: 'all' | 'mobility' | 'citizen_service' | 'commerce';
}

function getPinStyle(place: NaplesPlace, isSelected: boolean) {
  if (isSelected) {
    return { background: '#1d4ed8', borderColor: '#1e3a8a', glyphColor: '#ffffff', scale: 1.25 };
  }
  if (place.category === 'mobility') {
    if (place.crowdLevel === 'high') {
      return { background: '#dc2626', borderColor: '#991b1b', glyphColor: '#ffffff', scale: 1.05 };
    }
    if (place.crowdLevel === 'medium') {
      return { background: '#d97706', borderColor: '#92400e', glyphColor: '#ffffff', scale: 1.05 };
    }
    return { background: '#059669', borderColor: '#065f46', glyphColor: '#ffffff', scale: 1.0 };
  }
  if (place.category === 'citizen_service') {
    return { background: '#0284c7', borderColor: '#075985', glyphColor: '#ffffff', scale: 1.0 };
  }
  if (place.crowdLevel === 'low' && (place.kind === 'museum_ticket' || place.kind === 'monument')) {
    return { background: '#059669', borderColor: '#065f46', glyphColor: '#ffffff', scale: 1.05 };
  }
  return { background: '#7c3aed', borderColor: '#5b21b6', glyphColor: '#ffffff', scale: 1.0 };
}

interface PlaceMarkerProps {
  place: NaplesPlace;
  isSelected: boolean;
  onSelect: (place: NaplesPlace) => void;
}

function PlaceMarker({ place, isSelected, onSelect }: PlaceMarkerProps) {
  const [markerRef] = useAdvancedMarkerRef();
  const pin = getPinStyle(place, isSelected);
  const glyph =
    place.category === 'mobility'
      ? place.kind === 'parking_transit'
        ? 'P'
        : '!'
      : place.category === 'citizen_service'
      ? 'S'
      : place.kind === 'museum_ticket' || place.kind === 'monument' || place.kind === 'guided_tour'
      ? '★'
      : 'B';

  return (
    <AdvancedMarker
      ref={markerRef}
      position={place.position}
      title={place.name}
      onClick={() => onSelect(place)}
      zIndex={isSelected ? 50 : place.crowdLevel === 'high' ? 30 : 10}
    >
      <Pin
        background={pin.background}
        borderColor={pin.borderColor}
        glyphColor={pin.glyphColor}
        scale={pin.scale}
        glyph={glyph}
      />
    </AdvancedMarker>
  );
}

function RouteAndOverlaysLayer({
  routeRequest,
  onRouteComputed,
  itineraryPlaces,
  activeScenario,
  showHazardZone,
  selectedPlace,
}: {
  routeRequest: ActiveRouteRequest | null;
  onRouteComputed: (stats: ComputedRouteStats | null, error: string | null, loading: boolean) => void;
  itineraryPlaces: NaplesPlace[];
  activeScenario: CityScenario;
  showHazardZone: boolean;
  selectedPlace: NaplesPlace | null;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const mapsLib = useMapsLibrary('maps');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const itineraryPolylineRef = useRef<google.maps.Polyline | null>(null);
  const hazardCircleRef = useRef<google.maps.Circle | null>(null);

  // Pan to selected place smoothly
  useEffect(() => {
    if (!map || !selectedPlace) return;
    map.panTo(selectedPlace.position);
    const currentZoom = map.getZoom() ?? 14;
    if (currentZoom < 15) {
      map.setZoom(15);
    }
  }, [map, selectedPlace]);

  // Render City Control active criticality hazard zone
  useEffect(() => {
    if (!map || !mapsLib) return;
    if (hazardCircleRef.current) {
      hazardCircleRef.current.setMap(null);
      hazardCircleRef.current = null;
    }
    if (!showHazardZone) return;

    const isCritical = activeScenario.severity === 'critical';
    const circle = new mapsLib.Circle({
      map,
      center: activeScenario.center,
      radius: activeScenario.radiusMeters,
      strokeColor: isCritical ? '#dc2626' : '#d97706',
      strokeOpacity: 0.85,
      strokeWeight: 2,
      fillColor: isCritical ? '#ef4444' : '#f59e0b',
      fillOpacity: 0.16,
      clickable: false,
    });
    hazardCircleRef.current = circle;

    return () => {
      circle.setMap(null);
    };
  }, [map, mapsLib, activeScenario, showHazardZone]);

  // Render low-crowd multi-stop tourism itinerary
  useEffect(() => {
    if (!map || !mapsLib) return;
    if (itineraryPolylineRef.current) {
      itineraryPolylineRef.current.setMap(null);
      itineraryPolylineRef.current = null;
    }
    if (itineraryPlaces.length < 2) return;

    const path = itineraryPlaces.map((p) => p.position);
    const poly = new mapsLib.Polyline({
      path,
      geodesic: true,
      strokeColor: '#059669',
      strokeOpacity: 0.9,
      strokeWeight: 4,
      icons: [
        {
          icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
          offset: '0',
          repeat: '16px',
        },
      ],
      map,
    });
    itineraryPolylineRef.current = poly;

    const bounds = new google.maps.LatLngBounds();
    path.forEach((pt) => bounds.extend(pt));
    map.fitBounds(bounds, 64);

    return () => {
      poly.setMap(null);
    };
  }, [map, mapsLib, itineraryPlaces]);

  // Compute routes via modern Routes API JS SDK (Route.computeRoutes)
  useEffect(() => {
    if (!routesLib || !map || !routeRequest) {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
      return;
    }

    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
    onRouteComputed(null, null, true);

    const sdkTravelMode =
      routeRequest.mode === 'BUS' ||
      routeRequest.mode === 'METRO' ||
      routeRequest.mode === 'FERRY'
        ? 'TRANSIT'
        : 'WALKING';

    const strokeColor =
      routeRequest.mode === 'WALKING' ? '#1d4ed8' : '#0284c7';

    const request = {
      origin: routeRequest.origin,
      destination: routeRequest.destination,
      travelMode: sdkTravelMode,
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
    };

    let cancelled = false;

    const runCompute = async (reqPayload: Record<string, unknown>, modeLabel: string) => {
      const response = await (routesLib.Route as unknown as {
        computeRoutes: (r: Record<string, unknown>) => Promise<{ routes?: any[] }>;
      }).computeRoutes(reqPayload);

      if (cancelled) return;
      const routes = response?.routes ?? [];
      if (routes.length === 0) {
        if (sdkTravelMode === 'TRANSIT') {
          // Fallback cleanly to walking path if transit feed is unavailable for a leg
          await runCompute({ ...reqPayload, travelMode: 'WALKING' }, 'WALKING_FALLBACK');
          return;
        }
        onRouteComputed(null, 'Nessun percorso trovato per i punti selezionati.', false);
        return;
      }

      const primaryRoute = routes[0];
      const newPolylines: google.maps.Polyline[] = primaryRoute.createPolylines();
      newPolylines.forEach((polyline: google.maps.Polyline) => {
        polyline.setOptions({
          strokeColor,
          strokeWeight: 6,
          strokeOpacity: 0.9,
        });
        polyline.setMap(map);
      });
      polylinesRef.current = newPolylines;

      if (primaryRoute.viewport) {
        map.fitBounds(primaryRoute.viewport, 60);
      }

      const rawSteps: string[] = [];
      const legs = primaryRoute.legs ?? [];
      legs.forEach((leg: any) => {
        (leg.steps ?? []).forEach((step: any) => {
          const instr = step?.instructions || step?.navigationInstruction?.instructions;
          if (instr && typeof instr === 'string') {
            rawSteps.push(instr);
          }
        });
      });

      onRouteComputed(
        {
          distanceMeters: primaryRoute.distanceMeters ?? 1400,
          durationMillis: primaryRoute.durationMillis ?? 1200000,
          steps: rawSteps.slice(0, 6),
          modeUsed: modeLabel,
        },
        null,
        false
      );
    };

    runCompute(request, sdkTravelMode).catch((err: unknown) => {
      if (cancelled) return;
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('OVER_QUERY_LIMIT') ||
        msg.includes('429')
      ) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
      onRouteComputed(null, msg || 'Impossibile calcolare il percorso.', false);
    });

    return () => {
      cancelled = true;
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [routesLib, map, routeRequest, onRouteComputed]);

  return null;
}

export function NaplesMap({
  places,
  selectedPlace,
  onSelectPlace,
  activeScenario,
  routeRequest,
  onRouteComputed,
  itineraryPlaces,
  showHazardZone,
  onBookPlace,
  onRouteToPlace,
  lang,
  layerFilter,
}: NaplesMapProps) {
  const t = UI_COPY[lang];
  const [infoOpenForId, setInfoOpenForId] = useState<string | null>(null);

  const visiblePlaces = places.filter(
    (p) => layerFilter === 'all' || p.category === layerFilter
  );

  const handleMarkerSelect = useCallback(
    (place: NaplesPlace) => {
      onSelectPlace(place);
      setInfoOpenForId(place.id);
    },
    [onSelectPlace]
  );

  useEffect(() => {
    if (selectedPlace) {
      setInfoOpenForId(selectedPlace.id);
    }
  }, [selectedPlace]);

  const activeInfoPlace =
    visiblePlaces.find((p) => p.id === infoOpenForId) ??
    places.find((p) => p.id === infoOpenForId) ??
    null;

  return (
    <div className="relative h-full w-full bg-slate-100">
      <GoogleMap
        mapId="DEMO_MAP_ID"
        defaultCenter={NAPLES_CENTER}
        defaultZoom={14}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '100%' }}
        onClick={() => setInfoOpenForId(null)}
      >
        {visiblePlaces.map((place) => (
          <PlaceMarker
            key={place.id}
            place={place}
            isSelected={selectedPlace?.id === place.id}
            onSelect={handleMarkerSelect}
          />
        ))}

        {/* Scenario Criticità Marker */}
        <AdvancedMarker position={activeScenario.center} title={activeScenario.title}>
          <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white/95 px-2.5 py-1 text-xs font-semibold text-red-700 shadow-sm backdrop-blur-sm">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-600" />
            <span className="whitespace-nowrap">{activeScenario.zone}</span>
          </div>
        </AdvancedMarker>

        {activeInfoPlace && (
          <InfoWindow
            position={activeInfoPlace.position}
            maxWidth={290}
            onCloseClick={() => setInfoOpenForId(null)}
          >
            <div className="p-0.5 font-sans text-slate-900">
              {activeInfoPlace.imageKey && PLACE_IMAGES[activeInfoPlace.imageKey] && (
                <div className="mb-2.5 h-28 w-full overflow-hidden rounded-lg bg-slate-100">
                  <img
                    src={PLACE_IMAGES[activeInfoPlace.imageKey]}
                    alt={lang === 'EN' ? activeInfoPlace.nameEn : activeInfoPlace.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="text-xs text-slate-500">
                {activeInfoPlace.zone} · {activeInfoPlace.source}
              </div>
              <h3 className="mt-0.5 text-sm font-semibold leading-snug text-slate-900">
                {lang === 'EN' ? activeInfoPlace.nameEn : activeInfoPlace.name}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {lang === 'EN' ? activeInfoPlace.descriptionEn : activeInfoPlace.description}
              </p>

              <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-700 tabular-nums">
                <span className="inline-flex items-center gap-1 font-medium">
                  <Users className="h-3.5 w-3.5 text-slate-500" />
                  {t.crowd[activeInfoPlace.crowdLevel]} ({activeInfoPlace.crowdPercent}%)
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  {activeInfoPlace.waitTimeMin} min
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onRouteToPlace(activeInfoPlace)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-800 whitespace-nowrap"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  {lang === 'EN' ? 'Route' : 'Percorso'}
                </button>
                {activeInfoPlace.bookable && (
                  <button
                    type="button"
                    onClick={() => onBookPlace(activeInfoPlace)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap"
                  >
                    <Ticket className="h-3.5 w-3.5 text-blue-700" />
                    {lang === 'EN' ? 'Book' : 'Prenota'}
                  </button>
                )}
              </div>
            </div>
          </InfoWindow>
        )}

        <RouteAndOverlaysLayer
          routeRequest={routeRequest}
          onRouteComputed={onRouteComputed}
          itineraryPlaces={itineraryPlaces}
          activeScenario={activeScenario}
          showHazardZone={showHazardZone}
          selectedPlace={selectedPlace}
        />
      </GoogleMap>
    </div>
  );
}
