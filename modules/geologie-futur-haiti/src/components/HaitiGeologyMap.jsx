import { useMemo, useState } from 'react';
import './HaitiGeologyMap.css';

// Coastlines and the Haiti–Dominican Republic border are simplified from
// Natural Earth 1:50m Admin-0 countries (public-domain vector data).
// Coordinates are longitude/latitude in WGS84; only the visible island extent
// is included here. Regional mountain markers below are approximate locators.
const HAITI = [
  [-71.779248,19.718164],[-71.757422,19.688184],[-71.711475,19.486572],[-71.706934,19.421973],[-71.753174,19.324463],[-71.746484,19.28584],[-71.647217,19.195947],[-71.645312,19.163525],[-71.657031,19.130762],[-71.742041,19.045508],[-71.807129,18.987012],[-71.786377,18.92002],[-71.733643,18.856396],[-71.727051,18.803223],[-71.743213,18.73291],[-71.824219,18.645508],[-71.866504,18.61416],[-71.986865,18.610352],[-72.000391,18.5979],[-71.940381,18.512598],[-71.872559,18.416211],[-71.761914,18.341309],[-71.737256,18.270801],[-71.76377,18.203955],[-71.768311,18.03916],[-71.85293,18.119141],[-71.946094,18.186084],[-72.002051,18.212012],[-72.059863,18.228564],[-72.503564,18.219922],[-72.553223,18.208398],[-72.591895,18.186914],[-72.633301,18.176221],[-72.755273,18.156152],[-72.87666,18.151758],[-73.160059,18.205615],[-73.272266,18.233545],[-73.385156,18.251172],[-73.514844,18.245361],[-73.644043,18.229053],[-73.747314,18.190234],[-73.824707,18.121777],[-73.83916,18.058203],[-73.884961,18.041895],[-73.989453,18.143164],[-74.0854,18.215137],[-74.194629,18.269189],[-74.419043,18.346191],[-74.459961,18.393066],[-74.478125,18.45],[-74.3875,18.624707],[-74.284473,18.656689],[-74.227734,18.662695],[-74.100342,18.641113],[-73.975977,18.601416],[-73.8625,18.575439],[-73.687012,18.565332],[-73.591602,18.522363],[-72.917285,18.455713],[-72.789355,18.434814],[-72.739453,18.442139],[-72.695996,18.468213],[-72.659766,18.515332],[-72.618066,18.550781],[-72.418115,18.558691],[-72.376074,18.574463],[-72.346729,18.62373],[-72.347656,18.674951],[-72.465234,18.743555],[-72.649121,18.894141],[-72.811084,19.071582],[-72.741211,19.131348],[-72.767969,19.240625],[-72.741797,19.341846],[-72.703223,19.441064],[-72.863428,19.526074],[-73.052734,19.610742],[-73.315527,19.637305],[-73.396338,19.658691],[-73.438379,19.722119],[-73.400537,19.807422],[-73.315332,19.85459],[-73.217773,19.883691],[-73.117773,19.903809],[-72.876514,19.928076],[-72.637012,19.900879],[-72.429932,19.813281],[-72.219824,19.744629],[-71.954297,19.72168],[-71.834717,19.696729],[-71.779248,19.718164],
];
const DOMINICAN_REPUBLIC = [
  [-71.768311,18.03916],[-71.76377,18.203955],[-71.737256,18.270801],[-71.761914,18.341309],[-71.872559,18.416211],[-71.940381,18.512598],[-72.000391,18.5979],[-71.986865,18.610352],[-71.866504,18.61416],[-71.824219,18.645508],[-71.743213,18.73291],[-71.727051,18.803223],[-71.733643,18.856396],[-71.786377,18.92002],[-71.807129,18.987012],[-71.742041,19.045508],[-71.657031,19.130762],[-71.645312,19.163525],[-71.647217,19.195947],[-71.746484,19.28584],[-71.753174,19.324463],[-71.706934,19.421973],[-71.711475,19.486572],[-71.757422,19.688184],[-71.779248,19.718164],[-71.735107,19.735107],[-71.706055,19.795166],[-71.667383,19.848633],[-71.615967,19.877441],[-71.557764,19.895361],[-71.441699,19.893994],[-71.281348,19.847363],[-71.235937,19.848145],[-71.081934,19.890479],[-70.95415,19.913965],[-70.833887,19.887256],[-70.785254,19.850879],[-70.685937,19.793262],[-70.636182,19.775635],[-70.479346,19.776953],[-70.436426,19.77124],[-70.304736,19.676074],[-70.193848,19.638037],[-70.129443,19.636133],[-70.014062,19.672949],[-69.956836,19.671875],[-69.891211,19.589746],[-69.87832,19.473291],[-69.823437,19.367139],[-69.739404,19.299219],[-69.324951,19.327734],[-69.232471,19.271826],[-69.264258,19.225684],[-69.322754,19.201074],[-69.519727,19.212012],[-69.605957,19.206494],[-69.623242,19.160498],[-69.623633,19.117822],[-69.50835,19.107617],[-69.395264,19.086084],[-69.280225,19.051904],[-69.163037,19.028467],[-69.031299,19.013184],[-68.901367,18.988477],[-68.684766,18.904785],[-68.44541,18.714453],[-68.381396,18.671143],[-68.33916,18.611523],[-68.359277,18.538086],[-68.444824,18.417725],[-68.493213,18.379004],[-68.56377,18.355469],[-68.612207,18.30625],[-68.658838,18.222021],[-68.687402,18.214941],[-68.720996,18.218408],[-68.778467,18.266113],[-68.819531,18.339307],[-68.934961,18.408008],[-69.072266,18.399219],[-69.274512,18.439844],[-69.396973,18.420117],[-69.519434,18.415674],[-69.644727,18.436377],[-69.770654,18.443555],[-69.896387,18.417725],[-70.018311,18.373633],[-70.06333,18.345654],[-70.141602,18.2771],[-70.183105,18.251758],[-70.479932,18.217285],[-70.56543,18.267578],[-70.644678,18.33623],[-70.758838,18.345605],[-70.924316,18.29248],[-71.027832,18.273193],[-71.069971,18.250342],[-71.082227,18.224365],[-71.082617,18.128369],[-71.106006,18.07002],[-71.267285,17.849609],[-71.358301,17.694141],[-71.395703,17.646094],[-71.438965,17.635596],[-71.518359,17.725],[-71.569043,17.757373],[-71.631738,17.773633],[-71.658301,17.821143],[-71.657227,17.888672],[-71.67373,17.954102],[-71.712451,18.005469],[-71.768311,18.03916],
];
// Haiti includes the main landmass, Île de la Gonâve, and Tortuga from the source.
const HAITI_ISLANDS = [
  [[-72.80459,18.777686],[-72.822217,18.707129],[-73.077979,18.790918],[-73.285254,18.896729],[-73.276416,18.954053],[-73.170605,18.967285],[-73.069141,18.932031],[-72.919238,18.861475],[-72.80459,18.777686]],
  [[-72.664062,20.0375],[-72.623486,20.01416],[-72.638867,19.98584],[-72.739795,20.003418],[-72.844238,20.035449],[-72.878418,20.027441],[-72.899316,20.031445],[-72.960352,20.062256],[-72.906738,20.08584],[-72.851465,20.093652],[-72.791016,20.091895],[-72.664062,20.0375]],
];
const LAYERS = [
  { id: 'relief', label: 'Relief schématique' },
  { id: 'geology', label: 'Géologie' },
  { id: 'resources', label: 'Ressources' },
  { id: 'sites', label: 'Repères' },
];
const PLACES = [
  { id: 'north', name: 'Massif du Nord', region: 'Nord', pos: [-72.55, 19.55], detail: 'Repère régional approximatif pour le massif du Nord.' },
  { id: 'hopital', name: 'Morne l’Hôpital', region: 'Ouest · Port-au-Prince', pos: [-72.32, 18.52], detail: 'Repère régional approximatif au sud de Port-au-Prince.' },
  { id: 'selle', name: 'Massif de la Selle', region: 'Sud-Est', pos: [-72.28, 18.35], detail: 'Repère approximatif pour le massif de la Selle.' },
  { id: 'hotte', name: 'Massif de la Hotte', region: 'Péninsule du Sud', pos: [-73.75, 18.38], detail: 'Repère approximatif pour le massif de la Hotte.' },
];
const RELIEF_REGIONS = [
  { label: 'Massif du Nord', pos: [-72.55, 19.55], dx: 10, dy: -8 },
  { label: 'Chaîne des Matheux', pos: [-72.55, 18.75], dx: 10, dy: -8 },
  { label: 'Massif de la Selle', pos: [-72.28, 18.35], dx: 10, dy: 16 },
  { label: 'Massif de la Hotte', pos: [-73.75, 18.38], dx: 10, dy: 16 },
];
const BOX = { minLon: -74.55, maxLon: -68.25, minLat: 17.55, maxLat: 20.22 };
const W = 760;
const H = 430;
const project = ([lon, lat]) => [((lon - BOX.minLon) / (BOX.maxLon - BOX.minLon)) * W, ((BOX.maxLat - lat) / (BOX.maxLat - BOX.minLat)) * H];
const pathFor = (coordinates) => `${coordinates.map((point, index) => {
  const [x, y] = project(point);
  return `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
}).join(' ')} Z`;
const lineFor = (coordinates) => coordinates.map((point, index) => {
  const [x, y] = project(point);
  return `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
}).join(' ');

