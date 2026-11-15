import { FormEvent, useState } from 'react';
import { Lang, UI_COPY, UserProfile } from '../data/naplesData';
import { Compass, Navigation, PhoneCall, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: string;
  actionType?: string;
  actionLabel?: string;
  originText?: string;
  destinationText?: string;
  placeId?: string;
  followUpChips?: string[];
}

interface AssistantViewProps {
  lang: Lang;
  profile: UserProfile;
  onActionRoute: (origin: string, destination: string) => void;
  onActionItinerary: () => void;
  onActionPlace: (placeId: string) => void;
}

export function AssistantView({
  lang,
  profile,
  onActionRoute,
  onActionItinerary,
  onActionPlace,
}: AssistantViewProps) {
  const t = UI_COPY[lang];
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operatorNotice, setOperatorNotice] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'seed-user',
      role: 'user',
      text:
        lang === 'EN'
          ? 'How do I get to the port if the metro is closed?'
          : 'Come arrivo al porto se la metro è chiusa?',
    },
    {
      id: 'seed-model',
      role: 'model',
      text:
        lang === 'EN'
          ? 'On foot in about 20 minutes from Via Toledo, or with ANM replacement shuttles from Piazza Municipio. Would you like me to show the step-free route?'
          : 'A piedi in circa 20 minuti da via Toledo, oppure con i bus sostitutivi indicati da ANM. Vuoi il percorso?',
      sources: 'ANM, Comune di Napoli',
      actionType: 'route',
      actionLabel: lang === 'EN' ? 'Show route' : 'Mostra percorso',
      originText: 'Via Toledo, Napoli',
      destinationText: 'Molo Beverello, Napoli',
      followUpChips:
        lang === 'EN'
          ? [
              'I want to visit Naples without crowds',
              'Bus schedules to Capodimonte',
              'Nearest duty pharmacy',
            ]
          : [
              'Vorrei visitare Napoli senza trovare folla',
              'Orari bus per Capodimonte',
              'Farmacia di turno più vicina',
            ],
    },
  ]);

  const sendPrompt = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || loading) return;

    setError(null);
    setOperatorNotice(false);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          profile,
          lang,
          history: nextHistory.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Errore assistente');
      }

      const modelMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: data.reply,
        sources: data.sources,
        actionType: data.actionType,
        actionLabel: data.actionLabel,
        originText: data.originText,
        destinationText: data.destinationText,
        placeId: data.placeId,
        followUpChips: data.followUpChips,
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : lang === 'EN'
          ? 'Unable to reach assistant.'
          : 'Impossibile contattare l’assistente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendPrompt(input);
  };

  const handleMessageAction = (msg: ChatMessage) => {
    if (msg.actionType === 'itinerary') {
      onActionItinerary();
    } else if (msg.actionType === 'service' && msg.placeId) {
      onActionPlace(msg.placeId);
    } else {
      onActionRoute(
        msg.originText || 'Via Toledo, Napoli',
        msg.destinationText || 'Molo Beverello, Napoli'
      );
    }
  };

  const lastModelMsg = [...messages].reverse().find((m) => m.role === 'model');

  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            {t.askTitle}
          </h1>
          <span className="text-xs font-medium text-slate-500">
            Orchestrator IA
          </span>
        </div>

        {/* Message Feed */}
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[92%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-50 text-slate-900 border border-blue-100'
                    : 'bg-white text-slate-800 border border-slate-200'
                }`}
              >
                <p>{msg.text}</p>

                {msg.role === 'model' && msg.sources && (
                  <p className="mt-2 text-xs text-slate-500">
                    {lang === 'EN' ? 'Sources:' : 'Fonti:'} {msg.sources}
                  </p>
                )}

                {msg.role === 'model' &&
                  msg.actionType &&
                  msg.actionType !== 'none' && (
                    <button
                      type="button"
                      onClick={() => handleMessageAction(msg)}
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-800 whitespace-nowrap"
                    >
                      {msg.actionType === 'itinerary' ? (
                        <Compass className="h-3.5 w-3.5" />
                      ) : (
                        <Navigation className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {msg.actionLabel ||
                          (lang === 'EN' ? 'Show on map' : 'Mostra sulla mappa')}
                      </span>
                    </button>
                  )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-500">
              {lang === 'EN'
                ? 'Querying Mobility & Tourism Agents...'
                : 'Consulto Mobility Agent e Tourism Agent...'}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
              {error}
            </div>
          )}

          {operatorNotice && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-xs text-blue-900">
              {lang === 'EN'
                ? 'Municipal Info Desk Napoli: +39 081 795 1111 (Mon–Sat 08:00–20:00) · ANM Mobility Desk active.'
                : 'Sportello Operatore Comune di Napoli: 081 795 1111 (Lun–Sab 08:00–20:00) · Presidio ANM attivo.'}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500">{t.askDisclaimer}</p>

        {/* Suggested Follow-Up Action Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {(lastModelMsg?.followUpChips ?? []).map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => void sendPrompt(chip)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left text-xs text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-800"
            >
              {chip}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOperatorNotice(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-50"
          >
            <PhoneCall className="h-3 w-3 text-slate-500" />
            <span>
              {lang === 'EN' ? 'Talk to an operator' : 'Parla con un operatore'}
            </span>
          </button>
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 focus-within:border-blue-600"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.askPlaceholder}
          className="flex-1 bg-transparent px-2.5 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label={lang === 'EN' ? 'Send' : 'Invia'}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white transition-colors hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
