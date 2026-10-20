import * as THREE from 'three';
import { mesh, line, label } from '../shared/threeHelpers.js';

const material = (color, options = {}) => new THREE.MeshStandardMaterial({
  color,
  roughness: 0.88,
  metalness: 0.02,
  ...options,
});

function extrudedShape(points, depth, mat, parent, z = -depth / 2) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 5 });
  return mesh(geometry, mat, parent, [0, 0, z]);
}

function addArrow(from, to, color, parent, headLength = 0.24) {
  const origin = new THREE.Vector3(...from);
  const target = new THREE.Vector3(...to);
  const direction = target.clone().sub(origin).normalize();
  const arrow = new THREE.ArrowHelper(direction, origin, origin.distanceTo(target), color, headLength, headLength * 0.72);
  arrow.line.material.transparent = true;
  arrow.line.material.opacity = 0.88;
  arrow.cone.material.dispose();
  arrow.cone.material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.34,
    roughness: 0.48,
  });
  parent.add(arrow);
  return arrow;
}

function createVolcano(parent, parts) {
  const shape = new THREE.Group();
  shape.position.set(3.52, 0.6, 0.08);
  parts.ascent.add(shape);
  const cone = mesh(
    new THREE.CylinderGeometry(0.11, 1.25, 1.78, 48, 14),
    material('#77634c', { roughness: 0.97 }),
    shape,
    [0, 0.9, 0],
  );
  const positions = cone.geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
    const radial = Math.hypot(x, z);
    const rough = (Math.sin(Math.atan2(z, x) * 5.1 + y * 1.7) * 0.035 + Math.sin(x * 9 + z * 7) * 0.018) * Math.min(1, radial * 1.8);
    positions.setXYZ(i, x + (radial ? x / radial * rough : 0), y + Math.sin(Math.atan2(z, x) * 3.2) * 0.018, z + (radial ? z / radial * rough : 0));
  }
  cone.geometry.computeVertexNormals();
  cone.material.side = THREE.DoubleSide;
  mesh(new THREE.TorusGeometry(0.16, 0.075, 12, 40), material('#4c3d31'), shape, [0, 1.77, 0]);
  mesh(new THREE.CircleGeometry(0.14, 32), material('#d85b27', { emissive: '#ff571a', emissiveIntensity: 0.75 }), shape, [0, 1.78, 0]);
}

