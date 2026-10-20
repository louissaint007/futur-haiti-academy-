import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const CONFIG = {
  formation: {
    duration: 120,
    color: '#ffc76f',
    labels: {
      fr: ['Nuage moléculaire', 'Le gaz s’effondre', 'Protoétoile', 'Allumage de la fusion'],
      ht: ['Nyaj molekilè', 'Gaz la tonbe sou tèt li', 'Pwotoetwal', 'Fizyon an kòmanse'],
    },
    descriptions: {
      fr: ['Un vaste nuage froid de gaz et de poussière entoure la future étoile dans toutes les directions.', 'La gravité contracte le nuage. En tombant vers le centre, le gaz tourne progressivement dans un même sens.', 'La matière tombe vers la protoétoile depuis tout le nuage. La rotation courbe les trajectoires; une partie est absorbée et l’étoile grandit, tandis que le disque et l’enveloppe restent visibles.', 'La fusion s’allume. Le disque et l’enveloppe de gaz restants tournent autour de l’étoile dans le même sens.'],
      ht: ['Yon gwo nyaj gaz ak pousyè ki frèt antoure kote etwal la pral fòme a nan tout direksyon.', 'Gravite fè nyaj la vin pi piti. Pandan gaz la tonbe nan direksyon sant lan, li kòmanse vire nan menm sans lan.', 'Matyè a tonbe sou pwotoetwal la depi tout kote nan nyaj la. Wotasyon an koube trajektwa yo; etwal la absòbe yon pati nan gaz la, li grandi, epi disk la ak anvlòp la rete vizib.', 'Fizyon an kòmanse. Disk la ak anvlòp gaz ki rete yo kontinye vire toutotou etwal la nan menm sans lan.'],
    },
  },
  supernova: {
    duration: 36,
    color: '#85b8ff',
    labels: {
      fr: ['Étoile massive', 'Effondrement du cœur', 'Explosion en supernova', 'Nébuleuse et étoile à neutrons'],
      ht: ['Gwo etwal', 'Nwayo a tonbe', 'Eksplozyon sipènova', 'Nebilez ak etwal netwon'],
    },
    descriptions: {
      fr: ['Une étoile massive, inspirée de la catégorie bleue de l’application.', 'Le cœur perd son soutien et s’effondre en une fraction de seconde.', 'L’onde de choc propulse les couches externes dans l’espace.', 'Les débris s’étendent autour d’un reste compact, ici une étoile à neutrons.'],
      ht: ['Yon gwo etwal, enspire ak kategori etwal ble nan aplikasyon an.', 'Nwayo a pa jwenn sipò ankò epi li tonbe byen vit.', 'Ond chòk la pouse kouch deyò yo nan lespas.', 'Debri yo gaye toutotou yon rès konpak; isit la se yon etwal netwon.'],
    },
  },
};

const smoothstep = (value, start, end) => {
  const x = THREE.MathUtils.clamp((value - start) / (end - start), 0, 1);
  return x * x * (3 - 2 * x);
};

function makeSeededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makeParticleSprite() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
  gradient.addColorStop(0.24, 'rgba(255,255,255,0.5)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

function makeNebulaSprite() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  const smooth = value => value * value * (3 - 2 * value);
  const hash = (x, y) => {
    const value = Math.sin(x * 127.1 + y * 311.7 + 7719) * 43758.5453;
    return value - Math.floor(value);
  };
  const noise = (x, y, frequency) => {
    const px = x * frequency;
    const py = y * frequency;
    const ix = Math.floor(px);
    const iy = Math.floor(py);
    const fx = smooth(px - ix);
    const fy = smooth(py - iy);
    const top = THREE.MathUtils.lerp(hash(ix, iy), hash(ix + 1, iy), fx);
    const bottom = THREE.MathUtils.lerp(hash(ix, iy + 1), hash(ix + 1, iy + 1), fx);
    return THREE.MathUtils.lerp(top, bottom, fy);
  };
  const image = context.createImageData(128, 128);
  for (let y = 0; y < 128; y += 1) {
    for (let x = 0; x < 128; x += 1) {
      const u = (x / 127 - 0.5) * 2;
      const v = (y / 127 - 0.5) * 2;
      const turbulence = noise(u, v, 5) * 0.56 + noise(u, v, 11) * 0.29 + noise(u, v, 23) * 0.15;
      const radius = Math.sqrt(u * u + v * v) + (turbulence - 0.5) * 0.2;
      const envelope = 1 - smooth(THREE.MathUtils.clamp((radius - 0.22) / 0.85, 0, 1));
      const wisps = THREE.MathUtils.clamp((turbulence - 0.2) / 0.78, 0, 1);
      const alpha = Math.round(envelope * wisps * 190);
      const pixel = (y * 128 + x) * 4;
      image.data[pixel] = 255;
      image.data[pixel + 1] = 255;
      image.data[pixel + 2] = 255;
      image.data[pixel + 3] = alpha;
    }
  }
  context.putImageData(image, 0, 0);
  return new THREE.CanvasTexture(canvas);
}

