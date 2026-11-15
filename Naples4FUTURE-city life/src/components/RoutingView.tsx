import { useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import {
  CityScenario,
  Lang,
  LatLng,
  ROUTE_PRESETS,
  TransportMode,
  UI_COPY,
} from '../data/naplesData';
import { useAutocompleteSuggestions } from '../hooks/useAutocompleteSuggestions';
import { ActiveRouteRequest, ComputedRouteStats } from './NaplesMap';
import {
  AlertTriangle,
  Bus,
  CheckCircle2,
  Footprints,
  MapPin,
  Navigation,
  Ship,
  TrainFront,
} from 'lucide-react';

interface RoutingViewProps {
  lang: Lang;
  activeScenario: CityScenario;
  routeRequest: ActiveRouteRequest | null;
  routeStats: ComputedRouteStats | null;
  routeLoading: boolean;
  routeError: string | null;
  stepFree: boolean;
  avoidCrowds: boolean;
  onToggleStepFree: () => void;
  onToggleAvoidCrowds: () => void;
  onComputeRoute: (req: Omit<ActiveRouteRequest, 'nonce'>) => void;
}

export function RoutingView({
  lang,
  activeScenario,
  routeRequest,
  routeStats,
  routeLoading,
  routeError,
  stepFree,
  avoidCrowds,
  onToggleStepFree,
  onToggleAvoidCrowds,
  onComputeRoute,
}: RoutingViewProps) {
  const t = UI_COPY[lang];
  const placesLib = useMapsLibrary('places');

  const [originText, setOriginText] = useState(
    routeRequest?.originLabel || 'Via Toledo, Napoli'
  );
  const [destText, setDestText] = useState(
    routeRequest?.destinationLabel || 'Molo Beverello, Napoli'
  );
  const [originCoords, setOriginCoords] = useState<LatLng | null>({
    lat: 40.8424,
    lng: 14.2491,
  });
  const [destCoords, setDestCoords] = useState<LatLng | null>({
    lat: 40.8376,
    lng: 14.2547,
  });
  const [mode, setMode] = useState<TransportMode>(routeRequest?.mode || 'WALKING');
  const [originFocused, setOriginFocused] = useState(false);
  const [destFocused, setDestFocused] = useState(false);
  const [navActive, setNavActive] = useState(false);

  const [lastNonce, setLastNonce] = useState<number | undefined>(
    routeRequest?.nonce
  );
  if (routeRequest && routeRequest.nonce !== lastNonce) {
    setLastNonce(routeRequest.nonce);
    setOriginText(routeRequest.originLabel);
    setDestText(routeRequest.destinationLabel);
    setMode(routeRequest.mode);
    setOriginCoords(
      typeof routeRequest.origin === 'string' ? null : routeRequest.origin
    );
    setDestCoords(
      typeof routeRequest.destination === 'string'
        ? null
        : routeRequest.destination
    );
  }

  const originAuto = useAutocompleteSuggestions(originText, originFocused);
  const destAuto = useAutocompleteSuggestions(destText, destFocused);

  const handleSelectSuggestion = async (
    target: 'origin' | 'dest',
    suggestion: google.maps.places.AutocompleteSuggestion
  ) => {
    if (!placesLib || !suggestion.placePrediction) return;
    const place = suggestion.placePrediction.toPlace();
    try {
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location'],
      });
      const label =
        place.displayName ||
        place.formattedAddress ||
        suggestion.placePrediction.text.text;
      const loc = place.location
        ? { lat: place.location.lat(), lng: place.location.lng() }
        : null;

      if (target === 'origin') {
        setOriginText(label);
        setOriginCoords(loc);
        setOriginFocused(false);
        originAuto.resetSession();
      } else {
        setDestText(label);
        setDestCoords(loc);
        setDestFocused(false);
        destAuto.resetSession();
      }
    } catch {
      const fallbackText = suggestion.placePrediction.text.text;
      if (target === 'origin') {
        setOriginText(fallbackText);
        setOriginCoords(null);
        setOriginFocused(false);
        originAuto.resetSession();
      } else {
        setDestText(fallbackText);
        setDestCoords(null);
        setDestFocused(false);
        destAuto.resetSession();
      }
    }
  };

  const triggerCompute = (selectedMode: TransportMode = mode) => {
    setNavActive(false);
    onComputeRoute({
      origin: originCoords ?? originText,
      destination: destCoords ?? destText,
      originLabel: originText,
      destinationLabel: destText,
      mode: selectedMode,
    });
  };

  const applyPreset = (presetId: string) => {
    const preset = ROUTE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setOriginText(preset.originName);
    setDestText(preset.destinationName);
    setOriginCoords(preset.origin);
    setDestCoords(preset.destination);
    setMode(preset.recommendedMode);
    setNavActive(false);
    onComputeRoute({
      origin: preset.origin,
      destination: preset.destination,
      originLabel: preset.originName,
      destinationLabel: preset.destinationName,
      mode: preset.recommendedMode,
    });
  };

  const modes: { id: TransportMode; label: string; icon: typeof Footprints }[] = [
    { id: 'WALKING', label: t.modes.WALKING, icon: Footprints },
    { id: 'BUS', label: t.modes.BUS, icon: Bus },
    { id: 'METRO', label: t.modes.METRO, icon: TrainFront },
    { id: 'FERRY', label: t.modes.FERRY, icon: Ship },
  ];

  const durationMin = routeStats
    ? Math.max(1, Math.round(routeStats.durationMillis / 60000))
    : 20;
  const distanceKm = routeStats
    ? (routeStats.distanceMeters / 1000).toFixed(1)
    : '1.4';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">
          {t.mapTitle}
        </h1>
        <span className="text-xs text-slate-500">Mobility Agent</span>
      </div>

      {/* Origin & Destination Inputs with Places API (New) Autocomplete */}
      <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3.5">
        <div className="relative">
          <label htmlFor="route-origin" className="sr-only">
            {t.originPlaceholder}
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-600 focus-within:bg-white">
            <MapPin className="h-4 w-4 shrink-0 text-blue-700" />
            <input
              id="route-origin"
              type="text"
              value={originText}
              onFocus={() => setOriginFocused(true)}
              onBlur={() => setTimeout(() => setOriginFocused(false), 180)}
              onChange={(e) => {
                setOriginText(e.target.value);
                setOriginCoords(null);
              }}
              placeholder={t.originPlaceholder}
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          {originFocused && originAuto.suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              {originAuto.suggestions.map((s, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onMouseDown={() => void handleSelectSuggestion('origin', s)}
                    className="w-full px-3 py-2 text-left text-xs text-slate-800 hover:bg-slate-50"
                  >
                    {s.placePrediction?.text.text}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <label htmlFor="route-dest" className="sr-only">
            {t.destPlaceholder}
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-blue-600 focus-within:bg-white">
            <Navigation className="h-4 w-4 shrink-0 text-slate-600" />
            <input
              id="route-dest"
              type="text"
              value={destText}
              onFocus={() => setDestFocused(true)}
              onBlur={() => setTimeout(() => setDestFocused(false), 180)}
              onChange={(e) => {
                setDestText(e.target.value);
                setDestCoords(null);
              }}
              placeholder={t.destPlaceholder}
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          {destFocused && destAuto.suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              {destAuto.suggestions.map((s, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onMouseDown={() => void handleSelectSuggestion('dest', s)}
                    className="w-full px-3 py-2 text-left text-xs text-slate-800 hover:bg-slate-50"
                  >
                    {s.placePrediction?.text.text}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Transport Mode Selector */}
        <div className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 p-1">
          {modes.map((m) => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMode(m.id);
                  triggerCompute(m.id);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors whitespace-nowrap min-h-[38px] ${
                  active
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Accessibility & Crowd Preferences */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onToggleStepFree}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap min-h-[36px] ${
              stepFree
                ? 'border-blue-600 bg-blue-50 text-blue-800'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t.stepFree}
          </button>
          <button
            type="button"
            onClick={onToggleAvoidCrowds}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap min-h-[36px] ${
              avoidCrowds
                ? 'border-blue-600 bg-blue-50 text-blue-800'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t.avoidCrowds}
          </button>
          <button
            type="button"
            onClick={() => triggerCompute(mode)}
            className="ml-auto rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800 whitespace-nowrap min-h-[36px]"
          >
            {t.computeRoute}
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="space-y-1.5">
        <div className="text-xs font-medium text-slate-500">
          {lang === 'EN' ? 'Suggested routes' : 'Tratte frequenti'}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ROUTE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-800 whitespace-nowrap"
            >
              {lang === 'EN' ? p.labelEn : p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobility Agent Criticality Notice */}
      <div className="rounded-xl border border-red-200 bg-red-50/60 p-3.5">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />
          <div className="text-xs leading-relaxed text-slate-800">
            <span className="font-semibold text-red-800">
              {lang === 'EN' ? activeScenario.titleEn : activeScenario.title}
            </span>
            <p className="mt-0.5 text-slate-700">
              {lang === 'EN'
                ? activeScenario.timeWindowEn
                : activeScenario.timeWindow}{' '}
              ·{' '}
              {lang === 'EN'
                ? activeScenario.mobilitySignalEn
                : activeScenario.mobilitySignal}
            </p>
          </div>
        </div>
      </div>

      {/* Computed Route Recommendation Card */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        {routeLoading ? (
          <div className="space-y-2 py-2">
            <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-sm font-semibold text-slate-900 tabular-nums">
                {t.recommendedDep}: 16:45
              </div>
              <div className="font-mono text-sm font-semibold text-blue-700 tabular-nums">
                {durationMin} min · {distanceKm} km
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              {t.modes[mode]} ·{' '}
              {stepFree
                ? lang === 'EN'
                  ? 'Step-free path'
                  : 'Senza gradini'
                : lang === 'EN'
                ? 'Standard path'
                : 'Percorso standard'}
              {avoidCrowds
                ? lang === 'EN'
                  ? ' · Low-crowd bypass'
                  : ' · Deviazione anti-folla'
                : ''}
            </p>
            <p className="mt-1.5 text-xs text-slate-500">
              {lang === 'EN' ? 'Sources:' : 'Fonti:'} Comune di Napoli · ANM · MaaS4Italy
            </p>

            {routeError && (
              <p className="mt-2 text-xs text-amber-700">{routeError}</p>
            )}

            <button
              type="button"
              onClick={() => setNavActive((prev) => !prev)}
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${
                navActive
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'bg-blue-700 text-white hover:bg-blue-800'
              }`}
            >
              {navActive ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{t.stopRoute}</span>
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  <span>{t.startRoute}</span>
                </>
              )}
            </button>

            {navActive && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <div className="text-xs font-semibold text-slate-800">
                  {lang === 'EN' ? 'Active guidance steps' : 'Indicazioni attive'}
                </div>
                <ol className="mt-2 space-y-1.5 text-xs text-slate-600">
                  {routeStats && routeStats.steps.length > 0 ? (
                    routeStats.steps.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="font-mono font-medium text-blue-700 tabular-nums">
                          {i + 1}.
                        </span>
                        <span dangerouslySetInnerHTML={{ __html: s }} />
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex gap-2">
                        <span className="font-mono font-medium text-blue-700">1.</span>
                        <span>
                          {lang === 'EN'
                            ? `Head south from ${originText} avoiding congested intersections.`
                            : `Procedi da ${originText} lungo il percorso pedonale pianeggiante.`}
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-mono font-medium text-blue-700">2.</span>
                        <span>
                          {lang === 'EN'
                            ? `Continue via Piazza Municipio toward ${destText}.`
                            : `Attraversa Piazza Municipio seguendo la corsia protetta fino a ${destText}.`}
                        </span>
                      </li>
                    </>
                  )}
                </ol>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
