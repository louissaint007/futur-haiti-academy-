import { useState } from 'react';
import { references } from '../data/references.js';

export default function FieldReferences({ mode }) {
  const items = references[mode] || [];
  const [index, setIndex] = useState(0);
  const item = items[index % items.length];

  if (!item) return null;

  return <div className={`field-reference reference-${mode}`}>
    <img src={item.image} alt={item.title} />
    <div className="reference-caption"><span>RÉFÉRENCE VISUELLE · {mode === 'plates' ? 'CARTE EN FRANÇAIS' : 'PHOTOGRAPHIE DOCUMENTÉE'}</span><b>{item.title}</b><small>{item.credit}</small><a href={item.source} target="_blank" rel="noreferrer">Consulter la source ↗</a></div>
    {items.length > 1 && <div className="reference-nav"><button onClick={() => setIndex((index + items.length - 1) % items.length)} aria-label="Référence précédente">←</button><span>{index + 1} / {items.length}</span><button onClick={() => setIndex((index + 1) % items.length)} aria-label="Référence suivante">→</button></div>}
  </div>;
}