function makeGlowMaterial(color, opacity = 0) {
  return new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: new THREE.Color(color) }, opacity: { value: opacity } },
    vertexShader: 'varying vec3 vViewNormal; void main(){ vViewNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 glowColor; uniform float opacity; varying vec3 vViewNormal; void main(){ float limb=1.0-abs(dot(normalize(vViewNormal),vec3(0.0,0.0,1.0))); float softGlow=pow(limb,2.1)*0.9+pow(limb,0.72)*0.035; gl_FragColor=vec4(glowColor,softGlow*opacity); }',
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
}

function makeStarField(seed = 2901) {
  const random = makeSeededRandom(seed);
  const positions = new Float32Array(500 * 3);
  for (let index = 0; index < 500; index += 1) {
    const radius = 7 + random() * 12;
    const theta = random() * Math.PI * 2;
    const y = (random() * 2 - 1) * 8;
    positions[index * 3] = Math.cos(theta) * radius;
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = Math.sin(theta) * radius;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: '#d9e9ff', size: 0.035, transparent: true, opacity: 0.7, sizeAttenuation: true, depthWrite: false });
  return { points: new THREE.Points(geometry, material), geometry, material };
}

function makeBirthCloud(sprite) {
  const random = makeSeededRandom(8317);
  // Keep the molecular cloud visibly full even at the widest camera distance.
  const count = 36000;
  const positions = new Float32Array(count * 3);
  const cloud = new Float32Array(count * 3);
  const target = new Float32Array(count * 3);
  const materialType = new Uint8Array(count);
  const orbitalRates = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const palette = ['#d86b63', '#eaa26e', '#ffd18d', '#aa8bc8', '#759ecb', '#c66c88'].map(value => new THREE.Color(value));
  const clumps = Array.from({ length: 9 }, () => {
    const theta = random() * Math.PI * 2;
    const z = random() * 2 - 1;
    const radial = Math.sqrt(1 - z * z);
    return new THREE.Vector3(Math.cos(theta) * radial, z * 0.75, Math.sin(theta) * radial).normalize();
  });
  for (let index = 0; index < count; index += 1) {
    const theta = random() * Math.PI * 2;
    const z = random() * 2 - 1;
    const radial = Math.sqrt(1 - z * z);
    const direction = new THREE.Vector3(Math.cos(theta) * radial, z, Math.sin(theta) * radial);
    if (random() < 0.64) direction.lerp(clumps[Math.floor(random() * clumps.length)], 0.35 + random() * 0.38);
    direction.normalize();
    const radius = 0.55 + Math.pow(random(), 0.78) * 5.35;
    const x = direction.x * radius;
    const y = direction.y * radius * 0.9;
    const zz = direction.z * radius;
    cloud.set([x, y, zz], index * 3);
    // Keep substantial material as both a flattened disk and a three-dimensional envelope.
    // The envelope is the surrounding molecular cloud; it does not all collapse into the star.
    const materialRoll = random();
    materialType[index] = materialRoll < 0.5 ? 0 : materialRoll < 0.7 ? 2 : 1;
    orbitalRates[index] = 0.28 + random() * 0.3;
    if (materialType[index] === 1) {
      const envelopeRadius = 2.4 + Math.pow(random(), 0.72) * 3.9;
      const envelopeTheta = random() * Math.PI * 2;
      const envelopeZ = random() * 2 - 1;
      const envelopeRadial = Math.sqrt(1 - envelopeZ * envelopeZ);
      target.set([
        Math.cos(envelopeTheta) * envelopeRadial * envelopeRadius,
        envelopeZ * envelopeRadius * 0.9,
        Math.sin(envelopeTheta) * envelopeRadial * envelopeRadius,
      ], index * 3);
    } else if (materialType[index] === 2) {
      const diskRadius = 1.9 + Math.pow(random(), 0.68) * 1.65;
      const diskAngle = random() * Math.PI * 2;
      target.set([
        Math.cos(diskAngle) * diskRadius,
        (random() * 2 - 1) * (0.32 + random() * 0.22),
        Math.sin(diskAngle) * diskRadius,
      ], index * 3);
    } else {
      const coreRadius = Math.pow(random(), 1.3) * 0.2;
      const coreTheta = random() * Math.PI * 2;
      const coreZ = random() * 2 - 1;
      const coreRadial = Math.sqrt(1 - coreZ * coreZ);
      target.set([
        Math.cos(coreTheta) * coreRadial * coreRadius,
        coreZ * coreRadius,
        Math.sin(coreTheta) * coreRadial * coreRadius,
      ], index * 3);
    }
    positions.set([x, y, zz], index * 3);
    const color = palette[Math.floor(random() * palette.length)].clone().lerp(new THREE.Color('#f5c99d'), random() * 0.28);
    const diskDim = materialType[index] === 2 ? 0.56 : 1;
    colors.set([color.r * diskDim, color.g * diskDim, color.b * diskDim], index * 3);
  }
  const geometry = new THREE.BufferGeometry();
  const positionAttribute = new THREE.BufferAttribute(positions, 3);
  positionAttribute.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position', positionAttribute);
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 0.17,
    map: sprite,
    vertexColors: true,
    transparent: true,
    opacity: 0.74,
    alphaTest: 0.02,
    depthWrite: false,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  return { points: new THREE.Points(geometry, material), geometry, material, cloud, target, materialType, orbitalRates, colors };
}

