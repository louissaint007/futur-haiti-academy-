import { useState } from 'react';
import { rockGroups, rocks } from '../data/rocks.js';

export default function RockGallery({ selected, onSelect }) {
  const [filter, setFilter] = useState('Toutes');
  const filtered = rocks.filter((rock) => filter === 'Toutes' || rock.group === filter);
  const current = rocks.find((rock) => rock.name === selected) || rocks[0];

  return <section className="rock-library" aria-label="Photothèque de roches">
    <div className="rock-library-head">
      <div><span className="photo-kicker">COLLECTION PHOTOGRAPHIQUE · ÉCHANTILLONS 2D</span><p>18 roches à observer, classées par origine.</p></div>
      <div className="rock-filters" role="group" aria-label="Filtrer les roches">
        {rockGroups.map((item) => <button key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item === 'Toutes' ? item : `${item}s`}</button>)}
      </div>
    </div>
    <div className="rock-feature">
      <img src={`/rocks/${current.file}.jpg`} alt={`Photographie d’un échantillon de ${current.name}`} />
      <div><span>{current.group.toUpperCase()} · ÉCHANTILLON RÉEL</span><h3>{current.name}</h3><p>{current.note}</p><a href="https://commons.wikimedia.org/wiki/Category:Ward%27s_University_Rock_Collection" target="_blank" rel="noreferrer">Source des photographies · collection GeoDIL ↗</a></div>
    </div>
    <div className="rock-grid">{filtered.map((rock) => <button key={rock.name} className={`rock-card ${rock.name === current.name ? 'active' : ''}`} onClick={() => onSelect(rock.name)} aria-pressed={rock.name === current.name}><img loading="lazy" src={`/rocks/${rock.file}.jpg`} alt="" /><span>{rock.name}</span><small>{rock.group}</small></button>)}</div>
  </section>;
}
