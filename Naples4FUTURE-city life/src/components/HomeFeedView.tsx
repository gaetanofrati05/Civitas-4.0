import {
  CityScenario,
  Lang,
  NaplesPlace,
  UI_COPY,
  UserProfile,
} from '../data/naplesData';
import { PLACE_IMAGES } from '../data/placeImages';
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Compass,
  Layers,
  Navigation,
  Wind,
} from 'lucide-react';

interface HomeFeedViewProps {
  profile: UserProfile;
  lang: Lang;
  activeScenario: CityScenario;
  places: NaplesPlace[];
  onStartAlternativeRoute: () => void;
  onStartLowCrowdItinerary: () => void;
  onSelectPlace: (place: NaplesPlace) => void;
  onOpenBridgeModal: () => void;
}

export function HomeFeedView({
  profile,
  lang,
  activeScenario,
  places,
  onStartAlternativeRoute,
  onStartLowCrowdItinerary,
  onSelectPlace,
  onOpenBridgeModal,
}: HomeFeedViewProps) {
  const t = UI_COPY[lang];
  const recommendedPlace =
    profile === 'turista'
      ? places.find((p) => p.id === 'capodimonte') ?? places[0]
      : places.find((p) => p.id === 'comune-san-giacomo') ?? places[0];

  const lowCrowdCount = places.filter(
    (p) => p.category === 'commerce' && p.crowdLevel === 'low' && (p.kind === 'museum_ticket' || p.kind === 'monument')
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">
          {t.homeTitle}
        </h1>
        <span className="text-xs font-medium text-slate-500">
          {t.profile[profile]} · {activeScenario.updatedAt}
        </span>
      </div>

      {/* Active City Control -> City Life Orchestrator Alert */}
      <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <div>
              <div className="flex flex-wrap items-center gap-x-2 text-xs font-medium text-amber-900 tabular-nums">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {lang === 'EN' ? activeScenario.timeWindowEn : activeScenario.timeWindow}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeScenario.zone}</span>
              </div>
              <h2 className="mt-1 text-sm font-semibold text-slate-900">
                {lang === 'EN' ? activeScenario.titleEn : activeScenario.title}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-700">
                {lang === 'EN'
                  ? activeScenario.cityLifeAlertEn
                  : activeScenario.cityLifeAlert}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {lang === 'EN' ? 'Reason:' : 'Motivo:'}{' '}
                {lang === 'EN' ? activeScenario.reasonEn : activeScenario.reason}
              </p>
              <p className="mt-1.5 text-xs text-slate-500">
                {lang === 'EN' ? 'Source:' : 'Fonte:'} {activeScenario.sources}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onStartAlternativeRoute}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-800 whitespace-nowrap min-h-[40px]"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>
              {lang === 'EN' ? 'View alternative route' : 'Percorso alternativo'}
            </span>
          </button>
          <button
            type="button"
            onClick={onOpenBridgeModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-amber-50 whitespace-nowrap min-h-[40px]"
          >
            <Layers className="h-3.5 w-3.5 text-amber-700" />
            <span>{t.bridgeBtn}</span>
          </button>
        </div>
      </section>

      {/* Air Quality & Environmental Status */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <Wind className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">
                {t.airQualityTitle}
              </h2>
              <span className="font-mono text-xs font-medium text-emerald-700 tabular-nums">
                AQI 28
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-600">{t.airQualitySub}</p>
            <p className="mt-1 text-xs text-slate-500">{t.airQualitySource}</p>
          </div>
        </div>
      </section>

      {/* Recommended Today (Persona-Aware) */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {recommendedPlace.imageKey && PLACE_IMAGES[recommendedPlace.imageKey] && (
          <div className="h-36 w-full overflow-hidden bg-slate-100">
            <img
              src={PLACE_IMAGES[recommendedPlace.imageKey]}
              alt={lang === 'EN' ? recommendedPlace.nameEn : recommendedPlace.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="p-4">
          <div className="text-xs text-slate-500">
            {t.recommendedToday} · {recommendedPlace.zone}
          </div>
          <h2 className="mt-0.5 text-sm font-semibold text-slate-900">
            {lang === 'EN' ? recommendedPlace.nameEn : recommendedPlace.name}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            {lang === 'EN'
              ? recommendedPlace.descriptionEn
              : recommendedPlace.description}
          </p>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-600 tabular-nums">
            <span>
              {t.crowd[recommendedPlace.crowdLevel]} · {recommendedPlace.waitTimeMin} min
            </span>
            <button
              type="button"
              onClick={() => onSelectPlace(recommendedPlace)}
              className="inline-flex items-center gap-1 font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap"
            >
              <span>{lang === 'EN' ? 'Inspect on map' : 'Vedi sulla mappa'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Smart Tourism: Anti-Crowd Itinerary Trigger */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <Compass className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-slate-900">
              {lang === 'EN'
                ? 'Explore Naples without the crowds'
                : 'Visita Napoli evitando la folla'}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {lang === 'EN'
                ? `Tourism Agent identified ${lowCrowdCount} museums and monuments with <25% density and <5 min wait right now.`
                : `Il Tourism Agent ha individuato ${lowCrowdCount} attrazioni e monumenti con densità <25% e attesa sotto i 5 minuti.`}
            </p>
            <button
              type="button"
              onClick={onStartLowCrowdItinerary}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-100 min-h-[40px]"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>{t.antiCrowdBtn}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