export function buildMagmaOrigin(group) {
  const parts = Object.fromEntries(['subduction', 'fluids', 'partial-melt', 'ascent'].map((id) => {
    const section = new THREE.Group();
    section.name = `magma-origin:${id}`;
    group.add(section);
    return [id, section];
  }));
  group.userData.originParts = parts;

  // A broad, darker mantle lies below the thin, warm-colored continental crust.
  mesh(new THREE.BoxGeometry(10.1, 3.15, 1.8), material('#79513d', { roughness: 1 }), group, [0, -1.98, 0]);
  mesh(new THREE.BoxGeometry(10.08, 0.08, 1.82), material('#a77551', { roughness: 1 }), group, [0, -0.36, 0.02]);
  label('MANTEAU', group, [-4.05, -1.62, 1.0], '#f0c6a2');

  const oceanic = material('#a08b6d', { emissive: '#563e27', emissiveIntensity: 0.12, roughness: 0.98 });
  extrudedShape([
    [-5.05, 0.66], [-1.62, 0.66], [-1.48, 0.32], [-1.3, -0.08], [-0.98, -0.48],
    [-0.53, -0.9], [0.03, -1.32], [0.6, -1.69], [1.12, -1.92], [1.23, -2.13],
    [0.88, -2.04], [0.33, -1.75], [-0.28, -1.35], [-0.84, -0.9], [-1.31, -0.4],
    [-1.63, 0.13], [-1.86, 0.62],
  ], 1.78, oceanic, parts.subduction, -0.89);
  const continent = material('#bc936a', { emissive: '#563518', emissiveIntensity: 0.12, roughness: 0.98 });
  extrudedShape([[-0.95, 0.67], [5.06, 0.67], [5.06, -0.37], [1.1, -0.37], [0.48, -0.12], [-0.46, 0.0]], 1.78, continent, parts.subduction, -0.89);
  mesh(new THREE.BoxGeometry(3.42, 0.17, 1.84), material('#317482', { roughness: 0.55, emissive: '#0d3841', emissiveIntensity: 0.17 }), parts.subduction, [-3.34, 0.79, 0.01]);
  for (let i = 0; i < 3; i++) line([[-4.75, 0.91 + i * 0.025, 0.95], [-3.85, 0.91 + i * 0.025, 0.95], [-2.95, 0.91 + i * 0.025, 0.95]], '#80c7ca', 0.012, parts.subduction);

  // A connected, irregular melt lens marks the mantle wedge where water lowers
  // the melting temperature. It is a partially molten source, not a magma lake.
  const sourceLens = extrudedShape([
    [0.05, -0.67], [0.38, -0.5], [0.88, -0.42], [1.35, -0.28], [1.78, -0.35],
    [1.55, -0.68], [1.18, -0.89], [0.72, -1.02], [0.24, -0.91],
  ], 0.08, material('#b65b34', { emissive: '#742b16', emissiveIntensity: 0.24, roughness: 0.48, side: THREE.DoubleSide }), parts['partial-melt'], 0.99);
  sourceLens.userData.baseScale = 1;
  label('CROÛTE', parts.subduction, [3.75, 0.48, 1.08], '#fff0d4');
  label('FUSION PARTIELLE', parts['partial-melt'], [0.3, -1.42, 1.15], '#ffd0a0');

  // Down-going plate motion and water-rich fluids are shown in separate colors and paths.
  addArrow([-1.52, 0.21, 1.02], [-0.4, -1.08, 1.02], '#e5bb83', parts.subduction, 0.25);
  const waterMat = material('#75d6e6', { emissive: '#1590a7', emissiveIntensity: 0.68, roughness: 0.3 });
  const fluidPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.25, -1.53, 1.02), new THREE.Vector3(0.42, -1.08, 1.03),
    new THREE.Vector3(0.72, -0.68, 1.03), new THREE.Vector3(1.02, -0.2, 1.02),
  ]);
  const fluidTube = mesh(new THREE.TubeGeometry(fluidPath, 42, 0.035, 8, false), waterMat, parts.fluids);
  fluidTube.material.transparent = true; fluidTube.material.opacity = 0.7;
  addArrow([0.72, -0.66, 1.04], [0.95, -0.27, 1.04], '#75d6e6', parts.fluids, 0.16);
  parts.fluids.userData.path = fluidPath;
  const fluidParticles = [];
  for (let i = 0; i < 9; i++) {
    const drop = mesh(new THREE.SphereGeometry(0.075 + (i % 3) * 0.012, 12, 10), waterMat.clone(), parts.fluids);
    drop.userData.phase = i / 9;
    fluidParticles.push(drop);
  }
  parts.fluids.userData.path = fluidPath;
  parts.fluids.userData.particles = fluidParticles;

  parts['partial-melt'].userData.sourceLens = sourceLens;

  createVolcano(group, parts);
  // The orange conduit visibly connects the mantle melt source to the crustal chamber.
  const ascentPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.55, -0.92, 1.04), new THREE.Vector3(1.12, -0.52, 1.04),
    new THREE.Vector3(1.7, -0.06, 1.04), new THREE.Vector3(2.28, 0.03, 1.04),
    new THREE.Vector3(2.72, 0.04, 1.04), new THREE.Vector3(3.5, 0.42, 1.04),
    new THREE.Vector3(3.52, 1.12, 1.04), new THREE.Vector3(3.52, 1.86, 1.04),
  ]);
  const magmaTube = mesh(new THREE.TubeGeometry(ascentPath, 100, 0.15, 12, false), material('#ef642e', { emissive: '#fa4518', emissiveIntensity: 0.8, roughness: 0.38 }), parts.ascent);
  mesh(new THREE.TubeGeometry(ascentPath, 100, 0.035, 10, false), material('#ffc36a', { emissive: '#ff9c37', emissiveIntensity: 0.92, roughness: 0.24 }), parts.ascent);
  magmaTube.material.transparent = true; magmaTube.material.opacity = 0.9;
  addArrow([3.5, 0.8, 1.08], [3.5, 1.35, 1.08], '#ffb454', parts.ascent, 0.18);
  // Irregular enclosed reservoir, shaped as a chamber rather than a loose sphere.
  const chamber = extrudedShape([
    [2.18, -0.2], [2.32, 0.06], [2.55, 0.18], [2.9, 0.19], [3.16, 0.07],
    [3.24, -0.17], [3.08, -0.31], [2.77, -0.36], [2.47, -0.3],
  ], 0.25, material('#ed7135', { emissive: '#fa4e1b', emissiveIntensity: 0.86, roughness: 0.38, side: THREE.DoubleSide }), parts.ascent, 0.95);
  chamber.scale.set(1, 0.72, 1);
  label('RÉSERVOIR', parts.ascent, [3.65, -0.53, 1.2], '#ffd3a3');
  parts.ascent.userData.path = ascentPath;
  const magmaParticles = [];
  for (let i = 0; i < 8; i++) {
    const drop = mesh(new THREE.OctahedronGeometry(0.09 + (i % 3) * 0.018, 1), material('#ffb15a', { emissive: '#f65b21', emissiveIntensity: 0.94, roughness: 0.3 }), parts.ascent);
    drop.userData.phase = i / 8;
    magmaParticles.push(drop);
  }
  parts.ascent.userData.particles = magmaParticles;

  const light = new THREE.PointLight('#f2823b', 4, 5, 2);
  light.position.set(0.8, -0.72, 1.6);
  parts['partial-melt'].add(light);
  group.userData.originLight = light;
  group.userData.activeOriginStep = -1;
}

