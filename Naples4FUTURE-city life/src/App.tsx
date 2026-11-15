import { useCallback, useEffect, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import {
  BookingRecord,
  CITY_SCENARIOS,
  CityScenario,
  CivicReport,
  Lang,
  NAPLES_PLACES,
  NaplesPlace,
  NavTab,
  PrivacySettings,
  UI_COPY,
  UserProfile,
} from './data/naplesData';
import { TopBar } from './components/TopBar';
import {
  ActiveRouteRequest,
  ComputedRouteStats,
  NaplesMap,
} from './components/NaplesMap';
import { HomeFeedView } from './components/HomeFeedView';
import { RoutingView } from './components/RoutingView';
import { ServicesBookingsView } from './components/ServicesBookingsView';
import { AssistantView } from './components/AssistantView';
import { ReportView } from './components/ReportView';
import { ProfilePrivacyModal } from './components/ProfilePrivacyModal';
import {
  BookingModal,
  CityControlBridgeModal,
} from './components/BookingAndBridgeModals';
import {
  AlertTriangle,
  Camera,
  Compass,
  Home,
  Layers,
  Map as MapIcon,
  MessageSquare,
  Settings,
  X,
} from 'lucide-react';

export default function App() {
  const [mapsApiKey, setMapsApiKey] = useState<string>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  );
  const [mapsConfigLoaded, setMapsConfigLoaded] = useState<boolean>(
    Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
  );
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [profile, setProfile] = useState<UserProfile>('turista');
  const [lang, setLang] = useState<Lang>('IT');
  const [layerFilter, setLayerFilter] = useState<
    'all' | 'mobility' | 'citizen_service' | 'commerce'
  >('all');
  const [showHazardZone, setShowHazardZone] = useState(true);

  const [selectedPlace, setSelectedPlace] = useState<NaplesPlace | null>(null);
  const [bookingTarget, setBookingTarget] = useState<NaplesPlace | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [bridgeOpen, setBridgeOpen] = useState(false);

  const [activeScenario, setActiveScenario] = useState<CityScenario>(
    CITY_SCENARIOS[0]
  );
  const [scenarios, setScenarios] = useState<CityScenario[]>(CITY_SCENARIOS);
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  const [routeRequest, setRouteRequest] = useState<ActiveRouteRequest | null>({
    origin: { lat: 40.8424, lng: 14.2491 },
    destination: { lat: 40.8376, lng: 14.2547 },
    originLabel: 'Via Toledo, Napoli',
    destinationLabel: 'Molo Beverello, Napoli',
    mode: 'WALKING',
    nonce: 1,
  });
  const [routeStats, setRouteStats] = useState<ComputedRouteStats | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const [itineraryPlaces, setItineraryPlaces] = useState<NaplesPlace[]>([]);

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    preciseLocation: false,
    emergencyAlerts: true,
    personalizedSuggestions: false,
    accessibility: {
      stepFree: true,
      avoidCrowds: true,
      flatRoutes: true,
      audioDescriptions: false,
    },
  });

  // Listen for Google Maps Platform Demo Key quota exhaustion events
  useEffect(() => {
    const onQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  // Load Maps API key fallback & live City Control state from Express backend
  useEffect(() => {
    if (!mapsApiKey) {
      fetch('/api/maps-config')
        .then((r) => r.json())
        .then((data) => {
          if (data?.apiKey) setMapsApiKey(data.apiKey);
        })
        .catch(() => {})
        .finally(() => setMapsConfigLoaded(true));
    }

    fetch('/api/city-state')
      .then((r) => r.json())
      .then((data) => {
        if (data?.activeScenario) setActiveScenario(data.activeScenario);
        if (data?.scenarios) setScenarios(data.scenarios);
        if (data?.reports) setReports(data.reports);
        if (data?.bookings) setBookings(data.bookings);
      })
      .catch(() => {});
  }, [mapsApiKey]);

  const handleRouteComputed = useCallback(
    (stats: ComputedRouteStats | null, error: string | null, loading: boolean) => {
      setRouteStats(stats);
      setRouteError(error);
      setRouteLoading(loading);
    },
    []
  );

  const triggerRoute = useCallback(
    (req: Omit<ActiveRouteRequest, 'nonce'>) => {
      setItineraryPlaces([]);
      setRouteRequest({ ...req, nonce: Date.now() });
      setActiveTab('map');
    },
    []
  );

  const handleStartAlternativeRoute = useCallback(() => {
    const alt = activeScenario.alternativeRoute;
    triggerRoute({
      origin: alt.origin,
      destination: alt.destination,
      originLabel: alt.originName,
      destinationLabel: alt.destinationName,
      mode: alt.mode,
    });
  }, [activeScenario, triggerRoute]);

  const handleStartLowCrowdItinerary = useCallback(() => {
    const lowCrowd = NAPLES_PLACES.filter(
      (p) =>
        p.category === 'commerce' &&
        p.crowdLevel === 'low' &&
        (p.kind === 'museum_ticket' ||
          p.kind === 'monument' ||
          p.kind === 'guided_tour')
    );
    setRouteRequest(null);
    setItineraryPlaces(lowCrowd);
    setLayerFilter('commerce');
    if (lowCrowd[0]) setSelectedPlace(lowCrowd[0]);
    setActiveTab('map');
  }, []);

  const handleRouteToPlace = useCallback(
    (place: NaplesPlace) => {
      triggerRoute({
        origin: { lat: 40.8424, lng: 14.2491 },
        destination: place.position,
        originLabel: 'Via Toledo, Napoli',
        destinationLabel: lang === 'EN' ? place.nameEn : place.name,
        mode: 'WALKING',
      });
    },
    [lang, triggerRoute]
  );

  const handleSwitchScenario = async (scenarioId: string) => {
    const res = await fetch('/api/city-control/scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId }),
    });
    const data = await res.json();
    if (res.ok && data.activeScenario) {
      setActiveScenario(data.activeScenario);
      setShowHazardZone(true);
    }
  };

  const handleReportSubmitted = async (payload: {
    category: CivicReport['category'];
    zone: string;
    description: string;
    hasPhoto: boolean;
  }) => {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Errore invio segnalazione');
    }
    if (data.reports) setReports(data.reports);
    if (data.activeScenario) setActiveScenario(data.activeScenario);
  };

  const handleConfirmBooking = async (payload: {
    placeId: string;
    date: string;
    timeSlot: string;
    guests: number;
  }) => {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Errore prenotazione');
    }
    if (data.bookings) setBookings(data.bookings);
    return { code: data.booking.code as string };
  };

  const t = UI_COPY[lang];

  const layerButtons: {
    id: 'all' | 'mobility' | 'citizen_service' | 'commerce';
    label: string;
    labelEn: string;
  }[] = [
    { id: 'all', label: 'Tutti i punti', labelEn: 'All layers' },
    { id: 'mobility', label: 'Mobilità', labelEn: 'Mobility' },
    { id: 'citizen_service', label: 'Servizi', labelEn: 'Services' },
    { id: 'commerce', label: 'Prenotazioni', labelEn: 'Bookings' },
  ];

  const mobileTabs: {
    id: NavTab | 'profile';
    label: string;
    icon: typeof Home;
  }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'map', label: t.nav.map, icon: MapIcon },
    { id: 'ask', label: t.nav.ask, icon: MessageSquare },
    { id: 'report', label: t.nav.report, icon: Camera },
    { id: 'profile', label: t.nav.profile, icon: Settings },
  ];

  const renderSidebarContent = () => {
    if (activeTab === 'home') {
      return (
        <HomeFeedView
          profile={profile}
          lang={lang}
          activeScenario={activeScenario}
          places={NAPLES_PLACES}
          onStartAlternativeRoute={handleStartAlternativeRoute}
          onStartLowCrowdItinerary={handleStartLowCrowdItinerary}
          onSelectPlace={(p) => {
            setSelectedPlace(p);
            setActiveTab('map');
          }}
          onOpenBridgeModal={() => setBridgeOpen(true)}
        />
      );
    }
    if (activeTab === 'map') {
      return (
        <RoutingView
          lang={lang}
          activeScenario={activeScenario}
          routeRequest={routeRequest}
          routeStats={routeStats}
          routeLoading={routeLoading}
          routeError={routeError}
          stepFree={privacy.accessibility.stepFree}
          avoidCrowds={privacy.accessibility.avoidCrowds}
          onToggleStepFree={() =>
            setPrivacy((prev) => ({
              ...prev,
              accessibility: {
                ...prev.accessibility,
                stepFree: !prev.accessibility.stepFree,
              },
            }))
          }
          onToggleAvoidCrowds={() =>
            setPrivacy((prev) => ({
              ...prev,
              accessibility: {
                ...prev.accessibility,
                avoidCrowds: !prev.accessibility.avoidCrowds,
              },
            }))
          }
          onComputeRoute={triggerRoute}
        />
      );
    }
    if (activeTab === 'services') {
      return (
        <ServicesBookingsView
          places={NAPLES_PLACES}
          lang={lang}
          profile={profile}
          bookings={bookings}
          onSelectPlace={(p) => setSelectedPlace(p)}
          onRouteToPlace={handleRouteToPlace}
          onOpenBookingModal={(p) => setBookingTarget(p)}
        />
      );
    }
    if (activeTab === 'ask') {
      return (
        <AssistantView
          lang={lang}
          profile={profile}
          onActionRoute={(origin, dest) =>
            triggerRoute({
              origin,
              destination: dest,
              originLabel: origin,
              destinationLabel: dest,
              mode: 'WALKING',
            })
          }
          onActionItinerary={handleStartLowCrowdItinerary}
          onActionPlace={(placeId) => {
            const found = NAPLES_PLACES.find((p) => p.id === placeId);
            if (found) {
              setSelectedPlace(found);
              setActiveTab('map');
            }
          }}
        />
      );
    }
    return (
      <ReportView
        lang={lang}
        reports={reports}
        onReportSubmitted={handleReportSubmitted}
      />
    );
  };

  const mapContent = (
    <div className="relative h-full w-full">
      {mapsApiKey ? (
        <NaplesMap
          places={NAPLES_PLACES}
          selectedPlace={selectedPlace}
          onSelectPlace={setSelectedPlace}
          activeScenario={activeScenario}
          routeRequest={routeRequest}
          onRouteComputed={handleRouteComputed}
          itineraryPlaces={itineraryPlaces}
          showHazardZone={showHazardZone}
          onBookPlace={(p) => setBookingTarget(p)}
          onRouteToPlace={handleRouteToPlace}
          lang={lang}
          layerFilter={layerFilter}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 p-6 text-center">
          <MapIcon className="h-10 w-10 text-slate-400" />
          <p className="mt-3 text-sm font-semibold text-slate-800">
            {mapsConfigLoaded
              ? lang === 'EN'
                ? 'Google Maps API key not detected'
                : 'Chiave Google Maps non rilevata'
              : lang === 'EN'
              ? 'Loading Naples map...'
              : 'Caricamento mappa di Napoli...'}
          </p>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            {lang === 'EN'
              ? 'All City Life routing presets, services, bookings, and AI assistant tools remain active in the workspace panel.'
              : 'Tutti i percorsi, i servizi, le prenotazioni e l’assistente AI restano utilizzabili nel pannello laterale.'}
          </p>
        </div>
      )}

      {/* Floating Map Layer Controls */}
      <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex flex-wrap items-center justify-between gap-2">
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/95 p-1 shadow-sm backdrop-blur-sm">
          {layerButtons.map((btn) => {
            const active = layerFilter === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => setLayerFilter(btn.id)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {lang === 'EN' ? btn.labelEn : btn.label}
              </button>
            );
          })}
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowHazardZone((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium shadow-sm backdrop-blur-sm transition-colors whitespace-nowrap ${
              showHazardZone
                ? 'border-red-200 bg-white/95 text-red-700'
                : 'border-slate-200 bg-white/95 text-slate-600'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>
              {lang === 'EN' ? 'Alert zone' : 'Zona criticità'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setBridgeOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs font-medium text-slate-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-white whitespace-nowrap"
          >
            <Layers className="h-3.5 w-3.5 text-blue-700" />
            <span>City Control</span>
          </button>
        </div>
      </div>

      {/* Active Low-Crowd Itinerary Floating Strip */}
      {itineraryPlaces.length > 0 && (
        <div className="absolute bottom-4 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-white/95 px-4 py-3 shadow-md backdrop-blur-sm sm:left-4 sm:right-auto sm:max-w-lg">
          <div className="flex items-start gap-2.5">
            <Compass className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <div>
              <div className="text-xs font-semibold text-slate-900">
                {lang === 'EN'
                  ? `Low-crowd itinerary (${itineraryPlaces.length} stops)`
                  : `Itinerario senza folla (${itineraryPlaces.length} tappe)`}
              </div>
              <p className="mt-0.5 text-xs text-slate-600">
                {itineraryPlaces.map((p) => p.zone).join(' → ')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setItineraryPlaces([])}
            aria-label={lang === 'EN' ? 'Clear itinerary' : 'Chiudi itinerario'}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );

  const appShell = (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 text-slate-900">
      {/* Demo Key Quota Banner */}
      {quotaExceeded && (
        <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs text-amber-900 shadow-sm md:text-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-amber-950 underline hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenProfile={() => setProfileOpen(true)}
        lang={lang}
      />

      {/* Main Split Workspace (Desktop) & Responsive Mobile Layout */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Left Sidebar / Mobile Content Pane */}
        <aside
          className={`flex h-full w-full flex-col border-r border-slate-200 bg-slate-50 md:w-[420px] lg:w-[440px] md:shrink-0 ${
            activeTab === 'map' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Workspace Mode Toolbar (Persona + Language) */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2.5">
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
              {(['turista', 'residente'] as UserProfile[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProfile(p)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    profile === p
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.profile[p]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
              {(['IT', 'EN'] as Lang[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    lang === code
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Active Panel */}
          <div className="flex-1 overflow-y-auto p-4 pb-20 md:pb-5">
            {renderSidebarContent()}
          </div>
        </aside>

        {/* Interactive Google Map Canvas */}
        <main
          className={`relative flex-1 h-full ${
            activeTab === 'map' ? 'block' : 'hidden md:block'
          }`}
        >
          {mapContent}
          {/* Mobile Map Quick Route Card overlay */}
          {activeTab === 'map' && (
            <div className="absolute bottom-16 left-3 right-3 z-20 max-h-[44vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3.5 shadow-lg md:hidden">
              <RoutingView
                lang={lang}
                activeScenario={activeScenario}
                routeRequest={routeRequest}
                routeStats={routeStats}
                routeLoading={routeLoading}
                routeError={routeError}
                stepFree={privacy.accessibility.stepFree}
                avoidCrowds={privacy.accessibility.avoidCrowds}
                onToggleStepFree={() =>
                  setPrivacy((prev) => ({
                    ...prev,
                    accessibility: {
                      ...prev.accessibility,
                      stepFree: !prev.accessibility.stepFree,
                    },
                  }))
                }
                onToggleAvoidCrowds={() =>
                  setPrivacy((prev) => ({
                    ...prev,
                    accessibility: {
                      ...prev.accessibility,
                      avoidCrowds: !prev.accessibility.avoidCrowds,
                    },
                  }))
                }
                onComputeRoute={triggerRoute}
              />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (5 Tabs matching reference) */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-30 grid h-14 grid-cols-5 border-t border-slate-200 bg-white/95 backdrop-blur-sm md:hidden"
      >
        {mobileTabs.map((item) => {
          const Icon = item.icon;
          const active =
            item.id === 'profile' ? profileOpen : activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === 'profile') {
                  setProfileOpen(true);
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                active ? 'text-blue-700' : 'text-slate-500'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Modals */}
      <ProfilePrivacyModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profile}
        onProfileChange={setProfile}
        lang={lang}
        onLangChange={setLang}
        privacy={privacy}
        onPrivacyChange={setPrivacy}
      />

      <BookingModal
        place={bookingTarget}
        lang={lang}
        onClose={() => setBookingTarget(null)}
        onConfirmBooking={handleConfirmBooking}
      />

      <CityControlBridgeModal
        open={bridgeOpen}
        onClose={() => setBridgeOpen(false)}
        lang={lang}
        scenarios={scenarios}
        activeScenario={activeScenario}
        reports={reports}
        onSwitchScenario={handleSwitchScenario}
        onApplyAlternativeRoute={handleStartAlternativeRoute}
      />
    </div>
  );

  if (mapsApiKey) {
    return (
      <APIProvider
        apiKey={mapsApiKey}
        language={lang.toLowerCase()}
        region="IT"
        libraries={['places', 'routes', 'marker', 'maps']}
      >
        {appShell}
      </APIProvider>
    );
  }

  return appShell;
}
