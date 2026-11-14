import type { AgentDomain, PlanStatus, SeverityLevel } from '../types/city';

export const DOMAIN_LABELS: Record<AgentDomain, string> = {
  mobility: 'Mobilità',
  tourism: 'Turismo',
  safety: 'Sicurezza',
  environment: 'Ambiente',
  services: 'Servizi Pubblici',
};

export const DOMAIN_COLORS: Record<
  AgentDomain,
  {
    iconBox: string;
    topAccent: string;
    textAccent: string;
  }
> = {
  mobility: {
    iconBox: 'bg-blue-50 text-blue-700 border-blue-200/80',
    topAccent: 'border-t-2 border-t-blue-600',
    textAccent: 'text-blue-700',
  },
  tourism: {
    iconBox: 'bg-amber-50 text-amber-700 border-amber-200/80',
    topAccent: 'border-t-2 border-t-amber-500',
    textAccent: 'text-amber-700',
  },
  safety: {
    iconBox: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    topAccent: 'border-t-2 border-t-indigo-600',
    textAccent: 'text-indigo-700',
  },
  environment: {
    iconBox: 'bg-teal-50 text-teal-700 border-teal-200/80',
    topAccent: 'border-t-2 border-t-teal-600',
    textAccent: 'text-teal-700',
  },
  services: {
    iconBox: 'bg-orange-50 text-orange-700 border-orange-200/80',
    topAccent: 'border-t-2 border-t-orange-600',
    textAccent: 'text-orange-700',
  },
};

export const SEVERITY_META: Record<
  SeverityLevel,
  {
    label: string;
    textClass: string;
    surfaceClass: string;
    markerFill: string;
    markerStroke: string;
  }
> = {
  regular: {
    label: 'Regolare',
    textClass: 'text-emerald-700',
    surfaceClass: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    markerFill: '#0f766e',
    markerStroke: '#ccfbf1',
  },
  attention: {
    label: 'Attenzione',
    textClass: 'text-amber-700',
    surfaceClass: 'bg-amber-50 border-amber-200 text-amber-800',
    markerFill: '#d97706',
    markerStroke: '#fef3c7',
  },
  critical: {
    label: 'Critico',
    textClass: 'text-red-700',
    surfaceClass: 'bg-red-50 border-red-200 text-red-800',
    markerFill: '#dc2626',
    markerStroke: '#fee2e2',
  },
};

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  pending: 'In attesa di decisione',
  approved: 'Approvato e attivo',
  modified: 'Modificato e attivo',
  rejected: 'Rifiutato',
};
