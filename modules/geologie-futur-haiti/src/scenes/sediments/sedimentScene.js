import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { fitModelToScene, label } from '../shared/threeHelpers.js';

const halfWidth = 3.45;
const halfDepth = 2.15;
const bedThickness = 0.43;
const bedColors = ['#8f6646', '#c3a57b', '#65584a', '#d0ad78', '#79614a', '#c8b08a', '#725f4a', '#e0c59a'];
const calloutColor = '#e4c58f';

function addCalloutLine(group, from, to) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const curve = new THREE.LineCurve3(start, end);
  const leader = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 1, 0.008, 5, false),
    new THREE.MeshBasicMaterial({ color: calloutColor, transparent: true, opacity: 0.92, depthTest: false }),
  );
  leader.renderOrder = 2;
  group.add(leader);

  const anchor = new THREE.Mesh(
    new THREE.SphereGeometry(0.023, 10, 8),
    new THREE.MeshBasicMaterial({ color: calloutColor, depthTest: false }),
  );
  anchor.position.copy(end);
  anchor.renderOrder = 2;
  group.add(anchor);
}

function calloutLabel(text, group, position, color) {
  const sprite = label(text, group, position, color);
  sprite.renderOrder = 3;
  return sprite;
}

function makeGrainMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  let seed = 8719;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  context.fillStyle = '#9b856a';
  context.fillRect(0, 0, 512, 512);

  // Fine mineral grains and faint bedding streaks, generated locally so the
  // model remains available offline and the material doesn't look airbrushed.
  for (let i = 0; i < 26000; i++) {
    const lightGrain = random() > 0.48;
    const tone = lightGrain ? 224 : 38;
    const alpha = 0.045 + random() * 0.19;
    const size = random() * (lightGrain ? 2.3 : 1.7) + 0.35;
    const x = random() * 512, y = random() * 512;
    context.fillStyle = `rgba(${tone},${tone * (lightGrain ? 0.91 : 0.84)},${tone * (lightGrain ? 0.76 : 0.68)},${alpha})`;
    context.beginPath();
    context.ellipse(x, y, size * (0.8 + random() * 1.1), size * (0.45 + random() * 0.55), random() * Math.PI, 0, Math.PI * 2);
    context.fill();
  }
  // Sparse coarse grains give the exposed cut face scale and a broken-rock feel.
  for (let i = 0; i < 1800; i++) {
    const size = 1.2 + random() * 3.8;
    const shade = random() > 0.5 ? '226,204,166' : '48,39,31';
    context.fillStyle = `rgba(${shade},${0.12 + random() * 0.22})`;
    context.beginPath();
    context.ellipse(random() * 512, random() * 512, size, size * (0.45 + random() * 0.5), random() * Math.PI, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 0.13;
  for (let i = 0; i < 38; i++) {
    const y = random() * 512;
    context.strokeStyle = i % 3 === 0 ? '#302c25' : '#e2c99e';
    context.lineWidth = random() * 1.4 + 0.25;
    context.beginPath();
    context.moveTo(0, y);
    context.bezierCurveTo(140, y - 7, 340, y + 8, 512, y - 2);
    context.stroke();
  }
  context.globalAlpha = 1;
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2.7, 2.1);
  map.anisotropy = 8;
  return map;
}