function makeEjecta(sprite, { seed = 5711, count = 5200, size = 0.14, opacity = 0 } = {}) {
  const random = makeSeededRandom(seed);
  const positions = new Float32Array(count * 3);
  const directions = new Float32Array(count * 3);
  const distances = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const palette = ['#34b9ff', '#42d9c2', '#925aff', '#ff4c98', '#ff7044', '#ffd15b', '#709bff'].map(value => new THREE.Color(value));
  const clumps = Array.from({ length: 11 }, () => {
    const theta = random() * Math.PI * 2;
    const z = random() * 2 - 1;
    const radial = Math.sqrt(1 - z * z);
    return new THREE.Vector3(Math.cos(theta) * radial, z, Math.sin(theta) * radial).normalize();
  });
  for (let index = 0; index < count; index += 1) {
    const theta = random() * Math.PI * 2;
    const z = random() * 2 - 1;
    const radial = Math.sqrt(1 - z * z);
    const direction = new THREE.Vector3(Math.cos(theta) * radial, z, Math.sin(theta) * radial);
    let clumpIndex = Math.floor(random() * clumps.length);
    if (random() < 0.74) {
      const clump = clumps[clumpIndex];
      direction.lerp(clump, 0.2 + random() * 0.58);
    }
    direction.x += (random() - 0.5) * 0.55;
    direction.y += (random() - 0.5) * 0.55;
    direction.z += (random() - 0.5) * 0.55;
    direction.normalize();
    directions.set(direction.toArray(), index * 3);
    distances[index] = Math.pow(random(), 0.68) * 4.1;
    const color = palette[clumpIndex % palette.length].clone().lerp(palette[(clumpIndex + 1) % palette.length], random() * 0.14);
    colors.set(color.toArray(), index * 3);
    positions.set([direction.x * 0.6, direction.y * 0.6, direction.z * 0.6], index * 3);
  }
  const geometry = new THREE.BufferGeometry();
  const positionAttribute = new THREE.BufferAttribute(positions, 3);
  positionAttribute.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position', positionAttribute);
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size,
    map: sprite,
    vertexColors: true,
    transparent: true,
    opacity,
    alphaTest: 0.02,
    depthWrite: false,
    sizeAttenuation: true,
    blending: size >= 0.3 ? THREE.NormalBlending : THREE.AdditiveBlending,
    toneMapped: false,
  });
  return { points: new THREE.Points(geometry, material), geometry, material, directions, distances };
}

