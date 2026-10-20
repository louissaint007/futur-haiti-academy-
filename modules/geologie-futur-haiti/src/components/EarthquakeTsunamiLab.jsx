import { useEffect, useMemo, useState } from 'react';
import './EarthquakeTsunamiLab.css';

const CASES = {
  haiti: {
    name: 'Haïti · 12 janvier 2010', magnitude: 'Mw 7,0',
    detail: 'Un séisme peu profond dans une zone de failles complexe. Le mouvement était surtout horizontal, avec une composante compressive : ce n’est pas le scénario simple d’un soulèvement du fond marin qui produit un grand tsunami.',
    link: 'https://www.usgs.gov/publications/complex-rupture-during-12-january-2010-haiti-earthquake',
    urlLabel: 'Étude USGS sur la rupture en Haïti',
  },
  tohoku: {
    name: 'Japon · Tōhoku, 11 mars 2011', magnitude: 'Mw 9,1',
    detail: 'La rupture de subduction au large du Japon a déplacé verticalement le fond marin et la colonne d’eau. C’est un exemple réel de séisme ayant déclenché un tsunami.',
    link: 'https://earthquake.usgs.gov/earthquakes/eventpage/official20110311054624120_30/executive',
    urlLabel: 'Fiche USGS du séisme de Tōhoku',
  },
};

function makeTrace(elapsed, duration = 10) {
  const width = 760;
  const baseline = 70;
  const points = [];
  for (let i = 0; i <= 380; i += 1) {
    const x = (i / 380) * width;
    const t = (i / 380) * duration;
    let amp = 0;
    if (t > 2.0) amp += 5 * Math.sin(t * 23) * Math.min(1, (t - 2) / 0.35);
    if (t > 4.4) amp += 12 * Math.sin(t * 28) * Math.min(1, (t - 4.4) / 0.3);
    if (t > 6.7) amp += 22 * Math.sin(t * 19) * Math.min(1, (t - 6.7) / 0.25);
    const visible = Math.min(1, elapsed / duration);
    points.push(`${x.toFixed(1)},${(baseline + (i / 380 <= visible ? amp : 0)).toFixed(1)}`);
  }
  return `M ${points.join(' L ')}`;
}

function EarthquakeDiagram({ active }) {
  return (
    <svg className={`ets-diagram ${active ? 'is-active' : ''}`} viewBox="0 0 760 300" role="img" aria-labelledby="ets-quake-title ets-quake-desc">
      <title id="ets-quake-title">Coupe d’une faille et propagation des ondes sismiques</title>
      <desc id="ets-quake-desc">Deux blocs rocheux glissent le long d’une faille. Les ondes P, S et de surface se propagent depuis le foyer vers un sismographe.</desc>
      <defs>
        <linearGradient id="ets-rock" x2="0" y2="1"><stop stopColor="#d2b18b"/><stop offset="1" stopColor="#9e7655"/></linearGradient>
        <linearGradient id="ets-sea" x2="0" y2="1"><stop stopColor="#98dce2"/><stop offset="1" stopColor="#4b9fae"/></linearGradient>
      </defs>
      <rect width="760" height="300" rx="18" fill="#eaf4f2"/>
      <path d="M0 105 Q160 91 300 104 T760 100 V300 H0Z" fill="url(#ets-rock)"/>
      <path d="M0 101 Q160 87 300 100 T760 96" fill="none" stroke="#44655b" strokeWidth="5"/>
      <path className="ets-block ets-block-left" d="M0 107 L390 105 L280 300 H0Z" fill="#c7a47c" stroke="#886443" strokeWidth="2"/>
      <path className="ets-block ets-block-right" d="M390 105 L760 99 V300 H280Z" fill="#ad8763" stroke="#886443" strokeWidth="2"/>
      <path d="M390 105 L280 300" stroke="#603f31" strokeWidth="7" strokeDasharray="10 5"/>
      <text x="32" y="139" className="ets-svg-label">bloc rocheux</text>
      <text x="432" y="139" className="ets-svg-label">faille</text>
      <circle cx="337" cy="205" r="9" fill="#ffcf63" stroke="#733c25" strokeWidth="3"/>
      <text x="350" y="214" className="ets-svg-small">foyer</text>
      <circle className="ets-wave ets-wave-p" cx="337" cy="205" r="22" fill="none" stroke="#f3b546" strokeWidth="4"/>
      <circle className="ets-wave ets-wave-s" cx="337" cy="205" r="22" fill="none" stroke="#4b9e9c" strokeWidth="3"/>
      <path className="ets-surface-wave" d="M337 101 Q380 78 423 101 T509 101 T595 101 T681 101" fill="none" stroke="#ee9147" strokeWidth="4"/>
      <g transform="translate(650 38)">
        <rect x="0" y="0" width="58" height="54" rx="7" fill="#fff" stroke="#345c5c" strokeWidth="2"/>
        <path d="M8 28 H50" stroke="#cad8d4" strokeWidth="1"/>
        <path className="ets-mini-trace" d="M7 28 L17 28 L20 25 L23 31 L27 23 L31 35 L35 14 L39 40 L43 26 L51 28" fill="none" stroke="#e46e43" strokeWidth="2.5"/>
        <text x="-4" y="72" className="ets-svg-small">sismographe</text>
      </g>
      <g className="ets-wave-key"><circle cx="45" cy="263" r="5" fill="#f3b546"/><text x="57" y="267">P · arrive en premier</text><circle cx="235" cy="263" r="5" fill="#4b9e9c"/><text x="247" y="267">S · arrive ensuite</text><circle cx="420" cy="263" r="5" fill="#ee9147"/><text x="432" y="267">surface · souvent ample</text></g>
    </svg>
  );
}

