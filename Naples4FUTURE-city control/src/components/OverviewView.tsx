import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  GitMerge,
  Info,
  Layers,
  MapPin,
  Smartphone,
} from 'lucide-react';
import type {
  ActionPlan,
  AgentDomain,
  CityLifeAdvisory,
  CityZone,
  SeverityLevel,
  UrbanAgent,
} from '../types/city';
import { DOMAIN_COLORS, DOMAIN_LABELS, SEVERITY_META } from '../utils/labels';
import { DomainIcon } from './DomainIcon';
import { NaplesMap } from './NaplesMap';

interface OverviewViewProps {
  zones: CityZone[];
  agents: UrbanAgent[];
  plans: ActionPlan[];
  advisories: CityLifeAdvisory[];
  onGoToPlans: (zoneId?: string) => void;
  onGoToBridge: () => void;
}

function StatusLabel({ status }: { status: SeverityLevel }) {
  const meta = SEVERITY_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${meta.textClass}`}>
      {status === 'critical' && <AlertTriangle className="h-3.5 w-3.5" />}
      {status === 'attention' && <Info className="h-3.5 w-3.5" />}
      {status === 'regular' && <CheckCircle2 className="h-3.5 w-3.5" />}
      <span>{meta.label}</span>
    </span>
  );
}

export function OverviewView({
  zones,
  agents,
  plans,
  advisories,
  onGoToPlans,
  onGoToBridge,
}: OverviewViewProps) {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id ?? 'plebiscito');
  const [domainFilter, setDomainFilter] = useState<AgentDomain | 'all'>('all');

  const selectedZone = zones.find((z) => z.id === selectedZoneId) ?? zones[0];
  const criticalZonesCount = zones.filter((z) => z.status !== 'regular').length;
  const pendingPlansCount = plans.filter((p) => p.status === 'pending').length;
  const activeAdvisoriesCount = advisories.filter((a) => a.active).length;

  const zonePendingPlan = plans.find(
    (p) => p.zoneId === selectedZone?.id && p.status === 'pending',
  );
  const zoneAdvisory = advisories.find(
    (a) => a.zoneId === selectedZone?.id && a.active,
  );

  const filterOptions: { id: AgentDomain | 'all'; label: string }[] = [
    { id: 'all', label: 'Tutti gli ambiti' },
    { id: 'mobility', label: 'Mobilità' },
    { id: 'tourism', label: 'Turismo' },
    { id: 'safety', label: 'Sicurezza' },
    { id: 'environment', label: 'Ambiente' },
    { id: 'services', label: 'Servizi' },
  ];

  const visibleMetrics =
    domainFilter === 'all'
      ? selectedZone?.metrics ?? []
      : (selectedZone?.metrics ?? []).filter((m) => m.domain === domainFilter);

  return (
    <div className="space-y-6">
      {/* Fascia sintesi operativa a 4 colonne con icone colorate */}
      <div className="grid grid-cols-2 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        <div className="flex items-start justify-between gap-3 px-5 py-4">
          <div>
            <p className="text-xs font-medium text-slate-500">Zone monitorate</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {zones.length}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Copertura urbana attiva</p>
          </div>
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
            <MapPin className="h-4 w-4" />
          </span>
        </div>

        <div className="flex items-start justify-between gap-3 px-5 py-4">
          <div>
            <p className="text-xs font-medium text-slate-500">Aree sotto pressione</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {criticalZonesCount}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Attenzione o criticità</p>
          </div>
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700">
            <AlertTriangle className="h-4 w-4" />
          </span>
        </div>

        <div className="flex items-start justify-between gap-3 px-5 py-4">
          <div>
            <p className="text-xs font-medium text-slate-500">Piani Orchestrator</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {pendingPlansCount}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">In attesa di decisione PA</p>
          </div>
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700">
            <ClipboardCheck className="h-4 w-4" />
          </span>
        </div>

        <div className="flex items-start justify-between gap-3 px-5 py-4">
          <div>
            <p className="text-xs font-medium text-slate-500">Avvisi City Life</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {activeAdvisoriesCount}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Attivi per cittadini e turisti</p>
          </div>
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-teal-200 bg-teal-50 text-teal-700">
            <Smartphone className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Filtro per ambito agente */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1"
          role="group"
          aria-label="Filtra per ambito agente"
        >
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setDomainFilter(opt.id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                domainFilter === opt.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt.id === 'all' ? (
                <Layers className="h-3.5 w-3.5 text-slate-500" />
              ) : (
                <DomainIcon domain={opt.id} size="xs" />
              )}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-500">
          {domainFilter === 'all'
            ? 'Vista integrata di tutti gli agenti urbani'
            : `Focus attivo su: ${DOMAIN_LABELS[domainFilter]}`}
        </p>
      </div>

      {/* Griglia principale: Mappa (sinistra) + Dettaglio Zona (destra) */}
      <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <NaplesMap
            zones={zones}
            selectedZoneId={selectedZone?.id ?? ''}
            onSelectZone={setSelectedZoneId}
            activeFilter={domainFilter}
          />
        </div>

        {selectedZone && (
          <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white xl:col-span-5">
            <div>
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
                      <MapPin className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-xs text-slate-500">
                        Municipalità · {selectedZone.district}
                      </p>
                      <h3 className="mt-0.5 font-display text-base font-semibold text-slate-900">
                        {selectedZone.name}
                      </h3>
                    </div>
                  </div>
                  <StatusLabel status={selectedZone.status} />
                </div>

                <p className="mt-2.5 text-xs font-medium text-slate-700">
                  {selectedZone.activeEvent}
                </p>

                <div className="mt-3 grid grid-cols-3 gap-3 border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-[11px] text-slate-500">Affollamento</p>
                    <p className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                      {selectedZone.crowdIndex}%
                    </p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          selectedZone.crowdIndex >= 80
                            ? 'bg-red-600'
                            : selectedZone.crowdIndex >= 65
                              ? 'bg-amber-500'
                              : 'bg-teal-600'
                        }`}
                        style={{ width: `${selectedZone.crowdIndex}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Carico traffico</p>
                    <p className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                      {selectedZone.trafficLoad}%
                    </p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          selectedZone.trafficLoad >= 80
                            ? 'bg-red-600'
                            : selectedZone.trafficLoad >= 65
                              ? 'bg-amber-500'
                              : 'bg-blue-600'
                        }`}
                        style={{ width: `${selectedZone.trafficLoad}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Indice aria</p>
                    <p className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                      {selectedZone.airQualityIndex} AQI
                    </p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-teal-600"
                        style={{ width: `${Math.min(100, selectedZone.airQualityIndex)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sintesi Orchestrator */}
              <div className="border-b border-slate-200 bg-blue-50/50 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <GitMerge className="h-3.5 w-3.5 text-blue-700" />
                  <p className="text-xs font-semibold text-blue-900">
                    Sintesi Orchestrator
                  </p>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">
                  {selectedZone.orchestratorNote}
                </p>
              </div>

              {/* Letture agenti nella zona */}
              <div className="divide-y divide-slate-100 px-5">
                {visibleMetrics.map((m) => (
                  <div key={m.domain} className="flex items-start gap-3 py-3">
                    <DomainIcon domain={m.domain} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-800">
                          {m.label}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-medium text-slate-900 tabular-nums">
                            {m.value}
                          </span>
                          <span
                            className={`text-[11px] font-medium ${
                              SEVERITY_META[m.status].textClass
                            }`}
                          >
                            {SEVERITY_META[m.status].label}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{m.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Azioni rapide sulla zona */}
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-3.5">
              {zonePendingPlan ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900">
                      Piano d&apos;azione suggerito disponibile
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {zonePendingPlan.title}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onGoToPlans(selectedZone.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0"
                  >
                    <span>Esamina piano</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : zoneAdvisory ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900">
                      Avviso attivo su City Life
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {zoneAdvisory.title}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onGoToBridge}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0"
                  >
                    <span>Gestisci avviso</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    Nessun intervento urgente richiesto in questa zona.
                  </p>
                  <button
                    type="button"
                    onClick={() => onGoToPlans()}
                    className="text-xs font-medium text-blue-700 hover:underline whitespace-nowrap shrink-0"
                  >
                    Vedi tutti i piani
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stato dei 5 Agenti Specializzati */}
      <section aria-labelledby="agents-heading">
        <div className="mb-3 flex items-baseline justify-between">
          <h2
            id="agents-heading"
            className="font-display text-sm font-semibold text-slate-900"
          >
            Ecosistema Agenti Specializzati
          </h2>
          <p className="text-xs text-slate-500">
            Segnali coordinati dall&apos;Orchestrator centrale
          </p>
        </div>

        <div className="grid grid-cols-1 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white md:grid-cols-5 md:divide-x md:divide-y-0">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`flex flex-col justify-between p-4 ${DOMAIN_COLORS[agent.id].topAccent}`}
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <DomainIcon domain={agent.id} size="sm" />
                  <h3 className="text-xs font-semibold text-slate-900">
                    {agent.name}
                  </h3>
                </div>
                <div className="mt-2">
                  <StatusLabel status={agent.status} />
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                  {agent.currentFocus}
                </p>
              </div>
              <p className="mt-3 pt-2 text-[11px] text-slate-400 tabular-nums">
                {agent.activeSignals} segnali · Agg. {agent.lastUpdate}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
