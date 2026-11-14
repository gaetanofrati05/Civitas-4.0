import { useCallback, useEffect, useState } from 'react';
import { Menu, SlidersHorizontal } from 'lucide-react';
import { Sidebar, type NavTab } from './components/Sidebar';
import { OverviewView } from './components/OverviewView';
import { PlansView } from './components/PlansView';
import { SimulatorView } from './components/SimulatorView';
import { CityLifeBridgeView } from './components/CityLifeBridgeView';
import type {
  AgentDomain,
  CityControlState,
  WhatIfSimulationResult,
} from './types/city';

const TAB_TITLES: Record<NavTab, string> = {
  overview: 'Mappa e Flussi',
  plans: 'Piani Orchestrator',
  simulator: 'Simulatore What-If',
  bridge: 'Ponte City Life',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityState, setCityState] = useState<CityControlState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planZoneFilter, setPlanZoneFilter] = useState<string | null>(null);

  const loadState = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/city-state');
      if (!res.ok) throw new Error('Impossibile caricare i dati della sala operativa.');
      const data = (await res.json()) as CityControlState;
      setCityState(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Errore di connessione al server City Control.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const handleDecidePlan = async (
    planId: string,
    payload: {
      decision: 'approved' | 'modified' | 'rejected';
      operatorNote?: string;
      steps?: string[];
      cityLifeMessage?: string;
      cityLifeAlternative?: string;
    },
  ) => {
    const res = await fetch(`/api/plans/${planId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Errore nell’aggiornamento del piano.');
    }
    setCityState(data as CityControlState);
  };

  const handlePromoteSimulation = async (
    simulation: WhatIfSimulationResult,
    approveImmediately: boolean,
  ) => {
    const res = await fetch('/api/plans/from-simulation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulation, approveImmediately }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Errore nel salvataggio del piano.');
    }
    setCityState(data.state as CityControlState);
  };

  const handleToggleAdvisory = async (id: string) => {
    const res = await fetch('/api/advisories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, toggle: true }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Errore nella modifica dell’avviso.');
    }
    setCityState(data as CityControlState);
  };

  const handleCreateAdvisory = async (payload: {
    zoneId: string;
    title: string;
    guidance: string;
    alternativeRoute: string;
    category: AgentDomain;
  }) => {
    const res = await fetch('/api/advisories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Errore nella creazione dell’avviso.');
    }
    setCityState(data as CityControlState);
  };

  const pendingPlansCount =
    cityState?.plans.filter((p) => p.status === 'pending').length ?? 0;
  const activeAdvisoriesCount =
    cityState?.advisories.filter((a) => a.active).length ?? 0;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'plans') setPlanZoneFilter(null);
        }}
        pendingPlansCount={pendingPlansCount}
        activeAdvisoriesCount={activeAdvisoriesCount}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar minimale secondo contratto SaaS Dashboard: breadcrumb a sinistra, 1 azione primaria a destra */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
              aria-label="Apri menu di navigazione"
            >
              <Menu className="h-5 w-5" />
            </button>
            <nav
              aria-label="Percorso corrente"
              className="flex items-center gap-2 text-xs text-slate-500 truncate"
            >
              <span className="hidden sm:inline whitespace-nowrap">
                Comune di Napoli
              </span>
              <span className="hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="whitespace-nowrap">City Control</span>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-slate-900 whitespace-nowrap">
                {TAB_TITLES[activeTab]}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {cityState && (
              <span className="hidden text-xs text-slate-500 tabular-nums md:inline">
                Aggiornamento {cityState.updatedAt}
              </span>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Simula Scenario</span>
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1360px] flex-1 p-6">
          {loading ? (
            <div className="space-y-6" aria-busy="true">
              <div className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white xl:col-span-7" />
                <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white xl:col-span-5" />
              </div>
            </div>
          ) : error || !cityState ? (
            <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
              <p className="font-display text-sm font-semibold text-slate-900">
                Connessione ai servizi della cabina di regia non riuscita
              </p>
              <p className="mt-1 text-xs text-slate-600">{error}</p>
              <button
                type="button"
                onClick={loadState}
                className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-xs font-medium text-white hover:bg-blue-800"
              >
                Riprova caricamento
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewView
                  zones={cityState.zones}
                  agents={cityState.agents}
                  plans={cityState.plans}
                  advisories={cityState.advisories}
                  onGoToPlans={(zoneId) => {
                    setPlanZoneFilter(zoneId ?? null);
                    setActiveTab('plans');
                  }}
                  onGoToBridge={() => setActiveTab('bridge')}
                />
              )}

              {activeTab === 'plans' && (
                <PlansView
                  plans={cityState.plans}
                  initialZoneFilter={planZoneFilter}
                  onDecidePlan={handleDecidePlan}
                />
              )}

              {activeTab === 'simulator' && (
                <SimulatorView
                  zones={cityState.zones}
                  onPromoteSimulation={handlePromoteSimulation}
                />
              )}

              {activeTab === 'bridge' && (
                <CityLifeBridgeView
                  advisories={cityState.advisories}
                  privacySignals={cityState.privacySignals}
                  zones={cityState.zones}
                  onToggleAdvisory={handleToggleAdvisory}
                  onCreateAdvisory={handleCreateAdvisory}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