function createStrata(group) {
  const grainMap = makeGrainMap();
  const base = -3.05;
  const fold = (x, z) => 0.12 * Math.sin(x * 0.48 + z * 0.2)
    + 0.08 * Math.sin(z * 0.92 - x * 0.18)
    + 0.045 * Math.sin(x * 1.9 + z * 1.1);
  const channel = (x, z) => 0.22 * Math.exp(-(((x + 0.25) ** 2) / 2.5 + ((z - 0.15) ** 2) / 0.8));
  const horizon = (bed, x, z) => base + bed * bedThickness + fold(x, z)
    - channel(x, z) * THREE.MathUtils.smoothstep(bed, 0.7, 5.4)
    + 0.025 * Math.sin(x * 3.2 + z * 2.1 + bed * 0.72);
  group.userData.sedimentSurfaceAt = (x, z) => horizon(bedColors.length, x, z);
  const edgeWarp = (x, z, bed) => {
    const edgeX = THREE.MathUtils.smoothstep(Math.abs(x) / halfWidth, 0.78, 0.99);
    const edgeZ = THREE.MathUtils.smoothstep(Math.abs(z) / halfDepth, 0.76, 0.99);
    return [
      x + Math.sign(x) * edgeX * (Math.sin(z * 1.6 + bed * 0.7) * 0.12 + Math.sin(z * 4.1) * 0.035),
      z + Math.sign(z) * edgeZ * (Math.sin(x * 1.2 - bed * 0.55) * 0.1 + Math.cos(x * 3.1) * 0.025),
    ];
  };

  const cols = 54;
  const rows = 34;
  const beds = [];
  for (let bedIndex = 0; bedIndex < bedColors.length; bedIndex++) {
    const bed = bedIndex + 1;
    const bedGroup = new THREE.Group();
    beds.push(bedGroup);
    group.add(bedGroup);
    const positions = [];
    const uvs = [];
    const indices = [];
    const faces = [];
    const addFace = (verts) => {
      const start = positions.length / 3;
      verts.forEach(([x, y, z, u, v]) => { positions.push(x, y, z); uvs.push(u, v); });
      faces.push(start, start + 1, start + 2, start, start + 2, start + 3);
    };

    for (let row = 0; row <= rows; row++) {
      const z0 = -halfDepth + 2 * halfDepth * row / rows;
      for (let col = 0; col <= cols; col++) {
        const x0 = -halfWidth + 2 * halfWidth * col / cols;
        const [x, z] = edgeWarp(x0, z0, bed);
        positions.push(x, horizon(bed, x0, z0), z);
        uvs.push(col / cols * 5.4, row / rows * 4.2);
      }
    }
    const topCount = (rows + 1) * (cols + 1);
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
      const a = row * (cols + 1) + col;
      const b = a + cols + 1;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }

    const bottomStart = positions.length / 3;
    for (let row = 0; row <= rows; row++) {
      const z0 = -halfDepth + 2 * halfDepth * row / rows;
      for (let col = 0; col <= cols; col++) {
        const x0 = -halfWidth + 2 * halfWidth * col / cols;
        const [x, z] = edgeWarp(x0, z0, bed - 1);
        positions.push(x, horizon(bed - 1, x0, z0), z);
        uvs.push(col / cols * 5.4, row / rows * 4.2);
      }
    }
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
      const a = bottomStart + row * (cols + 1) + col;
      const b = a + cols + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }

    // Broken, slightly eroded block edges expose the true bedding thickness.
    const side = (x1, z1, x2, z2, u1, u2) => {
      const [tx1, tz1] = edgeWarp(x1, z1, bed);
      const [tx2, tz2] = edgeWarp(x2, z2, bed);
      const [bx1, bz1] = edgeWarp(x1, z1, bed - 1);
      const [bx2, bz2] = edgeWarp(x2, z2, bed - 1);
      addFace([
        [tx1, horizon(bed, x1, z1), tz1, u1, 0], [tx2, horizon(bed, x2, z2), tz2, u2, 0],
        [bx2, horizon(bed - 1, x2, z2), bz2, u2, 1], [bx1, horizon(bed - 1, x1, z1), bz1, u1, 1],
      ]);
    };
    for (let col = 0; col < cols; col++) {
      const x1 = -halfWidth + 2 * halfWidth * col / cols;
      const x2 = -halfWidth + 2 * halfWidth * (col + 1) / cols;
      side(x1, halfDepth, x2, halfDepth, col / cols, (col + 1) / cols);
      side(x2, -halfDepth, x1, -halfDepth, col / cols, (col + 1) / cols);
    }
    for (let row = 0; row < rows; row++) {
      const z1 = -halfDepth + 2 * halfDepth * row / rows;
      const z2 = -halfDepth + 2 * halfDepth * (row + 1) / rows;
      side(-halfWidth, z2, -halfWidth, z1, row / rows, (row + 1) / rows);
      side(halfWidth, z1, halfWidth, z2, row / rows, (row + 1) / rows);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex([...indices, ...faces]);
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({
      map: grainMap,
      bumpMap: grainMap,
      bumpScale: 0.095,
      color: bedColors[bedIndex],
      roughness: bedIndex % 3 === 1 ? 0.99 : 0.93,
      side: THREE.DoubleSide,
    });
    bedGroup.add(new THREE.Mesh(geometry, material));
  }

  const ageLabels = new THREE.Group();
  group.add(ageLabels);
  let currentSedimentStage = 3;
  let currentFossilizationStage = 3;
  const syncFossilVisibility = () => { fossilParts.visible = [2, 4, 6, bedColors.length][currentSedimentStage] >= 1; };
  group.userData.setSedimentStage = (stage) => {
    currentSedimentStage = stage;
    const visibleBeds = [2, 4, 6, bedColors.length][stage] ?? bedColors.length;
    beds.forEach((bed, index) => { bed.visible = index < visibleBeds; });
    ageLabels.visible = stage === 3;
    syncFossilVisibility();
  };
  group.userData.setFossilizationStage = (stage) => {
    currentFossilizationStage = stage;
    const fossilTone = ['#604938', '#604938', '#b58345', '#d5bb8e'][stage] ?? '#d5bb8e';
    fossilBody.traverse((object) => { if (object.isMesh && object.material?.color) object.material.color.set(fossilTone); });
    fossilBody.position.y = stage === 0 ? horizon(1, fossilX, halfDepth) + 0.03 - fossilY : 0;
    fossilAnnotations.visible = stage > 0;
    syncFossilVisibility();
  };

  // A small ammonite shell, shown as an educational schematic in the cut face.
  const fossilParts = new THREE.Group();
  group.add(fossilParts);
  const fossilBody = new THREE.Group();
  fossilParts.add(fossilBody);
  const fossilAnnotations = new THREE.Group();
  fossilParts.add(fossilAnnotations);
  const fossilX = -1.65;
  const fossilY = horizon(3.5, fossilX, halfDepth) + 0.03;
  const [, fossilEdgeZ] = edgeWarp(fossilX, halfDepth, 4);
  const fossilZ = fossilEdgeZ + 0.025;
  const shellBase = new THREE.Mesh(new THREE.SphereGeometry(0.36, 32, 20), new THREE.MeshStandardMaterial({ color: '#c39150', roughness: 0.88 }));
  shellBase.position.set(fossilX, fossilY, fossilZ - 0.09);
  shellBase.scale.set(1, 0.88, 0.12);
  fossilBody.add(shellBase);
  const spiralPoints = [];
  for (let i = 0; i <= 180; i++) {
    const t = i / 180 * Math.PI * 4.6;
    const radius = 0.045 + i / 180 * 0.29;
    spiralPoints.push(new THREE.Vector3(fossilX + Math.cos(t) * radius, fossilY + Math.sin(t) * radius, fossilZ));
  }
  const spiral = new THREE.CatmullRomCurve3(spiralPoints);
  fossilBody.add(new THREE.Mesh(new THREE.TubeGeometry(spiral, 180, 0.027, 6, false), new THREE.MeshStandardMaterial({ color: '#4d3927', roughness: 0.84 })));
  const center = new THREE.Mesh(new THREE.SphereGeometry(0.047, 12, 8), new THREE.MeshStandardMaterial({ color: '#d8c39d', roughness: 0.82 }));
  center.position.set(fossilX, fossilY, fossilZ);
  center.scale.z = 0.3;
  fossilBody.add(center);

  const recentTarget = [2.55, horizon(bedColors.length, 2.55, halfDepth) + 0.03, edgeWarp(2.55, halfDepth, bedColors.length)[1] + 0.04];
  const ancientTarget = [2.55, horizon(0, 2.55, halfDepth) + 0.03, edgeWarp(2.55, halfDepth, 0)[1] + 0.04];
  addCalloutLine(ageLabels, [-0.85, 1.48, 0.45], recentTarget);
  addCalloutLine(ageLabels, [0.95, -2.62, 0.45], ancientTarget);
  addCalloutLine(fossilAnnotations, [-1.25, -0.55, 2.55], [fossilX, fossilY, fossilZ + 0.045]);
  addCalloutLine(fossilAnnotations, [-1.1, -2.05, 2.55], [fossilX + 0.23, fossilY + 0.08, fossilZ + 0.045]);
  calloutLabel('PLUS RÉCENT · COUCHE SUPÉRIEURE', ageLabels, [-0.85, 1.48, 0.45], '#f0dfc0');
  calloutLabel('PLUS ANCIEN · COUCHE INFÉRIEURE', ageLabels, [0.95, -2.62, 0.45], '#f0dfc0');
  calloutLabel('AMMONITE · FOSSILE MARIN', fossilAnnotations, [-1.25, -0.55, 2.55], '#f0dfc0');
  calloutLabel('COQUILLE SPIRALÉE · LOGES', fossilAnnotations, [-1.1, -2.05, 2.55], '#f0dfc0');
  group.userData.setSedimentStage(3);
  group.userData.setFossilizationStage(3);

  // The same fine sediment texture is shared across all layers to keep draw
  // calls light on student phones.
}

