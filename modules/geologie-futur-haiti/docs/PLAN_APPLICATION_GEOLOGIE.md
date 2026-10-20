# Feuille de route — application Géologie Futur Haïti

## Objectif

Faire évoluer la démo locale en laboratoire pédagogique de géologie, manipulable sur ordinateur et téléphone, utilisable hors ligne et aligné progressivement sur les apprentissages scientifiques des élèves haïtiens. Les modèles schématiques doivent être identifiés comme tels et séparés des données ou scans mesurés.

## État de départ

- Référence Git créée sur `main` : `acf91bf`.
- Application React, Vite, Three.js et Capacitor Android.
- Les quatre expériences actuelles fonctionnent : volcans, tectonique, sédiments/fossiles et photothèque de roches.
- Avant cette organisation, les données, le menu, les cartes de référence et la galerie étaient réunis dans `src/App.jsx`; les constructeurs et le cycle de vie des scènes 3D étaient réunis dans `src/GeologyScene.jsx`.
- Le travail en cours vise d’abord à clarifier les frontières de code, sans modifier le contenu visible des expériences existantes.

## Organisation cible

```text
src/
  data/
    modules.js                 # textes, identité et métadonnées des modules
    rocks.js                   # catalogue des échantillons
    references.js              # références, crédits et liens
  components/
    RockGallery.jsx            # photothèque 2D
    FieldReferences.jsx        # panneau de références documentées
    ...                        # navigation, légendes et panneaux partagés
  GeologyScene.jsx             # chemin historique stable, réexport du coordinateur
  scenes/
    GeologyScene.jsx           # cycle de vie Three.js, caméra et dispatch des scènes
    shared/threeHelpers.js     # textures, matériaux, géométrie, labels et terrain partagé
    volcano/volcanoScene.js    # volcan, animation d’éruption et chargement du DEM
    tectonics/tectonicScene.js # plaques, animation des mouvements et géométrie Slab2
    sediments/sedimentScene.js # strates et chargement du scan fossilifère
    rocks/rockScene.js         # échantillons 3D illustratifs
    hazards/                   # futur module séismes et tsunamis
  App.jsx                      # orchestration générale et état partagé
  styles.css                   # styles globaux; styles de module à isoler au besoin
```

L’extraction est progressive : déplacer un composant ou un constructeur à la fois, puis vérifier que l’expérience reste identique. Ne pas faire de réécriture visuelle dans la même branche que l’extraction.

## Lots de travail

### Lot 0 — Base et sécurité du travail

- [x] Créer un dépôt distant privé/public selon le choix du propriétaire et une première référence `main`.
- [x] Exclure caches, sorties de build, captures locales et éventuels dossiers `sources/` synchronisés.
- [x] Créer une branche dédiée pour la modularisation (`refactor/geology-modules`).

### Lot 1 — Modularisation sans changement fonctionnel — en cours

- [x] Sortir les métadonnées des modules, le catalogue des roches et les références dans `src/data/`.
- [x] Isoler la galerie de roches et les références visuelles en composants séparés.
- [x] Séparer les constructeurs 3D du volcan, des plaques, des sédiments et des roches, ainsi que leurs animations/chargements spécifiques, dans des fichiers de domaine; garder les utilitaires Three.js dans `scenes/shared/`.
- [ ] Garder `App.jsx` comme point d’intégration : nouvel onglet, état commun et composition de page.
- [ ] Vérifier le build, les quatre parcours existants, les contrôles tactiles et la version Android hors ligne avant fusion.

### Lot 2 — Programme et contenu pédagogique

- [ ] Examiner le programme haïtien de SVT le plus récent disponible et consigner titre, version/date, niveaux, notions, compétences, prévention des risques et limites d’interprétation.
- [ ] Construire une matrice « notion du programme → activité de l’application → niveau scolaire → source ».
- [ ] Distinguer explicitement ce qui relève du programme documenté, des compléments proposés et des besoins de validation par l’enseignant.
- [ ] Prévoir français et créole haïtien pour les explications principales, sans bloquer les fonctionnalités interactives.

### Lot 3 — Séismes et tsunamis — prochaine nouvelle expérience

