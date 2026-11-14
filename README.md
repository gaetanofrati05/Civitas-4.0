<h1>Napoli4FUTURE</h1>

<p><strong>Un ecosistema di agenti intelligenti che trasforma Napoli in una città capace di prevedere i problemi, coordinare i servizi e reagire in tempo reale.</strong></p>

<h2>Partecipanti</h2>
<ul>
  <li>[Nome Cognome]</li>
  <li>[Nome Cognome]</li>
  <li>[Nome Cognome]</li>
</ul>

<h2>Il progetto</h2>
<p>Napoli è una delle mete turistiche più visitate d'Italia, e in certe giornate deve gestire tutto insieme: due navi da crociera in porto, una partita allo stadio, un evento sul lungomare e, magari, un guasto alla metropolitana. Il problema non è solo il numero di persone: è l'effetto domino. Se la metro si ferma, aumentano autobus e taxi, il traffico rallenta e i turisti arrivano più lentamente alle attrazioni.</p>
<p>La nostra idea è un sistema di agenti AI che collaborano: ciascuno si occupa di un servizio (mobilità, turismo, sicurezza, ambiente, servizi pubblici), e un agente orchestratore li coordina e propone soluzioni quando la situazione cambia. Il sistema ha due volti:</p>
<ul>
  <li><strong>City Control</strong>, per il Comune e la sala operativa, che aiuta a prendere decisioni coordinate in pochi minuti;</li>
  <li><strong>City Life</strong>, per cittadini e turisti, che li aiuta a trovare percorsi, servizi e alternative in tempo reale.</li>
</ul>

<h2>Cosa abbiamo fatto</h2>
<p>Abbiamo realizzato un prototipo dimostrativo delle due applicazioni, che mostra come un'informazione prodotta dagli agenti diventi una decisione per il Comune e, subito dopo, un avviso utile per chi si trova in città. Il prototipo segue uno scenario concreto: un sabato con crocieristi e partita, mentre la Linea 1 della metropolitana si guasta.</p>

<h2>Come funziona City Control</h2>
<p>City Control è la plancia di comando dell'operatore comunale. Permette di:</p>
<ul>
  <li><strong>Vedere la città:</strong> una mappa delle zone principali (Piazza del Plebiscito, Porto, Centro storico, Garibaldi, Lungomare, Vomero, Fuorigrotta) con il loro stato (regolare, attenzione, critico), l'affollamento e il traffico.</li>
  <li><strong>Seguire gli agenti:</strong> i cinque agenti (Mobilità, Turismo, Sicurezza, Ambiente, Servizi pubblici) mostrano su cosa stanno lavorando.</li>
  <li><strong>Decidere sui piani:</strong> l'Orchestrator propone piani d'intervento coordinati e l'operatore li approva, li modifica o li rifiuta. La decisione finale spetta sempre a una persona.</li>
  <li><strong>Simulare scenari (What-If):</strong> l'operatore descrive una situazione, per esempio "la metro resta ferma altre due ore", e il sistema indica le zone a rischio, gli effetti su ogni agente, un piano consigliato e una bozza di avviso per i cittadini.</li>
  <li><strong>Collegarsi a City Life:</strong> gli avvisi approvati vengono pubblicati su City Life, e l'operatore vede segnali aggregati e anonimi, senza dati individuali.</li>
</ul>

<h2>Come funziona City Life</h2>
<!-- DA VERIFICARE: descrizione basata sullo scenario del progetto, non sul codice di City Life. Adatta le frasi a ciò che il prototipo fa davvero. -->
<p>City Life è l'app per cittadini e turisti. Si usa anche senza registrarsi, e parte da una mappa familiare, in stile Google Maps, arricchita da livelli informativi (Trasporti, Eventi, Affollamento, Ristoranti e servizi) e da un assistente AI.</p>
<ul>
  <li><strong>Si chiede in modo naturale:</strong> per esempio "Vorrei visitare Napoli, ma non voglio trovare luoghi troppo affollati".</li>
  <li><strong>Arriva l'avviso giusto:</strong> quando il Comune approva un piano, l'utente vede un avviso (per esempio "linea metro interrotta e forte affollamento su Via Toledo") insieme a un itinerario alternativo più fluido.</li>
  <li><strong>Si passa dall'informazione all'azione:</strong> dalla mappa si possono scegliere le tappe alternative e ricevere indicazioni sui servizi vicini.</li>
</ul>

<h2>Un prototipo, non un prodotto finito</h2>
<p>Il lavoro è una prima bozza pensata per far capire l'idea. In particolare:</p>
<ul>
  <li>i dati sono <strong>simulati</strong> e non provengono da sistemi reali (trasporti, porto, eventi);</li>
  <li>l'Orchestrator è basato su un <strong>modello linguistico (LLM)</strong>: le simulazioni sono stime generate dall'AI, non calcoli numerici;</li>
  <li>il resto, cioè agenti come servizi indipendenti, database, scambio di messaggi tra i servizi e motore di simulazione, è descritto come <strong>architettura target</strong> nella documentazione di progetto.</li>
</ul>
