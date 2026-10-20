# Futur Haïti — Académie

Une porte d’entrée unique vers quatre applications éducatives locales : **Système solaire**, **Géologie**, **Chimie** et **Histoire**. Chaque matière garde son propre code et s’ouvre dans l’interface commune. Aucun compte ni backend n’est utilisé.

## Préparer et compiler sous Windows

Prérequis : Node.js 20.19 ou plus récent et npm. Dans PowerShell, depuis ce dossier :

```powershell
npm ci --prefix modules/geologie-futur-haiti
npm ci --prefix modules/systeme-solaire-futur-haiti
npm ci --prefix modules/chimie-futur-haiti
npm ci --prefix modules/histoire-futur-haiti
npm run build
```

Le résultat complet est produit dans `dist/`. Pour le vérifier localement :

```powershell
npm run preview
```

Ouvrir l’adresse locale affichée, habituellement `http://127.0.0.1:4183/`. Il faut compiler une première fois avant de lancer l’aperçu.

## Matières intégrées

- **Système solaire** — scène 3D, exploration des planètes et archive d’images déjà fournies localement.
- **Géologie** — volcans, tectonique, roches, fossiles et contenus présents dans la copie locale du projet.
- **Chimie** — unités, modèles 3D et interactions présentes dans la copie locale du projet.
- **Histoire** — chronologie d’Haïti, repères mondiaux et lieux patrimoniaux présents dans la copie locale du projet.

La compilation adapte les chemins des ressources publiques de géologie et d’astronomie à leurs sous-dossiers respectifs. Elle travaille sur `modules/`, qui est une copie autonome des sources locales, et ne modifie pas les quatre dossiers de départ.

## Fonctionnement hors connexion

Les fichiers de l’interface et les ressources présentes dans les dossiers des matières sont regroupés sous `dist/apps/`; la coquille ne contacte aucun serveur. Une fois cette version intégrée à une enveloppe Android, les parcours dont les médias sont embarqués pourront être présentés sans réseau. Les liens vers des sources externes, cartes en ligne ou sites web ne seront évidemment pas accessibles hors ligne.

La coque Android Capacitor est préparée à la racine du projet. Après installation des dépendances avec `npm install`, la commande `npm run android:apk` reconstruit les quatre matières, synchronise les ressources locales et produit l’APK debug dans `android/app/build/outputs/apk/debug/`. Pour l’installer sur un téléphone USB débogué : `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`.

L’APK fusionné et son fonctionnement hors ligne doivent être vérifiés sur l’appareil avant de remplacer les applications déjà installées. Les liens vers des sources externes, cartes en ligne ou sites web ne seront évidemment pas accessibles hors ligne.

## Dépôts Git sources

Les dossiers `modules/` contiennent l’état local des applications lors de leur intégration. Les dossiers d’origine ne sont ni déplacés ni modifiés. Les métadonnées Git internes aux anciennes applications et leurs dossiers `node_modules`, `dist` et Android ne sont pas dupliqués dans le nouveau dépôt. Les versions locales et dépendances des matières restent décrites dans leurs manifestes et fichiers de verrouillage.

## Limites

- Le contenu demeure un prototype pédagogique indépendant; il ne remplace pas les manuels ni une validation institutionnelle.
- Les liens externes exigent une connexion Internet.
- Le poids de la version assemblée dépend surtout des modèles, images et séquences d’histoire géologique inclus dans les applications.
- L’APK, sa taille, son installation et le fonctionnement hors ligne sur téléphone ne sont confirmés qu’après compilation et test sur cet appareil.
