export const learningLevels = [
  {
    id: 'discover', depth: 1,
    title: { fr: 'Découvrir', ht: 'Dekouvri' },
    grades: { fr: '4e–6e année fondamentale', ht: '4yèm–6yèm ane fondamantal' },
    summary: {
      fr: 'Soleil, Terre, Lune et huit planètes avec des explications courtes.',
      ht: 'Solèy, Latè, Lalin ak uit planèt yo ak eksplikasyon kout.',
    },
    curriculum: {
      fr: 'Parcours adapté à cet âge. Le programme détaillé consulté pour la 5e année fondamentale (1988) mentionne les planètes et la distinction entre étoile et satellite; les documents disponibles ne permettent pas d’affirmer la même progression pour chaque classe actuelle.',
      ht: 'Parou sa a adapte pou laj sa a. Pwogram detaye 5yèm ane fondamantal la (1988) pale de planèt yo ak diferans ant etwal ak satelit; dokiman ki disponib yo pa pèmèt nou di menm pwogresyon an obligatwa pou chak klas jodi a.',
    },
  },
  {
    id: 'understand', depth: 2,
    title: { fr: 'Comprendre', ht: 'Konprann' },
    grades: { fr: '7e–9e année fondamentale', ht: '7yèm–9yèm ane fondamantal' },
    summary: {
      fr: 'Mouvements, gravité, comparaison des mondes et quelques planètes naines.',
      ht: 'Mouvman, gravite, konparezon monn yo ak kèk planèt nen.',
    },
    curriculum: {
      fr: 'Le programme MENFP de sciences expérimentales révisé en 2024 prévoit en 7e année « La Terre : une planète du système solaire ». Les objets lointains restent des ouvertures de culture scientifique.',
      ht: 'Pwogram MENFP syans eksperimantal ki te revize an 2024 la prevwa nan 7yèm ane « Latè: yon planèt nan sistèm solè a ». Objè ki lwen yo rete kòm apwofondisman kilti syantifik.',
    },
  },
  {
    id: 'explore', depth: 3,
    title: { fr: 'Explorer', ht: 'Eksplore' },
    grades: { fr: 'Secondaire I–II', ht: 'Segondè I–II' },
    summary: {
      fr: 'Système solaire détaillé, autres étoiles et phénomènes du ciel profond.',
      ht: 'Sistèm solè an detay, lòt etwal ak fenomèn nan syèl fon an.',
    },
    curriculum: {
      fr: 'Les programmes remaniés de physique du secondaire (MENFP, 2024) ouvrent sur le système solaire, son fonctionnement et l’exploration de l’espace. Les fiches de ciel profond sont des compléments.',
      ht: 'Nouvo pwogram fizik segondè MENFP la (2024) pale de sistèm solè a, fason li fonksyone ak eksplorasyon lespas. Fich syèl fon yo se konpleman.',
    },
  },
  {
    id: 'deepen', depth: 4,
    title: { fr: 'Approfondir', ht: 'Apwofondi' },
    grades: { fr: 'Secondaire III–IV', ht: 'Segondè III–IV' },
    summary: {
      fr: 'Échelles, lumière des télescopes, évolution stellaire et éléments chimiques.',
      ht: 'Echèl, limyè teleskòp yo, evolisyon etwal ak eleman chimik yo.',
    },
    curriculum: {
      fr: 'Les contenus MENFP de physique du secondaire comprennent notamment la nucléosynthèse, l’évolution de l’Univers et l’exploration spatiale. Pulsars, magnétars et trous noirs restent signalés comme approfondissements.',
      ht: 'Fizik nan pwogram segondè MENFP la pale sitou de fòmasyon eleman chimik yo, evolisyon Linivè ak eksplorasyon lespas. Pilsar, mayetà ak twou nwa rete kòm apwofondisman.',
    },
  },
];

export const curriculumSources = [
  {
    label: { fr: 'MENFP · programmes du fondamental et séquences de 7e année', ht: 'MENFP · pwogram fondamantal ak sekans 7yèm ane' },
    href: 'https://projet-nectar.prof.scenari.cloud/projet-nectar/index.html',
  },
  {
    label: { fr: 'MENFP · programme remanié de physique du secondaire (2024)', ht: 'MENFP · nouvo pwogram fizik segondè (2024)' },
    href: 'https://digipad.app/p/1046516/369bed11920ea',
  },
  {
    label: { fr: 'Programme détaillé de 5e année fondamentale (archive MENFP/IPN)', ht: 'Pwogram detaye 5yèm ane fondamantal (achiv MENFP/IPN)' },
    href: 'https://www.haitidocs.org/doc/menfp-curriculum-fondamental-af5/text',
  },
];

export const simpleDeepSkyDescriptions = {
  m87: {
    fr: 'L’anneau lumineux a été reconstruit à partir de mesures radio : le trou noir lui-même est invisible.',
    ht: 'Yo rekonstwi bag ki klere a apati mezi radyo; twou nwa a pa vizib poukont li.',
  },
  'sgr-a': {
    fr: 'Cette image radio reconstruite montre la région autour du trou noir au centre de notre galaxie.',
    ht: 'Imaj radyo sa a montre zòn ki toutotou twou nwa ki nan sant galaksi nou an.',
  },
  'm87-jet': {
    fr: 'Un jet de matière très énergique s’étire depuis le centre de la galaxie M87.',
    ht: 'Yon gwo jè matyè ki chaje enèji lonje soti nan sant galaksi M87 la.',
  },
  pillars: {
    fr: 'Ces nuages de gaz et de poussière sont un lieu où de nouvelles étoiles peuvent se former.',
    ht: 'Nyaj gaz ak pousyè sa yo se kote nouvo etwal ka fòme.',
  },
  carina: {
    fr: 'Des étoiles jeunes éclairent et sculptent ce grand nuage de gaz et de poussière.',
    ht: 'Jèn etwal yo klere gwo nyaj gaz ak pousyè sa a epi yo ba li fòm.',
  },
  'andromeda-field': {
    fr: 'Beaucoup de points de cette image sont des étoiles appartenant à la galaxie d’Andromède.',
    ht: 'Anpil pwen nan imaj sa a se etwal ki fè pati galaksi Andwòmèd la.',
  },
  'stephans-quintet': {
    fr: 'Plusieurs galaxies se trouvent dans cette image; certaines interagissent par gravité.',
    ht: 'Gen plizyè galaksi nan imaj sa a; gen nan yo k ap aji youn sou lòt ak gravite.',
  },
  crab: {
    fr: 'Ce nuage contient les restes d’une étoile qui a explosé; un pulsar se trouve en son centre.',
    ht: 'Nyaj sa a gen rès yon etwal ki te eksploze; gen yon pilsar nan sant li.',
  },
  'cassiopeia-a': {
    fr: 'On voit la matière éjectée dans l’espace après l’explosion d’une étoile massive.',
    ht: 'Nou wè matyè ki te voye nan lespas apre yon gwo etwal te eksploze.',
  },
  'omega-centauri': {
    fr: 'Des centaines de milliers d’étoiles sont rassemblées dans cet amas globulaire.',
    ht: 'Plizyè santèn milye etwal reyini nan gwoup won sa a.',
  },
};
