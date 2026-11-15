import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import {
  BookingRecord,
  CITY_SCENARIOS,
  CivicReport,
  NAPLES_PLACES,
} from './src/data/naplesData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

// In-memory state for City Control <-> City Life synchronization
let activeScenarioId: string = CITY_SCENARIOS[0].id;
const civicReports: CivicReport[] = [
  {
    id: 'rep-seed-1',
    category: 'affollamento',
    zone: 'Piazza del Plebiscito',
    description: 'Forte afflusso pedonale verso Palazzo Reale e imbocco Via Acton.',
    hasPhoto: false,
    createdAt: '16:34',
    status: 'correlated',
  },
];

const bookings: BookingRecord[] = [];

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
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
  app.use(express.json({ limit: '2mb' }));

  // Safe browser config for Maps JS APIProvider
  app.get('/api/maps-config', (_req, res) => {
    const apiKey =
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      '';
    res.json({ apiKey });
  });

  // Live City Control <-> City Life Orchestrator State
  app.get('/api/city-state', (_req, res) => {
    const activeScenario =
      CITY_SCENARIOS.find((s) => s.id === activeScenarioId) ?? CITY_SCENARIOS[0];
    res.json({
      activeScenario,
      scenarios: CITY_SCENARIOS,
      reports: civicReports,
      bookings,
      airQuality: {
        status: 'Buona',
        statusEn: 'Good',
        aqi: 28,
        note: 'Nessuna limitazione alla circolazione',
        noteEn: 'No traffic restrictions active',
        source: 'ARPAC · ore 14:00',
      },
    });
  });

  // Switch active City Control scenario (simulates municipal/agent event pushing to City Life)
  app.post('/api/city-control/scenario', (req, res) => {
    const { scenarioId } = req.body as { scenarioId?: string };
    const found = CITY_SCENARIOS.find((s) => s.id === scenarioId);
    if (!found) {
      return res.status(404).json({ error: 'Scenario non trovato.' });
    }
    activeScenarioId = found.id;
    return res.json({ activeScenario: found });
  });

  // Submit anonymous citizen report -> updates Orchestrator & City Control feed
  app.post('/api/reports', (req, res) => {
    const { category, zone, description, hasPhoto } = req.body as {
      category?: CivicReport['category'];
      zone?: string;
      description?: string;
      hasPhoto?: boolean;
    };

    if (!category || !zone || !description?.trim()) {
      return res.status(400).json({ error: 'Compila categoria, zona e descrizione.' });
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newReport: CivicReport = {
      id: `rep-${Date.now()}`,
      category,
      zone,
      description: description.trim().slice(0, 280),
      hasPhoto: Boolean(hasPhoto),
      createdAt: timeStr,
      status: 'correlated',
    };

    civicReports.unshift(newReport);

    // Correlate report with matching scenario if applicable
    if (zone.toLowerCase().includes('plebiscito')) {
      activeScenarioId = 'plebiscito-congestion';
    } else if (
      (zone.toLowerCase().includes('toledo') || zone.toLowerCase().includes('garibaldi')) &&
      category === 'disservizio'
    ) {
      activeScenarioId = 'linea1-works';
    } else if (zone.toLowerCase().includes('maradona') || zone.toLowerCase().includes('fuorigrotta')) {
      activeScenarioId = 'maradona-match';
    } else if (zone.toLowerCase().includes('beverello') || zone.toLowerCase().includes('porto')) {
      activeScenarioId = 'cruise-arrival';
    }

    const activeScenario =
      CITY_SCENARIOS.find((s) => s.id === activeScenarioId) ?? CITY_SCENARIOS[0];

    return res.status(201).json({
      report: newReport,
      activeScenario,
      reports: civicReports,
    });
  });

  // Bookings & municipal counter appointments
  app.get('/api/bookings', (_req, res) => {
    res.json({ bookings });
  });

  app.post('/api/bookings', (req, res) => {
    const { placeId, date, timeSlot, guests } = req.body as {
      placeId?: string;
      date?: string;
      timeSlot?: string;
      guests?: number;
    };

    const place = NAPLES_PLACES.find((p) => p.id === placeId);
    if (!place || !place.bookable) {
      return res.status(400).json({ error: 'Servizio o prenotazione non disponibile.' });
    }

    const safeGuests = Math.max(1, Math.min(10, Number(guests || 1)));
    const totalEur = Number(((place.priceEur ?? 0) * safeGuests).toFixed(2));
    const code = `NP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${String(Date.now()).slice(-3)}`;

    const record: BookingRecord = {
      id: `bkg-${Date.now()}`,
      code,
      placeId: place.id,
      placeName: place.name,
      bookingType: place.bookingType ?? 'ticket',
      date: date || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || '10:30',
      guests: safeGuests,
      totalEur,
      createdAt: new Date().toISOString(),
    };

    bookings.unshift(record);
    return res.status(201).json({ booking: record, bookings });
  });

  // Server-side Gemini AI Assistant grounded in live Napoli Agentic City state
  app.post('/api/assistant/chat', async (req, res) => {
    const { message, profile = 'turista', lang = 'IT', history = [] } = req.body as {
      message?: string;
      profile?: 'turista' | 'residente';
      lang?: 'IT' | 'EN';
      history?: { role: 'user' | 'model'; text: string }[];
    };

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Messaggio vuoto.' });
    }

    const activeScenario =
      CITY_SCENARIOS.find((s) => s.id === activeScenarioId) ?? CITY_SCENARIOS[0];

    const placesContext = NAPLES_PLACES.map(
      (p) =>
        `- ${p.id}: ${p.name} (${p.zone}, ${p.category}/${p.kind}) | Affollamento: ${p.crowdPercent}% (${p.crowdLevel}), attesa ${p.waitTimeMin} min | Orari: ${p.hours} | Accessibile: ${p.accessible ? 'Sì' : 'No'} | Fonte: ${p.source}`
    ).join('\n');

    const systemInstruction = `Sei l'assistente amichevole e semplicissimo da capire di "Napoli Pulse · City Life", pensato per l'utente medio (cittadini e turisti).
Lingua richiesta: ${lang === 'EN' ? 'Inglese' : 'Italiano'}.
Profilo utente attivo: ${profile === 'residente' ? 'Residente' : 'Turista'}.

STATO LIVE DA ORCHESTRATOR & CITY CONTROL:
- Criticità attiva: ${activeScenario.title} (${activeScenario.zone}) · Fascia oraria: ${activeScenario.timeWindow} · Motivo: ${activeScenario.reason}
- Mobility Agent: ${activeScenario.mobilitySignal}
- Tourism Agent: ${activeScenario.tourismSignal}
- Azione City Control: ${activeScenario.cityControlAction}
- Percorso alternativo consigliato: da "${activeScenario.alternativeRoute.originName}" a "${activeScenario.alternativeRoute.destinationName}" (${activeScenario.alternativeRoute.mode}, ${activeScenario.alternativeRoute.durationMin} min). ${activeScenario.alternativeRoute.note}
- Sezioni disponibili in app: "Mobilità" (aree bloccate o con troppa folla, chiusura Metro Linea 1 15:00–21:00, parcheggio ANM Brin), "Servizi" (Comune di Napoli Palazzo San Giacomo, Questura di Napoli, farmacie di turno, ospedale, isola ecologica ASIA, sportello TARI), "Prenotazioni" (attrazioni e monumenti prenotabili: Capodimonte, Certosa di San Martino, Palazzo Reale, Castel Sant'Elmo, Gallerie d'Italia, Napoli Sotterranea, e-bike, ristoranti).
- Qualità aria (ARPAC): Buona (AQI 28), nessuna limitazione.
- Segnalazioni anonime recenti: ${civicReports.slice(0, 3).map((r) => `${r.zone}: ${r.description}`).join(' | ')}

LUOGHI E SERVIZI MONITORATI IN TEMPO REALE:
${placesContext}

REGOLE DI RISPOSTA:
1. Sii conciso, pratico e preciso (massimo 3-4 frasi chiare), orientato all'azione sulla mappa.
2. Cita sempre le fonti reali pertinenti nel campo "sources" (es. "ANM, Comune di Napoli", "Tourism Agent, MiC", "Polizia di Stato", "ARPAC").
3. Se l'utente chiede come evitare la folla o un itinerario tranquillo, raccomanda attrazioni e monumenti a bassa affluenza (Capodimonte 18%, Castel Sant'Elmo 20%, Certosa di San Martino 22%, Gallerie d'Italia 24%).
4. Se pertinente, valorizza un'azione concreta su mappa nel campo "actionType" ("route" | "itinerary" | "service" | "none").`;

    const ai = getGeminiClient();

    if (!ai) {
      return res.status(500).json({
        error:
          lang === 'EN'
            ? 'Gemini API key is not configured on the server.'
            : 'Chiave API Gemini non configurata sul server.',
      });
    }

    try {
      const recentContext = history
        .slice(-4)
        .map((h) => `${h.role === 'user' ? 'Utente' : 'Assistente'}: ${h.text}`)
        .join('\n');

      const prompt = recentContext
        ? `Conversazione recente:\n${recentContext}\n\nNuova domanda utente: ${message}`
        : message;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: 'Risposta chiara e concisa nella lingua richiesta.',
              },
              sources: {
                type: Type.STRING,
                description: 'Fonti ufficiali citate separate da virgola (es. ANM, Comune di Napoli).',
              },
              followUpChips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2 o 3 suggerimenti brevi di follow-up per l’utente.',
              },
              actionType: {
                type: Type.STRING,
                description: 'Opzionale: "route" | "itinerary" | "service" | "none"',
              },
              actionLabel: {
                type: Type.STRING,
                description: 'Etichetta breve del pulsante azione sulla mappa (es. "Mostra percorso").',
              },
              originText: {
                type: Type.STRING,
                description: 'Se actionType è "route", indirizzo/luogo partenza a Napoli.',
              },
              destinationText: {
                type: Type.STRING,
                description: 'Se actionType è "route", indirizzo/luogo destinazione a Napoli.',
              },
              placeId: {
                type: Type.STRING,
                description: 'Se actionType è "service", id di uno dei luoghi monitorati.',
              },
            },
            required: ['reply', 'sources', 'followUpChips'],
          },
        },
      });

      const raw = (response.text ?? '{}').trim();
      const parsed = JSON.parse(raw);
      return res.json(parsed);
    } catch (err: any) {
      console.error('Gemini assistant error:', err);
      const msg = err?.message || 'Errore nella comunicazione con l’assistente AI.';
      return res.status(err?.status === 429 ? 429 : 500).json({ error: msg });
    }
  });

  // Vite dev middleware or static production build
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Napoli Pulse · City Life server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
