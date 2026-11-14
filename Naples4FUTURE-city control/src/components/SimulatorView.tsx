import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookmarkPlus,
  Check,
  CheckCircle2,
  GitMerge,
  Info,
  MapPin,
  Play,
  RotateCcw,
  Ship,
  SlidersHorizontal,
  Smartphone,
  TrainFront,
  Trophy,
} from 'lucide-react';
import type {
  CityZone,
  SeverityLevel,
  WhatIfSimulationRequest,
  WhatIfSimulationResult,
} from '../types/city';
import { DOMAIN_LABELS, SEVERITY_META } from '../utils/labels';
import { DomainIcon } from './DomainIcon';

interface SimulatorViewProps {
  zones: CityZone[];
  onPromoteSimulation: (
    simulation: WhatIfSimulationResult,
    approveImmediately: boolean,
  ) => Promise<void>;
}

interface ScenarioPreset {
  id: string;
  title: string;
  summary: string;
  targetZone: string;
  eventType: string;
  scenario: string;
  constraints: string;
  horizon: string;
  intensity: WhatIfSimulationRequest['intensity'];
}

const USE_CASE_SCENARIOS: ScenarioPreset[] = [
  {
    id: 'usecase-crociere',
    title: 'Sbarco crociere + flusso centro',
    summary: '3 navi al Molo Beverello in contemporanea con visita a Palazzo Reale.',
    targetZone: 'porto',
    eventType: 'Sbarco crocieristico / Flussi turistici',
    scenario:
      'Arrivo contemporaneo di 3 grandi navi da crociera a Molo Beverello nella fascia 09:30–12:30 con forte risalita pedonale verso Piazza del Plebiscito, Via Toledo e Decumani.',
    constraints:
      'Circa 11.500 passeggeri in sbarco; 4 navette ANM aggiuntive attivabili.',
    horizon: 'Prossime 3 ore',
    intensity: 'high',
  },
  {
    id: 'usecase-metro-l1',
    title: 'Interruzione Metro Linea 1',
    summary: 'Fermo tratta Dante – Garibaldi in fascia di punta lavorativa.',
    targetZone: 'garibaldi',
    eventType: 'Interruzione trasporto pubblico',
    scenario:
      'Sospensione temporanea del servizio Metro Linea 1 nella tratta Dante – Università – Municipio – Garibaldi per guasto tecnico alla linea aerea.',
    constraints:
      'Ripristino stimato in 90 minuti; servizio attivo solo Piscinola–Dante.',
    horizon: 'Prossime 2 ore',
    intensity: 'critical',
  },
  {
    id: 'usecase-maradona',
    title: 'Partita Stadio Maradona + Lungomare',
    summary: 'Afflusso 50.000 spettatori con evento concomitante su Via Caracciolo.',
    targetZone: 'fuorigrotta',
    eventType: 'Affollamento / Evento straordinario',
    scenario:
      'Afflusso serale allo Stadio Diego Armando Maradona in concomitanza con manifestazione sul Lungomare Caracciolo e chiusura parziale di Via Caracciolo.',
    constraints:
      '50.000 spettatori stimati; potenziamento corse Metro Linea 2 e Cumana.',
    horizon: 'Prossime 6 ore',
    intensity: 'high',
  },
];

const EVENT_TYPES = [
  'Interruzione trasporto pubblico',
  'Affollamento / Evento straordinario',
  'Sbarco crocieristico / Flussi turistici',
  'Emergenza meteo / ambientale',
  'Chiusura stradale / Cantiere',
  'Altro scenario personalizzato',
];

