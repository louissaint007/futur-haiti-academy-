import { useState } from 'react';

const comparisons = {
  size: [
    {
      id: 'macro',
      title: 'Macrofossiles',
      marker: 'OBSERVABLES À L’ŒIL NU',
      description: 'Ce sont des fossiles assez grands pour qu’on distingue leur forme sans microscope. Ils peuvent être le reste d’un organisme (coquille, os, feuille) ou son empreinte conservée dans la roche.',
      plain: 'En clair : on peut regarder le fossile directement et reconnaître, par exemple, une coquille en spirale ou la forme d’une feuille.',
      examples: 'Une ammonite (coquille marine en spirale), un trilobite (animal marin à carapace), un os ou l’empreinte d’une feuille.',
      drawing: 'ammonite',
      note: 'L’ammonite montrée dans la coupe 3D est un modèle pédagogique, pas une photographie.',
    },
    {
      id: 'micro',
      title: 'Microfossiles',
      marker: 'OBSERVÉS AU MICROSCOPE',
      description: 'Ce sont des fossiles minuscules, impossibles à identifier correctement à l’œil nu. On les recherche dans un petit échantillon de roche ou de sédiment, puis on les observe au microscope.',
      plain: 'En clair : une poignée de sédiment peut contenir des centaines de restes microscopiques. Leur forme aide les spécialistes à reconnaître les organismes et parfois le milieu ancien.',
      examples: 'Les foraminifères sont de minuscules organismes marins souvent protégés par une coquille; les diatomées sont des algues microscopiques entourées d’une enveloppe de silice. Le pollen fossilisé est aussi microscopique.',
      drawing: 'foraminifera',
      note: 'Le dessin est très agrandi pour être visible à l’écran : il ne respecte pas la taille réelle.',
    },
  ],
  role: [
    {
      id: 'index',
      title: 'Fossiles stratigraphiques',
      marker: 'REPÈRES DE TEMPS',
      description: 'Ce n’est pas une forme spéciale de fossile : c’est le rôle que joue un fossile pour dater et comparer des couches. Une bonne espèce-repère était répandue dans beaucoup de régions, facile à reconnaître et n’a vécu que pendant une période géologique relativement courte.',
      plain: 'En clair : si la même espèce-repère est trouvée dans deux couches éloignées, cela suggère que ces couches se sont déposées à la même période. Cela donne un âge relatif, pas forcément une date exacte.',
      examples: 'Certaines espèces d’ammonites et de foraminifères servent de repères. Toutes les ammonites ne conviennent pas : il faut connaître l’espèce et la période pendant laquelle elle a vécu.',
      drawing: 'index',
      note: 'Le dessin montre le même fossile-repère dans plusieurs couches; dans la réalité, les spécialistes vérifient aussi la roche et le contexte.',
    },
    {
      id: 'facies',
      title: 'Fossiles de faciès',
      marker: 'INDICES DE MILIEU',
      description: 'Ici aussi, le nom décrit le rôle du fossile. Il renseigne surtout sur le type de milieu où l’organisme vivait, parce que cet organisme avait besoin de conditions particulières (profondeur, température, salinité ou lumière).',
      plain: 'En clair : trouver un fossile de corail peut indiquer qu’il y avait autrefois une mer chaude et peu profonde à cet endroit. Le fossile est un indice, pas une preuve suffisante à lui seul.',
      examples: 'Des coraux fossiles peuvent indiquer une mer chaude et peu profonde; certains coquillages ou microfossiles sont associés à des milieux plus profonds. On recoupe toujours plusieurs indices.',
      drawing: 'facies',
      note: 'Un fossile de faciès aide surtout à reconstituer l’environnement ancien; il ne donne pas, à lui seul, l’âge exact de la couche.',
    },
  ],
};

