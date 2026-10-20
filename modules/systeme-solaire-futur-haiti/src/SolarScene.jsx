import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { celestialBodies } from './data/planets.js';
import { dwarfPlanets } from './data/dwarfPlanets.js';

const MOON_COLOR_MAP = '/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/moon-lroc-color-2k.jpg';
const MOON_ELEVATION_MAP = '/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/moon-lola-elevation-1k.jpg';

function random(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function makePlanetTexture(body) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const rand = random(body.id.split('').reduce((sum, letter) => sum + letter.charCodeAt(0), 7));
  ctx.fillStyle = body.texture === 'earth' ? '#12659c' : body.texture === 'moon' ? '#aaa9a2' : body.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (body.texture === 'earth') {
    const land = ['#41865e', '#579568', '#8a9b5f', '#3b775a'];
    const shapes = [
      [160, 170, 85, 95], [238, 260, 58, 115], [360, 135, 115, 70],
      [425, 290, 75, 145], [575, 165, 92, 74], [653, 300, 80, 96],
      [760, 170, 112, 112], [826, 278, 53, 135], [895, 125, 55, 60],
    ];
    shapes.forEach(([cx, cy, rx, ry], index) => {
      ctx.beginPath();
      const points = 42;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const wobble = 0.78 + rand() * 0.34;
        const x = cx + Math.cos(angle) * rx * wobble;
        const y = cy + Math.sin(angle) * ry * wobble;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = land[index % land.length];
      ctx.fill();
    });
    ctx.fillStyle = 'rgba(245,250,255,.75)';
    ctx.fillRect(0, 0, 1024, 18);
    ctx.fillRect(0, 494, 1024, 18);
  } else if (['jupiter', 'saturn', 'uranus', 'neptune', 'venus'].includes(body.texture)) {
    const bandColors = body.texture === 'jupiter'
      ? ['#bb7859', '#ecd2a9', '#c68e69', '#f0dcc0', '#a9684d', '#dcc19e']
      : body.texture === 'saturn'
        ? ['#b78e5f', '#ead2a0', '#c6a174', '#f2dfb8', '#a9855f']
        : body.texture === 'venus'
          ? ['#d7b577', '#f0d59e', '#c99e66', '#e7c789']
          : ['#58b5c5', '#a4e0dc', '#54a6bd', '#b2e2db'];
    let y = 0;
    while (y < canvas.height) {
      const bandHeight = 14 + rand() * 48;
      const shade = bandColors[Math.floor(rand() * bandColors.length)];
      ctx.globalAlpha = 0.54 + rand() * 0.36;
      ctx.fillStyle = shade;
      ctx.fillRect(0, y, canvas.width, bandHeight + 2);
      ctx.globalAlpha = 1;
      if (body.texture === 'jupiter' && rand() > 0.87) {
        ctx.beginPath();
        ctx.ellipse(590 + rand() * 210, y + bandHeight / 2, 40 + rand() * 35, 14 + rand() * 18, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#a94e39';
        ctx.fill();
      }
      y += bandHeight;
    }
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 1024, 512);
    gradient.addColorStop(0, body.color);
    gradient.addColorStop(0.48, '#282b31');
    gradient.addColorStop(1, body.color);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 1800; i++) {
      const x = rand() * 1024;
      const y = rand() * 512;
      const r = body.texture === 'mars' ? 1 + rand() * 5 : 1 + rand() * 3;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(20,16,15,' + (0.12 + rand() * 0.4) + ')';
      ctx.fill();
      if (body.texture === 'mars' && rand() > 0.94) {
        ctx.beginPath();
        ctx.arc(x - 2, y - 2, r * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245,182,133,.46)';
        ctx.fill();
      }
    }
  }

  if (body.texture === 'earth') {
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 1500; i++) {
      const x = rand() * canvas.width;
      const y = rand() * canvas.height;
      const length = 5 + rand() * 40;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + length * 0.5, y - 2 - rand() * 4, x + length, y + rand() * 3);
      ctx.strokeStyle = `rgba(235,246,255,${0.035 + rand() * 0.11})`;
      ctx.lineWidth = 0.7 + rand() * 2.8;
      ctx.stroke();
    }
    ctx.restore();
  } else if (['jupiter', 'saturn', 'uranus', 'neptune', 'venus'].includes(body.texture)) {
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 14000; i++) {
      const x = rand() * canvas.width;
      const y = rand() * canvas.height;
      const length = 4 + rand() * (body.texture === 'jupiter' ? 66 : 44);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + length, y + (rand() - 0.5) * 2.4);
      ctx.strokeStyle = rand() > 0.52 ? 'rgba(255,239,207,.12)' : 'rgba(45,35,29,.09)';
      ctx.lineWidth = 0.45 + rand() * 1.35;
      ctx.stroke();
      if (x + length > canvas.width) {
        ctx.beginPath();
        ctx.moveTo(x - canvas.width, y);
        ctx.lineTo(x + length - canvas.width, y + (rand() - 0.5) * 2.4);
        ctx.stroke();
      }
    }
    ctx.restore();
  } else {
    ctx.save();
    for (let i = 0; i < 900; i++) {
      const x = rand() * canvas.width;
      const y = rand() * canvas.height;
      const radius = 1.5 + rand() * (body.texture === 'mars' ? 8 : 6);
      const crater = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.35, radius * 0.12, x, y, radius);
      crater.addColorStop(0, 'rgba(20,15,13,.34)');
      crater.addColorStop(0.68, 'rgba(38,27,22,.20)');
      crater.addColorStop(0.88, 'rgba(238,199,158,.20)');
      crater.addColorStop(1, 'rgba(25,20,18,0)');
      ctx.fillStyle = crater;
      ctx.beginPath();
      ctx.ellipse(x, y, radius * (0.7 + rand() * 0.6), radius * (0.45 + rand() * 0.4), (rand() - 0.5) * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createStarfield(scene) {
  const rand = random(82341);
  const positions = new Float32Array(2300 * 3);
  const colors = new Float32Array(2300 * 3);
  for (let i = 0; i < 2300; i++) {
    const radius = 70 + rand() * 160;
    const theta = rand() * Math.PI * 2;
    positions[i * 3] = Math.cos(theta) * radius;
    positions[i * 3 + 1] = (rand() - 0.5) * 170;
    positions[i * 3 + 2] = Math.sin(theta) * radius;
    const tint = rand();
    colors[i * 3] = 0.66 + tint * 0.34;
    colors[i * 3 + 1] = 0.75 + tint * 0.25;
    colors[i * 3 + 2] = 0.9 + tint * 0.1;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({
    size: 0.19, vertexColors: true, transparent: true, opacity: 0.86, sizeAttenuation: true,
  })));
}

function createAsteroidBelt(scene) {
  const rand = random(4990);
  const positions = new Float32Array(420 * 3);
  const colors = new Float32Array(420 * 3);
  for (let i = 0; i < 420; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = 14.45 + rand() * 1.45;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (rand() - 0.5) * 0.46;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
    const shade = 0.28 + rand() * 0.34;
    colors[i * 3] = shade;
    colors[i * 3 + 1] = shade * 0.83;
    colors[i * 3 + 2] = shade * 0.7;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({
    size: 0.09, vertexColors: true, transparent: true, opacity: 0.72,
  })));
}

function makeGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,180,88,.72)');
  gradient.addColorStop(0.28, 'rgba(255,115,45,.23)');
  gradient.addColorStop(1, 'rgba(255,100,25,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

function createSun(scene) {
  const sunMaterial = new THREE.MeshBasicMaterial({ color: '#fff4dc', toneMapped: false });
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(1.62, 72, 72),
    sunMaterial,
  );
  sun.userData.bodyId = 'sun';
  scene.add(sun);
  // Texture illustrative générée pour la scène; l'image SDO de la galerie reste la référence NASA réelle.
  new THREE.TextureLoader().load('/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/sun-photosphere-texture.png', texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.wrapS = THREE.RepeatWrapping;
    if (sunMaterial.userData.disposed) {
      texture.dispose();
      return;
    }
    sunMaterial.map = texture;
    sunMaterial.needsUpdate = true;
  });
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(2.02, 32, 32),
    new THREE.ShaderMaterial({
      vertexShader: 'varying vec3 vNormal; void main(){ vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: 'varying vec3 vNormal; void main(){ float rim=pow(0.72-dot(vNormal,vec3(0.0,0.0,1.0)),2.2); gl_FragColor=vec4(1.0,0.39,0.09,rim*0.46); }',
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.BackSide,
    }),
  ));
  scene.add(new THREE.PointLight('#ffd28a', 240, 110, 1.7));
  const corona = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeGlowTexture(), color: '#ff9d50', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  corona.scale.set(16, 16, 1);
  scene.add(corona);
  return sun;
}

function createOrbit(scene, radius) {
  const geometry = new THREE.BufferGeometry();
  const points = [];
  for (let i = 0; i < 240; i++) {
    const angle = (i / 240) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }
  geometry.setFromPoints(points);
  scene.add(new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({
    color: '#b5c9fa', transparent: true, opacity: 0.15,
  })));
}

