export type UserProfile = 'turista' | 'residente';
export type Lang = 'IT' | 'EN';
export type TransportMode = 'WALKING' | 'BUS' | 'METRO' | 'FERRY';
export type NavTab = 'home' | 'map' | 'services' | 'ask' | 'report';
export type CrowdLevel = 'low' | 'medium' | 'high';

export type PlaceKind =
  | 'attraction'
  | 'monument'
  | 'blocked_zone'
  | 'municipal_office'
  | 'police_questura'
  | 'pharmacy_health'
  | 'parking_transit'
  | 'waste_point'
  | 'public_counter'
  | 'museum_ticket'
  | 'guided_tour'
  | 'restaurant'
  | 'bike_rental'
  | 'experience';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface NaplesPlace {
  id: string;
  name: string;
  nameEn: string;
  category: 'mobility' | 'citizen_service' | 'commerce';
  kind: PlaceKind;
  zone: string;
  address: string;
  position: LatLng;
  crowdLevel: CrowdLevel;
  crowdPercent: number;
  waitTimeMin: number;
  hours: string;
  hoursEn: string;
  priceEur?: number;
  priceLabel?: string;
  priceLabelEn?: string;
  accessible: boolean;
  bookable: boolean;
  bookingType?: 'ticket' | 'tour' | 'table' | 'bike' | 'counter' | 'experience';
  description: string;
  descriptionEn: string;
  source: string;
  imageKey?: 'capodimonte' | 'plebiscito' | 'san_martino' | 'lungomare_ebike';
}

export interface RoutePreset {
  id: string;
  label: string;
  labelEn: string;
  originName: string;
  destinationName: string;
  origin: LatLng;
  destination: LatLng;
  recommendedMode: TransportMode;
  recommendedDeparture: string;
  durationMin: number;
  distanceKm: number;
  stepFreeAvailable: boolean;
  crowdSafe: boolean;
  advisory?: string;
  advisoryEn?: string;
  sources: string;
}

export interface CityScenario {
  id: string;
  title: string;
  titleEn: string;
  zone: string;
  timeWindow: string;
  timeWindowEn: string;
  reason: string;
  reasonEn: string;
  center: LatLng;
  radiusMeters: number;
  severity: 'warning' | 'critical';
  mobilitySignal: string;
  mobilitySignalEn: string;
  tourismSignal: string;
  tourismSignalEn: string;
  orchestratorSummary: string;
  orchestratorSummaryEn: string;
  cityControlAction: string;
  cityControlActionEn: string;
  cityLifeAlert: string;
  cityLifeAlertEn: string;
  alternativeRoute: {
    originName: string;
    destinationName: string;
    origin: LatLng;
    destination: LatLng;
    mode: TransportMode;
    durationMin: number;
    note: string;
    noteEn: string;
  };
  updatedAt: string;
  sources: string;
}

export interface CivicReport {
  id: string;
  category: 'affollamento' | 'disservizio' | 'danno' | 'altro';
  zone: string;
  description: string;
  hasPhoto: boolean;
  createdAt: string;
  status: 'received' | 'correlated';
}

export interface BookingRecord {
  id: string;
  code: string;
  placeId: string;
  placeName: string;
  bookingType: string;
  date: string;
  timeSlot: string;
  guests: number;
  totalEur: number;
  createdAt: string;
}

export interface PrivacySettings {
  preciseLocation: boolean;
  emergencyAlerts: boolean;
  personalizedSuggestions: boolean;
  accessibility: {
    stepFree: boolean;
    avoidCrowds: boolean;
    flatRoutes: boolean;
    audioDescriptions: boolean;
  };
}

export const NAPLES_CENTER: LatLng = { lat: 40.8415, lng: 14.2505 };

export const NAPLES_ZONES: { name: string; position: LatLng }[] = [
  { name: 'Via Toledo', position: { lat: 40.8424, lng: 14.2491 } },
  { name: 'Piazza del Plebiscito', position: { lat: 40.8358, lng: 14.2487 } },
  { name: 'Molo Beverello · Porto', position: { lat: 40.8376, lng: 14.2547 } },
  { name: 'Stazione Centrale · Garibaldi', position: { lat: 40.8522, lng: 14.2725 } },
  { name: 'Centro Storico · Spaccanapoli', position: { lat: 40.8493, lng: 14.2567 } },
  { name: 'Lungomare Caracciolo · Chiaia', position: { lat: 40.8312, lng: 14.2368 } },
  { name: 'Vomero · San Martino', position: { lat: 40.8435, lng: 14.236 } },
  { name: 'Capodimonte', position: { lat: 40.8672, lng: 14.2506 } },
  { name: 'Fuorigrotta · Stadio Maradona', position: { lat: 40.8279, lng: 14.1931 } },
];

