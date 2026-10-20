const steps = [
  {
    title: 'La plaque plonge',
    short: 'Subduction',
    detail: 'Dans les Cascades, la plaque océanique Juan de Fuca plonge sous la plaque nord-américaine. La coupe agrandie montre la zone en profondeur; ses dimensions ne sont pas à l’échelle.',
  },
  {
    title: 'Des fluides remontent',
    short: 'Libération d’eau',
    detail: 'En s’enfonçant, la plaque libère des fluides riches en eau. Ils remontent vers le manteau situé au-dessus de la plaque plongeante.',
  },
  {
    title: 'Le magma naît dans le manteau',
    short: 'Fusion partielle',
    detail: 'Les fluides libérés par la plaque pénètrent dans le manteau au-dessus d’elle. Ils facilitent la fusion d’une partie des roches : cette zone de fusion partielle est la source du magma.',
  },
  {
    title: 'Il remonte vers le volcan',
    short: 'Alimentation du volcan',
    detail: 'Le magma issu du manteau remonte par des fissures. Il peut s’accumuler dans une chambre magmatique de la croûte, puis alimenter le conduit du volcan. Une partie refroidit en profondeur.',
  },
];

const legend = [
  ['origin-plate', 'Plaque océanique en subduction'],
  ['origin-crust', 'Croûte continentale'],
  ['origin-mantle', 'Manteau solide'],
  ['origin-water', 'Fluides riches en eau'],
  ['origin-melt', 'Zone de fusion partielle'],
  ['origin-magma', 'Magma et chambre magmatique'],
];

export default function MagmaOriginGuide({ selected, onSelect }) {
  return <section className="magma-origin-guide" aria-label="Origine du magma en zone de subduction">
    <div className="magma-origin-header">
      <div><span>COUPE 3D · EXEMPLE DES CASCADES</span><h3>De la plaque plongeante au volcan</h3></div>
      <small>Le magma se forme dans le manteau, remonte et peut se stocker dans la croûte.</small>
    </div>
    <div className="magma-origin-steps" role="group" aria-label="Étapes de formation et de remontée du magma">
      {steps.map((step, index) => <button key={step.short} type="button" className={selected === index ? 'active' : ''} aria-pressed={selected === index} onClick={() => onSelect(index)}>
        <b>0{index + 1} · {step.title}</b><small>{step.short}</small>
      </button>)}
    </div>
    <p className="magma-origin-detail" aria-live="polite">{steps[selected].detail}</p>
    <div className="magma-origin-legend" aria-label="Légende de la coupe">
      {legend.map(([tone, text]) => <span key={tone}><i className={tone} />{text}</span>)}
    </div>
    <p className="magma-origin-note">Ce modèle illustre un mécanisme de subduction associé au mont St. Helens; le magma peut aussi se former dans d’autres contextes, comme les dorsales et les points chauds.</p>
    <div className="magma-origin-sources"><span>SOURCES USGS</span><a href="https://pubs.usgs.gov/fs/2013/3014/fs2013-3014_text.pdf" target="_blank" rel="noreferrer">Mont St. Helens · formation du magma ↗</a><a href="https://pubs.usgs.gov/gip/volc/nature.html" target="_blank" rel="noreferrer">Origine des magmas · aperçu général ↗</a></div>
  </section>;
}
