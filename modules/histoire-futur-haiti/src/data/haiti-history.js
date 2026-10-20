import existingEvents from './haiti.json';
import supplementalEvents from './haiti-supplement.js';
import leaders from './haiti-leaders.js';

const correctedEvents = existingEvents.map((event) => {
  if (event.id === 'independence-1804' && event.visual?.url?.includes('Deklarasyon_Endepandans')) {
    return {
      ...event,
      visual: {
        ...event.visual,
        url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Deklarasyon_Endepandans_Ayiti%2C_1804.djvu/page1-960px-Deklarasyon_Endepandans_Ayiti%2C_1804.djvu.jpg',
        caption: 'Numérisation de la Déclaration imprimée, conservée aux Archives nationales du Royaume-Uni; ce document n’est pas une photographie de la cérémonie de 1804.',
      },
    };
  }
  if (event.id === 'soulevement-janvier-1946-estime') {
    return {
      ...event,
      gallery: [...(event.gallery || []), {
        url: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Haitians_celebrating_in_front_of_the_Garde_d%27Ha%C3%AFti_1946.jpg',
        alt: 'Des personnes célèbrent devant la Garde d’Haïti après le départ de Lescot en 1946.',
        caption: 'Photographie de presse des célébrations après le départ de Lescot; elle n’illustre pas à elle seule toute la transition.',
        credit: 'Chicago Defender, 26 janvier 1946; photographe non identifié',
        license: 'Domaine public aux États-Unis selon la notice; statut à l’international à vérifier',
        licenseUrl: 'https://commons.wikimedia.org/wiki/File:Haitians_celebrating_in_front_of_the_Garde_d%27Ha%C3%AFti_1946.jpg',
        source: { title: 'Haitians celebrating in front of the Garde d’Haïti, 1946', publisher: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Haitians_celebrating_in_front_of_the_Garde_d%27Ha%C3%AFti_1946.jpg' },
      }],
    };
  }
  if (event.id === 'seisme-haiti-2010') {
    const archiveImages = [
      {
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Area_around_National_Palace%2C_Port-au-Prince_2010-01-30.jpg?width=1200',
        alt: 'Vue aérienne des environs du Palais national après le séisme de 2010.',
        caption: 'Vue aérienne prise le 30 janvier 2010 pendant l’opération Unified Response; elle documente les dégâts autour du Palais national.',
        credit: 'SCMS Spike Call / U.S. Navy', license: 'Domaine public aux États-Unis (œuvre d’un employé fédéral)',
        licenseUrl: 'https://commons.wikimedia.org/wiki/File:Area_around_National_Palace,_Port-au-Prince_2010-01-30.jpg',
        source: { title: 'Area around National Palace, Port-au-Prince, 2010-01-30', publisher: 'U.S. Navy via Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Area_around_National_Palace,_Port-au-Prince_2010-01-30.jpg' },
      },
      {
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Haitian_men%2C_women_and_children_operate_heavy_equipment%2C_pick_up_trash_and_remove_debris_in_Port-au-Prince%2C_Haiti%2C_March_17%2C_2010%2C_in_the_aftermath_of_a_7.0-magnitude_earthquake_that_struck_the_Caribbean_nation_100317-N-HX866-001.jpg?width=1200',
        alt: 'Des habitantes et habitants de Port-au-Prince enlèvent des débris en mars 2010.',
        caption: 'Des habitantes et habitants participent au déblaiement le 17 mars 2010; une image de la réponse locale après le séisme.',
        credit: 'U.S. Navy / MCC Spike Call', license: 'Domaine public aux États-Unis selon la notice Commons',
        licenseUrl: 'https://commons.wikimedia.org/wiki/File:Haitian_men,_women_and_children_operate_heavy_equipment,_pick_up_trash_and_remove_debris_in_Port-au-Prince,_Haiti,_March_17,_2010,_in_the_aftermath_of_a_7.0-magnitude_earthquake_that_struck_the_Caribbean_nation_100317-N-HX866-001.jpg',
        source: { title: 'Residents remove debris in Port-au-Prince, 17 March 2010', publisher: 'U.S. Navy via Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Haitian_men,_women_and_children_operate_heavy_equipment,_pick_up_trash_and_remove_debris_in_Port-au-Prince,_Haiti,_March_17,_2010,_in_the_aftermath_of_a_7.0-magnitude_earthquake_that_struck_the_Caribbean_nation_100317-N-HX866-001.jpg' },
      },
      {
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/2010_Haiti_Earthquake_%28After%29.jpg?width=1200',
        alt: 'Image satellitaire des dégâts causés par le séisme de 2010 en Haïti.',
        caption: 'Image satellitaire de l’USGS montrant les dégâts après le séisme; ce n’est pas une photographie prise au sol.',
        credit: 'U.S. Geological Survey', license: 'CC0 1.0, domaine public consacré mondialement',
        licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
        source: { title: '2010 Haiti Earthquake (After)', publisher: 'U.S. Geological Survey via Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:2010_Haiti_Earthquake_(After).jpg' },
      },
    ];
    return { ...event, gallery: [...(event.gallery || []), ...archiveImages] };
  }
  return event;
});

const byId = new Set(correctedEvents.map((event) => event.id));
const leaderPortraits = new Map(leaders.map((leader) => [leader.id, leader.visual]).filter(([, visual]) => visual));
const portraitFor = (id) => leaderPortraits.get(id);
const enrichedSupplement = supplementalEvents
  .filter((event) => !byId.has(event.id))
  .map((event) => {
    const portraitId = {
      'unification-hispaniola-1822': 'boyer',
      'soulouque-1847-1859': 'soulouque',
      'crises-politiques-1869-1915': 'salomon',
      'resistance-cacos-1918-1920': 'peralte',
      'massacre-frontiere-1937': 'vincent',
      'shada-1941-1944': 'lescot',
      'duvalier-1957-1971': 'francois-duvalier',
      'duvalier-1971-1986': 'jean-claude-duvalier',
    }[event.id];
    const portrait = portraitFor(portraitId);
    return portrait ? { ...event, visual: portrait } : event;
  });

export default [...correctedEvents, ...enrichedSupplement];
