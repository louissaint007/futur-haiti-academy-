import * as THREE from 'three';
import { addJsonSurface, label, line, makePlate, mesh } from '../shared/threeHelpers.js';
import { buildVolcano } from '../volcano/volcanoScene.js';

function motionArrow(parent, x, y, z, direction, color = '#ffe0a2') {
  const arrow = new THREE.ArrowHelper(new THREE.Vector3(...direction).normalize(), new THREE.Vector3(x, y, z), 1.12, color, 0.27, 0.2);
  arrow.line.material.depthTest = false;
  arrow.cone.material.depthTest = false;
  arrow.renderOrder = 4;
  parent.add(arrow);
  return arrow;
}

function addBoundaryMarkers(group, boundary) {
  const mark = new THREE.MeshStandardMaterial({ color: '#f28a4c', emissive: '#9b371b', emissiveIntensity: 0.7, roughness: 0.55 });
  const muted = new THREE.MeshStandardMaterial({ color: '#b9a47e', roughness: 0.88 });

  if (boundary === 'Divergente') {
    // A raised, fractured ridge makes the creation of new crust visible from above.
    const ridge = mesh(new THREE.BoxGeometry(0.32, 0.2, 3.4), mark, group, [0, 0.79, 0]);
    ridge.rotation.z = 0.08;
    for (let i = -2; i <= 2; i++) {
      const plume = mesh(new THREE.ConeGeometry(0.1, 0.6, 12), mark, group, [0, 0.85, i * 0.62]);
      plume.userData.rise = true;
    }
    line([[0, 0.82, -2.1], [-0.12, 0.86, -1.1], [0.08, 0.82, 0], [-0.1, 0.85, 1.1], [0, 0.82, 2.1]], '#ffad64', 0.035, group);
    group.userData.ridge = ridge;
  } else if (boundary === 'Convergente') {
    line([[-0.54, 0.39, -2.1], [-0.32, 0.48, -1.0], [-0.28, 0.43, 0], [-0.38, 0.4, 1.1], [-0.57, 0.37, 2.1]], '#382b22', 0.095, group);
    line([[-0.12, 0.66, -1.85], [0.05, 0.73, -0.9], [-0.03, 0.71, 0], [0.1, 0.73, 0.9], [-0.1, 0.66, 1.85]], '#b9a47e', 0.025, group);
    const arc = new THREE.Group(); group.add(arc); arc.position.set(-1.35, 0.88, 1.72); arc.scale.setScalar(0.42); buildVolcano(arc, false);
    group.userData.volcanicArc = arc;
    group.userData.quakePulse = mesh(new THREE.SphereGeometry(0.1, 16, 12), new THREE.MeshBasicMaterial({ color: '#ffcc70', transparent: true, opacity: 0, depthWrite: false }), group, [-0.3, 0.52, 0]);
  } else {
    // A narrow fault trace and offset surface marks show lateral slip without crust being consumed.
    line([[0, 0.44, -2.6], [0.08, 0.53, -1.5], [-0.08, 0.48, -0.4], [0.1, 0.54, 0.7], [-0.04, 0.45, 1.8], [0.05, 0.48, 2.6]], '#f28a4c', 0.075, group);
    for (let i = 0; i < 5; i++) {
      const marker = mesh(new THREE.BoxGeometry(0.34, 0.035, 0.035), muted, group, [i % 2 ? -0.68 : 0.68, 0.55, -1.65 + i * 0.82]);
      marker.userData.faultMarker = true;
      marker.userData.side = i % 2 ? -1 : 1;
      marker.userData.baseX = marker.position.x;
    }
    group.userData.quakePulse = mesh(new THREE.SphereGeometry(0.1, 16, 12), new THREE.MeshBasicMaterial({ color: '#ffcc70', transparent: true, opacity: 0, depthWrite: false }), group, [0, 0.57, 0]);
  }
}