- [ ] Créer une scène indépendante dans `src/scenes/hazards/` : foyer/hypocentre, faille, propagation des ondes P puis S, surface et sismogramme.
- [ ] Montrer qu’un tsunami ne suit pas automatiquement chaque séisme : distinguer séisme sous-marin, déplacement vertical du fond, propagation en eau profonde et amplification à l’approche de la côte.
- [ ] Fournir lecture/pause/recommencer, réglages compréhensibles, légendes lisibles sur mobile et gestes 3D.
- [ ] Qualifier les vitesses, distances et déformations comme modèle pédagogique simplifié; ne jamais présenter la scène comme prévision ou système d’alerte.
- [ ] Charger localement les ressources nécessaires pour préserver le fonctionnement hors ligne.
- [ ] L’agent de la scène crée son composant et ses styles dédiés; l’agent intégrateur reste seul à modifier `App.jsx` et les registres communs.

### Lot 4 — Approfondir les modules existants

- [ ] Tectonique : intégrer les références que l’utilisateur fournira avant de retoucher les mouvements; conserver des cas distincts divergence, subduction/convergence et coulissage.
- [ ] Volcans : conserver le relief réel identifié comme tel et distinguer clairement le modèle d’éruption de la donnée topographique.
- [ ] Sédiments et fossiles : expliquer dépôt, enfouissement, transformation et fossilisation en séquence, sans confondre le scan réel de Cerro Ballena avec une reconstitution du processus.
- [ ] Roches : maintenir la provenance des photographies et enrichir les comparaisons sur la formation, les textures et le cycle des roches.
- [ ] Ajouter ultérieurement d’autres phénomènes pertinents (érosion, glissements de terrain, cycle de l’eau et géologie locale d’Haïti) selon le programme et les priorités pédagogiques.

### Lot 5 — Progression des élèves

- [ ] Après validation du contenu et des activités, définir les niveaux/classes et leurs objectifs, prérequis, vocabulaire et profondeur scientifique.
- [ ] Adapter l’accès aux notions sans retirer silencieusement des apprentissages nécessaires.
- [ ] Faire relire les explications et les activités par un enseignant haïtien avant de les considérer comme programme validé.

### Lot 6 — Vérification, intégration et publication

- [ ] Vérifier les parcours sur ordinateur et sur petit écran, clavier/tactile, chargement des modèles et absence de débordement horizontal.
- [ ] Refaire un build web, puis synchroniser/compiler Android et vérifier au moins un parcours hors ligne sur appareil lorsque le téléphone est disponible.
- [ ] Contrôler crédits, licences, taille des ressources et absence de secrets/caches dans Git.
- [ ] Intégrer les branches une par une, exécuter les régressions, puis pousser la version validée sur `main`.

## Règles de collaboration multi-agent

1. Chaque agent reçoit un seul lot, les chemins qu’il peut modifier, les chemins réservés à l’intégrateur et les critères de validation.
2. Les agents de code travaillent dans des branches/worktrees séparés; deux agents ne modifient pas simultanément le même fichier.
3. Les fichiers d’intégration partagés sont `src/App.jsx`, `src/styles.css`, `package.json`, `README.md` et la configuration Android. Un seul intégrateur les modifie pendant une intégration donnée.
4. Les agents de recherche livrent des sources, résumés et incertitudes; ils ne modifient pas le code de scène sans mission distincte.
5. L’intégrateur examine les diffs, réconcilie les dépendances et vérifie le build et les parcours avant toute fusion/poussée.
6. `sources/` et autres fichiers synchronisés du projet restent en lecture seule.

## État d’avancement

- Terminé : registre des modules, catalogue de roches, références, galerie et panneau de références séparés; constructeurs, animations de domaine et chargements propres aux expériences désormais répartis dans les fichiers dédiés sous `src/scenes/`.
- Le coordinateur `src/scenes/GeologyScene.jsx` conserve le cycle commun du renderer, la caméra, les lumières, le redimensionnement et la sélection de la scène. Le fichier `src/GeologyScene.jsx` garde le chemin d’import historique.
- Prochaine étape produit : vérifier le programme haïtien de SVT et bâtir la matrice pédagogique; ensuite, préparer le module autonome Séismes & tsunamis dans `src/scenes/hazards/`.
- Rien dans ce plan ne signifie que les travaux futurs sont déjà réalisés ou validés.