export function buildSedimentaryBlock(group) {
  createStrata(group);
}

export function loadFossilSite(group, onDecoderReady, isCancelled = () => false) {
  const loader = new GLTFLoader();
  const decoder = new DRACOLoader();
  decoder.setDecoderPath('/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/draco/');
  loader.setDRACOLoader(decoder);
  onDecoderReady(decoder);
  loader.load('/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/models/fossils/cerro-ballena-mpc-677.glb', (asset) => {
    if (isCancelled()) return;
    const fossilSite = asset.scene;
    fitModelToScene(fossilSite, 5.5);
    fossilSite.position.set(0.35, 0, -0.15);
    fossilSite.rotation.y = -0.16;
    // Rest the scan on the upper sediment bed. Its old fixed Y offset left a
    // visible air gap beneath the fossil-bearing ground surface.
    fossilSite.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(fossilSite);
    const groundAtCenter = group.userData.sedimentSurfaceAt?.(0.35, -0.15) ?? 0.39;
    fossilSite.position.y += groundAtCenter - bounds.min.y - 0.12;
    fossilSite.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      if (Array.isArray(object.material)) object.material.forEach((material) => { material.roughness = Math.max(material.roughness ?? 0.8, 0.72); });
      else if (object.material) object.material.roughness = Math.max(object.material.roughness ?? 0.8, 0.72);
    });
    group.add(fossilSite);
    fossilSite.userData.isFossilSiteScan = true;
    fossilSite.updateMatrixWorld(true);
    const finalBounds = new THREE.Box3().setFromObject(fossilSite);
    const scanCenter = finalBounds.getCenter(new THREE.Vector3());
    const scanLabelPosition = [0.15, 2.85, -0.1];
    addCalloutLine(group, scanLabelPosition, [scanCenter.x, scanCenter.y, scanCenter.z]);
    calloutLabel('SCAN RÉEL · CERRO BALLENA', group, scanLabelPosition, '#f1d9a8');
    const scanLabel = group.children[group.children.length - 1];
    group.userData.setSedimentStage = ((setStage) => (stage) => {
      setStage(stage);
      fossilSite.visible = stage === 3;
      scanLabel.visible = stage === 3;
    })(group.userData.setSedimentStage);
  }, undefined, (error) => {
    console.error('Échec du chargement du scan 3D local de Cerro Ballena.', error);
    if (!isCancelled()) label('Scan 3D indisponible', group, [0, 0, 0], '#ef9272');
  });
  return decoder;
}