function addSubductionCrossSection(group) {
  // Generic subduction teaching model: the oceanic lithosphere bends and
  // descends beneath the continent; this is not presented as Haiti's local fault geometry.
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.05, 0.34, 0),
    new THREE.Vector3(-0.28, 0.12, 0),
    new THREE.Vector3(-0.62, -0.34, 0),
    new THREE.Vector3(-1.12, -0.78, 0),
    new THREE.Vector3(-1.78, -1.02, 0),
    new THREE.Vector3(-2.45, -1.04, 0),
  ]);
  // A narrow exposed slice on the near edge keeps the dipping interface visible
  // from the default camera while leaving the rest of the model fully 3D.
  const steps = 72, columns = 14, halfWidth = 0.42, cutFaceZ = 3.05, thickness = 0.38;
  const vertices = [], indices = [];
  const layerSize = (steps + 1) * (columns + 1);
  for (let layer = 0; layer < 2; layer++) {
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, center = path.getPointAt(t), tangent = path.getTangentAt(t).normalize();
      const normal = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
      for (let j = 0; j <= columns; j++) {
        const across = j / columns * 2 - 1;
        const edge = Math.abs(across) ** 4 * (Math.sin(t * 27 + j * 0.31) * 0.095 + Math.sin(t * 53 - j) * 0.05);
        const depth = layer === 0 ? thickness * 0.5 : -thickness * 0.5;
        vertices.push(
          center.x + normal.x * (depth + edge),
          center.y + normal.y * (depth + edge),
          cutFaceZ + across * halfWidth,
        );
      }
    }
  }
  for (let i = 0; i < steps; i++) for (let j = 0; j < columns; j++) {
    const a = i * (columns + 1) + j, b = a + columns + 1, bottom = layerSize;
    indices.push(a, b, a + 1, a + 1, b, b + 1);
    indices.push(bottom + a, bottom + a + 1, bottom + b, bottom + a + 1, bottom + b + 1, bottom + b);
    indices.push(a, bottom + a, b, b, bottom + a, bottom + b);
    if (j === 0) indices.push(a, b, bottom + a, b, bottom + b, bottom + a);
    if (j === columns - 1) indices.push(a + 1, bottom + a + 1, b + 1, b + 1, bottom + a + 1, bottom + b + 1);
    if (i === 0) indices.push(a, a + 1, bottom + a, a + 1, bottom + a + 1, bottom + a);
    if (i === steps - 1) indices.push(b, bottom + b, b + 1, b + 1, bottom + b, bottom + b + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  const slabMaterial = new THREE.MeshStandardMaterial({ color: '#89938b', roughness: 0.98, metalness: 0, emissive: '#27291f', emissiveIntensity: 0.2, side: THREE.DoubleSide });
  const slab = mesh(geometry, slabMaterial, group);
  slab.userData.subductingSlab = true;
  group.userData.subductingSlab = slab;

  // Exposed front edge bands make the slab's downward bend legible in 3D.
  for (const z of [cutFaceZ - halfWidth, cutFaceZ + halfWidth]) {
    const points = path.getSpacedPoints(48).map((point) => [point.x, point.y, z]);
    line(points, '#d6c09a', 0.04, group);
  }
  const magmaGeometry = new THREE.SphereGeometry(0.72, 32, 24);
  const magmaPositions = magmaGeometry.attributes.position;
  for (let i = 0; i < magmaPositions.count; i++) {
    const x = magmaPositions.getX(i), y = magmaPositions.getY(i), z = magmaPositions.getZ(i);
    const rough = 1 + 0.055 * Math.sin(x * 11 + z * 7) * Math.cos(y * 13 - z * 4);
    magmaPositions.setXYZ(i, x * rough, y * rough, z * rough);
  }
  magmaGeometry.computeVertexNormals();
  const magma = mesh(magmaGeometry, new THREE.MeshStandardMaterial({ color: '#bd542d', emissive: '#aa3518', emissiveIntensity: 0.72, roughness: 0.9, transparent: true, opacity: 0.88 }), group, [-1.2, -0.56, cutFaceZ], [0.78, 0.31, 0.28]);
  magma.userData.magmaWedge = true;
  group.userData.magmaWedge = magma;
  const ascent = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.2, -0.48, cutFaceZ), new THREE.Vector3(-1.28, -0.13, cutFaceZ),
    new THREE.Vector3(-1.17, 0.22, cutFaceZ), new THREE.Vector3(-1.17, 0.57, cutFaceZ),
  ]);
  mesh(new THREE.TubeGeometry(ascent, 28, 0.075, 10, false), new THREE.MeshStandardMaterial({ color: '#e36a34', emissive: '#7d2a13', emissiveIntensity: 0.38, roughness: 0.82 }), group);

  label('Fosse', group, [0.06, 0.24, cutFaceZ + 0.22], '#f5c58b');
  group.userData.slabPath = path;
  group.userData.slabCutZ = cutFaceZ + halfWidth + 0.045;
  const motionMarker = mesh(new THREE.SphereGeometry(0.13, 20, 16), new THREE.MeshBasicMaterial({ color: '#fff0b0', toneMapped: false, depthTest: false }), group);
  motionMarker.userData.subductionMotionMarker = true;
  motionMarker.renderOrder = 5;
  const initialMarkerPoint = path.getPointAt(0.12);
  motionMarker.position.set(initialMarkerPoint.x, initialMarkerPoint.y, group.userData.slabCutZ);
  group.userData.subductionMarker = motionMarker;
}

