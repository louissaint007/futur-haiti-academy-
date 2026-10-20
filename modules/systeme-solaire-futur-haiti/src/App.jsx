import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { celestialBodies, planetById } from './data/planets.js';
import { dwarfPlanets, dwarfPlanetById } from './data/dwarfPlanets.js';
import { majorMoons } from './data/majorMoons.js';
import { starSystems } from './data/starSystems.js';
import { spaceArchive } from './data/spaceArchive.js';
import { lunarMissions, moonPhotos } from './data/moonArchive.js';
import { pulsarJetExplanation, starLearning, starTakeaways } from './data/starLearning.js';
import { deepSkyCategories, deepSkyObjects, deepSkyTakeaways } from './data/deepSky.js';
import { deepSkyLessons, deepSkyLessonLabels } from './data/deepSkyLessons.js';
import { curriculumSources, learningLevels, simpleDeepSkyDescriptions } from './data/learningLevels.js';
import StellarSphereScene from './StellarSphereScene.jsx';
import DeepSkySimulation from './DeepSkySimulation.jsx';

const SolarScene = lazy(() => import('./SolarScene.jsx'));
const StarSystemScene = lazy(() => import('./StarSystemScene.jsx'));
const EarthGlobe = lazy(() => import('./EarthGlobe.jsx'));
const BlackHoleScene = lazy(() => import('./BlackHoleScene.jsx'));

const moonBody = {
  id:'moon', name:{fr:'Lune',ht:'Lalin'}, type:{fr:'Satellite naturel de la Terre',ht:'Satelit natirèl Latè'},
  distanceKm:0.3844, distanceAu:0.00257, diameterKm:3475, earthDiameters:0.273, massEarth:0.0123, gravityEarth:0.165,
  day:{fr:'27,3 jours (rotation synchrone)',ht:'27.3 jou (wotasyon senkronize)'},
  year:{fr:'27,3 jours autour de la Terre',ht:'27.3 jou toutotou Latè'},
  temperature:{fr:'Environ −173 à 127 °C en surface',ht:'Anviwon −173 rive 127 °C sou sifas la'}, moons:0, color:'#aaa9a2',
  fact:{fr:'La Lune est verrouillée gravitationnellement avec la Terre : elle tourne sur elle-même au même rythme qu’elle l’orbite, ce qui nous montre presque toujours la même face.',ht:'Latè mare Lalin nan ak gravite li: Lalin nan vire sou tèt li menm vitès li fè wonn Latè, se poutèt sa nou prèske toujou wè menm fas la.'},
};

