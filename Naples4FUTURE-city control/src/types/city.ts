export type AgentDomain =
  | 'mobility'
  | 'tourism'
  | 'safety'
  | 'environment'
  | 'services';

export type SeverityLevel = 'regular' | 'attention' | 'critical';

export type PlanStatus = 'pending' | 'approved' | 'modified' | 'rejected';

export interface ZoneMetric {
  domain: AgentDomain;
  label: string;
  value: string;
  detail: string;
  status: SeverityLevel;
}

export interface CityZone {
  id: string;
  name: string;
  district: string;
  /** Normalized SVG coordinates (viewBox 0 0 800 500) */
  x: number;
  y: number;
  status: SeverityLevel;
  crowdIndex: number;
  trafficLoad: number;
  airQualityIndex: number;
  activeEvent: string;
  orchestratorNote: string;
  metrics: ZoneMetric[];
}

export interface UrbanAgent {
  id: AgentDomain;
  name: string;
  scope: string;
  status: SeverityLevel;
  currentFocus: string;
  lastUpdate: string;
  activeSignals: number;
}

export interface ActionPlan {
  id: string;
  title: string;
  zoneId: string;
  zoneName: string;
  triggerSummary: string;
  involvedAgents: AgentDomain[];
  steps: string[];
  estimatedImpact: string;
  cityLifeMessage: string;
  cityLifeAlternative: string;
  priority: SeverityLevel;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
  operatorNote?: string;
}

export interface CityLifeAdvisory {
  id: string;
  zoneId: string;
  zoneName: string;
  title: string;
  guidance: string;
  alternativeRoute: string;
  category: AgentDomain;
  active: boolean;
  updatedAt: string;
  estimatedReach: number;
}

export interface PrivacySignal {
  id: string;
  zoneName: string;
  signalType: string;
  trendText: string;
  aggregationWindow: string;
  kAnonymityThreshold: number;
}

export interface CityControlState {
  updatedAt: string;
  zones: CityZone[];
  agents: UrbanAgent[];
  plans: ActionPlan[];
  advisories: CityLifeAdvisory[];
  privacySignals: PrivacySignal[];
}

export interface WhatIfSimulationRequest {
  scenario: string;
  horizon: string;
  intensity: 'moderate' | 'high' | 'critical';
  targetZone?: string;
  eventType?: string;
  constraints?: string;
}

export interface WhatIfAgentImpact {
  domain: AgentDomain;
  agentName: string;
  severity: SeverityLevel;
  forecast: string;
}

export interface WhatIfSimulationResult {
  scenarioSummary: string;
  overallRisk: SeverityLevel;
  timeHorizon: string;
  affectedZones: {
    zoneName: string;
    risk: SeverityLevel;
    reason: string;
  }[];
  agentImpacts: WhatIfAgentImpact[];
  recommendedPlan: {
    title: string;
    zoneId: string;
    zoneName: string;
    steps: string[];
    estimatedImpact: string;
  };
  cityLifeDraft: {
    title: string;
    guidance: string;
    alternativeRoute: string;
  };
}