export function buildPlates(group, boundary) {
  const mantleGeometry = new THREE.SphereGeometry(1, 96, 48);
  const mantlePositions = mantleGeometry.attributes.position;
  for (let i = 0; i < mantlePositions.count; i++) {
    const x = mantlePositions.getX(i), y = mantlePositions.getY(i), z = mantlePositions.getZ(i);
    const ripple = 1 + 0.025 * Math.sin(x * 13 + z * 8) * Math.cos(z * 11 - y * 5);
    mantlePositions.setXYZ(i, x * ripple, y * ripple, z * ripple);
  }
  mantleGeometry.computeVertexNormals();
  const asthenosphere = mesh(mantleGeometry, new THREE.MeshStandardMaterial({ color: '#77513b', roughness: 1, transparent: true, opacity: 0.42, depthWrite: false }), group, [0, -1.88, 0], [5.8, 0.76, 3.45]);
  asthenosphere.userData.asthenosphere = true;
  const positions = boundary === 'Divergente' ? [-2.67, 2.67] : [-2.3, 2.3];
  const left = makePlate(group, {
    x: positions[0], oceanic: boundary !== 'Convergente', name: boundary === 'Convergente' ? 'continentale' : 'océanique',
    divergent: boundary === 'Divergente',
  });
  const right = makePlate(group, {
    x: positions[1], oceanic: true, name: 'océanique', convergent: boundary === 'Convergente',
    divergent: boundary === 'Divergente',
  });

  if (boundary === 'Convergente') {
    // The oceanic Cocos plate bends down and travels left beneath the continental plate.
    right.rotation.z = 0.22;
    right.position.y = -0.08;
    addSubductionCrossSection(group);
  } else if (boundary === 'Transformante') {
    right.position.z = 0.38; right.rotation.y = 0.1;
    left.position.z = -0.25; left.rotation.y = -0.08;
  }

  const leftArrow = boundary === 'Divergente'
    ? motionArrow(left, 1.03, 1.25, -1.1, [-1, 0, 0])
    : boundary === 'Convergente'
      ? motionArrow(left, 0.5, 1.25, -1.1, [1, 0, 0])
      : motionArrow(left, 1.22, 1.1, 0, [0, 0, 1]);
  const rightArrow = boundary === 'Divergente'
    ? motionArrow(right, -1.03, 1.25, 1.1, [1, 0, 0])
    : boundary === 'Convergente'
      ? motionArrow(right, -0.55, 1.2, 1.1, [-1, -0.12, 0])
      : motionArrow(right, -1.22, 1.1, 0, [0, 0, -1]);

  group.userData.plates = [left, right];
  group.userData.arrows = [leftArrow, rightArrow];
  group.userData.boundary = boundary;
  addBoundaryMarkers(group, boundary);
}