function MapDrawing({ layer, selected, onSelect }) {
  const paths = useMemo(() => ({ haiti: pathFor(HAITI), dr: pathFor(DOMINICAN_REPUBLIC), islands: HAITI_ISLANDS.map(pathFor) }), []);
  const border = useMemo(() => lineFor(HAITI.slice(0, 25)), []);
  const markers = layer === 'sites' ? PLACES : [];
  return <svg className="haiti-map-drawing" viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="hm-title hm-desc">
    <title id="hm-title">Haïti et la République dominicaine sur l’île d’Hispaniola</title>
    <desc id="hm-desc">Silhouette de l’île d’Hispaniola et frontière terrestre suivant Natural Earth à l’échelle 1:50 millions. Haïti est à l’ouest.</desc>
    <defs>
      <linearGradient id="hmSea" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#16333b"/><stop offset="1" stopColor="#0d222a"/></linearGradient>
      <linearGradient id="hmHaiti" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d2a86f"/><stop offset="1" stopColor="#8f6843"/></linearGradient>
      <linearGradient id="hmDR" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#6d9582"/><stop offset="1" stopColor="#365b50"/></linearGradient>
      <filter id="hmShadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="9" stdDeviation="8" floodColor="#000" floodOpacity=".34"/></filter>
      <pattern id="hmRelief" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(42)"><path d="M0 0V9" stroke="#ffe2a5" strokeOpacity=".22" strokeWidth="3"/></pattern>
    </defs>
    <rect width={W} height={H} rx="14" fill="url(#hmSea)"/>
    <g className="hm-water-lines" fill="none"><path d="M30 82Q185 49 345 79T724 71M18 343Q183 370 370 341T746 353"/><path d="M120 20Q83 205 123 413M650 20Q687 213 647 416"/></g>
    <text x="22" y="30" className="hm-map-label">GOLFE DE LA GONÂVE</text>
    <text x="508" y="407" className="hm-map-label">MER DES CARAÏBES</text>
    <g filter="url(#hmShadow)">
      <path d={paths.dr} className="hm-country hm-country--dr" fill="url(#hmDR)"/>
      <path d={paths.haiti} className="hm-country hm-country--haiti" fill="url(#hmHaiti)"/>
      {paths.islands.map((path, index) => <path key={index} d={path} className="hm-country hm-country--haiti" fill="url(#hmHaiti)"/>)}
    </g>
    {layer === 'relief' && <g className="hm-relief-overlay">{RELIEF_REGIONS.map((range) => {
      const [x, y] = project(range.pos);
      return <g key={range.label}><ellipse cx={x} cy={y} rx="22" ry="9" transform={`rotate(-20 ${x} ${y})`} className="hm-range-mark"/><text x={x + range.dx} y={y + range.dy}>{range.label}</text></g>;
    })}</g>}
    <path d={border} className="hm-border"/>
    <text x="213" y="235" className="hm-country-label">HAÏTI</text>
    <text x="460" y="250" className="hm-country-label hm-country-label--dr">RÉPUBLIQUE DOMINICAINE</text>
    {markers.map((item) => {
      const [x, y] = project(item.pos);
      return <g key={item.id} className={`hm-place ${selected === item.id ? 'is-selected' : ''}`} role="button" tabIndex="0" aria-label={`Sélectionner ${item.name}, position approximative`} aria-pressed={selected === item.id} onClick={() => onSelect(item.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(item.id); } }}>
        <circle cx={x} cy={y} r="11" className="hm-place-halo"/><circle cx={x} cy={y} r="4.5" className="hm-place-dot"/><text x={x + 10} y={y - 9} className="hm-place-text">{item.name}</text>
      </g>;
    })}
    <g className="hm-north" transform="translate(716 56)"><path d="M0 22V0m-5 6 5-6 5 6"/><text x="-4" y="36">N</text></g>
    <g className="hm-legend"><rect x="18" y="365" width="11" height="11" rx="2" fill="#d2a86f"/><text x="35" y="374">Haïti</text><rect x="92" y="365" width="11" height="11" rx="2" fill="#6d9582"/><text x="109" y="374">République dominicaine</text><path d="M277 370h24"/><text x="308" y="374">Frontière terrestre</text></g>
  </svg>;
}

