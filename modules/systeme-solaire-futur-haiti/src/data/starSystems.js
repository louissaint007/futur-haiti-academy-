export const starSystems = [
  {
    id: 'proxima',
    name: { fr: 'Proxima du Centaure', ht: 'Proksima Santò' },
    starType: { fr: 'Naine rouge', ht: 'Etwal tinen wouj' },
    distanceLy: 4.24,
    color: '#ff744b',
    texture: 'red-dwarf',
    facts: {
      fr: 'Notre voisine stellaire la plus proche après le Soleil. Proxima fait partie du système triple Alpha du Centaure.',
      ht: 'Etwal ki pi pre nou apre Solèy la. Proksima fè pati sistèm twa etwal Alpha Santò a.',
    },
    note: {
      fr: 'Proxima b est une exoplanète connue; sa zone orbitale ne prouve ni la présence d’eau liquide ni celle de la vie.',
      ht: 'Proksima b se yon ègzoplanèt yo konnen; pozisyon òbit li pa pwouve gen dlo likid ni lavi.',
    },
    planets: [
      { id: 'proxima-b', name: 'Proxima b', color: '#8aa9b7', type: { fr: 'Monde rocheux · représentation artistique', ht: 'Monn wòch · reprezantasyon atistik' } },
    ],
    source: 'https://science.nasa.gov/exoplanet-catalog/proxima-centauri-b/',
  },
  {
    id: 'trappist-1',
    name: { fr: 'TRAPPIST-1', ht: 'TRAPPIST-1' },
    starType: { fr: 'Naine rouge ultrafroide', ht: 'Etwal tinen wouj ki trè frèt' },
    distanceLy: 40,
    color: '#ff624d',
    texture: 'ultracool',
    facts: {
      fr: 'Une étoile très petite entourée de sept planètes rocheuses de taille voisine de la Terre.',
      ht: 'Yon ti etwal ki gen sèt planèt wòch toupre gwosè Latè k ap vire toutotou l.',
    },
    note: {
      fr: 'Les sept planètes sont réelles; leurs surfaces dans les illustrations restent des hypothèses, pas des photos.',
      ht: 'Sèt planèt yo egziste; sifas nan ilistrasyon yo se ipotèz, se pa foto.',
    },
    planets: ['b','c','d','e','f','g','h'].map((suffix, index) => ({
      id: `trappist-${suffix}`,
      name: `TRAPPIST-1 ${suffix}`,
      color: ['#a98f77','#c5a783','#9b826d','#d2b99a','#8f9b95','#b9a58f','#82939b'][index],
      type: { fr: 'Exoplanète rocheuse · concept artistique', ht: 'Ègzoplanèt wòch · konsèp atistik' },
    })),
    source: 'https://science.nasa.gov/exoplanets/trappist1/',
  },
  {
    id: 'kepler-186',
    name: { fr: 'Kepler-186', ht: 'Kepler-186' },
    starType: { fr: 'Naine rouge', ht: 'Etwal tinen wouj' },
    distanceLy: 500,
    color: '#ff8555',
    texture: 'orange-dwarf',
    facts: {
      fr: 'Un système de cinq planètes. Kepler-186f fut la première planète de taille voisine de la Terre validée dans la zone habitable de son étoile.',
      ht: 'Yon sistèm ki gen senk planèt. Kepler-186f se premye planèt toupre gwosè Latè yo te valide nan zòn abitab etwal li.',
    },
    note: {
      fr: '« Zone habitable » décrit une distance où l’eau liquide pourrait exister sous certaines conditions; cela ne signifie pas que la planète est habitable.',
      ht: '“Zòn abitab” vle di yon distans kote dlo likid ta ka egziste si kondisyon yo bon; sa pa vle di planèt la abitab toutbon.',
    },
    planets: ['b','c','d','e','f'].map((suffix, index) => ({
      id: `kepler-186-${suffix}`,
      name: `Kepler-186 ${suffix}`,
      color: ['#b99c83','#8c9694','#c49a79','#9ca39c','#6e9c9b'][index],
      type: { fr: 'Exoplanète · représentation artistique', ht: 'Ègzoplanèt · reprezantasyon atistik' },
    })),
    source: 'https://science.nasa.gov/resource/kepler-186-and-the-solar-system/',
  },
  {
    id: 'vega',
    name: { fr: 'Véga', ht: 'Vega' },
    starType: { fr: 'Étoile bleu-blanc · disque de débris', ht: 'Etwal ble-blan · disk debri' },
    distanceLy: 25,
    color: '#a9d9ff',
    texture: 'blue-white',
    facts: {
      fr: 'Une étoile brillante entourée d’un vaste disque de poussières et de débris. Les télescopes n’y ont pas révélé de planète évidente.',
      ht: 'Yon etwal klere ki antoure ak yon gwo disk pousyè ak debri. Teleskòp yo poko montre yon planèt klè bò kote l.',
    },
    note: {
      fr: 'Véga reste étudiée : l’absence de planète confirmée ne signifie pas que chaque détail du système est connu.',
      ht: 'Syantis yo kontinye etidye Vega; lefèt pa gen planèt ki konfime pa vle di yo konnen tout detay sistèm nan.',
    },
    planets: [],
    debrisDisk: true,
    source: 'https://science.nasa.gov/missions/hubble/nasas-hubble-webb-probe-surprisingly-smooth-disk-around-vega/',
  },
];

export const starSystemById = Object.fromEntries(starSystems.map(system => [system.id, system]));