function cycle(time, period = 12) {
  // Slow one-way drift followed by a short, gentle reset for a looping classroom model.
  const phase = ((time % period) + period) % period / period;
  return phase < 0.86 ? phase / 0.86 : (1 - (phase - 0.86) / 0.14) * 0.001;
}

export function animatePlates(group, { boundary, time, playing }) {
  const [left, right] = group.userData.plates || [];
  if (!left || !right) return;
  const progress = playing ? cycle(time) : (group.userData.progress || 0);
  if (playing) group.userData.progress = progress;
  left.position.copy(left.userData.restPosition);
  right.position.copy(right.userData.restPosition);

  if (boundary === 'Divergente') {
    const travel = progress * 0.62;
    left.position.x -= travel;
    right.position.x += travel;
    group.userData.ridge.scale.y = 0.75 + 0.5 * (0.5 + 0.5 * Math.sin(time * 2.1));
    group.children.forEach((child) => {
      if (child.userData.rise) child.position.y = 0.82 + 0.14 * (0.5 + 0.5 * Math.sin(time * 2.4 + child.position.z));
    });
  }
  if (boundary === 'Convergente') {
    const travel = progress * 1.22;
    left.position.x += travel * 0.28;
    left.position.y += progress * 0.2;
    right.position.x -= travel;
    right.position.y -= travel * 0.82;
    right.rotation.z = 0.22 + progress * 0.36;
    const pulse = 0.5 + 0.5 * Math.sin(time * 1.8);
    if (group.userData.slab) {
      group.userData.slab.position.y = -progress * 0.3;
      group.userData.slab.position.x = -progress * 0.24;
    }
    const marker = group.userData.subductionMarker;
    if (marker && group.userData.slabPath) {
      const point = group.userData.slabPath.getPointAt(0.12 + progress * 0.72);
      marker.position.set(point.x, point.y, group.userData.slabCutZ);
      marker.scale.setScalar(0.92 + pulse * 0.28);
    }
    if (group.userData.magmaWedge) group.userData.magmaWedge.scale.y = 0.34 * (0.88 + pulse * 0.24);
    if (group.userData.volcanicArc) group.userData.volcanicArc.scale.setScalar(0.42 * (0.96 + pulse * 0.08));
    const quake = group.userData.quakePulse;
    if (quake) {
      quake.scale.setScalar(0.15 + pulse * 0.72);
      quake.material.opacity = 0.42 * (1 - pulse);
    }
  }
  if (boundary === 'Transformante') {
    const slip = progress * 0.62;
    left.position.z += slip;
    right.position.z -= slip;
    group.children.forEach((child) => {
      if (child.userData.faultMarker) child.position.x = child.userData.baseX + (child.userData.side < 0 ? slip : -slip);
    });
    const pulse = 0.5 + 0.5 * Math.sin(time * 1.8);
    const quake = group.userData.quakePulse;
    if (quake) {
      quake.scale.setScalar(0.15 + pulse * 0.8);
      quake.material.opacity = 0.48 * (1 - pulse);
    }
  }
}

export async function loadCocosSlab(group, isCancelled = () => false) {
  const response = await fetch('/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/models/tectonics/cocos-slab2-mesh.json');
  if (!response.ok) throw new Error(`USGS slab geometry unavailable (${response.status})`);
  const data = await response.json();
  if (isCancelled()) return null;
  const slab = addJsonSurface(data, group, { color: '#c58855', depthTint: true });
  slab.material.emissive = new THREE.Color('#3e1f12');
  slab.material.emissiveIntensity = 0.14;
  group.userData.slab = slab;
  return slab;
}
