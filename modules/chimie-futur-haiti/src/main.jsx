import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { correctChoice, gradeTracks, interdisciplinary, quizLabels, themes, units } from './curriculum.js';
import ChemistryLearningLab from './ChemistryLearningLab.jsx';
import ChemistryScene3D from './ChemistryScene3D.jsx';
import './app.css';
import './chemistry-dark.css';
import './readability.css';

const gradeNames = gradeTracks.map((item) => item.grade);
const Icon = ({ children }) => <span className="icon" aria-hidden="true">{children}</span>;

function App() {
  const [grade, setGrade] = useState('Secondaire I');
  const [track, setTrack] = useState('SVT');
  const [selectedId, setSelectedId] = useState('A2');
  const [section, setSection] = useState('explorer');
  const [choice, setChoice] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [completed, setCompleted] = useState([]);
  const lesson = units.find((item) => item.id === selectedId) || units[0];
  const family = themes[lesson.theme];
  const currentTrack = gradeTracks.find((item) => item.grade === grade);
  const byTrack = [...currentTrack.common, ...(track === 'SVT' ? currentTrack.svt || [] : [])];
  const visibleLessons = units.filter((item) => byTrack.includes(item.id));
  const searchResults = search.trim() ? units.filter((item) => `${item.title} ${item.id} ${item.explain}`.toLowerCase().includes(search.toLowerCase())) : [];
  const completionPercent = Math.round((completed.length / units.length) * 100);
  const selectLesson = (item) => {setSelectedId(item.id);setSection('lesson');setChoice(null);setMenuOpen(false);window.scrollTo({top:0,behavior:'smooth'});};
  const setYear = (year) => {setGrade(year);const yearTrack = gradeTracks.find((item) => item.grade === year);const next = units.find((item) => yearTrack.common.includes(item.id)) || units[0];setSelectedId(next.id);setSection('explorer');setChoice(null);};
  const answerQuiz = (index) => {setChoice(index);if(index===correctChoice[lesson.type]) setCompleted((items) => items.includes(lesson.id)?items:[...items,lesson.id]);};
  const navButton = (id,label,icon) => <button className={`nav-button ${section===id?'active':''}`} onClick={() => {setSection(id);setMenuOpen(false);}}><Icon>{icon}</Icon><span>{label}</span>{id==='explorer'&&<i>16</i>}</button>;

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen?'open':''}`}>
      <a className="brand" href="#accueil" onClick={(e)=>{e.preventDefault();setSection('explorer');setMenuOpen(false);}}><span className="brand-symbol">a.</span><span><b>atòm</b><small>laboratwa chimie</small></span></a>
      <div className="school-chip"><span className="chip-icon">✳</span><span><small>FUTUR HAÏTI</small><b>Chimie · Secondaire</b></span></div>
      <div className="nav-group"><span className="nav-caption">APPRENDRE</span>{navButton('explorer','Explorer','⌂')}{navButton('curriculum','Programme','▤')}</div>
      <div className="class-switcher"><div className="nav-caption">MON NIVEAU</div>{gradeNames.map((item,index)=><button className={`class-button ${grade===item?'current':''}`} key={item} onClick={() => setYear(item)}><span className="grade-index">0{index+1}</span><span>{item}</span>{grade===item&&<i>•</i>}</button>)}</div>
      <div className="sidebar-foot"><div className="mini-atom">◉</div><p>La science se comprend mieux quand on peut l’observer.</p><span>APPRENDS À TON RYTHME</span><div className="foot-rule"/><small>Une expérience Futur Haïti</small></div>
    </aside>
    {menuOpen&&<button className="mobile-scrim" aria-label="Fermer le menu" onClick={()=>setMenuOpen(false)}/>}
    <main className="main-area">
      <header className="topbar"><button className="menu-toggle" aria-label="Ouvrir le menu" onClick={()=>setMenuOpen(!menuOpen)}>☰</button><div className="breadcrumbs"><span>Chimie</span><b>›</b><strong>{section==='curriculum'?'Programme':section==='lesson'?lesson.title:'Explorer'}</strong></div><label className="searchbox"><span>⌕</span><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Chercher une notion…"/><kbd>⌘ K</kbd>{searchResults.length>0&&<div className="search-results">{searchResults.slice(0,5).map((item)=><button onClick={()=>{selectLesson(item);setSearch('');}} key={item.id}><span className={`theme-dot ${themes[item.theme].color}`}>{themes[item.theme].icon}</span><span>{item.title}<small>{item.grade}</small></span><b>→</b></button>)}</div>}</label><div className="top-profile"><span className="online-dot"/><span>Mon parcours</span><div className="profile-avatar">G</div></div></header>
      {section==='curriculum' ? <Curriculum grade={grade} track={track} setTrack={setTrack} setGrade={setGrade} selectLesson={selectLesson}/> : section==='lesson' ? <Lesson lesson={lesson} family={family} choice={choice} answerQuiz={answerQuiz} onBack={()=>setSection('explorer')} onNext={()=>{const index=units.findIndex((u)=>u.id===lesson.id);selectLesson(units[(index+1)%units.length]);}}/> : <Explorer grade={grade} track={track} setTrack={setTrack} currentTrack={currentTrack} lessons={visibleLessons} completed={completed} completionPercent={completionPercent} selectLesson={selectLesson} setSection={setSection}/ >}
      <footer className="page-footer"><span>ATÒM · Un laboratoire pour comprendre le monde</span><a href="#sources" onClick={(e)=>{e.preventDefault();setSection('curriculum');}}>Programme scolaire & sources ↗</a></footer>
    </main>
  </div>;
}

function Explorer({grade,track,setTrack,currentTrack,lessons,completed,completionPercent,selectLesson,setSection}) {
  const recommended = lessons[0] || units[0];
  return <div className="page-content">
    <section className="hero-card"><div className="hero-grain"/><div className="hero-copy"><div className="eyebrow"><span className="live-pip"/> TON LABORATOIRE DE CHIMIE <span className="hero-dot">·</span> {grade.toUpperCase()}</div><h1>Entre dans<br/><em>le monde des atomes.</em></h1><p>Fais tourner un modèle 3D, explore les 118 éléments et repère les particules qui composent la matière.</p><div className="hero-actions"><button className="primary-button" onClick={()=>selectLesson(units.find((item)=>item.id==='A2'))}>Explorer les 118 éléments <span>→</span></button><button className="quiet-button" onClick={()=>setSection('curriculum')}>Voir le programme</button></div></div><div className="hero-art"><ChemistryScene3D compact type="atom" element={{symbol:'C',name:'Carbone',number:6,massNumber:12,shells:[2,4]}} charge={0} formula="H2O" ph={7} carbonCount={2} phase="Liquide" mixture="Eau" strength="Fort" choice="Eau" reversed={false} coefficients={[1,1,1,1]} reacted={false} spinning={true}/></div><div className="hero-bottom"><span>118 ÉLÉMENTS · 118 MODÈLES ATOMIQUES</span><span>FAIS GLISSER POUR ORBITER ↓</span></div></section>
    <div className="section-head"><div><span className="eyebrow">CONTINUE À EXPLORER</span><h2>Ton parcours de {grade}</h2></div><button className="text-link" onClick={()=>setSection('curriculum')}>Parcourir les 4 années <span>→</span></button></div>
    <div className="track-filter"><div><span className="filter-label">Série</span>{['SVT','MP'].map((item)=><button className={track===item?'selected':''} key={item} onClick={()=>setTrack(item)}>{item==='SVT'?'Sciences de la vie et de la Terre':'Mathématiques et physique'}</button>)}</div><span className="track-note">{currentTrack.note}</span></div>
    <div className="lesson-grid">{lessons.map((item,index)=><LessonCard key={item.id} item={item} index={index} completed={completed.includes(item.id)} onClick={()=>selectLesson(item)}/>)}</div>
    {['Secondaire III','Secondaire IV'].includes(grade)&&track==='MP'&&<div className="track-callout"><span>ⓘ</span><p><b>Un programme différent en MP.</b> Les unités spécialisées en acides-bases et chimie organique (grisées dans le tableau officiel) sont réservées à SVT. Ici, le parcours MP garde les unités communes C1–C2 ou C3–C4.</p><button onClick={()=>setSection('curriculum')}>Comprendre la progression →</button></div>}
    <section className="progress-card"><div><span className="eyebrow">TON APPRENTISSAGE</span><h3>Chaque petite découverte compte.</h3><p>{completed.length} unité{completed.length===1?'':'s'} explorée{completed.length===1?'':'s'} sur {units.length} dans les parcours SVT.</p></div><div className="progress-ring" style={{'--progress':`${completionPercent}%`}}><span><b>{completionPercent}%</b><small>exploré</small></span></div></section>
  </div>;
}

function LessonCard({item,index,completed,onClick}) {
  const family=themes[item.theme];
  return <button className={`lesson-card ${family.color}`} onClick={onClick}><div className="card-top"><span className="unit-tag">{item.id}</span><span className="card-arrow">↗</span></div><span className="card-icon">{family.icon}</span><div className="card-copy"><span className="eyebrow">{family.name}</span><h3>{item.title}</h3><p>{item.question}</p></div><div className="card-meta"><span>{item.grade}</span><span>{completed?'✓ Exploré':'8–12 min'}</span></div><div className="card-accent"/></button>;
}

function Lesson({lesson,family,choice,answerQuiz,onBack,onNext}) {
  const selectedAnswer = choice === correctChoice[lesson.type];
  return <div className="page-content lesson-page">
    <button className="back-link" onClick={onBack}>← Retour au parcours</button>
    <div className="lesson-heading"><div><span className={`theme-kicker ${family.color}`}>{family.icon} THÈME {lesson.theme} <span>·</span> {family.name}</span><h1>{lesson.title}</h1><div className="lesson-meta"><span>◆ {lesson.grade} recommandé</span><span>◷ Environ 8–12 min</span><span>▱ Notion interactive</span></div></div><div className={`lesson-mark ${family.color}`}>{family.icon}<small>{lesson.id}</small></div></div>
    <div className="lesson-columns"><div className="lesson-main-col">
      <section className="question-card"><span className="question-spark">✳</span><span className="eyebrow">COMMENÇONS PAR UNE QUESTION</span><h2>{lesson.question}</h2><div className="question-rule"/><span className="question-source">Observe · propose une explication · vérifie ton idée</span></section>
      <section className="explain-card"><div className="explain-heading"><span className="step-number">01</span><div><span className="eyebrow">L’IDÉE ESSENTIELLE</span><h2>Comprendre avant de retenir</h2></div></div><p>{lesson.explain}</p><div className="local-example"><span className="local-icon">✦</span><div><small>UN LIEN AVEC LE QUOTIDIEN</small><p>{lesson.local}</p></div></div></section>
      <ChemistryLearningLab key={lesson.id} unit={lesson}/>
      <section className="check-card"><div className="check-header"><div><span className="step-number">02</span><span className="eyebrow">À TOI DE RAISONNER</span><h2>As-tu repéré l’essentiel ?</h2></div><span className="check-badge">Vérifie</span></div><p>Choisis la proposition correcte. Si tu hésites, retourne au modèle : il contient un indice.</p><div className="answer-list">{quizLabels[lesson.type].map((answer,index)=><button key={answer} className={`answer-option ${choice===index?(index===correctChoice[lesson.type]?'correct':'incorrect'):''}`} onClick={()=>answerQuiz(index)}><span className="answer-letter">{String.fromCharCode(65+index)}</span><span>{answer}</span>{choice===index&&<b>{index===correctChoice[lesson.type]?'✓':'↻'}</b>}</button>)}</div>{choice!==null&&<div className={`answer-feedback ${selectedAnswer?'correct':'incorrect'}`}><b>{selectedAnswer?'Bien observé.':'Pas tout à fait, reprenons le raisonnement.'}</b><p>{selectedAnswer?'Tu as identifié la bonne relation.':lesson.reason}</p>{!selectedAnswer&&<small>Indice : {lesson.reason}</small>}</div>}</section>
      <div className="lesson-bottom-nav"><button onClick={onBack}>← Toutes les unités</button><span>{lesson.id} · Thème {lesson.theme}</span><button onClick={onNext}>Unité suivante →</button></div>
    </div><aside className="lesson-aside"><div className="aside-card"><span className="eyebrow">DANS CETTE UNITÉ</span><ol><li className="active"><i>1</i> La question</li><li><i>2</i> L’idée essentielle</li><li><i>3</i> Le laboratoire</li><li><i>4</i> À toi de raisonner</li></ol><div className="aside-progress"><span>Progression</span><b>{selectedAnswer?'100%':'0%'}</b><i><b style={{width:selectedAnswer?'100%':'8%'}}/></i></div></div><div className="safety-card"><span>⚑</span><div><b>Apprentissage sans risque</b><p>Cette activité est virtuelle. N’essaie pas de reproduire une expérience chimique à la maison.</p></div></div><div className="aside-note"><span>MODÈLES ET LIMITES</span><p>Les couleurs, tailles et déplacements des particules sont des conventions visuelles. Les phénomènes réels sont plus complexes.</p></div></aside></div>
  </div>;
}

function Curriculum({grade,track,setTrack,setGrade,selectLesson}) {
  const [tab,setTab]=useState('SVT & MP');
  return <div className="page-content curriculum-page"><div className="curriculum-hero"><span className="eyebrow">PROGRESSION DU SECONDAIRE · VERSION MENFP 2024</span><h1>Un fil conducteur<br/><em>en quatre années.</em></h1><p>Choisis une année pour voir ses unités. Les séries gardent leur progression propre à partir du Secondaire III.</p><div className="curriculum-tabs"><button className={tab==='SVT & MP'?'active':''} onClick={()=>setTab('SVT & MP')}>SVT & MP</button><button className={tab==='SES & LLA'?'active':''} onClick={()=>setTab('SES & LLA')}>SES & LLA</button></div></div>
    {tab==='SVT & MP'?<><div className="curriculum-track-row"><div><span>SÉRIE À AFFICHER</span><div className="pill-control"><button className={track==='SVT'?'selected':''} onClick={()=>setTrack('SVT')}>SVT</button><button className={track==='MP'?'selected':''} onClick={()=>setTrack('MP')}>MP</button></div></div><p>Secondaire I et II : tronc commun.<br/>Secondaire III et IV : progressions différenciées.</p></div><div className="year-grid">{gradeTracks.map((item,index)=>{const ids=[...item.common,...(track==='SVT'?item.svt||[]:[])];return <section className={`year-card ${grade===item.grade?'focused':''}`} key={item.grade}><button className="year-select" onClick={()=>setGrade(item.grade)}><span>0{index+1} / ANNÉE</span><b>Secondaire {['I','II','III','IV'][index]}</b><small>{item.period}</small></button><div className="year-unit-list">{ids.map((id)=>{const lesson=units.find((u)=>u.id===id);const family=themes[lesson.theme];return <button key={id} className="year-unit" onClick={()=>selectLesson(lesson)}><span className={`unit-tag ${family.color}`}>{id}</span><span>{lesson.title}<small>{family.name}</small></span><i>→</i></button>;})}</div><div className="year-hours">{item.note}</div></section>;})}</div><div className="curriculum-note"><b>À propos de la progression</b><p>La liste suit les en-têtes détaillés et le tableau annuel du programme (p. 40–100 et p. 101–102). Attention : la matrice de compétences p. 39 répartit A1, A2, A3 et B1 en Sec. I; B2, C1, D1 et D2 en Sec. II; A4, B3, C2 et D3 en Sec. III. Cette répartition contredit plusieurs fiches détaillées et le tableau annuel. Les niveaux affichés suivent ce dernier; la divergence doit être clarifiée avec le MENFP. Les lignes grisées B3, B4, D3 et D4 sont réservées à SVT (p. 101).</p></div></>:<><div className="interdisciplinary-intro"><b>Un parcours interdisciplinaire</b><p>En SES et LLA, le document 2024 prévoit des unités communes aux sciences expérimentales (chimie, physique, biologie, géologie) pour les deux dernières années. Il ne donne pas une progression spécialisée de chimie comparable à SVT/MP. Les équipes enseignantes précisent les compétences au sein de ces projets.</p></div><div className="interdisciplinary-grid">{Object.entries(interdisciplinary).map(([year,topics])=><section className="inter-card" key={year}><span className="eyebrow">{year.toUpperCase()}</span><h2>Explorer le monde à plusieurs échelles</h2>{topics.map((topic,index)=><div className="inter-topic" key={topic}><i>0{index+1}</i><span>{topic}</span></div>)}</section>)}</div></>}<div className="source-note"><span>⌕</span><p><b>La référence utilisée :</b> Programme remanié du MENFP, version définitive du 24 juillet 2024. Son statut après cette date est indiqué dans les sources du projet.</p><a href="https://www.haitidocs.org/doc/menfp-programme-secondaire-2024-chimie?lang=fr" target="_blank" rel="noreferrer">Consulter le document ↗</a></div></div>;
}

function mainRender() {
  const root = createRoot(document.getElementById('root'));
  root.render(<React.StrictMode><App/></React.StrictMode>);
}
mainRender();
