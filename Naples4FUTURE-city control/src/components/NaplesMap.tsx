import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, TrainFront } from 'lucide-react';
import type { AgentDomain, CityZone, SeverityLevel } from '../types/city';
import { SEVERITY_META } from '../utils/labels';

interface NaplesMapProps {
  zones: CityZone[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
  activeFilter: AgentDomain | 'all';
}

function getZoneStatusForFilter(
  zone: CityZone,
  filter: AgentDomain | 'all',
): SeverityLevel {
  if (filter === 'all') return zone.status;
  const metric = zone.metrics.find((m) => m.domain === filter);
  return metric ? metric.status : zone.status;
}

function StatusGlyph({ status }: { status: SeverityLevel }) {
  if (status === 'critical') {
    return <AlertTriangle className="h-3.5 w-3.5 text-red-700" aria-hidden="true" />;
  }
  if (status === 'attention') {
    return <Info className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />;
  }
  return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />;
}

export function NaplesMap({
  zones,
  selectedZoneId,
  onSelectZone,
  activeFilter,
}: NaplesMapProps) {
  const [showTransit, setShowTransit] = useState(true);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
        <div>
          <h2 className="font-display text-sm font-semibold text-slate-900">
            Mappa Territoriale di Napoli
          </h2>
          <p className="text-xs text-slate-500">
            Seleziona una zona per leggere i dati degli agenti e le azioni coordinate
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTransit((prev) => !prev)}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            showTransit
              ? 'border-blue-200 bg-blue-50 text-blue-800'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <TrainFront className="h-3.5 w-3.5" />
          <span>Linee Metro e Funicolari</span>
        </button>
      </div>

      <div className="relative bg-slate-50">
        <svg
          viewBox="0 0 800 470"
          className="h-auto w-full select-none"
          role="img"
          aria-label="Mappa interattiva delle zone monitorate di Napoli"
        >
          <defs>
            <linearGradient id="gulf-sea" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d9eefc" />
              <stop offset="100%" stopColor="#ebf6fe" />
            </linearGradient>
            <pattern
              id="civic-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#cfe6f7"
                strokeWidth="0.7"
              />
            </pattern>
          </defs>

          {/* Mare / Golfo di Napoli */}
          <rect width="800" height="470" fill="url(#gulf-sea)" />
          <rect width="800" height="470" fill="url(#civic-grid)" opacity="0.55" />

          {/* Terraferma di Napoli (sagoma schematica fedele alla costa) */}
          <path
            d="M 0 0 L 800 0 L 800 342 C 745 344 680 340 622 336 C 555 332 490 330 434 334 C 414 336 404 344 394 346 C 378 348 368 338 352 338 C 330 340 318 354 304 358 C 282 362 246 362 214 374 C 175 388 142 414 96 436 C 60 448 25 456 0 458 Z"
            fill="#fcfcfd"
            stroke="#8ac4ea"
            strokeWidth="1.75"
          />

          {/* Aree verdi Vomero / San Martino / Capodimonte */}
          <path
            d="M 190 120 C 260 95 360 95 430 135 C 470 160 450 225 380 245 C 310 265 215 245 180 195 C 165 170 165 140 190 120 Z"
            fill="#f0fdf4"
            stroke="#bbf7d0"
            strokeWidth="1"
          />
          <ellipse
            cx="500"
            cy="108"
            rx="62"
            ry="32"
            fill="#ecfdf5"
            stroke="#a7f3d0"
            strokeWidth="1"
          />

          {/* Riferimenti geografici discreti */}
          <text
            x="445"
            y="412"
            className="fill-[#006fb8]/70 text-[11px] font-semibold tracking-wide"
          >
            Golfo di Napoli
          </text>
          <text
            x="335"
            y="148"
            className="fill-emerald-800/60 text-[10px] font-medium"
          >
            Collina del Vomero · San Martino
          </text>
          <text
            x="472"
            y="112"
            className="fill-emerald-800/60 text-[10px] font-medium"
          >
            Bosco di Capodimonte
          </text>

          {/* Profilo orientativo Vesuvio a est */}
          <g transform="translate(698, 282)" opacity="0.75">
            <path
              d="M 0 34 L 22 6 L 32 10 L 44 2 L 70 34 Z"
              fill="#e0f0fe"
              stroke="#7cc4f2"
              strokeWidth="1.2"
            />
            <text
              x="35"
              y="46"
              textAnchor="middle"
              className="fill-[#006fb8] text-[9px] font-semibold"
            >
              Vesuvio
            </text>
          </g>

          {/* Principali arterie stradali */}
          <path
            d="M 118 332 Q 210 355 245 356 Q 315 352 348 330 L 416 334 L 560 218"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 274 212 L 348 330 M 446 244 L 560 218 M 348 330 L 446 244"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Rete Metro & Funicolari (toggleabile) */}
          {showTransit && (
            <g>
              {/* Metro Linea 1 (giallo istituzionale) */}
              <path
                d="M 215 150 L 274 212 L 365 235 L 408 265 L 385 312 L 420 315 L 478 272 L 560 218"
                fill="none"
                stroke="#d97706"
                strokeWidth="2.2"
                strokeDasharray="6 3"
              />
              {/* Metro Linea 2 (azzurro Napoli) */}
              <path
                d="M 118 332 L 195 322 L 265 296 L 345 268 L 446 244 L 560 218 L 650 222"
                fill="none"
                stroke="#006fb8"
                strokeWidth="2"
              />
              {/* Metro Linea 6 (verde acqua) */}
              <path
                d="M 118 332 L 190 356 L 245 356 L 348 330 L 388 320"
                fill="none"
                stroke="#0f766e"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            </g>
          )}

          {/* Zone interattive */}
          {zones.map((zone) => {
            const status = getZoneStatusForFilter(zone, activeFilter);
            const meta = SEVERITY_META[status];
            const isSelected = zone.id === selectedZoneId;

            return (
              <g
                key={zone.id}
                transform={`translate(${zone.x}, ${zone.y})`}
                onClick={() => onSelectZone(zone.id)}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`${zone.name}, stato ${meta.label}, affollamento ${zone.crowdIndex}%`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectZone(zone.id);
                  }
                }}
              >
                {isSelected && (
                  <circle
                    r="23"
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                  />
                )}
                <circle
                  r="17"
                  fill={meta.markerStroke}
                  stroke={meta.markerFill}
                  strokeWidth={isSelected ? '2.5' : '1.75'}
                />
                <circle r="6" fill={meta.markerFill} />

                <g transform="translate(0, 29)">
                  <rect
                    x="-76"
                    y="-10"
                    width="152"
                    height="20"
                    rx="4"
                    fill="#ffffff"
                    fillOpacity="0.94"
                    stroke={isSelected ? '#0f172a' : '#cbd5e1'}
                    strokeWidth={isSelected ? '1.2' : '0.8'}
                  />
                  <text
                    textAnchor="middle"
                    y="3"
                    className="fill-slate-900 text-[10px] font-semibold"
                  >
                    {zone.name.split(' · ')[0].split(' & ')[0]}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legenda accessibile e lineare */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-white px-5 py-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-5">
          {(['regular', 'attention', 'critical'] as SeverityLevel[]).map((sev) => (
            <span key={sev} className="inline-flex items-center gap-1.5">
              <StatusGlyph status={sev} />
              <span className="font-medium text-slate-700">
                {SEVERITY_META[sev].label}
              </span>
            </span>
          ))}
        </div>

        {showTransit && (
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 bg-amber-600" />
              Linea 1
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 bg-blue-700" />
              Linea 2
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 bg-teal-700" />
              Linea 6
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
