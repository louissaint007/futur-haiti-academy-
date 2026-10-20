// Images NASA téléchargées localement depuis images.nasa.gov pour une lecture hors ligne.
// Les missions ci-dessous sont des exemples historiques, pas un inventaire exhaustif.
export const spaceArchive = {
  mercury: {
    global:{image:'/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/mercury-global.jpg',title:{fr:'Mercure presque entière vue par MESSENGER',ht:'Prèske tout Mèki jan MESSENGER te wè l'},date:'2011 · survol 1',mission:'MESSENGER',credit:'NASA / Johns Hopkins APL / Carnegie Institution',source:'https://science.nasa.gov/mercury/exploration/'},
    image:'/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/mercury.jpg', title:{fr:'Mercure — quadrangle Beethoven',ht:'Mèki — zòn Beethoven'}, date:'1974 · mosaïque publiée en 2000', mission:'Mariner 10', credit:'NASA / JPL', source:'https://science.nasa.gov/photojournal/mercury-beethoven-quadrangle-h-7/',
    missions:[
      {name:'Mariner 10',when:'1974–1975',note:{fr:'Survols et premières images rapprochées.',ht:'Vòl bò kote planèt la ak premye imaj pwòch yo.'},url:'https://science.nasa.gov/mission/mariner-10/'},
      {name:'MESSENGER',when:'2004–2015',note:{fr:'Premier orbiteur de Mercure.',ht:'Premye veso ki te rete an òbit Mèki.'},url:'https://science.nasa.gov/mission/messenger/'},
    ]
  },
  venus: {
    global:{image:'/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/venus.jpg',title:{fr:'Le globe nuageux de Vénus vu par Mariner 10',ht:'Glòb nyaje Venis jan Mariner 10 te wè l'},date:'1974 · vue globale',mission:'Mariner 10',credit:'NASA / JPL-Caltech',source:'https://science.nasa.gov/photojournal/venus-from-mariner-10/'},
    image:'/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/venus.jpg', title:{fr:'Vénus vue par Mariner 10',ht:'Venis jan Mariner 10 te wè l'}, date:'1974', mission:'Mariner 10', credit:'NASA / JPL', source:'https://images.nasa.gov/details-PIA23791',
    missions:[
      {name:'Mariner 10',when:'1974',note:{fr:'Survol et photographie de l’atmosphère nuageuse.',ht:'Vòl bò kote Venis ak foto atmosfè nwaj li a.'},url:'https://science.nasa.gov/mission/mariner-10/'},
      {name:'Magellan',when:'1990–1994',note:{fr:'Cartographie radar de la surface sous les nuages.',ht:'Katografi sifas la ak rada anba nyaj yo.'},url:'https://science.nasa.gov/mission/magellan/'},
    ]
  },
  earth: {
    global:{image:'/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/earth.jpg',title:{fr:'La Terre entière — hémisphère ouest',ht:'Tout Latè — emisfè lwès'},date:'2007 · composition satellite',mission:'NASA Earth Observatory',credit:'NASA / GSFC',source:'https://images.nasa.gov/details-GSFC_20171208_Archive_e002131'},
    image:'/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/earth.jpg', title:{fr:'Terre — Blue Marble 2007, hémisphère ouest',ht:'Latè — Blue Marble 2007, emisfè lwès'}, date:'2007 · composition satellite NASA', mission:'NASA Earth Observatory', credit:'NASA / GSFC', source:'https://images.nasa.gov/details-GSFC_20171208_Archive_e002131',
    missions:[
      {name:'Apollo 17',when:'1972',note:{fr:'Équipage ayant photographié la Terre depuis la Lune.',ht:'Ekipaj ki te foto Latè depi Lalin nan.'},url:'https://science.nasa.gov/mission/apollo-17/'},
      {name:'DSCOVR',when:'2015–aujourd’hui',note:{fr:'Observe en continu la face éclairée de la Terre.',ht:'Obsève bò Latè ki klere a san rete.'},url:'https://science.nasa.gov/mission/dscovr/'},
    ]
  },
  moon: {
    mission:'Exploration lunaire', source:'https://science.nasa.gov/moon/missions/',
    missions:[
      {name:'Luna 2',when:'1959',note:{fr:'Premier objet fabriqué par l’humain à atteindre la surface lunaire.',ht:'Premye objè moun te fabrike ki te rive sou sifas Lalin nan.'},url:'https://science.nasa.gov/moon/exploration/'},
      {name:'Luna 9',when:'1966',note:{fr:'Premier atterrissage en douceur réussi sur la Lune.',ht:'Premye aterisaj dous ki te reyisi sou Lalin nan.'},url:'https://science.nasa.gov/moon/exploration/'},
      {name:'Apollo 11',when:'1969',note:{fr:'Neil Armstrong et Buzz Aldrin réalisent les premiers pas humains sur la Lune.',ht:'Neil Armstrong ak Buzz Aldrin fè premye pa moun sou Lalin nan.'},url:'https://www.nasa.gov/mission/apollo-11/'},
      {name:'Apollo 17',when:'1972',note:{fr:'Dernière mission Apollo à avoir fait marcher des astronautes sur la surface lunaire.',ht:'Dènye misyon Apollo kote astwonòt te mache sou Lalin nan.'},url:'https://science.nasa.gov/mission/apollo-17/'},
      {name:'Lunar Reconnaissance Orbiter',when:'2009-aujourd’hui',note:{fr:'Cartographie la surface et aide à préparer de futures explorations.',ht:'Li fè kat sifas la epi li ede prepare lòt eksplorasyon.'},url:'https://science.nasa.gov/mission/lunar-reconnaissance-orbiter/'},
      {name:'Artemis II',when:'2026',note:{fr:'Quatre astronautes ont effectué un survol habité de la Lune et sont revenus sur Terre.',ht:'Kat astwonòt te pase toupre Lalin nan epi yo retounen sou Latè.'},url:'https://science.nasa.gov/moon/exploration/'},
    ]
  },
  mars: {
    global:{image:'/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/mars-hubble-2016.webp',title:{fr:'Mars vue en entier par Hubble',ht:'Tout Mas jan Hubble te wè l'},date:'12 mai 2016 · vue globale',mission:'Hubble Space Telescope',credit:'NASA / ESA / Hubble Heritage Team / J. Bell / M. Wolff',source:'https://science.nasa.gov/image-detail/hs-2016-15-a-full_tif/'},
    image:'/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/mars.jpg', title:{fr:'Panorama du delta du cratère Jezero',ht:'Panorama delta kratè Jezero a'}, date:'2022 · Perseverance / Mastcam-Z', mission:'Hubble & Perseverance', credit:'NASA / JPL-Caltech / ASU / MSSS', source:'https://www.jpl.nasa.gov/images/pia24921-detailed-panorama-of-mars-jezero-crater-delta/',
    missions:[
      {name:'Viking 1 & 2',when:'1976',note:{fr:'Premières missions NASA à réussir un atterrissage sur Mars.',ht:'Premye misyon NASA ki te rive ateri sou Mas.'},url:'https://science.nasa.gov/mission/viking-1/'},
      {name:'Curiosity',when:'2012–aujourd’hui',note:{fr:'Rover qui étudie l’habitabilité passée de Mars.',ht:'Rover k ap etidye si Mas te ka pèmèt lavi lontan.'},url:'https://science.nasa.gov/mission/msl-curiosity/'},
      {name:'Perseverance',when:'2021–aujourd’hui',note:{fr:'Explore Jezero et collecte des échantillons.',ht:'Eksplore Jezero epi ranmase echantiyon.'},url:'https://science.nasa.gov/mission/mars-2020-perseverance/'},
    ]
  },
  jupiter: {
    global:{image:'/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/jupiter-global.jpg',title:{fr:'Le globe de Jupiter vu par Voyager 2',ht:'Glòb Jipitè jan Voyager 2 te wè l'},date:'1979 · vue globale',mission:'Voyager 2',credit:'NASA / JPL / USGS',source:'https://science.nasa.gov/photojournal/jupiter/'},
    image:'/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/jupiter.jpg', title:{fr:'Bandes et zones de Jupiter — mission Juno',ht:'Bann ak zòn Jipitè — misyon Juno'}, date:'2023 · JunoCam', mission:'Juno', credit:'NASA / JPL-Caltech / SwRI / MSSS', source:'https://images.nasa.gov/details-PIA26077',
    missions:[
      {name:'Galileo',when:'1995–2003',note:{fr:'Orbiteur et sonde atmosphérique.',ht:'Veso an òbit ak sond atmosfè.'},url:'https://science.nasa.gov/mission/galileo/'},
      {name:'Juno',when:'2016–aujourd’hui',note:{fr:'Étudie l’atmosphère, l’intérieur et le champ magnétique.',ht:'Etidye atmosfè, anndan ak chan mayetik la.'},url:'https://science.nasa.gov/mission/juno/'},
      {name:'Europa Clipper',when:'Lancée en 2024',note:{fr:'En route pour étudier la lune Europe dans le système jovien.',ht:'Sou wout pou etidye lalin Ewòp nan sistèm Jipitè a.'},url:'https://science.nasa.gov/mission/europa-clipper/'},
    ]
  },
  saturn: {
    global:{image:'/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/saturn-global.jpg',title:{fr:'Saturne et ses anneaux — mosaïque globale Cassini',ht:'Satin ak bag li yo — mozayik global Cassini'},date:'2004 · mosaïque en couleurs naturelles',mission:'Cassini',credit:'NASA / JPL / Space Science Institute',source:'https://science.nasa.gov/photojournal/the-greatest-saturn-portrait-yet/'},
    image:'/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/saturn.jpg', title:{fr:'La division de Cassini dans les anneaux',ht:'Divizyon Cassini nan bag yo'}, date:'2007 · Cassini', mission:'Cassini', credit:'NASA / JPL / Space Science Institute', source:'https://science.nasa.gov/photojournal/the-familiar-division/',
    missions:[
      {name:'Pioneer 11',when:'1979',note:{fr:'Premier survol de Saturne.',ht:'Premye vòl bò kote Satin.'},url:'https://science.nasa.gov/mission/pioneer-11/'},
      {name:'Cassini–Huygens',when:'2004–2017',note:{fr:'Orbiteur Saturne et atterrisseur Huygens sur Titan.',ht:'Veso an òbit Satin ak sond Huygens ki te ateri sou Titan.'},url:'https://science.nasa.gov/mission/cassini/'},
      {name:'Dragonfly',when:'Mission prévue',note:{fr:'Rotorcraft en préparation pour explorer Titan.',ht:'Yon elikoptè espasyal k ap prepare pou eksplore Titan.'},url:'https://science.nasa.gov/mission/dragonfly/'},
    ]
  },
  uranus: {
    global:{image:'/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/uranus.jpg',title:{fr:'Uranus entière vue par Voyager 2',ht:'Tout Iranis jan Voyager 2 te wè l'},date:'1986 · disque complet',mission:'Voyager 2',credit:'NASA / JPL-Caltech',source:'https://science.nasa.gov/gallery/voyager-at-uranus/'},
    image:'/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/uranus.jpg', title:{fr:'Uranus vue par Voyager 2',ht:'Iranis jan Voyager 2 te wè l'}, date:'1986 · Voyager 2', mission:'Voyager 2', credit:'NASA / JPL-Caltech', source:'https://images.nasa.gov/details-PIA18182',
    missions:[
      {name:'Voyager 2',when:'Survol en 1986',note:{fr:'Seul vaisseau à avoir visité Uranus de près.',ht:'Sèl veso ki te vizite Iranis toupre.'},url:'https://science.nasa.gov/mission/voyager/mission-overview/'},
      {name:'Uranus Orbiter and Probe',when:'Concept de mission',note:{fr:'Une future mission étudiée pour explorer le système.',ht:'Yon misyon nan lavni y ap etidye pou eksplore sistèm nan.'},url:'https://science.nasa.gov/solar-system/uranus/uranus-orbiter-and-probe/'},
    ]
  },
  neptune: {
    global:{image:'/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/neptune-global.jpg',title:{fr:'Neptune — vue complète depuis Voyager 2',ht:'Neptin — tout planèt la jan Voyager 2 te wè l'},date:'1989 · disque complet',mission:'Voyager 2',credit:'NASA / JPL',source:'https://science.nasa.gov/resource/neptune-full-disk-view/'},
    image:'/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/neptune.jpg', title:{fr:'La Grande Tache sombre de Neptune',ht:'Gwo Tach Nwa Neptin nan'}, date:'1989 · Voyager 2', mission:'Voyager 2', credit:'NASA / JPL-Caltech', source:'https://images.nasa.gov/details-PIA00049',
    missions:[
      {name:'Voyager 2',when:'Survol en 1989',note:{fr:'Seul vaisseau à avoir observé Neptune de près.',ht:'Sèl veso ki te obsève Neptin toupre.'},url:'https://science.nasa.gov/mission/voyager/mission-overview/'},
    ]
  },
  sun: {
    global:{image:'/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/sun.jpg',title:{fr:'Le disque solaire observé par SDO',ht:'Disk Solèy la jan SDO te obsève l'},date:'2025 · observatoire solaire',mission:'SDO',credit:'NASA / GSFC / SDO',source:'https://images.nasa.gov/details-PIA26681'},
    image:'/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/sun.jpg', title:{fr:'Le Soleil observé par SDO',ht:'Solèy la jan SDO te obsève l'}, date:'2025 · Solar Dynamics Observatory', mission:'SDO', credit:'NASA / GSFC / SDO', source:'https://images.nasa.gov/details-PIA26681',
    missions:[
      {name:'Solar Dynamics Observatory',when:'2010–aujourd’hui',note:{fr:'Observe l’activité solaire et son atmosphère.',ht:'Obsève aktivite Solèy la ak atmosfè li.'},url:'https://science.nasa.gov/mission/sdo/'},
      {name:'Parker Solar Probe',when:'2018–aujourd’hui',note:{fr:'Traverse la couronne solaire au plus près.',ht:'Apwoche kouwòn Solèy la pi pre pase tout lòt veso.'},url:'https://science.nasa.gov/mission/parker-solar-probe/'},
      {name:'SOHO',when:'1995–aujourd’hui',note:{fr:'Surveille le Soleil depuis l’espace.',ht:'Siveye Solèy la depi nan lespas.'},url:'https://science.nasa.gov/mission/soho/'},
    ]
  }
};
