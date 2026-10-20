import * as THREE from 'three';

const textureFiles = {
  volcano: 'volcanic-ash-v2', basalt: 'volcanic-basalt', lava: 'lava',
  granite: 'granite', sandstone: 'sandstone', gneiss: 'gneiss',
};
const textureLoader = new THREE.TextureLoader();

export function texture(kind) {
  const extension = kind === 'volcano' ? 'jpg' : 'png';
  const map = textureLoader.load(`/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/textures/${textureFiles[kind] || textureFiles.volcano}.${extension}`);
  map.colorSpace = THREE.SRGBColorSpace; map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 8;
  const tiling = kind === 'lava' ? 1.25 : kind === 'volcano' ? 3.2 : kind === 'granite' ? 1.7 : kind === 'gneiss' ? 1.4 : 1.8;
  map.repeat.set(tiling, tiling);
  return map;
}

export function material(kind, roughness = 0.94) {
  const map = texture(kind);
  const options = { map, bumpMap: map, bumpScale: kind === 'lava' ? 0.13 : kind === 'volcano' ? 0.035 : 0.075, roughness };
  if (kind === 'lava') Object.assign(options, { emissive: new THREE.Color('#ff5815'), emissiveMap: map, emissiveIntensity: 0.9 });
  return new THREE.MeshStandardMaterial(options);
}

export function mesh(geometry, mat, parent, position = [0, 0, 0], scale) {
  const item = new THREE.Mesh(geometry, mat); item.position.set(...position); if (scale) item.scale.set(...scale); parent.add(item); return item;
}

export function line(points, color, radius, parent) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  return mesh(new THREE.TubeGeometry(curve, Math.max(24, points.length * 5), radius, 8, false), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.38, roughness: 0.42 }), parent);
}

export function label(text, parent, position, color = '#eee1ca') {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 112;
  const ctx = canvas.getContext('2d');
  ctx.beginPath(); ctx.roundRect(4, 8, 504, 96, 22); ctx.fillStyle = 'rgba(17,19,16,0.94)'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(220,176,112,0.78)'; ctx.stroke();
  ctx.font = '700 25px Arial'; ctx.letterSpacing = '2px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.shadowColor = '#000'; ctx.shadowBlur = 5; ctx.fillText(text.toUpperCase(), 256, 56, 470);
  const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, depthTest: false })); sprite.position.set(...position); const width = Math.min(4.2, 2.0 + text.length * 0.12); sprite.scale.set(width, width * 0.22, 1); parent.add(sprite); return sprite;
}

export function surfaceRibbon(points, width, mat, parent) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const samples = curve.getPoints(72), positions = [], uvs = [], indices = [];
  samples.forEach((point, i) => {
    const tangent = curve.getTangentAt(i / (samples.length - 1));
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const taper = Math.sin(Math.PI * (0.12 + 0.82 * i / (samples.length - 1))) * 0.65 + 0.35;
    for (const sign of [-1, 1]) {
      const v = point.clone().addScaledVector(side, sign * width * taper * 0.5); v.y += 0.025;
      positions.push(v.x, v.y, v.z); uvs.push(i / (samples.length - 1), sign * 0.5 + 0.5);
    }
    if (i < samples.length - 1) { const a = i * 2; indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  });
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geometry.setIndex(indices); geometry.computeVertexNormals();
  const flow = mesh(geometry, mat, parent); flow.material.side = THREE.DoubleSide; return flow;
}