export default function HaitiGeologyMap({ onNavigate }) {
  const [layer, setLayer] = useState('relief');
  const [selected, setSelected] = useState('hopital');
  const place = PLACES.find((item) => item.id === selected) || PLACES[0];
  return <section className="haiti-geo" aria-labelledby="haiti-geo-title">
    <header className="haiti-geo-header"><div><span className="haiti-geo-eyebrow">CARTE D’HAÏTI · ÎLE D’HISPANIOLA</span><h2 id="haiti-geo-title">La géologie d’Haïti, sur une vraie carte</h2><p>Haïti occupe l’ouest d’Hispaniola. La côte et la frontière sont dessinées à partir d’une base géographique publique; les couches pédagogiques sont signalées séparément.</p></div><span className="haiti-geo-badge"><i aria-hidden="true"/> GÉOMÉTRIE GÉOGRAPHIQUE</span></header>
    <div className="haiti-geo-toolbar" role="group" aria-label="Choisir une couche cartographique"><span>COUCHES</span>{LAYERS.map((item) => <button key={item.id} type="button" className={layer === item.id ? 'is-active' : ''} aria-pressed={layer === item.id} onClick={() => setLayer(item.id)}>{item.label}</button>)}</div>
    <div className="haiti-geo-main"><div className="haiti-geo-visual"><MapDrawing layer={layer} selected={selected} onSelect={setSelected}/>
      <p className="haiti-geo-schematic"><strong>Limite des données.</strong> La silhouette et la frontière proviennent de Natural Earth 1:50m. Le relief est une surimpression régionale illustrative, sans altitude mesurée ni limites de massifs exactes.</p>
    </div><aside className="haiti-geo-side" aria-live="polite">
      {layer === 'sites' ? <div className="haiti-geo-place-card"><span>REPÈRE APPROXIMATIF</span><h3>{place.name}</h3><small>{place.region}</small><p>{place.detail} Ce point sert à situer la région et n’est pas une coordonnée de terrain.</p></div> : null}
      {layer === 'relief' ? <div className="haiti-geo-place-card"><span>RELIEF</span><h3>Massifs et chaînes</h3><p>Les noms situent les grands ensembles montagneux d’Haïti. Leur tracé coloré est un repère pédagogique et ne remplace pas une carte topographique.</p></div> : null}
      {layer === 'geology' ? <div className="haiti-geo-data-note"><b>Carte géologique d’Hispaniola · USGS, 2025</b><p>La feuille 4 présente les unités géologiques de l’île entière à l’échelle 1:1 000 000. Ces unités ne sont pas encore dessinées comme couche vectorielle dans cette carte interactive.</p><a href="https://pubs.usgs.gov/sim/3534/sim3534_sheet4.pdf" target="_blank" rel="noreferrer">Ouvrir la feuille géologique d’Hispaniola (PDF) ↗</a></div> : null}
      {layer === 'resources' ? <div className="haiti-geo-data-note"><b>Ressources minérales</b><p>Les gisements et carrières ne sont pas ponctués sur cette carte, car une couche officielle géoréférencée n’est pas intégrée. Le BME propose sa carte du potentiel minier à l’échelle 1:300 000 et des fascicules régionaux.</p><a href="https://www.bme.gouv.ht/index.php?p=potentielminier" target="_blank" rel="noreferrer">Consulter les données du BME ↗</a></div> : null}
      <div className="haiti-geo-place-list"><h3>Repères haïtiens</h3>{PLACES.map((item) => <button type="button" key={item.id} aria-pressed={selected === item.id} className={selected === item.id ? 'is-active' : ''} onClick={() => { setLayer('sites'); setSelected(item.id); }}><span>{item.name}</span><small>{item.region}</small></button>)}</div>
    </aside></div>
    <footer className="haiti-geo-sources"><span>SOURCES CARTOGRAPHIQUES</span><a href="https://www.naturalearthdata.com/downloads/50m-cultural-vectors/" target="_blank" rel="noreferrer">Natural Earth · pays 1:50m, domaine public ↗</a><a href="https://www.bme.gouv.ht/index.php?p=potentielminier" target="_blank" rel="noreferrer">BME · potentiel minier et énergétique ↗</a><a href="https://pubs.usgs.gov/sim/3534/sim3534_sheet4.pdf" target="_blank" rel="noreferrer">USGS · géologie d’Hispaniola, feuille 4 (2025) ↗</a>{onNavigate && <button type="button" onClick={() => onNavigate('rocks')}>Voir les échantillons de roches →</button>}<small>Natural Earth 1:50m · frontières à l’échelle régionale, non destinées à l’usage cadastral. Les couches relief, repères et géologie locale ne sont pas des données GIS officielles intégrées.</small></footer>
  </section>;
}