function makePlanet(body, scene, onSelect) {
  const pivot = new THREE.Group();
  pivot.rotation.y = body.phase;
  scene.add(pivot);
  const group = new THREE.Group();
  group.position.x = body.orbit;
  group.rotation.z = body.id === 'uranus' ? 1.34 : body.id === 'earth' ? 0.41 : 0.03;
  group.userData.bodyId = body.id;
  pivot.add(group);
  const planetMaterial = new THREE.MeshStandardMaterial({
    map: body.id === 'moon' ? null : makePlanetTexture(body), roughness: body.id === 'earth' ? 0.82 : 0.73,
    metalness: 0.02, emissive: new THREE.Color(body.color),
    emissiveIntensity: body.id === 'earth' ? 0.055 : 0.018,
  });
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(body.radius, body.id === 'moon' ? 160 : 64, body.id === 'moon' ? 120 : 48),
    planetMaterial,
  );
  if (body.id === 'moon') {
    new THREE.TextureLoader().load(MOON_COLOR_MAP, texture => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      texture.wrapS = THREE.RepeatWrapping;
      if (planetMaterial.userData.disposed) {
        texture.dispose();
        return;
      }
      planetMaterial.map = texture;
      planetMaterial.color.set('#ffffff');
      planetMaterial.needsUpdate = true;
    });
    new THREE.TextureLoader().load(MOON_ELEVATION_MAP, texture => {
      texture.anisotropy = 2;
      texture.wrapS = THREE.RepeatWrapping;
      if (planetMaterial.userData.disposed) {
        texture.dispose();
        return;
      }
      // Keep relief in the material shader; vertex displacement on this
      // scene is unnecessary and needlessly expensive for the small Moon.
      planetMaterial.bumpMap = texture;
      planetMaterial.bumpScale = body.radius * 0.055;
      planetMaterial.needsUpdate = true;
    });
  }
  if (body.id === 'earth') {
    new THREE.TextureLoader().load('/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/earth-surface-texture.png', texture => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      texture.wrapS = THREE.RepeatWrapping;
      if (planetMaterial.userData.disposed) {
        texture.dispose();
        return;
      }
      const previousMap = planetMaterial.map;
      planetMaterial.map = texture;
      planetMaterial.needsUpdate = true;
      previousMap?.dispose();
    });
  }
  sphere.userData.bodyId = body.id;
  group.add(sphere);
  const hitArea = new THREE.Mesh(
    new THREE.SphereGeometry(body.radius * 1.46, 18, 18),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  hitArea.userData.bodyId = body.id;
  group.add(hitArea);

  if (body.id === 'saturn') {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(body.radius * 1.28, body.radius * 2.15, 72),
      new THREE.MeshStandardMaterial({
        color: '#dcc394', roughness: 0.92, metalness: 0.03,
        side: THREE.DoubleSide, transparent: true, opacity: 0.9,
      }),
    );
    ring.rotation.x = Math.PI / 2 - 0.34;
    ring.userData.bodyId = body.id;
    group.add(ring);
    const gap = new THREE.Mesh(
      new THREE.RingGeometry(body.radius * 1.61, body.radius * 1.68, 72),
      new THREE.MeshBasicMaterial({ color: '#111727', side: THREE.DoubleSide }),
    );
    gap.rotation.copy(ring.rotation);
    group.add(gap);
  }
  if (body.id === 'earth') {
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(body.radius * 1.018, 32, 32),
      new THREE.MeshStandardMaterial({ color: '#eaf8ff', transparent: true, opacity: 0.13, roughness: 1 }),
    ));
    const moonPivot = new THREE.Group();
    group.add(moonPivot);
    const moonMaterial = new THREE.MeshStandardMaterial({ roughness:1, metalness:0 });
    const moon = new THREE.Mesh(new THREE.SphereGeometry(0.105, 32, 24), moonMaterial);
    new THREE.TextureLoader().load(MOON_COLOR_MAP, texture => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      texture.wrapS = THREE.RepeatWrapping;
      if (moonMaterial.userData.disposed) { texture.dispose(); return; }
      moonMaterial.map = texture;
      moonMaterial.color.set('#ffffff');
      moonMaterial.needsUpdate = true;
    });
    moon.position.set(0.87, 0.1, 0); moon.userData.bodyId = 'moon'; moonPivot.add(moon);
    const moonHit = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
    moonHit.position.copy(moon.position); moonHit.userData.bodyId='moon'; moonPivot.add(moonHit);
    group.userData.moonPivot = moonPivot;
    group.userData.moon = moon;
  }
  const label = document.createElement('button');
  label.className = 'planet-label planet-label-' + body.id;
  label.type = 'button';
  label.textContent = body.name.fr.toUpperCase();
  label.setAttribute('aria-label', 'Explorer ' + body.name.fr);
  label.addEventListener('click', event => {
    event.stopPropagation();
    onSelect(body.id);
  });
  const labelObject = new CSS2DObject(label);
  labelObject.position.set(0, body.radius * (body.id === 'saturn' ? 2.45 : 1.7), 0);
  group.add(labelObject);
    return { body, pivot, group, sphere, moon:group.userData.moon || null };
}