const copy = {
  fr: {
    explore:'Explorer', learn:'Apprendre', compare:'Comparer', quiz:'Mini quiz',
    headline:'Le système solaire, à portée de main.', subhead:'Touchez un monde pour vous en approcher.',
    navTitle:'ESPACE DE DÉCOUVERTE', planets:'SOLEIL + 8 PLANÈTES', dwarfExploreTitle:'PLANÈTES NAINES', guide:'GUIDE D’EXPLORATION',
    stars:'Autres étoiles', starsSection:'AUTRES SYSTÈMES STELLAIRES', starsTitle:'Notre Soleil est une étoile.', starsIntro:'Il existe des milliards d’autres étoiles. Certaines ont des planètes; d’autres sont entourées de poussières ou forment des systèmes doubles.', starsChoose:'Choisis un système connu à explorer.', starsDistance:'Distance depuis la Terre', starsKnownWorlds:'planètes connues', starsWorlds:'Planètes du système', starsModel:'Modèle illustratif · positions et tailles non à l’échelle', starsSelectWorld:'Choisis une planète dans la liste ou touche-la dans la scène 3D.', starsNoPlanet:'Aucune planète confirmée n’est affichée ici; le disque de débris, lui, est observé.', starsSource:'Source scientifique', starsWorldLabel:'Modèle artistique · pas une photographie', starsHomeStar:'Soleil : notre étoile', starsPlanetsNone:'Pas de planète affichée',
    deepSkyTab:'Ciel profond', deepSkyTitle:'Objets du ciel profond', deepSkyIntro:'Explore les trous noirs, les nébuleuses, les galaxies, les restes d’étoiles et les amas à partir de vraies images scientifiques.', deepSkyCount:'objets', deepSkyCategory:'Familles d’objets', deepSkyObserved:'Observation réelle', deepSkyModel:'Simulation 3D', deepSkySimulationLabel:'Gargantua · inspiré d’Interstellar', deepSkySimulationNote:'Simulation visuelle inspirée de Gargantua : un disque d’accrétion lumineux où la matière spirale vers l’ombre centrale. Fais tourner le modèle pour changer de point de vue. Ce rendu 3D reste schématique et ne reproduit pas le calcul de rayons relativistes du film.', deepSkyPhotoLabel:'Images réelles des observatoires', deepSkyImageExplanation:'Les trous noirs sont eux-mêmes invisibles. L’EHT reconstruit leur ombre à partir d’ondes radio mesurées par plusieurs radiotélescopes. Les autres images viennent de télescopes spatiaux; plusieurs utilisent de fausses couleurs pour révéler des longueurs d’onde invisibles à l’œil.', deepSkyCredit:'Crédit image', deepSkyOpenSource:'Fiche et image originales ↗', deepSkyDistance:'Distance', deepSkyWhatSee:'Ce que montre l’image', deepSkyScale:'Pour se représenter l’échelle', deepSkyLoading:'Chargement de la scène interactive…', deepSkyImageAlt:'Image réelle d’un objet céleste :',
    drag:'Glisser pour tourner', zoom:'Molette pour zoomer', gestureTwo:'2 doigts : tourner / zoomer', selection:'Faites un premier voyage',
    selectionHint:'Choisissez une planète sur la scène ou dans la liste.', overview:'Vue complète',
    labels:'Noms des planètes', time:'TEMPS PÉDAGOGIQUE', timeNote:'Mouvements accélérés pour les observer.',
    followOn:'Suivi auto · ON', followOff:'Suivi auto · OFF',
    cameraViews:'ANGLES DE VUE', viewOrbit:'Orbital', viewTop:'Dessus', viewSide:'Profil', viewClose:'Proche', viewWide:'Panorama', nextView:'Vue suivante', info:'Info', hideDetails:'Masquer la fiche', showDetails:'Afficher la fiche',
    scaleNote:'Visualisation pédagogique : tailles, distances et vitesses sont adaptées. Les données affichées gardent leurs unités réelles.',
    modePed:'Vue pédagogique', about:'À propos', type:'PLANÈTE', diameter:'DIAMÈTRE', day:'UNE JOURNÉE',
    year:'UNE ANNÉE', temperature:'TEMPÉRATURE', moons:'LUNES CONNUES', more:'Le savais-tu ?',
    compareEarth:'Comparer à la Terre', wow:'Voyager vers Saturne', appTag:'EXPLORER · COMPRENDRE · APPRENDRE',
    learnTitle:'Voir pour comprendre', learnIntro:'Choisissez une petite expérience.',
    learningPathTitle:'Où sommes-nous ?', learningPathCaption:'Le système solaire se trouve dans la Voie lactée.', learningEarth:'Terre', learningSolar:'Système solaire', learningGalaxy:'Voie lactée', learningUniverse:'Univers observable',
    starTypesTitle:'Quelques types d’étoiles', starTypesIntro:'Choisis une étoile pour découvrir sa surface et son évolution.', starConcept:'Conception d’artiste · texture illustrative', starPhoto:'Photographie réelle du Soleil', starSunName:'Étoile semblable au Soleil', starSunFact:'Le Soleil est une étoile de type G, dite naine jaune. Sa surface visible, la photosphère, est un plasma chaud qui présente une granulation et des taches solaires.', starRedDwarfName:'Naine rouge', starRedDwarfFact:'Petite et moins chaude que le Soleil, une naine rouge rayonne surtout dans le rouge et l’infrarouge. Les détails colorés de cette vue sont une interprétation artistique, pas une carte de sa surface.', starRedGiantName:'Géante rouge', starRedGiantFact:'En vieillissant, une étoile comme le Soleil se dilate et sa surface se refroidit. De grandes cellules de convection peuvent couvrir une partie importante de cette immense enveloppe.', starBlueName:'Étoile bleue massive', starBlueFact:'Les étoiles bleues massives sont beaucoup plus chaudes et lumineuses que le Soleil, et consomment leur combustible rapidement. Leur surface est représentée ici de façon artistique.',
    moonModelTitle:'Soleil, Terre et Lune', moonModelIntro:'Fais tourner la Lune autour de la Terre et observe comment sa phase apparente change.', moonPhaseLabel:'Position de la Lune', moonPhaseNames:['Nouvelle Lune','Premier croissant','Premier quartier','Lune gibbeuse croissante','Pleine Lune','Lune gibbeuse décroissante','Dernier quartier','Dernier croissant'], moonIllumination:'Partie éclairée visible', moonOrbitFact:'Les phases viennent de la position de la Lune autour de la Terre; la Lune ne produit pas sa propre lumière.', moonEclipseNote:'Une éclipse demande un alignement précis. Comme l’orbite lunaire est inclinée d’environ 5°, il n’y a pas d’éclipse à chaque nouvelle ou pleine Lune.', moonSunLabel:'Lumière du Soleil', moonEarthLabel:'Terre', moonMoonLabel:'Lune', moonScaleNote:'Schéma simplifié : les distances, les tailles et l’inclinaison ne sont pas à l’échelle.',
    smallWorldsTitle:'Au-delà des huit planètes', smallWorldsIntro:'D’autres corps orbitent autour du Soleil : ils ne sont pas tous des planètes.', dwarfPlanetsHeading:'Planètes naines reconnues', dwarfPlanetsStatus:'5 reconnues par l’UAI', dwarfPlanetsDefinition:'Elles orbitent autour du Soleil et sont presque rondes, mais n’ont pas dégagé leur voisinage orbital comme les huit planètes.', moreCandidates:'D’autres candidates pourraient être reconnues à l’avenir.', smallBodyHeading:'Petits corps : les distinguer', asteroidsLabel:'Astéroïdes', asteroidsFact:'Petits corps rocheux. Beaucoup se trouvent dans la ceinture entre Mars et Jupiter.', cometsLabel:'Comètes', cometsFact:'Corps riches en glaces et poussières; près du Soleil, leur matière peut former une chevelure et une queue.', meteorChainLabel:'Météoroïde → météore → météorite', meteorChainFact:'Un fragment dans l’espace est un météoroïde. La traînée lumineuse dans l’atmosphère est un météore; s’il en reste au sol, c’est une météorite.', scienceSources:'Sources scientifiques ↗',
    moonWorldsTitle:'Les lunes remarquables des géantes', moonWorldsIntro:'Choisis une géante; les sphères gardent le rapport de diamètre entre ses lunes.', moonParentSaturn:'Saturne', moonParentJupiter:'Jupiter', moonParentUranus:'Uranus', moonParentNeptune:'Neptune', moonScaleLabel:'Diamètre réel', moonPreviewLabel:'Aperçu agrandi · rapport des tailles conservé', moonWaterLabel:'Eau et glace', moonSources:'NASA · diamètres et mondes océaniques ↗',
    journeyTitle:'Notre place dans l’espace', journeyIntro:'Un court voyage pour relier la Terre, le Soleil et les planètes.', journeyStart:'Commencer le parcours', journeyStep:'Étape', journeyOf:'sur', journeyNext:'Étape suivante', journeyCheck:'Vérifier mes acquis', journeyRestart:'Recommencer', journeyAddressTitle:'Notre adresse cosmique', journeyAddressBody:'Nous vivons sur la Terre, l’une des huit planètes de notre système solaire. Ce système se trouve dans la galaxie appelée Voie lactée.', journeyStarTitle:'Le Soleil est une étoile', journeyStarBody:'Le Soleil produit sa propre lumière : c’est une étoile. Les autres étoiles nous paraissent petites surtout parce qu’elles sont beaucoup plus lointaines.', journeyOrbitTitle:'Les planètes orbitent autour du Soleil', journeyOrbitBody:'La gravité du Soleil maintient les huit planètes sur leur orbite. Une orbite est le trajet d’un astre autour d’un autre.', journeyScaleTitle:'Comparer les diamètres', journeyScaleBody:'Le diamètre de Jupiter vaut environ 11 fois celui de la Terre. Celui du Soleil vaut environ 109 fois celui de la Terre. Dans la scène, les tailles sont adaptées pour rester visibles.', journeyEarthValue:'Terre · 12 742 km', journeyJupiterValue:'Jupiter · 139 820 km · ≈ 11 Terres', journeySunValue:'Soleil · 1 392 000 km · ≈ 109 Terres',
    sunIsStar:'Le Soleil est une étoile', sunIsStarSub:'Notre étoile proche éclaire huit planètes.', sunIsStarBody:'Le Soleil est une étoile : une immense sphère de gaz chaud qui produit sa propre lumière. Il nous paraît beaucoup plus grand et lumineux que les autres étoiles parce qu’il est bien plus proche de la Terre. Les huit planètes connues de notre système solaire orbitent autour de lui.',
    dayNight:'Le jour et la nuit', dayNightSub:'La Terre tourne sur elle-même.',
    seasons:'Les saisons', seasonsSub:'L’axe incliné accompagne la Terre autour du Soleil.',
    marsYear:'Une année sur Mars', marsYearSub:'Compare les tours de la Terre et de Mars.',
    bigPlanet:'Les géantes', bigPlanetSub:'Compare la taille de Jupiter avec la Terre.',
    lessonDay:'La moitié tournée vers le Soleil reçoit la lumière du jour. En tournant, chaque région passe ensuite dans la nuit.',
    lessonSeason:'L’axe de la Terre reste incliné d’environ 23,4°. Au fil de l’année, chaque hémisphère reçoit la lumière différemment.',
    lessonMars:'Mars est plus loin du Soleil. Son orbite est plus grande et un tour prend 687 jours terrestres.',
    lessonSize:'Le diamètre de Jupiter est environ 11 fois celui de la Terre. Les sphères de comparaison suivent ce rapport.',
    stopLesson:'Terminer l’expérience', compareHeading:'Comparer deux mondes', choose:'Choisir', firstWorld:'Monde A', secondWorld:'Monde B',
    earth:'Terre', diameterCompare:'Diamètre', distanceCompare:'Distance du Soleil', massCompare:'Masse (Terre = 1)', gravityCompare:'Gravité (Terre = 1)', dayCompare:'Durée du jour', yearCompare:'Durée de l’année', temperatureCompare:'Température', quizTitle:'Teste ton intuition',
    correct:'Bien vu !', incorrect:'Pas tout à fait.', continueQuiz:'Question suivante', quizDone:'Mission accomplie !',
    restartQuiz:'Rejouer', aboutTitle:'Apprendre en explorant',
    aboutText:'Cette démonstration illustre la vision de Futur Haiti : utiliser les nouvelles technologies pour rendre certains concepts éducatifs plus visuels, interactifs et accessibles.',
    aboutFact:'Prototype éducatif indépendant. Il ne représente pas un programme officiellement adopté par une institution.',
    close:'Fermer', sun:'Soleil', milKm:'millions de km', au:'UA', multiple:'Nombre en évolution', moonNone:'Aucune lune connue', moonKnown:'lune connue', moonsKnown:'lunes déjà connues', countChanging:'Décompte évolutif', moonsAsOf:'Source NASA · août 2026',
    globeMode:'GLOBE MANIPULABLE', globeTitle:'Explore la Terre', globeSubtitle:'Le globe reste immobile jusqu’à ce que tu le manipules.', globeCanvas:'Globe terrestre interactif et immobile', globeInstructions:'Glisse pour faire tourner le globe · pince ou utilise + et − pour zoomer.', globeControls:'Commandes du globe', globeReset:'Recentrer le globe', zoomIn:'Zoomer davantage', zoomOut:'Dézoomer', openGlobe:'Manipuler le globe', openGlobeSub:'Tourne la Terre et observe-la de près',
    question:'QUESTION', questionOne:'Quelle planète est la plus grande ?', questionFour:'Le Soleil est…', answerStar:'Une étoile', answerPlanet:'Une planète', answerMoon:'Un satellite naturel', explainStar:'Le Soleil est une étoile parce qu’il produit sa propre lumière. Les planètes, elles, réfléchissent la lumière qu’elles reçoivent.', explainMercury:'Mercure est la planète la plus proche du Soleil. Elle met environ 88 jours terrestres pour en faire le tour.', questionFive:'Qu’est-ce qui provoque l’alternance du jour et de la nuit ?', answerRotation:'La rotation de la Terre sur elle-même', answerRevolution:'La révolution de la Terre autour du Soleil', answerMoonMotion:'Le mouvement de la Lune', explainRotation:'La Terre tourne sur elle-même. La moitié tournée vers le Soleil est éclairée; l’autre est dans la nuit.', questionSix:'Quelle est la cause principale des saisons sur Terre ?', answerTilt:'L’inclinaison de l’axe terrestre', answerDistance:'La distance Terre–Soleil qui change fortement', answerSunHeat:'Le Soleil qui chauffe davantage toute la Terre', explainSeasons:'L’axe terrestre est incliné. Pendant son orbite, les hémisphères reçoivent la lumière solaire avec des angles et des durées différents.', questionSeven:'Comment appelle-t-on le trajet d’une planète autour du Soleil ?', answerOrbit:'Une orbite', explainOrbit:'Une orbite est le trajet d’un astre autour d’un autre. Les huit planètes de notre système solaire orbitent autour du Soleil.',
    questionTwo:'Quelle planète est la plus proche du Soleil ?',
    questionThree:'Quelle planète possède les anneaux les plus visibles ?',
    factSolarSystem:'Huit planètes orbitent autour du Soleil.', intro:'Explorez notre système solaire',
    introBy:'Une expérience éducative interactive par Futur Haiti', enter:'Entrer dans l’espace',
    skip:'Passer l’introduction', timeLabel:'PAUSE', scale:'COMPARAISON DES TAILLES',
    home:'PLANÈTE HABITÉE', thanks:'Merci d’explorer',
    realImages:'Images NASA & missions', realImagesSub:'Archives de missions spatiales', imageCredit:'Image', missionsTitle:'Missions marquantes', sourceLink:'Source NASA ↗', imageContext:'Image réelle issue d’une mission ou d’un observatoire spatial. Certaines vues scientifiques sont recolorées ou assemblées.',
    globalView:'Vue globale', detailView:'Détail / surface',
    diameterVisual:'Rapport des diamètres', earthReference:'', largerThan:'fois plus grand que', comparedWorld:'Monde choisi',
  },
  ht: {
    explore:'Eksplore', learn:'Aprann', compare:'Konpare', quiz:'Ti egzamen',
    headline:'Sistèm solè a nan men ou.', subhead:'Chwazi yon planèt pou pwoche bò kote l.',
    navTitle:'ESPAS DEKOUVÈT', planets:'SOLÈY + 8 PLANÈT YO', dwarfExploreTitle:'PLANÈT NEN YO', guide:'GID EKSPLORASYON',
    stars:'Lòt etwal', starsSection:'LÒT SISTÈM ETWAL', starsTitle:'Solèy nou an se yon etwal.', starsIntro:'Gen plizyè milya lòt etwal. Gen ladan yo ki gen planèt; gen lòt ki antoure ak pousyè oswa ki fòme sistèm doub.', starsChoose:'Chwazi yon sistèm nou konnen pou eksplore.', starsDistance:'Distans ak Latè', starsKnownWorlds:'planèt yo konnen', starsWorlds:'Planèt nan sistèm nan', starsModel:'Modèl ilistrasyon · pozisyon ak gwosè yo pa respekte echèl', starsSelectWorld:'Chwazi yon planèt nan lis la oswa touche l nan sèn 3D a.', starsNoPlanet:'Pa gen planèt konfime ki parèt isit la; men nou obsève disk debri a.', starsSource:'Sous syantifik', starsWorldLabel:'Modèl atistik · se pa foto', starsHomeStar:'Solèy la: etwal pa nou', starsPlanetsNone:'Pa gen planèt ki parèt',
    deepSkyTab:'Syèl fon', deepSkyTitle:'Objè nan syèl fon an', deepSkyIntro:'Eksplore twou nwa, nebilez, galaksi, rès etwal ak gwoup etwal ak vrè imaj syantifik.', deepSkyCount:'objè', deepSkyCategory:'Kalite objè', deepSkyObserved:'Vrè obsèvasyon', deepSkyModel:'Modèl 3D', deepSkySimulationLabel:'Gargantua · enspire pa Interstellar', deepSkySimulationNote:'Modèl la pran enspirasyon nan Gargantua: yon disk limyè kote matyè a vire an espiral pou antre nan lonbraj twou nwa a. Fè l vire pou chanje ang ou. Se yon modèl vizyèl senbolik; li pa kalkile chemen reyon relativis yo.', deepSkyPhotoLabel:'Vrè imaj obsèvatwa yo', deepSkyImageExplanation:'Nou pa ka wè twou nwa a li menm. EHT rekonstwi lonbraj li apati onn radyo plizyè radyo-teleskòp mezire. Lòt imaj yo soti nan teleskòp nan lespas; gen koulè yo chanje pou montre limyè je nou pa ka wè.', deepSkyCredit:'Kredi imaj', deepSkyOpenSource:'Paj ak imaj orijinal ↗', deepSkyDistance:'Distans', deepSkyWhatSee:'Sa imaj la montre', deepSkyScale:'Pou konprann gwosè a', deepSkyLoading:'Sèn entèaktif la ap chaje…', deepSkyImageAlt:'Vrè imaj yon objè nan lespas:',
    drag:'Trennen pou vire', zoom:'Wou sourit pou rale', gestureTwo:'2 dwèt: vire / rale', selection:'Fè premye vwayaj ou',
    selectionHint:'Chwazi yon planèt sou sèn nan oswa nan lis la.', overview:'Tout sistèm nan',
    labels:'Non planèt yo', time:'TAN POU APRANN', timeNote:'Mouvman yo akselere pou nou ka obsève yo.',
    followOn:'Swivi otomatik · AKTIF', followOff:'Swivi otomatik · KANPE',
    cameraViews:'ANG DE VI', viewOrbit:'Òbit', viewTop:'Anwo', viewSide:'Kòt', viewClose:'Pre', viewWide:'Lwen', nextView:'Pwochen ang', info:'Enfò', hideDetails:'Kache enfòmasyon yo', showDetails:'Montre enfòmasyon yo',
    scaleNote:'Vizyalizasyon pou aprann: gwosè, distans ak vitès adapte. Done yo kenbe vrè inite yo.',
    modePed:'Vizyalizasyon aprantisaj', about:'Konsènan', type:'KALITE PLANÈT', diameter:'DYAMÈT', day:'YON JOUNEN',
    year:'YON ANE', temperature:'TANPERATI', moons:'LALIN KI KONI', more:'Èske w te konnen?',
    compareEarth:'Konpare ak Latè', wow:'Vwayaje pou ale Satin', appTag:'EKSPLÒRE · KONPRANN · APRANN',
    learnTitle:'Gade pou w konprann', learnIntro:'Chwazi yon ti eksperyans.',
    learningPathTitle:'Ki kote nou ye?', learningPathCaption:'Sistèm solè a nan Wout Lakte a.', learningEarth:'Latè', learningSolar:'Sistèm solè a', learningGalaxy:'Wout Lakte', learningUniverse:'Linivè nou ka obsève',
    starTypesTitle:'Kèk kalite etwal', starTypesIntro:'Chwazi yon etwal pou dekouvri sifas li ak evolisyon li.', starConcept:'Konsepsyon atis · teksti ilistratif', starPhoto:'Vrè foto Solèy la', starSunName:'Etwal ki sanble ak Solèy la', starSunFact:'Solèy la se yon etwal tip G, yo rele tinen jòn. Sifas li nou wè a, fotosfè a, se yon plasma cho ki gen granil ak tach solèy.', starRedDwarfName:'Tinen wouj', starRedDwarfFact:'Yon tinen wouj piti epi li mwens cho pase Solèy la; li bay sitou limyè wouj ak enfrawouj. Ti detay koulè nan imaj sa a se entèpretasyon atistik, se pa yon kat sifas li.', starRedGiantName:'Jeyan wouj', starRedGiantFact:'Lè yon etwal tankou Solèy la ap vyeyi, li vin pi gwo epi sifas li vin pi fre. Gwo selil konveksyon ka kouvri yon bon pati anvlòp jeyan sa a.', starBlueName:'Gwo etwal ble', starBlueFact:'Gwo etwal ble yo pi cho epi pi klere pase Solèy la, epi yo boule gaz yo vit. Imaj sa a montre sifas yo yon fason atistik.',
    moonModelTitle:'Solèy, Latè ak Lalin', moonModelIntro:'Fè Lalin nan vire toutotou Latè pou w wè kijan faz li parèt diferan.', moonPhaseLabel:'Pozisyon Lalin nan', moonPhaseNames:['Nouvo Lalin','Premye kwasan','Premye ka','Lalin prèske plen k ap grandi','Plen Lalin','Lalin prèske plen k ap bese','Dènye ka','Dènye kwasan'], moonIllumination:'Pati ki klere nou ka wè', moonOrbitFact:'Faz yo depann de pozisyon Lalin nan toutotou Latè; Lalin nan pa pwodui limyè pa li.', moonEclipseNote:'Eklips mande yon aliyman presi. Òbit Lalin nan panche anviwon 5°, se poutèt sa pa gen eklips chak fwa gen nouvo oswa plen Lalin.', moonSunLabel:'Limyè Solèy la', moonEarthLabel:'Latè', moonMoonLabel:'Lalin', moonScaleNote:'Dyagram senplifye: distans, gwosè ak pant lan pa respekte echèl la.',
    smallWorldsTitle:'Pi lwen pase uit planèt yo', smallWorldsIntro:'Gen lòt ast k ap vire toutotou Solèy la; se pa tout ki planèt.', dwarfPlanetsHeading:'Planèt nen yo rekonèt', dwarfPlanetsStatus:'Inyon Astwonomik Entènasyonal la rekonèt 5', dwarfPlanetsDefinition:'Yo vire toutotou Solèy la, yo prèske won, men yo poko netwaye zòn òbit yo tankou uit planèt yo.', moreCandidates:'Yo ka rekonèt lòt kandida pi devan.', smallBodyHeading:'Ti kò yo: fè diferans lan', asteroidsLabel:'Astewoyid', asteroidsFact:'Ti kò wòch. Anpil ladan yo nan senti ki ant Mas ak Jipitè.', cometsLabel:'Komèt', cometsFact:'Kò ki gen glas ak pousyè; bò kote Solèy la, materyèl yo ka fòme yon nyaj ak yon ke.', meteorChainLabel:'Meteowoyid → meteyò → meteyorit', meteorChainFact:'Yon ti moso nan lespas se meteowoyid. Tras limyè a nan atmosfè a se meteyò; si gen moso ki rive atè, se meteyorit.', scienceSources:'Sous syantifik ↗',
    moonWorldsTitle:'Gwo lalin planèt jeyan yo', moonWorldsIntro:'Chwazi yon planèt jeyan; esfè yo respekte rapò dyamèt lalin li yo.', moonParentSaturn:'Satin', moonParentJupiter:'Jipitè', moonParentUranus:'Iranis', moonParentNeptune:'Neptin', moonScaleLabel:'Vrè dyamèt', moonPreviewLabel:'Aperçu agrandi · rapò gwosè yo konsève', moonWaterLabel:'Dlo ak glas', moonSources:'NASA · dyamèt ak monn oseyanik ↗',
    journeyTitle:'Kote nou ye nan lespas', journeyIntro:'Yon ti vwayaj pou konekte Latè, Solèy la ak planèt yo.', journeyStart:'Kòmanse vwayaj la', journeyStep:'Etap', journeyOf:'sou', journeyNext:'Etap apre a', journeyCheck:'Verifye sa mwen aprann', journeyRestart:'Rekòmanse', journeyAddressTitle:'Adrès nou nan lespas', journeyAddressBody:'Nou rete sou Latè, youn nan uit planèt sistèm solè nou an. Sistèm sa a nan yon galaksi ki rele Wout Lakte.', journeyStarTitle:'Solèy la se yon etwal', journeyStarBody:'Solèy la pwodui limyè pa li: se yon etwal. Lòt etwal yo parèt piti sitou paske yo pi lwen anpil.', journeyOrbitTitle:'Planèt yo ap fè òbit Solèy la', journeyOrbitBody:'Gravite Solèy la kenbe uit planèt yo sou òbit yo. Òbit se chemen yon ast ki fè wonn yon lòt.', journeyScaleTitle:'Konpare dyamèt yo', journeyScaleBody:'Dyamèt Jipitè anviwon 11 fwa dyamèt Latè. Dyamèt Solèy la anviwon 109 fwa dyamèt Latè. Nan sèn nan, gwosè yo adapte pou yo rete vizib.', journeyEarthValue:'Latè · 12 742 km', journeyJupiterValue:'Jipitè · 139 820 km · ≈ 11 Latè', journeySunValue:'Solèy · 1 392 000 km · ≈ 109 Latè',
    sunIsStar:'Solèy la se yon etwal', sunIsStarSub:'Etwal ki toupre nou an klere uit planèt.', sunIsStarBody:'Solèy la se yon etwal: yon gwo boul gaz cho ki pwodui limyè pa li. Li sanble pi gwo ak pi klere pase lòt etwal yo paske li pi pre Latè. Uit planèt yo nan sistèm solè nou an ap fè wonn Solèy la.',
    dayNight:'Lajounen ak lannuit', dayNightSub:'Latè ap vire sou tèt li.',
    seasons:'Sezon yo', seasonsSub:'Aks panche a akonpaye Latè bò kote Solèy la.',
    marsYear:'Yon ane sou Mas', marsYearSub:'Konpare tou Latè ak tou Mas.',
    bigPlanet:'Planèt jeyan yo', bigPlanetSub:'Konpare gwosè Jipitè ak Latè.',
    lessonDay:'Mwatye Latè ki bay fas ak Solèy la jwenn limyè lajounen. Pandan Latè ap vire, zòn yo antre nan lannuit.',
    lessonSeason:'Aks Latè panche anviwon 23.4°. Pandan ane a ap pase, chak emisfè jwenn limyè a yon fason diferan.',
    lessonMars:'Mas pi lwen Solèy la. Òbit li pi laj epi yon tou pran 687 jou sou Latè.',
    lessonSize:'Dyamèt Jipitè anviwon 11 fwa dyamèt Latè. Gwosè yo sou ekran an suiv rapò sa a.',
    stopLesson:'Fini eksperyans lan', compareHeading:'Konpare de monn', choose:'Chwazi', firstWorld:'Monn A', secondWorld:'Monn B',
    earth:'Latè', diameterCompare:'Dyamèt', distanceCompare:'Distans ak Solèy la', massCompare:'Mas (Latè = 1)', gravityCompare:'Gravite (Latè = 1)', dayCompare:'Dire jounen an', yearCompare:'Dire ane a', temperatureCompare:'Tanperati', quizTitle:'Teste konesans ou',
    correct:'Se sa menm!', incorrect:'Se pa sa.', continueQuiz:'Pwochen kesyon', quizDone:'Misyon fini!',
    restartQuiz:'Rekòmanse', aboutTitle:'Aprann pandan w ap eksplore',
    aboutText:'Demonstrasyon sa a montre vizyon Futur Haiti: sèvi ak nouvo teknoloji pou fè kèk sijè edikatif pi vizyèl, entèaktif ak aksesib.',
    aboutFact:'Pwototip edikatif endepandan. Li pa yon pwogram yon enstitisyon adopte ofisyèlman.',
    close:'Fèmen', sun:'Solèy', milKm:'milyon km', au:'UA', multiple:'Kantite a ap chanje', moonNone:'Pa gen lalin nou konnen', moonKnown:'lalin nou konnen', moonsKnown:'lalin nou deja konnen', countChanging:'Kantite a ap chanje', moonsAsOf:'Sous NASA · out 2026',
    globeMode:'GLOB KI KA MANIPILE', globeTitle:'Eksplore Latè', globeSubtitle:'Glòb la rete san l pa vire jiskaske ou manyen l.', globeCanvas:'Glòb Latè entèaktif ki pa vire poukont li', globeInstructions:'Trennen pou vire glòb la · peze ak de dwèt oswa itilize + ak − pou rale.', globeControls:'Kontwòl glòb la', globeReset:'Mete glòb la nan mitan ankò', zoomIn:'Rale pi pre', zoomOut:'Rale pi lwen', openGlobe:'Manyen glòb la', openGlobeSub:'Vire Latè epi gade l pi pre',
    question:'KESYON', questionOne:'Ki planèt ki pi gwo a?', questionFour:'Solèy la se…', answerStar:'Yon etwal', answerPlanet:'Yon planèt', answerMoon:'Yon satelit natirèl', explainStar:'Solèy la se yon etwal paske li pwodui limyè pa li. Planèt yo menm reflete limyè yo resevwa.', explainMercury:'Mèki se planèt ki pi pre Solèy la. Li pran anviwon 88 jou sou Latè pou l fè yon tou.', questionFive:'Ki sa ki fè lajounen ak lannuit chanje?', answerRotation:'Latè k ap vire sou tèt li', answerRevolution:'Latè k ap fè wonn Solèy la', answerMoonMotion:'Mouvman Lalin nan', explainRotation:'Latè ap vire sou tèt li. Mwatye ki bay fas ak Solèy la jwenn limyè; lòt mwatye a nan fènwa.', questionSix:'Ki pi gwo koz sezon yo sou Latè?', answerTilt:'Aks Latè ki panche', answerDistance:'Distans Latè ak Solèy la ki chanje anpil', answerSunHeat:'Solèy la ki chofe tout Latè a plis', explainSeasons:'Aks Latè panche. Pandan Latè ap fè wonn, chak emisfè resevwa limyè Solèy la ak ang ak dire ki diferan.', questionSeven:'Ki non chemen yon planèt fè toutotou Solèy la?', answerOrbit:'Yon òbit', explainOrbit:'Òbit se chemen yon ast fè toutotou yon lòt. Uit planèt ki nan sistèm solè nou an ap fè òbit Solèy la.',
    questionTwo:'Ki planèt ki pi pre Solèy la?', questionThree:'Ki planèt ki gen bag ki pi vizib yo?',
    factSolarSystem:'Uit planèt ap fè wonn Solèy la.', intro:'Eksplore sistèm solè nou an',
    introBy:'Yon eksperyans aprantisaj entèaktif pa Futur Haiti', enter:'Antre nan lespas',
    skip:'Pase entwodiksyon an', timeLabel:'KANPE', scale:'KONPARE GWOSÈ YO',
    home:'N AP VIV SOU LI', thanks:'Mèsi paske w ap eksplore',
    realImages:'Imaj NASA ak misyon yo', realImagesSub:'Achiv misyon espasyal yo', imageCredit:'Imaj', missionsTitle:'Misyon enpòtan', sourceLink:'Sous NASA ↗', imageContext:'Imaj reyèl ki soti nan yon misyon oswa yon obsèvatwa espasyal. Gen kèk imaj syantifik yo ki gen koulè modifye oswa ki fèt ak plizyè imaj.',
    globalView:'Tout planèt la', detailView:'Detay / sifas',
    diameterVisual:'Konpare dyamèt yo', earthReference:'rapò reyèl', largerThan:'fwa pi laj pase', comparedWorld:'Monn n ap konpare a',
  },
};

