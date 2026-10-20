import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DEEP_TIME_EVENTS } from '../data/deepTime.js';
import './DeepTimeGlobe.css';

const RADIUS = 1.72;
const STAGES = {
  'earth-forms': { label: 'Accrétion · la planète grandit sous les impacts', palette: ['#160b12','#652018','#e75822'], ocean: '#321319', land: '#e7682c', atmosphere: '#ff6b36', impacts: 'accretion', caption: 'La Terre grandit par accrétion de corps rocheux. Les impacts visibles condensent une étape qui a duré des millions d’années; ils ne sont pas une chronologie à l’échelle réelle.' },
  'moon-forming': { label: 'Impact géant · naissance de la Lune', palette: ['#160a12','#712719','#ef6730'], ocean: '#34151a', land: '#ed6835', atmosphere: '#ff7746', impacts: 'moon', caption: 'Une collision géante projette des matériaux en orbite; ils s’agglomèrent ensuite pour former la Lune. C’est une reconstitution de l’hypothèse scientifique principale.' },
  'early-oceans': { label: 'La croûte se forme et l’eau s’accumule', palette: ['#06151d','#175067','#72938a'], ocean: '#10516a', land: '#a07d56', atmosphere: '#7ac8d3', continents: 'fragments', impacts: 'none', caption: 'En se refroidissant, la surface forme des terrains solides. L’eau liquide s’installe, avec un volcanisme encore intense.' },
  'early-life': { label: 'Océans anciens · vie microbienne', palette: ['#061720','#10536a','#6e9b7c'], ocean: '#10536a', land: '#9d9666', atmosphere: '#69c3c8', continents: 'fragments', microbial: true, impacts: 'none', caption: 'La vie connue est microscopique. Les tapis microbiens sont évoqués ici par de faibles traces côtières, pas par des plantes ou des animaux modernes.' },
  oxygen: { label: 'La Grande Oxydation', palette: ['#071723','#164b56','#698d71'], ocean: '#174f5c', land: '#89936a', atmosphere: '#75b7a4', continents: 'fragments', oxygen: true, impacts: 'none', caption: 'L’oxygène produit par des microbes s’accumule graduellement dans l’atmosphère et les océans; la couleur de l’air est une évocation, pas une photographie.' },
  cryogenian: { label: 'Glaciations extrêmes du Cryogénien', palette: ['#09202b','#286578','#b6d0d1'], ocean: '#155368', land: '#8f9e8d', atmosphere: '#a5e6f0', continents: 'fragments', ice: 'snowball', impacts: 'none', caption: 'Des épisodes glaciaires majeurs marquent le Cryogénien. La couverture presque globale est une hypothèse illustrée, pas une certitude uniforme.' },
  cambrian: { label: 'Mers peu profondes · diversification marine', palette: ['#071827','#17607b','#79aa89'], ocean: '#155e78', land: '#b09b6b', atmosphere: '#79c9d5', continents: 'fragments', impacts: 'none', caption: 'Les mers bordent des continents dispersés; la diversité des fossiles animaux marins augmente fortement.' },
  pangaea: { label: 'Pangée · un supercontinent', palette: ['#071521','#145375','#87a979'], ocean: '#155577', land: '#b6a06c', atmosphere: '#69cbe0', continents: 'pangaea', impacts: 'none', rotation: -Math.PI / 2, caption: 'Les terres émergées convergent en Pangée, entourée par le vaste océan Panthalassa.' },
  'permian-crisis': { label: 'Trapps de Sibérie · crise du Permien', palette: ['#10141a','#304b50','#80906e'], ocean: '#15516c', land: '#a08b61', atmosphere: '#bd9a74', continents: 'pangaea', volcanism: true, impacts: 'none', caption: 'Un volcanisme exceptionnel en Sibérie est lié à la crise biologique. La scène montre des provinces volcaniques; elle ne représente pas un impact d’astéroïde.' },
  'cretaceous-crisis': { label: 'Chicxulub · impact près du Yucatán', palette: ['#071522','#14506c','#729e70'], ocean: '#14516c', land: '#9d9a68', atmosphere: '#68c6da', continents: 'modern', impacts: 'extinction', rotation: Math.PI / 2, caption: 'À 66 Ma, un astéroïde frappe une mer peu profonde près du Yucatán. La séquence montre un impact ponctuel, puis des effets à grande échelle.' },
  'ice-age': { label: 'Quaternaire · les calottes avancent et reculent', palette: ['#071627','#134d6c','#c6dfd9'], ocean: '#155775', land: '#81916d', atmosphere: '#9cdeed', continents: 'modern', ice: 'polar', impacts: 'none', caption: 'Au Quaternaire, les calottes polaires et les glaciers alternent entre phases d’extension et de recul; elles ne couvrent pas toute la planète.' },
  today: { label: 'La Terre actuelle', palette: ['#061326','#0f426b','#729968'], ocean: '#14527a', land: '#799867', atmosphere: '#74d1f0', continents: 'modern', impacts: 'none', caption: 'Vue de la Terre actuelle : continents, océans et nuages, toujours en mouvement à l’échelle géologique.' },
};