export const NAPLES_PLACES: NaplesPlace[] = [
  // MOBILITÀ: aree bloccate, zone molto affollate, chiusure e parcheggi/hub
  {
    id: 'plebiscito',
    name: 'Area Piazza del Plebiscito & Via Acton (Affollata)',
    nameEn: 'Piazza del Plebiscito & Via Acton Area (Congested)',
    category: 'mobility',
    kind: 'blocked_zone',
    zone: 'Piazza del Plebiscito',
    address: 'Piazza del Plebiscito / Via Acton, Napoli',
    position: { lat: 40.8358, lng: 14.2487 },
    crowdLevel: 'high',
    crowdPercent: 88,
    waitTimeMin: 35,
    hours: 'Criticità attiva 16:00 – 19:30',
    hoursEn: 'Active alert 16:00 – 19:30',
    accessible: true,
    bookable: false,
    description:
      'Area ad alta densità pedonale (88%) e traffico bloccato su Via Acton. Consigliata deviazione verso Via Toledo o Lungomare.',
    descriptionEn:
      'High pedestrian density (88%) and blocked traffic on Via Acton. Bypass via Via Toledo or Seafront advised.',
    source: 'Mobility Agent · Tourism Agent',
    imageKey: 'plebiscito',
  },
  {
    id: 'san-gregorio',
    name: 'Via San Gregorio Armeno · Asse Spaccanapoli (Troppa folla)',
    nameEn: 'Via San Gregorio Armeno · Spaccanapoli (Overcrowded)',
    category: 'mobility',
    kind: 'blocked_zone',
    zone: 'Centro Storico · Spaccanapoli',
    address: 'Via San Gregorio Armeno, Napoli',
    position: { lat: 40.8505, lng: 14.2579 },
    crowdLevel: 'high',
    crowdPercent: 92,
    waitTimeMin: 40,
    hours: 'Flusso intenso 11:00 – 19:30',
    hoursEn: 'Heavy flow 11:00 – 19:30',
    accessible: false,
    bookable: false,
    description:
      'Senso unico pedonale temporaneo per sovraffollamento (92%). Preferire percorsi paralleli su Via Tribunali o Capodimonte.',
    descriptionEn:
      'Temporary one-way pedestrian flow due to overcrowding (92%). Prefer parallel streets or Capodimonte.',
    source: 'Mobility Agent · Polizia Locale',
  },
  {
    id: 'linea1-toledo-stop',
    name: 'Metro Linea 1 · Chiusura anticipata (15:00 – 21:00)',
    nameEn: 'Metro Line 1 · Early closure (15:00 – 21:00)',
    category: 'mobility',
    kind: 'blocked_zone',
    zone: 'Via Toledo',
    address: 'Stazione Toledo / Dante / Garibaldi, Napoli',
    position: { lat: 40.8424, lng: 14.2491 },
    crowdLevel: 'medium',
    crowdPercent: 64,
    waitTimeMin: 8,
    hours: 'Sospesa 15:00 – 21:00 per lavori',
    hoursEn: 'Suspended 15:00 – 21:00 for works',
    accessible: true,
    bookable: false,
    description:
      'Tratta metro chiusa anticipatamente dalle 15:00 alle 21:00 per manutenzione. Attivi bus sostitutivi ANM e percorso a piedi verso il Porto.',
    descriptionEn:
      'Metro line closed early 15:00–21:00 for maintenance. ANM replacement buses and walking route to Port active.',
    source: 'ANM · Comune di Napoli',
  },
  {
    id: 'maradona-ztl',
    name: 'Area Stadio Maradona · Piazzale Tecchio (ZTL & Folla)',
    nameEn: 'Maradona Stadium Area · Piazzale Tecchio (Restricted)',
    category: 'mobility',
    kind: 'blocked_zone',
    zone: 'Fuorigrotta · Stadio Maradona',
    address: 'Piazzale Vincenzo Tecchio, Napoli',
    position: { lat: 40.8279, lng: 14.1931 },
    crowdLevel: 'high',
    crowdPercent: 85,
    waitTimeMin: 25,
    hours: 'Blocco traffico 16:00 – 22:30',
    hoursEn: 'Traffic closure 16:00 – 22:30',
    accessible: true,
    bookable: false,
    description:
      'ZTL perimetrale attiva per partita alle 18:00; stazioni Linea 2 e Cumana molto affollate dalle 16:00.',
    descriptionEn:
      'Perimeter traffic restriction for 18:00 match; Line 2 and Cumana stations crowded from 16:00.',
    source: 'Comune di Napoli · ANM',
  },
  {
    id: 'parcheggio-brin',
    name: 'Parcheggio ANM Brin · Interscambio e Navetta',
    nameEn: 'ANM Brin Park & Ride · Shuttle',
    category: 'mobility',
    kind: 'parking_transit',
    zone: 'Stazione Centrale · Garibaldi',
    address: 'Via Benedetto Brin, Napoli',
    position: { lat: 40.8473, lng: 14.2815 },
    crowdLevel: 'low',
    crowdPercent: 32,
    waitTimeMin: 0,
    hours: '05:30 – 00:30',
    hoursEn: '05:30 – 00:30',
    priceEur: 2,
    priceLabel: '€2,00 / ora · 184 posti liberi',
    priceLabelEn: '€2.00 / hr · 184 spots free',
    accessible: true,
    bookable: false,
    description:
      'Parcheggio scambiatore con navetta ANM diretta verso Piazza Municipio e Molo Beverello per evitare aree bloccate.',
    descriptionEn:
      'Interchange parking with direct ANM shuttle to Piazza Municipio and Molo Beverello avoiding closed zones.',
    source: 'ANM · MaaS4Italy',
  },

  // PRENOTAZIONI: Attrazioni, monumenti, biglietti, visite guidate, ristoranti, bici, esperienze
  {
    id: 'capodimonte',
    name: 'Museo e Real Bosco di Capodimonte',
    nameEn: 'Capodimonte Museum & Royal Park',
    category: 'commerce',
    kind: 'museum_ticket',
    zone: 'Capodimonte',
    address: 'Via Miano 2, Napoli',
    position: { lat: 40.8672, lng: 14.2506 },
    crowdLevel: 'low',
    crowdPercent: 18,
    waitTimeMin: 5,
    hours: '08:30 – 19:30',
    hoursEn: '08:30 – 19:30',
    priceEur: 15,
    priceLabel: '€15,00 · Biglietto museo',
    priceLabelEn: '€15.00 · Museum ticket',
    accessible: true,
    bookable: true,
    bookingType: 'ticket',
    description:
      'Attrazione consigliata oggi: bassa affluenza (18%), 20 min in bus ANM. Acquista il biglietto salta-coda.',
    descriptionEn:
      'Recommended today: low crowding (18%), 20 min by ANM bus. Buy skip-the-line ticket.',
    source: 'Comune di Napoli · MiC',
    imageKey: 'capodimonte',
  },
  {
    id: 'san-martino',
    name: 'Certosa e Museo di San Martino',
    nameEn: 'Charterhouse & Museum of San Martino',
    category: 'commerce',
    kind: 'monument',
    zone: 'Vomero · San Martino',
    address: 'Largo San Martino 5, Napoli',
    position: { lat: 40.8435, lng: 14.2412 },
    crowdLevel: 'low',
    crowdPercent: 22,
    waitTimeMin: 5,
    hours: '08:30 – 18:30',
    hoursEn: '08:30 – 18:30',
    priceEur: 6,
    priceLabel: '€6,00 · Ingresso monumento',
    priceLabelEn: '€6.00 · Monument entry',
    accessible: true,
    bookable: true,
    bookingType: 'ticket',
    description:
      'Monumento con terrazza panoramica sul Golfo e chiostro storico. Alternativa tranquilla al centro.',
    descriptionEn:
      'Historic monument with Bay overlook and cloister. Quiet alternative to downtown.',
    source: 'Tourism Agent · MiC',
    imageKey: 'san_martino',
  },
  {
    id: 'palazzo-reale',
    name: 'Palazzo Reale di Napoli · Appartamenti Storici',
    nameEn: 'Royal Palace of Naples · Historic Apartments',
    category: 'commerce',
    kind: 'monument',
    zone: 'Piazza del Plebiscito',
    address: 'Piazza del Plebiscito 1, Napoli',
    position: { lat: 40.8361, lng: 14.2498 },
    crowdLevel: 'high',
    crowdPercent: 82,
    waitTimeMin: 25,
    hours: '09:00 – 20:00',
    hoursEn: '09:00 – 20:00',
    priceEur: 15,
    priceLabel: '€15,00 · Prenotazione fascia oraria',
    priceLabelEn: '€15.00 · Time-slot booking',
    accessible: true,
    bookable: true,
    bookingType: 'ticket',
    description:
      'Monumento simbolo in Piazza del Plebiscito. Prenota la fascia oraria per ridurre i tempi di attesa.',
    descriptionEn:
      'Iconic monument at Piazza del Plebiscito. Book a time slot to cut queue wait times.',
    source: 'MiC · Palazzo Reale',
  },
  {
    id: 'castel-santelmo',
    name: "Castel Sant'Elmo · Piazza d'Armi",
    nameEn: "Castel Sant'Elmo · Panoramic Fortress",
    category: 'commerce',
    kind: 'monument',
    zone: 'Vomero · San Martino',
    address: 'Via Tito Angelini 22, Napoli',
    position: { lat: 40.8439, lng: 14.2389 },
    crowdLevel: 'low',
    crowdPercent: 20,
    waitTimeMin: 0,
    hours: '08:30 – 19:30',
    hoursEn: '08:30 – 19:30',
    priceEur: 5,
    priceLabel: '€5,00 · Biglietto ingresso',
    priceLabelEn: '€5.00 · Entry ticket',
    accessible: true,
    bookable: true,
    bookingType: 'ticket',
    description:
      'Fortezza medievale con vista a 360° su Napoli e Vesuvio, accessibile con ascensore e poco affollata.',
    descriptionEn:
      'Medieval fortress with 360° Naples & Vesuvius views, lift-accessible and uncrowded.',
    source: 'MiC · Polo Museale',
  },
  {
    id: 'gallerie-italia',
    name: "Gallerie d'Italia · Palazzo Piacentini",
    nameEn: "Gallerie d'Italia · Palazzo Piacentini",
    category: 'commerce',
    kind: 'museum_ticket',
    zone: 'Via Toledo',
    address: 'Via Toledo 177, Napoli',
    position: { lat: 40.8404, lng: 14.2489 },
    crowdLevel: 'low',
    crowdPercent: 24,
    waitTimeMin: 0,
    hours: '10:00 – 19:00',
    hoursEn: '10:00 – 19:00',
    priceEur: 7,
    priceLabel: '€7,00 · Biglietto',
    priceLabelEn: '€7.00 · Ticket',
    accessible: true,
    bookable: true,
    bookingType: 'ticket',
    description:
      'Ultimo capolavoro di Caravaggio su Via Toledo, ingresso fluido senza code e percorso senza gradini.',
    descriptionEn:
      "Caravaggio's final masterpiece on Via Toledo. Smooth entry with zero queues and step-free access.",
    source: 'Tourism Agent',
  },
  {
    id: 'napoli-sotterranea',
    name: 'Napoli Sotterranea · Visita Guidata',
    nameEn: 'Naples Underground · Guided Tour',
    category: 'commerce',
    kind: 'guided_tour',
    zone: 'Centro Storico · Spaccanapoli',
    address: 'Piazza San Gaetano 68, Napoli',
    position: { lat: 40.8513, lng: 14.2566 },
    crowdLevel: 'medium',
    crowdPercent: 52,
    waitTimeMin: 10,
    hours: '10:00 – 18:00',
    hoursEn: '10:00 – 18:00',
    priceEur: 15,
    priceLabel: '€15,00 · Visita guidata',
    priceLabelEn: '€15.00 · Guided tour',
    accessible: false,
    bookable: true,
    bookingType: 'tour',
    description:
      'Prenotazione fascia oraria garantita con guida abilitata per evitare attese in piazza.',
    descriptionEn:
      'Guaranteed time-slot booking with licensed guide to avoid street queues.',
    source: 'Partner Locali · Turismo',
  },
  {
    id: 'lungomare-ebike',
    name: 'Napoli Bike Mobility · Noleggio Bici Lungomare',
    nameEn: 'Napoli Bike Mobility · Seafront Bike Rental',
    category: 'commerce',
    kind: 'bike_rental',
    zone: 'Lungomare Caracciolo · Chiaia',
    address: 'Via Partenope 38, Napoli',
    position: { lat: 40.8301, lng: 14.2462 },
    crowdLevel: 'low',
    crowdPercent: 20,
    waitTimeMin: 0,
    hours: '08:00 – 21:00',
    hoursEn: '08:00 – 21:00',
    priceEur: 18,
    priceLabel: '€18,00 / 2h · E-Bike',
    priceLabelEn: '€18.00 / 2h · E-Bike',
    accessible: true,
    bookable: true,
    bookingType: 'bike',
    description:
      'Noleggio bici ed e-bike lungo la pista ciclabile del Lungomare Caracciolo fino a Posillipo.',
    descriptionEn:
      'Instant bike & e-bike rental along the Caracciolo seafront cycle lane toward Posillipo.',
    source: 'MaaS4Italy · Partner Mobilità',
    imageKey: 'lungomare_ebike',
  },
  {
    id: 'trattoria-chiaia',
    name: 'Osteria Il Gobbetto · Ristorante',
    nameEn: 'Osteria Il Gobbetto · Restaurant',
    category: 'commerce',
    kind: 'restaurant',
    zone: 'Via Toledo',
    address: 'Via Sergente Maggiore 8, Napoli',
    position: { lat: 40.8384, lng: 14.2481 },
    crowdLevel: 'medium',
    crowdPercent: 48,
    waitTimeMin: 5,
    hours: '12:00 – 15:30 · 19:00 – 23:30',
    hoursEn: '12:00 – 15:30 · 19:00 – 23:30',
    priceEur: 0,
    priceLabel: 'Prenotazione tavolo gratuita',
    priceLabelEn: 'Free table reservation',
    accessible: true,
    bookable: true,
    bookingType: 'table',
    description:
      'Cucina tradizionale napoletana con conferma immediata del tavolo senza costi anticipati.',
    descriptionEn:
      'Traditional Neapolitan kitchen with instant table confirmation and zero prepayment.',
    source: 'Imprese Locali Napoli',
  },
  {
    id: 'kayak-posillipo',
    name: 'Kayak Golfo di Posillipo · Esperienza',
    nameEn: 'Posillipo Bay Kayak · Experience',
    category: 'commerce',
    kind: 'experience',
    zone: 'Lungomare Caracciolo · Chiaia',
    address: 'Via Posillipo 16, Napoli',
    position: { lat: 40.8195, lng: 14.2156 },
    crowdLevel: 'low',
    crowdPercent: 18,
    waitTimeMin: 0,
    hours: '09:00 – 17:30',
    hoursEn: '09:00 – 17:30',
    priceEur: 35,
    priceLabel: '€35,00 · Esperienza',
    priceLabelEn: '€35.00 · Experience',
    accessible: false,
    bookable: true,
    bookingType: 'experience',
    description:
      'Escursione guidata in kayak davanti a Villa Donn’Anna e baia di Marechiaro.',
    descriptionEn:
      'Guided kayak tour past Villa Donn’Anna and Marechiaro bay.',
    source: 'Imprese Locali Napoli',
  },

  // SERVIZI AI CITTADINI: Comune di Napoli, Questura, Farmacie, Ospedale, ASIA, Sportelli
  {
    id: 'comune-san-giacomo',
    name: 'Comune di Napoli · Palazzo San Giacomo & Anagrafe',
    nameEn: 'Municipality of Naples · City Hall & Registry',
    category: 'citizen_service',
    kind: 'municipal_office',
    zone: 'Via Toledo',
    address: 'Piazza Municipio 1, Napoli',
    position: { lat: 40.8402, lng: 14.2507 },
    crowdLevel: 'low',
    crowdPercent: 28,
    waitTimeMin: 8,
    hours: '08:30 – 14:30 (Lun–Ven)',
    hoursEn: '08:30 – 14:30 (Mon–Fri)',
    accessible: true,
    bookable: true,
    bookingType: 'counter',
    description:
      'Sede centrale del Comune di Napoli, URP, certificati anagrafici, CIE e cambio residenza. Attesa stimata: 8 min.',
    descriptionEn:
      'Naples City Hall headquarters, URP, civil registry certificates, ID cards, and residency counter. Wait: 8 min.',
    source: 'Comune di Napoli',
  },
  {
    id: 'questura-napoli',
    name: 'Questura di Napoli · Polizia di Stato',
    nameEn: 'Naples Police Headquarters (Questura)',
    category: 'citizen_service',
    kind: 'police_questura',
    zone: 'Via Toledo',
    address: 'Via Medina 75, Napoli',
    position: { lat: 40.8421, lng: 14.2519 },
    crowdLevel: 'medium',
    crowdPercent: 45,
    waitTimeMin: 15,
    hours: 'Ufficio Denunce 24h · Passaporti / Sportelli 08:30 – 13:30',
    hoursEn: 'Reports Desk 24h · Passports / Counters 08:30 – 13:30',
    accessible: true,
    bookable: true,
    bookingType: 'counter',
    description:
      'Ufficio denunce attivo 24 ore, sportello passaporti, permessi di soggiorno e assistenza turisti.',
    descriptionEn:
      '24-hour crime reports desk, passport office, residence permits, and tourist assistance.',
    source: 'Polizia di Stato · Questura',
  },
  {
    id: 'farmacia-toledo',
    name: 'Farmacia Internazionale · Di Turno',
    nameEn: 'International Pharmacy · On Duty',
    category: 'citizen_service',
    kind: 'pharmacy_health',
    zone: 'Via Toledo',
    address: 'Via Toledo 282, Napoli',
    position: { lat: 40.8439, lng: 14.2493 },
    crowdLevel: 'low',
    crowdPercent: 25,
    waitTimeMin: 3,
    hours: 'Aperta 24h (Turno notturno attivo)',
    hoursEn: 'Open 24h (Night duty active)',
    accessible: true,
    bookable: false,
    description:
      'Farmacia di turno con servizio multilingue, misurazione parametri e punti ritiro farmaci.',
    descriptionEn:
      '24/7 duty pharmacy with multilingual staff and express prescription pickup.',
    source: 'ASL Napoli 1 Centro',
  },
  {
    id: 'ospedale-pellegrini',
    name: 'Presidio Sanitario Vecchio Pellegrini',
    nameEn: 'Vecchio Pellegrini Healthcare Hub',
    category: 'citizen_service',
    kind: 'pharmacy_health',
    zone: 'Via Toledo',
    address: 'Via Portamedina alla Pignasecca 41, Napoli',
    position: { lat: 40.8468, lng: 14.2454 },
    crowdLevel: 'medium',
    crowdPercent: 55,
    waitTimeMin: 20,
    hours: 'Pronto Soccorso 24h · Ambulatori 08:00 – 18:00',
    hoursEn: 'ER 24h · Clinics 08:00 – 18:00',
    accessible: true,
    bookable: false,
    description: 'Pronto soccorso centrale e guardia medica turistica.',
    descriptionEn: 'Central emergency department and tourist medical guard.',
    source: 'ASL Napoli 1 Centro',
  },
  {
    id: 'isola-asia-chiaia',
    name: 'Isola Ecologica ASIA · Chiaia',
    nameEn: 'ASIA Recycling Point · Chiaia',
    category: 'citizen_service',
    kind: 'waste_point',
    zone: 'Lungomare Caracciolo · Chiaia',
    address: 'Via Giordano Bruno / Riviera di Chiaia, Napoli',
    position: { lat: 40.8317, lng: 14.2219 },
    crowdLevel: 'low',
    crowdPercent: 14,
    waitTimeMin: 0,
    hours: '07:00 – 19:00',
    hoursEn: '07:00 – 19:00',
    accessible: true,
    bookable: false,
    description:
      'Punto conferimento differenziata, RAEE e oli esausti per residenti della Municipalità 1.',
    descriptionEn:
      'Selective waste, WEEE electronics, and used oil drop-off point for Municipality 1 residents.',
    source: 'ASIA Napoli',
  },
  {
    id: 'sportello-tari',
    name: 'Sportello Unico Tributi e Permessi ZTL',
    nameEn: 'Public Tax & ZTL Permits Counter',
    category: 'citizen_service',
    kind: 'public_counter',
    zone: 'Centro Storico · Spaccanapoli',
    address: 'Corso Umberto I 132, Napoli',
    position: { lat: 40.847, lng: 14.2634 },
    crowdLevel: 'low',
    crowdPercent: 30,
    waitTimeMin: 10,
    hours: '08:45 – 13:45',
    hoursEn: '08:45 – 13:45',
    accessible: true,
    bookable: true,
    bookingType: 'counter',
    description:
      'Prenotazione turno allo sportello TARI, ZTL residenti e permessi sosta.',
    descriptionEn:
      'Book a counter slot for municipal taxes, ZTL resident permits, and parking passes.',
    source: 'Comune di Napoli',
  },
];

