import { useRef, useState } from 'react';
import GeologyScene from './GeologyScene.jsx';
import FieldReferences from './components/FieldReferences.jsx';
import RockGallery from './components/RockGallery.jsx';
import VolcanoInspector from './components/VolcanoInspector.jsx';
import FossilComparator from './components/FossilComparator.jsx';
import MagmaOriginGuide from './components/MagmaOriginGuide.jsx';
import DeepTimeExperience from './components/DeepTimeExperience.jsx';
import EarthquakeTsunamiLab from './components/EarthquakeTsunamiLab.jsx';
import ErosionLandslideExperience from './components/ErosionLandslideExperience.jsx';
import RockCycleExperience from './components/RockCycleExperience.jsx';
import HaitiGeologyMap from './components/HaitiGeologyMap.jsx';
import SceneErrorBoundary from './components/SceneErrorBoundary.jsx';
import VolcanoPhases from './components/VolcanoPhases.jsx';
import { modules } from './data/modules.js';

const VOLCANO_SPEED = 1.5;

export default function App() {
  const orbitApiRef = useRef(null);
  const [active, setActive] = useState('volcano');
  const [boundary, setBoundary] = useState('Divergente');
  const [tectonicView, setTectonicView] = useState('mouvements');
  const [eventReplay, setEventReplay] = useState(0);
  const [sedimentStage, setSedimentStage] = useState(3);
  const [fossilizationStage, setFossilizationStage] = useState(3);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [intenseEruption, setIntenseEruption] = useState(false);
  const [eruptionType, setEruptionType] = useState('effusive');
  const [selectedRock, setSelectedRock] = useState('Granite');
  const [view, setView] = useState('model');
  const [volcanoPart, setVolcanoPart] = useState(null);
  const [volcanoExploded, setVolcanoExploded] = useState(false);
  const [volcanoStudy, setVolcanoStudy] = useState('eruption');
  const [magmaOriginStep, setMagmaOriginStep] = useState(2);
  const module = modules.find((item) => item.id === active);
  const eventMode = active === 'plates' && tectonicView === 'events';
  const magmaOriginMode = active === 'volcano' && volcanoStudy === 'origin' && view === 'model';
  const hideGenericSummary = magmaOriginMode || ['deep-time', 'earthquakes', 'erosion', 'rock-cycle', 'haiti-geology'].includes(active);
  const sceneMode = eventMode ? 'earthquake' : magmaOriginMode ? 'magma-origin' : active;
  const canReference = active !== 'rocks';
  const referenceMode = view === 'reference' && canReference && !eventMode;
  const experienceModule = ['deep-time', 'earthquakes', 'erosion', 'rock-cycle', 'haiti-geology'].includes(active);
  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#home" aria-label="Terra accueil"><span className="brand-mark">T</span><span><b>TERRA</b><small>FUTUR HAÏTI · SCIENCES DE LA TERRE</small></span></a>
      <div className="top-center"><span className="live-dot" /> LABORATOIRE INTERACTIF <i>·</i> VERSION DÉMO</div>
      <button className="about-button" onClick={() => document.getElementById('sources')?.scrollIntoView({ behavior: 'smooth' })}>Sources & méthode <span>↗</span></button>
    </header>
    <div className="workspace">
      <aside className="sidebar">
        <div className="side-kicker">EXPLORER</div><h1><span>La Terre</span><em>en mouvement.</em></h1>
        <p className="intro">Observe les processus géologiques et compare les modèles à des références du monde réel.</p>
        <div className="module-list" role="tablist" aria-label="Modules géologiques">
          {modules.map((item, index) => <button key={item.id} role="tab" aria-selected={active === item.id} className={`module-tab ${active === item.id ? 'active' : ''}`} onClick={() => { setActive(item.id); setView('model'); }}>
            <span className="module-index">0{index + 1}</span><span className="module-icon">{item.icon}</span><span className="module-name"><b>{item.title}</b><small>{item.eyebrow}</small></span><span className="tab-arrow">↗</span>
          </button>)}
        </div>
        {active === 'plates' && !eventMode && <div className="side-control"><label htmlFor="boundary">TYPE DE LIMITE</label><select id="boundary" value={boundary} onChange={(event) => setBoundary(event.target.value)}><option>Divergente</option><option>Convergente</option><option>Transformante</option></select></div>}
        <div className="side-bottom"><span className="source-dot" /> Références et modèles pédagogiques <span>·</span> FR</div>
      </aside>
      <section className="main-panel">
        {active === 'plates' && <div className="tectonic-view-switch" role="tablist" aria-label="Explorer la tectonique">
          <button role="tab" aria-selected={!eventMode} className={!eventMode ? 'active' : ''} onClick={() => setTectonicView('mouvements')}>Mouvements des plaques</button>
          <button role="tab" aria-selected={eventMode} className={eventMode ? 'active' : ''} onClick={() => { setTectonicView('events'); setView('model'); setPlaying(true); }}>Événements tectoniques</button>
        </div>}
        {eventMode && <div className="event-heading"><div><span className="scene-kicker">CAUSE ET CONSÉQUENCES</span><h3>Séisme · rupture et ondes</h3></div><button className="event-replay" onClick={() => { setEventReplay((value) => value + 1); setPlaying(true); }}>↻ Rejouer le séisme</button></div>}
        <div className={`scene-topline ${experienceModule ? 'feature-header-hidden' : ''}`}><div><span className="scene-kicker">{magmaOriginMode ? 'MAGMATISME / SOURCE EN PROFONDEUR' : eventMode ? 'DYNAMIQUE INTERNE / ÉVÉNEMENT 3D' : `${module.eyebrow} / ${active === 'rocks' ? 'PHOTOTHÈQUE' : referenceMode ? 'RÉFÉRENCE DU TERRAIN' : experienceModule ? 'EXPÉRIENCE INTERACTIVE' : 'EXPLORATION 3D'}`}</span><h2>{magmaOriginMode ? 'D’où vient le magma ?' : eventMode ? 'Un séisme se propage dans la croûte' : module.heading}</h2></div><div className="scene-actions">{active !== 'rocks' && !eventMode && !experienceModule && <div className="view-toggle" role="group" aria-label="Choisir modèle ou référence"><button className={!referenceMode ? 'active' : ''} onClick={() => setView('model')}>Modèle</button><button className={referenceMode ? 'active' : ''} onClick={() => setView('reference')}>{active === 'plates' ? 'Carte en français' : 'Photo réelle'}</button></div>}{active === 'volcano' && !referenceMode && !magmaOriginMode && <button className={`eruption-button ${intenseEruption ? 'active' : ''}`} aria-pressed={intenseEruption} onClick={() => { setIntenseEruption((value) => !value); setPlaying(true); }}>{intenseEruption ? 'Activite intense ON' : eruptionType === 'effusive' ? 'Renforcer la coulee' : 'Activite explosive intense'}</button>}{!referenceMode && active !== 'rocks' && !experienceModule && <button className="icon-button" title={playing ? 'Mettre en pause' : 'Lire'} onClick={() => setPlaying((value) => !value)}>{playing ? 'Ⅱ' : '▶'}</button>}</div></div>
        {active === 'volcano' && !referenceMode && <div className="volcano-study-switch" role="tablist" aria-label="Choisir l’étude du volcan">
          <button type="button" role="tab" aria-selected={!magmaOriginMode} className={!magmaOriginMode ? 'active' : ''} onClick={() => { setVolcanoStudy('eruption'); setView('model'); setPlaying(true); }}>Volcan et éruption</button>
          <button type="button" role="tab" aria-selected={magmaOriginMode} className={magmaOriginMode ? 'active' : ''} onClick={() => { setVolcanoStudy('origin'); setMagmaOriginStep(2); setVolcanoPart(null); setVolcanoExploded(false); setView('model'); setPlaying(true); }}>Origine du magma</button>
        </div>}
        {active === 'volcano' && !referenceMode && !magmaOriginMode && <section className="eruption-type-panel" aria-label="Comparer les types d'éruption volcanique">
          <span className="eruption-type-kicker">TYPE D’ÉRUPTION</span>
          <div className="eruption-type-options" role="group" aria-label="Choisir un type d’éruption">
            <button type="button" className={eruptionType === 'effusive' ? 'active' : ''} aria-pressed={eruptionType === 'effusive'} onClick={() => { setEruptionType('effusive'); setIntenseEruption(false); setPlaying(true); }}>
              <b>Effusive</b><small>Magma fluide · longues coulées · peu de cendres</small>
            </button>
            <button type="button" className={eruptionType === 'explosive' ? 'active' : ''} aria-pressed={eruptionType === 'explosive'} onClick={() => { setEruptionType('explosive'); setIntenseEruption(false); setPlaying(true); }}>
              <b>Explosive</b><small>Gaz piégés · projections · panache de cendres</small>
            </button>
          </div>
        </section>}
        {active === 'rocks' ? <RockGallery selected={selectedRock} onSelect={setSelectedRock} />
          : active === 'deep-time' ? <DeepTimeExperience />
            : active === 'earthquakes' ? <EarthquakeTsunamiLab />
              : active === 'erosion' ? <ErosionLandslideExperience />
                : active === 'rock-cycle' ? <RockCycleExperience onNavigate={setActive} />
                  : active === 'haiti-geology' ? <HaitiGeologyMap onNavigate={setActive} />
                    : <div className={`scene-wrap ${referenceMode ? 'reference-wrap' : ''} ${magmaOriginMode ? 'magma-origin-wrap' : ''}`}>
          {referenceMode ? <FieldReferences key={active} mode={active} /> : <><SceneErrorBoundary key={sceneMode}><GeologyScene mode={sceneMode} boundary={boundary} speed={active === 'volcano' ? VOLCANO_SPEED : speed} playing={playing} intense={intenseEruption} eruptionType={eruptionType} selectedRock={selectedRock} volcanoPart={volcanoPart || 'all'} exploded={volcanoExploded} eventReplay={eventReplay} sedimentStage={sedimentStage} fossilizationStage={fossilizationStage} originStep={magmaOriginStep} orbitApiRef={orbitApiRef} /></SceneErrorBoundary>
            <div className="scene-stamp"><span>{magmaOriginMode ? 'SUBDUCTION · CASCADES · COUPE SCHÉMATIQUE' : eventMode ? 'FOYER · ÉPICENTRE · ONDES SISMIQUES' : active === 'volcano' ? 'MONT ST. HELENS · RELIEF USGS' : active === 'sediments' ? 'CERRO BALLENA · SCAN 3D CC0' : active === 'plates' && boundary === 'Convergente' ? 'PLAQUE COCOS · USGS SLAB2' : 'TERRE · 3D'}</span><span>SCÈNE {String(modules.findIndex((entry) => entry.id === active) + 1).padStart(2, '0')} / {String(modules.length).padStart(2, '0')}</span></div>
            <div className="orbit-tools" role="group" aria-label="Commandes de la caméra 3D">
              <button aria-label="Zoom avant" title="Zoom avant" onClick={() => orbitApiRef.current?.zoomIn()}>+</button>
              <button aria-label="Recentrer la vue" title="Recentrer la vue" onClick={() => orbitApiRef.current?.reset()}>↺</button>
              <button aria-label="Zoom arrière" title="Zoom arrière" onClick={() => orbitApiRef.current?.zoomOut()}>−</button>
            </div>
            <div className="scene-controls"><span className="gesture-desktop">Glisser : tourner <i>·</i> Clic droit : déplacer <i>·</i> Molette : zoomer</span><span className="gesture-mobile">1 doigt : tourner <i>·</i> 2 doigts : déplacer et zoomer</span>{active !== 'volcano' && active !== 'sediments' && <label className="speed-control">VITESSE <input aria-label="Vitesse de simulation" type="range" min="0.25" max="2.5" step="0.25" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /><b>{speed.toFixed(2)}×</b></label>}</div></>}
        </div>}
        {active === 'sediments' && !referenceMode && <section className="sediment-process" aria-label="Étapes de formation d'une roche sédimentaire">
          <div className="sediment-process-head"><div><span>EXPÉRIENCE GUIDÉE · FORMATION DES STRATES</span><h3>{['Dépôt initial', 'Accumulation', 'Enfouissement', 'Roche sédimentaire'][sedimentStage]}</h3></div><small>Choisis une étape pour voir la coupe évoluer</small></div>
          <div className="sediment-steps" role="group" aria-label="Choisir une étape de sédimentation">
            {[
              ['Dépôt', 'Les grains se déposent au fond'],
              ['Accumulation', 'De nouveaux lits se superposent'],
              ['Enfouissement', 'Les couches anciennes sont recouvertes'],
              ['Lithification', 'Compaction et cimentation solidifient les dépôts'],
            ].map(([title, description], index) => <button key={title} type="button" className={sedimentStage === index ? 'active' : ''} aria-pressed={sedimentStage === index} onClick={() => setSedimentStage(index)}><b>0{index + 1} · {title}</b><small>{description}</small></button>)}
          </div>
          <p>{[
            'Des particules transportées par l’eau, le vent ou la gravité se déposent lorsque l’énergie du milieu diminue. La scène montre le début d’une accumulation, pas un débit réel.',
            'Les dépôts successifs forment des lits. Chaque lit enregistre les conditions du milieu au moment où il se forme.',
            'Les dépôts plus récents recouvrent les plus anciens. La pression augmente et les espaces entre les grains diminuent.',
            'Avec le temps, la compaction et les minéraux qui cimentent les grains transforment les sédiments en roche. Le temps est fortement condensé dans ce modèle.',
          ][sedimentStage]}</p>
        </section>}
        {active === 'sediments' && !referenceMode && <section className="fossil-process" aria-label="Étapes de fossilisation">
          <div className="fossil-process-head"><div><span>SECONDE EXPÉRIENCE GUIDÉE · DEVENIR UN FOSSILE</span><h3>{['Mort de l’organisme', 'Enfouissement rapide', 'Fossilisation', 'Mise au jour'][fossilizationStage]}</h3></div><small>La coupe montre les restes dans les strates</small></div>
          <div className="fossil-steps" role="group" aria-label="Choisir une étape de fossilisation">
            {[
              ['Après la mort', 'Les parties molles disparaissent'],
              ['Enfouissement', 'Les sédiments protègent les restes'],
              ['Conservation', 'Des minéraux préservent la coquille'],
              ['Érosion', 'Les couches supérieures sont retirées'],
            ].map(([title, description], index) => <button key={title} type="button" className={fossilizationStage === index ? 'active' : ''} aria-pressed={fossilizationStage === index} onClick={() => setFossilizationStage(index)}><b>0{index + 1} · {title}</b><small>{description}</small></button>)}
          </div>
          <p>{[
            'Après la mort de l’animal, les parties molles se décomposent généralement. Les coquilles et les os ont plus de chances d’être conservés.',
            'Un enfouissement rapide peut protéger les restes des charognards et ralentir leur destruction. La coquille apparaît ici dans une coupe de terrain.',
            'Les eaux souterraines peuvent déposer des minéraux dans les pores ou remplacer une partie des restes. Ce modèle montre une coquille minéralisée; la fossilisation varie selon les conditions.',
            'L’érosion enlève progressivement les roches qui recouvrent le fossile. Le modèle reste une coupe schématique : l’ammonite visible est dans une couche exposée par la coupe, pas posée au-dessus du terrain.',
          ][fossilizationStage]}</p>
        </section>}
        {active === 'sediments' && !referenceMode && <FossilComparator />}
        {active === 'plates' && !eventMode && <section className="tectonic-info-panel" aria-label="Informations sur le mouvement tectonique">
          <div className="movement-caption"><b>{boundary === 'Divergente' ? '←  ÉCARTEMENT  →' : boundary === 'Convergente' ? '→  CONVERGENCE  ←' : '⇄  COULISSAGE  ⇄'}</b><span>{boundary === 'Divergente' ? 'Les plaques s’écartent; le magma remonte et forme une dorsale.' : boundary === 'Convergente' ? 'La plaque océanique se courbe et plonge sous la continentale. Au-dessus, la fusion partielle peut alimenter un arc volcanique.' : 'Deux plaques coulissent latéralement en sens opposés.'}</span><small>{boundary === 'Convergente' ? 'Modèle générique de subduction · accéléré et non à l’échelle, pas une coupe locale d’Haïti' : 'Mouvement pédagogique, accéléré et bouclé · schéma non à l’échelle'}</small></div>
          <div className="scene-legend" aria-label="Légende des éléments tectoniques">
            {(boundary === 'Divergente'
              ? [['legend-stone', 'Plaques océaniques'], ['legend-copper', 'Dorsale médio-océanique'], ['legend-mantle', 'Manteau supérieur']]
              : boundary === 'Convergente'
                ? [['legend-continent', 'Plaque continentale'], ['legend-stone', 'Plaque océanique Cocos'], ['legend-copper', 'Fosse + arc volcanique'], ['legend-mantle', 'Plan de subduction'], ['legend-magma', 'Fusion partielle locale']]
                : [['legend-continent', 'Plaque nord'], ['legend-stone', 'Plaque sud'], ['legend-copper', 'Faille transformante'], ['legend-mantle', 'Manteau supérieur']]
            ).map(([tone, name]) => <span key={name}><i className={tone} />{name}</span>)}
          </div>
        </section>}
        {eventMode && <section className="earthquake-learning" aria-label="Comprendre le séisme">
          <div className="earthquake-facts">
            <article><b>01 · CONVERGENCE & RUPTURE</b><p>Les plaques convergent et leur contact peut rester bloqué par frottement. Quand la faille rompt, la plaque océanique glisse brusquement sous la plaque continentale et libère l’énergie accumulée.</p></article>
            <article><b>02 · FOYER & ÉPICENTRE</b><p>Le foyer (hypocentre) est le départ de la rupture en profondeur. L’épicentre se trouve à la surface, juste au-dessus.</p></article>
            <article><b>03 · ONDES SISMIQUES</b><p>Les ondes P, plus rapides, arrivent d’abord. Les ondes S suivent; le sol peut aussi onduler près de la surface.</p></article>
          </div>
          <div className="event-legend"><span><i className="wave-p" /> Onde P · plus rapide</span><span><i className="wave-s" /> Onde S · plus lente</span><span><i className="wave-surface" /> Ondes de surface</span><small>Schéma pédagogique animé, volontairement non à l’échelle.</small></div>
          <div className="event-related"><b>Quand un tsunami peut-il se former ?</b><span>Le module « Séismes et tsunamis » montre la chaîne de formation et distingue les séismes qui déplacent fortement le fond marin des autres ruptures.</span><a href="https://earthquake.usgs.gov/education/shakingsimulations/classroom.php" target="_blank" rel="noreferrer">USGS · propagation des ondes ↗</a><a href="https://www.noaa.gov/jetstream/tsunamis/tsunami-generation-earthquakes" target="_blank" rel="noreferrer">NOAA · origine des tsunamis ↗</a></div>
        </section>}
        {active === 'volcano' && !referenceMode && !magmaOriginMode && <VolcanoInspector selected={volcanoPart} exploded={volcanoExploded} onSelect={setVolcanoPart} onExplodedChange={setVolcanoExploded} />}
        {active === 'volcano' && !referenceMode && !magmaOriginMode && <VolcanoPhases />}
        {magmaOriginMode && <MagmaOriginGuide selected={magmaOriginStep} onSelect={setMagmaOriginStep} />}
        {!hideGenericSummary && <div className="info-grid">
          <article className="explain-card"><div className="card-label"><span>01 / COMPRENDRE</span><span>↗</span></div><p>{module.body}</p><div className="tag-row">{module.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>
          <article className="fact-card"><div className="card-label"><span>À RETENIR</span><span>✳</span></div><p>{module.fact}</p><div className="fact-foot"><span className="live-dot" /> {active === 'rocks' ? 'ÉCHANTILLONS PHOTOGRAPHIÉS' : referenceMode ? 'SOURCE DOCUMENTÉE' : active === 'sediments' ? 'SCAN 3D CC0 · SMITHSONIAN' : active === 'volcano' ? 'RELIEF USGS · VERTICALITÉ ADAPTÉE' : active === 'plates' && boundary === 'Convergente' ? 'SURFACE USGS SLAB2 · PROFONDEUR ADAPTÉE' : 'MODÈLE PÉDAGOGIQUE SCHÉMATIQUE'}</div></article>
        </div>}
        <footer id="sources" className="sources"><span>SOURCES SCIENTIFIQUES</span><a href="https://pubs.usgs.gov/publication/ds904" target="_blank" rel="noreferrer">USGS · DEM St. Helens 2009 ↗</a><a href="https://earthquake.usgs.gov/static/lfs/data/slab/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/models/" target="_blank" rel="noreferrer">USGS · géométries Slab2 ↗</a><a href="https://www.si.edu/object/3d/fossil-whale-excavation-site-mpc-677:a4068a00-9712-4c8e-8948-a9e2ea27fe0a" target="_blank" rel="noreferrer">Smithsonian · scan Cerro Ballena CC0 ↗</a><a href="https://www.usgs.gov/educational-resources/plate-tectonics" target="_blank" rel="noreferrer">USGS · tectonique ↗</a><a href="https://www.nps.gov/subjects/fossils/how-fossils-form.htm" target="_blank" rel="noreferrer">NPS · fossiles ↗</a><a href="https://commons.wikimedia.org/wiki/Category:Ward%27s_University_Rock_Collection" target="_blank" rel="noreferrer">GeoDIL · photos de roches CC0 ↗</a></footer>
      </section>
    </div>
  </main>;
}