function surfaceFramePath(stageId, frame) {
  return `/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/deep-time/frames/${stageId}-${String(frame + 1).padStart(2, '0')}.webp`;
}

function surfaceTransitionPath(fromId, toId, frame) {
  return `/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/deep-time/transitions/${fromId}--${toId}-${String(frame).padStart(2, '0')}.png`;
}

function createRockyBodyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 256;
  const context = canvas.getContext('2d');
  const base = context.createLinearGradient(0, 0, 0, canvas.height);
  base.addColorStop(0, '#806653'); base.addColorStop(.45, '#5e483d'); base.addColorStop(1, '#342a2b');
  context.fillStyle = base; context.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 84; i++) {
    const x = (i * 163 + 29) % canvas.width; const y = (i * 97 + 13) % canvas.height;
    const radius = 5 + (i * 7 % 19);
    const shade = context.createRadialGradient(x - radius * .24, y - radius * .25, 1, x, y, radius);
    shade.addColorStop(0, i % 3 ? 'rgba(185,151,119,.42)' : 'rgba(32,27,29,.75)');
    shade.addColorStop(.7, i % 3 ? 'rgba(107,75,60,.26)' : 'rgba(54,39,37,.44)');
    shade.addColorStop(1, 'rgba(22,19,23,0)');
    context.fillStyle = shade; context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2); context.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function asteroidGeometry() {
  const geometry = new THREE.IcosahedronGeometry(0.065, 2);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i); const y = positions.getY(i); const z = positions.getZ(i);
    const noise = 0.77 + 0.2 * Math.sin(x * 63 + y * 29) * Math.cos(z * 47 - x * 17);
    positions.setXYZ(i, x * noise * 1.12, y * noise * 0.9, z * noise * 1.04);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function globePoint(lon, lat, radius = RADIUS) {
  const longitude = THREE.MathUtils.degToRad(lon);
  const latitude = THREE.MathUtils.degToRad(lat);
  return new THREE.Vector3(Math.cos(latitude) * Math.sin(longitude), Math.sin(latitude), Math.cos(latitude) * Math.cos(longitude)).multiplyScalar(radius);
}

function makeAsteroid(parent, material, geometry, start, end, delay = 0, size = 1, duration = 1.8) {
  const group = new THREE.Group();
  const rock = new THREE.Mesh(geometry, material);
  rock.scale.setScalar(size);
  group.add(rock);
  const trailGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const trail = new THREE.Line(trailGeometry, new THREE.LineBasicMaterial({ color: '#ffb26a', transparent: true, opacity: 0.75 }));
  group.add(trail);
  parent.add(group);
  return { group, rock, trail, start: new THREE.Vector3(...start), end: new THREE.Vector3(...end), delay, duration };
}