function TsunamiDiagram({ active, enabled }) {
  return (
    <div className={`ets-tsunami-story ${active ? 'is-active' : ''} ${enabled ? 'has-tsunami' : ''}`} role="group" aria-labelledby="ets-tsunami-title" aria-describedby="ets-tsunami-desc">
      <div className="ets-tsunami-story-heading">
        <h3 id="ets-tsunami-title">Du fond marin jusqu’au littoral</h3>
        <p id="ets-tsunami-desc">Quatre étapes à lire dans l’ordre. La grande vague n’apparaît que si une vaste zone du fond marin se déplace verticalement.</p>
      </div>
      <div className="ets-tsunami-steps">
        <article className="ets-tsunami-step ets-step-source">
          <div className="ets-step-copy"><span className="ets-step-number">1</span><div><h4>Le fond marin bouge</h4><p>Une faille sous-marine décale verticalement le plancher océanique.</p></div></div>
          <svg viewBox="0 0 300 150" role="img" aria-label={enabled ? 'Une faille soulève une partie du fond marin' : 'La faille bouge sans soulever le fond marin'}>
            <rect width="300" height="150" rx="12" fill="#c9edf0"/><path d="M0 38 H300 V150 H0Z" fill="#318aa2"/><path d="M0 105 H118 L158 88 L195 106 H300 V150 H0Z" fill="#b99068" stroke="#6d5039" strokeWidth="3"/>
            <path d="M157 89 L143 120" stroke="#4f382c" strokeWidth="5" strokeDasharray="6 4"/>
            <path className="ets-step-lift-arrow" d="M177 105 V67" stroke="#a33e24" strokeWidth="4"/><path className="ets-step-lift-arrow" d="M177 67 l-8 12 M177 67 l8 12" stroke="#a33e24" strokeWidth="4"/>
            {!enabled && <path d="M164 73 L190 99 M190 73 L164 99" stroke="#743b32" strokeWidth="5"/>}
            <text x="12" y="28" className="ets-svg-small">océan</text><text x="201" y="132" className="ets-svg-small">fond marin</text>
          </svg>
        </article>
        <article className="ets-tsunami-step ets-step-column">
          <div className="ets-step-copy"><span className="ets-step-number">2</span><div><h4>La colonne d’eau est déplacée</h4><p>L’eau au-dessus de la zone soulevée est poussée vers le haut; elle commence à retomber et met l’océan en mouvement.</p></div></div>
          <svg viewBox="0 0 300 150" role="img" aria-label={enabled ? 'La colonne d’eau est poussée vers le haut puis mise en mouvement' : 'Sans déplacement vertical du fond, la colonne d’eau reste calme'}>
            <rect width="300" height="150" rx="12" fill="#c9edf0"/><path d="M0 40 H300 V150 H0Z" fill="#318aa2"/><path d="M0 110 H108 L150 91 L192 110 H300 V150 H0Z" fill="#b99068" stroke="#6d5039" strokeWidth="3"/>
            <path className="ets-water-column" d="M150 92 V50" stroke="#fff4c4" strokeWidth="5"/><path className="ets-water-column" d="M150 50 l-8 12 M150 50 l8 12" stroke="#fff4c4" strokeWidth="5"/>
            <path className="ets-column-ripple" d="M110 44 Q130 30 150 44 T190 44" fill="none" stroke="#fff" strokeWidth="5"/>
            {!enabled && <path d="M136 63 L164 91 M164 63 L136 91" stroke="#743b32" strokeWidth="5"/>}
            <text x="12" y="28" className="ets-svg-small">surface de l’océan</text><text x="201" y="132" className="ets-svg-small">fond marin</text>
          </svg>
        </article>
        <article className="ets-tsunami-step ets-step-ocean">
          <div className="ets-step-copy"><span className="ets-step-number">3</span><div><h4>La perturbation traverse l’océan</h4><p>En eau profonde, le tsunami est rapide et souvent bas; sa longueur d’onde est très grande.</p></div></div>
          <svg viewBox="0 0 300 150" role="img" aria-label={enabled ? 'Une longue onde de faible hauteur se propage rapidement en océan profond' : 'Pas de vague tsunami propagée dans ce scénario'}>
            <rect width="300" height="150" rx="12" fill="#c9edf0"/><path d="M0 46 H300 V150 H0Z" fill="#287e9c"/><path d="M0 122 H300 V150 H0Z" fill="#b99068"/>
            <path className="ets-deep-wave" d="M22 46 Q65 34 108 46 T194 46 T278 46" fill="none" stroke="#fff4c4" strokeWidth="6"/>
            <path className="ets-propagation-arrow" d="M36 80 H265 M253 70 L265 80 L253 90" fill="none" stroke="#fff" strokeWidth="4"/>
            <text x="13" y="111" className="ets-svg-small">océan profond</text><text x="106" y="29" className="ets-svg-small">onde longue, faible hauteur</text>
            {!enabled && <g className="ets-step-disabled"><rect x="38" y="54" width="224" height="44" rx="9"/><text x="54" y="81">Pas de tsunami propagé</text></g>}
          </svg>
        </article>
        <article className="ets-tsunami-step ets-step-coast">
          <div className="ets-step-copy"><span className="ets-step-number">4</span><div><h4>La vague grandit près de la côte</h4><p>En eau moins profonde, elle ralentit, se comprime et peut atteindre une grande hauteur à terre.</p></div></div>
          <svg viewBox="0 0 300 150" role="img" aria-label={enabled ? 'Près de la côte, la vague ralentit et peut monter sur les terres' : 'Aucune arrivée de tsunami sur la côte dans ce scénario'}>
            <rect width="300" height="150" rx="12" fill="#c9edf0"/><path d="M0 43 H208 L300 82 V150 H0Z" fill="#318aa2"/><path d="M0 123 Q106 116 180 126 L211 120 L238 103 L259 77 L300 74 V150 H0Z" fill="#c29b70" stroke="#6d5039" strokeWidth="3"/>
            <path className="ets-coast-wave" d="M150 43 Q181 28 210 47 Q235 64 251 47 Q271 28 293 52" fill="none" stroke="#fff4c4" strokeWidth="8" strokeLinecap="round"/>
            <path className="ets-inland-arrow" d="M219 73 H271 M260 64 L271 73 L260 82" fill="none" stroke="#a33e24" strokeWidth="4"/>
            <text x="12" y="28" className="ets-svg-small">mer</text><text x="235" y="132" className="ets-svg-small">terre</text>
            {!enabled && <g className="ets-step-disabled"><rect x="38" y="54" width="224" height="44" rx="9"/><text x="52" y="81">Pas d’arrivée de tsunami</text></g>}
          </svg>
        </article>
      </div>
      {!enabled && <p className="ets-tsunami-no-event" role="status"><strong>Dans ce scénario, le fond ne se soulève pas :</strong> la colonne d’eau n’est pas déplacée, donc aucune vague tsunami ne se propage jusqu’à la côte.</p>}
    </div>
  );
}

