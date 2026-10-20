export const dwarfPlanets = [
  {
    id: 'ceres', name: { fr: 'Cérès', ht: 'Sérès' }, type: { fr: 'Planète naine', ht: 'Planèt nen' },
    diameterKm: 939, distanceKm: 413, distanceAu: 2.77, orbitYears: 4.6, orbit: 15.65, radius: 0.19, phase: 1.2, color: '#b6a99b', texture: 'rock',
    fact: { fr: 'Seule planète naine connue dans le système solaire interne; elle se trouve dans la ceinture d’astéroïdes.', ht: 'Sèl planèt nen nou konnen nan sistèm solè anndan an; li nan senti astewoyid la.' },
  },
  {
    id: 'pluto', name: { fr: 'Pluton', ht: 'Pliton' }, type: { fr: 'Planète naine', ht: 'Planèt nen' },
    diameterKm: 2377, distanceKm: 5906, distanceAu: 39.48, orbitYears: 248, orbit: 36.8, radius: 0.25, phase: 0.38, color: '#c08d78', texture: 'rock',
    fact: { fr: 'Survolée par New Horizons en 2015; sa surface glacée présente notamment une vaste région en forme de cœur.', ht: 'New Horizons te pase toupre l an 2015; sifas glas li gen yon gwo zòn ki sanble ak yon kè.' },
  },
  {
    id: 'haumea', name: { fr: 'Hauméa', ht: 'Hauméa' }, type: { fr: 'Planète naine', ht: 'Planèt nen' },
    diameterKm: 1740, distanceKm: 6480, distanceAu: 43.3, orbitYears: 284, orbit: 39.3, radius: 0.22, phase: 2.1, color: '#d1c6b0', texture: 'rock',
    fact: { fr: 'Sa rotation très rapide lui donne une forme allongée; elle possède aussi deux lunes connues.', ht: 'Li vire trè vit, sa ba li yon fòm long; li gen de lalin yo konnen tou.' },
  },
  {
    id: 'makemake', name: { fr: 'Makémaké', ht: 'Makemake' }, type: { fr: 'Planète naine', ht: 'Planèt nen' },
    diameterKm: 1434, distanceKm: 6850, distanceAu: 45.8, orbitYears: 305, orbit: 41.8, radius: 0.21, phase: 4.4, color: '#bd7556', texture: 'rock',
    fact: { fr: 'Un grand monde glacé de la ceinture de Kuiper, au-delà de Neptune.', ht: 'Yon gwo monn glas nan senti Kuiper la, pi lwen Neptin.' },
  },
  {
    id: 'eris', name: { fr: 'Éris', ht: 'Eris' }, type: { fr: 'Planète naine', ht: 'Planèt nen' },
    diameterKm: 2326, distanceKm: 10125, distanceAu: 67.7, orbitYears: 557, orbit: 46.2, radius: 0.24, phase: 5.4, color: '#d9d1c4', texture: 'rock',
    fact: { fr: 'Un monde lointain presque aussi grand que Pluton; sa découverte a relancé le débat sur la définition d’une planète.', ht: 'Yon monn byen lwen ki prèske menm gwosè ak Pliton; dekouvèt li te relanse deba sou definisyon planèt.' },
  },
];

export const dwarfPlanetById = Object.fromEntries(dwarfPlanets.map(body => [body.id, body]));
