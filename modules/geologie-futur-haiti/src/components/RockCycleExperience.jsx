import { useMemo, useState } from 'react';
import './RockCycleExperience.css';

const stages = [
  {
    id: 'magma', number: '01', title: 'Magma', kind: 'matière en fusion', color: '#f07943',
    text: 'En profondeur, de la roche fond et produit un liquide silicaté. La fusion peut être partielle : le magma n’est donc pas toujours issu de la fusion complète du manteau.', mobile: 'Roche fondue en profondeur.',
    conditions: 'Chaleur, décompression ou apport de fluides selon le contexte géologique.', example: 'Magma sous une zone volcanique',
  },
  {
    id: 'cristallisation', number: '02', title: 'Cristallisation', kind: 'refroidissement', color: '#f2a64b',
    text: 'En refroidissant, le magma cristallise et forme une roche magmatique. Le refroidissement lent en profondeur donne de gros cristaux ; rapide en surface, il donne des cristaux fins ou du verre.', mobile: 'Le magma refroidit et forme une roche magmatique.',
    conditions: 'Perte de chaleur ; vitesse de refroidissement variable.', example: 'Granite en profondeur · basalte en surface',
  },
  {
    id: 'alteration', number: '03', title: 'Altération et érosion', kind: 'roche exposée', color: '#8dbb7a',
    text: 'L’eau, l’air, les variations de température et les organismes fragmentent ou transforment les roches. L’érosion enlève ensuite une partie des matériaux.', mobile: 'La roche exposée se fragmente et s’altère.',
    conditions: 'Climat, durée, pente, type de roche et couverture végétale.', example: 'Fragments et éléments dissous',
  },
  {
    id: 'transport', number: '04', title: 'Transport et dépôt', kind: 'sédiments', color: '#d6ba76',
    text: 'Les débris voyagent par l’eau, le vent, la glace ou la gravité. Quand l’énergie du courant diminue, les grains se déposent et s’accumulent en couches.', mobile: 'Les débris sont transportés, puis déposés en couches.',
    conditions: 'Transport par un agent géologique, puis baisse de son énergie.', example: 'Sable dans un delta ou une plaine alluviale',
  },
  {
    id: 'lithification', number: '05', title: 'Enfouissement et lithification', kind: 'sédiments consolidés', color: '#c78f58',
    text: 'Enfouis sous de nouvelles couches, les sédiments sont compactés. Des minéraux précipités entre les grains les cimentent : l’ensemble devient une roche sédimentaire.', mobile: 'Les sédiments enfouis se compactent et se cimentent.',
    conditions: 'Enfouissement, compaction et cimentation au cours du temps.', example: 'Sable → grès · boue → roche argileuse',
  },
  {
    id: 'metamorphisme', number: '06', title: 'Métamorphisme', kind: 'roche transformée à l’état solide', color: '#af87bd',
    text: 'Une roche enfouie change sous l’effet de la chaleur, de la pression et parfois de fluides. Elle se transforme sans fondre complètement.', mobile: 'Chaleur et pression transforment la roche solide.',
    conditions: 'Température et pression élevées, sans fusion généralisée.', example: 'Calcaire → marbre · schiste → gneiss',
  },
  {
    id: 'fusion', number: '07', title: 'Fusion', kind: 'retour au magma', color: '#ec7654',
    text: 'Si les conditions deviennent assez chaudes, une roche peut fondre et former un nouveau magma. Une roche métamorphique n’est qu’une voie possible : d’autres roches peuvent aussi fondre.', mobile: 'Une roche assez chaude fond et produit du magma.',
    conditions: 'La température atteint le domaine de fusion, selon la composition et la pression.', example: 'Roche profonde → magma',
  },
];

const links = [
  ['magma', 'cristallisation'], ['cristallisation', 'alteration'], ['alteration', 'transport'],
  ['transport', 'lithification'], ['lithification', 'metamorphisme'], ['metamorphisme', 'fusion'], ['fusion', 'magma'],
  ['lithification', 'alteration'], ['metamorphisme', 'alteration'], ['lithification', 'fusion'],
];