export const ROUTE_PRESETS: RoutePreset[] = [
  {
    id: 'toledo-beverello',
    label: 'Via Toledo → Molo Beverello',
    labelEn: 'Via Toledo → Molo Beverello',
    originName: 'Via Toledo, Napoli',
    destinationName: 'Molo Beverello, Napoli',
    origin: { lat: 40.8424, lng: 14.2491 },
    destination: { lat: 40.8376, lng: 14.2547 },
    recommendedMode: 'WALKING',
    recommendedDeparture: '16:45',
    durationMin: 20,
    distanceKm: 1.4,
    stepFreeAvailable: true,
    crowdSafe: true,
    advisory:
      'Metro Linea 1 chiusa 15:00–21:00 per lavori · Percorso pedonale pianeggiante via Piazza Municipio',
    advisoryEn:
      'Metro Line 1 closed 15:00–21:00 for works · Flat walking route via Piazza Municipio',
    sources: 'Comune di Napoli, ANM, MaaS4Italy',
  },
  {
    id: 'plebiscito-capodimonte',
    label: 'Piazza del Plebiscito → Capodimonte',
    labelEn: 'Piazza del Plebiscito → Capodimonte',
    originName: 'Piazza del Plebiscito, Napoli',
    destinationName: 'Museo di Capodimonte, Napoli',
    origin: { lat: 40.8358, lng: 14.2487 },
    destination: { lat: 40.8672, lng: 14.2506 },
    recommendedMode: 'BUS',
    recommendedDeparture: '16:50',
    durationMin: 22,
    distanceKm: 4.3,
    stepFreeAvailable: true,
    crowdSafe: true,
    advisory: 'Linea bus 168 / C63 regolare · Museo con attesa < 5 min',
    advisoryEn: 'Bus 168 / C63 on schedule · Museum queue < 5 min',
    sources: 'ANM, Tourism Agent',
  },
  {
    id: 'garibaldi-castel-ovo',
    label: "Stazione Centrale → Castel dell'Ovo",
    labelEn: "Central Station → Castel dell'Ovo",
    originName: 'Piazza Garibaldi, Napoli',
    destinationName: "Castel dell'Ovo, Napoli",
    origin: { lat: 40.8522, lng: 14.2725 },
    destination: { lat: 40.8283, lng: 14.2476 },
    recommendedMode: 'BUS',
    recommendedDeparture: '17:00',
    durationMin: 24,
    distanceKm: 4.1,
    stepFreeAvailable: true,
    crowdSafe: true,
    advisory:
      'Evita Via Acton congestionata · Deviazione consigliata su Corso Umberto / Riviera di Chiaia',
    advisoryEn:
      'Avoids congested Via Acton · Recommended detour via Corso Umberto / Riviera di Chiaia',
    sources: 'Mobility Agent, ANM',
  },
];