export function animateMagmaOrigin(group, { time, playing, step = 0 }) {
  const parts = group.userData.originParts;
  if (!parts) return;
  if (group.userData.activeOriginStep !== step) {
    group.userData.activeOriginStep = step;
    const focus = { 0: 'subduction', 1: 'fluids', 2: 'partial-melt', 3: 'ascent' }[step] || 'subduction';
    Object.entries(parts).forEach(([id, section]) => {
      section.traverse((object) => {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.filter(Boolean).forEach((item) => {
          if (!item.emissive) return;
          if (item.userData.originBaseIntensity === undefined) item.userData.originBaseIntensity = item.emissiveIntensity || 0;
          item.emissiveIntensity = item.userData.originBaseIntensity + (id === focus ? 0.52 : 0);
        });
      });
    });
  }
  const cycle = playing ? time : 0;
  parts.fluids.userData.particles.forEach((drop) => {
    const progress = (drop.userData.phase + cycle * 0.16) % 1;
    drop.position.copy(parts.fluids.userData.path.getPoint(progress));
    const pulse = 0.82 + Math.sin(cycle * 3.2 + drop.userData.phase * Math.PI * 2) * 0.16;
    drop.scale.setScalar(pulse);
  });
  const sourcePulse = 0.98 + Math.sin(cycle * 1.8) * 0.025;
  parts['partial-melt'].userData.sourceLens.scale.set(sourcePulse, 1 / sourcePulse, 1);
  parts.ascent.userData.particles.forEach((drop) => {
    const progress = (drop.userData.phase + cycle * 0.13) % 1;
    drop.position.copy(parts.ascent.userData.path.getPoint(progress));
    drop.scale.setScalar(0.8 + Math.sin(cycle * 2.8 + drop.userData.phase * 8) * 0.14);
  });
  group.userData.originLight.intensity = 3.5 + Math.sin(cycle * 2.1) * 0.45;
}
