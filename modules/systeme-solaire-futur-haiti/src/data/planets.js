export const celestialBodies = [
  {
    id: 'mercury', name: { fr: 'Mercure', ht: 'Mèki' }, type: { fr: 'Planète tellurique', ht: 'Planèt wòch' },
    distanceAu: 0.387, orbitYears: 0.241, distanceKm: 57.9, diameterKm: 4879, earthDiameters: 0.383, massEarth: 0.0553, gravityEarth: 0.38,
    day: { fr: '58,6 jours terrestres', ht: '58.6 jou sou Latè' }, year: { fr: '88 jours terrestres', ht: '88 jou sou Latè' },
    temperature: { fr: '−180 à 430 °C', ht: '−180 rive 430 °C' }, moons: 0, color: '#aaa69f', radius: 0.24, orbit: 5.2, speed: 0.34, phase: 1.15,
    fact: { fr: 'La planète la plus proche du Soleil connaît des écarts de température extrêmes.', ht: 'Planèt ki pi pre Solèy la gen gwo diferans tanperati.' },
    texture: 'rock', source: 'NASA/JPL Planetary Fact Sheet'
  },
  {
    id: 'venus', name: { fr: 'Vénus', ht: 'Venis' }, type: { fr: 'Planète tellurique', ht: 'Planèt wòch' },
    distanceAu: 0.723, orbitYears: 0.615, distanceKm: 108.2, diameterKm: 12104, earthDiameters: 0.949, massEarth: 0.815, gravityEarth: 0.9,
    day: { fr: '243 jours (rotation rétrograde)', ht: '243 jou (li vire nan sans opoze)' }, year: { fr: '225 jours terrestres', ht: '225 jou sou Latè' },
    temperature: { fr: 'Environ 465 °C', ht: 'Anviwon 465 °C' }, moons: 0, color: '#d6a96d', radius: 0.43, orbit: 7.5, speed: 0.24, phase: 3.4,
    fact: { fr: 'Son épaisse atmosphère piège la chaleur : sa surface est plus chaude que celle de Mercure.', ht: 'Atmosfè epè li kenbe chalè; sifas li pi cho pase Mèki.' },
    texture: 'venus', source: 'NASA/JPL Planetary Fact Sheet'
  },
  {
    id: 'earth', name: { fr: 'Terre', ht: 'Latè' }, type: { fr: 'Planète tellurique', ht: 'Planèt wòch' },
    distanceAu: 1, orbitYears: 1, distanceKm: 149.6, diameterKm: 12742, earthDiameters: 1, massEarth: 1, gravityEarth: 1,
    day: { fr: '23 h 56 min', ht: '23 èdtan 56 minit' }, year: { fr: '365,25 jours', ht: '365.25 jou' },
    temperature: { fr: 'Moyenne : environ 15 °C', ht: 'Mwayèn: anviwon 15 °C' }, moons: 1, color: '#3c82cb', radius: 0.46, orbit: 9.8, speed: 0.19, phase: 5.15,
    fact: { fr: 'À ce jour, c’est le seul monde connu où la vie est confirmée.', ht: 'Jiskaprezan, se sèl monn nou konnen ki gen lavi.' },
    texture: 'earth', source: 'NASA/JPL Planetary Fact Sheet'
  },
  {
    id: 'mars', name: { fr: 'Mars', ht: 'Mas' }, type: { fr: 'Planète tellurique', ht: 'Planèt wòch' },
    distanceAu: 1.524, orbitYears: 1.881, distanceKm: 227.9, diameterKm: 6779, earthDiameters: 0.532, massEarth: 0.107, gravityEarth: 0.38,
    day: { fr: '24 h 37 min', ht: '24 èdtan 37 minit' }, year: { fr: '687 jours terrestres', ht: '687 jou sou Latè' },
    temperature: { fr: 'Moyenne : environ −65 °C', ht: 'Mwayèn: anviwon −65 °C' }, moons: 2, color: '#ce684b', radius: 0.34, orbit: 12.2, speed: 0.13, phase: 2.2,
    fact: { fr: 'Une journée martienne est proche de la nôtre, mais son année dure presque deux ans terrestres.', ht: 'Yon jounen sou Mas prèske menm longè ak pa nou, men ane li prèske dire de fwa plis.' },
    texture: 'mars', source: 'NASA/JPL Planetary Fact Sheet'
  },
  {
    id: 'jupiter', name: { fr: 'Jupiter', ht: 'Jipitè' }, type: { fr: 'Géante gazeuse', ht: 'Planèt gaz jeyan' },
    distanceAu: 5.204, orbitYears: 11.86, distanceKm: 778.6, diameterKm: 139820, earthDiameters: 10.97, massEarth: 317.8, gravityEarth: 2.53,
    day: { fr: '9 h 56 min', ht: '9 èdtan 56 minit' }, year: { fr: '11,86 années terrestres', ht: '11.86 ane sou Latè' },
    temperature: { fr: 'Nuages : environ −110 °C', ht: 'Nwaj yo: anviwon −110 °C' }, moons: 115, moonsChanging: true, color: '#d8a47d', radius: 1.28, orbit: 17.5, speed: 0.071, phase: 4.55,
    fact: { fr: 'La Grande Tache rouge est une immense tempête observée depuis des siècles.', ht: 'Gwo Tach Wouj la se yon gwo tanpèt moun ap obsève depi plizyè syèk.' },
    texture: 'jupiter', source: 'NASA/JPL Planetary Fact Sheet'
  },
  {
    id: 'saturn', name: { fr: 'Saturne', ht: 'Satin' }, type: { fr: 'Géante gazeuse', ht: 'Planèt gaz jeyan' },
    distanceAu: 9.58, orbitYears: 29.4, distanceKm: 1433.5, diameterKm: 116460, earthDiameters: 9.14, massEarth: 95.2, gravityEarth: 1.06,
    day: { fr: 'Environ 10 h 42 min', ht: 'Anviwon 10 èdtan 42 minit' }, year: { fr: '29,4 années terrestres', ht: '29.4 ane sou Latè' },
    temperature: { fr: 'Nuages : environ −140 °C', ht: 'Nwaj yo: anviwon −140 °C' }, moons: 293, moonsChanging: true, color: '#d5bd8d', radius: 1.08, orbit: 22.5, speed: 0.052, phase: 0.45,
    fact: { fr: 'Ses anneaux sont vastes, mais très minces comparés à leur largeur.', ht: 'Bag li yo laj anpil, men yo trè mens parapò ak lajè yo.' },
    texture: 'saturn', source: 'NASA/JPL Planetary Fact Sheet'
  },
  {
    id: 'uranus', name: { fr: 'Uranus', ht: 'Iranis' }, type: { fr: 'Géante glacée', ht: 'Planèt glas jeyan' },
    distanceAu: 19.2, orbitYears: 84, distanceKm: 2872.5, diameterKm: 50724, earthDiameters: 3.98, massEarth: 14.5, gravityEarth: 0.89,
    day: { fr: '17 h 14 min (rotation rétrograde)', ht: '17 èdtan 14 minit (li vire nan sans opoze)' }, year: { fr: '84 années terrestres', ht: '84 ane sou Latè' },
    temperature: { fr: 'Nuages : environ −195 °C', ht: 'Nwaj yo: anviwon −195 °C' }, moons: 29, moonsChanging: true, color: '#81cbd0', radius: 0.76, orbit: 27.5, speed: 0.037, phase: 2.8,
    fact: { fr: 'Son axe est fortement incliné : elle tourne presque couchée sur son orbite.', ht: 'Aks li panche anpil; li sanble ap vire kouche sou òbit li.' },
    texture: 'uranus', source: 'NASA/JPL Planetary Fact Sheet'
  },
  {
    id: 'neptune', name: { fr: 'Neptune', ht: 'Neptin' }, type: { fr: 'Géante glacée', ht: 'Planèt glas jeyan' },
    distanceAu: 30.05, orbitYears: 164.8, distanceKm: 4495.1, diameterKm: 49244, earthDiameters: 3.87, massEarth: 17.1, gravityEarth: 1.14,
    day: { fr: '16 h 6 min', ht: '16 èdtan 6 minit' }, year: { fr: '165 années terrestres', ht: '165 ane sou Latè' },
    temperature: { fr: 'Nuages : environ −200 °C', ht: 'Nwaj yo: anviwon −200 °C' }, moons: 16, moonsChanging: true, color: '#416fdb', radius: 0.74, orbit: 32, speed: 0.029, phase: 5.65,
    fact: { fr: 'Neptune est si loin qu’il lui faut environ 165 ans terrestres pour faire un tour du Soleil.', ht: 'Neptin tèlman lwen, li pran anviwon 165 ane sou Latè pou l fè yon tou Solèy la.' },
    texture: 'neptune', source: 'NASA/JPL Planetary Fact Sheet'
  }
];

export const planetById = Object.fromEntries(celestialBodies.map(body => [body.id, body]));
export const astronomicalUnitKm = 149597870.7;
