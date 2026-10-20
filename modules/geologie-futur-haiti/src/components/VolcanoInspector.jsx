const PARTS = [
  ['crater', 'Cratère', 'Dépression au sommet, autour de la bouche éruptive.'],
  ['main-vent', 'Bouche centrale', 'Ouverture par laquelle les matériaux volcaniques sortent.'],
  ['conduit', 'Conduit magmatique', 'Passage qui relie la chambre au cratère.'],
  ['chamber', 'Chambre magmatique', 'Réservoir souterrain où le magma peut s’accumuler.'],
  ['lava-flow', 'Coulée de lave', 'Magma arrivé à la surface qui descend le flanc.'],
  ['ash-cloud', 'Panache de cendres', 'Colonne de gaz et de cendres qui monte au-dessus du cratère pendant une éruption explosive, puis peut s’étaler avec le vent.'],
  ['layers', 'Couches de lave et cendres', 'Dépôts successifs qui construisent un stratovolcan.'],
  ['side-vent', 'Évent latéral', 'Ouverture secondaire sur le flanc, parfois liée à un conduit.'],
  ['channels', 'Chenaux du flanc', 'Creux d’érosion qui canalisent les matériaux sur les pentes.'],
  ['dike', 'Filon (dyke)', 'Le magma remplit une fracture verticale ou inclinée, en coupant les couches rocheuses. En refroidissant, il laisse une lame de roche magmatique.'],
  ['sill', 'Filon-couche (sill)', 'Le magma s’injecte entre des couches, presque à l’horizontale et parallèlement à celles-ci, puis se solidifie en une lame.'],
  ['cone', 'Cône / flancs', 'Relief construit par l’accumulation de produits volcaniques.'],
];

export default function VolcanoInspector({ selected, exploded, onSelect, onExplodedChange }) {
  const current = PARTS.find(([id]) => id === selected);
  return <section className="volcano-inspector" aria-label="Inspection des parties du volcan">
    <div className="volcano-inspector-heading">
      <div><span>INSPECTION 3D</span><p>{current ? current[2] : 'Choisis une partie : elle ressortira tandis que les autres deviennent semi-transparentes.'}</p></div>
      <button type="button" className={`exploded-toggle ${exploded ? 'active' : ''}`} aria-pressed={exploded} onClick={() => onExplodedChange(!exploded)}>{exploded ? 'Refermer les parties' : 'Vue éclatée'}</button>
    </div>
    <div className="volcano-part-list" role="group" aria-label="Choisir une partie du volcan">
      <button type="button" className={!selected ? 'selected' : ''} aria-pressed={!selected} onClick={() => onSelect(null)}>Volcan entier</button>
      {PARTS.map(([id, name]) => <button key={id} type="button" className={selected === id ? 'selected' : ''} aria-pressed={selected === id} onClick={() => onSelect(selected === id ? null : id)}>{name}</button>)}
    </div>
  </section>;
}
