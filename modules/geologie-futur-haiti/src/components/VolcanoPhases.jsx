import { useState } from 'react';

const phases = [
  {
    title: 'Alimentation',
    summary: 'Le magma remonte par des fractures.',
    detail: 'Du magma formé en profondeur peut remonter et s’accumuler dans des zones de stockage. Les gaz dissous et la viscosité influencent sa mobilité; cette étape ne se déroule pas de façon identique pour tous les volcans.',
  },
  {
    title: 'Émission',
    summary: 'Lave, gaz et fragments sortent.',
    detail: 'Quand le magma atteint la surface, il devient de la lave. Une lave fluide peut s’écouler; si le magma visqueux retient les gaz, la pression peut produire une éruption explosive avec des cendres et des fragments.',
  },
  {
    title: 'Dépôts et refroidissement',
    summary: 'Les produits s’accumulent puis refroidissent.',
    detail: 'La lave perd de la chaleur et se solidifie. Les cendres, lapilli et bombes volcaniques retombent et peuvent former des dépôts. Les produits et leur répartition dépendent du type d’éruption et du vent.',
  },
];

export default function VolcanoPhases() {
  const [selected, setSelected] = useState(0);
  return <section className="volcano-phases" aria-label="Étapes simplifiées d’une éruption volcanique">
    <div className="volcano-phases-head">
      <div><span>SÉQUENCE PÉDAGOGIQUE</span><h3>Comment se déroule une éruption ?</h3></div>
      <small>Schéma simplifié : les étapes et les produits varient selon le volcan.</small>
    </div>
    <div className="volcano-phase-steps" role="group" aria-label="Choisir une étape de l’éruption">
      {phases.map((phase, index) => <button key={phase.title} type="button" className={selected === index ? 'active' : ''} aria-pressed={selected === index} onClick={() => setSelected(index)}>
        <b>0{index + 1} · {phase.title}</b><small>{phase.summary}</small>
      </button>)}
    </div>
    <p aria-live="polite">{phases[selected].detail}</p>
  </section>;
}