const routes = [
  { id: 'sedimentaire', label: 'Voie sédimentaire', path: ['cristallisation', 'alteration', 'transport', 'lithification'], note: 'Une roche affleure, s’altère, puis ses débris sont transportés, déposés et consolidés.' },
  { id: 'metamorphique', label: 'Voie métamorphique', path: ['lithification', 'metamorphisme'], note: 'Une roche sédimentaire enfouie peut se transformer à l’état solide sous pression et chaleur.' },
  { id: 'magmatique', label: 'Voie magmatique', path: ['metamorphisme', 'fusion', 'magma', 'cristallisation'], note: 'Une roche profonde peut fondre, produire du magma, puis cristalliser en refroidissant.' },
];

// Positions proportionnelles du diagramme, exprimées dans le repère viewBox 0–100.
const positions = {
  magma: [50, 10], cristallisation: [79, 24], alteration: [84, 64], transport: [60, 87],
  lithification: [28, 85], metamorphisme: [12, 56], fusion: [22, 23],
};

function curvedLink(from, to) {
  const [x1, y1] = positions[from];
  const [x2, y2] = positions[to];
  const cx = (x1 + x2) / 2 + (50 - (x1 + x2) / 2) * 0.22;
  const cy = (y1 + y2) / 2 + (50 - (y1 + y2) / 2) * 0.22;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

/**
 * Props optionnelles : onNavigate('sediments') et onNavigate('rocks') ouvrent
 * les modules « Sédiments & fossiles » et « Types de roches » dans l’application hôte.
 */
export default function RockCycleExperience({ onNavigate }) {
  const [selected, setSelected] = useState('alteration');
  const [routeId, setRouteId] = useState('sedimentaire');
  const activeRoute = routes.find((route) => route.id === routeId) || routes[0];
  const activeStage = stages.find((stage) => stage.id === selected) || stages[0];
  const routeSet = useMemo(() => new Set(activeRoute.path), [activeRoute]);

  const chooseRoute = (route) => {
    setRouteId(route.id);
    setSelected(route.path[0]);
  };

  return (
    <section className="rock-cycle" aria-labelledby="rock-cycle-title">
      <header className="rock-cycle__intro">
        <div>
          <span className="rock-cycle__eyebrow">GÉOLOGIE · TRANSFORMATIONS</span>
          <h2 id="rock-cycle-title">Le cycle des roches</h2>
          <p>Une roche peut changer plusieurs fois au cours du temps. Le cycle n’a pas de point de départ unique : chaque matière peut suivre différentes voies.</p>
        </div>
        <div className="rock-cycle__principle" role="note">
          <span aria-hidden="true">↻</span>
          <div><strong>Pas de parcours obligatoire</strong><small>Une roche peut aussi rester stable longtemps, ou emprunter une autre branche.</small></div>
        </div>
      </header>

      <div className="rock-cycle__route-picker" role="group" aria-label="Choisir un parcours de transformation">
        <span>Explorer un parcours</span>
        {routes.map((route) => (
          <button key={route.id} type="button" className={routeId === route.id ? 'is-active' : ''} aria-pressed={routeId === route.id} onClick={() => chooseRoute(route)}>
            {route.label}
          </button>
        ))}
      </div>

      <div className="rock-cycle__layout">
        <div className="rock-cycle__diagram-wrap">
          <div className="rock-cycle__diagram-heading"><strong>Des matières, des processus, plusieurs chemins</strong><span>Choisis une étape pour en savoir plus</span></div>
          <div className="rock-cycle__plot">
            <svg className="rock-cycle__arrows" viewBox="0 0 100 100" aria-hidden="true" preserveAspectRatio="none">
              <defs><marker id="rock-cycle-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0 L5 2.5 L0 5 Z" fill="currentColor" /></marker></defs>
              {links.map(([from, to]) => <path key={`${from}-${to}`} d={curvedLink(from, to)} className={`rock-cycle__link ${routeSet.has(from) && routeSet.has(to) ? 'is-route' : ''}`} markerEnd="url(#rock-cycle-arrow)" />)}
            </svg>
            <div className="rock-cycle__center" aria-hidden="true"><span>matière<br />terrestre</span><b>↻</b><small>transformations</small></div>
            {stages.map((stage) => {
              const [x, y] = positions[stage.id];
              const active = selected === stage.id;
              return (
                <button key={stage.id} type="button" className={`rock-cycle__node ${active ? 'is-selected' : ''} ${routeSet.has(stage.id) ? 'is-in-route' : ''}`} style={{ '--node-x': `${x}%`, '--node-y': `${y}%`, '--node-color': stage.color }} onClick={() => setSelected(stage.id)} aria-pressed={active} aria-label={`${stage.number}. ${stage.title}${routeSet.has(stage.id) ? ', dans le parcours choisi' : ''}`}>
                  <span className="rock-cycle__node-number">{stage.number}</span><strong>{stage.title}</strong>
                </button>
              );
            })}
          </div>
          <div className="rock-cycle__legend"><span><i className="rock-cycle__legend-process" /> Processus</span><span><i className="rock-cycle__legend-material" /> Matière ou type de roche</span></div>
          <ol className="rock-cycle__mobile-flow" aria-label="Étapes du cycle des roches">
            {stages.map((stage, index) => {
              const active = selected === stage.id;
              return <li key={stage.id} className={index < stages.length - 1 ? 'has-next' : ''}>
                <button type="button" className={`rock-cycle__mobile-step ${active ? 'is-selected' : ''}`} style={{ '--node-color': stage.color }} onClick={() => setSelected(stage.id)} aria-pressed={active}>
                  <span className="rock-cycle__mobile-number">{stage.number}</span>
                  <span className="rock-cycle__mobile-copy"><strong>{stage.title}</strong><small>{stage.mobile}</small></span>
                  <span className="rock-cycle__mobile-kind">{stage.kind}</span>
                </button>
                {index < stages.length - 1 && <span className="rock-cycle__mobile-arrow" aria-hidden="true">↓</span>}
              </li>;
            })}
          </ol>
          <p className="rock-cycle__mobile-return"><span aria-hidden="true">↺</span> La fusion peut reformer du magma : le cycle peut recommencer.</p>
          <div className="rock-cycle__mobile-branches" aria-label="Branches possibles du cycle">
            <strong>Des branches sont possibles</strong>
            <p>Une roche magmatique, sédimentaire ou métamorphique exposée peut s’altérer. Une roche enfouie peut aussi se transformer ou fondre selon les conditions.</p>
          </div>
        </div>

        <aside className="rock-cycle__detail" aria-live="polite" aria-atomic="true">
          <span className="rock-cycle__detail-number" style={{ '--node-color': activeStage.color }}>ÉTAPE {activeStage.number}</span>
          <h3>{activeStage.title}</h3>
          <span className="rock-cycle__kind">{activeStage.kind}</span>
          <p>{activeStage.text}</p>
          <dl><div><dt>Ce qui agit</dt><dd>{activeStage.conditions}</dd></div><div><dt>Exemple</dt><dd>{activeStage.example}</dd></div></dl>
          <div className="rock-cycle__route-note"><strong>{activeRoute.label}</strong><p>{activeRoute.note}</p></div>
          {typeof onNavigate === 'function' && <div className="rock-cycle__module-links" aria-label="Approfondir dans les autres modules">
            <button type="button" onClick={() => onNavigate('sediments')}>Explorer les sédiments et fossiles <span aria-hidden="true">→</span></button>
            <button type="button" onClick={() => onNavigate('rocks')}>Voir les types de roches <span aria-hidden="true">→</span></button>
          </div>}
        </aside>
      </div>

      <footer className="rock-cycle__sources">
        <strong>Pour aller plus loin</strong>
        <a href="https://www.usgs.gov/educational-resources/whats-new-weeks-9-12" target="_blank" rel="noreferrer">USGS · The Rock Cycle (K–12) <span aria-hidden="true">↗</span></a>
        <a href="https://pubs.usgs.gov/of/1994/0636/report.pdf" target="_blank" rel="noreferrer">USGS · The Rock Cycle <span aria-hidden="true">↗</span></a>
        <p>Schéma pédagogique : les vitesses, pressions, températures et trajets varient selon le lieu et la roche.</p>
      </footer>
    </section>
  );
}
