import { FormEvent, useState } from 'react';
import {
  CityScenario,
  CivicReport,
  Lang,
  NaplesPlace,
} from '../data/naplesData';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Layers,
  Navigation,
  Users,
  X,
} from 'lucide-react';

interface BookingModalProps {
  place: NaplesPlace | null;
  lang: Lang;
  onClose: () => void;
  onConfirmBooking: (payload: {
    placeId: string;
    date: string;
    timeSlot: string;
    guests: number;
  }) => Promise<{ code: string }>;
}

export function BookingModal({
  place,
  lang,
  onClose,
  onConfirmBooking,
}: BookingModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [timeSlot, setTimeSlot] = useState('10:30');
  const [guests, setGuests] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedCode, setConfirmedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!place) return null;

  const total = ((place.priceEur ?? 0) * guests).toFixed(2);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await onConfirmBooking({
        placeId: place.id,
        date,
        timeSlot,
        guests,
      });
      setConfirmedCode(res.code);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : lang === 'EN'
          ? 'Booking failed.'
          : 'Errore nella prenotazione.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="text-xs text-slate-500">{place.zone} · {place.source}</div>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">
              {lang === 'EN' ? place.nameEn : place.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'EN' ? 'Close' : 'Chiudi'}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {confirmedCode ? (
          <div className="py-5 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
            <h3 className="mt-3 text-base font-semibold text-slate-900">
              {lang === 'EN' ? 'Booking confirmed' : 'Prenotazione confermata'}
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              {date} · {timeSlot} · {guests}{' '}
              {lang === 'EN' ? 'people' : 'persone'}
            </p>
            <div className="mt-4 inline-block rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 font-mono text-sm font-semibold text-slate-900 tabular-nums">
              {confirmedCode}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
            >
              {lang === 'EN' ? 'Back to map' : 'Torna alla mappa'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  {lang === 'EN' ? 'Date' : 'Data'}
                </label>
                <input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  {lang === 'EN' ? 'Time slot' : 'Fascia oraria'}
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600"
                >
                  <option value="09:30">09:30</option>
                  <option value="10:30">10:30</option>
                  <option value="12:00">12:00</option>
                  <option value="15:30">15:30</option>
                  <option value="17:00">17:00</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                {place.bookingType === 'counter'
                  ? lang === 'EN'
                    ? 'Applicants'
                    : 'Richiedenti'
                  : lang === 'EN'
                  ? 'Guests / Units'
                  : 'Persone / Unità'}
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 tabular-nums"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm">
              <span className="text-slate-600">
                {lang === 'EN' ? 'Total' : 'Totale stimato'}
              </span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {place.priceEur && place.priceEur > 0
                  ? `€${total}`
                  : lang === 'EN'
                  ? 'Free'
                  : 'Gratuito'}
              </span>
            </div>

            {error && <p className="text-xs text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:bg-slate-300 min-h-[44px]"
            >
              {submitting
                ? lang === 'EN'
                  ? 'Confirming...'
                  : 'Conferma in corso...'
                : lang === 'EN'
                ? 'Confirm booking'
                : 'Conferma prenotazione'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

interface CityControlBridgeModalProps {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  scenarios: CityScenario[];
  activeScenario: CityScenario;
  reports: CivicReport[];
  onSwitchScenario: (scenarioId: string) => Promise<void>;
  onApplyAlternativeRoute: () => void;
}

export function CityControlBridgeModal({
  open,
  onClose,
  lang,
  scenarios,
  activeScenario,
  reports,
  onSwitchScenario,
  onApplyAlternativeRoute,
}: CityControlBridgeModalProps) {
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  if (!open) return null;

  const handleSelect = async (id: string) => {
    setSwitchingId(id);
    try {
      await onSwitchScenario(id);
    } finally {
      setSwitchingId(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="City Control ↔ City Life"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs"
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
              <Layers className="h-4 w-4" />
              <span>Napoli Agentic City · Orchestrator</span>
            </div>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {lang === 'EN'
                ? 'Real-time City Control ↔ City Life Sync'
                : 'Connessione in tempo reale City Control ↔ City Life'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-600">
              {lang === 'EN'
                ? 'Select an urban scenario to see how a single Orchestrator insight coordinates municipal operations and updates citizen guidance simultaneously.'
                : 'Seleziona uno scenario urbano per vedere come un’unica informazione coordina la sala operativa comunale e aggiorna la mappa dei cittadini.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'EN' ? 'Close' : 'Chiudi'}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scenario Selector */}
        <div className="mt-4">
          <div className="text-xs font-medium text-slate-600">
            {lang === 'EN'
              ? 'Active urban scenarios'
              : 'Scenari urbani simulabili'}
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {scenarios.map((sc) => {
              const active = sc.id === activeScenario.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  disabled={switchingId === sc.id}
                  onClick={() => void handleSelect(sc.id)}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    active
                      ? 'border-blue-600 bg-blue-50/70'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>{sc.zone}</span>
                    <span className="font-mono tabular-nums">
                      {lang === 'EN' ? sc.timeWindowEn : sc.timeWindow}
                    </span>
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-900">
                    {lang === 'EN' ? sc.titleEn : sc.title}
                  </div>
                  <div className="mt-1 text-xs text-slate-600 line-clamp-1">
                    {lang === 'EN' ? sc.reasonEn : sc.reason}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dual Platform Outcome Table */}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {/* City Control Column */}
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Building2 className="h-4 w-4 text-slate-700" />
              <span>City Control · Comune di Napoli</span>
            </div>
            <dl className="mt-3 space-y-2.5 text-xs">
              <div>
                <dt className="font-semibold text-slate-700">
                  {lang === 'EN' ? 'Time window & reason' : 'Fascia oraria e motivo'}
                </dt>
                <dd className="mt-0.5 text-slate-800">
                  {lang === 'EN' ? activeScenario.timeWindowEn : activeScenario.timeWindow} ·{' '}
                  {lang === 'EN' ? activeScenario.reasonEn : activeScenario.reason}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Mobility Agent</dt>
                <dd className="mt-0.5 text-slate-600">
                  {lang === 'EN'
                    ? activeScenario.mobilitySignalEn
                    : activeScenario.mobilitySignal}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Tourism Agent</dt>
                <dd className="mt-0.5 text-slate-600">
                  {lang === 'EN'
                    ? activeScenario.tourismSignalEn
                    : activeScenario.tourismSignal}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">
                  {lang === 'EN' ? 'Orchestrator Intervention' : 'Intervento coordinato'}
                </dt>
                <dd className="mt-0.5 text-slate-800">
                  {lang === 'EN'
                    ? activeScenario.cityControlActionEn
                    : activeScenario.cityControlAction}
                </dd>
              </div>
            </dl>
          </section>

          {/* City Life Column */}
          <section className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-950">
              <Users className="h-4 w-4 text-blue-700" />
              <span>City Life · Cittadini e Turisti</span>
            </div>
            <dl className="mt-3 space-y-2.5 text-xs">
              <div>
                <dt className="font-semibold text-blue-900">
                  {lang === 'EN' ? 'Real-time alert' : 'Avviso sul dispositivo'}
                </dt>
                <dd className="mt-0.5 text-slate-700">
                  {lang === 'EN'
                    ? activeScenario.cityLifeAlertEn
                    : activeScenario.cityLifeAlert}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-blue-900">
                  {lang === 'EN' ? 'Suggested alternative' : 'Percorso alternativo proposto'}
                </dt>
                <dd className="mt-0.5 text-slate-700">
                  {activeScenario.alternativeRoute.originName} →{' '}
                  {activeScenario.alternativeRoute.destinationName} (
                  {activeScenario.alternativeRoute.durationMin} min)
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-blue-900">
                  {lang === 'EN' ? 'Anonymous citizen feed' : 'Flusso anonimo verso City Control'}
                </dt>
                <dd className="mt-0.5 text-slate-700 tabular-nums">
                  {reports.length}{' '}
                  {lang === 'EN'
                    ? 'aggregated zone signals active'
                    : 'segnalazioni di zona correlate'}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 min-h-[40px]"
          >
            {lang === 'EN' ? 'Close' : 'Chiudi'}
          </button>
          <button
            type="button"
            onClick={() => {
              onApplyAlternativeRoute();
              onClose();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-xs font-medium text-white hover:bg-blue-800 min-h-[40px]"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>
              {lang === 'EN'
                ? 'Apply alternative route on map'
                : 'Applica percorso alternativo sulla mappa'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