export default function DeepTimeGlobe({ event, onNext }) {
  const hostRef = useRef(null);
  const controlsRef = useRef(null);
  const planetRef = useRef(null);
  const surfaceRef = useRef(null);
  const transitionRef = useRef(null);
  const setSurfaceFrameRef = useRef(null);
  const preloadSurfaceFrameRef = useRef(null);
  const preloadSurfaceTransitionRef = useRef(null);
  const activeFrameRef = useRef(0);
  const surfaceRequestRef = useRef(0);
  const atmosphereRef = useRef(null);
  const hazeRef = useRef(null);
  const flashRef = useRef(null);
  const stageStartedRef = useRef(performance.now());
  const stageElapsedRef = useRef(0);
  const stagePausedAtRef = useRef(null);
  const wasPlayingRef = useRef(false);
  const targetRotationRef = useRef(0);
  const previousTimelineIndexRef = useRef(DEEP_TIME_EVENTS.findIndex((item) => item.id === event.id));
  const cameraShotRef = useRef(new THREE.Vector3(0.15, 0.2, 6.35));
  const cameraMoveUntilRef = useRef(0);
  const moonRef = useRef(null);
  const debrisCloudRef = useRef(null);
  const craterRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [playbackRun, setPlaybackRun] = useState(0);
  const stage = STAGES[event.id] || STAGES.today;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050914');
    const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
    camera.position.set(0.15, 0.2, 6.35);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.setAttribute('aria-label', 'Scène cinématique en 3D. Glisse pour déplacer la caméra, molette ou pincement pour zoomer.');
    renderer.domElement.setAttribute('role', 'img');
    host.appendChild(renderer.domElement);

    const stars = [];
    for (let i = 0; i < 1000; i++) {
      const radius = 7 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      stars.push(radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(stars, 3));
    scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: '#f5dfc4', size: 0.035, transparent: true, opacity: 0.8, sizeAttenuation: true })));

    scene.add(new THREE.AmbientLight('#b9d0ec', 0.3));
    scene.add(new THREE.HemisphereLight('#6883bb', '#100e18', 0.18));
    const sunlight = new THREE.DirectionalLight('#fff0d5', 2.7); sunlight.position.set(-5.7, 2.8, 4.8); scene.add(sunlight);
    const rimLight = new THREE.PointLight('#347bff', 18, 18); rimLight.position.set(3, -2, -4); scene.add(rimLight);

    const planet = new THREE.Group(); scene.add(planet);
    planetRef.current = planet;
    const surfaceMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.82, metalness: 0.02 });
    surfaceMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uNextSurfaceMap = { value: surfaceMaterial.userData.nextSurfaceMap || null };
      shader.uniforms.uFromNextSurfaceMap = { value: surfaceMaterial.userData.fromNextSurfaceMap || null };
      shader.uniforms.uFromSurfaceBlend = { value: surfaceMaterial.userData.fromSurfaceBlend || 0 };
      shader.uniforms.uSurfaceBlend = { value: surfaceMaterial.userData.surfaceBlend || 0 };
      surfaceMaterial.userData.surfaceBlendUniforms = shader.uniforms;
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uNextSurfaceMap;\nuniform sampler2D uFromNextSurfaceMap;\nuniform float uFromSurfaceBlend;\nuniform float uSurfaceBlend;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
        #ifdef USE_MAP
          vec4 surfaceColorFrom = texture2D(map, vMapUv);
          vec4 surfaceColorFromNext = texture2D(uFromNextSurfaceMap, vMapUv);
          vec4 surfaceColorTo = texture2D(uNextSurfaceMap, vMapUv);
          vec3 stableFromColor = mix(surfaceColorFrom.rgb, surfaceColorFromNext.rgb, uFromSurfaceBlend);
          diffuseColor *= vec4(mix(stableFromColor, surfaceColorTo.rgb, uSurfaceBlend), surfaceColorFrom.a);
        #endif
      `);
    };
    const surface = new THREE.Mesh(new THREE.SphereGeometry(RADIUS, 96, 72), surfaceMaterial);
    planet.add(surface);
    surfaceRef.current = surface;
    const textureLoader = new THREE.TextureLoader();
    const textureCache = new Map();
    let sceneDisposed = false;
    const trimTextureCache = () => {
      if (textureCache.size <= 12) return;
      const material = surfaceRef.current?.material;
      const active = new Set([
        material?.map,
        material?.userData.nextSurfaceMap,
        material?.userData.fromNextSurfaceMap,
        transitionRef.current?.from,
        transitionRef.current?.to,
        ...(transitionRef.current?.steps || []),
      ]);
      for (const [path, cached] of textureCache) {
        if (textureCache.size <= 12) break;
        if (cached instanceof Promise || active.has(cached)) continue;
        cached.dispose();
        textureCache.delete(path);
      }
    };
    const loadTexture = (path) => {
      const cached = textureCache.get(path);
      if (cached) return Promise.resolve(cached);
      const pending = textureLoader.loadAsync(path).then((texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
        if (sceneDisposed) {
          texture.dispose();
          textureCache.delete(path);
          return null;
        }
        textureCache.set(path, texture);
        trimTextureCache();
        return texture;
      }).catch(() => {
        textureCache.delete(path);
        return null;
      });
      textureCache.set(path, pending);
      return pending;
    };
    const loadSurfaceTexture = (stageId, frame) => loadTexture(surfaceFramePath(stageId, frame));
    preloadSurfaceFrameRef.current = (stageId, frame) => { void loadSurfaceTexture(stageId, frame); };
    const loadTransitionTextures = (fromId, toId) => {
      const fromIndex = DEEP_TIME_EVENTS.findIndex((item) => item.id === fromId);
      const toIndex = DEEP_TIME_EVENTS.findIndex((item) => item.id === toId);
      if (fromIndex < 0 || toIndex < 0 || Math.abs(fromIndex - toIndex) !== 1) return Promise.resolve([]);
      const earlier = fromIndex < toIndex ? fromId : toId;
      const later = fromIndex < toIndex ? toId : fromId;
      const frames = fromIndex < toIndex ? [1, 2] : [2, 1];
      return Promise.all(frames.map((frame) => loadTexture(surfaceTransitionPath(earlier, later, frame))));
    };
    preloadSurfaceTransitionRef.current = (fromId, toId) => { void loadTransitionTextures(fromId, toId); };
    setSurfaceFrameRef.current = (stageId, frame, frameStage = STAGES[stageId] || STAGES.today, previousStageId = null) => {
      const requestId = ++surfaceRequestRef.current;
      const targetTexture = loadSurfaceTexture(stageId, frame);
      const transitionTextures = previousStageId && previousStageId !== stageId
        ? loadTransitionTextures(previousStageId, stageId)
        : Promise.resolve([]);
      void Promise.all([targetTexture, transitionTextures]).then(([texture, intermediates]) => {
        if (!texture || requestId !== surfaceRequestRef.current || !planetRef.current) return;
        const material = surfaceRef.current.material;
        material.color.set('#ffffff');
        material.roughness = 0.82;
        if (!material.map) {
          material.map = texture;
          material.userData.nextSurfaceMap = texture;
          material.userData.fromNextSurfaceMap = texture;
          material.userData.fromSurfaceBlend = 0;
          material.needsUpdate = true;
          return;
        }
        const previous = transitionRef.current;
        const fromTexture = previous ? previous.from : material.map;
        const fromNextTexture = previous ? previous.to : material.map;
        const fromBlend = previous ? previous.blend : 0;
        const steps = [...intermediates.filter(Boolean), texture];
        material.userData.fromNextSurfaceMap = fromNextTexture;
        material.userData.fromSurfaceBlend = fromBlend;
        material.userData.nextSurfaceMap = steps[0];
        material.userData.surfaceBlend = 0;
        transitionRef.current = { from: fromTexture, to: steps[0], steps, stepIndex: 0, stepDuration: steps.length > 1 ? 720 : 1800, started: performance.now(), blend: 0 };
        if (material.userData.surfaceBlendUniforms) {
          material.userData.surfaceBlendUniforms.uFromNextSurfaceMap.value = fromNextTexture;
          material.userData.surfaceBlendUniforms.uFromSurfaceBlend.value = fromBlend;
          material.userData.surfaceBlendUniforms.uNextSurfaceMap.value = steps[0];
          material.userData.surfaceBlendUniforms.uSurfaceBlend.value = 0;
        }
      });
    };
    setSurfaceFrameRef.current(stage.id, 0, stage);
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(RADIUS * 1.06, 64, 48), new THREE.MeshBasicMaterial({ color: stage.atmosphere, transparent: true, opacity: 0.13, side: THREE.BackSide, depthWrite: false }));
    planet.add(atmosphere);
    atmosphereRef.current = atmosphere.material;
    const haze = new THREE.Mesh(new THREE.SphereGeometry(RADIUS * 1.12, 48, 36), new THREE.MeshBasicMaterial({ color: stage.atmosphere, transparent: true, opacity: 0.035, side: THREE.BackSide, depthWrite: false }));
    planet.add(haze);
    hazeRef.current = haze.material;

    const debrisMaterial = new THREE.MeshStandardMaterial({ color: '#bc7954', roughness: 1, metalness: 0.05 });
    const debrisGeometry = asteroidGeometry();
    const trajectory = (lon, lat, distance, side = 1) => {
      const target = globePoint(lon, lat, RADIUS * 1.015);
      const direction = new THREE.Vector3(side * 0.55, 0.35, 1).normalize();
      return [target.clone().add(direction.clone().multiplyScalar(distance)), target];
    };
    const accretionTargets = [[-65, 30], [-38, -12], [-10, 40], [15, -35], [42, 18], [65, -10], [-55, -38], [55, 38], [-20, 0], [25, 48], [-5, -50], [74, 18]];
    const accretionRocks = accretionTargets.map(([lon, lat], index) => {
      const end = globePoint(lon, lat, RADIUS * 1.015);
      const approach = new THREE.Vector3(Math.cos(index * 1.71) * 0.72, Math.sin(index * 2.13) * 0.54, 0.72 + (index % 3) * 0.12).normalize();
      const start = end.clone().addScaledVector(approach, 3.5 + (index % 3) * 0.55);
      return makeAsteroid(planet, debrisMaterial, debrisGeometry, start.toArray(), end.toArray(), index * 0.46, 1.35 + (index % 3) * 0.28, 1.45);
    });
    const accretionScars = accretionRocks.map((rock, index) => {
      const scar = new THREE.Mesh(new THREE.CircleGeometry(0.075 + (index % 3) * 0.018, 32), new THREE.MeshBasicMaterial({ color: '#351316', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
      scar.position.copy(rock.end.clone().multiplyScalar(0.997));
      scar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), rock.end.clone().normalize());
      planet.add(scar);
      return scar;
    });
    const moonImpactPath = trajectory(-62, -2, 5, -1);
    const moonNormal = moonImpactPath[1].clone().normalize();
    const moonImpactorGeometry = new THREE.SphereGeometry(0.88, 48, 36);
    const moonImpactorMaterial = new THREE.MeshStandardMaterial({ map: createRockyBodyTexture(), color: '#98745c', roughness: 0.98, metalness: 0.01, emissive: '#30170f', emissiveIntensity: 0.16 });
    const moonImpactor = makeAsteroid(planet, moonImpactorMaterial, moonImpactorGeometry, moonImpactPath[0].toArray(), moonImpactPath[1].clone().add(moonNormal.clone().multiplyScalar(0.78)).toArray(), 1.2, 1, 2.1);
    const impactPath = trajectory(-89, 21, 4.6, 1);
    const extinctionImpactor = makeAsteroid(planet, debrisMaterial, debrisGeometry, impactPath[0].toArray(), impactPath[1].toArray(), 1.1, 2.4, 1.5);

    const debrisCloud = new THREE.Group();
    const cloudMaterial = new THREE.MeshStandardMaterial({ color: '#bd8b68', roughness: 0.95, flatShading: true, transparent: true, opacity: 0.86 });
    for (let i = 0; i < 36; i++) {
      const angle = -0.2 + (i / 35) * Math.PI * 1.48;
      const radius = 1.86 + ((i * 17) % 9) * 0.055;
      const rock = new THREE.Mesh(debrisGeometry, cloudMaterial);
      rock.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.32 + 0.27, Math.sin(angle) * radius * 0.82);
      rock.scale.setScalar(0.62 + (i % 4) * 0.28);
      rock.userData.initialScale = rock.scale.x;
      debrisCloud.add(rock);
    }
    debrisCloud.rotation.z = 0.28; debrisCloud.visible = false; planet.add(debrisCloud);
    debrisCloudRef.current = debrisCloud;
    const moon = new THREE.Mesh(new THREE.SphereGeometry(0.4, 48, 36), new THREE.MeshStandardMaterial({ map: createRockyBodyTexture(), color: '#b9b8b2', roughness: 0.96, metalness: 0.01, emissive: '#30261f', emissiveIntensity: 0.12 }));
    moon.position.set(0, 0, 0); moon.visible = false; planet.add(moon); moonRef.current = moon;

    const flash = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 20), new THREE.MeshBasicMaterial({ color: '#fff0b6', transparent: true, opacity: 0, depthWrite: false }));
    const impactPoint = globePoint(-89, 21, RADIUS * 1.03);
    flash.position.copy(impactPoint); planet.add(flash); flashRef.current = flash.material;
    const waveGeometry = new THREE.BufferGeometry();
    waveGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(128 * 3), 3));
    const shockwave = new THREE.LineLoop(waveGeometry, new THREE.LineBasicMaterial({ color: '#ffe0a4', transparent: true, opacity: 0, depthWrite: false }));
    shockwave.position.copy(impactPoint);
    shockwave.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), impactPoint.clone().normalize());
    planet.add(shockwave);
    const crater = new THREE.Mesh(new THREE.CircleGeometry(0.16, 40), new THREE.MeshBasicMaterial({ color: '#352b29', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
    crater.position.copy(impactPoint.clone().multiplyScalar(0.997));
    crater.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), impactPoint.clone().normalize());
    planet.add(crater); craterRef.current = crater;
    const ejecta = new THREE.Group();
    const ejectaMaterial = new THREE.MeshStandardMaterial({ color: '#8f7767', roughness: 0.95, flatShading: true, emissive: '#321a13', emissiveIntensity: 0.35 });
    for (let i = 0; i < 16; i++) {
      const fragment = new THREE.Mesh(debrisGeometry, ejectaMaterial);
      fragment.scale.setScalar(0.24 + (i % 4) * 0.13);
      ejecta.add(fragment);
    }
    planet.add(ejecta);
    const waveNormal = new THREE.Vector3(); const waveTangentA = new THREE.Vector3(); const waveTangentB = new THREE.Vector3();
    const updateSurfaceWave = (site, angularRadius) => {
      waveNormal.copy(site).normalize();
      waveTangentA.crossVectors(waveNormal, Math.abs(waveNormal.y) > 0.92 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)).normalize();
      waveTangentB.crossVectors(waveNormal, waveTangentA).normalize();
      const positions = waveGeometry.attributes.position;
      const globeRadius = RADIUS * 1.014;
      for (let i = 0; i < positions.count; i++) {
        const angle = (i / positions.count) * Math.PI * 2;
        const point = waveNormal.clone().multiplyScalar(Math.cos(angularRadius))
          .add(waveTangentA.clone().multiplyScalar(Math.cos(angle) * Math.sin(angularRadius)))
          .add(waveTangentB.clone().multiplyScalar(Math.sin(angle) * Math.sin(angularRadius)))
          .multiplyScalar(globeRadius);
        positions.setXYZ(i, point.x, point.y, point.z);
      }
      positions.needsUpdate = true;
      waveGeometry.computeBoundingSphere();
    };

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.055;
    controls.autoRotate = true; controls.autoRotateSpeed = 0.22;
    controls.minDistance = 3.35; controls.maxDistance = 10;
    controlsRef.current = controls;
    const resize = () => {
      const width = Math.max(host.clientWidth, 1); const height = Math.max(host.clientHeight, 1);
      camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    const clock = new THREE.Clock();
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.elapsedTime;
      if (transitionRef.current) {
        const transition = transitionRef.current;
        const amount = Math.min(1, (performance.now() - transition.started) / transition.stepDuration);
        const smooth = amount * amount * (3 - 2 * amount);
        transition.blend = smooth;
        surfaceRef.current.material.userData.surfaceBlend = smooth;
        const blendUniform = surfaceRef.current.material.userData.surfaceBlendUniforms?.uSurfaceBlend;
        if (blendUniform) blendUniform.value = smooth;
        if (amount >= 1) {
          const material = surfaceRef.current.material;
          const nextIndex = transition.stepIndex + 1;
          material.map = transition.to;
          material.userData.fromNextSurfaceMap = transition.to;
          material.userData.fromSurfaceBlend = 0;
          material.userData.surfaceBlend = 0;
          if (nextIndex < transition.steps.length) {
            const nextTexture = transition.steps[nextIndex];
            material.userData.nextSurfaceMap = nextTexture;
            if (material.userData.surfaceBlendUniforms) {
              material.userData.surfaceBlendUniforms.uNextSurfaceMap.value = nextTexture;
              material.userData.surfaceBlendUniforms.uFromNextSurfaceMap.value = transition.to;
              material.userData.surfaceBlendUniforms.uFromSurfaceBlend.value = 0;
              material.userData.surfaceBlendUniforms.uSurfaceBlend.value = 0;
            }
            transitionRef.current = { ...transition, from: transition.to, to: nextTexture, stepIndex: nextIndex, started: performance.now(), blend: 0 };
          } else {
            material.userData.nextSurfaceMap = transition.to;
            if (material.userData.surfaceBlendUniforms) {
              material.userData.surfaceBlendUniforms.uNextSurfaceMap.value = transition.to;
              material.userData.surfaceBlendUniforms.uFromNextSurfaceMap.value = transition.to;
              material.userData.surfaceBlendUniforms.uFromSurfaceBlend.value = 0;
              material.userData.surfaceBlendUniforms.uSurfaceBlend.value = 0;
            }
            transitionRef.current = null;
          }
        }
      }
      const rotationDelta = targetRotationRef.current - planet.rotation.y;
      const mode = host.dataset.mode;
      const paused = stagePausedAtRef.current !== null;
      planet.rotation.y += rotationDelta * (1 - Math.exp(-5.5 * delta));
      controls.autoRotate = false;
      const stageTime = Math.max(0, stageElapsedRef.current + (stagePausedAtRef.current === null ? (performance.now() - stageStartedRef.current) / 1000 : 0));
      const desiredFrame = stageTime >= 4.1 ? 1 : 0;
      if (desiredFrame !== activeFrameRef.current) {
        activeFrameRef.current = desiredFrame;
        setSurfaceFrameRef.current?.(mode, desiredFrame, STAGES[mode] || STAGES.today);
      }
      const accretionGrowth = THREE.MathUtils.lerp(0.76, 1, THREE.MathUtils.smoothstep(stageTime, 0, 7.2));
      planet.scale.setScalar(mode === 'earth-forms' ? accretionGrowth : 1);
      const animateRock = (rock, enabled) => {
        const progress = (stageTime - rock.delay) / rock.duration;
        rock.group.visible = enabled && progress >= 0 && progress <= 1.08;
        if (!rock.group.visible) return;
        const eased = THREE.MathUtils.smoothstep(Math.min(progress, 1), 0, 1);
        const position = rock.start.clone().lerp(rock.end, eased);
        rock.group.position.copy(position);
        if (!paused) { rock.rock.rotation.x += 0.42 * delta; rock.rock.rotation.y += 0.62 * delta; }
        const direction = rock.end.clone().sub(rock.start).normalize();
        rock.trail.geometry.setFromPoints([new THREE.Vector3(), direction.clone().multiplyScalar(-0.46)]);
        rock.trail.material.opacity = Math.min(0.86, Math.sin(Math.min(progress, 1) * Math.PI) * 0.9);
      };
      accretionRocks.forEach((rock, index) => {
        animateRock(rock, mode === 'earth-forms');
        const impactAt = rock.delay + rock.duration;
        const scarAge = stageTime - impactAt;
        accretionScars[index].visible = mode === 'earth-forms' && scarAge >= 0;
        accretionScars[index].material.opacity = accretionScars[index].visible ? 0.72 : 0;
      });
      animateRock(moonImpactor, mode === 'moon-forming');
      animateRock(extinctionImpactor, mode === 'cretaceous-crisis');
      if (debrisCloudRef.current) {
        const cloud = debrisCloudRef.current;
        cloud.visible = mode === 'moon-forming' && stageTime > 2.55 && stageTime < 8;
        const appear = THREE.MathUtils.smoothstep(stageTime, 2.55, 3.3) * (1 - THREE.MathUtils.smoothstep(stageTime, 7.1, 8));
        cloud.children.forEach((rock, index) => {
          const gather = THREE.MathUtils.smoothstep(stageTime, 3.6 + index * 0.045, 5.8 + index * 0.03);
          if (moonRef.current) rock.position.lerp(moonRef.current.position.clone(), gather * 0.94);
          rock.scale.setScalar(rock.userData.initialScale * Math.max(0.06, 1 - gather * 0.94));
          rock.material.opacity = Math.max(0, appear * 0.86);
        });
      }
      if (moonRef.current) {
        const orbitProgress = THREE.MathUtils.smoothstep(stageTime, 3.4, 7.2);
        moonRef.current.visible = mode === 'moon-forming' && stageTime > 3.4;
        const orbitRadius = THREE.MathUtils.lerp(1.78, 2.15, orbitProgress);
        const orbitAngle = -0.05 + stageTime * 0.25;
        moonRef.current.position.set(Math.cos(orbitAngle) * orbitRadius, 0.72 + Math.sin(orbitAngle * 0.45) * 0.26, Math.sin(orbitAngle) * orbitRadius);
        moonRef.current.scale.setScalar(THREE.MathUtils.lerp(0.08, 1, orbitProgress));
        if (!paused) moonRef.current.rotation.y += 0.08 * delta;
      }
      const extinction = mode === 'cretaceous-crisis';
      const lunarImpact = mode === 'moon-forming';
      const impactSite = lunarImpact ? moonImpactPath[1] : impactPoint;
      flash.position.copy(impactSite);
      shockwave.position.copy(impactSite.clone().multiplyScalar(1.008));
      shockwave.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), impactSite.clone().normalize());
      const impactPulse = extinction ? 1 - THREE.MathUtils.smoothstep(Math.abs(stageTime - 2.6), 0, 1.1) : lunarImpact ? 1 - THREE.MathUtils.smoothstep(Math.abs(stageTime - 3.25), 0, 0.9) : 0;
      flash.material.opacity = impactPulse * 0.95;
      shockwave.material.opacity = extinction ? THREE.MathUtils.smoothstep(stageTime, 2.45, 2.7) * (1 - THREE.MathUtils.smoothstep(stageTime, 4.8, 5.8)) * 0.78 : lunarImpact ? THREE.MathUtils.smoothstep(stageTime, 3.2, 3.55) * (1 - THREE.MathUtils.smoothstep(stageTime, 5.8, 6.8)) * 0.65 : 0;
      const waveRadius = extinction ? THREE.MathUtils.lerp(0.03, 0.92, THREE.MathUtils.smoothstep(stageTime, 2.5, 5.7)) : lunarImpact ? THREE.MathUtils.lerp(0.03, 0.5, THREE.MathUtils.smoothstep(stageTime, 3.25, 6.4)) : 0.03;
      updateSurfaceWave(impactSite, waveRadius);
      if (craterRef.current) craterRef.current.material.opacity = extinction ? 0.82 * THREE.MathUtils.smoothstep(stageTime, 2.55, 3.5) : 0;
      ejecta.visible = extinction && stageTime >= 2.6 && stageTime <= 4.8;
      if (ejecta.visible) {
        const age = stageTime - 2.6;
        const normal = impactPoint.clone().normalize();
        ejecta.children.forEach((fragment, index) => {
          const angle = index * (Math.PI * (3 - Math.sqrt(5)));
          const tangent = new THREE.Vector3(Math.cos(angle), Math.sin(angle * 0.72), Math.sin(angle)).normalize();
          const velocity = normal.clone().multiplyScalar(1.1 + (index % 3) * 0.15).add(tangent.multiplyScalar(0.8));
          const position = impactPoint.clone().multiplyScalar(1.02).add(velocity.multiplyScalar(age)).add(normal.clone().multiplyScalar(-0.34 * age * age));
          fragment.position.copy(position); fragment.rotation.set(age * 2, index, age * 1.3);
        });
      }
      if (!paused && performance.now() < cameraMoveUntilRef.current) camera.position.lerp(cameraShotRef.current, 1 - Math.exp(-3.5 * delta));
      controls.update(); renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); controls.dispose(); controlsRef.current = null;
      planetRef.current = null; surfaceRef.current = null; transitionRef.current = null;
      setSurfaceFrameRef.current = null; preloadSurfaceFrameRef.current = null; surfaceRequestRef.current += 1;
      preloadSurfaceTransitionRef.current = null;
      sceneDisposed = true;
      atmosphereRef.current = null; hazeRef.current = null; flashRef.current = null;
      moonRef.current = null; debrisCloudRef.current = null; craterRef.current = null;
      scene.traverse((object) => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) object.material.forEach((material) => { material.map?.dispose?.(); material.dispose(); });
        else if (object.material) { object.material.map?.dispose?.(); object.material.dispose(); }
      });
      for (const cached of textureCache.values()) {
        if (cached instanceof Promise) void cached.then((texture) => texture?.dispose());
        else cached.dispose();
      }
      textureCache.clear();
      renderer.dispose(); renderer.domElement.remove();
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const planet = planetRef.current;
    if (!host || !planet || !surfaceRef.current) return;
    host.dataset.mode = event.id;
    stageStartedRef.current = performance.now();
    stageElapsedRef.current = 0;
    stagePausedAtRef.current = playing ? null : performance.now();
    activeFrameRef.current = 0;
    const stageIndex = DEEP_TIME_EVENTS.findIndex((item) => item.id === event.id);
    const stageCount = Math.max(DEEP_TIME_EVENTS.length - 1, 1);
    const safeStageIndex = Math.max(stageIndex, 0);
    const previousTimelineIndex = previousTimelineIndexRef.current;
    const previousStageId = DEEP_TIME_EVENTS[previousTimelineIndex]?.id;
    const indexDelta = safeStageIndex - previousTimelineIndexRef.current;
    targetRotationRef.current += (indexDelta / stageCount) * Math.PI * 2;
    previousTimelineIndexRef.current = safeStageIndex;
    const cameraShots = {
      'earth-forms': [0.15, 0.2, 6.35], 'moon-forming': [-0.35, 0.45, 5.5],
      'early-oceans': [0.35, -0.08, 6.1], 'early-life': [-0.32, 0.15, 5.9],
      oxygen: [0.22, 0.38, 6.0], cryogenian: [-0.18, 0.34, 5.7],
      cambrian: [0.28, -0.12, 6.05], pangaea: [0.1, 0.28, 6.2],
      'permian-crisis': [-0.22, 0.1, 5.85], 'cretaceous-crisis': [0.05, 1.75, 5.4],
      'ice-age': [0.18, 0.12, 5.8], today: [0.15, 0.2, 6.35],
    };
    cameraShotRef.current.set(...(cameraShots[event.id] || cameraShots.today));
    cameraMoveUntilRef.current = performance.now() + 1800;
    const currentStageIndex = Math.max(stageIndex, 0);
    setSurfaceFrameRef.current?.(event.id, 0, stage, previousStageId);
    preloadSurfaceFrameRef.current?.(event.id, 1);
    const nextEvent = DEEP_TIME_EVENTS[currentStageIndex + 1];
    const priorEvent = DEEP_TIME_EVENTS[currentStageIndex - 1];
    if (nextEvent) {
      preloadSurfaceFrameRef.current?.(nextEvent.id, 0);
      preloadSurfaceTransitionRef.current?.(event.id, nextEvent.id);
    }
    if (priorEvent) preloadSurfaceTransitionRef.current?.(priorEvent.id, event.id);
    atmosphereRef.current?.color.set(stage.atmosphere);
    hazeRef.current?.color.set(stage.atmosphere);
    if (flashRef.current) flashRef.current.opacity = stage.impacts === 'extinction' ? 0.12 : 0;
  }, [event.id]);

  useEffect(() => {
    const now = performance.now();
    if (playing) {
      if (stagePausedAtRef.current !== null) {
        stageStartedRef.current = now;
        stagePausedAtRef.current = null;
      }
    } else if (wasPlayingRef.current && stagePausedAtRef.current === null) {
      stageElapsedRef.current += (now - stageStartedRef.current) / 1000;
      stagePausedAtRef.current = now;
    }
    wasPlayingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    if (!playing) return undefined;
    if (event.id === 'today') { setPlaying(false); return undefined; }
    const timer = window.setInterval(onNext, 8500);
    return () => window.clearInterval(timer);
  }, [playing, onNext, event.id, playbackRun]);

  const replayFromHere = () => {
    stageElapsedRef.current = 0;
    stageStartedRef.current = performance.now();
    stagePausedAtRef.current = null;
    setPlaying(true);
    setPlaybackRun((run) => run + 1);
  };

  return <section className="deep-time-globe deep-time-cinematic" aria-label="Voyage cinématique dans l’histoire de la Terre">
    <header className="deep-time-globe__header"><div><span>VOYAGE CINÉMATIQUE · CAMÉRA 3D</span><strong>{event.title}</strong></div>
      <div className="deep-time-globe__actions">
        <button type="button" onClick={() => setPlaying((value) => !value)} aria-pressed={playing} disabled={event.id === 'today' && !playing}>{event.id === 'today' ? 'Fin du voyage' : playing ? 'Ⅱ Pause' : '▶ Timelapse'}</button>
        <button type="button" onClick={replayFromHere} disabled={event.id === 'today'} aria-label="Revoir le time-lapse depuis ce repère">↻ Revoir</button>
        <button type="button" onClick={() => controlsRef.current?.reset()} aria-label="Recentrer la caméra">Recentrer</button>
      </div>
    </header>
    <div className="deep-time-globe__canvas deep-time-cinematic__canvas" ref={hostRef} data-mode={stage.impacts}>
      <div className="deep-time-cinematic__hud"><span>{event.badge}</span><strong>{stage.label}</strong><small>{event.age >= 1000 ? `${(event.age / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} milliards d’années` : `${event.age.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} millions d’années`}</small></div>
      <div className="deep-time-globe__hint">Glisser pour cadrer · molette ou pincement pour zoomer</div>
    </div>
    <p className="deep-time-globe__note">{stage.caption} Les textures photoréalistes du globe sont générées pour cette scène; les continents anciens sont schématiques, pas des photographies historiques.</p>
  </section>;
}