export function makePlate(parent, { x, oceanic, name, convergent = false, divergent = false }) {
  const group = new THREE.Group(); group.position.x = x; parent.add(group);
  const width = 4.8, depth = 5.2, cols = 26, rows = 22, positions = [], uvs = [], indices = [];
  group.userData.convergent = convergent;
  const elevation = (u, v) => {
    const edgeDimple = Math.sin(v * Math.PI * 6 + (oceanic ? 1 : 0)) * 0.06;
    const ridge = divergent
      ? 0.78 * Math.exp(-(((u - (x < 0 ? 0.94 : 0.06)) ** 2) / 0.012)) + 0.08 * Math.sin(v * 3 + u * 5)
      : oceanic ? 0.12 * Math.sin(u * 4 + v * 2) : 0.62 * Math.exp(-((u - 0.86) ** 2) / 0.018) + 0.16 * Math.sin(v * 3 + u * 5);
    // In a convergent boundary the oceanic edge bends downward, then curves
    // beneath the overriding plate instead of merely meeting it head-on.
    const subduction = oceanic && group.userData.convergent
      ? -1.22 * Math.exp(-((u - 0.055) ** 2) / 0.012) - 0.34 * Math.exp(-((u - 0.17) ** 2) / 0.035)
      : 0;
    const broadRelief = 0.13 * Math.sin(u * 5.2 + v * 3.1) + 0.09 * Math.cos(v * 7.3 - u * 2.4);
    return (oceanic ? -0.02 : 0.16) + ridge + edgeDimple + subduction + broadRelief;
  };
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) {
    const u = i / cols, v = j / rows, x0 = (u - 0.5) * width, z0 = (v - 0.5) * depth;
    const edgeX = (i === 0 || i === cols)
      ? Math.sin(v * Math.PI * 5 + (oceanic ? 0.7 : 0)) * 0.13 + Math.sin(v * Math.PI * 11 + 1.4) * 0.045
      : 0;
    const edgeZ = (j === 0 || j === rows)
      ? Math.sin(u * Math.PI * 6 + (oceanic ? 1.1 : 0.2)) * 0.11 + Math.sin(u * Math.PI * 13 + 0.8) * 0.04
      : 0;
    positions.push(x0 + edgeX, elevation(u, v), z0 + edgeZ); uvs.push(u * 2, v * 2);
    if (i < cols && j < rows) { const a = j * (cols + 1) + i, b = a + cols + 1; indices.push(a, b, a + 1, b, b + 1, a + 1); }
  }
  const topGeometry = new THREE.BufferGeometry(); topGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); topGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); topGeometry.setIndex(indices); topGeometry.computeVertexNormals();
  const plateMaterial = material(oceanic ? 'sandstone' : 'gneiss', 0.98);
  mesh(topGeometry, plateMaterial, group);
  const perimeter = [];
  for (let i = 0; i <= cols; i++) perimeter.push([i / cols, 0]);
  for (let i = 1; i <= rows; i++) perimeter.push([1, i / rows]);
  for (let i = cols - 1; i >= 0; i--) perimeter.push([i / cols, 1]);
  for (let i = rows - 1; i > 0; i--) perimeter.push([0, i / rows]);
  const bandColors = oceanic ? ['#705644', '#463b32', '#8a684b', '#4b4037', '#66503d'] : ['#b4865e', '#755540', '#c09263', '#59493c', '#8c6445'];
  bandColors.forEach((color, layer) => {
    const bandPositions = [], bandIndices = [], topDrop = layer * 0.22, bottomDrop = (layer + 1) * 0.22;
    perimeter.forEach(([u, v]) => {
      const edgeRipple = Math.sin(v * Math.PI * 9 + u * 17) * 0.035 + Math.sin(u * 23 - v * 11) * 0.018;
      const edgeX = (u === 0 || u === 1)
        ? Math.sin(v * Math.PI * 5 + (oceanic ? 0.7 : 0)) * 0.13 + Math.sin(v * Math.PI * 11 + 1.4) * 0.045
        : 0;
      const edgeZ = (v === 0 || v === 1)
        ? Math.sin(u * Math.PI * 6 + (oceanic ? 1.1 : 0.2)) * 0.11 + Math.sin(u * Math.PI * 13 + 0.8) * 0.04
        : 0;
      const px = (u - 0.5) * width + edgeX;
      const pz = (v - 0.5) * depth + edgeZ;
      const totalThickness = bandColors.length * 0.22;
      const top = elevation(u, v) - topDrop + edgeRipple * (1 - topDrop / totalThickness * 0.45);
      const bottom = elevation(u, v) - bottomDrop + edgeRipple * (1 - bottomDrop / totalThickness * 0.45);
      bandPositions.push(px, top, pz, px, bottom, pz);
    });
    for (let i = 0; i < perimeter.length; i++) {
      const a = i * 2, b = ((i + 1) % perimeter.length) * 2;
      bandIndices.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const bandGeometry = new THREE.BufferGeometry();
    bandGeometry.setAttribute('position', new THREE.Float32BufferAttribute(bandPositions, 3));
    bandGeometry.setIndex(bandIndices); bandGeometry.computeVertexNormals();
    const band = mesh(bandGeometry, new THREE.MeshStandardMaterial({ color, roughness: 0.98, side: THREE.DoubleSide }), group);
    band.material.side = THREE.DoubleSide;
  });
  // Close the underside as a gently uneven crust surface so orbiting below a
  // plate never reveals an empty shell. The edge follows the lowest strata band.
  const bottomPositions = [], bottomUvs = [], bottomIndices = [];
  const totalThickness = bandColors.length * 0.22;
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) {
    const u = i / cols, v = j / rows;
    const edgeX = (i === 0 || i === cols)
      ? Math.sin(v * Math.PI * 5 + (oceanic ? 0.7 : 0)) * 0.13 + Math.sin(v * Math.PI * 11 + 1.4) * 0.045
      : 0;
    const edgeZ = (j === 0 || j === rows)
      ? Math.sin(u * Math.PI * 6 + (oceanic ? 1.1 : 0.2)) * 0.11 + Math.sin(u * Math.PI * 13 + 0.8) * 0.04
      : 0;
    const edgeWeight = Math.max(Math.abs(u - 0.5), Math.abs(v - 0.5)) * 2;
    const edgeRipple = (Math.sin(v * Math.PI * 9 + u * 17) * 0.035 + Math.sin(u * 23 - v * 11) * 0.018) * edgeWeight ** 4;
    bottomPositions.push((u - 0.5) * width + edgeX, elevation(u, v) - totalThickness + edgeRipple * 0.55, (v - 0.5) * depth + edgeZ);
    bottomUvs.push(u * 2, v * 2);
    if (i < cols && j < rows) {
      const a = j * (cols + 1) + i, b = a + cols + 1;
      bottomIndices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const bottomGeometry = new THREE.BufferGeometry();
  bottomGeometry.setAttribute('position', new THREE.Float32BufferAttribute(bottomPositions, 3));
  bottomGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(bottomUvs, 2));
  bottomGeometry.setIndex(bottomIndices); bottomGeometry.computeVertexNormals();
  mesh(bottomGeometry, plateMaterial, group);
  group.userData.oceanic = oceanic; group.userData.elevation = elevation; group.userData.name = name;
  group.userData.restPosition = group.position.clone();
  return group;
}