const quizzes = [
  { key:'questionOne', correct:'jupiter', explanation:'lessonSize', options:['earth','jupiter','saturn'] },
  { key:'questionTwo', correct:'mercury', explanation:'explainMercury', options:['mercury','venus','mars'] },
  { key:'questionThree', correct:'saturn', explanation:'factSaturn', options:['jupiter','saturn','uranus'] },
  { key:'questionFour', correct:'star', explanation:'explainStar', options:['star','planet','moon'] },
  { key:'questionFive', correct:'rotation', explanation:'explainRotation', options:['rotation','revolution','moonMotion'] },
  { key:'questionSix', correct:'tilt', explanation:'explainSeasons', options:['tilt','distance','sunHeat'] },
  { key:'questionSeven', correct:'orbit', explanation:'explainOrbit', options:['orbit','rotation','moonMotion'] },
];
const guidedJourney = [
  { title:'journeyAddressTitle', body:'journeyAddressBody', planet:'earth' },
  { title:'journeyStarTitle', body:'journeyStarBody', planet:'sun' },
  { title:'journeyOrbitTitle', body:'journeyOrbitBody', planet:'earth' },
  { title:'journeyScaleTitle', body:'journeyScaleBody', planet:'jupiter' },
];
const lessons = [
  { id:'star', title:'sunIsStar', subtitle:'sunIsStarSub', body:'sunIsStarBody', planet:'sun', symbol:'☼' },
  { id:'day', title:'dayNight', subtitle:'dayNightSub', body:'lessonDay', planet:'earth', symbol:'◐' },
  { id:'seasons', title:'seasons', subtitle:'seasonsSub', body:'lessonSeason', planet:'earth', symbol:'◒' },
  { id:'mars', title:'marsYear', subtitle:'marsYearSub', body:'lessonMars', planet:'mars', symbol:'↗' },
  { id:'size', title:'bigPlanet', subtitle:'bigPlanetSub', body:'lessonSize', planet:'jupiter', symbol:'◎' },
];
const sunComparison = {
  id:'sun', name:{fr:'Soleil',ht:'Solèy'}, diameterKm:1392000, earthDiameters:1392000 / 12742,
  color:'#f6b93b', distanceAu:0, massEarth:333000, gravityEarth:27.9,
  day:{fr:'Environ 25 jours',ht:'Anviwon 25 jou'}, year:{fr:'—',ht:'—'},
  temperature:{fr:'Photosphère : environ 5 500 °C',ht:'Fotosfè: anviwon 5 500 °C'},
};
const comparisonWorlds = [sunComparison, ...celestialBodies];

const starTypes = [
  { id:'red-dwarf', color:'#ff765e', className:'red-dwarf', title:{fr:'Naine rouge',ht:'Tinen wouj'}, kind:{fr:'Étoile de la séquence principale',ht:'Etwal nan sekans prensipal la'}, fact:{fr:'Petite et froide, elle fusionne lentement l’hydrogène en hélium et peut briller des milliers de milliards d’années.',ht:'Li piti epi fre; li transfòme idwojèn an elyòm dousman epi li ka klere pandan plizyè milya ane.'}, emission:{fr:'Lumière rouge-orangée, chaleur et parfois rayons X/UV lors d’éruptions.',ht:'Limyè wouj-zoranj, chalè epi pafwa reyon X/UV pandan gwo aktivite.'}, size:{fr:'Petite',ht:'Ti'}, temperature:{fr:'Plus froide',ht:'Pi fre'}, modelCaption:{fr:'Surface 3D illustrative · coloration inspirée des étoiles froides.',ht:'Sifas 3D ilistratif · koulè ki enspire ak etwal fre yo.'},source:"https://science.nasa.gov/universe/stars/types/" },
  { id:'sun-like', color:'#ffd36e', className:'sun-like', title:{fr:'Étoile semblable au Soleil',ht:'Etwal ki sanble ak Solèy la'}, kind:{fr:'Étoile de la séquence principale',ht:'Etwal nan sekans prensipal la'}, fact:{fr:'Elle transforme l’hydrogène en hélium dans son cœur. Cette longue période stable est la séquence principale.',ht:'Li transfòme idwojèn an elyòm nan nwayo li. Peryòd ki estab e ki long sa a rele sekans prensipal.'}, emission:{fr:'Lumière, chaleur, particules du vent stellaire et parfois des éruptions.',ht:'Limyè, chalè, patikil van etwal la epi pafwa gwo aktivite.'}, size:{fr:'Intermédiaire',ht:'Mwayen'}, temperature:{fr:'Jaune-blanc',ht:'Jòn-blanc'}, modelCaption:{fr:'Copie de la texture du Soleil central · sphère 3D manipulable.',ht:'Kopi teksti Solèy ki nan sant la · boul 3D ou ka manipile.'},source:"https://science.nasa.gov/sun/facts/" },
  { id:'red-giant', color:'#ff9b61', className:'red-giant', title:{fr:'Géante rouge',ht:'Jeyan wouj'}, kind:{fr:'Phase tardive d’évolution',ht:'Etap evolisyon ki vini pi ta'}, fact:{fr:'Quand l’hydrogène central s’épuise, une étoile comme le Soleil se dilate; son cœur se contracte et chauffe, et l’hélium peut fusionner en carbone et oxygène.',ht:'Lè idwojèn nan nwayo a fini, yon etwal tankou Solèy la gonfle; nwayo li retresi epi chofe, epi elyòm ka transfòme an kabòn ak oksijèn.'}, emission:{fr:'Lumière rouge, chaleur et vents qui expulsent peu à peu ses couches externes.',ht:'Limyè wouj, chalè ak van ki voye kouch ekstèn li yo ale piti piti.'}, size:{fr:'Très étendue',ht:'Trè laj'}, temperature:{fr:'Surface plus froide',ht:'Sifas la pi fre'}, modelCaption:{fr:'Texture 3D agrandie · taille et surface restent schématiques.',ht:'Teksti 3D elaji · gwosè ak sifas la rete yon modèl.'},source:"https://science.nasa.gov/universe/stars/types/" },
  { id:'blue-giant', color:'#9bcaff', className:'blue-giant', title:{fr:'Étoile bleue massive',ht:'Gwo etwal ble'}, kind:{fr:'Étoile chaude et massive',ht:'Etwal cho ak masiv'}, fact:{fr:'Très chaude et massive, elle consomme vite son carburant et termine souvent sa vie par une supernova.',ht:'Li cho anpil epi li gen anpil mas; li boule gaz li vit epi souvan li fini lavi li nan yon sipènova.'}, emission:{fr:'Beaucoup de lumière bleue et ultraviolette, vents stellaires puissants, puis des éléments dispersés par la supernova.',ht:'Anpil limyè ble/UV, gwo van etwal, epi apre sa sipènova a gaye eleman yo.'}, size:{fr:'Massive',ht:'Masiv'}, temperature:{fr:'Très chaude',ht:'Trè cho'}, modelCaption:{fr:'Surface 3D illustrative d’une étoile très chaude.',ht:'Sifas 3D ilistratif pou yon etwal ki cho anpil.'},source:"https://science.nasa.gov/asset/hubble/ag-carinae/" },
  { id:'protostar', color:'#ffad63', className:'protostar', title:{fr:'Protoétoile',ht:'Pwotoetwal'}, kind:{fr:'Étoile en formation',ht:'Etwal k ap fòme'}, fact:{fr:'Un nuage de gaz et de poussière s’effondre sous sa propre gravité. Le cœur chauffe, mais la fusion stable de l’hydrogène n’a pas encore commencé.',ht:'Yon nyaj gaz ak pousyè ap tonbe anba gravite pa li. Nwayo a ap chofe, men fizyon idwojèn ki estab poko kòmanse.'}, emission:{fr:'Chaleur et surtout rayonnement infrarouge; des jets peuvent jaillir des pôles.',ht:'Chalè ak sitou reyon enfrawouj; jè ka soti nan de poto yo.'}, size:{fr:'En formation',ht:'Ap fòme'}, temperature:{fr:'Cœur en réchauffement',ht:'Nwayo a ap chofe'}, modelCaption:{fr:'Sphère et disque d’accrétion schématiques · modèle 3D.',ht:'Boul ak disk akresyon an se yon modèl · sèn 3D.'},source:"https://science.nasa.gov/missions/hubble/hubbles-album-of-planet-forming-disks/" },
  { id:'brown-dwarf', color:'#b77855', className:'brown-dwarf', title:{fr:'Naine brune',ht:'Tinen mawon'}, kind:{fr:'Objet sous-stellaire · entre planète et étoile',ht:'Objè anba-etwal · ant planèt ak etwal'}, fact:{fr:'Trop peu massive pour maintenir la fusion de l’hydrogène comme une vraie étoile. Elle conserve une chaleur de formation et certaines fusionnent brièvement le deutérium.',ht:'Li pa gen ase mas pou kenbe fizyon idwojèn tankou yon etwal. Li kenbe chalè fòmasyon li; kèk ladan yo fè fizyon deteryòm pandan yon ti tan.'}, emission:{fr:'Principalement de la chaleur et de la lumière infrarouge, très peu de lumière visible.',ht:'Sitou chalè ak limyè enfrawouj; prèske pa gen limyè je ka wè.'}, size:{fr:'Plus grande que Jupiter',ht:'Pi gwo pase Jipitè'}, temperature:{fr:'Froide à tiède',ht:'Frèt rive tyèd'}, modelCaption:{fr:'Modèle 3D pédagogique · une naine brune n’est pas une étoile au sens strict.',ht:'Modèl 3D pedagojik · tinen mawon pa yon etwal toutbon.'},source:"https://science.nasa.gov/universe/stars/types/" },
  { id:'white-dwarf', color:'#cde7ff', className:'white-dwarf', title:{fr:'Naine blanche',ht:'Tinen blan'}, kind:{fr:'Reste chaud du cœur d’une étoile',ht:'Rès cho nan nwayo yon etwal'}, fact:{fr:'Après avoir expulsé ses couches externes, une étoile comme le Soleil laisse un cœur très dense, de taille proche de la Terre. Il ne soutient plus la fusion et refroidit lentement.',ht:'Apre li fin voye kouch ekstèn li yo ale, yon etwal tankou Solèy la kite yon nwayo trè dans, apeprè gwosè Latè. Li pa kontinye fizyon; li refwadi dousman.'}, emission:{fr:'Elle rayonne sa chaleur résiduelle, d’abord en lumière blanche/UV, puis de plus en plus faiblement.',ht:'Li lage chalè ki rete a: an premye limyè blan/UV, apre sa limyè a vin pi fèb.'}, size:{fr:'Taille proche de la Terre',ht:'Gwosè apeprè Latè'}, temperature:{fr:'Très chaude puis refroidissante',ht:'Trè cho epi l ap refwadi'}, modelCaption:{fr:'Sphère agrandie pour être visible · naine blanche représentée comme un cœur compact.',ht:'Boul la elaji pou moun ka wè l · tinen blan an montre kòm yon nwayo konpak.'},source:"https://science.nasa.gov/universe/stars/types/" },
  { id:'neutron-star', color:'#bdeaff', className:'neutron-star', title:{fr:'Étoile à neutrons',ht:'Etwal netwon'}, kind:{fr:'Reste compact après certaines supernovas',ht:'Rès konpak apre kèk sipènova'}, fact:{fr:'Le cœur effondré d’une étoile massive peut comprimer plus de masse que le Soleil dans une sphère d’environ quelques dizaines de kilomètres.',ht:'Nwayo yon gwo etwal ki tonbe ka rasanble plis mas pase Solèy la nan yon boul ki gen anviwon kèk dizèn kilomèt.'}, emission:{fr:'Chaleur, rayons X et particules; le signal dépend de son champ magnétique et de son environnement.',ht:'Chalè, reyon X ak patikil; siyal la depann de chan mayetik li ak anviwònman li.'}, size:{fr:'Quelques dizaines de kilomètres',ht:'Kèk dizèn kilomèt'}, temperature:{fr:'Extrêmement chaude',ht:'Cho anpil anpil'}, modelCaption:{fr:'Objet fortement agrandi · texture conceptuelle, pas une surface résolue en photo.',ht:'Objè a elaji anpil · teksti konseptyèl, se pa sifas foto teleskòp la rezoud.'},source:"https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-pulsars/" },
  { id:'pulsar', color:'#a5d7ff', className:'pulsar', title:{fr:'Pulsar',ht:'Pilsar'}, kind:{fr:'Étoile à neutrons en rotation rapide',ht:'Etwal netwon k ap vire vit'}, fact:{fr:'Son faisceau de rayonnement tourne avec l’étoile. Quand il balaie la Terre, les télescopes détectent des impulsions régulières, comme un phare.',ht:'Faisceau radyasyon an vire ak etwal la. Lè li pase sou Latè, teleskòp yo detekte batman regilye, tankou limyè yon fa.'}, emission:{fr:'Impulsions radio, rayons X et parfois gamma; les faisceaux sont une visualisation pédagogique.',ht:'Batman radyo, reyon X epi pafwa reyon gama; reyon yo se yon vizyalizasyon pedagojik.'}, size:{fr:'Quelques dizaines de kilomètres',ht:'Kèk dizèn kilomèt'}, temperature:{fr:'Très chaude',ht:'Cho anpil'}, modelCaption:{fr:'Étoile compacte agrandie et faisceaux rotatifs schématiques.',ht:'Etwal konpak elaji ak reyon k ap vire, kòm modèl.'},source:"https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-pulsars/" },
  { id:'magnetar', color:'#d3b5ff', className:'magnetar', title:{fr:'Magnétar',ht:'Mayetà'}, kind:{fr:'Étoile à neutrons au champ magnétique extrême',ht:'Etwal netwon ki gen chan mayetik ekstrèm'}, fact:{fr:'C’est une étoile à neutrons dont le champ magnétique est exceptionnellement intense. Des changements brusques de ce champ ou des fractures de la croûte peuvent déclencher des sursauts.',ht:'Se yon etwal netwon ki gen chan mayetik ekstraòdinè fò. Chanjman bridsoukou nan chan an oswa fann nan kwout la ka lakòz gwo pete.'}, emission:{fr:'Sursauts de rayons X et gamma; des éruptions pourraient aussi éjecter des noyaux lourds.',ht:'Gwo pete reyon X ak gama; eripsyon yo ka voye nwayo eleman lou deyò.'}, size:{fr:'Quelques dizaines de kilomètres',ht:'Kèk dizèn kilomèt'}, temperature:{fr:'Extrêmement chaude',ht:'Cho anpil anpil'}, modelCaption:{fr:'Étoile compacte agrandie · champ et sursauts illustrés, non observés directement.',ht:'Etwal konpak elaji · chan ak pete yo ilistre, se pa obsèvasyon dirèk.'},source:"https://science.nasa.gov/universe/stars/types/" },
];

