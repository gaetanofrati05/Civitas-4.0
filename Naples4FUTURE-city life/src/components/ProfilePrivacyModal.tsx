import { useState } from 'react';
import {
  Lang,
  PrivacySettings,
  UI_COPY,
  UserProfile,
} from '../data/naplesData';
import { ShieldCheck, X } from 'lucide-react';

interface ProfilePrivacyModalProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileChange: (p: UserProfile) => void;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  privacy: PrivacySettings;
  onPrivacyChange: (next: PrivacySettings) => void;
}

export function ProfilePrivacyModal({
  open,
  onClose,
  profile,
  onProfileChange,
  lang,
  onLangChange,
  privacy,
  onPrivacyChange,
}: ProfilePrivacyModalProps) {
  const t = UI_COPY[lang];
  const [docView, setDocView] = useState<'privacy' | 'algorithms' | 'accessibility' | null>(null);
  const [editingAccess, setEditingAccess] = useState(false);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.privacyTitle}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-700" />
            <h2 className="text-base font-semibold text-slate-900">
              {t.privacyTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'EN' ? 'Close' : 'Chiudi'}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Profilo */}
          <div className="flex items-center justify-between py-3.5">
            <span className="text-sm text-slate-800">{t.profile.label}</span>
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => onProfileChange('turista')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  profile === 'turista'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                {t.profile.turista}
              </button>
              <button
                type="button"
                onClick={() => onProfileChange('residente')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  profile === 'residente'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                {t.profile.residente}
              </button>
            </div>
          </div>

          {/* Lingua */}
          <div className="flex items-center justify-between py-3.5">
            <span className="text-sm text-slate-800">
              {lang === 'EN' ? 'Language' : 'Lingua'}
            </span>
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              {(['IT', 'EN'] as Lang[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onLangChange(code)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    lang === code
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          {/* Posizione precisa */}
          <div className="flex items-center justify-between py-3.5">
            <span className="text-sm text-slate-800">
              {lang === 'EN' ? 'Precise location' : 'Posizione precisa'}
            </span>
            <button
              type="button"
              onClick={() =>
                onPrivacyChange({
                  ...privacy,
                  preciseLocation: !privacy.preciseLocation,
                })
              }
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                privacy.preciseLocation
                  ? 'border-blue-600 bg-blue-50 text-blue-800'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              {privacy.preciseLocation
                ? lang === 'EN'
                  ? 'Enabled'
                  : 'Attiva'
                : lang === 'EN'
                ? 'Disabled'
                : 'Disattiva'}
            </button>
          </div>

          {/* Avvisi di emergenza */}
          <div className="flex items-center justify-between py-3.5">
            <span className="text-sm text-slate-800">
              {lang === 'EN' ? 'Emergency alerts' : 'Avvisi di emergenza'}
            </span>
            <button
              type="button"
              onClick={() =>
                onPrivacyChange({
                  ...privacy,
                  emergencyAlerts: !privacy.emergencyAlerts,
                })
              }
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                privacy.emergencyAlerts
                  ? 'border-blue-600 bg-blue-50 text-blue-800'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              {privacy.emergencyAlerts
                ? lang === 'EN'
                  ? 'Always active'
                  : 'Sempre attivi'
                : lang === 'EN'
                ? 'Muted'
                : 'Sospesi'}
            </button>
          </div>

          {/* Suggerimenti personalizzati */}
          <div className="flex items-center justify-between py-3.5">
            <span className="text-sm text-slate-800">
              {lang === 'EN'
                ? 'Personalized suggestions'
                : 'Suggerimenti personalizzati'}
            </span>
            <button
              type="button"
              onClick={() =>
                onPrivacyChange({
                  ...privacy,
                  personalizedSuggestions: !privacy.personalizedSuggestions,
                })
              }
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                privacy.personalizedSuggestions
                  ? 'border-blue-600 bg-blue-50 text-blue-800'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              {privacy.personalizedSuggestions
                ? lang === 'EN'
                  ? 'Active'
                  : 'Attivi'
                : lang === 'EN'
                ? 'Off'
                : 'Disattivi'}
            </button>
          </div>

          {/* Esigenze di accessibilità */}
          <div className="py-3.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-800">
                {lang === 'EN'
                  ? 'Accessibility needs'
                  : 'Esigenze di accessibilità'}
              </span>
              <button
                type="button"
                onClick={() => setEditingAccess((prev) => !prev)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                {editingAccess
                  ? lang === 'EN'
                    ? 'Done'
                    : 'Chiudi'
                  : lang === 'EN'
                  ? 'Configure'
                  : 'Imposta'}
              </button>
            </div>
            {editingAccess && (
              <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3 text-xs">
                {(
                  [
                    ['stepFree', lang === 'EN' ? 'Step-free routes' : 'Percorsi senza gradini'],
                    ['avoidCrowds', lang === 'EN' ? 'Avoid dense crowds' : 'Evita aree affollate'],
                    ['flatRoutes', lang === 'EN' ? 'Low-slope paths' : 'Pendenza ridotta'],
                    ['audioDescriptions', lang === 'EN' ? 'Audio guidance' : 'Descrizioni vocali'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between gap-2">
                    <span className="text-slate-700">{label}</span>
                    <input
                      type="checkbox"
                      checked={privacy.accessibility[key]}
                      onChange={() =>
                        onPrivacyChange({
                          ...privacy,
                          accessibility: {
                            ...privacy.accessibility,
                            [key]: !privacy.accessibility[key],
                          },
                        })
                      }
                      className="h-4 w-4 accent-blue-700"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Privacy by Design Guarantee */}
        <div className="mt-2 rounded-xl bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-600">
          {lang === 'EN'
            ? 'Approximate zone location is sufficient for alerts. Your personal agent processes preferences locally; only anonymous aggregated signals reach the city Orchestrator.'
            : 'La posizione approssimata (zona) basta per gli avvisi. Nessun dato personale lascia il dispositivo senza il tuo consenso esplicito.'}
        </div>

        {/* Transparency Links */}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
          <button
            type="button"
            onClick={() => setDocView(docView === 'privacy' ? null : 'privacy')}
            className="underline hover:text-blue-700"
          >
            {lang === 'EN' ? 'Privacy Notice' : 'Informativa privacy'}
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => setDocView(docView === 'algorithms' ? null : 'algorithms')}
            className="underline hover:text-blue-700"
          >
            {lang === 'EN' ? 'Algorithm Registry' : 'Registro degli algoritmi'}
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() =>
              setDocView(docView === 'accessibility' ? null : 'accessibility')
            }
            className="underline hover:text-blue-700"
          >
            {lang === 'EN'
              ? 'Accessibility Statement'
              : 'Dichiarazione di accessibilità'}
          </button>
        </div>

        {docView && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
            {docView === 'privacy' &&
              (lang === 'EN'
                ? 'Privacy by Design: Personal agents run locally for accessibility and routing preferences. Anonymized zone telemetry prevents surveillance while enabling city-wide coordination.'
                : 'Privacy by Design: gli agenti personali elaborano preferenze localmente; l’agente aggregatore riceve esclusivamente dati anonimi e aggregati per zona.')}
            {docView === 'algorithms' &&
              (lang === 'EN'
                ? 'Public Algorithm Registry: Mobility Agent weights ANM disruptions & travel time; Tourism Agent weights real-time crowd occupancy; Orchestrator correlates zone pressure without profiling individuals.'
                : 'Registro pubblico algoritmi: Mobility Agent valuta ritardi ANM e traffico; Tourism Agent calcola densità per zona; Orchestrator correla criticità senza profilazione individuale.')}
            {docView === 'accessibility' &&
              (lang === 'EN'
                ? 'WCAG 2.1 AA compliant controls, high-contrast map markers, keyboard focus indicators, and step-free pedestrian routing preferences.'
                : 'Interfaccia conforme WCAG 2.1 AA, contrasto elevato, navigazione da tastiera e filtro dedicato per percorsi privi di barriere architettoniche.')}
          </div>
        )}
      </div>
    </div>
  );
}