function FossilSketch({ type }) {
  if (type === 'ammonite') return <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="37" fill="#a77c4e" stroke="#e2c99e" strokeWidth="2"/><path d="M50 50c0-7 11-8 14-2 5 10-8 19-19 13-14-7-11-27 3-34 18-9 38 6 35 26-3 25-33 37-55 23-25-16-21-53 4-67" fill="none" stroke="#493729" strokeWidth="3" strokeLinecap="round"/><path d="M50 50L38 20M50 50L69 22M50 50L83 47M50 50L73 76M50 50L43 86" stroke="#d6b98e" strokeWidth="1.3" opacity=".8"/></svg>;
  if (type === 'foraminifera') return <svg viewBox="0 0 100 100" aria-hidden="true"><g fill="#b6a079" stroke="#e6d4ab" strokeWidth="2"><circle cx="49" cy="48" r="13"/><circle cx="37" cy="40" r="10"/><circle cx="61" cy="39" r="10"/><circle cx="35" cy="57" r="9"/><circle cx="60" cy="58" r="10"/><circle cx="47" cy="68" r="9"/><circle cx="49" cy="26" r="7"/></g><g fill="none" stroke="#554732" strokeWidth="1.4"><path d="M49 48L37 40M49 48L61 39M49 48L35 57M49 48L60 58M49 48L47 68M49 48L49 26"/><circle cx="49" cy="48" r="3" fill="#554732"/></g></svg>;
  if (type === 'index') return <svg viewBox="0 0 100 100" aria-hidden="true"><path d="M10 27h80M10 50h80M10 73h80" stroke="#9c8c70" strokeWidth="8"/><g fill="#d8b985" stroke="#4f4230" strokeWidth="1.5"><circle cx="26" cy="27" r="7"/><circle cx="55" cy="50" r="7"/><circle cx="77" cy="73" r="7"/></g><path d="M26 27C37 34 43 43 55 50s15 15 22 23" fill="none" stroke="#d5ae73" strokeDasharray="3 4" strokeWidth="2"/></svg>;
  return <svg viewBox="0 0 100 100" aria-hidden="true"><path d="M13 80h74M20 74c6-9 4-18 11-24m-11 24c-7-8-9-15-8-22m8 22c0-13-2-23 2-34m0 34c10-7 12-15 13-25m-13 25c4-15 10-21 17-30m-8 20c8-3 15-3 20-1" fill="none" stroke="#cfb183" strokeWidth="4" strokeLinecap="round"/><path d="M10 88c15-5 24 5 39 0s24 5 41 0" fill="none" stroke="#6d9b9c" strokeWidth="3"/></svg>;
}

export default function FossilComparator() {
  const [criterion, setCriterion] = useState('size');
  const items = comparisons[criterion];
  return <section className="fossil-comparator" aria-label="Comparer les catégories de fossiles">
    <div className="fossil-comparator-heading">
      <div><span>COMPARATEUR · QU’EST-CE QUE LE FOSSILE NOUS APPREND ?</span><h3>Deux façons de classer les fossiles</h3></div>
      <small>Les critères peuvent se croiser</small>
    </div>
    <div className="fossil-criterion" role="tablist" aria-label="Choisir le critère de comparaison">
      <button type="button" role="tab" aria-selected={criterion === 'size'} className={criterion === 'size' ? 'active' : ''} onClick={() => setCriterion('size')}>Par taille d’observation</button>
      <button type="button" role="tab" aria-selected={criterion === 'role'} className={criterion === 'role' ? 'active' : ''} onClick={() => setCriterion('role')}>Par rôle géologique</button>
    </div>
    <div className="fossil-comparison-grid">
      {items.map((item) => <article className="fossil-comparison-card" key={item.id}>
        <div className="fossil-sketch"><FossilSketch type={item.drawing} /><span>{item.marker}</span></div>
        <div className="fossil-comparison-copy"><h4>{item.title}</h4><p>{item.description}</p><b>En mots simples</b><p>{item.plain}</p><b>Exemples</b><p>{item.examples}</p><small>{item.note}</small></div>
      </article>)}
    </div>
    <p className="fossil-comparator-footnote">La taille et le rôle sont deux critères différents : un microfossile peut aussi servir de fossile stratigraphique ou de fossile de faciès, selon l’espèce et le contexte.</p>
    <div className="fossil-comparator-sources"><span>RÉFÉRENCES</span><a href="https://www.haitidocs.org/doc/menfp-programme-secondaire-2024-sciences-vie-terre?lang=fr" target="_blank" rel="noreferrer">Programme SVT du MENFP (2024)</a><a href="https://www.bgs.ac.uk/discovering-geology/fossils-and-geological-time/fossils/" target="_blank" rel="noreferrer">British Geological Survey · fossiles</a><a href="https://www.bgs.ac.uk/discovering-geology/fossils-and-geological-time/foraminifera/" target="_blank" rel="noreferrer">British Geological Survey · foraminifères</a></div>
  </section>;
}