export const CITY_SCENARIOS: CityScenario[] = [
  {
    id: 'linea1-works',
    title: 'Metro Linea 1: chiusura anticipata 15:00 – 21:00 per lavori',
    titleEn: 'Metro Line 1: early closure 15:00 – 21:00 for maintenance',
    zone: 'Via Toledo · Dante · Garibaldi',
    timeWindow: 'Oggi 15:00 – 21:00',
    timeWindowEn: 'Today 15:00 – 21:00',
    reason: 'Lavori programmati di adeguamento linea elettrica e verifiche armamento',
    reasonEn: 'Scheduled power line upgrade and track maintenance works',
    center: { lat: 40.8448, lng: 14.2512 },
    radiusMeters: 460,
    severity: 'critical',
    mobilitySignal:
      'Metro Linea 1 chiusa anticipatamente dalle 15:00 alle 21:00 per lavori. Bus sostitutivi ANM ogni 8 min su Dante–Municipio–Garibaldi.',
    mobilitySignalEn:
      'Metro Line 1 closed early 15:00–21:00 for maintenance. ANM replacement buses every 8 min along Dante–Municipio–Garibaldi.',
    tourismSignal:
      'Incremento spostamenti a piedi da Via Toledo verso Molo Beverello per imbarchi e centro.',
    tourismSignalEn:
      'Increased pedestrian flows from Via Toledo toward Molo Beverello and downtown.',
    orchestratorSummary:
      'Orchestrator sincronizza navette sostitutive ANM e propone percorso pedonale senza gradini da Via Toledo al Porto.',
    orchestratorSummaryEn:
      'Orchestrator syncs ANM replacement shuttles and suggests step-free pedestrian route from Via Toledo to the Port.',
    cityControlAction:
      'Potenziate 6 navette sostitutive ANM su asse Dante–Municipio–Garibaldi dalle 15:00 alle 21:00.',
    cityControlActionEn:
      'Deployed 6 ANM replacement shuttles along Dante–Municipio–Garibaldi from 15:00 to 21:00.',
    cityLifeAlert:
      'Linea 1 chiusa dalle 15:00 alle 21:00 per lavori: da Via Toledo raggiungi Molo Beverello a piedi in 20 min (partenza consigliata 16:45).',
    cityLifeAlertEn:
      'Line 1 closed 15:00–21:00 for works: walk from Via Toledo to Molo Beverello in 20 min (recommended departure 16:45).',
    alternativeRoute: {
      originName: 'Via Toledo, Napoli',
      destinationName: 'Molo Beverello, Napoli',
      origin: { lat: 40.8424, lng: 14.2491 },
      destination: { lat: 40.8376, lng: 14.2547 },
      mode: 'WALKING',
      durationMin: 20,
      note: 'Percorso senza gradini · Bus sostitutivi ANM attivi su Piazza Municipio',
      noteEn: 'Step-free route · ANM replacement buses active at Piazza Municipio',
    },
    updatedAt: '15:00',
    sources: 'ANM, Comune di Napoli, MaaS4Italy',
  },
  {
    id: 'plebiscito-congestion',
    title: 'Congestione Piazza del Plebiscito & Via Acton',
    titleEn: 'Piazza del Plebiscito & Via Acton Congestion',
    zone: 'Piazza del Plebiscito',
    timeWindow: 'Oggi 16:00 – 19:30',
    timeWindowEn: 'Today 16:00 – 19:30',
    reason: 'Picco pedonale turistico e rallentamenti veicolari su Via Acton',
    reasonEn: 'Peak visitor density and traffic bottleneck on Via Acton',
    center: { lat: 40.8358, lng: 14.2487 },
    radiusMeters: 380,
    severity: 'critical',
    mobilitySignal:
      'Traffico intenso su Via Acton e Via Cesario Console (+38% tempi di percorrenza bus).',
    mobilitySignalEn:
      'Heavy traffic on Via Acton and Via Cesario Console (+38% bus travel time).',
    tourismSignal:
      'Densità pedonale al 88% in Piazza del Plebiscito; code > 35 min a Palazzo Reale.',
    tourismSignalEn:
      'Pedestrian density at 88% in Piazza del Plebiscito; >35 min queues at Royal Palace.',
    orchestratorSummary:
      'Correlazione attiva tra pressione turistica e collo di bottiglia veicolare su Via Acton. Attivata deviazione coordinata verso Lungomare e Gallerie d’Italia.',
    orchestratorSummaryEn:
      'Active correlation between tourist density and traffic bottleneck on Via Acton. Coordinated bypass toward Seafront and Gallerie d’Italia activated.',
    cityControlAction:
      'Sala Operativa: deviazione bus ANM su Galleria Vittoria e presidio Polizia Locale in Via Cesario Console.',
    cityControlActionEn:
      'Control Room: ANM bus rerouting via Galleria Vittoria and traffic officers deployed on Via Cesario Console.',
    cityLifeAlert:
      'Zona Piazza del Plebiscito molto affollata (16:00–19:30): percorso alternativo consigliato verso Gallerie d’Italia o Lungomare.',
    cityLifeAlertEn:
      'Piazza del Plebiscito is heavily crowded (16:00–19:30): alternative route suggested toward Gallerie d’Italia or Seafront.',
    alternativeRoute: {
      originName: 'Piazza del Plebiscito, Napoli',
      destinationName: "Gallerie d'Italia, Via Toledo 177, Napoli",
      origin: { lat: 40.8358, lng: 14.2487 },
      destination: { lat: 40.8404, lng: 14.2489 },
      mode: 'WALKING',
      durationMin: 7,
      note: 'Percorso pedonale protetto via Galleria Umberto I · Poca attesa al museo (0 min)',
      noteEn: 'Sheltered walking route via Galleria Umberto I · Zero wait at museum',
    },
    updatedAt: '16:40',
    sources: 'Mobility Agent, Tourism Agent, Orchestrator',
  },
  {
    id: 'maradona-match',
    title: 'Partita al Maradona alle 18:00',
    titleEn: 'Match at Maradona Stadium at 18:00',
    zone: 'Fuorigrotta · Stadio Maradona',
    timeWindow: 'Oggi 16:00 – 22:30',
    timeWindowEn: 'Today 16:00 – 22:30',
    reason: 'Afflusso previsto di 50.000 spettatori allo Stadio Diego Armando Maradona',
    reasonEn: 'Expected attendance of 50,000 spectators at Maradona Stadium',
    center: { lat: 40.8279, lng: 14.1931 },
    radiusMeters: 580,
    severity: 'warning',
    mobilitySignal:
      'Stazioni Metro Linea 2 e Cumana affollate dalle 16:00 alle 22:30; traffico sostenuto su Piazzale Tecchio.',
    mobilitySignalEn:
      'Metro Line 2 and Cumana stations crowded 16:00–22:30; heavy traffic on Piazzale Tecchio.',
    tourismSignal:
      'Flussi diretti verso Fuorigrotta; zone collinari Vomero e Capodimonte libere.',
    tourismSignalEn:
      'Flows concentrated toward Fuorigrotta; Vomero and Capodimonte hillside areas remain quiet.',
    orchestratorSummary:
      'Pressione concentrata su asse ovest. City Life avvisa i residenti sulle corse straordinarie e suggerisce mete alternative ai turisti.',
    orchestratorSummaryEn:
      'Pressure focused on west corridor. City Life notifies residents about extra trains and steers tourists to quiet hills.',
    cityControlAction:
      'Attivate corse straordinarie Linea 2 e ZTL perimetrale Fuorigrotta.',
    cityControlActionEn:
      'Activated extra Line 2 trains and Fuorigrotta perimeter traffic control.',
    cityLifeAlert:
      'Partita al Maradona alle 18:00: stazioni affollate dalle 16:00 alle 22:30. Evita Piazzale Tecchio se non vai allo stadio.',
    cityLifeAlertEn:
      'Match at Maradona at 18:00: stations crowded 16:00–22:30. Avoid Piazzale Tecchio unless attending.',
    alternativeRoute: {
      originName: 'Piazza Dante, Napoli',
      destinationName: 'Certosa di San Martino, Vomero, Napoli',
      origin: { lat: 40.8489, lng: 14.2504 },
      destination: { lat: 40.8435, lng: 14.2412 },
      mode: 'BUS',
      durationMin: 18,
      note: 'Itinerario tranquillo al Vomero con vista Golfo e attesa < 5 min',
      noteEn: 'Quiet Vomero hillside itinerary with Bay views and < 5 min wait',
    },
    updatedAt: '16:15',
    sources: 'Comune di Napoli, ANM, FS',
  },
  {
    id: 'cruise-arrival',
    title: 'Arrivo navi da crociera al Molo Beverello',
    titleEn: 'Cruise Ships Arrival at Molo Beverello',
    zone: 'Molo Beverello · Porto',
    timeWindow: 'Oggi 09:00 – 18:00',
    timeWindowEn: 'Today 09:00 – 18:00',
    reason: 'Sbarco simultaneo di 2 navi da crociera al terminal passeggeri',
    reasonEn: 'Simultaneous disembarkation of 2 cruise vessels at passenger terminal',
    center: { lat: 40.8376, lng: 14.2547 },
    radiusMeters: 360,
    severity: 'warning',
    mobilitySignal:
      'Flusso taxi e bus turistici in aumento su Piazza Municipio e Varco Pisacane.',
    mobilitySignalEn:
      'Increased taxi and coach traffic on Piazza Municipio and Varco Pisacane.',
    tourismSignal:
      'Picco visitatori in arrivo verso Spaccanapoli e San Gregorio Armeno (+45%).',
    tourismSignalEn:
      'Visitor surge heading toward Spaccanapoli and San Gregorio Armeno (+45%).',
    orchestratorSummary:
      'Orchestrator distribuisce i flussi turistici proponendo Capodimonte e Certosa di San Martino come itinerari a bassa attesa.',
    orchestratorSummaryEn:
      'Orchestrator distributes visitor flows by proposing Capodimonte and San Martino as low-wait itineraries.',
    cityControlAction:
      'Attivata segnaletica dinamica porto e corsia dedicata navette elettriche.',
    cityControlActionEn:
      'Dynamic port signage activated with dedicated lane for electric shuttles.',
    cityLifeAlert:
      'Centro Storico molto affollato (09:00–18:00) per arrivi al porto: scopri Capodimonte o San Martino con zero coda.',
    cityLifeAlertEn:
      'Historic center busy (09:00–18:00) due to port arrivals: explore Capodimonte or San Martino with zero queues.',
    alternativeRoute: {
      originName: 'Molo Beverello, Napoli',
      destinationName: 'Museo di Capodimonte, Napoli',
      origin: { lat: 40.8376, lng: 14.2547 },
      destination: { lat: 40.8672, lng: 14.2506 },
      mode: 'BUS',
      durationMin: 25,
      note: 'Collegamento diretto verso parco e museo con bassa affluenza',
      noteEn: 'Direct link toward royal park and museum with low crowding',
    },
    updatedAt: '16:30',
    sources: 'Autorità Portuale, Tourism Agent',
  },
];