function Metric({ label, value, unit }) {
  return <div className="metric-card"><span>{label}</span><strong>{value}</strong>{unit && <small>{unit}</small>}</div>;
}

function App() {
  const pulsarJetArrowRef = useRef(null);
  const pulsarJetLabelRef = useRef(null);
  const [locale, setLocale] = useState('fr');
  const [mode, setMode] = useState('explore');
  const [learningLevelId, setLearningLevelId] = useState(() => {
    try { return window.localStorage.getItem('futur-haiti-learning-level') || 'discover'; } catch { return 'discover'; }
  });
  const [starSystemId, setStarSystemId] = useState('trappist-1');
  const [starTab, setStarTab] = useState('types');
  const [selectedStarTypeId, setSelectedStarTypeId] = useState('red-dwarf');
  const [deepSkyCategoryId, setDeepSkyCategoryId] = useState('black-holes');
  const [selectedDeepSkyId, setSelectedDeepSkyId] = useState('m87');
  const [deepSkyView, setDeepSkyView] = useState('bank');
  const [deepSkyBankFilter, setDeepSkyBankFilter] = useState('all');
  const [selectedExoplanetId, setSelectedExoplanetId] = useState('trappist-b');
  const [selectedId, setSelectedId] = useState(null);
  const [focusRequest, setFocusRequest] = useState(0);
  const [timeScale, setTimeScale] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [followPlanet, setFollowPlanet] = useState(true);
  const [viewId, setViewId] = useState('orbit');
  const [viewRequest, setViewRequest] = useState(0);
  const [detailsCollapsed, setDetailsCollapsed] = useState(false);
  const [intro, setIntro] = useState(true);
  const [lessonId, setLessonId] = useState(null);
  const [journeyStep, setJourneyStep] = useState(-1);
  const [moonAngle, setMoonAngle] = useState(0);
  const [dwarfPlanetId, setDwarfPlanetId] = useState('ceres');
  const [moonParentId, setMoonParentId] = useState('jupiter');
  const [selectedMoonId, setSelectedMoonId] = useState('europa');
  const [compareId, setCompareId] = useState('jupiter');
  const [compareReferenceId, setCompareReferenceId] = useState('earth');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveImageIndex, setArchiveImageIndex] = useState(0);
  const [globeBodyId, setGlobeBodyId] = useState(null);
  const [notice, setNotice] = useState('');
  const t = copy[locale];
  const learningLevel = learningLevels.find(item => item.id === learningLevelId) || learningLevels[0];
  const visibleDwarfPlanets = learningLevel.depth === 1 ? [] : learningLevel.depth === 2 ? dwarfPlanets.filter(item => ['ceres', 'pluto'].includes(item.id)) : dwarfPlanets;
  const deepSkyBankItems = deepSkyObjects.filter(item => deepSkyBankFilter === 'all' || item.category === deepSkyBankFilter);
  const selected = selectedId && selectedId !== 'sun' ? (planetById[selectedId] || dwarfPlanetById[selectedId] || (selectedId === 'moon' ? moonBody : null)) : null;
  const selectedStarSystem = starSystems.find(system => system.id === starSystemId) || starSystems[0];
  const selectedStarType = starTypes.find(item => item.id === selectedStarTypeId) || starTypes[0];
  const selectedStarLearning = starLearning[selectedStarType.id][locale];
  const selectedStarTakeaway = starTakeaways[selectedStarType.id][locale];
  const deepSkyCategory = deepSkyCategories.find(category => category.id === deepSkyCategoryId) || deepSkyCategories[0];
  const deepSkyCategoryItems = deepSkyObjects.filter(item => item.category === deepSkyCategory.id);
  const selectedDeepSky = deepSkyObjects.find(item => item.id === selectedDeepSkyId) || deepSkyCategoryItems[0] || deepSkyObjects[0];
  const selectedDeepSkyTakeaway = deepSkyTakeaways[selectedDeepSky.id][locale];
  const selectedDeepSkyLesson = deepSkyLessons[selectedDeepSky.id];
  const selectBankImage = id => {
    setSelectedDeepSkyId(id);
    window.requestAnimationFrame(() => document.querySelector('.deep-sky-stage-scroll')?.scrollTo({ top: 0, behavior: 'smooth' }));
  };
  const openDeepSkySimulation = scenario => {
    const categoryId = scenario === 'formation' ? 'nebulae' : 'explosions';
    const firstObject = deepSkyObjects.find(item => item.category === categoryId);
    setMode('deep-sky');
    setDeepSkyCategoryId(categoryId);
    if (firstObject) setSelectedDeepSkyId(firstObject.id);
    window.setTimeout(() => document.getElementById(`deep-sky-simulation-${scenario}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
  };
  const selectedExoplanet = selectedStarSystem.planets.find(planet => planet.id === selectedExoplanetId) || selectedStarSystem.planets[0] || null;
  const lesson = lessons.find(item => item.id === lessonId);
  const compare = comparisonWorlds.find(body => body.id === compareId) || planetById.jupiter;
  const compareReference = comparisonWorlds.find(body => body.id === compareReferenceId) || planetById.earth;
  const largerWorld = compare.earthDiameters >= compareReference.earthDiameters ? compare : compareReference;
  const smallerWorld = largerWorld === compare ? compareReference : compare;
  const diameterRatio = largerWorld.earthDiameters / smallerWorld.earthDiameters;
  const comparisonScale = 72 / Math.max(compare.earthDiameters, compareReference.earthDiameters);
  const archive = spaceArchive[selectedId || 'earth'];
  const archiveImages = selectedId === 'moon' ? [] : archive ? [archive.global, ...(archive.global?.image === archive.image ? [] : [archive])].filter(item => item?.image) : [];
  const archiveImage = archiveImages[archiveImageIndex] || archiveImages[0];
  const archiveMissions = selectedId === 'moon' ? lunarMissions : archive?.missions || [];
  const archiveActionTitle = selectedId === 'moon' ? (locale === 'fr' ? 'Missions lunaires' : 'Misyon sou Lalin nan') : t.realImages;
  const archiveActionSub = selectedId === 'moon' ? (locale === 'fr' ? 'Explorations robotisées et humaines' : 'Eksplorasyon robo ak moun') : t.realImagesSub;
  const quiz = quizzes[quizIndex];
  const selectedDwarfPlanet = dwarfPlanetById[dwarfPlanetId] || dwarfPlanets[0];
  const selectedMoon = majorMoons.find(moon => moon.id === selectedMoonId) || majorMoons[0];
  const visibleMoons = majorMoons.filter(moon => moon.planet === moonParentId);
  const moonPhaseIndex = Math.floor((((moonAngle + 22.5) % 360) / 45));
  const moonIlluminationPercent = Math.round((1 - Math.cos(moonAngle * Math.PI / 180)) * 50);
  const moonOrbitRadius = 66;
  const moonOrbitRadians = moonAngle * Math.PI / 180;
  const moonPosition = { x: 178 - Math.cos(moonOrbitRadians) * moonOrbitRadius, y: 102 + Math.sin(moonOrbitRadians) * moonOrbitRadius };

  useEffect(() => {
    if (!selectedId) return undefined;
    const mobile = window.matchMedia('(max-width: 820px)');
    const syncDetails = () => setDetailsCollapsed(mobile.matches);
    syncDetails();
    mobile.addEventListener('change', syncDetails);
    return () => mobile.removeEventListener('change', syncDetails);
  }, [selectedId, mode]);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!lesson) return undefined;
    setMode('learn');
    setSelectedId(lesson.planet);
    setFocusRequest(value => value + 1);
    setIsPaused(true);
    const timer = window.setTimeout(() => setIsPaused(false), 1300);
    return () => window.clearTimeout(timer);
  }, [lessonId]);

  const names = Object.fromEntries([...celestialBodies, ...dwarfPlanets, moonBody].map(body => [body.id, body.name[locale]]));
  const nameOf = id => names[id] || t.sun;
  const focus = id => {
    setSelectedId(id);
    setDetailsCollapsed(false);
    setFocusRequest(value => value + 1);
    setLessonId(null);
  };
  const overview = () => {
    setSelectedId(null);
    setLessonId(null);
    setFocusRequest(value => value + 1);
  };
  const chooseView = id => {
    setViewId(id);
    setViewRequest(value => value + 1);
  };
  const cycleView = () => {
    const views = ['orbit','top','side','close','wide'];
    chooseView(views[(views.indexOf(viewId) + 1) % views.length]);
  };
  const selectMode = next => {
    setMode(next);
    setLessonId(null);
    if (next !== 'learn') setJourneyStep(-1);
    if (next === 'deep-sky' && learningLevel.depth < 3) setDeepSkyView('bank');
    if (next === 'stars') {
      setSelectedExoplanetId(selectedStarSystem.planets[0]?.id || '');
      setIsPaused(false);
    }
    if (next === 'quiz') {
      setQuizIndex(0);
      setQuizAnswer(null);
      setIsPaused(true);
    } else if (next !== 'learn') setIsPaused(false);
  };
  const startJourney = () => {
    setJourneyStep(0);
    focus(guidedJourney[0].planet);
    setIsPaused(false);
  };
  const advanceJourney = () => {
    if (journeyStep >= guidedJourney.length - 1) {
      selectMode('quiz');
      return;
    }
    const nextStep = journeyStep + 1;
    setJourneyStep(nextStep);
    focus(guidedJourney[nextStep].planet);
    setIsPaused(false);
  };
  const restartJourney = () => {
    setJourneyStep(-1);
    setSelectedId(null);
    setLessonId(null);
    setFocusRequest(value => value + 1);
  };
  const chooseAnswer = id => {
    if (quizAnswer || !quiz) return;
    setQuizAnswer(id);
    if (id === quiz.correct) setNotice(t.correct);
  };
  const nextQuestion = () => {
    setQuizAnswer(null);
    setQuizIndex(value => Math.min(value + 1, quizzes.length));
  };
  const moonCount = body => body.moonsChanging
    ? `${t.countChanging} · ${body.moons} ${t.moonsKnown}`
    : body.moons === 0 ? t.moonNone : `${body.moons} ${body.moons === 1 ? t.moonKnown : (locale === 'fr' ? 'lunes connues' : t.moonsKnown)}`;
  const localizeQuizName = id => planetById[id]?.name[locale] || t[id === 'star' ? 'answerStar' : id === 'planet' ? 'answerPlanet' : id === 'moon' ? 'answerMoon' : id === 'rotation' ? 'answerRotation' : id === 'revolution' ? 'answerRevolution' : id === 'moonMotion' ? 'answerMoonMotion' : id === 'tilt' ? 'answerTilt' : id === 'distance' ? 'answerDistance' : id === 'orbit' ? 'answerOrbit' : 'answerSunHeat'];

  useEffect(() => {
    try { window.localStorage.setItem('futur-haiti-learning-level', learningLevel.id); } catch { /* Keep the current choice for this visit. */ }
  }, [learningLevel.id]);

  return (
    <div className="app-frame">
      <header className="topbar">
        <button className="brand" onClick={overview} aria-label="Futur Haiti, accueil">
          <span className="brand-mark">✦</span><span><strong>FUTUR <b>HAITI</b></strong><small>{t.appTag}</small></span>
        </button>
      <div className="topbar-center"><span className="system-live"/>{mode === 'stars' ? selectedStarSystem.name[locale] : mode === 'deep-sky' ? t.deepSkyTitle : t.factSolarSystem}<span className="topbar-separator">·</span><span className="muted-label">{t.modePed}</span></div>
        <div className="topbar-actions">
          <div className="language-switch" aria-label="Langue">
            <button className={locale === 'fr' ? 'active' : ''} onClick={() => setLocale('fr')}>FR</button>
            <button className={locale === 'ht' ? 'active' : ''} onClick={() => setLocale('ht')}>KREYÒL</button>
          </div>
          <button className="about-button" onClick={() => setAboutOpen(true)}>{t.about}</button>
        </div>
      </header>

      <main className={'explorer-layout ' + (mode === 'compare' ? 'compare-mode' : '')}>
        <aside className="sidebar">
          <div className="side-heading"><span className="eyebrow">{t.navTitle}</span><h1>{t.headline}</h1><p>{t.subhead}</p></div>
          <section className="learning-level-picker" aria-label={locale === 'fr' ? 'Parcours scolaire' : 'Nivo lekòl'}>
            <label htmlFor="learning-level-select"><span className="eyebrow">{locale === 'fr' ? 'PARCOURS SCOLAIRE' : 'PAROU LEKÒL'}</span><select id="learning-level-select" value={learningLevel.id} onChange={event => { const next = learningLevels.find(item => item.id === event.target.value) || learningLevels[0]; setLearningLevelId(next.id); if (next.depth < 3 && mode === 'stars') setMode('explore'); if (next.depth < 2 && dwarfPlanetById[selectedId]) setSelectedId(null); if (next.depth < 3) setDeepSkyView('bank'); }}>
              {learningLevels.map(item => <option key={item.id} value={item.id}>{item.title[locale]} · {item.grades[locale]}</option>)}
            </select></label>
            <p>{learningLevel.summary[locale]}</p>
            <details><summary>{locale === 'fr' ? 'Lien avec le programme' : 'Rapò ak pwogram nan'}</summary><p>{learningLevel.curriculum[locale]}</p><small>{locale === 'fr' ? 'Adaptation éducative indépendante; elle ne certifie pas le programme d’une école.' : 'Adaptasyon edikatif endepandan; li pa sètifye pwogram okenn lekòl.'}</small><div>{curriculumSources.map(source => <a href={source.href} target="_blank" rel="noreferrer" key={source.href}>{source.label[locale]} ↗</a>)}</div></details>
          </section>
          <nav className="mode-tabs" aria-label={t.navTitle}>
            {[
              ['explore',t.explore,'⌖'],['learn',t.learn,'✧'],...(learningLevel.depth >= 3 ? [['stars',t.stars,'✦']] : []),...(learningLevel.depth >= 2 ? [['compare',t.compare,'◫']] : []),['quiz',t.quiz,'？'],['deep-sky',t.deepSkyTab,'◎'],
            ].map(([id,label,icon]) => <button key={id} className={mode === id ? 'active' : ''} onClick={() => selectMode(id)}><span className="nav-symbol">{icon}</span>{label}</button>)}
          </nav>

          {mode === 'explore' && <>
            <div className="planet-list-block">
              <div className="section-caption">{t.planets}<span>09</span></div>
              <div className="planet-list">
                <button className={'planet-row ' + (selectedId === 'sun' ? 'selected' : '')} onClick={() => focus('sun')}>
                  <span className="planet-swatch swatch-sun"><i/></span><span className="planet-row-name">{t.sun}</span><span className="planet-index">☼</span>
                </button>
                {celestialBodies.map((body,index) => <button key={body.id} className={'planet-row ' + (selectedId === body.id ? 'selected' : '')} onClick={() => focus(body.id)}>
                  <span className={'planet-swatch swatch-' + body.id}><i/></span><span className="planet-row-name">{nameOf(body.id)}</span>
                  {body.id === 'earth' && <span className="home-tag">{t.home}</span>}<span className="planet-index">{String(index + 1).padStart(2,'0')}</span>
                </button>)}
              </div>
              {visibleDwarfPlanets.length > 0 && <><div className="dwarf-explore-heading">{t.dwarfExploreTitle}</div><div className="planet-list dwarf-explore-list" role="group" aria-label={t.dwarfPlanetsHeading}>
                {visibleDwarfPlanets.map(body => <button key={body.id} className={'planet-row ' + (selectedId === body.id ? 'selected' : '')} onClick={() => focus(body.id)}>
                  <span className="planet-swatch dwarf-swatch" style={{'--dwarf-color':body.color}}><i/></span><span className="planet-row-name">{nameOf(body.id)}</span><span className="planet-kind-tag">{body.diameterKm.toLocaleString(locale === 'fr' ? 'fr-FR' : 'fr-FR')} km</span>
                </button>)}
              </div></>}
            </div>
            <div className="side-actions">
              <button className="secondary-action" onClick={overview}><span>◎</span>{t.overview}<b>↗</b></button>
              <button className="secondary-action wow-action" onClick={() => focus('saturn')}><span>⌁</span>{t.wow}<b>→</b></button>
            </div>
          </>}

          {mode === 'learn' && <div className="lesson-list-block">
            <div className="section-caption">{t.guide}<span>05</span></div><p className="side-intro">{t.learnIntro}</p>
            <div className="learning-path"><strong>{t.learningPathTitle}</strong><small>{t.learningPathCaption}</small><div className="learning-path-track"><span className="learning-path-step">{t.learningEarth}</span><span className="learning-path-step">{t.learningSolar}</span><span className="learning-path-step">{t.learningGalaxy}</span><span className="learning-path-step">{t.learningUniverse}</span></div></div>
            <section className="moon-worlds" aria-labelledby="moon-worlds-title">
              <div className="moon-worlds-heading"><span>◔</span><div><h2 id="moon-worlds-title">{t.moonWorldsTitle}</h2><p>{t.moonWorldsIntro}</p></div></div>
              <div className="moon-parent-tabs" role="group" aria-label={t.moonWorldsTitle}>
                {['saturn','jupiter','uranus','neptune'].map(id => <button key={id} className={moonParentId === id ? 'active' : ''} aria-pressed={moonParentId === id} onClick={() => { setMoonParentId(id); setSelectedMoonId(majorMoons.find(moon => moon.planet === id).id); }}>{t[`moonParent${id[0].toUpperCase()}${id.slice(1)}`]}</button>)}
              </div>
              <div className="moon-size-list" role="group" aria-label={t.moonScaleLabel}>
                {visibleMoons.map(moon => <button key={moon.id} className={'moon-size-choice ' + (selectedMoonId === moon.id ? 'active' : '')} aria-pressed={selectedMoonId === moon.id} onClick={() => setSelectedMoonId(moon.id)}>
                  <span className="moon-size-orb" style={{'--moon-ratio':moon.diameterKm / 5268, '--moon-color':moon.color}} aria-hidden="true"/><strong>{moon.name[locale]}</strong><small>{moon.diameterKm.toLocaleString('fr-FR')} km</small>
                </button>)}
              </div>
              <article className="moon-world-detail" aria-live="polite">
                <span className="moon-preview-orb" style={{'--moon-ratio':selectedMoon.diameterKm / 5268, '--moon-color':selectedMoon.color}} aria-hidden="true"/>
                <div><span className="eyebrow">{t.moonPreviewLabel}</span><h3>{selectedMoon.name[locale]} · {selectedMoon.diameterKm.toLocaleString('fr-FR')} km</h3><small className="moon-water-status">{selectedMoon.status[locale]}</small><p><strong>{t.moonWaterLabel}:</strong> {selectedMoon.water[locale]}</p></div>
              </article>
              <div className="moon-world-sources"><a href="https://ssd.jpl.nasa.gov/sats/phys_par/sep.html" target="_blank" rel="noreferrer">{t.moonSources}</a><a href="https://science.nasa.gov/solar-system/ocean-worlds/" target="_blank" rel="noreferrer">{locale === 'fr' ? 'Titan et les mondes océaniques ↗' : 'Titàn ak monn oseyanik yo ↗'}</a><a href="https://science.nasa.gov/mission/cassini/science/enceladus/" target="_blank" rel="noreferrer">Encelade · NASA ↗</a><a href="https://science.nasa.gov/photojournal/major-moons-of-uranus/" target="_blank" rel="noreferrer">{locale === 'fr' ? 'Modèles des lunes d’Uranus ↗' : 'Modèl lalin Iranis yo ↗'}</a><a href="https://science.nasa.gov/resource/ocean-worlds-triton/" target="_blank" rel="noreferrer">Triton · NASA ↗</a></div>
            </section>
            <section className="guided-mission" aria-label={t.journeyTitle}>
              <div className="guided-mission-kicker"><span>✦</span>{t.journeyTitle}</div>
              {journeyStep < 0 ? <><p>{t.journeyIntro}</p><button className="guided-primary" onClick={startJourney}>{t.journeyStart} <b>→</b></button></> : <>
                <div className="guided-progress-label"><span>{t.journeyStep} {journeyStep + 1} {t.journeyOf} {guidedJourney.length}</span><span>{Math.round((journeyStep + 1) / guidedJourney.length * 100)}%</span></div>
                <div className="guided-progress" role="progressbar" aria-valuemin="0" aria-valuemax={guidedJourney.length} aria-valuenow={journeyStep + 1}><i style={{width:`${(journeyStep + 1) / guidedJourney.length * 100}%`}}/></div>
                <h2>{t[guidedJourney[journeyStep].title]}</h2><p>{t[guidedJourney[journeyStep].body]}</p>
                {journeyStep === guidedJourney.length - 1 && <div className="guided-scale-facts"><span>{t.journeyEarthValue}</span><span>{t.journeyJupiterValue}</span><span>{t.journeySunValue}</span></div>}
                <div className="guided-actions"><button className="guided-reset" onClick={restartJourney}>{t.journeyRestart}</button><button className="guided-primary" onClick={advanceJourney}>{journeyStep === guidedJourney.length - 1 ? t.journeyCheck : t.journeyNext} <b>→</b></button></div>
              </>}
            </section>
            <section className="moon-model" aria-labelledby="moon-model-title">
              <div className="moon-model-heading"><span>☾</span><div><h2 id="moon-model-title">{t.moonModelTitle}</h2><p>{t.moonModelIntro}</p></div></div>
              <svg className="moon-model-diagram" viewBox="0 0 356 204" role="img" aria-label={`${t.moonSunLabel}, ${t.moonEarthLabel}, ${t.moonMoonLabel}: ${t.moonPhaseNames[moonPhaseIndex]}`}>
                <defs><radialGradient id="moonModelSun"><stop stopColor="#fff3bd"/><stop offset=".7" stopColor="#ffc34b"/><stop offset="1" stopColor="#ef812f"/></radialGradient><radialGradient id="moonModelEarth"><stop stopColor="#64bce9"/><stop offset=".75" stopColor="#2874bd"/><stop offset="1" stopColor="#152a57"/></radialGradient><marker id="moonModelArrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 7 3.5 0 7z" fill="#f1c66b"/></marker></defs>
                <path d="M66 102H132" stroke="#f1c66b" strokeOpacity=".65" strokeDasharray="4 5" markerEnd="url(#moonModelArrow)"/><text x="98" y="91" textAnchor="middle">{t.moonSunLabel}</text>
                <circle cx="178" cy="102" r="66" fill="none" stroke="#8292b7" strokeOpacity=".38" strokeDasharray="3 5"/>
                <circle cx="178" cy="102" r="21" fill="url(#moonModelEarth)" stroke="#9edaff" strokeOpacity=".6"/><path d="M163 101q7-13 16-7t16 1M164 108q10-5 15 3t14-1" fill="none" stroke="#75d6aa" strokeOpacity=".65" strokeWidth="3"/>
                <circle cx={moonPosition.x} cy={moonPosition.y} r="8" fill="#d9d6cb" stroke="#fff4d2" strokeWidth="1.5"/><circle cx={moonPosition.x-2} cy={moonPosition.y-2} r="2" fill="#a5a295" opacity=".6"/><circle cx={moonPosition.x+3} cy={moonPosition.y+2} r="1.5" fill="#99968d" opacity=".55"/>
                <circle cx="35" cy="102" r="23" fill="url(#moonModelSun)"/><text x="35" y="139" textAnchor="middle">{t.sun}</text><text x="178" y="143" textAnchor="middle">{t.moonEarthLabel}</text><text x={moonPosition.x} y={moonPosition.y+20} textAnchor="middle">{t.moonMoonLabel}</text>
              </svg>
              <div className="moon-phase-result"><span className="moon-phase-glyph" aria-hidden="true">{['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'][moonPhaseIndex]}</span><div><strong>{t.moonPhaseNames[moonPhaseIndex]}</strong><small>{t.moonIllumination} · {moonIlluminationPercent}%</small></div></div>
              <label className="moon-phase-control" htmlFor="moon-phase-slider"><span>{t.moonPhaseLabel}</span><output htmlFor="moon-phase-slider">{moonAngle}°</output><input id="moon-phase-slider" type="range" min="0" max="359" step="1" value={moonAngle} onChange={event => setMoonAngle(Number(event.target.value))} aria-valuetext={`${t.moonPhaseNames[moonPhaseIndex]}, ${moonIlluminationPercent}%`}/></label>
              <p className="moon-model-fact">{t.moonOrbitFact}</p><p className="moon-eclipse-note">{t.moonEclipseNote}</p><small className="moon-model-scale-note">{t.moonScaleNote}</small>
            </section>
            {learningLevel.depth >= 2 && <details className="small-worlds">
              <summary><span className="small-worlds-mark">✧</span><span><strong>{t.smallWorldsTitle}</strong><small>{t.smallWorldsIntro}</small></span><b>⌄</b></summary>
              <div className="small-worlds-content">
                <div className="small-worlds-section-title"><strong>{t.dwarfPlanetsHeading}</strong><span>{t.dwarfPlanetsStatus}</span></div>
                <p className="small-worlds-definition">{t.dwarfPlanetsDefinition}</p>
                <div className="dwarf-planet-picker" role="group" aria-label={t.dwarfPlanetsHeading}>
                  {visibleDwarfPlanets.map(body => <button key={body.id} className={dwarfPlanetId === body.id ? 'active' : ''} aria-pressed={dwarfPlanetId === body.id} onClick={() => { setDwarfPlanetId(body.id); focus(body.id); }}><i style={{'--dwarf-color':body.color}}/>{body.name[locale]}</button>)}
                </div>
                <article className="dwarf-planet-fact"><span className="dwarf-planet-orb" style={{'--dwarf-color':selectedDwarfPlanet.color}}/><div><strong>{selectedDwarfPlanet.name[locale]} · {selectedDwarfPlanet.diameterKm.toLocaleString('fr-FR')} km</strong><p>{selectedDwarfPlanet.fact[locale]}</p></div></article>
                <small className="dwarf-candidate-note">{t.moreCandidates}</small>
                <div className="small-worlds-section-title small-body-heading"><strong>{t.smallBodyHeading}</strong></div>
                <div className="small-body-cards"><article><span>◌</span><div><strong>{t.asteroidsLabel}</strong><p>{t.asteroidsFact}</p></div></article><article><span>☄</span><div><strong>{t.cometsLabel}</strong><p>{t.cometsFact}</p></div></article><article><span>✦</span><div><strong>{t.meteorChainLabel}</strong><p>{t.meteorChainFact}</p></div></article></div>
                <div className="small-worlds-sources"><a href="https://science.nasa.gov/dwarf-planets/" target="_blank" rel="noreferrer">NASA · {t.dwarfPlanetsHeading} ↗</a><a href="https://spaceplace.nasa.gov/asteroid-or-meteor/en/" target="_blank" rel="noreferrer">NASA Space Place · {t.smallBodyHeading} ↗</a></div>
              </div>
            </details>}
            {lessons.map(item => <button key={item.id} className={'lesson-card ' + (lessonId === item.id ? 'active' : '')} onClick={() => setLessonId(item.id)}>
              <span className="lesson-symbol">{item.symbol}</span><span><strong>{t[item.title]}</strong><small>{t[item.subtitle]}</small></span><i>↗</i>
            </button>)}
            {lesson && <div className="lesson-explanation"><span className="eyebrow">{t.learnTitle}</span><p>{t[lesson.body]}</p><button onClick={() => { setLessonId(null); setIsPaused(false); }}>{t.stopLesson}</button></div>}
          </div>}

          {mode === 'stars' && <div className="star-catalog">
            <div className="section-caption">{locale === 'fr' ? 'OBJETS STELLAIRES' : 'OBJÈ ETWAL'}<span>{String(starTypes.length).padStart(2,'0')}</span></div>
            <div className="star-mode-tabs" role="tablist" aria-label={locale === 'fr' ? 'Explorer les étoiles' : 'Eksplore etwal yo'}>
              <button role="tab" aria-selected={starTab === 'types'} className={starTab === 'types' ? 'active' : ''} onClick={() => setStarTab('types')}>{locale === 'fr' ? 'Types d’étoiles' : 'Kalite etwal'}</button>
              <button role="tab" aria-selected={starTab === 'systems'} className={starTab === 'systems' ? 'active' : ''} onClick={() => setStarTab('systems')}>{locale === 'fr' ? 'Autres systèmes stellaires' : 'Lòt sistèm etwal'}</button>
            </div>
            {starTab === 'types' ? <>
              <p className="star-catalog-intro"><strong>{locale === 'fr' ? 'Étoiles et restes stellaires' : 'Etwal ak rès etwal'}</strong> {locale === 'fr' ? 'Approfondissement de culture scientifique : explore leur évolution, leur taille et ce qu’ils émettent.' : 'Apwofondisman kilti syantifik: eksplore evolisyon yo, gwosè yo ak sa yo emèt.'}</p>
              <div className="star-type-picker" role="group" aria-label={locale === 'fr' ? 'Types d’étoiles' : 'Kalite etwal'}>{starTypes.map(item => <button key={item.id} className={selectedStarTypeId === item.id ? 'active' : ''} aria-pressed={selectedStarTypeId === item.id} onClick={() => setSelectedStarTypeId(item.id)}><i className={'star-type-dot ' + item.className}/><span>{item.title[locale]}</span></button>)}</div>
              <article className="star-type-facts"><strong>{selectedStarType.title[locale]}</strong><small>{selectedStarType.kind[locale]}</small><p>{selectedStarType.fact[locale]}</p><section className="star-learning" aria-label={locale === 'fr' ? 'En savoir plus' : 'Aprann plis'}><h3>{locale === 'fr' ? 'Pour vraiment comprendre' : 'Pou byen konprann'}</h3><div className="star-learning-block key-idea"><strong>{locale === 'fr' ? 'L’idée essentielle' : 'Sa ki pi enpòtan pou sonje'}</strong><p>{selectedStarTakeaway}</p></div><div className="star-learning-block"><strong>{locale === 'fr' ? 'Comment fonctionne cet objet ?' : 'Kijan objè sa a fonksyone?'}</strong><p>{selectedStarLearning.understand}</p></div>{selectedStarLearning.jet && <div className="star-learning-block pulsar-jet-explanation"><strong>{locale === 'fr' ? 'Le jet montré dans le modèle' : 'Jè modèl la montre a'}</strong><p>{pulsarJetExplanation[locale]}</p></div>}<div className="star-learning-block comparison"><strong>{locale === 'fr' ? 'Une comparaison pour se représenter l’échelle' : 'Yon konparezon pou konprann gwosè a'}</strong><p>{selectedStarLearning.comparison}</p></div><div className="star-learning-block anecdote"><strong>{locale === 'fr' ? 'Le saviez-vous ?' : 'Èske w te konnen?'}</strong><p>{selectedStarLearning.anecdote}</p></div>{selectedStarLearning.source && <a className="star-learning-source" href={selectedStarLearning.source} target="_blank" rel="noreferrer">NASA · {locale === 'fr' ? 'en savoir plus' : 'pou aprann plis'} ↗</a>}</section><div className="star-type-metrics"><span>{locale === 'fr' ? 'Taille' : 'Gwosè'}<b>{selectedStarType.size[locale]}</b></span><span>{locale === 'fr' ? 'Couleur / température' : 'Koulè / tanperati'}<b>{selectedStarType.temperature[locale]}</b></span></div><section className="star-emission"><b>{locale === 'fr' ? 'Ce qu’il émet / produit' : 'Sa li emèt / pwodui'}</b><p>{selectedStarType.emission[locale]}</p></section><a href={selectedStarType.source} target="_blank" rel="noreferrer">{locale === 'fr' ? 'Source scientifique' : 'Sous syantifik'} ↗</a></article>
              <p className="star-type-caveat">{locale === 'fr' ? 'La galerie mélange des étoiles, une phase de formation et des restes stellaires. Pulsars et magnétars sont des étoiles à neutrons; une supernova est l’explosion, pas une étoile permanente. Les modèles sont agrandis et schématiques.' : 'Galri sa a gen etwal, yon etap fòmasyon ak rès etwal. Pilsar ak mayetà se etwal netwon; sipènova se eksplozyon an, se pa yon etwal pèmanan. Modèl yo elaji epi rete senbolik.'}</p>
              <p className="star-type-caveat">{locale === 'fr' ? 'Naine ou massive décrit surtout la taille et la masse; géante rouge décrit une étape de l’évolution.' : 'Tinen oswa masiv pale sitou de gwosè ak mas; jeyan wouj dekri yon etap nan evolisyon.'}</p>
            </> : <>
              <p className="star-catalog-intro"><strong>{t.starsTitle}</strong> {t.starsIntro}</p><p className="star-catalog-prompt">{t.starsChoose}</p>
              <div className="star-system-picker" role="group" aria-label={t.starsSection}>{starSystems.map(system => <button key={system.id} className={starSystemId === system.id ? 'active' : ''} aria-pressed={starSystemId === system.id} onClick={() => { setStarSystemId(system.id); setSelectedExoplanetId(system.planets[0]?.id || ''); }}><i style={{'--star-color':system.color}}/><span><strong>{system.name[locale]}</strong><small>{system.distanceLy.toLocaleString('fr-FR')} {locale === 'fr' ? 'années-lumière' : 'ane-limyè'}</small></span></button>)}</div>
              <article className="star-system-facts"><div className="star-system-heading"><span className="star-orb-swatch" style={{'--star-color':selectedStarSystem.color}}/><span><strong>{selectedStarSystem.name[locale]}</strong><small>{selectedStarSystem.starType[locale]} · {selectedStarSystem.distanceLy.toLocaleString('fr-FR',{maximumFractionDigits:2})} {locale === 'fr' ? 'années-lumière' : 'ane-limyè'}</small></span></div><p>{selectedStarSystem.facts[locale]}</p>{selectedExoplanet ? <><div className="star-world-heading">{t.starsWorlds} · {selectedStarSystem.planets.length}</div><div className="star-world-picker" role="group" aria-label={t.starsWorlds}>{selectedStarSystem.planets.map(planet => <button key={planet.id} className={selectedExoplanetId === planet.id ? 'active' : ''} aria-pressed={selectedExoplanetId === planet.id} onClick={() => setSelectedExoplanetId(planet.id)}>{planet.name}</button>)}</div><small className="star-selected-world">{selectedExoplanet.name} · {selectedExoplanet.type[locale]}</small></> : <div className="star-no-planet">{t.starsNoPlanet}</div>}<p className="star-system-note">{selectedStarSystem.note[locale]}</p><a className="star-source-link" href={selectedStarSystem.source} target="_blank" rel="noreferrer">{t.starsSource} ↗</a></article>
            </>}
          </div>}

          {mode === 'deep-sky' && <div className="deep-sky-catalog">
            <div className="section-caption">{locale === 'fr' ? 'EXPLORER LE CIEL PROFOND' : 'EKSplore SYÈL FON AN'}<span>{deepSkyObjects.length}</span></div>
            <p className="deep-sky-sidebar-intro">{t.deepSkyIntro}</p>
            {deepSkyView === 'objects' && <div className="deep-sky-category-list" role="group" aria-label={t.deepSkyCategory}>
              {deepSkyCategories.map(category => <button key={category.id} className={deepSkyCategory.id === category.id ? 'active' : ''} aria-pressed={deepSkyCategory.id === category.id} onClick={() => { setDeepSkyCategoryId(category.id); setSelectedDeepSkyId(deepSkyObjects.find(item => item.category === category.id)?.id || 'm87'); }}><span>{category.icon}</span><strong>{category.label[locale]}</strong><small>{deepSkyObjects.filter(item => item.category === category.id).length}</small></button>)}
            </div>}
            <div className="deep-sky-view-tabs" role="tablist" aria-label={locale === 'fr' ? 'Affichage du ciel profond' : 'Fason pou gade syèl fon an'}>
              {learningLevel.depth >= 3 && <button role="tab" aria-selected={deepSkyView === 'objects'} className={deepSkyView === 'objects' ? 'active' : ''} onClick={() => setDeepSkyView('objects')}>{locale === 'fr' ? 'Objets' : 'Objè yo'}</button>}
              <button role="tab" aria-selected={deepSkyView === 'bank'} className={deepSkyView === 'bank' ? 'active' : ''} onClick={() => setDeepSkyView('bank')}>{locale === 'fr' ? `Banque d’images · ${deepSkyObjects.length}` : `Bank imaj · ${deepSkyObjects.length}`}</button>
            </div>
            {deepSkyView === 'bank' ? <>
              <p className="deep-sky-sidebar-intro">{locale === 'fr' ? 'Toutes les images sont parcourables ici. Choisis une famille pour filtrer.' : 'Ou ka gade tout imaj yo isit la. Chwazi yon kategori pou filtre.'}</p>
              <div className="deep-sky-bank-filters" role="group" aria-label={locale === 'fr' ? 'Filtrer les images' : 'Filtre imaj yo'}>
                <button className={deepSkyBankFilter === 'all' ? 'active' : ''} onClick={() => setDeepSkyBankFilter('all')}>{locale === 'fr' ? 'Tout' : 'Tout'}</button>
                {deepSkyCategories.map(category => <button key={category.id} className={deepSkyBankFilter === category.id ? 'active' : ''} onClick={() => { setDeepSkyBankFilter(category.id); const first = deepSkyObjects.find(item => item.category === category.id); if (first) selectBankImage(first.id); }}>{category.label[locale]}</button>)}
              </div>
              <div className="deep-sky-object-list" role="group" aria-label={locale === 'fr' ? 'Images disponibles' : 'Imaj ki disponib'}>
                {deepSkyBankItems.map(item => <button key={item.id} className={'deep-sky-object-row ' + (selectedDeepSky.id === item.id ? 'active' : '')} aria-pressed={selectedDeepSky.id === item.id} onClick={() => selectBankImage(item.id)}><img src={item.image} alt="" loading="lazy"/><span><strong>{item.name[locale]}</strong><small>{item.kind[locale]}</small></span><b>→</b></button>)}
              </div>
            </> : <>
            <div className="deep-sky-simulation-shortcuts" role="group" aria-label={locale === 'fr' ? 'Simulations de la vie des étoiles' : 'Similasyon sou lavi etwal yo'}>
              <span>{locale === 'fr' ? 'À VOIR EN 3D' : 'POU GADE AN 3D'}</span>
              <button type="button" onClick={() => openDeepSkySimulation('formation')}><i>✦</i><span><strong>{locale === 'fr' ? 'Naissance d’une étoile' : 'Nesans yon etwal'}</strong><small>{locale === 'fr' ? 'Du nuage au Soleil · 2 min' : 'Soti nan nyaj rive Solèy la · 2 min'}</small></span><b>↗</b></button>
              <button type="button" onClick={() => openDeepSkySimulation('supernova')}><i>✹</i><span><strong>{locale === 'fr' ? 'Mort d’une étoile massive' : 'Lanmò yon gwo etwal'}</strong><small>{locale === 'fr' ? 'Supernova et résidu · 36 s' : 'Sipènova ak rès etwal · 36 s'}</small></span><b>↗</b></button>
            </div>
            <div className="deep-sky-object-list" role="group" aria-label={deepSkyCategory.label[locale]}>
              {deepSkyCategoryItems.map(item => <button key={item.id} className={'deep-sky-object-row ' + (selectedDeepSky.id === item.id ? 'active' : '')} aria-pressed={selectedDeepSky.id === item.id} onClick={() => setSelectedDeepSkyId(item.id)}><img src={item.image} alt="" loading="lazy"/><span><strong>{item.name[locale]}</strong><small>{item.kind[locale]}</small></span><b>→</b></button>)}
            </div>
            </>}
          </div>}

          {mode === 'compare' && <div className="compare-panel">
            <div className="section-caption">{t.scale}<span>09</span></div><h2>{t.compareHeading}</h2><p>{t.scaleNote}</p>
            <div className="compare-world-selects">
              <label className="select-label">{t.firstWorld}<select value={compareId} onChange={event => { const nextId=event.target.value; setCompareId(nextId); if(nextId===compareReferenceId) setCompareReferenceId(compareId); }}>
                {comparisonWorlds.map(body => <option key={body.id} value={body.id}>{body.name[locale]}</option>)}
              </select></label>
              <label className="select-label">{t.secondWorld}<select value={compareReferenceId} onChange={event => { const nextId=event.target.value; setCompareReferenceId(nextId); if(nextId===compareId) setCompareId(compareReferenceId); }}>
                {comparisonWorlds.map(body => <option key={body.id} value={body.id}>{body.name[locale]}</option>)}
              </select></label>
            </div>
            <div className="size-comparison">
              <div className="size-planet"><span className={'compare-orb compare-orb-' + compare.id} style={{'--compare-color':compare.color,'--compare-diameter':`${Math.max(1.5,compare.earthDiameters*comparisonScale)}px`}} role="img" aria-label={`${compare.name[locale]} · ${compare.diameterKm.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')} km`}/><strong>{compare.name[locale]}</strong><small>{compare.diameterKm.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')} km</small></div>
              <div className="size-divider"><span>VS</span><small>{diameterRatio.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US',{maximumFractionDigits:1})}×</small></div>
              <div className="size-planet"><span className={'compare-orb compare-orb-' + compareReference.id} style={{'--compare-color':compareReference.color,'--compare-diameter':`${Math.max(1.5,compareReference.earthDiameters*comparisonScale)}px`}} role="img" aria-label={`${compareReference.name[locale]} · ${compareReference.diameterKm.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')} km`}/><strong>{compareReference.name[locale]}</strong><small>{compareReference.diameterKm.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')} km</small></div>
            </div>
            <p className="comparison-scale-label">{t.diameterVisual}<span>{nameOf(largerWorld.id)} / {nameOf(smallerWorld.id)} · {diameterRatio.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US',{maximumFractionDigits:1})}×</span></p>
            <div className="compare-metrics">
              <div><span>{t.diameterCompare}</span><strong>{compare.diameterKm.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')} km <i>·</i> {compareReference.diameterKm.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')} km</strong></div>
              <div><span>{t.distanceCompare}</span><strong>{compare.distanceAu} UA <i>·</i> {compareReference.distanceAu} UA</strong></div>
              <div><span>{t.massCompare}</span><strong>{compare.massEarth.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')}× <i>·</i> {compareReference.massEarth.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')}×</strong></div>
              <div><span>{t.gravityCompare}</span><strong>{compare.gravityEarth}× <i>·</i> {compareReference.gravityEarth}×</strong></div>
              <div><span>{t.dayCompare}</span><strong>{compare.day[locale]} <i>·</i> {compareReference.day[locale]}</strong></div>
              <div><span>{t.yearCompare}</span><strong>{compare.year[locale]} <i>·</i> {compareReference.year[locale]}</strong></div>
              <div><span>{t.temperatureCompare}</span><strong>{compare.temperature[locale]} <i>·</i> {compareReference.temperature[locale]}</strong></div>
            </div>
            <button className="outline-button" onClick={() => { const worldToExplore = compare.id === 'sun' ? compareReference.id : compare.id; selectMode('explore'); focus(worldToExplore); }}>{t.explore} {compare.id === 'sun' ? compareReference.name[locale] : compare.name[locale]} <b>→</b></button>
          </div>}

          {mode === 'quiz' && <div className="quiz-panel">
            {quizIndex >= quizzes.length ? <><span className="quiz-finish">✦</span><h2>{t.quizDone}</h2><button className="outline-button" onClick={() => { setQuizIndex(0); setQuizAnswer(null); }}>{t.restartQuiz}</button></> : <>
              <span className="quiz-kicker">{t.question} {quizIndex + 1} / {quizzes.length}</span><h2>{t[quiz.key]}</h2>
              <div className="quiz-options">{quiz.options.map(id => {
                const answered = quizAnswer !== null;
                const right = id === quiz.correct;
                const chosenWrong = id === quizAnswer && !right;
                return <button key={id} disabled={answered} className={'quiz-option ' + (answered && right ? 'correct ' : '') + (chosenWrong ? 'wrong' : '')} onClick={() => chooseAnswer(id)}>
                  {planetById[id] ? <span className={'planet-swatch swatch-' + id}><i/></span> : <span className="quiz-symbol">{id === 'star' ? '✦' : id === 'tilt' ? '∠' : '↻'}</span>}{localizeQuizName(id)}{answered && right && <b>✓</b>}{chosenWrong && <b>×</b>}
                </button>;
              })}</div>
              {quizAnswer && <div className={'quiz-feedback ' + (quizAnswer === quiz.correct ? 'good' : '')}><strong>{quizAnswer === quiz.correct ? t.correct : t.incorrect}</strong><p>{t[quiz.explanation] || planetById[quiz.correct]?.fact[locale]}</p><button onClick={nextQuestion}>{quizIndex + 1 === quizzes.length ? t.quizDone : t.continueQuiz} →</button></div>}
            </>}
          </div>}
          <div className="sidebar-footnote"><span>i</span><p>{t.scaleNote}</p></div>
        </aside>

        <section className={'stage-column ' + (mode === 'explore' && (selected || selectedId === 'sun') && !detailsCollapsed ? 'has-planet-detail' : '') + (mode === 'stars' ? ' stellar-mode' : '') + (mode === 'stars' && starTab === 'types' ? ' star-types-mode' : '') + (mode === 'deep-sky' ? ' deep-sky-mode' : '')} aria-label={mode === 'stars' ? t.starsSection : mode === 'deep-sky' ? t.deepSkyTitle : t.explore}>
          {mode === 'stars' && <>
              {starTab === 'types' ? <div className={'star-types-display ' + selectedStarType.className}><div className="star-dust"/><div className="star-visual"><StellarSphereScene starType={selectedStarType} locale={locale} jetArrowRef={pulsarJetArrowRef} jetLabelRef={pulsarJetLabelRef}/></div><div className="star-types-heading"><span className="eyebrow">{locale === 'fr' ? 'PORTRAITS D’ÉTOILES' : 'PÒTRE ETWAL'}</span><h2>{selectedStarType.title[locale]}</h2><p>{selectedStarType.kind[locale]}</p></div>{selectedStarType.id === 'pulsar' && <><svg className="pulsar-jet-arrow" aria-hidden="true"><defs><marker id="pulsar-arrow-head" markerWidth="7" markerHeight="7" refX="1" refY="3.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M7 0 0 3.5 7 7"/></marker></defs><path ref={pulsarJetArrowRef} markerEnd="url(#pulsar-arrow-head)"/></svg><aside ref={pulsarJetLabelRef} className="pulsar-jet-label"><span><strong>{locale === 'fr' ? 'Jet de particules' : 'Jè patikil'}</strong><small>{locale === 'fr' ? 'flux vers l’espace' : 'kouran k ap soti nan lespas'}</small></span></aside></>}<p className="star-interaction-hint">{locale === 'fr' ? 'Glisser pour tourner · molette ou pincement pour zoomer' : 'Trennen pou vire · woulo oswa pense pou rale'}</p><div className="star-types-caption">{selectedStarType.modelCaption[locale]}</div></div> : <>
              <Suspense fallback={<div className="scene-loading"><span>✦</span><strong>{locale === 'fr' ? 'Préparation de la scène stellaire…' : 'N ap prepare sèn etwal la…'}</strong></div>}><StarSystemScene system={selectedStarSystem} locale={locale} onSelectPlanet={setSelectedExoplanetId}/></Suspense>
              <div className="stellar-stage-heading"><span className="eyebrow">{t.starsSection}</span><h2>{selectedStarSystem.name[locale]}</h2><p>{selectedStarSystem.starType[locale]} · {selectedStarSystem.distanceLy.toLocaleString('fr-FR',{maximumFractionDigits:2})} {locale === 'fr' ? 'années-lumière de la Terre' : 'ane-limyè ak Latè'}</p></div><div className="stellar-stage-note"><span>✦</span><p>{selectedExoplanet ? selectedExoplanet.name + ' · ' + selectedExoplanet.type[locale] : t.starsNoPlanet}<small>{t.starsModel}</small></p></div><div className="stellar-stage-help">{t.starsSelectWorld}</div>
            </>}
          </>}
          {mode === 'deep-sky' && <div className="deep-sky-stage">
            <div className="deep-sky-stage-scroll">
              {deepSkyView === 'bank' ? <>
                <header className="deep-sky-heading deep-sky-bank-heading"><span className="eyebrow">{locale === 'fr' ? 'IMAGES D’OBSERVATOIRES' : 'IMAJ OBSÈVATWA YO'}</span><h2>{locale === 'fr' ? 'Banque d’images du ciel profond' : 'Bank imaj syèl fon an'}</h2><p>{locale === 'fr' ? `${deepSkyBankItems.length} images d’observation · Hubble, Webb et autres observatoires` : `${deepSkyBankItems.length} imaj obsèvasyon · Hubble, Webb ak lòt obsèvatwa`}</p><small>{locale === 'fr' ? 'Une collection pour explorer : toutes ces notions ne font pas partie des attendus obligatoires de chaque niveau.' : 'Yon koleksyon pou eksplore: se pa tout sijè sa yo ki nan sa chak nivo oblije aprann.'}</small></header>
                <div className="deep-sky-bank-feature">
                  <figure className="deep-sky-bank-photo"><a href={selectedDeepSky.image} target="_blank" rel="noreferrer" aria-label={`${t.deepSkyOpenSource}: ${selectedDeepSky.name[locale]}`}><img src={selectedDeepSky.image} alt={`${t.deepSkyImageAlt} ${selectedDeepSky.name[locale]}`} loading="eager"/></a><figcaption>{selectedDeepSky.imageNote[locale]}<small>{t.deepSkyCredit}: {selectedDeepSky.credit}</small><a href={selectedDeepSky.source} target="_blank" rel="noreferrer">{t.deepSkyOpenSource}</a></figcaption></figure>
                  <article className="deep-sky-fact-card"><span className="deep-sky-observed-tag"><i/> {locale === 'fr' ? 'DONNÉES D’OBSERVATION' : 'DONE OBSÈVASYON'}</span><h3>{selectedDeepSky.name[locale]}</h3><p>{learningLevel.depth < 3 ? simpleDeepSkyDescriptions[selectedDeepSky.id]?.[locale] : selectedDeepSky.fact[locale]}</p>
                    {learningLevel.depth >= 2 && <div className="deep-sky-fact-block"><strong>{t.deepSkyDistance}</strong><p>{selectedDeepSky.distance[locale]}</p></div>}
                    {learningLevel.depth >= 3 && <><div className="deep-sky-fact-block"><strong>{t.deepSkyScale}</strong><p>{selectedDeepSky.scale[locale]}</p></div><div className="deep-sky-fact-block"><strong>{t.deepSkyWhatSee}</strong><p>{selectedDeepSky.imageNote[locale]}</p></div></>}
                    {learningLevel.depth >= 4 && <div className="deep-sky-fact-block deep-sky-takeaway"><strong>{locale === 'fr' ? 'À retenir' : 'Sa pou sonje'}</strong><p>{selectedDeepSkyTakeaway}</p></div>}
                  </article>
                </div>
                <section className="deep-sky-bank-grid-section"><div className="deep-sky-gallery-heading"><div><span className="eyebrow">{locale === 'fr' ? 'PARCOURIR LA COLLECTION' : 'GADE KOLEKSYON AN'}</span><p>{locale === 'fr' ? 'Choisis une image pour en lire la fiche.' : 'Chwazi yon imaj pou li enfòmasyon sou li.'}</p></div><span>{String(deepSkyBankItems.length).padStart(2,'0')}</span></div>
                  <div className="deep-sky-bank-grid">{deepSkyBankItems.map(item => <button key={item.id} className={item.id === selectedDeepSky.id ? 'active' : ''} aria-pressed={item.id === selectedDeepSky.id} onClick={() => selectBankImage(item.id)}><img src={item.image} alt="" loading="lazy"/><span><strong>{item.name[locale]}</strong><small>{item.kind[locale]}</small></span></button>)}</div>
                </section>
                <p className="deep-sky-footer-note">{locale === 'fr' ? 'Ces images sont issues d’observations réelles. Certaines sont des compositions de plusieurs filtres; les couleurs rendent alors visibles des longueurs d’onde invisibles à l’œil. M87* et Sagittarius A* sont des reconstructions radio de l’EHT.' : 'Imaj sa yo soti nan obsèvasyon reyèl. Kèk ladan yo se konpozisyon plizyè filtè; koulè yo fè longèdonn je nou pa wè yo parèt. M87* ak Sagittarius A* se rekonstriksyon radyo EHT.'}</p>
              </> : <>
              <header className="deep-sky-heading"><span className="eyebrow">{deepSkyCategory.label[locale]}</span><h2>{selectedDeepSky.name[locale]}</h2><p>{selectedDeepSky.kind[locale]} <i>·</i> {selectedDeepSky.distance[locale]}</p></header>
              {deepSkyCategory.id === 'black-holes' ? <>
                <div className="black-hole-feature">
                  <section className="black-hole-model-card" aria-labelledby="black-hole-model-title">
                    <div className="black-hole-model-label"><span>✦</span><div><strong id="black-hole-model-title">{t.deepSkyModel}</strong><small>{t.deepSkySimulationLabel}</small></div></div>
                    <BlackHoleScene locale={locale}/>
                    <p className="black-hole-model-note">{t.deepSkySimulationNote}</p>
                  </section>
                  <article className="deep-sky-fact-card">
                    <span className="deep-sky-observed-tag"><i/> {t.deepSkyObserved}</span>
                    <h3>{selectedDeepSky.name[locale]}</h3>
                    <p>{selectedDeepSky.fact[locale]}</p>
                    <div className="deep-sky-fact-block"><strong>{t.deepSkyScale}</strong><p>{selectedDeepSky.scale[locale]}</p></div>
                    <div className="deep-sky-fact-block deep-sky-takeaway"><strong>{locale === 'fr' ? 'À retenir' : 'Sa pou sonje'}</strong><p>{selectedDeepSkyTakeaway}</p></div>
                    <figure className="deep-sky-feature-photo"><a href={selectedDeepSky.image} target="_blank" rel="noreferrer" aria-label={`${t.deepSkyOpenSource}: ${selectedDeepSky.name[locale]}`}><img src={selectedDeepSky.image} alt={`${t.deepSkyImageAlt} ${selectedDeepSky.name[locale]}`} loading="eager"/></a><figcaption>{selectedDeepSky.imageNote[locale]}<small>{t.deepSkyCredit} : {selectedDeepSky.credit}</small><a href={selectedDeepSky.source} target="_blank" rel="noreferrer">{t.deepSkyOpenSource}</a></figcaption></figure>
                  </article>
                </div>
                <p className="deep-sky-photo-note">{t.deepSkyImageExplanation}</p>
              </> : <div className="deep-sky-object-feature">
                <figure className="deep-sky-hero-image"><a href={selectedDeepSky.image} target="_blank" rel="noreferrer" aria-label={`${t.deepSkyOpenSource}: ${selectedDeepSky.name[locale]}`}><img src={selectedDeepSky.image} alt={`${t.deepSkyImageAlt} ${selectedDeepSky.name[locale]}`} loading="eager"/></a><figcaption>{selectedDeepSky.imageNote[locale]}<small>{t.deepSkyCredit} : {selectedDeepSky.credit}</small><a href={selectedDeepSky.source} target="_blank" rel="noreferrer">{t.deepSkyOpenSource}</a></figcaption></figure>
                <article className="deep-sky-fact-card"><span className="deep-sky-observed-tag"><i/> {t.deepSkyObserved}</span><h3>{selectedDeepSky.name[locale]}</h3><p>{selectedDeepSky.fact[locale]}</p><div className="deep-sky-fact-block"><strong>{t.deepSkyScale}</strong><p>{selectedDeepSky.scale[locale]}</p></div><div className="deep-sky-fact-block deep-sky-takeaway"><strong>{locale === 'fr' ? 'À retenir' : 'Sa pou sonje'}</strong><p>{selectedDeepSkyTakeaway}</p></div><div className="deep-sky-fact-block"><strong>{t.deepSkyWhatSee}</strong><p>{selectedDeepSky.imageNote[locale]}</p></div></article>
              </div>}
              <section className="deep-sky-learning-more" aria-label={locale === 'fr' ? 'Comprendre cet objet' : 'Konprann objè sa a'}>
                <header><span className="eyebrow">{locale === 'fr' ? 'POUR ALLER PLUS LOIN' : 'POU APRANN PLIS'}</span><h3>{locale === 'fr' ? 'Comprendre cet objet pas à pas' : 'Konprann objè sa a etap pa etap'}</h3><p>{locale === 'fr' ? 'Une définition, un exemple observé et une comparaison pour interpréter ce que tu regardes.' : 'Yon eksplikasyon, yon egzanp yo obsève ak yon konparezon pou konprann sa w ap gade a.'}</p></header>
                <div className="deep-sky-learning-grid">{Object.entries(deepSkyLessonLabels).map(([key, labels]) => <article className={'deep-sky-learning-card ' + key} key={key}><strong>{labels[locale]}</strong><p>{selectedDeepSkyLesson[key][locale]}</p></article>)}</div>
              </section>
              {deepSkyCategory.id === 'nebulae' && <DeepSkySimulation scenario="formation" locale={locale}/>}
              {deepSkyCategory.id === 'explosions' && <DeepSkySimulation scenario="supernova" locale={locale}/>}
              <section className="deep-sky-gallery" aria-label={t.deepSkyPhotoLabel}>
                <div className="deep-sky-gallery-heading"><div><span className="eyebrow">{t.deepSkyPhotoLabel}</span><p>{deepSkyCategory.label[locale]} · {deepSkyCategoryItems.length} {t.deepSkyCount}</p></div><span>{String(deepSkyCategoryItems.length).padStart(2,'0')}</span></div>
                <div className="deep-sky-gallery-grid">{deepSkyCategoryItems.map(item => <button key={item.id} className={item.id === selectedDeepSky.id ? 'active' : ''} aria-pressed={item.id === selectedDeepSky.id} onClick={() => setSelectedDeepSkyId(item.id)}><img src={item.image} alt="" loading="lazy"/><span><strong>{item.name[locale]}</strong><small>{item.kind[locale]}</small></span></button>)}</div>
              </section>
              <p className="deep-sky-footer-note">{locale === 'fr' ? 'Les images sont fournies avec leur crédit et leur lien vers la source d’origine. Les clichés EHT sont des images radio reconstruites; les couleurs des vues Hubble et Webb peuvent être attribuées à des longueurs d’onde.' : 'Chak imaj gen kredi li ak lyen pou jwenn sous orijinal la. Imaj EHT yo se rekonstriksyon an onn radyo; koulè Hubble ak Webb yo ka reprezante longèdonn yo.'}</p>
              </>}
            </div>
          </div>}
          {mode !== 'deep-sky' && <div className="scene-topline"><span><i className="live-indicator"/>{selected ? nameOf(selected.id).toUpperCase() : selectedId === 'sun' ? t.sun.toUpperCase() : t.overview.toUpperCase()}{(selected || selectedId === 'sun') && <button className="planet-info-bubble" aria-expanded={!detailsCollapsed} aria-label={detailsCollapsed ? t.showDetails : t.hideDetails} onClick={() => setDetailsCollapsed(value => !value)}>{t.info}</button>}</span>
            <div className="scene-toggles">
              <button className={'label-toggle ' + (followPlanet ? 'on' : '')} aria-pressed={followPlanet} onClick={() => setFollowPlanet(value => !value)}><i/><span>{followPlanet ? t.followOn : t.followOff}</span></button>
              <button className={'label-toggle ' + (showLabels ? 'on' : '')} aria-pressed={showLabels} onClick={() => setShowLabels(value => !value)}><i/><span>{t.labels}</span></button>
            </div>
          </div>}
          {mode !== 'stars' && mode !== 'deep-sky' && !globeBodyId && <Suspense fallback={<div className="scene-loading"><span>✦</span><strong>Préparation de la scène 3D…</strong></div>}>
            <SolarScene selectedId={selectedId} visibleDwarfPlanets={visibleDwarfPlanets} onSelect={id => { setSelectedId(id); setDetailsCollapsed(false); setFocusRequest(value => value + 1); setLessonId(null); }} timeScale={timeScale} isPaused={isPaused || Boolean(globeBodyId)} focusRequest={focusRequest} viewId={viewId} viewRequest={viewRequest} showLabels={showLabels} followPlanet={followPlanet} locale={locale}/>
          </Suspense>}
          {mode !== 'deep-sky' && <div className="camera-view-picker" role="group" aria-label={t.cameraViews}>
            <button className="camera-next-button" aria-label={t.nextView} title={t.nextView} onClick={cycleView}><i>◉</i><span>{t[({orbit:'viewOrbit',top:'viewTop',side:'viewSide',close:'viewClose',wide:'viewWide'})[viewId]]}</span><b>↻</b></button>
          </div>}
          {mode !== 'deep-sky' && <div className="scene-instructions"><span>◉ {t.drag}</span><i/><span>⌕ {t.zoom}</span><i/><span>{t.gestureTwo}</span></div>}
          {mode !== 'deep-sky' && <div className="scene-bottom">
            <div className="time-controls"><button className={'pause-button ' + (isPaused ? 'paused' : '')} aria-label={isPaused ? 'Lecture' : 'Pause'} onClick={() => setIsPaused(value => !value)}>{isPaused ? '▶' : 'Ⅱ'}</button>
              <div className="time-control-copy"><strong>{t.time}</strong><small>{isPaused ? t.timeLabel : timeScale + '× · ' + t.timeNote}</small></div>
              <div className="speed-buttons">{[1,10,100].map(speed => <button key={speed} className={timeScale === speed ? 'active' : ''} onClick={() => { setTimeScale(speed); setIsPaused(false); }}>{speed}×</button>)}</div>
            </div>
            <button className="overview-button" onClick={overview}><span>◎</span>{t.overview}</button>
          </div>}
          {mode !== 'deep-sky' && <div className="scale-legend"><span/> {t.scaleNote}</div>}

          {mode === 'explore' && selected && <article className={'planet-detail ' + (detailsCollapsed ? 'collapsed' : '')}>
            <button className="detail-close" aria-label={t.close} onClick={overview}>×</button>
            <button className="detail-collapse" aria-expanded={!detailsCollapsed} aria-label={detailsCollapsed ? t.showDetails : t.hideDetails} title={detailsCollapsed ? t.showDetails : t.hideDetails} onClick={() => setDetailsCollapsed(value => !value)}>{detailsCollapsed ? t.info : '⌄'}</button>
            <div className="detail-heading"><span className={'detail-planet planet-' + selected.id}/><div><span className="eyebrow">{selected.type[locale].toUpperCase()}</span><h2>{nameOf(selected.id)}</h2></div></div>
            {!detailsCollapsed && <>
            {learningLevel.depth >= 2 && <div className="detail-orbit">{selected.distanceKm.toLocaleString('fr-FR')} {t.milKm}<span>·</span>{selected.distanceAu.toLocaleString('fr-FR',{maximumFractionDigits:3})} {t.au}</div>}
            <div className="metrics-grid">
              <Metric label={t.diameter} value={selected.diameterKm.toLocaleString('fr-FR')} unit="km"/>
              {selected.day && <Metric label={t.day} value={selected.day[locale]}/>}<Metric label={t.year} value={selected.year?.[locale] || `${selected.orbitYears} ${locale === 'fr' ? 'ans terrestres' : 'ane sou Latè'}`}/>
              {learningLevel.depth >= 2 && selected.temperature && <Metric label={t.temperature} value={selected.temperature[locale]}/>}
            </div>
            <div className="detail-fact"><span>✦</span><p>{selected.fact[locale]}</p></div>
            {selected.id === 'earth' && <button className="earth-globe-open-button moon-info-open-button" onClick={() => focus('moon')}><span aria-hidden="true">◐</span><span><strong>{locale === 'fr' ? 'Découvrir la Lune' : 'Dekouvri Lalin nan'}</strong><small>{locale === 'fr' ? 'Notre satellite naturel · environ 384 400 km' : 'Satelit natirèl nou an · anviwon 384 400 km'}</small></span><b>↗</b></button>}
            {['earth','moon'].includes(selected.id) && <button className="earth-globe-open-button" onClick={() => setGlobeBodyId(selected.id)}><span aria-hidden="true">◎</span><span><strong>{selected.id === 'moon' ? (locale === 'fr' ? 'Manipuler la maquette lunaire' : 'Manyen modèl Lalin nan') : t.openGlobe}</strong><small>{selected.id === 'moon' ? (locale === 'fr' ? 'Tourne la Lune et observe sa surface' : 'Vire Lalin nan epi gade sifas li') : t.openGlobeSub}</small></span><b>↗</b></button>}
            {spaceArchive[selected.id] && <button className="archive-open-button" onClick={() => { setArchiveImageIndex(0); setArchiveOpen(true); }}><span>▧</span><span><strong>{archiveActionTitle}</strong><small>{archiveActionSub}</small></span><b>↗</b></button>}
            {!dwarfPlanetById[selected.id] && selected.id !== 'moon' && <div className="detail-footer"><span><small>{t.moons}</small><strong>{moonCount(selected)}</strong>{selected.moonsChanging && <small>{t.moonsAsOf}</small>}</span><button onClick={() => { setMode('compare'); setCompareId(selected.id === 'earth' ? 'jupiter' : selected.id); setCompareReferenceId('earth'); }}>{t.compareEarth} <b>→</b></button></div>}
            </>}
          </article>}
          {mode === 'explore' && selectedId === 'sun' && <article className={'planet-detail sun-detail ' + (detailsCollapsed ? 'collapsed' : '')}><button className="detail-close" onClick={overview}>×</button><button className="detail-collapse" aria-expanded={!detailsCollapsed} aria-label={detailsCollapsed ? t.showDetails : t.hideDetails} title={detailsCollapsed ? t.showDetails : t.hideDetails} onClick={() => setDetailsCollapsed(value => !value)}>{detailsCollapsed ? t.info : '⌄'}</button><div className="detail-heading"><span className="detail-planet planet-sun">☼</span><div><span className="eyebrow">{locale === 'fr' ? 'ÉTOILE' : 'ZETWAL'}</span><h2>{t.sun}</h2></div></div>{!detailsCollapsed && <><div className="detail-fact"><span>✦</span><p>{locale === 'fr' ? 'Le Soleil rassemble plus de 99 % de la masse du système solaire et fournit l’énergie qui éclaire les planètes.' : 'Solèy la gen plis pase 99% mas sistèm solè a epi li bay planèt yo limyè.'}</p></div><button className="archive-open-button" onClick={() => { setArchiveImageIndex(0); setArchiveOpen(true); }}><span>▧</span><span><strong>{t.realImages}</strong><small>{t.realImagesSub}</small></span><b>↗</b></button></>}</article>}
          {!selected && !selectedId && !lesson && mode === 'explore' && <div className="welcome-chip"><span>✧</span><div><strong>{t.selection}</strong><small>{t.selectionHint}</small></div><button onClick={() => focus('earth')}>→</button></div>}
          {lesson && <div className="lesson-live-chip"><span>✦</span><div><strong>{t[lesson.title]}</strong><small>{t[lesson.body]}</small></div><button onClick={() => { setLessonId(null); setIsPaused(false); }}>×</button></div>}
        </section>
      </main>

      {intro && <div className="intro-screen" role="dialog" aria-modal="true" aria-label={t.intro}>
        <div className="intro-orbit intro-orbit-one"/><div className="intro-orbit intro-orbit-two"/>
        <span className="intro-sun">✦</span><span className="intro-dot intro-dot-one"/><span className="intro-dot intro-dot-two"/>
        <div className="intro-copy"><span className="eyebrow">FUTUR HAITI · SCIENCES</span><h2>{t.intro}</h2><p>{t.introBy}</p><button onClick={() => setIntro(false)}>{t.enter} <b>→</b></button></div>
        <button className="skip-intro" onClick={() => setIntro(false)}>{t.skip}</button>
      </div>}
      {aboutOpen && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setAboutOpen(false); }}><section className="about-modal" role="dialog" aria-modal="true" aria-labelledby="about-title">
        <button className="detail-close" onClick={() => setAboutOpen(false)}>×</button><span className="about-star">✦</span><span className="eyebrow">FUTUR HAITI</span><h2 id="about-title">{t.aboutTitle}</h2><p>{t.aboutText}</p><small>{t.aboutFact}</small><button className="modal-close-button" onClick={() => setAboutOpen(false)}>{t.close}</button>
      </section></div>}
      {archiveOpen && archive && <div className="modal-backdrop archive-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setArchiveOpen(false); }}><section className="archive-modal" role="dialog" aria-modal="true" aria-labelledby="archive-title">
        <button className="detail-close" aria-label={t.close} onClick={() => setArchiveOpen(false)}>×</button>
        <div className="archive-modal-heading"><span className="eyebrow">NASA · {archive.mission}</span><h2 id="archive-title">{nameOf(selectedId || 'earth')} <span>- {archiveActionTitle}</span></h2></div>
        {archiveImages.length > 1 && <div className="archive-image-tabs" role="tablist" aria-label={t.realImages}>{archiveImages.map((item,index)=><button key={item.image} role="tab" aria-selected={archiveImageIndex===index} className={archiveImageIndex===index?'active':''} onClick={()=>setArchiveImageIndex(index)}>{index===0?t.globalView:t.detailView}</button>)}</div>}
        {selectedId !== 'moon' && archiveImage && <><figure className="archive-image"><img src={archiveImage.image} alt={archiveImage.title[locale]} /><figcaption><strong>{archiveImage.title[locale]}</strong><span>{archiveImage.date} · {archiveImage.credit}</span></figcaption></figure><p className="archive-context">{t.imageContext}</p></>}
        {selectedId === 'moon' && <section className="moon-photo-gallery"><div className="archive-section-heading"><h3>{locale === 'fr' ? 'Images réelles de la Lune' : 'Vrè foto Lalin nan'}</h3><span>{String(moonPhotos.length).padStart(2,'0')}</span></div><p>{locale === 'fr' ? 'Photos NASA : mosaïque de la Lune, sites de missions observés par LRO et astronautes au travail.' : 'Foto NASA: mozayik Lalin nan, kote misyon yo jan LRO te wè yo ak astwonòt k ap travay.'}</p><div className="moon-photo-grid">{moonPhotos.map(item => <a className="moon-photo-card" href={item.source} target="_blank" rel="noreferrer" key={item.image}><img src={item.image} alt={item.title[locale]} loading="lazy"/><span className="moon-photo-caption"><strong>{item.title[locale]}</strong><small>{item.date}</small><small>{item.credit}</small></span></a>)}</div></section>}\n        <div className="archive-missions"><div className="archive-section-heading"><h3>{selectedId === 'moon' ? (locale === 'fr' ? 'Missions et échantillons rapportés' : 'Misyon ak echantiyon yo pote') : t.missionsTitle}</h3><span>{String(archiveMissions.length).padStart(2,'0')}</span></div>
          {archiveMissions.map(item => <article className="archive-mission" key={item.name}><span className="mission-mark">✦</span><div><strong>{item.name}{item.sample && <em className="sample-badge">{locale === 'fr' ? 'Échantillons' : 'Echantiyon'}</em>}</strong><small>{item.when} · {item.note[locale]}</small></div><a href={item.url} target="_blank" rel="noreferrer" aria-label={t.sourceLink}>↗</a></article>)}
        </div>
        <a className="archive-source-link" href={archiveImage?.source || archive.source} target="_blank" rel="noreferrer">{t.sourceLink}</a>
      </section></div>}
      {globeBodyId && <Suspense fallback={<div className="earth-globe-backdrop"><div className="scene-loading"><span>✦</span><strong>{t.globeTitle}</strong></div></div>}><EarthGlobe bodyId={globeBodyId} copy={t} locale={locale} onClose={() => setGlobeBodyId(null)}/></Suspense>}
      {notice && <div className="notice-toast">✦ {notice}</div>}
    </div>
  );
}

export default App;