export function addJsonSurface(data, parent, { color, textureKind, depthTint = false } = {}) {
  const geometry = new THREE.BufferGeometry();
  const [cols, rows] = data.dimensions;
  const positions = Array.from(data.positions);
  const indices = Array.from(data.indices);
  if (textureKind === 'volcano') {
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i], y = positions[i + 1], z = positions[i + 2];
      const radius = Math.hypot(x, z);
      const blend = THREE.MathUtils.smoothstep(radius, 3.25, 7.4);
      const edgeBlend = THREE.MathUtils.smoothstep(Math.max(Math.abs(x), Math.abs(z)), 5.8, 6.98);
      const coneFoot = -3.18 + 0.035 * Math.sin(x * 2.3 + z * 1.7);
      const merged = THREE.MathUtils.lerp(coneFoot, y, blend);
      positions[i + 1] = THREE.MathUtils.lerp(merged, -4.1, edgeBlend);
    }
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const uvs = new Float32Array(cols * rows * 2);
  const colors = depthTint ? new Float32Array(cols * rows * 3) : null;
  const minY = Math.min(...data.positions.filter((_, index) => index % 3 === 1));
  const maxY = Math.max(...data.positions.filter((_, index) => index % 3 === 1));
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const index = j * cols + i, y = data.positions[index * 3 + 1];
    uvs[index * 2] = i / Math.max(cols - 1, 1) * 8;
    uvs[index * 2 + 1] = j / Math.max(rows - 1, 1) * 8;
    if (colors) {
      const depth = THREE.MathUtils.clamp((y - minY) / Math.max(maxY - minY, 0.001), 0, 1);
      const tint = new THREE.Color().setHSL(0.055 + depth * 0.12, 0.25 + depth * 0.15, 0.28 + depth * 0.14);
      colors.set([tint.r, tint.g, tint.b], index * 3);
    }
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  if (colors) geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const map = textureKind ? texture(textureKind) : null;
  const surfaceMaterial = new THREE.MeshStandardMaterial({
    color: color || '#b79770', map, roughness: 0.98, side: THREE.DoubleSide,
    vertexColors: Boolean(colors), bumpMap: map, bumpScale: textureKind === 'volcano' ? 0.035 : 0.06,
  });
  const surface = mesh(geometry, surfaceMaterial, parent);
  surface.receiveShadow = true;
  return surface;
}

export function fitModelToScene(model, targetSize = 5.8) {
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const dimensions = bounds.getSize(new THREE.Vector3());
  const maxDimension = Math.max(dimensions.x, dimensions.y, dimensions.z) || 1;
  model.scale.setScalar(targetSize / maxDimension);
  model.updateMatrixWorld(true);
  const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
  model.position.sub(center);
}