function RiskBadge({ level }: { level: SeverityLevel }) {
  const meta = SEVERITY_META[level];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${meta.textClass}`}>
      {level === 'critical' && <AlertTriangle className="h-3.5 w-3.5" />}
      {level === 'attention' && <Info className="h-3.5 w-3.5" />}
      {level === 'regular' && <CheckCircle2 className="h-3.5 w-3.5" />}
      <span>{meta.label}</span>
    </span>
  );
}

export function SimulatorView({ zones, onPromoteSimulation }: SimulatorViewProps) {
  const [targetZone, setTargetZone] = useState<string>('all');
  const [eventType, setEventType] = useState<string>(EVENT_TYPES[0]);
  const [scenario, setScenario] = useState<string>('');
  const [constraints, setConstraints] = useState<string>('');
  const [horizon, setHorizon] = useState<string>('Prossime 3 ore');
  const [intensity, setIntensity] =
    useState<WhatIfSimulationRequest['intensity']>('high');

  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<ScenarioPreset[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WhatIfSimulationResult | null>(null);
  const [promoting, setPromoting] = useState(false);
  const [promotedNote, setPromotedNote] = useState<string | null>(null);

  const applyPreset = (preset: ScenarioPreset) => {
    setTargetZone(preset.targetZone);
    setEventType(preset.eventType);
    setScenario(preset.scenario);
    setConstraints(preset.constraints);
    setHorizon(preset.horizon);
    setIntensity(preset.intensity);
    setActivePresetId(preset.id);
    setError(null);
  };

  const resetToCustom = () => {
    setTargetZone('all');
    setEventType(EVENT_TYPES[0]);
    setScenario('');
    setConstraints('');
    setHorizon('Prossime 3 ore');
    setIntensity('high');
    setActivePresetId(null);
    setError(null);
  };

  const handleSaveCustomScenario = () => {
    if (!scenario.trim()) return;
    const zoneLabel =
      targetZone === 'all'
        ? 'Multizona'
        : zones.find((z) => z.id === targetZone)?.name.split(' · ')[0] ??
          'Personalizzato';
    const newPreset: ScenarioPreset = {
      id: `custom-${Date.now()}`,
      title: `${zoneLabel} · ${eventType.split(' / ')[0]}`,
      summary: scenario.trim().slice(0, 78) + (scenario.trim().length > 78 ? '…' : ''),
      targetZone,
      eventType,
      scenario: scenario.trim(),
      constraints: constraints.trim(),
      horizon,
      intensity,
    };
    setSavedScenarios((prev) => [newPreset, ...prev].slice(0, 3));
    setActivePresetId(newPreset.id);
  };

  const runSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenario.trim()) {
      setError('Descrivi lo scenario che vuoi simulare prima di avviare l’analisi.');
      return;
    }

    setLoading(true);
    setError(null);
    setPromotedNote(null);

    try {
      const response = await fetch('/api/orchestrator/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          horizon,
          intensity,
          targetZone,
          eventType,
          constraints,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Errore durante la simulazione What-If.');
      }

      setResult(data as WhatIfSimulationResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossibile completare la simulazione in questo momento.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (approveImmediately: boolean) => {
    if (!result) return;
    setPromoting(true);
    try {
      await onPromoteSimulation(result, approveImmediately);
      setPromotedNote(
        approveImmediately
          ? 'Piano approvato e pubblicato immediatamente su City Life.'
          : 'Piano inserito nella coda Piani Orchestrator in attesa di decisione.',
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Errore nel salvataggio del piano simulato.',
      );
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700">
          <SlidersHorizontal className="h-4.5 w-4.5" />
        </span>
        <div>
          <h1 className="font-display text-xl font-semibold text-slate-900">
            Simulatore Scenari What-If
          </h1>
          <p className="mt-0.5 text-sm text-slate-600">
            Imposta liberamente parametri e condizioni di uno scenario urbano per
            valutarne l&apos;impatto sui servizi cittadini, oppure carica uno scenario
            d&apos;uso di riferimento.
          </p>
        </div>
      </div>

      {/* 3 Scenari d'uso rapidi */}
      <section aria-labelledby="use-cases-heading">
        <div className="mb-2.5 flex items-baseline justify-between">
          <h2
            id="use-cases-heading"
            className="text-xs font-semibold text-slate-800"
          >
            Scenari d&apos;uso di riferimento
          </h2>
          <span className="text-xs text-slate-500">
            Facoltativi: clicca per precompilare i campi e modificarli a piacere
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {USE_CASE_SCENARIOS.map((preset, index) => {
            const isSelected = activePresetId === preset.id;
            const PresetIcon =
              index === 0 ? Ship : index === 1 ? TrainFront : Trophy;
            const iconStyle =
              index === 0
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : index === 1
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-teal-200 bg-teal-50 text-teal-700';

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-blue-400 bg-blue-50/70'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${iconStyle}`}
                  >
                    <PresetIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900">
                      {preset.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {preset.summary}
                    </p>
                    <p className="mt-2 text-[11px] font-medium text-blue-700">
                      {isSelected ? 'Caricato nel configuratore' : 'Carica scenario'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {savedScenarios.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              Scenari salvati dall&apos;operatore:
            </span>
            {savedScenarios.map((custom) => (
              <button
                key={custom.id}
                type="button"
                onClick={() => applyPreset(custom)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  activePresetId === custom.id
                    ? 'border-blue-400 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {custom.title}
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Configuratore scenario impostato dall'utente */}
        <form
          onSubmit={runSimulation}
          className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 xl:col-span-5"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-display text-sm font-semibold text-slate-900">
                  Configura scenario di simulazione
                </h2>
                <p className="text-xs text-slate-500">
                  {activePresetId
                    ? 'Scenario d’uso caricato · tutti i campi restano modificabili'
                    : 'Impostazione manuale dell’operatore PA'}
                </p>
              </div>
              <button
                type="button"
                onClick={resetToCustom}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap shrink-0"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Pulisci</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="zone-select"
                  className="block text-xs font-semibold text-slate-800"
                >
                  Area o zona principale
                </label>
                <select
                  id="zone-select"
                  value={targetZone}
                  onChange={(e) => setTargetZone(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="all">Tutta Napoli (Multizona)</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="event-type-select"
                  className="block text-xs font-semibold text-slate-800"
                >
                  Tipologia evento
                </label>
                <select
                  id="event-type-select"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="scenario-input"
                className="block text-xs font-semibold text-slate-800"
              >
                Descrizione dello scenario
              </label>
              <textarea
                id="scenario-input"
                rows={4}
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="Descrivi cosa accade (es. chiusura di Via Marina per lavori urgenti dalle 10:00 alle 15:00 con deviazione linee ANM...)"
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-3 text-xs leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="constraints-input"
                className="block text-xs font-semibold text-slate-800"
              >
                Parametri e vincoli operativi (facoltativo)
              </label>
              <input
                id="constraints-input"
                type="text"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="Es. 8.000 persone stimate, 3 pattuglie disponibili, ZTL attiva"
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="horizon-select"
                  className="block text-xs font-semibold text-slate-800"
                >
                  Orizzonte temporale
                </label>
                <select
                  id="horizon-select"
                  value={horizon}
                  onChange={(e) => setHorizon(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="Prossime 2 ore">Prossime 2 ore</option>
                  <option value="Prossime 3 ore">Prossime 3 ore</option>
                  <option value="Prossime 6 ore">Prossime 6 ore</option>
                  <option value="Intera giornata">Intera giornata</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="intensity-select"
                  className="block text-xs font-semibold text-slate-800"
                >
                  Intensità stimata
                </label>
                <select
                  id="intensity-select"
                  value={intensity}
                  onChange={(e) =>
                    setIntensity(e.target.value as WhatIfSimulationRequest['intensity'])
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="moderate">Moderata</option>
                  <option value="high">Elevata</option>
                  <option value="critical">Critica</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="submit"
              disabled={loading || !scenario.trim()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap"
            >
              <Play className="h-3.5 w-3.5" />
              <span>
                {loading
                  ? 'Analisi multi-agente in corso...'
                  : 'Avvia simulazione'}
              </span>
            </button>

            <button
              type="button"
              disabled={!scenario.trim()}
              onClick={handleSaveCustomScenario}
              title="Salva questo scenario nella sessione corrente"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap shrink-0"
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              <span>Salva</span>
            </button>
          </div>
        </form>

        {/* Risultato della simulazione */}
        <div className="rounded-xl border border-slate-200 bg-white xl:col-span-7">
          {error && (
            <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-800">
              <p className="font-semibold">Attenzione</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {loading && (
            <div className="space-y-4 p-6" aria-busy="true">
              <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
              <div className="h-16 w-full animate-pulse rounded bg-slate-100" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="h-24 animate-pulse rounded bg-slate-100" />
                <div className="h-24 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="h-28 w-full animate-pulse rounded bg-slate-100" />
            </div>
          )}

          {!loading && !result && !error && (
            <div className="flex h-full min-h-[380px] flex-col items-center justify-center px-6 py-12 text-center">
              <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700">
                <Activity className="h-5 w-5" />
              </span>
              <p className="font-display text-sm font-semibold text-slate-900">
                Configura uno scenario per avviare la previsione
              </p>
              <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-500">
                Imposta zona, tipologia, descrizione e parametri operativi nel modulo
                a sinistra — oppure seleziona uno dei 3 scenari d&apos;uso in alto —
                per ottenere la simulazione multi-agente dell&apos;Orchestrator.
              </p>
            </div>
          )}

          {!loading && result && (
            <div className="divide-y divide-slate-200">
              <div className="bg-blue-50/40 px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900">
                    <GitMerge className="h-3.5 w-3.5 text-blue-700" />
                    Valutazione Orchestrator · {result.timeHorizon}
                  </p>
                  <RiskBadge level={result.overallRisk} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-900">
                  {result.scenarioSummary}
                </p>
              </div>

              {/* Impatto sui 5 agenti */}
              <div className="px-6 py-5">
                <h2 className="text-xs font-semibold text-slate-800">
                  Effetti previsti per ambito
                </h2>
                <div className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
                  {result.agentImpacts.map((item, idx) => (
                    <div
                      key={`${item.domain}-${idx}`}
                      className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-start"
                    >
                      <div className="flex items-start gap-2.5 sm:w-48 shrink-0">
                        <DomainIcon domain={item.domain} size="sm" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            {item.agentName || DOMAIN_LABELS[item.domain]}
                          </p>
                          <RiskBadge level={item.severity} />
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-600 sm:flex-1">
                        {item.forecast}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zone a rischio */}
              {result.affectedZones.length > 0 && (
                <div className="px-6 py-4">
                  <h2 className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <MapPin className="h-3.5 w-3.5 text-blue-700" />
                    Aree urbane maggiormente esposte
                  </h2>
                  <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {result.affectedZones.map((zone, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-900">
                            {zone.zoneName}
                          </span>
                          <RiskBadge level={zone.risk} />
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{zone.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Piano consigliato + bozza City Life */}
              <div className="bg-blue-50/30 px-6 py-5">
                <h2 className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                  <GitMerge className="h-3.5 w-3.5 text-blue-700" />
                  Piano di mitigazione suggerito: {result.recommendedPlan.title}
                </h2>
                <ol className="mt-2.5 space-y-1.5 text-xs text-slate-700">
                  {result.recommendedPlan.steps.map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-mono text-blue-700/70 tabular-nums">
                        {String(i + 1).padStart(2, '0')}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-2.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">
                    Impatto stimato:
                  </span>{' '}
                  {result.recommendedPlan.estimatedImpact}
                </p>

                <div className="mt-4 border-t border-slate-200 pt-3.5">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <Smartphone className="h-3.5 w-3.5 text-teal-700" />
                    Bozza avviso per City Life — {result.cityLifeDraft.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-700">
                    &ldquo;{result.cityLifeDraft.guidance}&rdquo;
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Alternativa suggerita: {result.cityLifeDraft.alternativeRoute}
                  </p>
                </div>

                {promotedNote ? (
                  <p className="mt-4 text-xs font-semibold text-emerald-700">
                    {promotedNote}
                  </p>
                ) : (
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={promoting}
                      onClick={() => handlePromote(false)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 whitespace-nowrap shrink-0"
                    >
                      <span>Invia ai Piani d&apos;Azione</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={promoting}
                      onClick={() => handlePromote(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap shrink-0"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Approva e Pubblica su City Life</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