export const UI_COPY = {
  IT: {
    brand: 'Napoli4Future - CityLife',
    nav: {
      home: 'Adesso',
      map: 'Mappa',
      services: 'Servizi',
      ask: 'Chiedi',
      report: 'Segnala',
      profile: 'Profilo',
    },
    profile: {
      turista: 'Turista',
      residente: 'Residente',
      label: 'Profilo',
    },
    homeTitle: 'Adesso a Napoli',
    airQualityTitle: "Qualità dell'aria: buona",
    airQualitySub: 'Nessuna limitazione alla circolazione',
    airQualitySource: 'Fonte: ARPAC · ore 14:00',
    recommendedToday: 'Consigliato oggi',
    antiCrowdBtn: 'Itinerario senza folla',
    bridgeBtn: 'Ponte City Control',
    mapTitle: 'Mappa e percorsi',
    originPlaceholder: 'Partenza (es. Via Toledo)',
    destPlaceholder: 'Destinazione (es. Molo Beverello)',
    computeRoute: 'Calcola percorso',
    startRoute: 'Avvia percorso',
    stopRoute: 'Termina guida',
    recommendedDep: 'Partenza consigliata',
    stepFree: 'Senza gradini',
    avoidCrowds: 'Evita folla',
    modes: {
      WALKING: 'A piedi',
      BUS: 'Bus',
      METRO: 'Metro',
      FERRY: 'Traghetto',
    },
    servicesTitle: 'Mobilità, servizi e prenotazioni',
    searchServices: 'Cerca Comune, Questura, musei, aree bloccate...',
    filters: {
      all: 'Tutti',
      mobility: 'Mobilità',
      citizen_service: 'Servizi',
      commerce: 'Prenotazioni',
    },
    crowd: {
      low: 'Bassa affluenza',
      medium: 'Affluenza media',
      high: 'Troppa folla / Blocco',
    },
    askTitle: 'Assistente',
    askDisclaimer: "Risposta generata da un'IA. Fanno fede le fonti ufficiali.",
    askPlaceholder: 'Scrivi una domanda su mobilità, luoghi o servizi...',
    reportTitle: 'Segnala',
    reportAnon: 'Le segnalazioni sono anonime. Per le emergenze chiama il 112.',
    reportSubmit: 'Invia segnalazione',
    privacyTitle: 'Profilo e privacy',
  },
  EN: {
    brand: 'Napoli4Future - CityLife',
    nav: {
      home: 'Now',
      map: 'Map',
      services: 'Services',
      ask: 'Ask AI',
      report: 'Report',
      profile: 'Profile',
    },
    profile: {
      turista: 'Tourist',
      residente: 'Resident',
      label: 'Profile',
    },
    homeTitle: 'Now in Naples',
    airQualityTitle: 'Air quality: good',
    airQualitySub: 'No traffic restrictions active',
    airQualitySource: 'Source: ARPAC · 14:00',
    recommendedToday: 'Recommended today',
    antiCrowdBtn: 'Uncrowded itinerary',
    bridgeBtn: 'City Control Bridge',
    mapTitle: 'Map & routes',
    originPlaceholder: 'Origin (e.g. Via Toledo)',
    destPlaceholder: 'Destination (e.g. Molo Beverello)',
    computeRoute: 'Calculate route',
    startRoute: 'Start route',
    stopRoute: 'End navigation',
    recommendedDep: 'Recommended departure',
    stepFree: 'Step-free',
    avoidCrowds: 'Avoid crowds',
    modes: {
      WALKING: 'Walk',
      BUS: 'Bus',
      METRO: 'Metro',
      FERRY: 'Ferry',
    },
    servicesTitle: 'Mobility, services & bookings',
    searchServices: 'Search City Hall, Questura, museums, blocked areas...',
    filters: {
      all: 'All',
      mobility: 'Mobility',
      citizen_service: 'Services',
      commerce: 'Bookings',
    },
    crowd: {
      low: 'Low crowd',
      medium: 'Moderate crowd',
      high: 'Crowded / Blocked',
    },
    askTitle: 'Assistant',
    askDisclaimer: 'AI-generated response. Official public sources prevail.',
    askPlaceholder: 'Ask about transit, low-crowd places, or services...',
    reportTitle: 'Report',
    reportAnon: 'Reports are anonymous. For emergencies call 112.',
    reportSubmit: 'Submit report',
    privacyTitle: 'Profile & privacy',
  },
};
