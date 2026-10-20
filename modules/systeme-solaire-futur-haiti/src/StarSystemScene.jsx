import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function random(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function makeSurfaceTexture(color, seed, star = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  const rand = random(seed);
  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const glow = context.createLinearGradient(0, 0, 512, 0);
  glow.addColorStop(0, '#121521');
  glow.addColorStop(0.3, '#ffffff22');
  glow.addColorStop(0.62, '#ffffff08');
  glow.addColorStop(1, '#090d19');
  context.fillStyle = glow;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const count = star ? 5200 : 1100;
  for (let index = 0; index < count; index += 1) {
    const radius = star ? 0.35 + rand() * 1.7 : 0.45 + rand() * 3;
    context.beginPath();
    context.ellipse(rand() * 512, rand() * 256, radius * (star ? 1.7 : 2.4), radius, rand(), 0, Math.PI * 2);
    context.fillStyle = `rgba(${star ? '255,245,220' : '25,25,32'},${star ? 0.035 + rand() * 0.12 : 0.05 + rand() * 0.16})`;
    context.fill();
  }
  if (star) {
    for (let index = 0; index < 36; index += 1) {
      const x = rand() * 512;
      const y = rand() * 256;
      const radius = 2 + rand() * 8;
      const flare = context.createRadialGradient(x, y, 0, x, y, radius);
      flare.addColorStop(0, '#fff7dfc9');
      flare.addColorStop(0.35, '#fff2bb42');
      flare.addColorStop(1, '#fff2bb00');
      context.fillStyle = flare;
      context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 2, 64, 64, 64);
  gradient.addColorStop(0, '#fff6d9bb');
  gradient.addColorStop(0.18, '#ffd47d88');
  gradient.addColorStop(0.45, '#ff9d4c36');
  gradient.addColorStop(1, '#ff8c3c00');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

export default function StarSystemScene({ system, locale = 'fr', onSelectPlanet }) {
  const mountRef = useRef(null);
  const selectRef = useRef(onSelectPlanet);
  useEffect(() => { selectRef.current = onSelectPlanet; }, [onSelectPlanet]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !system) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030711');
    scene.fog = new THREE.FogExp2('#030711', 0.018);
    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 120);
    camera.position.set(0, 4.5, 10.5);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.className = 'star-system-canvas';
    renderer.domElement.setAttribute('aria-label', `${system.name[locale]}: modèle 3D interactif`);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 4;
    controls.maxDistance = 24;
    controls.maxPolarAngle = Math.PI * 0.88;
    scene.add(new THREE.AmbientLight('#9aaccb', 0.7));

    const randomStar = random(system.id.split('').reduce((sum, letter) => sum + letter.charCodeAt(0), 17));
    const starPositions = [];
    for (let index = 0; index < 1200; index += 1) {
      const radius = 18 + randomStar() * 45;
      const theta = randomStar() * Math.PI * 2;
      const phi = Math.acos(2 * randomStar() - 1);
      starPositions.push(radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
    }
    const starFieldGeometry = new THREE.BufferGeometry();
    starFieldGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const starField = new THREE.Points(starFieldGeometry, new THREE.PointsMaterial({ color: '#c8d8ff', size: 0.075, transparent: true, opacity: 0.82, sizeAttenuation: true }));
    scene.add(starField);

    const centralStar = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 64, 48),
      new THREE.MeshBasicMaterial({ map: makeSurfaceTexture(system.color, system.id.length * 431, true), color: system.color }),
    );
    scene.add(centralStar);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlowTexture(), color: system.color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.set(5.8, 5.8, 1);
    scene.add(glow);
    const keyLight = new THREE.PointLight(system.color, 45, 45, 1.5);
    scene.add(keyLight);

    if (system.debrisDisk) {
      const disk = new THREE.Mesh(
        new THREE.RingGeometry(2.1, 4.25, 180),
        new THREE.MeshBasicMaterial({ color: '#b7d7ed', side: THREE.DoubleSide, transparent: true, opacity: 0.16, depthWrite: false }),
      );
      disk.rotation.x = -Math.PI / 2.25;
      scene.add(disk);
    }

    const selectable = [];
    const orbiters = [];
    system.planets.forEach((planet, index) => {
      const distance = 2.05 + index * 0.56;
      const orbit = new THREE.Mesh(
        new THREE.RingGeometry(distance - 0.006, distance + 0.006, 160),
        new THREE.MeshBasicMaterial({ color: '#8da0c6', side: THREE.DoubleSide, transparent: true, opacity: 0.21, depthWrite: false }),
      );
      orbit.rotation.x = -Math.PI / 2;
      scene.add(orbit);
      const pivot = new THREE.Group();
      pivot.rotation.y = (index / Math.max(system.planets.length, 1)) * Math.PI * 2;
      scene.add(pivot);
      const radius = system.planets.length > 5 ? 0.105 : 0.15;
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 32, 24),
        new THREE.MeshStandardMaterial({ color: planet.color, map: makeSurfaceTexture(planet.color, (index + 5) * 839, false), roughness: 0.76, metalness: 0.03, emissive: planet.color, emissiveIntensity: 0.08 }),
      );
      mesh.position.set(distance, 0, 0);
      mesh.userData.planetId = planet.id;
      pivot.add(mesh);
      selectable.push(mesh);
      orbiters.push({ pivot, mesh, speed: 0.24 / (1 + index * 0.28) });
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onCanvasClick = event => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(selectable, false)[0];
      if (hit) selectRef.current?.(hit.object.userData.planetId);
    };
    renderer.domElement.addEventListener('click', onCanvasClick);

    const resize = new ResizeObserver(() => {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    });
    resize.observe(mount);
    controls.target.set(0, 0, 0);
    controls.update();

    let frameId;
    let previous = performance.now();
    const frame = now => {
      frameId = requestAnimationFrame(frame);
      const delta = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      centralStar.rotation.y += delta * 0.035;
      orbiters.forEach(({ pivot, mesh, speed }, index) => {
        pivot.rotation.y += delta * speed;
        mesh.rotation.y += delta * (0.25 + index * 0.025);
      });
      starField.rotation.y += delta * 0.002;
      controls.update();
      renderer.render(scene, camera);
    };
    frame(previous);

    return () => {
      cancelAnimationFrame(frameId);
      resize.disconnect();
      renderer.domElement.removeEventListener('click', onCanvasClick);
      controls.dispose();
      scene.traverse(object => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) object.material.forEach(material => { material.map?.dispose?.(); material.dispose(); });
        else if (object.material) { object.material.map?.dispose?.(); object.material.dispose(); }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [system, locale]);

  return <div className="star-system-scene" ref={mountRef} />;
}
