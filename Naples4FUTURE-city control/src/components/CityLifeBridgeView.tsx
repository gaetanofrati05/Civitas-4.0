import { useState } from 'react';
import {
  ArrowLeftRight,
  Plus,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react';
import type {
  AgentDomain,
  CityLifeAdvisory,
  CityZone,
  PrivacySignal,
} from '../types/city';
import { DOMAIN_LABELS } from '../utils/labels';
import { DomainIcon } from './DomainIcon';

interface CityLifeBridgeViewProps {
  advisories: CityLifeAdvisory[];
  privacySignals: PrivacySignal[];
  zones: CityZone[];
  onToggleAdvisory: (id: string) => Promise<void>;
  onCreateAdvisory: (payload: {
    zoneId: string;
    title: string;
    guidance: string;
    alternativeRoute: string;
    category: AgentDomain;
  }) => Promise<void>;
}

export function CityLifeBridgeView({
  advisories,
  privacySignals,
  zones,
  onToggleAdvisory,
  onCreateAdvisory,
}: CityLifeBridgeViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [zoneId, setZoneId] = useState(zones[0]?.id ?? 'plebiscito');
  const [category, setCategory] = useState<AgentDomain>('mobility');
  const [title, setTitle] = useState('');
  const [guidance, setGuidance] = useState('');
  const [alternativeRoute, setAlternativeRoute] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !guidance.trim()) {
      setError('Inserisci titolo e testo operativo per l’avviso.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onCreateAdvisory({
        zoneId,
        title,
        guidance,
        alternativeRoute,
        category,
      });
      setTitle('');
      setGuidance('');
      setAlternativeRoute('');
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Errore nella pubblicazione dell’avviso.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 text-teal-700">
            <ArrowLeftRight className="h-4.5 w-4.5" />
          </span>
          <div>
            <h1 className="font-display text-xl font-semibold text-slate-900">
              Ponte City Control — City Life
            </h1>
            <p className="mt-0.5 text-sm text-slate-600">
              Le decisioni della cabina di regia diventano indicazioni utili per
              cittadini e turisti, ricevendo in cambio solo trend aggregati e anonimi.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{showForm ? 'Chiudi modulo' : 'Nuovo avviso City Life'}</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6"
        >
          <h2 className="font-display text-sm font-semibold text-slate-900">
            Pubblica indicazione diretta su City Life
          </h2>

          {error && (
            <p className="mt-2 text-xs font-medium text-red-700">{error}</p>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-800">
                Zona interessata
              </label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800">
                Ambito informativo
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AgentDomain)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                {(Object.keys(DOMAIN_LABELS) as AgentDomain[]).map((d) => (
                  <option key={d} value={d}>
                    {DOMAIN_LABELS[d]}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-800">
                Titolo avviso
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Es. Itinerario pedonale consigliato verso Castel dell’Ovo"
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-800">
                Messaggio per cittadini e turisti
              </label>
              <textarea
                rows={2}
                value={guidance}
                onChange={(e) => setGuidance(e.target.value)}
                placeholder="Indicazione chiara e non allarmistica su percorsi o servizi alternativi..."
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-800">
                Percorso o servizio alternativo
              </label>
              <input
                type="text"
                value={alternativeRoute}
                onChange={(e) => setAlternativeRoute(e.target.value)}
                placeholder="Es. Metro Linea 6 fermata San Pasquale · Villa Comunale"
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap"
            >
              {submitting ? 'Pubblicazione...' : 'Pubblica su City Life'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              Annulla
            </button>
          </div>
        </form>
      )}

      {/* Avvisi verso City Life */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-blue-50/40 px-6 py-4">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-700">
            <Smartphone className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-sm font-semibold text-slate-900">
              Avvisi e percorsi attivi verso City Life
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Notifiche e suggerimenti di mobilità o fruizione culturale visibili agli
              utenti dell&apos;app cittadina
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {advisories.map((adv) => (
            <div
              key={adv.id}
              className="flex flex-col justify-between gap-4 px-6 py-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <DomainIcon domain={adv.category} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-800">
                      {adv.zoneName}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{DOMAIN_LABELS[adv.category]}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Users className="h-3 w-3 text-slate-400" />
                      Agg. {adv.updatedAt} · ~{adv.estimatedReach.toLocaleString('it-IT')}{' '}
                      utenti raggiunti
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm font-semibold text-slate-900">
                    {adv.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {adv.guidance}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Alternativa:{' '}
                    <span className="font-medium text-slate-700">
                      {adv.alternativeRoute}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span
                  className={`text-xs font-semibold ${
                    adv.active ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {adv.active ? 'Attivo su City Life' : 'In pausa'}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleAdvisory(adv.id)}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  {adv.active ? 'Metti in pausa' : 'Riattiva'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy by Design & Segnali Aggregati */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-emerald-50/40 px-6 py-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-sm font-semibold text-slate-900">
                Segnali Aggregati da City Life (Privacy by Design)
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                L&apos;agente aggregatore riceve esclusivamente statistiche anonime
                sopra soglia minima di k-anonimato, senza alcun dato individuale.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 shrink-0">
            <ShieldCheck className="h-4 w-4" />
            <span>Zero dati personali trasmessi</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Zona urbana</th>
                <th className="px-6 py-3 font-medium">Indicatore aggregato</th>
                <th className="px-6 py-3 font-medium">Tendenza rilevata</th>
                <th className="px-6 py-3 font-medium text-right">
                  Soglia anonimato
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {privacySignals.map((sig) => (
                <tr key={sig.id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-3.5 font-medium text-slate-900">
                    {sig.zoneName}
                  </td>
                  <td className="px-6 py-3.5">{sig.signalType}</td>
                  <td className="px-6 py-3.5">
                    <span>{sig.trendText}</span>
                    <span className="ml-2 text-slate-400">
                      ({sig.aggregationWindow})
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono tabular-nums text-slate-900">
                    k ≥ {sig.kAnonymityThreshold}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
