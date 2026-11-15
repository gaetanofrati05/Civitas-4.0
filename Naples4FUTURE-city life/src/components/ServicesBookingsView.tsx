import { useMemo, useState } from 'react';
import {
  BookingRecord,
  Lang,
  NaplesPlace,
  UI_COPY,
  UserProfile,
} from '../data/naplesData';
import { PLACE_IMAGES } from '../data/placeImages';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Search,
  Ticket,
  Users,
} from 'lucide-react';

export type ServiceCategoryFilter =
  | 'all'
  | 'mobility'
  | 'citizen_service'
  | 'commerce';

interface ServicesBookingsViewProps {
  places: NaplesPlace[];
  lang: Lang;
  profile: UserProfile;
  bookings: BookingRecord[];
  onSelectPlace: (place: NaplesPlace) => void;
  onRouteToPlace: (place: NaplesPlace) => void;
  onOpenBookingModal: (place: NaplesPlace) => void;
}

export function ServicesBookingsView({
  places,
  lang,
  profile,
  bookings,
  onSelectPlace,
  onRouteToPlace,
  onOpenBookingModal,
}: ServicesBookingsViewProps) {
  const t = UI_COPY[lang];
  const [filter, setFilter] = useState<ServiceCategoryFilter>(
    profile === 'residente' ? 'citizen_service' : 'all'
  );
  const [query, setQuery] = useState('');
  const [onlyLowCrowd, setOnlyLowCrowd] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return places.filter((p) => {
      if (filter !== 'all' && p.category !== filter) return false;
      if (onlyLowCrowd && p.crowdLevel !== 'low') return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        p.zone.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [places, filter, query, onlyLowCrowd]);

  const filterTabs: { id: ServiceCategoryFilter; label: string }[] = [
    { id: 'all', label: t.filters.all },
    { id: 'mobility', label: t.filters.mobility },
    { id: 'citizen_service', label: t.filters.citizen_service },
    { id: 'commerce', label: t.filters.commerce },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">
          {t.servicesTitle}
        </h1>
        <span className="text-xs text-slate-500 tabular-nums">
          {filtered.length} {lang === 'EN' ? 'places' : 'punti'}
        </span>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:border-blue-600">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchServices}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap gap-1.5">
        {filterTabs.map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap min-h-[36px] ${
                active
                  ? 'bg-blue-700 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setOnlyLowCrowd((prev) => !prev)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap min-h-[36px] ${
            onlyLowCrowd
              ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {lang === 'EN' ? 'Low crowd only' : 'Solo poca folla'}
        </button>
      </div>

      {/* Active Bookings */}
      {bookings.length > 0 && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <span>
              {lang === 'EN'
                ? `Active bookings (${bookings.length})`
                : `Prenotazioni attive (${bookings.length})`}
            </span>
          </div>
          <ul className="mt-2 space-y-1.5">
            {bookings.slice(0, 3).map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between text-xs text-emerald-900 tabular-nums"
              >
                <span className="truncate pr-2 font-medium">{b.placeName}</span>
                <span className="shrink-0 font-mono font-semibold">
                  {b.code} · {b.timeSlot}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Results List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-medium text-slate-800">
            {lang === 'EN' ? 'No matching places' : 'Nessun risultato trovato'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {lang === 'EN'
              ? 'Try clearing filters or searching another neighborhood.'
              : 'Prova a rimuovere i filtri o cercare un altro quartiere.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setFilter('all');
              setQuery('');
              setOnlyLowCrowd(false);
            }}
            className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {lang === 'EN' ? 'Reset filters' : 'Reimposta filtri'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((place) => (
            <article
              key={place.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-slate-300"
            >
              {place.imageKey && PLACE_IMAGES[place.imageKey] && (
                <div className="h-32 w-full overflow-hidden bg-slate-100">
                  <img
                    src={PLACE_IMAGES[place.imageKey]}
                    alt={lang === 'EN' ? place.nameEn : place.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-3.5">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="truncate">
                    {place.zone} · {place.source}
                  </span>
                  <span
                    className={`shrink-0 font-medium tabular-nums ${
                      place.crowdLevel === 'low'
                        ? 'text-emerald-700'
                        : place.crowdLevel === 'medium'
                        ? 'text-amber-700'
                        : 'text-red-700'
                    }`}
                  >
                    {t.crowd[place.crowdLevel]} ({place.crowdPercent}%)
                  </span>
                </div>

                <h2 className="mt-1 text-sm font-semibold text-slate-900">
                  {lang === 'EN' ? place.nameEn : place.name}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {lang === 'EN' ? place.descriptionEn : place.description}
                </p>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 tabular-nums">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {lang === 'EN' ? place.hoursEn : place.hours}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {lang === 'EN' ? 'Wait' : 'Attesa'} {place.waitTimeMin} min
                  </span>
                  {place.priceLabel && (
                    <span className="font-medium text-slate-800">
                      {lang === 'EN' ? place.priceLabelEn : place.priceLabel}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectPlace(place)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap min-h-[38px]"
                  >
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    <span>{lang === 'EN' ? 'Map' : 'Mappa'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRouteToPlace(place)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap min-h-[38px]"
                  >
                    <Navigation className="h-3.5 w-3.5 text-blue-700" />
                    <span>{lang === 'EN' ? 'Route' : 'Percorso'}</span>
                  </button>
                  {place.bookable && (
                    <button
                      type="button"
                      onClick={() => onOpenBookingModal(place)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-800 whitespace-nowrap min-h-[38px]"
                    >
                      <Ticket className="h-3.5 w-3.5" />
                      <span>{lang === 'EN' ? 'Book' : 'Prenota'}</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