export default function SolarScene({ selectedId, onSelect, visibleDwarfPlanets = dwarfPlanets, timeScale, isPaused, focusRequest, viewId = 'orbit', viewRequest = 0, showLabels = true, followPlanet = true, locale = 'fr' }) {
  const mountRef = useRef(null);
  const stateRef = useRef({ selectedId, onSelect, timeScale, isPaused, focusRequest, viewId, viewRequest, showLabels, followPlanet, locale });
  stateRef.current = { selectedId, onSelect, timeScale, isPaused, focusRequest, viewId, viewRequest, showLabels, followPlanet, locale };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch {
      mount.innerHTML = '<div class="webgl-error"><strong>La scène 3D ne peut pas démarrer sur ce navigateur.</strong><span>Activez l’accélération graphique dans Chrome ou Edge, puis rechargez la page.</span></div>';
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712');
    const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 420);
    camera.position.set(0, 49, 79);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
    controls.minDistance = 2.1;
    controls.maxDistance = 125;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.target.set(0, 0, 0);
    controls.update();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.45));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    renderer.domElement.className = 'solar-canvas';
    renderer.domElement.setAttribute('aria-label', 'Scène 3D interactive du système solaire');
    renderer.domElement.tabIndex = 0;
    mount.appendChild(renderer.domElement);
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(mount.clientWidth, mount.clientHeight);
    labelRenderer.domElement.className = 'solar-label-layer';
    mount.appendChild(labelRenderer.domElement);

    scene.add(new THREE.AmbientLight('#7994c4', 0.22));
    scene.add(new THREE.HemisphereLight('#6883bb', '#100e18', 0.22));
    createStarfield(scene);
    createAsteroidBelt(scene);
    const allBodies = [...celestialBodies, ...visibleDwarfPlanets];
    allBodies.forEach(body => createOrbit(scene, body.orbit));
    const sun = createSun(scene);
    const callback = { current: stateRef.current.onSelect };
    const bodies = allBodies.map(body => makePlanet(body, scene, id => callback.current(id)));
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerStart = null;
    const selectable = [sun, ...bodies.flatMap(item => [...item.group.children.filter(child => child.userData.bodyId), ...(item.moon ? item.group.userData.moonPivot.children : [])])];
    const onDown = event => { pointerStart = [event.clientX, event.clientY]; };
    const onUp = event => {
      if (!pointerStart || Math.hypot(event.clientX - pointerStart[0], event.clientY - pointerStart[1]) > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(selectable, false)[0];
      if (hit?.object.userData.bodyId) callback.current(hit.object.userData.bodyId);
    };
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);
    const resize = new ResizeObserver(() => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      labelRenderer.setSize(width, height);
    });
    resize.observe(mount);

    let previousTime = 0;
    let animationId = 0;
    let lastFocus = 0;
    let lastViewRequest = 0;
    let tween = null;
    let followedBodyId = null;
    const viewDirections = {
      orbit: new THREE.Vector3(0.38, 0.31, 1).normalize(),
      top: new THREE.Vector3(0.05, 0.97, 0.24).normalize(),
      side: new THREE.Vector3(1, 0.12, 0.08).normalize(),
      close: new THREE.Vector3(0.38, 0.31, 1).normalize(),
      wide: new THREE.Vector3(-0.45, 0.52, 1).normalize(),
    };
    const resolveTarget = id => {
      if (id === 'moon') {
        const earth = bodies.find(item => item.body.id === 'earth');
        return earth ? { ...earth, body: { ...earth.body, id: 'moon', radius: 0.105 }, targetObject: earth.moon } : null;
      }
      const item = bodies.find(body => body.body.id === id);
      return item ? { ...item, targetObject: item.group } : null;
    };
    const targetPosition = targetBody => targetBody?.targetObject?.getWorldPosition(new THREE.Vector3()) || new THREE.Vector3(0,0,0);
    const cameraDestination = (targetBody, target, activeView) => {
      const normalDistance = targetBody ? (targetBody.body.id === 'moon' ? 3.2 : Math.max(4.7, targetBody.body.radius * 8 + (targetBody.body.id === 'saturn' ? 3.8 : 2.6))) : 86;
      const distance = activeView === 'close'
        ? targetBody ? (targetBody.body.id === 'moon' ? 2.35 : Math.max(5.5, targetBody.body.radius * 5 + 2)) : 24
        : activeView === 'wide' ? targetBody ? Math.max(38, normalDistance * 2.1) : 110
          : normalDistance;
      return target.clone().addScaledVector(viewDirections[activeView] || viewDirections.orbit, distance);
    };
    const frame = now => {
      animationId = requestAnimationFrame(frame);
      const delta = Math.min((now - previousTime) / 1000 || 0, 0.05);
      previousTime = now;
      const current = stateRef.current;
      callback.current = current.onSelect;
      bodies.forEach(({ body, group }) => {
        const label = group.children.find(child => child.isCSS2DObject)?.element;
        if (label && label.dataset.locale !== current.locale) {
          label.textContent = body.name[current.locale].toUpperCase();
          label.setAttribute('aria-label', (current.locale === 'fr' ? 'Explorer ' : 'Eksplore ') + body.name[current.locale]);
          label.dataset.locale = current.locale;
        }
      });
      if (current.focusRequest !== lastFocus) {
        lastFocus = current.focusRequest;
        const targetBody = resolveTarget(current.selectedId);
        followedBodyId = current.followPlanet ? targetBody?.body.id ?? null : null;
        const isSun = current.selectedId === 'sun';
        const target = targetPosition(targetBody);
        // Selection should feel immediate: place the camera on the selected
        // body's viewing position in this frame, then track its motion below.
        camera.position.copy(isSun
          ? target.clone().addScaledVector(viewDirections[current.viewId] || viewDirections.orbit, 9)
          : cameraDestination(targetBody, target, current.viewId));
        controls.target.copy(target);
        tween = null;
      }
      if (current.viewRequest !== lastViewRequest) {
        lastViewRequest = current.viewRequest;
        const targetBody = current.followPlanet ? resolveTarget(current.selectedId) : null;
        const target = targetBody
          ? targetPosition(targetBody)
          : current.followPlanet && current.selectedId === 'sun' ? new THREE.Vector3(0, 0, 0) : controls.target.clone();
        tween = {
          start: performance.now(), duration: 850,
          fromCamera: camera.position.clone(), toCamera: cameraDestination(targetBody, target, current.viewId),
          fromTarget: controls.target.clone(), toTarget: target,
        };
      }
      if (tween) {
        const progress = Math.min((performance.now() - tween.start) / tween.duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        camera.position.lerpVectors(tween.fromCamera, tween.toCamera, eased);
        controls.target.lerpVectors(tween.fromTarget, tween.toTarget, eased);
        if (progress >= 1) tween = null;
      }
      bodies.forEach(({ body, pivot, group }) => {
        if (!current.isPaused) {
          pivot.rotation.y += delta * (0.44 / body.orbitYears) * current.timeScale;
          group.children[0].rotation.y += delta * 0.1;
          if (group.userData.moonPivot) group.userData.moonPivot.rotation.y += delta * 0.75 * current.timeScale;
        }
      });
      const selectedBody = resolveTarget(current.selectedId);
      followedBodyId = current.followPlanet ? selectedBody?.body.id ?? null : null;
      if (followedBodyId && !tween) {
        const followed = resolveTarget(followedBodyId);
        if (followed) {
          const position = targetPosition(followed);
          const shift = position.sub(controls.target);
          camera.position.add(shift);
          controls.target.add(shift);
        }
      }
      sun.rotation.y += delta * 0.025;
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
      labelRenderer.domElement.style.display = current.showLabels ? 'block' : 'none';
    };
    frame(0);

    return () => {
      cancelAnimationFrame(animationId);
      resize.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      controls.dispose();
      scene.traverse(object => {
        object.geometry?.dispose?.();
        const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
        materials.forEach(material => {
          material.userData.disposed = true;
          new Set([material.map, material.displacementMap, material.bumpMap]).forEach(texture => texture?.dispose());
          material.dispose();
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
      labelRenderer.domElement.remove();
    };
  }, [visibleDwarfPlanets.map(body => body.id).join('|')]);

  return <div className="solar-scene" ref={mountRef} />;
}
