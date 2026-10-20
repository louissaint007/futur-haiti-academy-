import { useCallback, useState } from 'react';
import { DEEP_TIME_EVENTS, DEEP_TIME_SOURCES } from '../data/deepTime.js';
import DeepTimeGlobe from './DeepTimeGlobe.jsx';
import './DeepTimeExperience.css';

const ageLabel = (age) => age === 0 ? 'Aujourd’hui' : age >= 1000 ? `${(age / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} milliards d’années` : `${age.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} millions d’années`;
const shortAge = (age) => age === 0 ? '0' : age >= 1000 ? `${(age / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Ga` : `${age.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Ma`;

function DeepTimeArtwork({ event }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const artwork = event.artwork;
  if (!artwork) return <figure className="deep-time-artwork deep-time-artwork--fallback"><div role="img" aria-label="Aucune image disponible">Image documentaire non disponible</div></figure>;
  const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(artwork.file)}?width=1280`;
  return <figure className={`deep-time-artwork${event.id === 'cretaceous-crisis' ? ' deep-time-artwork--dinosaurs' : ''}${failed ? ' deep-time-artwork--fallback' : ''}${!loaded && !failed ? ' deep-time-artwork--loading' : ''}`}>
    {!failed && <>
      {!loaded && <div className="deep-time-artwork-loading" role="status">Chargement de l’image documentaire…</div>}
      <img src={imageUrl} alt={artwork.alt} loading="eager" fetchPriority="high" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
    </>}
    {failed && <div role="img" aria-label="Image externe indisponible">L’image externe ne s’est pas chargée.<br />Consulte la source pour la voir.</div>}
    <figcaption>
      <span>{artwork.caption}</span>
      <small>Image : {artwork.author} · {artwork.license}{artwork.licenseUrl && <> · <a href={artwork.licenseUrl} target="_blank" rel="noreferrer">Licence</a></>}</small>
      <a className="deep-time-artwork-source" href={artwork.source} target="_blank" rel="noreferrer">{failed ? 'Ouvrir l’image à la source ↗' : 'Voir la fiche et les conditions de réutilisation ↗'}</a>
    </figcaption>
  </figure>;
}

export default function DeepTimeExperience() {
  const [selectedId, setSelectedId] = useState('earth-forms');
  const selected = DEEP_TIME_EVENTS.find((event) => event.id === selectedId) || DEEP_TIME_EVENTS[0];
  const activeIndex = DEEP_TIME_EVENTS.findIndex((event) => event.id === selected.id);
  const moveSelection = (direction) => {
    const index = Math.max(0, Math.min(DEEP_TIME_EVENTS.length - 1, activeIndex + direction));
    setSelectedId(DEEP_TIME_EVENTS[index].id);
  };
  const advanceTimeline = useCallback(() => {
    setSelectedId((currentId) => {
      const index = DEEP_TIME_EVENTS.findIndex((event) => event.id === currentId);
      return DEEP_TIME_EVENTS[Math.min(index + 1, DEEP_TIME_EVENTS.length - 1)].id;
    });
  }, []);

  return <section className="deep-time" aria-labelledby="deep-time-title">
    <header className="deep-time-header">
      <div><span className="deep-time-eyebrow">VOYAGE INTERACTIF · 4,54 MILLIARDS D’ANNÉES</span><h2 id="deep-time-title">Le temps profond</h2>
        <p>Une reconstitution 3D en étapes clés : accrétion, impacts, formation de la Lune, refroidissement, océans, tectonique et évolution du climat.</p></div>
      <div className="deep-time-age"><span>REPÈRE SÉLECTIONNÉ</span><b>{shortAge(selected.age)}</b><small>{ageLabel(selected.age)}</small></div>
    </header>

    <DeepTimeGlobe event={selected} onNext={advanceTimeline}/>

    <div className="deep-time-scrubber">
      <div className="deep-time-scrubber-label"><span>PLUS ANCIEN</span><span>PLUS RÉCENT</span></div>
      <input aria-label="Défiler les repères de l’histoire de la Terre" type="range" min="0" max={DEEP_TIME_EVENTS.length - 1} step="1" value={activeIndex} onChange={(event) => setSelectedId(DEEP_TIME_EVENTS[Number(event.target.value)].id)} />
      <div className="deep-time-range-labels"><span>4 540 Ma</span><span>0 · aujourd’hui</span></div>
      <p className="deep-time-timeline-note">Le curseur parcourt des repères choisis; les intervalles ne sont pas représentés à l’échelle.</p>
      <div className="deep-time-event-list" role="group" aria-label="Choisir un repère du temps profond">
        {DEEP_TIME_EVENTS.map((event, index) => <button type="button" key={event.id} className={event.id === selected.id ? 'is-active' : ''} aria-pressed={event.id === selected.id} onClick={() => setSelectedId(event.id)} title={`${event.title} · ${ageLabel(event.age)}`}><span className="deep-time-dot"/><span className="deep-time-event-name">{event.title}</span><small>{shortAge(event.age)}</small><span className="sr-only">, {event.rank}</span></button>)}
      </div>
      <div className="deep-time-keyboard"><button type="button" onClick={() => moveSelection(-1)} disabled={activeIndex === 0} aria-label="Aller au repère plus ancien">← Repère précédent</button><span>Utilise aussi les flèches gauche et droite sur le curseur</span><button type="button" onClick={() => moveSelection(1)} disabled={activeIndex === DEEP_TIME_EVENTS.length - 1} aria-label="Aller au repère plus récent">Repère suivant →</button></div>
    </div>

    <article className={`deep-time-detail deep-time-detail--${selected.accent}`} aria-live="polite" aria-atomic="true">
      <div className="deep-time-detail-top"><div><span className="deep-time-tag">{selected.badge}</span><h3>{selected.title}</h3><p className="deep-time-date">{ageLabel(selected.age)} · {selected.rank}</p></div><DeepTimeArtwork key={selected.id} event={selected}/></div>
      <div className="deep-time-hierarchy" aria-label="Hiérarchie des temps géologiques"><span>ÉON&nbsp; <b>{selected.eon}</b></span><i>›</i><span>ÈRE&nbsp; <b>{selected.era}</b></span><i>›</i><span>PÉRIODE&nbsp; <b>{selected.period}</b></span><i>›</i><span>ÉPOQUE&nbsp; <b>{selected.epoch}</b></span></div>
      <div className="deep-time-grid">
        <section><b><i>01</i> Continents</b><p>{selected.continents}</p></section>
        <section><b><i>02</i> Océans</b><p>{selected.oceans}</p></section>
        <section><b><i>03</i> Reliefs</b><p>{selected.relief}</p></section>
        <section className={selected.accent === 'ice' ? 'deep-time-climate-note' : ''}><b><i>04</i> Climat</b><p>{selected.climate}</p></section>
        <section><b><i>05</i> Vie</b><p>{selected.life}</p></section>
      </div>
    </article>

    <aside className="deep-time-note"><b>À distinguer</b><p>Les <strong>ères</strong> contiennent des <strong>périodes</strong>, elles-mêmes divisées en <strong>époques</strong>. Une extinction est un événement biologique; une glaciation est un épisode climatique. Ni l’une ni l’autre n’est une ère.</p><small>Les âges numériques et les limites peuvent être révisés par les spécialistes. Les images montrent des fossiles, des lieux actuels ou des reconstitutions scientifiques et artistiques; leur légende indique ce qu’elles représentent.</small></aside>

    <footer className="deep-time-sources"><span>POUR ALLER PLUS LOIN</span>{DEEP_TIME_SOURCES.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</footer>
  </section>;
}
