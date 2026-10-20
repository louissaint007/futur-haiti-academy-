# Futur Haiti — Explorateur du système solaire

Démo éducative web en français et en kreyòl ayisyen. La scène 3D est rendue localement avec Three.js; les textures des corps célestes sont générées par le navigateur. Aucun compte, backend ou service de données externe n’est nécessaire.

## Lancer sous Windows

Installez Node.js 24 ou une version compatible avec Vite 8, puis ouvrez un terminal dans ce dossier :

```powershell
npm install
npm run dev
```

Ouvrez l’adresse affichée par Vite, généralement `http://localhost:5173`.

Pour préparer les fichiers de production : `npm run build`. Pour tester cette version compilée : `npm run preview`.

## Application Android

Le projet inclut une enveloppe Android Capacitor. Avec Android SDK, Java 17+ et un appareil Android autorisé en débogage USB :

```powershell
npm install
npm run android:apk
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Pour actualiser le projet natif après une modification web, relancez `npm run android:sync`. Le projet Android peut aussi être ouvert dans Android Studio depuis le dossier `android/`.

## Déploiement sur Vercel

Importez ce dépôt GitHub dans Vercel. Vercel détecte Vite automatiquement; utilisez `npm run build` comme commande de compilation et `dist` comme dossier de sortie. Aucun backend ni variable d’environnement n’est requis.

## Explorer

- Faites glisser la scène pour tourner autour du Soleil; utilisez la molette pour zoomer.
- Choisissez l’un des cinq cadrages rapides : orbital, dessus, profil, proche ou panorama; faites ensuite glisser librement la scène pour continuer à explorer.
- Sur téléphone, un doigt fait orbiter la caméra; deux doigts font pivoter le point de vue et pincer pour régler le zoom.
- Sélectionnez une planète dans la scène ou dans le panneau de gauche pour voyager vers elle.
- Sur téléphone, les modes et les planètes restent accessibles dans une barre compacte; la fiche sélectionnée défile sans masquer la planète en rotation. Le comparateur et les fenêtres d’images gardent leur propre zone de défilement sur les écrans courts.
- Après sélection, la caméra suit la planète sur son orbite. Le bouton « Suivi auto · ON/OFF » arrête ou reprend le suivi; le glisser-déposer et la molette permettent toujours de modifier manuellement le point de vue.
- Le panneau pédagogique donne distance moyenne, diamètre, durée du jour et de l’année, température indicative, lunes et fait intéressant.
- « Apprendre » propose un parcours de repères (Terre → système solaire → Voie lactée → univers observable) et les expériences Soleil-étoile, jour/nuit, saisons, année martienne et tailles comparées.
- « Comparer » met en regard diamètre, distance au Soleil, masse relative, gravité de surface, durée du jour et de l’année, ainsi qu’une température indicative.
- Le comparateur propose deux sélecteurs indépendants pour le Soleil et chacune des huit planètes. Les diamètres se calculent depuis les valeurs NASA; le Soleil mesure environ 1 392 000 km, soit 109 fois le diamètre terrestre.
- La comparaison montre aussi deux sphères côte à côte dont le diamètre suit le rapport réel avec la Terre (les plus petites gardent un minimum visible).
- Sélectionnez une planète, puis « Images NASA & missions » pour consulter la vue globale du monde (disque entier ou globe presque entier) et, lorsqu’elle est disponible, l’image rapprochée ou de surface déjà présente. Utilisez les onglets « Vue globale » et « Détail / surface » pour passer de l’une à l’autre.
- Dans la fiche de la Terre, « Manipuler le globe » ouvre un globe séparé et immobile : glisser à la souris ou au doigt le fait tourner, pincer ou utiliser les commandes +/− ajuste le zoom, et le bouton de recentrage restaure la vue initiale. Échap, « Fermer » ou toucher l’arrière-plan ramène à la scène solaire.
- Les fichiers sont fournis avec le projet pour rester disponibles hors ligne. Certaines images globales sont des mosaïques NASA assemblées à partir de plusieurs captures; leur légende le précise. Les crédits et liens NASA sont associés à chaque image.
- Le quiz comprend six questions, dont trois questions de compréhension sur le Soleil comme étoile, la rotation terrestre et les saisons, avec un retour explicatif.
- Les commandes 1×, 10× et 100× modifient la vitesse de la simulation; Pause arrête les mouvements orbitaux.
- FR / KREYÒL change l’interface sans rechargement.
- « Voyager vers Saturne » déclenche un déplacement caméra vers la planète et ses anneaux.

## Précision scientifique

La maquette de la Lune utilise une mosaïque couleur LROC/WAC 4K et le modèle d'altitude LOLA 16 pixels/degré de la NASA. La couleur vient des observations de la caméra LRO; les altitudes mesurées par laser déplacent le maillage et accentuent légèrement le relief pour rendre les parois et profondeurs des cratères observables en zoomant. Les versions web locales (`public/nasa/moon-lroc-color-4k.jpg`, `public/nasa/moon-lola-elevation-4k.png`) proviennent des jeux de données du [CGI Moon Kit du NASA Scientific Visualization Studio](https://svs.gsfc.nasa.gov/4720/). L'échelle verticale est légèrement exagérée pour l'observation pédagogique; elle ne constitue pas un relevé topographique de précision.

Les valeurs des huit planètes sont centralisées dans `src/data/planets.js`; la fiche de comparaison du Soleil est dans `src/App.jsx`. Distances et tailles visibles dans la scène 3D sont adaptées pour garder toutes les planètes explorables sur un seul écran; elles ne constituent pas un modèle à l’échelle. Les sphères du comparateur suivent le rapport des diamètres sélectionnés, avec un minimum d’affichage pour garder les petits corps visibles; la ligne de comparaison donne aussi leur rapport numérique. Les vitesses orbitales de la scène sont volontairement accélérées. Les textures de surface du Soleil et de la Terre dans la scène sont des illustrations générées pour le rendu 3D, pas des images de mesure ou des cartes géographiques NASA; la galerie conserve séparément les images de référence avec leurs crédits et sources. La texture terrestre ne doit pas servir à localiser précisément des villes, des formations géologiques ou des reliefs.

Les décomptes de lunes signalés comme évolutifs affichent les satellites connus dans les pages NASA consultées en août 2026 : [Jupiter (115)](https://science.nasa.gov/jupiter/jupiter-moons/), [Saturne (293)](https://science.nasa.gov/saturn/moons/), [Uranus (29)](https://science.nasa.gov/uranus/moons/facts/) et [Neptune (16)](https://science.nasa.gov/neptune/moons/). Ces nombres peuvent changer à mesure que de nouveaux satellites sont confirmés.

Sources de référence : [NASA/JPL — Chapter 1: The Solar System](https://science.nasa.gov/learn/basics-of-space-flight/chapter1-2/) et [NASA — Solar System Facts](https://science.nasa.gov/solar-system/solar-system-facts/). Les décomptes de lunes des géantes sont évolutifs et sont indiqués comme tels plutôt qu’énumérés comme des valeurs fixes.

Les images de la galerie incluent des vues globales NASA de Mercure ([MESSENGER](https://science.nasa.gov/mercury/exploration/)), Mars ([Mariner 7](https://science.nasa.gov/photojournal/mars-full-disk-approach-view-from-mariner-7/)), Jupiter ([Voyager 2](https://science.nasa.gov/photojournal/jupiter/)), Saturne ([Cassini](https://science.nasa.gov/photojournal/the-greatest-saturn-portrait-yet/)) et Neptune ([Voyager 2](https://science.nasa.gov/resource/neptune-full-disk-view/)). Les autres images et crédits sont consignés par image dans `src/data/spaceArchive.js`. Les missions mentionnées sont des exemples documentés; la liste n’est pas exhaustive et les concepts futurs sont présentés comme tels.

Cette démonstration est un prototype éducatif indépendant. Elle n’est pas présentée comme un programme officiellement adopté par une institution.

## Stack

- React 19
- Vite 8
- Three.js WebGLRenderer, OrbitControls et CSS2DRenderer
- Textures procédurales locales, sans modèles ou images distants requis
