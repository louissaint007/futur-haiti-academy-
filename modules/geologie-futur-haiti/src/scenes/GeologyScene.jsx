import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mesh } from './shared/threeHelpers.js';
import { buildVolcano, animateVolcano, inspectVolcano, loadVolcanoTerrain } from './volcano/volcanoScene.js';
import { buildMagmaOrigin, animateMagmaOrigin } from './volcano/magmaOriginScene.js';
import { buildPlates, animatePlates, loadCocosSlab } from './tectonics/tectonicScene.js';
import { buildEarthquake, animateEarthquake } from './tectonics/earthquakeScene.js';
import { buildSedimentaryBlock, loadFossilSite } from './sediments/sedimentScene.js';
import { buildRocks } from './rocks/rockScene.js';

function buildActiveScene(group, mode, boundary, selectedRock) {
  if (mode === 'volcano') { buildVolcano(group); group.scale.setScalar(0.8); }
  else if (mode === 'magma-origin') buildMagmaOrigin(group);
  else if (mode === 'plates') { buildPlates(group, boundary); group.scale.setScalar(0.68); }
  else if (mode === 'earthquake') { buildEarthquake(group); group.scale.setScalar(0.72); }
  else if (mode === 'sediments') buildSedimentaryBlock(group);
  else buildRocks(group, selectedRock);
}

function loadActiveAssets({ mode, boundary, group, isCancelled, onDecoderReady }) {
  if (mode === 'volcano') loadVolcanoTerrain(group, isCancelled).catch(() => {});
  if (mode === 'plates' && boundary === 'Convergente') loadCocosSlab(group, isCancelled).catch(() => {});
  if (mode === 'sediments') loadFossilSite(group, onDecoderReady, isCancelled);
}

