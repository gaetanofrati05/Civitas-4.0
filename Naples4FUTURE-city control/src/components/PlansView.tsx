import { useState } from 'react';
import {
  Check,
  Pencil,
  Search,
  X,
  AlertTriangle,
  Info,
  CheckCircle2,
  ClipboardCheck,
  GitMerge,
  MapPin,
  Smartphone,
} from 'lucide-react';
import type { ActionPlan, PlanStatus } from '../types/city';
import {
  DOMAIN_LABELS,
  PLAN_STATUS_LABELS,
  SEVERITY_META,
} from '../utils/labels';
import { DomainIcon } from './DomainIcon';

interface PlansViewProps {
  plans: ActionPlan[];
  initialZoneFilter?: string | null;
  onDecidePlan: (
    planId: string,
    payload: {
      decision: 'approved' | 'modified' | 'rejected';
      operatorNote?: string;
      steps?: string[];
      cityLifeMessage?: string;
      cityLifeAlternative?: string;
    },
  ) => Promise<void>;
}

export function PlansView({
  plans,
  initialZoneFilter,
  onDecidePlan,
}: PlansViewProps) {
  const [statusFilter, setStatusFilter] = useState<'pending' | 'active' | 'all'>(
    'all',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [draftStepsText, setDraftStepsText] = useState('');
  const [draftCityLifeMessage, setDraftCityLifeMessage] = useState('');
  const [draftCityLifeAlt, setDraftCityLifeAlt] = useState('');
  const [draftOperatorNote, setDraftOperatorNote] = useState('');
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredPlans = plans
    .filter((plan) => {
      if (statusFilter === 'pending' && plan.status !== 'pending') return false;
      if (
        statusFilter === 'active' &&
        plan.status !== 'approved' &&
        plan.status !== 'modified'
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          plan.title.toLowerCase().includes(q) ||
          plan.zoneName.toLowerCase().includes(q) ||
          plan.triggerSummary.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (!initialZoneFilter) return 0;
      if (a.zoneId === initialZoneFilter && b.zoneId !== initialZoneFilter) return -1;
      if (b.zoneId === initialZoneFilter && a.zoneId !== initialZoneFilter) return 1;
      return 0;
    });

  const startEditing = (plan: ActionPlan) => {
    setEditingPlanId(plan.id);
    setDraftStepsText(plan.steps.join('\n'));
    setDraftCityLifeMessage(plan.cityLifeMessage);
    setDraftCityLifeAlt(plan.cityLifeAlternative);
    setDraftOperatorNote(plan.operatorNote ?? '');
  };

  const handleDecision = async (
    planId: string,
    decision: 'approved' | 'modified' | 'rejected',
  ) => {
    setBusyPlanId(planId);
    setFeedback(null);
    try {
      if (decision === 'modified') {
        const cleanedSteps = draftStepsText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
        await onDecidePlan(planId, {
          decision: 'modified',
          steps: cleanedSteps,
          cityLifeMessage: draftCityLifeMessage,
          cityLifeAlternative: draftCityLifeAlt,
          operatorNote: draftOperatorNote || 'Piano adattato dall’operatore comunale.',
        });
        setEditingPlanId(null);
        setFeedback('Piano modificato, attivato e sincronizzato con City Life.');
      } else if (decision === 'approved') {
        await onDecidePlan(planId, {
          decision: 'approved',
          operatorNote: 'Approvato dalla sala operativa comunale.',
        });
        setFeedback('Piano approvato: misure attivate e avviso inviato a City Life.');
      } else {
        await onDecidePlan(planId, {
          decision: 'rejected',
          operatorNote: 'Rifiutato dall’operatore comunale.',
        });
        setFeedback('Piano archiviato come rifiutato.');
      }
    } finally {
      setBusyPlanId(null);
    }
  };

  const statusTone = (status: PlanStatus) => {
    if (status === 'approved' || status === 'modified') return 'text-emerald-700';
    if (status === 'rejected') return 'text-slate-500';
    return 'text-amber-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700">
            <ClipboardCheck className="h-4.5 w-4.5" />
          </span>
          <div>
            <h1 className="font-display text-xl font-semibold text-slate-900">
              Piani d&apos;Azione Coordinati
            </h1>
            <p className="mt-0.5 text-sm text-slate-600">
              L&apos;Orchestrator propone strategie multi-agente. L&apos;operatore comunale
              approva, modifica o rifiuta ogni intervento.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca zona o piano..."
              className="w-56 rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1"
            role="group"
            aria-label="Filtra stato piani"
          >
            {(
              [
                { id: 'all', label: 'Tutti' },
                { id: 'pending', label: 'In attesa' },
                { id: 'active', label: 'Attivi' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-900"
        >
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900"
            aria-label="Chiudi notifica"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {filteredPlans.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
          <p className="font-display text-sm font-semibold text-slate-900">
            Nessun piano corrisponde ai filtri selezionati
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Modifica la ricerca o avvia una simulazione What-If per generare nuovi piani.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Mostra tutti i piani
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPlans.map((plan) => {
            const isEditing = editingPlanId === plan.id;
            const isBusy = busyPlanId === plan.id;
            const sevMeta = SEVERITY_META[plan.priority];
            const isHighlighted = initialZoneFilter === plan.zoneId;

            return (
              <article
                key={plan.id}
                className={`overflow-hidden rounded-xl border bg-white ${
                  isHighlighted ? 'border-blue-400' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                        <MapPin className="h-3.5 w-3.5 text-blue-700" />
                        {plan.zoneName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className={`inline-flex items-center gap-1 font-semibold ${sevMeta.textClass}`}>
                        {plan.priority === 'critical' && (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        )}
                        {plan.priority === 'attention' && (
                          <Info className="h-3.5 w-3.5" />
                        )}
                        {plan.priority === 'regular' && (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        Priorità {sevMeta.label}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        Proposto alle {plan.createdAt}
                      </span>
                    </div>

                    <h2 className="mt-1.5 font-display text-base font-semibold text-slate-900">
                      {plan.title}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {plan.triggerSummary}
                    </p>
                  </div>

                  <div className="shrink-0 text-left sm:text-right">
                    <p className={`text-xs font-semibold ${statusTone(plan.status)}`}>
                      {PLAN_STATUS_LABELS[plan.status]}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 sm:justify-end">
                      {plan.involvedAgents.map((a) => (
                        <span key={a} title={DOMAIN_LABELS[a]}>
                          <DomainIcon domain={a} size="sm" />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {!isEditing ? (
                  <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
                    <div className="px-6 py-4 lg:col-span-7">
                      <div className="flex items-center gap-2">
                        <GitMerge className="h-3.5 w-3.5 text-blue-700" />
                        <p className="text-xs font-semibold text-slate-800">
                          Interventi operativi previsti
                        </p>
                      </div>
                      <ol className="mt-2.5 space-y-2 text-xs leading-relaxed text-slate-700">
                        {plan.steps.map((step, idx) => (
                          <li key={idx} className="flex gap-2.5">
                            <span className="font-mono text-blue-700/70 tabular-nums">
                              {String(idx + 1).padStart(2, '0')}.
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                      <p className="mt-3 text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">
                          Impatto atteso:
                        </span>{' '}
                        {plan.estimatedImpact}
                      </p>
                    </div>

                    <div className="flex flex-col justify-between bg-blue-50/40 px-6 py-4 lg:col-span-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-3.5 w-3.5 text-teal-700" />
                          <p className="text-xs font-semibold text-slate-800">
                            Comunicazione sincronizzata verso City Life
                          </p>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-slate-700">
                          &ldquo;{plan.cityLifeMessage}&rdquo;
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          Percorso suggerito:{' '}
                          <span className="font-medium text-slate-700">
                            {plan.cityLifeAlternative}
                          </span>
                        </p>
                        {plan.operatorNote && (
                          <p className="mt-3 border-t border-slate-200 pt-2.5 text-xs text-slate-500">
                            Nota sala operativa: {plan.operatorNote}
                          </p>
                        )}
                      </div>

                      {plan.status === 'pending' && (
                        <div className="mt-5 flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDecision(plan.id, 'approved')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap shrink-0"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approva e Attiva</span>
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => startEditing(plan)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Modifica</span>
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDecision(plan.id, 'rejected')}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 whitespace-nowrap shrink-0"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Rifiuta</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 bg-slate-50 px-6 py-5">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-800">
                          Azioni operative (una per riga)
                        </label>
                        <textarea
                          rows={5}
                          value={draftStepsText}
                          onChange={(e) => setDraftStepsText(e.target.value)}
                          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-3 text-xs leading-relaxed text-slate-900 focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-800">
                            Messaggio per i cittadini su City Life
                          </label>
                          <textarea
                            rows={2}
                            value={draftCityLifeMessage}
                            onChange={(e) => setDraftCityLifeMessage(e.target.value)}
                            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-800">
                            Percorso alternativo consigliato
                          </label>
                          <input
                            type="text"
                            value={draftCityLifeAlt}
                            onChange={(e) => setDraftCityLifeAlt(e.target.value)}
                            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-800">
                            Nota operatore PA
                          </label>
                          <input
                            type="text"
                            value={draftOperatorNote}
                            onChange={(e) => setDraftOperatorNote(e.target.value)}
                            placeholder="Es. Aggiunta pattuglia su Via Acton fino alle 12:30"
                            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleDecision(plan.id, 'modified')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap shrink-0"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Salva modifiche e Attiva</span>
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setEditingPlanId(null)}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap shrink-0"
                      >
                        Annulla
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