export default function DeepSkySimulation({ scenario, locale = 'fr' }) {
  const config = CONFIG[scenario] || CONFIG.formation;
  const mountRef = useRef(null);
  const phaseRef = useRef(0);
  const runningRef = useRef(false);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(false);
  const title = scenario === 'formation'
    ? { fr: 'Naissance d’une étoile semblable au Soleil', ht: 'Nesans yon etwal tankou Solèy la' }[locale]
    : { fr: 'Explosion d’une étoile massive', ht: 'Eksplozyon yon gwo etwal' }[locale];
  const description = scenario === 'formation'
    ? { fr: 'Fais tourner et zoomer le nuage. Observe la gravité rassembler la matière, puis la protoétoile grandir en l’accrétant.', ht: 'Vire epi rale sou nyaj la. Gade gravite rasanble matyè a, epi pwotoetwal la ap grandi pandan l ap pran gaz la.' }[locale]
    : { fr: 'Fais tourner l’étoile massive, puis observe l’onde de choc et les débris se déployer.', ht: 'Vire gwo etwal la, epi gade ond chòk la ak debri yo ap gaye.' }[locale];
  const stepIndex = Math.min(3, Math.floor(phase * 4));
  const elapsed = Math.floor(phase * config.duration);
  const currentLabel = config.labels[locale][stepIndex];

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    runningRef.current = playing;
  }, [playing]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      const fallback = document.createElement('p');
      fallback.className = 'deep-sky-simulation-error';
      fallback.textContent = locale === 'fr' ? 'La simulation 3D ne peut pas démarrer sur ce navigateur.' : 'Similasyon 3D a pa ka demare nan navigatè sa a.';
      mount.appendChild(fallback);
      return undefined;
    }

    let disposed = false;
    let animationFrame = 0;
    let lastFrame = 0;
    let lastUiUpdate = 0;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 80);
    camera.position.set(0, scenario === 'formation' ? 2.3 : 0.65, scenario === 'formation' ? 8.3 : 7.1);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = scenario === 'formation' ? 1.9 : 3.2;
    controls.maxDistance = scenario === 'formation' ? 22 : 12;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.2));
    renderer.setSize(Math.max(mount.clientWidth, 1), Math.max(mount.clientHeight, 1), false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = 'deep-sky-simulation-canvas';
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute('aria-label', title);
    mount.appendChild(renderer.domElement);

    const starField = makeStarField();
    scene.add(starField.points);
    const sprite = makeParticleSprite();
    const starGeometry = new THREE.SphereGeometry(1, 72, 48);
    const starMaterial = new THREE.MeshBasicMaterial({ color: scenario === 'formation' ? '#ffe6a8' : '#92bfff', toneMapped: false });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(star);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(1.17, 48, 32), makeGlowMaterial(config.color, 0.18));
    scene.add(glow);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(1.55, 48, 32), makeGlowMaterial(config.color, 0.05));
    scene.add(halo);
    const texture = new THREE.TextureLoader().load('/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/sun-photosphere-texture.png', loaded => {
      if (disposed) {
        loaded.dispose();
        return;
      }
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      starMaterial.map = loaded;
      starMaterial.needsUpdate = true;
    });
    const birthCloud = scenario === 'formation' ? makeBirthCloud(sprite) : null;
    if (birthCloud) scene.add(birthCloud.points);
    const cloudSprite = scenario === 'supernova' ? makeNebulaSprite() : null;
    const ejecta = scenario === 'supernova' ? makeEjecta(sprite, { count: 2100, size: 0.085, opacity: 0 }) : null;
    const gasCloud = scenario === 'supernova' ? makeEjecta(cloudSprite, { seed: 9043, count: 540, size: 1.08, opacity: 0 }) : null;
    if (ejecta) scene.add(ejecta.points);
    if (gasCloud) scene.add(gasCloud.points);
    const shockwave = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), makeGlowMaterial('#ffac78', 0));
    if (scenario === 'supernova') scene.add(shockwave);

    const resize = () => {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(mount);
    window.addEventListener('resize', resize);

    const updateFormation = (progress, time) => {
      const collapse = smoothstep(progress, 0.06, 0.8);
      const accretion = smoothstep(progress, 0.12, 0.78);
      const ignition = smoothstep(progress, 0.82, 0.98);
      const radius = 0.035 + accretion * 0.55 + ignition * 0.13;
      const positions = birthCloud.geometry.attributes.position.array;
      const particleColors = birthCloud.geometry.attributes.color.array;
      for (let index = 0; index < birthCloud.cloud.length; index += 3) {
        const sourceRadius = Math.hypot(birthCloud.cloud[index], birthCloud.cloud[index + 1], birthCloud.cloud[index + 2]);
        const spin = time * birthCloud.orbitalRates[index / 3] * 0.00012 + collapse * (1.1 + 1.45 / (0.55 + sourceRadius));
        const cosSpin = Math.cos(spin);
        const sinSpin = Math.sin(spin);
        const sourceX = birthCloud.cloud[index] * cosSpin - birthCloud.cloud[index + 2] * sinSpin;
        const sourceZ = birthCloud.cloud[index] * sinSpin + birthCloud.cloud[index + 2] * cosSpin;
        const material = birthCloud.materialType[index / 3];
        const residualMaterial = material !== 0;
        // Infalling matter falls from its actual 3D cloud position along a
        // contracting, rotating path. Dust and gas not accreted remain in the
        // disk and the surrounding envelope.
        const orbit = time * birthCloud.orbitalRates[index / 3] * 0.00018;
        const targetX = birthCloud.target[index] * Math.cos(orbit) - birthCloud.target[index + 2] * Math.sin(orbit);
        const targetZ = birthCloud.target[index] * Math.sin(orbit) + birthCloud.target[index + 2] * Math.cos(orbit);
        if (!residualMaterial) {
          const targetRadius = Math.hypot(birthCloud.target[index], birthCloud.target[index + 1], birthCloud.target[index + 2]);
          const currentRadius = Math.hypot(sourceX, birthCloud.cloud[index + 1], sourceZ);
          const infallRadius = THREE.MathUtils.lerp(currentRadius, Math.max(targetRadius, radius * 0.82), accretion);
          const radialScale = infallRadius / Math.max(currentRadius, 0.001);
          positions[index] = sourceX * radialScale;
          // Preserve a genuine three-dimensional inflow. The cloud settles only
          // slightly toward the disk plane instead of flattening into a ring.
          positions[index + 1] = birthCloud.cloud[index + 1] * radialScale * (1 - collapse * 0.12);
          positions[index + 2] = sourceZ * radialScale;
          const heat = accretion * smoothstep(1 - currentRadius / 3.9, 0.18, 0.82) * 0.62;
          particleColors[index] = THREE.MathUtils.lerp(birthCloud.colors[index], 1, heat);
          particleColors[index + 1] = THREE.MathUtils.lerp(birthCloud.colors[index + 1], 0.62, heat);
          particleColors[index + 2] = THREE.MathUtils.lerp(birthCloud.colors[index + 2], 0.28, heat);
        } else {
          const mix = collapse;
          positions[index] = THREE.MathUtils.lerp(sourceX, targetX, mix);
          positions[index + 1] = THREE.MathUtils.lerp(birthCloud.cloud[index + 1], birthCloud.target[index + 1], mix);
          positions[index + 2] = THREE.MathUtils.lerp(sourceZ, targetZ, mix);
        }
      }
      birthCloud.geometry.attributes.position.needsUpdate = true;
      birthCloud.geometry.attributes.color.needsUpdate = true;
      star.scale.setScalar(radius);
      glow.scale.setScalar(radius * (1.35 + Math.sin(time * 0.002) * 0.035));
      halo.scale.setScalar(radius * 1.42);
      glow.material.uniforms.opacity.value = 0.1 + accretion * 0.12 + ignition * 0.1;
      halo.material.uniforms.opacity.value = 0.012 + accretion * 0.015 + ignition * 0.035;
      glow.material.uniforms.glowColor.value.set('#e88d63').lerp(new THREE.Color('#ffc76f'), ignition);
      starMaterial.color.set('#e98a5e').lerp(new THREE.Color('#ffe6a8'), ignition);
      star.rotation.y += 0.002 + accretion * 0.004;
    };

    const updateSupernova = (progress, time) => {
      const collapse = smoothstep(progress, 0.28, 0.43);
      const blast = smoothstep(progress, 0.38, 0.68);
      const settling = smoothstep(progress, 0.78, 1);
      const peak = Math.exp(-Math.pow((progress - 0.48) / 0.075, 2));
      const radius = THREE.MathUtils.lerp(0.72, 0.085, collapse);
      star.scale.setScalar(radius);
      starMaterial.color.set('#8dbdff').lerp(new THREE.Color('#fff0ce'), peak);
      glow.material.uniforms.glowColor.value.set('#71aaff').lerp(new THREE.Color('#fff0cf'), peak);
      glow.scale.setScalar(radius * (1.35 + peak * 1.5));
      glow.material.uniforms.opacity.value = 0.18 + peak * 0.65 + blast * (1 - settling) * 0.1;
      halo.scale.setScalar(radius * (1.8 + peak * 1.8 + blast * 5.4));
      halo.material.opacity = 0.04 + peak * 0.3 + blast * (1 - settling) * 0.025;
      star.rotation.y += 0.007;
      if (ejecta) {
        const positions = ejecta.geometry.attributes.position.array;
        const expansion = smoothstep(progress, 0.41, 0.76);
        [ejecta, gasCloud].filter(Boolean).forEach((layer, layerIndex) => {
          const layerPositions = layer.geometry.attributes.position.array;
          const layerExpansion = layerIndex === 0 ? expansion : smoothstep(progress, 0.39, 0.7);
          const offset = layerIndex === 0 ? 0 : time * 0.000045;
          for (let index = 0; index < layer.distances.length; index += 1) {
            const base = index * 3;
          // Start the ejecta inside the collapsed core. The star occludes it until it crosses the photosphere.
          const distance = 0.018 + layer.distances[index] * layerExpansion;
            const twist = offset * (layer.directions[base + 1] * 0.7 + 0.4);
            const dx = layer.directions[base];
            const dz = layer.directions[base + 2];
            layerPositions[base] = (dx * Math.cos(twist) - dz * Math.sin(twist)) * distance;
            layerPositions[base + 1] = layer.directions[base + 1] * distance;
            layerPositions[base + 2] = (dx * Math.sin(twist) + dz * Math.cos(twist)) * distance;
          }
          layer.geometry.attributes.position.needsUpdate = true;
          layer.material.opacity = layerIndex === 0
            ? blast * (1 - settling * 0.16)
            : blast * (1 - settling * 0.35) * 0.86;
        });
      }
      if (scenario === 'supernova') {
        const shellRadius = 0.35 + blast * 4.8;
        shockwave.scale.setScalar(shellRadius);
        shockwave.material.uniforms.opacity.value = blast * (1 - settling) * 0.64;
        shockwave.rotation.y += 0.001;
      }
    };

    const render = time => {
      if (disposed) return;
      const delta = lastFrame ? Math.min((time - lastFrame) / 1000, 0.05) : 0;
      lastFrame = time;
      if (runningRef.current) {
        phaseRef.current = Math.min(1, phaseRef.current + delta / config.duration);
        if (phaseRef.current >= 1) {
          runningRef.current = false;
          setPlaying(false);
        }
      }
      const progress = phaseRef.current;
      if (scenario === 'formation') updateFormation(progress, time);
      else updateSupernova(progress, time);
      controls.update();
      renderer.render(scene, camera);
      if (time - lastUiUpdate > 140 || progress >= 1) {
        lastUiUpdate = time;
        setPhase(progress);
      }
      animationFrame = window.requestAnimationFrame(render);
    };
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resize);
      controls.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      glow.geometry.dispose();
      glow.material.dispose();
      halo.geometry.dispose();
      halo.material.dispose();
      starField.geometry.dispose();
      starField.material.dispose();
      sprite.dispose();
      cloudSprite?.dispose();
      texture.dispose();
      birthCloud?.geometry.dispose();
      birthCloud?.material.dispose();
      ejecta?.geometry.dispose();
      ejecta?.material.dispose();
      gasCloud?.geometry.dispose();
      gasCloud?.material.dispose();
      shockwave.geometry.dispose();
      shockwave.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [scenario, locale, config.duration, config.color, title]);

  const togglePlayback = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (phaseRef.current >= 1) phaseRef.current = 0;
    setPhase(phaseRef.current);
    setPlaying(true);
  };

  const reset = () => {
    phaseRef.current = 0;
    setPhase(0);
    setPlaying(false);
  };

  const seek = value => {
    const nextPhase = Number(value) / 100;
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
    if (nextPhase >= 1) setPlaying(false);
  };

  return <section id={'deep-sky-simulation-' + scenario} className={'deep-sky-simulation-card ' + scenario} aria-label={title}>
    <header className="deep-sky-simulation-heading">
      <div><span className="deep-sky-simulation-tag">{locale === 'fr' ? 'SIMULATION 3D MANIPULABLE' : 'SIMILASYON 3D OU KA MANYEN'}</span><h3>{title}</h3><p>{description}</p></div>
      <span className="deep-sky-simulation-duration">{scenario === 'formation' ? (locale === 'fr' ? '≈ 2 min' : '≈ 2 min') : (locale === 'fr' ? '≈ 36 s' : '≈ 36 s')}</span>
    </header>
    <div className="deep-sky-simulation-viewport">
      <div className="deep-sky-simulation-canvas-mount" ref={mountRef}/>
      <div className="deep-sky-simulation-stage-label"><span>{currentLabel}</span><p>{config.descriptions[locale][stepIndex]}</p></div>
      <span className="deep-sky-simulation-hint">{locale === 'fr' ? 'Glisser pour tourner · pincement pour zoomer' : 'Trennen pou vire · pense pou rale'}</span>
    </div>
    <div className="deep-sky-simulation-timeline" aria-label={locale === 'fr' ? 'Étapes de la simulation' : 'Etap similasyon an'}>
      {config.labels[locale].map((label, index) => <button type="button" key={label} className={index === stepIndex ? 'active' : ''} aria-current={index === stepIndex ? 'step' : undefined} onClick={() => seek(index / 3 * 100)}>{index + 1}<span>{label}</span></button>)}
    </div>
    <input className="deep-sky-simulation-range" type="range" min="0" max="100" step="1" value={Math.round(phase * 100)} aria-label={locale === 'fr' ? 'Progression de la simulation' : 'Pwogrè similasyon an'} onChange={event => seek(event.target.value)}/>
    <div className="deep-sky-simulation-controls">
      <div><button type="button" className="deep-sky-simulation-play" onClick={togglePlayback}>{playing ? (locale === 'fr' ? 'Pause' : 'Poz') : (phase >= 1 ? (locale === 'fr' ? 'Revoir' : 'Gade ankò') : (phase > 0 ? (locale === 'fr' ? 'Reprendre' : 'Kontinye') : (locale === 'fr' ? 'Lancer la simulation' : 'Kòmanse similasyon an')))}</button><button type="button" className="deep-sky-simulation-reset" onClick={reset}>{locale === 'fr' ? 'Recommencer' : 'Rekòmanse'}</button></div>
      <span>{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')} / {String(Math.floor(config.duration / 60)).padStart(2, '0')}:{String(config.duration % 60).padStart(2, '0')}</span>
    </div>
    <p className="deep-sky-simulation-caveat">{scenario === 'formation'
      ? { fr: 'La formation réelle prend des millions d’années; les 2 minutes accélèrent les grandes étapes. Les dimensions et les mouvements sont agrandis pour apprendre.', ht: 'Vrè fòmasyon an pran plizyè milyon ane; 2 minit sa yo akselere gwo etap yo. Nou agrandi gwosè ak mouvman yo pou ede aprann.' }[locale]
      : { fr: 'La scène s’inspire de l’évolution d’une étoile massive. Le Soleil ne terminera pas sa vie en supernova; les couleurs et vitesses sont schématiques.', ht: 'Sèn nan enspire ak evolisyon yon gwo etwal. Solèy la pap fini lavi li nan sipènova; koulè ak vitès yo fèt pou bay yon lide.' }[locale]}
    </p>
    <a className="deep-sky-simulation-source" href={scenario === 'formation' ? 'https://science.nasa.gov/exoplanets/stars/' : 'https://svs.gsfc.nasa.gov/20413/'} target="_blank" rel="noreferrer">NASA · {locale === 'fr' ? 'voir la référence scientifique' : 'gade sous syantifik la'} ↗</a>
  </section>;
}
