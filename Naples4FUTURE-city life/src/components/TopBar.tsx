import { Lang, NavTab, UI_COPY } from '../data/naplesData';
import { User } from 'lucide-react';

interface TopBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenProfile: () => void;
  lang: Lang;
}

export function TopBar({ activeTab, onTabChange, onOpenProfile, lang }: TopBarProps) {
  const t = UI_COPY[lang];
  const navItems: { id: NavTab; label: string }[] = [
    { id: 'home', label: t.nav.home },
    { id: 'map', label: t.nav.map },
    { id: 'services', label: t.nav.services },
    { id: 'ask', label: t.nav.ask },
    { id: 'report', label: t.nav.report },
  ];

  return (
    <header className="sticky top-0 z-30 relative flex h-16 w-full items-center justify-between gap-8 border-b border-slate-200 bg-white px-4 pt-1.5 sm:px-6">
      {/* Thin top banner: azzurro to arancione gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#0080e6] via-[#0d4dec] to-orange-500"
      />

      {/* Zone 1: Stylized Vesuvius logo + brand title */}
      <button
        type="button"
        onClick={() => onTabChange('home')}
        className="inline-flex items-center gap-2.5 rounded-lg border border-[#0d4dec] bg-sky-50/40 px-2.5 py-1.5 text-base font-bold tracking-tight text-slate-900 transition-colors hover:bg-sky-50 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#0d4dec] sm:text-lg"
      >
        <svg
          width="32"
          height="24"
          viewBox="0 0 36 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="h-6 w-8 shrink-0"
        >
          {/* Warm sun arc */}
          <circle cx="25.5" cy="7.5" r="4.5" fill="#F97316" fillOpacity="0.9" />
          {/* Monte Somma & Vesuvius twin silhouette in Napoli Azzurro */}
          <path
            d="M2 20L11.5 7.5L15.2 11.2L20.5 4.5L34 20H2Z"
            fill="url(#vesuvio_azzurro)"
          />
          <path
            d="M20.5 4.5L23.8 11.5L19.5 13.5L15.2 11.2L20.5 4.5Z"
            fill="#38BDF8"
            fillOpacity="0.55"
          />
          {/* Bay of Naples wave */}
          <path
            d="M2 22.5C6.5 20.5 11 24.5 16 22.5C21 20.5 25.5 24.5 34 22"
            stroke="#0080E6"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient
              id="vesuvio_azzurro"
              x1="2"
              y1="4.5"
              x2="34"
              y2="20"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0EA5E9" />
              <stop offset="0.55" stopColor="#0072CE" />
              <stop offset="1" stopColor="#0D4DEC" />
            </linearGradient>
          </defs>
        </svg>
        <span className="bg-gradient-to-r from-[#0d4dec] to-[#0072ce] bg-clip-text text-transparent">
          {t.brand}
        </span>
      </button>

      {/* Zone 2: 5 single-line navigation links */}
      <nav aria-label="Primary" className="hidden md:flex items-center gap-6">
        {navItems.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`relative py-4 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#0d4dec] ${
                active ? 'text-[#0d4dec]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
              {active && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0d4dec]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onOpenProfile}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 min-h-[40px]"
        >
          <User className="h-3.5 w-3.5 text-[#0d4dec]" />
          <span>{t.nav.profile}</span>
        </button>
      </div>
    </header>
  );
}
