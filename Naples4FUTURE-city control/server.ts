import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { createInitialCityState } from './server/cityData.js';
import type {
  ActionPlan,
  CityLifeAdvisory,
  WhatIfSimulationRequest,
  WhatIfSimulationResult,
} from './src/types/city.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cityState = createInitialCityState();

function nowClock(): string {
  const d = new Date();
  return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Chiave GEMINI_API_KEY non configurata nell’ambiente server. Configurala nel pannello Settings > Secrets.',
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'napoli-city-control' });
  });

  app.get('/api/city-state', (_req, res) => {
    res.json(cityState);
  });

  app.post('/api/plans/:id/decision', (req, res) => {
    const { id } = req.params;
    const {
      decision,
      operatorNote,
      steps,
      cityLifeMessage,
      cityLifeAlternative,
    } = req.body as {
      decision: 'approved' | 'modified' | 'rejected';
      operatorNote?: string;
      steps?: string[];
      cityLifeMessage?: string;
      cityLifeAlternative?: string;
    };

    const plan = cityState.plans.find((p) => p.id === id);
    if (!plan) {
      res.status(404).json({ error: 'Piano di intervento non trovato.' });
      return;
    }

    const clock = nowClock();
    plan.status = decision;
    plan.updatedAt = clock;
    if (operatorNote !== undefined) plan.operatorNote = operatorNote;
    if (Array.isArray(steps) && steps.length > 0) plan.steps = steps;
    if (typeof cityLifeMessage === 'string' && cityLifeMessage.trim()) {
      plan.cityLifeMessage = cityLifeMessage.trim();
    }
    if (typeof cityLifeAlternative === 'string' && cityLifeAlternative.trim()) {
      plan.cityLifeAlternative = cityLifeAlternative.trim();
    }

    if (decision === 'approved' || decision === 'modified') {
      const zone = cityState.zones.find((z) => z.id === plan.zoneId);
      if (zone) {
        zone.crowdIndex = Math.max(35, zone.crowdIndex - 16);
        zone.trafficLoad = Math.max(35, zone.trafficLoad - 14);
        if (zone.status === 'critical') {
          zone.status = 'attention';
        } else if (zone.status === 'attention') {
          zone.status = 'regular';
        }
        zone.orchestratorNote = `Piano operativo "${plan.title}" attivato alle ${clock}. Monitoraggio decongestione in corso.`;
      }

      const existingAdvisory = cityState.advisories.find(
        (a) => a.zoneId === plan.zoneId && a.title === plan.title,
      );
      if (existingAdvisory) {
        existingAdvisory.guidance = plan.cityLifeMessage;
        existingAdvisory.alternativeRoute = plan.cityLifeAlternative;
        existingAdvisory.active = true;
        existingAdvisory.updatedAt = clock;
      } else {
        const newAdvisory: CityLifeAdvisory = {
          id: `adv-${Date.now()}`,
          zoneId: plan.zoneId,
          zoneName: plan.zoneName,
          title: plan.title,
          guidance: plan.cityLifeMessage,
          alternativeRoute: plan.cityLifeAlternative,
          category: plan.involvedAgents[0] ?? 'mobility',
          active: true,
          updatedAt: clock,
          estimatedReach: 2450,
        };
        cityState.advisories.unshift(newAdvisory);
      }
    }

    cityState.updatedAt = clock;
    res.json(cityState);
  });

  app.post('/api/plans/from-simulation', (req, res) => {
    const {
      simulation,
      approveImmediately,
    } = req.body as {
      simulation: WhatIfSimulationResult;
      approveImmediately?: boolean;
    };

    if (!simulation?.recommendedPlan) {
      res.status(400).json({ error: 'Dati di simulazione non validi.' });
      return;
    }

    const clock = nowClock();
    const matchedZone =
      cityState.zones.find((z) => z.id === simulation.recommendedPlan.zoneId) ??
      cityState.zones[0];

    const newPlan: ActionPlan = {
      id: `plan-sim-${Date.now()}`,
      title: simulation.recommendedPlan.title,
      zoneId: matchedZone.id,
      zoneName: matchedZone.name,
      triggerSummary: simulation.scenarioSummary,
      involvedAgents: simulation.agentImpacts
        .filter((a) => a.severity !== 'regular')
        .map((a) => a.domain),
      steps: simulation.recommendedPlan.steps,
      estimatedImpact: simulation.recommendedPlan.estimatedImpact,
      cityLifeMessage: simulation.cityLifeDraft.guidance,
      cityLifeAlternative: simulation.cityLifeDraft.alternativeRoute,
      priority: simulation.overallRisk,
      status: approveImmediately ? 'approved' : 'pending',
      createdAt: clock,
      updatedAt: clock,
      operatorNote: approveImmediately
        ? 'Generato da simulazione What-If e approvato immediatamente.'
        : 'Generato da simulazione What-If in attesa di validazione PA.',
    };

    if (newPlan.involvedAgents.length === 0) {
      newPlan.involvedAgents = ['mobility', 'tourism'];
    }

    cityState.plans.unshift(newPlan);

    if (approveImmediately) {
      const newAdvisory: CityLifeAdvisory = {
        id: `adv-sim-${Date.now()}`,
        zoneId: matchedZone.id,
        zoneName: matchedZone.name,
        title: simulation.cityLifeDraft.title,
        guidance: simulation.cityLifeDraft.guidance,
        alternativeRoute: simulation.cityLifeDraft.alternativeRoute,
        category: newPlan.involvedAgents[0],
        active: true,
        updatedAt: clock,
        estimatedReach: 3100,
      };
      cityState.advisories.unshift(newAdvisory);
    }

    cityState.updatedAt = clock;
    res.json({ state: cityState, planId: newPlan.id });
  });

  app.post('/api/advisories', (req, res) => {
    const {
      id,
      toggle,
      zoneId,
      title,
      guidance,
      alternativeRoute,
      category,
    } = req.body as {
      id?: string;
      toggle?: boolean;
      zoneId?: string;
      title?: string;
      guidance?: string;
      alternativeRoute?: string;
      category?: CityLifeAdvisory['category'];
    };

    const clock = nowClock();

    if (id && toggle) {
      const adv = cityState.advisories.find((a) => a.id === id);
      if (!adv) {
        res.status(404).json({ error: 'Avviso City Life non trovato.' });
        return;
      }
      adv.active = !adv.active;
      adv.updatedAt = clock;
      cityState.updatedAt = clock;
      res.json(cityState);
      return;
    }

    if (!zoneId || !title?.trim() || !guidance?.trim()) {
      res.status(400).json({
        error: 'Compila zona, titolo e messaggio operativo per pubblicare su City Life.',
      });
      return;
    }

    const zone = cityState.zones.find((z) => z.id === zoneId) ?? cityState.zones[0];
    const newAdvisory: CityLifeAdvisory = {
      id: `adv-${Date.now()}`,
      zoneId: zone.id,
      zoneName: zone.name,
      title: title.trim(),
      guidance: guidance.trim(),
      alternativeRoute:
        alternativeRoute?.trim() || 'Consulta la mappa City Life per percorsi aggiornati',
      category: category ?? 'mobility',
      active: true,
      updatedAt: clock,
      estimatedReach: 1950,
    };

    cityState.advisories.unshift(newAdvisory);
    cityState.updatedAt = clock;
    res.json(cityState);
  });

  app.post('/api/orchestrator/simulate', async (req, res) => {
    const {
      scenario,
      horizon,
      intensity,
      targetZone,
      eventType,
      constraints,
    } = req.body as WhatIfSimulationRequest;
    if (!scenario?.trim()) {
      res.status(400).json({ error: 'Inserisci la descrizione dello scenario da simulare.' });
      return;
    }

    try {
      const ai = getGeminiClient();

      const zonesContext = cityState.zones
        .map(
          (z) =>
            `- id: "${z.id}", nome: "${z.name}", stato attuale: ${z.status}, affollamento: ${z.crowdIndex}%, traffico: ${z.trafficLoad}%`,
        )
        .join('\n');

      const selectedZoneLabel =
        targetZone && targetZone !== 'all'
          ? cityState.zones.find((z) => z.id === targetZone)?.name ?? targetZone
          : 'Intera area metropolitana / Multizona';

      const prompt = `Sei l'agente centrale Orchestrator di "Napoli Agentic City - City Control", la cabina di regia della Pubblica Amministrazione del Comune di Napoli.
Analizza il seguente scenario What-If impostato dall'operatore comunale:

Area / Zona principale: ${selectedZoneLabel}
Tipologia evento: ${eventType || 'Scenario operativo personalizzato'}
Descrizione scenario: ${scenario.trim()}
Vincoli e parametri operativi aggiuntivi: ${constraints?.trim() || 'Nessun vincolo specifico indicato'}
Orizzonte temporale: ${horizon || 'Prossime 3 ore'}
Intensità stimata: ${intensity || 'high'}

Contesto attuale delle zone monitorate di Napoli:
${zonesContext}

Genera un'analisi predittiva rigorosa, operativa e realistica per la città di Napoli (citando strade, linee metro L1/L2/L6, funicolari, ANM o luoghi reali pertinenti) in lingua italiana, valutando gli effetti a catena sui 5 agenti specializzati (mobility, tourism, safety, environment, services), individuando le zone a rischio e proponendo un piano coordinato per la PA più una bozza di comunicazione per i cittadini sull'app City Life.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Rispondi esclusivamente con dati JSON conformi allo schema, usando un tono istituzionale italiano chiaro, sintetico e operativo adatto a operatori comunali.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scenarioSummary: {
                type: Type.STRING,
                description: 'Sintesi chiara e operativa dello scenario simulato in 1-2 frasi.',
              },
              overallRisk: {
                type: Type.STRING,
                description: 'Valore esattamente tra: regular, attention, critical',
              },
              timeHorizon: {
                type: Type.STRING,
                description: 'Orizzonte temporale analizzato.',
              },
              affectedZones: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    zoneName: { type: Type.STRING },
                    risk: {
                      type: Type.STRING,
                      description: 'Valore esattamente tra: regular, attention, critical',
                    },
                    reason: { type: Type.STRING },
                  },
                },
              },
              agentImpacts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    domain: {
                      type: Type.STRING,
                      description:
                        'Valore esattamente tra: mobility, tourism, safety, environment, services',
                    },
                    agentName: { type: Type.STRING },
                    severity: {
                      type: Type.STRING,
                      description: 'Valore esattamente tra: regular, attention, critical',
                    },
                    forecast: { type: Type.STRING },
                  },
                },
              },
              recommendedPlan: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  zoneId: {
                    type: Type.STRING,
                    description:
                      'ID della zona più colpita scelto tra: plebiscito, porto, centro-storico, garibaldi, lungomare, vomero, fuorigrotta',
                  },
                  zoneName: { type: Type.STRING },
                  steps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  estimatedImpact: { type: Type.STRING },
                },
              },
              cityLifeDraft: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  guidance: { type: Type.STRING },
                  alternativeRoute: { type: Type.STRING },
                },
              },
            },
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText) as WhatIfSimulationResult;

      const normalizeSeverity = (val: string | undefined) =>
        val === 'critical' || val === 'attention' || val === 'regular' ? val : 'attention';

      parsed.overallRisk = normalizeSeverity(parsed.overallRisk);
      parsed.affectedZones = (parsed.affectedZones ?? []).map((z) => ({
        ...z,
        risk: normalizeSeverity(z.risk),
      }));
      parsed.agentImpacts = (parsed.agentImpacts ?? []).map((a) => ({
        ...a,
        severity: normalizeSeverity(a.severity),
      }));

      res.json(parsed);
    } catch (err) {
      console.error('Errore simulazione Gemini:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'Errore imprevisto durante la simulazione What-If con Orchestrator.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Napoli City Control server attivo su http://localhost:${port}`);
  });
}

startServer();