export default function EarthquakeTsunamiLab() {
  const [view, setView] = useState('earthquake');
  const [caseKey, setCaseKey] = useState('haiti');
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [verticalDisplacement, setVerticalDisplacement] = useState(false);
  const currentCase = CASES[caseKey];
  const trace = useMemo(() => makeTrace(elapsed), [elapsed]);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => setElapsed((value) => {
      return Math.min(10, value + 0.12);
    }), 100);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (elapsed >= 10) setPlaying(false);
  }, [elapsed]);

  const start = () => { setElapsed(0); setPlaying(true); };
  const selectCase = (value) => { setCaseKey(value); setElapsed(0); setPlaying(false); setVerticalDisplacement(value === 'tohoku'); };

  return (
    <section className="ets-lab" aria-labelledby="ets-title">
      <header className="ets-header">
        <div><p className="ets-eyebrow">LABORATOIRE INTERACTIF</p><h2 id="ets-title">Séismes et tsunamis</h2><p>Observe la rupture d’une faille, les ondes qui traversent le sol et le signal enregistré. Puis compare deux scénarios côtiers.</p></div>
        <div className="ets-case-picker" role="group" aria-label="Choisir un cas réel">
          <button type="button" className={caseKey === 'haiti' ? 'selected' : ''} aria-pressed={caseKey === 'haiti'} onClick={() => selectCase('haiti')}>Haïti · 2010</button>
          <button type="button" className={caseKey === 'tohoku' ? 'selected' : ''} aria-pressed={caseKey === 'tohoku'} onClick={() => selectCase('tohoku')}>Japon · 2011</button>
        </div>
      </header>

      <nav className="ets-tabs" aria-label="Expérience">
        <button type="button" className={view === 'earthquake' ? 'selected' : ''} aria-pressed={view === 'earthquake'} onClick={() => setView('earthquake')}>1. Faille et ondes</button>
        <button type="button" className={view === 'tsunami' ? 'selected' : ''} aria-pressed={view === 'tsunami'} onClick={() => setView('tsunami')}>2. Quand un tsunami se forme</button>
      </nav>

      {view === 'earthquake' ? <>
        <div className="ets-fact"><strong>{currentCase.name}</strong><span>{currentCase.magnitude}</span><p>{currentCase.detail}</p><a href={currentCase.link} target="_blank" rel="noreferrer">{currentCase.urlLabel} ↗</a></div>
        <EarthquakeDiagram active={playing}/>
        <div className="ets-controls"><button type="button" className="ets-primary" onClick={start}>{playing ? 'Relancer la rupture' : 'Déclencher le séisme'}</button><span aria-live="polite">{playing ? 'Les ondes se propagent…' : elapsed >= 10 ? 'Enregistrement terminé' : 'Prêt à enregistrer'}</span></div>
        <div className="ets-seismogram">
          <div className="ets-seismo-heading"><div><h3>Le sismogramme se dessine</h3><p>Le P arrive avant le S ; les ondes de surface arrivent ensuite.</p></div><span>temps →</span></div>
          <svg viewBox="0 0 760 110" role="img" aria-label="Sismogramme animé avec arrivées des ondes P, S et de surface"><rect width="760" height="110" rx="12" fill="#173b40"/><path d="M0 70 H760" stroke="#466568" strokeWidth="1"/><path d={trace} fill="none" stroke="#f1bc68" strokeWidth="2.8"/><g className="ets-arrivals"><line x1="152" y1="15" x2="152" y2="92"/><line x1="334" y1="15" x2="334" y2="92"/><line x1="509" y1="15" x2="509" y2="92"/></g><text x="144" y="14">P</text><text x="326" y="14">S</text><text x="478" y="14">surface</text></svg>
        </div>
      </> : <>
        <div className="ets-condition">
          <div><strong>Condition du scénario</strong><p>Un tsunami n’est possible que dans certains séismes sous-marins qui déplacent verticalement une grande portion du fond et de l’eau au-dessus.</p><small className="ets-case-scope">Le commutateur règle une expérience générique; il ne change pas les faits du cas réel sélectionné.</small></div>
          <label className="ets-switch"><input type="checkbox" checked={verticalDisplacement} onChange={(event) => setVerticalDisplacement(event.target.checked)} /><span className="ets-switch-track" aria-hidden="true"/><span>{verticalDisplacement ? 'Soulèvement vertical activé' : 'Aucun soulèvement vertical'}</span></label>
        </div>
        <TsunamiDiagram active={playing} enabled={verticalDisplacement}/>
        <div className="ets-controls"><button type="button" className="ets-primary" onClick={start}>{playing ? 'Rejouer la séquence' : 'Animer la séquence'}</button><span aria-live="polite">{verticalDisplacement ? 'Fond marin → onde océanique → littoral' : 'Le séisme secoue le sol, sans déclencher de tsunami ici.'}</span></div>
        <aside className={`ets-takeaway ${verticalDisplacement ? '' : 'is-quiet'}`}><strong>{verticalDisplacement ? 'Un tsunami est possible, pas automatique.' : 'Un séisme ne déclenche pas toujours un tsunami.'}</strong><span>La magnitude seule ne suffit pas : la localisation sous-marine, la profondeur et le déplacement vertical comptent aussi.</span></aside>
        <p className="ets-source">Source scientifique : <a href="https://www.usgs.gov/centers/pcmsc/science/tsunami-generation-2004-m91-sumatra-andaman-earthquake" target="_blank" rel="noreferrer">USGS · déplacement vertical du fond marin et génération d’un tsunami ↗</a></p>
      </>}
      <footer className="ets-footer"><span>Schéma pédagogique, non à l’échelle.</span><a href="https://earthquake.usgs.gov/monitoring/seismograms/about.php" target="_blank" rel="noreferrer">USGS · lire un sismogramme ↗</a></footer>
    </section>
  );
}
