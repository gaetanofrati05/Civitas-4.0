import { ChangeEvent, FormEvent, useState } from 'react';
import {
  CivicReport,
  Lang,
  NAPLES_ZONES,
  UI_COPY,
} from '../data/naplesData';
import {
  BusFront,
  Camera,
  CheckCircle2,
  Construction,
  MapPin,
  MoreHorizontal,
  Users,
} from 'lucide-react';

interface ReportViewProps {
  lang: Lang;
  reports: CivicReport[];
  onReportSubmitted: (
    payload: {
      category: CivicReport['category'];
      zone: string;
      description: string;
      hasPhoto: boolean;
    }
  ) => Promise<void>;
}

export function ReportView({
  lang,
  reports,
  onReportSubmitted,
}: ReportViewProps) {
  const t = UI_COPY[lang];
  const [category, setCategory] = useState<CivicReport['category']>('affollamento');
  const [zone, setZone] = useState(NAPLES_ZONES[0].name);
  const [description, setDescription] = useState('');
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories: {
    id: CivicReport['category'];
    label: string;
    labelEn: string;
    icon: typeof Users;
  }[] = [
    { id: 'affollamento', label: 'Affollamento', labelEn: 'Crowding', icon: Users },
    { id: 'disservizio', label: 'Disservizio', labelEn: 'Disruption', icon: BusFront },
    { id: 'danno', label: 'Danno', labelEn: 'Damage', icon: Construction },
    { id: 'altro', label: 'Altro', labelEn: 'Other', icon: MoreHorizontal },
  ];

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoName(file ? file.name : null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError(
        lang === 'EN'
          ? 'Please add a short description.'
          : 'Inserisci una breve descrizione.'
      );
      return;
    }

    setError(null);
    setSubmitting(true);
    setSuccessBanner(false);
    try {
      await onReportSubmitted({
        category,
        zone,
        description: description.trim(),
        hasPhoto: Boolean(photoName),
      });
      setDescription('');
      setPhotoName(null);
      setSuccessBanner(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : lang === 'EN'
          ? 'Failed to send report.'
          : 'Errore invio segnalazione.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">
          {t.reportTitle}
        </h1>
        <span className="text-xs text-slate-500">
          {lang === 'EN' ? 'Anonymous feed' : 'Canale anonimo'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* 2x2 Category Grid matching reference */}
        <div className="grid grid-cols-2 gap-2.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3.5 text-xs font-medium transition-colors min-h-[76px] ${
                  active
                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-blue-700' : 'text-slate-600'}`} />
                <span>{lang === 'EN' ? cat.labelEn : cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Add Photo */}
        <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50">
          <Camera className="h-4 w-4 shrink-0 text-slate-600" />
          <span className="truncate">
            {photoName
              ? photoName
              : lang === 'EN'
              ? 'Add photo (optional)'
              : 'Aggiungi foto'}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="sr-only"
          />
        </label>

        {/* Approximate Zone Selector (Privacy by Design) */}
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
          <MapPin className="h-4 w-4 shrink-0 text-slate-600" />
          <div className="flex-1">
            <label htmlFor="report-zone" className="block text-[11px] text-slate-500">
              {lang === 'EN' ? 'Approximate area' : 'Posizione (approssimata)'}
            </label>
            <select
              id="report-zone"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
            >
              {NAPLES_ZONES.map((z) => (
                <option key={z.name} value={z.name}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            lang === 'EN'
              ? 'Describe briefly what is happening...'
              : 'Descrivi in poche parole...'
          }
          className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600"
        />

        <p className="text-xs text-slate-500">{t.reportAnon}</p>

        {error && (
          <p className="text-xs font-medium text-red-700">{error}</p>
        )}

        {successBanner && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <span>
              {lang === 'EN'
                ? 'Anonymous report correlated by the Orchestrator and forwarded to City Control.'
                : 'Segnalazione anonima correlata dall’Orchestrator e visibile in City Control.'}
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center rounded-xl border border-slate-300 bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:bg-slate-300 min-h-[44px]"
        >
          {submitting
            ? lang === 'EN'
              ? 'Sending...'
              : 'Invio in corso...'
            : t.reportSubmit}
        </button>
      </form>

      {/* Recent Aggregated Signals */}
      {reports.length > 0 && (
        <section className="border-t border-slate-200 pt-3">
          <h2 className="text-xs font-semibold text-slate-600">
            {lang === 'EN'
              ? 'Recent anonymized area signals'
              : 'Segnalazioni aggregate recenti'}
          </h2>
          <ul className="mt-2 space-y-2">
            {reports.slice(0, 3).map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-medium text-slate-800">{r.zone}</span>
                  <span className="font-mono tabular-nums">{r.createdAt}</span>
                </div>
                <p className="mt-1 text-slate-600">{r.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
