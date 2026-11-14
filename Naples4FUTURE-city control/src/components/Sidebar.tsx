import {
  Map,
  ClipboardCheck,
  SlidersHorizontal,
  ArrowLeftRight,
  Building2,
  X,
} from 'lucide-react';
import { NaplesLogo } from './NaplesLogo';

export type NavTab = 'overview' | 'plans' | 'simulator' | 'bridge';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingPlansCount: number;
  activeAdvisoriesCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  pendingPlansCount,
  activeAdvisoriesCount,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const navItems: {
    id: NavTab;
    label: string;
    icon: typeof Map;
    count?: number;
  }[] = [
    { id: 'overview', label: 'Mappa e Flussi', icon: Map },
    {
      id: 'plans',
      label: 'Piani Orchestrator',
      icon: ClipboardCheck,
      count: pendingPlansCount > 0 ? pendingPlansCount : undefined,
    },
    { id: 'simulator', label: 'Simulatore What-If', icon: SlidersHorizontal },
    {
      id: 'bridge',
      label: 'Ponte City Life',
      icon: ArrowLeftRight,
      count: activeAdvisoriesCount > 0 ? activeAdvisoriesCount : undefined,
    },
  ];

  const handleNav = (id: NavTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r border-slate-200 bg-white transition-transform duration-150 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-[3px] w-full bg-gradient-to-r from-[#006fb8] via-[#0c8cd6] to-[#f59e0b]" />

        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <NaplesLogo className="h-7 w-7 shrink-0" />
            <span className="font-display text-sm font-bold tracking-tight text-slate-900">
              Naples4Future - City Control
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Chiudi menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-5" aria-label="Menu principale">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-blue-200/80 bg-blue-50 text-blue-800'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-blue-700' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </span>
                {item.count !== undefined && (
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      isActive ? 'font-semibold text-blue-800' : 'text-slate-500'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 bg-blue-50/40 px-4 py-4">
          <div className="flex items-start gap-2.5">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-700">
              <Building2 className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-900">Sala Operativa PA</p>
              <p className="mt-0.5 text-xs text-slate-600">
                Comune di Napoli · Palazzo San Giacomo
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