export default function GeologyScene({ mode, boundary, speed, playing, intense = false, eruptionType = 'effusive', selectedRock, volcanoPart = 'all', exploded = false, eventReplay = 0, sedimentStage = 3, fossilizationStage = 3, originStep = 0, orbitApiRef }) {
  const hostRef = useRef(null);
  const liveRef = useRef({ speed, playing, intense, eruptionType, volcanoPart, exploded, eventReplay, sedimentStage, fossilizationStage, originStep });
  liveRef.current = { speed, playing, intense, eruptionType, volcanoPart, exploded, eventReplay, sedimentStage, fossilizationStage, originStep };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(mode === 'magma-origin' ? '#29352f' : '#171a16'); scene.fog = mode === 'magma-origin' ? null : new THREE.Fog('#171a16', 12, 28);
    const camera = new THREE.PerspectiveCamera(mode === 'magma-origin' ? 44 : 38, 1, 0.1, 100);
    camera.position.set(8.3, 5.1, 9.5);
    if (mode === 'magma-origin') {
      const wideScene = host.clientWidth / Math.max(host.clientHeight, 1) > 2;
      camera.fov = 40;
      camera.position.set(0, 2.55, wideScene ? 9.4 : 11.2);
      camera.updateProjectionMatrix();
    }
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = mode === 'magma-origin' ? 1.42 : 1.15;
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.055; controls.enableRotate = true; controls.enableZoom = true; controls.enablePan = true; controls.screenSpacePanning = true; controls.zoomSpeed = 0.85; controls.panSpeed = 0.85; controls.minDistance = 4; controls.maxDistance = 22; controls.maxPolarAngle = Math.PI * 0.92; controls.target.set(0, mode === 'magma-origin' ? -0.38 : 0, 0);
    if (orbitApiRef) orbitApiRef.current = {
      zoomIn: () => controls.dollyIn(0.8), zoomOut: () => controls.dollyOut(0.8), reset: () => controls.reset(),
    };
    controls.saveState();

    scene.add(new THREE.HemisphereLight('#d5d4bc', '#353026', 2.15));
    const key = new THREE.DirectionalLight('#ffe0b1', 3.1); key.position.set(-5, 8, 7); scene.add(key);
    const fill = new THREE.PointLight('#e2723c', 21, 17, 2); fill.position.set(4, 2, -5); scene.add(fill);
    if (mode === 'magma-origin') {
      const crossSectionFill = new THREE.DirectionalLight('#fff0d8', 3.4); crossSectionFill.position.set(0, 6, 12); scene.add(crossSectionFill);
      const mantleFill = new THREE.PointLight('#d79a63', 3.2, 18, 1.8); mantleFill.position.set(-1.2, -1.2, 5.5); scene.add(mantleFill);
    }
    const ground = mesh(new THREE.CircleGeometry(mode === 'volcano' ? 11 : 7, 112), new THREE.MeshStandardMaterial({ color: mode === 'volcano' ? '#62533e' : '#22231e', roughness: 1 }), scene, [0, -3.28, 0]); ground.rotation.x = -Math.PI / 2;
    const group = new THREE.Group(); scene.add(group);
    buildActiveScene(group, mode, boundary, selectedRock);

    let cancelled = false, fossilDecoder;
    loadActiveAssets({ mode, boundary, group, isCancelled: () => cancelled, onDecoderReady: (decoder) => { fossilDecoder = decoder; } });
    const dustGeometry = new THREE.BufferGeometry(), dust = [];
    for (let i = 0; i < 90; i++) dust.push((Math.random() - 0.5) * 22, Math.random() * 11 - 3, (Math.random() - 0.5) * 22);
    dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dust, 3));
    scene.add(new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: '#a69a80', size: 0.035, transparent: true, opacity: 0.35 })));

    const resize = () => {
      const width = Math.max(host.clientWidth, 1), height = Math.max(host.clientHeight, 1);
      renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    let frame, elapsed = 0, previousFrame = performance.now();
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const now = performance.now();
      if (liveRef.current.playing) elapsed += (now - previousFrame) * 0.001 * liveRef.current.speed;
      previousFrame = now;
      const time = elapsed;
      if (mode === 'volcano') {
        animateVolcano(group, { time, playing: liveRef.current.playing, intense: liveRef.current.intense, eruptionType: liveRef.current.eruptionType });
        inspectVolcano(group, liveRef.current.volcanoPart, liveRef.current.exploded);
      }
      if (mode === 'magma-origin') animateMagmaOrigin(group, { time, playing: liveRef.current.playing, step: liveRef.current.originStep });
      if (mode === 'plates') animatePlates(group, { boundary, time, playing: liveRef.current.playing });
      if (mode === 'earthquake') animateEarthquake(group, { time, playing: liveRef.current.playing, trigger: liveRef.current.eventReplay });
      if (mode === 'sediments') {
        group.userData.setSedimentStage?.(liveRef.current.sedimentStage);
        group.userData.setFossilizationStage?.(liveRef.current.fossilizationStage);
      }
      controls.update(); renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelled = true; fossilDecoder?.dispose(); cancelAnimationFrame(frame); observer.disconnect(); controls.dispose();
      if (orbitApiRef) orbitApiRef.current = null;
      renderer.dispose(); if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
      scene.traverse((object) => {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) object.material.forEach((item) => { item.map?.dispose(); item.dispose(); });
        else if (object.material) { object.material.map?.dispose(); object.material.dispose(); }
      });
    };
  }, [mode, boundary, selectedRock]);

  return <div ref={hostRef} className="three-host" role="img" aria-label={`Scène 3D pédagogique : ${mode === 'volcano' ? 'volcan' : mode === 'magma-origin' ? 'coupe de subduction et origine du magma' : mode === 'plates' ? 'tectonique des plaques' : mode === 'earthquake' ? 'séisme et propagation des ondes' : mode === 'sediments' ? 'strates sédimentaires et fossilisation' : `échantillon de ${selectedRock}`}. Glissez pour faire tourner le modèle.`} />;
}
