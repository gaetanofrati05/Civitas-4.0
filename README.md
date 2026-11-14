Napoli4FUTURE
Un ecosistema di agenti intelligenti che trasforma Napoli in una città capace di prevedere i problemi, coordinare i servizi e reagire in tempo reale.
Partecipanti
[Nome Cognome]
[Nome Cognome]
[Nome Cognome]
Il progetto
Napoli è una delle mete turistiche più visitate d'Italia, e in certe giornate deve gestire tutto insieme: due navi da crociera in porto, una partita allo stadio, un evento sul lungomare e, magari, un guasto alla metropolitana. Il problema non è solo il numero di persone: è l'effetto domino. Se la metro si ferma, aumentano autobus e taxi, il traffico rallenta e i turisti arrivano più lentamente alle attrazioni.
La nostra idea è un sistema di agenti AI che collaborano: ciascuno si occupa di un servizio (mobilità, turismo, sicurezza, ambiente, servizi pubblici), e un agente orchestratore li coordina e propone soluzioni quando la situazione cambia. Il sistema ha due volti:
City Control, per il Comune e la sala operativa, che aiuta a prendere decisioni coordinate in pochi minuti;
City Life, per cittadini e turisti, che li aiuta a trovare percorsi, servizi e alternative in tempo reale.
Cosa abbiamo fatto
Abbiamo realizzato un prototipo dimostrativo delle due applicazioni, che mostra come un'informazione prodotta dagli agenti diventi una decisione per il Comune e, subito dopo, un avviso utile per chi si trova in città. Il prototipo segue uno scenario concreto: un sabato con crocieristi e partita, mentre la Linea 1 della metropolitana si guasta.
Come funziona City Control
City Control è la plancia di comando dell'operatore comunale. Permette di:
Vedere la città: una mappa delle zone principali (Piazza del Plebiscito, Porto, Centro storico, Garibaldi, Lungomare, Vomero, Fuorigrotta) con il loro stato (regolare, attenzione, critico), l'affollamento e il traffico.
Seguire gli agenti: i cinque agenti (Mobilità, Turismo, Sicurezza, Ambiente, Servizi pubblici) mostrano su cosa stanno lavorando.
Decidere sui piani: l'Orchestrator propone piani d'intervento coordinati e l'operatore li approva, li modifica o li rifiuta. La decisione finale spetta sempre a una persona.
Simulare scenari (What-If): l'operatore descrive una situazione, per esempio "la metro resta ferma altre due ore", e il sistema indica le zone a rischio, gli effetti su ogni agente, un piano consigliato e una bozza di avviso per i cittadini.
Collegarsi a City Life: gli avvisi approvati vengono pubblicati su City Life, e l'operatore vede segnali aggregati e anonimi, senza dati individuali.
Come funziona City Life
City Life è l'app per cittadini e turisti. Si usa anche senza registrarsi, e parte da una mappa familiare, in stile Google Maps, arricchita da livelli informativi (Trasporti, Eventi, Affollamento, Ristoranti e servizi) e da un assistente AI.
Si chiede in modo naturale: per esempio "Vorrei visitare Napoli, ma non voglio trovare luoghi troppo affollati".
Arriva l'avviso giusto: quando il Comune approva un piano, l'utente vede un avviso (per esempio "linea metro interrotta e forte affollamento su Via Toledo") insieme a un itinerario alternativo più fluido.
Si passa dall'informazione all'azione: dalla mappa si possono scegliere le tappe alternative e ricevere indicazioni sui servizi vicini.
Un prototipo, non un prodotto finito
Il lavoro è una prima bozza pensata per far capire l'idea. In particolare:
i dati sono simulati e non provengono da sistemi reali (trasporti, porto, eventi);
l'Orchestrator è basato su un modello linguistico (LLM): le simulazioni sono stime generate dall'AI, non calcoli numerici;
il resto, cioè agenti come servizi indipendenti, database, scambio di messaggi tra i servizi e motore di simulazione, è descritto come architettura target nella documentazione di progetto.

@import "tailwindcss";

@layer base {
  :root {
    --n4f-navy: #032B62;
    --n4f-navy-deep: #021D42;
    --n4f-azure: #0088DB;
    --n4f-orange: #FF8200;
    --n4f-amber: #FFB800;
    --n4f-canvas: #F5F8FC;
    --n4f-surface: #FFFFFF;
    --n4f-border: #D9E4F2;
    --n4f-ink: #0F2342;
    --n4f-ink-muted: #465B7A;
  }

  html {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--n4f-ink);
    background-color: var(--n4f-canvas);
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3 {
    font-family: 'Outfit', sans-serif;
  }
}

.n4f-display {
  font-family: 'Outfit', sans-serif;
}

.n4f-grid-pattern {
  background-image:
    radial-gradient(circle at 1px 1px, rgba(3, 43, 98, 0.08) 1px, transparent 0);
  background-size: 24px 24px;
}

img.n4f-optional-img:not([src]),
img.n4f-optional-img[src=""] {
  display: none;
}
