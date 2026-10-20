import * as THREE from 'three';
import { label, line, makePlate, mesh } from '../shared/threeHelpers.js';

const smooth = (value) => {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

export function buildEarthquake(group) {
  // Reuse the same complete, irregular, layered plate meshes as the tectonics
  // module. The oceanic plate is the right-hand plate and dips below the left.
  const mantleGeometry = new THREE.SphereGeometry(1, 64, 40);
  const mantlePositions = mantleGeometry.attributes.position;
  for (let i = 0; i < mantlePositions.count; i++) {
    const x = mantlePositions.getX(i), y = mantlePositions.getY(i), z = mantlePositions.getZ(i);
    const ripple = 1 + 0.022 * Math.sin(x * 13 + z * 8) * Math.cos(y * 9 - z * 4);
    mantlePositions.setXYZ(i, x * ripple, y * ripple, z * ripple);
  }
  mantleGeometry.computeVertexNormals();
  const mantle = mesh(mantleGeometry, new THREE.MeshStandardMaterial({
    color: '#77513b', roughness: 1, transparent: true, opacity: 0.72,
  }), group, [0, -1.88, 0], [5.7, 0.75, 3.35]);
  mantle.userData.asthenosphere = true;

  const continental = makePlate(group, { x: -2.3, oceanic: false, name: 'continentale' });
  const oceanic = makePlate(group, { x: 2.3, oceanic: true, name: 'océanique', convergent: true });
  oceanic.rotation.z = 0.12;
  oceanic.position.y = -0.05;
  group.userData.quakePlates = [continental, oceanic];

  // The interface is drawn on the exposed front edge to clarify the rupture
  // plane without adding an artificial-looking metal fault block.
  const fault = line([
    [0.08, 0.47, 2.67], [-0.06, 0.18, 2.67], [-0.24, -0.13, 2.67],
    [-0.57, -0.48, 2.67], [-1.02, -0.75, 2.67], [-1.55, -0.86, 2.67],
  ], '#76513d', 0.052, group);
  fault.material.emissive.set('#2a150c');
  fault.material.emissiveIntensity = 0.25;
  fault.userData.quakeFault = true;
  group.userData.fault = fault;
  line([[0.02, 0.75, 2.67], [-0.05, 0.61, 2.67], [-0.2, 0.5, 2.67]], '#d0a16c', 0.032, group);
  label('Plaque continentale', group, [-2.45, 1.35, 2.75], '#f1dfc2');
  label('Plaque océanique', group, [2.38, 0.82, 2.75], '#e2ceb0');
  label('Faille · rupture', group, [-0.65, -1.08, 2.77], '#f1c78f');

  const hypocenterPosition = new THREE.Vector3(-0.46, -0.48, 2.74);
  group.userData.hypocenter = mesh(new THREE.SphereGeometry(0.105, 20, 16), new THREE.MeshStandardMaterial({
    color: '#ffd184', emissive: '#d85b25', emissiveIntensity: 1.6, roughness: 0.4,
  }), group, hypocenterPosition.toArray());
  group.userData.epicenter = mesh(new THREE.SphereGeometry(0.075, 16, 12), new THREE.MeshBasicMaterial({
    color: '#fff0b0', toneMapped: false, depthTest: false,
  }), group, [-0.13, 0.73, 2.74]);
  line([[-0.13, 0.69, 2.74], [-0.23, 0.05, 2.74], [-0.43, -0.37, 2.74]], '#f0c487', 0.018, group);

  // Keep the established body- and surface-wave animation unchanged.
  const pWave = mesh(new THREE.SphereGeometry(1, 28, 18), new THREE.MeshBasicMaterial({
    color: '#f5b34e', wireframe: true, transparent: true, opacity: 0.7, depthWrite: false,
  }), group, hypocenterPosition.toArray());
  pWave.userData.wave = 'P';
  const sWave = mesh(new THREE.SphereGeometry(1, 28, 18), new THREE.MeshBasicMaterial({
    color: '#72c3c0', wireframe: true, transparent: true, opacity: 0.65, depthWrite: false,
  }), group, hypocenterPosition.toArray());
  sWave.userData.wave = 'S';
  group.userData.bodyWaves = [pWave, sWave];

  group.userData.surfaceWaves = [0, 1].map((index) => {
    const ring = mesh(new THREE.TorusGeometry(0.34, 0.025, 8, 48), new THREE.MeshBasicMaterial({
      color: index ? '#74c7c2' : '#f0b758', transparent: true, opacity: 0.75, depthWrite: false,
    }), group, [-0.13, 0.75, 0]);
    ring.rotation.x = Math.PI / 2;
    ring.userData.waveIndex = index;
    return ring;
  });
  group.userData.startedAt = 0;
  group.userData.trigger = null;
}

export function animateEarthquake(group, { time, playing, trigger = 0 }) {
  if (!group.userData.hypocenter) return;
  if (trigger !== group.userData.trigger) {
    group.userData.trigger = trigger;
    group.userData.startedAt = time;
    group.userData.frozenElapsed = 0;
  }
  const elapsed = playing ? Math.max(0, time - group.userData.startedAt) : (group.userData.frozenElapsed || 0);
  if (playing) group.userData.frozenElapsed = elapsed;

  // Pressure builds slowly while the convergent boundary is locked, then the
  // oceanic plate slips down and beneath the continent, releasing the quake.
  const phase = elapsed % 9;
  const loading = smooth(phase / 2.15);
  const rupture = smooth((phase - 2.15) / 0.34);
  const [continental, oceanic] = group.userData.quakePlates || [];
  if (continental && oceanic) {
    continental.position.x = continental.userData.restPosition.x + loading * 0.08 + rupture * 0.2;
    oceanic.position.x = oceanic.userData.restPosition.x - loading * 0.08 - rupture * 0.48;
    oceanic.position.y = oceanic.userData.restPosition.y - rupture * 0.3;
    oceanic.rotation.z = 0.12 + rupture * 0.075;
  }

  const quakeElapsed = Math.max(0, phase - 2.15);
  const cycle = quakeElapsed;
  const pulse = Math.exp(-cycle * 0.72) * (cycle < 4 ? 1 : 0);
  group.userData.hypocenter.material.emissiveIntensity = 0.5 + pulse * 2.4;
  if (group.userData.fault) {
    group.userData.fault.material.emissive.set(pulse > 0.04 ? '#a64b20' : '#2a150c');
    group.userData.fault.material.emissiveIntensity = 0.25 + pulse * 1.1;
  }
  group.userData.bodyWaves?.forEach((wave) => {
    const speed = wave.userData.wave === 'P' ? 1.55 : 0.92;
    const radius = 0.08 + Math.min(cycle * speed, 4.6);
    wave.scale.setScalar(radius);
    wave.material.opacity = cycle * speed < 4.6 ? 0.72 * (1 - radius / 5.1) : 0;
  });
  group.userData.surfaceWaves?.forEach((ring) => {
    const waveIndex = ring.userData.waveIndex;
    const phase = (cycle * (waveIndex ? 0.46 : 0.7) + waveIndex * 0.5) % 2.4;
    const radius = 0.38 + phase * 1.75;
    ring.scale.set(radius, radius, 1);
    ring.material.opacity = Math.max(0, 0.8 * (1 - phase / 2.4));
  });
}
