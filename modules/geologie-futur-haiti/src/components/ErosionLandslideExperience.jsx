import { useMemo, useState } from 'react';
import './ErosionLandslideExperience.css';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const controls = [
  { key: 'slope', label: 'Pente', min: 5, max: 45, unit: '°', help: 'Une pente plus forte accélère le ruissellement.' },
  { key: 'rain', label: 'Pluie', min: 0, max: 100, unit: '%', help: 'La pluie détache et transporte les particules du sol.' },
  { key: 'vegetation', label: 'Couverture végétale', min: 0, max: 100, unit: '%', help: 'Les racines retiennent le sol et les feuilles amortissent la pluie.' },
];

function plant(x, y, scale = 1) {
  return <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${scale})`} className="erosion-plant">
    <path d="M0 0v-19M0-12c-8-8-13-5-11 0 3 5 8 4 11 5m0-9c7-8 12-4 10 1-2 4-7 4-10 5" fill="none" stroke="#8fa26e" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M0 0c-2 4-4 7-7 10m7-8c2 4 4 6 7 8m-7-8v10" fill="none" stroke="#d4b17d" strokeWidth="1.3" />
  </g>;
}

export default function ErosionLandslideExperience() {
  const [values, setValues] = useState({ slope: 24, rain: 55, vegetation: 45 });
  const [scenario, setScenario] = useState('custom');
  const { slope, rain, vegetation } = values;
  const erosion = clamp(Math.round(rain * (0.38 + slope / 58) * (1 - vegetation / 125)), 0, 100);
  const slideRisk = clamp(Math.round((slope - 8) * 1.25 + rain * 0.35 - vegetation * 0.42), 0, 100);
  const runoff = clamp(Math.round(rain * (1.05 - vegetation / 125)), 0, 100);
  const slide = slideRisk >= 55;
  const vegetationPoints = useMemo(() => {
    const count = Math.round(vegetation / 11);
    return Array.from({ length: count }, (_, i) => {
      const x = 95 + i * (Math.max(0, 195 / Math.max(1, count - 1)));
      const y = 198 - (x - 54) * .43;
      return plant(x, y, .76 + (i % 3) * .12);
    });
  }, [vegetation]);
  const mobileVegetation = useMemo(() => {
    const count = Math.max(1, Math.round(vegetation / 12));
    return Array.from({ length: count }, (_, i) => {
      const x = 48 + i * (150 / Math.max(1, count - 1));
      const y = 300 - (x - 20) * .70;
      return plant(x, y, .78 + (i % 3) * .1);
    });
  }, [vegetation]);

  const setControl = (key, value) => {
    setScenario('custom');
    setValues((current) => ({ ...current, [key]: Number(value) }));
  };
  const chooseScenario = (name) => {
    setScenario(name);
    if (name === 'versant boisé') setValues({ slope: 18, rain: 55, vegetation: 85 });
    if (name === 'pluie intense') setValues({ slope: 25, rain: 95, vegetation: 55 });
    if (name === 'versant dénudé') setValues({ slope: 38, rain: 80, vegetation: 10 });
  };

  return <section className="erosion-lab" aria-labelledby="erosion-title">
    <header className="erosion-heading">
      <div><span className="erosion-kicker">TERRAIN INTERACTIF · HAÏTI</span><h2 id="erosion-title">Quand la pluie travaille le versant</h2>
        <p>Modifie la pente, l’intensité de la pluie et la végétation. Observe comment l’eau enlève, transporte et dépose les matériaux.</p></div>
      <span className="erosion-location"><i aria-hidden="true" /> MORNE L’HÔPITAL · EXEMPLE DE VERSANT</span>
    </header>

    <div className="erosion-scenarios" role="group" aria-label="Choisir un scénario">
      <span>SCÉNARIO</span>
      {[['versant boisé', 'Versant boisé'], ['pluie intense', 'Pluie forte'], ['versant dénudé', 'Versant dénudé']].map(([key, label]) =>
        <button type="button" key={key} className={scenario === key ? 'active' : ''} aria-pressed={scenario === key} onClick={() => chooseScenario(key)}>{label}</button>)}
    </div>

    <div className="erosion-landscape" role="img" aria-label={`Coupe schématique d'un versant à ${slope} degrés, pluie ${rain} pour cent et végétation ${vegetation} pour cent. On voit l'infiltration dans le sol, le ruissellement qui arrache et transporte des particules vers le chenal et le dépôt au pied du versant. Ruissellement ${runoff} pour cent, érosion ${erosion} pour cent, indice comparatif de conditions favorables au glissement ${slideRisk} pour cent.`}>
      <div className="erosion-diagram-title"><span>COUPE DU VERSANT</span><span>MODÈLE PÉDAGOGIQUE · NON À L’ÉCHELLE</span></div>
      <svg viewBox="0 0 760 370" preserveAspectRatio="xMidYMid meet" aria-hidden="true" className="erosion-svg erosion-desktop-svg">
        <defs>
          <linearGradient id="erosion-soil" x1="0" x2="0.2" y1="0" y2="1"><stop stopColor="#c58a55"/><stop offset=".18" stopColor="#a36d45"/><stop offset=".48" stopColor="#76513a"/><stop offset="1" stopColor="#49392e"/></linearGradient>
          <linearGradient id="erosion-bedrock" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#655343"/><stop offset="1" stopColor="#37342d"/></linearGradient>
          <pattern id="erosion-grain" width="24" height="18" patternUnits="userSpaceOnUse"><circle cx="4" cy="5" r="1.4" fill="#d6ae76" opacity=".48"/><circle cx="16" cy="12" r="1" fill="#e2c38d" opacity=".4"/><path d="M9 16l3-2" stroke="#382e26" opacity=".45"/></pattern>
          <pattern id="erosion-subsoil" width="34" height="24" patternUnits="userSpaceOnUse"><path d="M2 7h8m11 9h10M7 21l4-2" stroke="#d2a875" strokeWidth="1" opacity=".3"/></pattern>
          <clipPath id="erosion-ground-clip"><path d="M35 215 L295 91 Q318 80 340 105 L440 203 Q483 225 520 228 L735 228 L735 350 L35 350Z"/></clipPath>
          <marker id="erosion-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0L7 3.5 0 7Z" fill="#b9e9e7"/></marker>
        </defs>
        <path d="M35 215 L295 91 Q318 80 340 105 L440 203 Q483 225 520 228 L735 228 L735 350 L35 350Z" fill="url(#erosion-soil)" stroke="#d1a16c" strokeWidth="2"/>
        <path d="M35 215 L295 91 Q318 80 340 105 L440 203 Q483 225 520 228 L735 228 L735 350 L35 350Z" fill="url(#erosion-grain)"/>
        <path d="M35 248 Q176 207 298 150 Q347 180 417 237 Q476 260 520 263 L735 254 L735 295 Q618 303 520 292 Q442 284 394 255 Q349 222 312 191 Q174 246 35 281Z" fill="url(#erosion-subsoil)" opacity=".95"/>
        <path d="M35 282 Q184 240 325 192 Q403 239 520 263 L735 260 L735 350 L35 350Z" fill="url(#erosion-bedrock)" opacity=".98"/>
        <path d="M35 215 L295 91 Q318 80 340 105 L440 203 Q483 225 520 228 L735 228" fill="none" stroke="#dfbb86" strokeWidth="5" strokeLinecap="round"/>
        <path d="M35 248 Q176 207 298 150 Q347 180 417 237 Q476 260 520 263 L735 254" fill="none" stroke="#ba8c60" strokeWidth="2" strokeDasharray="7 5" opacity=".9"/>
        <g clipPath="url(#erosion-ground-clip)" opacity={0.35 + vegetation / 160}>
          {vegetationPoints}
        </g>
        {Array.from({ length: Math.max(1, Math.round(rain / 13)) }, (_, i) => <path key={`drop-${i}`} className="erosion-raindrop" d={`M${90 + (i * 51) % 570} ${15 + (i * 29) % 45}l-5 12`} style={{ animationDelay: `${(i % 6) * -.27}s` }} opacity={.25 + rain / 150} />)}
        <path className="erosion-flow" d="M300 96 Q353 119 399 177 T535 226 T663 230" strokeWidth={2 + runoff / 23} markerEnd="url(#erosion-arrow)" opacity={.35 + runoff / 150}/>
        <path className="erosion-flow erosion-flow-two" d="M275 112 Q323 132 374 187 T494 226" strokeWidth={1.5 + runoff / 30} opacity={.25 + runoff / 180}/>
        <path className="erosion-infiltration" d="M160 160q-11 17-10 35m26-42q-6 18-5 34m24-42q-3 12 1 22" fill="none" stroke="#a9d7ba" strokeWidth="2.5" strokeDasharray="3 6" markerEnd="url(#erosion-arrow)" opacity={.25 + rain / 140}/>
        <g className="erosion-detach"><path d="M335 107l-11 8 10 3m8 3 10 8-13 1" fill="none" stroke="#f0c48a" strokeWidth="2"/><circle cx="348" cy="132" r="3" fill="#e3b77c"/><circle cx="363" cy="144" r="2.5" fill="#d8a76f"/></g>
        {slide && <g className="erosion-slide"><path d="M349 126 L416 193 Q431 208 445 216 L400 228 337 169Z" fill="#76513a" stroke="#e9a168" strokeWidth="2" strokeDasharray="5 4"/><path d="M385 165l-8 16m21-4-8 17m26-4-8 16" stroke="#eaa267" strokeWidth="2"/><text x="462" y="125" className="erosion-svg-label erosion-risk-label">MASSE EN MOUVEMENT</text><path d="M460 131L427 188" stroke="#eaa267" strokeDasharray="3 4"/></g>}
        <path d="M500 233q20-21 42-3 16 13 31 0 18-15 37 2 20 16 43 0 20-14 43 0" fill="none" stroke="#78bdc2" strokeWidth="4"/>
        <path d="M522 242 Q572 232 615 244 Q663 253 735 240 L735 268 Q670 279 617 265 Q565 254 520 267Z" fill="#bd9568" stroke="#ddbb8b" strokeWidth="1.5"/>
        {Array.from({ length: Math.round(erosion / 11) }, (_, i) => <circle key={`sed-${i}`} cx={542 + (i * 31) % 176} cy={249 + (i * 9) % 12} r={2 + i % 3} fill={i % 2 ? '#d9b17c' : '#8c6549'} />)}
        <g className="erosion-svg-label"><text x="52" y="239">HORIZON DE SOL</text><text x="57" y="316">ROCHE MÈRE</text><text x="565" y="294">DÉPÔT</text></g>
        <path d="M172 163q7 8 14 16m-8-23q10 11 18 24m0-31q11 12 20 22m0-31q13 13 22 20m1-30q10 10 18 17" fill="none" stroke="#d9bd91" strokeWidth="1.6" opacity=".95"/>
        <text x="89" y="176" className="erosion-svg-label erosion-root-label">RACINES · ANCRAGE</text>
        <path d="M493 193l-13-13" stroke="#c5eff2"/><text x="468" y="170" className="erosion-svg-label erosion-water-label">EAU + DÉBRIS</text>
        <text x="274" y="73" className="erosion-svg-label erosion-process-label">INFILTRATION</text>
        <text x="356" y="117" className="erosion-svg-label erosion-process-label">ARRACHEMENT</text>
        <text x="543" y="215" className="erosion-svg-label erosion-process-label">CHENAL</text>
        <g transform="translate(63 35)"><path d="M0 0v41m-9-10 9 10 9-10" stroke="#f0d6ad" strokeWidth="2" fill="none"/><text x="18" y="22" className="erosion-svg-label">PENTE {slope}°</text></g>
        <text x="378" y="337" textAnchor="middle" className="erosion-small-label">Ruissellement → transport → dépôt en bas de pente</text>
      </svg>
      <svg viewBox="0 0 360 590" preserveAspectRatio="xMidYMid meet" aria-hidden="true" className="erosion-svg erosion-mobile-svg">
        <defs>
          <linearGradient id="erosion-mobile-soil" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#c58a55"/><stop offset=".22" stopColor="#9c6841"/><stop offset=".56" stopColor="#705039"/><stop offset="1" stopColor="#3d3931"/></linearGradient>
          <linearGradient id="erosion-mobile-rock" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#6d5946"/><stop offset="1" stopColor="#39372f"/></linearGradient>
          <pattern id="erosion-mobile-grain" width="18" height="16" patternUnits="userSpaceOnUse"><circle cx="4" cy="5" r="1.2" fill="#dfbc8a" opacity=".45"/><path d="M10 13h4" stroke="#382e26" opacity=".45"/></pattern>
          <marker id="erosion-mobile-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4 0 8Z" fill="#b9e9e7"/></marker>
          <clipPath id="erosion-mobile-ground-clip"><path d="M20 300L224 156Q242 146 259 168L282 224Q302 259 340 274V548H20Z"/></clipPath>
        </defs>
        <rect width="360" height="590" fill="#2a393b"/>
        <path d="M20 300L224 156Q242 146 259 168L282 224Q302 259 340 274V548H20Z" fill="url(#erosion-mobile-soil)" stroke="#dfbb86" strokeWidth="3"/>
        <path d="M20 300L224 156Q242 146 259 168L282 224Q302 259 340 274V548H20Z" fill="url(#erosion-mobile-grain)"/>
        <path d="M20 372Q148 300 252 246Q276 277 295 296Q314 315 340 326V382Q303 370 272 348Q245 326 225 304Q125 357 20 415Z" fill="#a5764c" opacity=".9"/>
        <path d="M20 405Q142 345 226 305Q258 342 283 359Q310 380 340 389V548H20Z" fill="url(#erosion-mobile-rock)"/>
        <path d="M20 372Q148 300 252 246Q276 277 295 296Q314 315 340 326" fill="none" stroke="#bb8c5e" strokeWidth="2" strokeDasharray="7 5"/>
        {Array.from({ length: Math.max(2, Math.round(rain / 12)) }, (_, i) => <path key={`mobile-drop-${i}`} className="erosion-raindrop" d={`M${38 + (i * 37) % 285} ${28 + (i * 19) % 60}l-5 14`} style={{ animationDelay: `${(i % 6) * -.27}s` }} opacity={.25 + rain / 150} />)}
        <g>{mobileVegetation}</g>
        <path d="M102 274q-5 31-2 55m20-67q-1 28 8 50m14-63q1 21 15 40m2-52q5 20 20 34m3-48q4 18 18 29" fill="none" stroke="#d9bd91" strokeWidth="2" opacity={.95 * (vegetation / 100)}/>
        <path className="erosion-infiltration" d="M79 277v51m20-62v42m19-54v38" stroke="#a9d7ba" strokeWidth="3" strokeDasharray="4 7" markerEnd="url(#erosion-mobile-arrow)" opacity={.25 + rain / 140}/>
        <path className="erosion-flow" d="M232 164Q260 187 273 224T319 273" strokeWidth={3 + runoff / 24} markerEnd="url(#erosion-mobile-arrow)" opacity={.35 + runoff / 150}/>
        <path className="erosion-flow erosion-flow-two" d="M211 184Q246 202 258 235T302 269" strokeWidth={2 + runoff / 30} opacity={.25 + runoff / 180}/>
        <path d="M222 162l-11 10 13 2m2 8 12 9-13 3" fill="none" stroke="#f0c48a" strokeWidth="2.5"/>
        <circle cx="244" cy="194" r="4" fill="#e3b77c"/><circle cx="256" cy="209" r="3" fill="#d8a76f"/>
        {slide && <g className="erosion-slide"><path d="M251 184Q273 211 285 244L304 266 267 278 242 227Z" fill="#76513a" stroke="#e9a168" strokeWidth="2" strokeDasharray="5 4"/><path d="M264 220l-8 12m18 1-8 13m20 0-8 13" stroke="#eaa267" strokeWidth="2"/></g>}
        <path d="M276 284q12-17 24-3 11 12 22 0 9-10 18-2" fill="none" stroke="#78bdc2" strokeWidth="5"/>
        <path d="M280 294Q303 285 340 296V329Q308 320 280 332Z" fill="#bd9568" stroke="#ddbb8b" strokeWidth="2"/>
        {Array.from({ length: Math.round(erosion / 9) }, (_, i) => <circle key={`mobile-sed-${i}`} cx={292 + (i * 13) % 41} cy={302 + (i * 7) % 20} r={2 + i % 2} fill={i % 2 ? '#d9b17c' : '#8c6549'} />)}
        <g className="erosion-mobile-label">
          <text x="18" y="24">1 · PLUIE</text><text x="22" y="115">2 · INFILTRATION</text><text x="112" y="250">RACINES · ANCRAGE</text>
          <text x="20" y="345">HORIZON DE SOL</text><text x="20" y="438">ROCHE MÈRE</text>
          <text x="208" y="136">3 · ARRACHEMENT</text><text x="209" y="227">4 · TRANSPORT</text>
          <text x="186" y="355">5 · CHENAL ET DÉPÔT</text><text x="15" y="574">ÉTAPES : pluie → ruissellement → dépôt</text>
        </g>
        {slide && <g className="erosion-mobile-label erosion-risk-mobile"><path d="M296 187l-12 19" stroke="#ffd2a4" strokeDasharray="3 3"/><text x="270" y="178">GLISSEMENT</text></g>}
        <g className="erosion-mobile-stats">
          <rect x="198" y="8" width="152" height="66" rx="7"/>
          <text x="340" y="25" textAnchor="end">PENTE {slope}°</text>
          <text x="340" y="43" textAnchor="end">PLUIE {rain}%</text>
          <text x="340" y="61" textAnchor="end">VÉGÉTATION {vegetation}%</text>
        </g>
      </svg>
      <div className="erosion-legend"><span><i className="legend-rain"/>Pluie et infiltration</span><span><i className="legend-flow"/>Ruissellement / transport</span><span><i className="legend-plant"/>Végétation / racines</span><span><i className="legend-sediment"/>Dépôt au pied</span></div>
      <p className="erosion-reading"><b>Lecture :</b> l’eau s’infiltre et s’écoule en surface; elle détache des grains, les entraîne dans le chenal puis les dépose plus bas. Les racines freinent le départ du sol. Un glissement est montré seulement lorsque l’indice du modèle devient élevé.</p>
    </div>

    <div className="erosion-controls">
      {controls.map(({ key, label, min, max, unit, help }) => <label key={key} className="erosion-control" htmlFor={`erosion-${key}`}>
        <span><b>{label}</b><output htmlFor={`erosion-${key}`}>{values[key]}{unit}</output></span>
        <input id={`erosion-${key}`} type="range" min={min} max={max} value={values[key]} onChange={(event) => setControl(key, event.target.value)} aria-describedby={`erosion-help-${key}`} />
        <small id={`erosion-help-${key}`}>{help}</small>
      </label>)}
    </div>

    <div className="erosion-results" aria-live="polite">
      <article><span>ÉROSION ET TRANSPORT</span><strong>{erosion}<small>/100</small></strong><div className="erosion-meter"><i style={{ width: `${erosion}%` }}/></div><p>{erosion > 65 ? 'Beaucoup de particules sont arrachées et entraînées.' : erosion > 30 ? 'Une partie du sol est mobilisée par le ruissellement.' : 'Peu de sol est emporté dans ce scénario.'}</p></article>
      <article className={slide ? 'erosion-alert' : ''}><span>RISQUE DE GLISSEMENT</span><strong>{slideRisk}<small>/100</small></strong><div className="erosion-meter"><i style={{ width: `${slideRisk}%` }}/></div><p>{slide ? 'Conditions favorables à une instabilité : un glissement devient possible.' : 'Dans ce modèle, les conditions ne déclenchent pas de glissement.'}</p></article>
      <aside><b>À retenir</b><p>Le risque dépend aussi de la nature des sols et des roches, de leur saturation en eau, de la forme du versant et des interventions humaines. Cet indice est un schéma comparatif, pas une prévision.</p></aside>
    </div>

    <footer className="erosion-sources"><span>POUR ALLER PLUS LOIN</span><a href="https://pubs.usgs.gov/publication/sim3353" target="_blank" rel="noreferrer">USGS · Glissements déclenchés en Haïti en 2010 ↗</a><a href="https://www.usgs.gov/programs/landslide-hazards/science/landslide-types-and-processes" target="_blank" rel="noreferrer">USGS · Fonctionnement des glissements ↗</a></footer>
    <p className="erosion-caveat">Morne l’Hôpital est cité comme contexte haïtien d’étude des versants. La scène ne cartographie pas les zones dangereuses et ne décrit pas un événement réel.</p>
  </section>;
}
