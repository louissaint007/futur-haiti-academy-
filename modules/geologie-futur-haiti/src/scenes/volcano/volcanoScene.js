import * as THREE from 'three';
import { addJsonSurface, label, mesh, texture } from '../shared/threeHelpers.js';

export function buildVolcano(group, showLabels = true) {
  const parts = {};
  const part = (id) => { const section = new THREE.Group(); section.name = `volcano-part:${id}`; section.userData.volcanoPart = id; group.add(section); parts[id] = section; return section; };
  const coneSection = part('cone'), craterSection = part('crater'), ventSection = part('main-vent'), conduitSection = part('conduit');
  const chamberSection = part('chamber'), lavaSection = part('lava-flow'), ashSection = part('ash-cloud'), layersSection = part('layers');
  const sideVentSection = part('side-vent'), channelSection = part('channels'), dikeSection = part('dike'), sillSection = part('sill');
  group.userData.volcanoParts = parts;
  const profile = [[4.55, -3.18], [4.32, -2.9], [3.95, -2.45], [3.48, -1.8], [2.98, -1.05], [2.47, -0.2], [2.0, 0.55], [1.62, 1.2], [1.3, 1.66], [1.08, 1.88], [1.14, 1.96], [1.0, 1.86], [0.84, 1.58], [0.58, 1.38], [0.24, 1.34], [0, 1.34]];
  const denseProfile = [];
  for (let i = 0; i < profile.length - 1; i++) for (let step = 0; step < 4; step++) {
    const t = step / 4; denseProfile.push([THREE.MathUtils.lerp(profile[i][0], profile[i + 1][0], t), THREE.MathUtils.lerp(profile[i][1], profile[i + 1][1], t)]);
  }
  denseProfile.push(profile.at(-1));
  const summitRimIndex = 10 * 4;
  const coneProfile = denseProfile.slice(0, summitRimIndex + 1);
  const vertices = [], uvs = [], indices = [], segments = 192;
  for (let j = 0; j < coneProfile.length; j++) for (let i = 0; i <= segments; i++) {
    const a = i / segments * Math.PI * 2, [r, y] = coneProfile[j];
    const broadRidge = Math.sin(a * 2.3 + 0.45) * 0.34 + Math.sin(a * 5.1 - 0.8) * 0.16 + Math.cos(a * 8.2 + 1.7) * 0.08;
    const gullies = Math.sin(a * 13.7 + j * 0.31) * 0.055 + Math.sin(a * 24.2 - j * 0.17) * 0.026;
    const sector = (angle, center) => Math.atan2(Math.sin(angle - center), Math.cos(angle - center));
    const collapse = Math.exp(-(sector(a, 0.78) ** 2) / 0.2);
    const upper = THREE.MathUtils.smoothstep(y, 0.72, 1.96);
    const roughness = (broadRidge + gullies + collapse * upper * 0.32) * Math.min(1, r * 0.75);
    const lean = THREE.MathUtils.smoothstep(y, -3.18, 2.04) * 0.36;
    const brokenRim = collapse * upper * 0.74 + Math.sin(a * 4.1 + 0.6) * upper * 0.16;
    const flankRelief = Math.sin(a * 11 + y * 2.1) * Math.sin(y * 1.1 + a * 2.4) * 0.075;
    vertices.push(Math.cos(a) * (r + roughness) + lean, y - brokenRim + flankRelief, Math.sin(a) * (r + roughness));
    uvs.push(i / segments, j / (coneProfile.length - 1));
  }
  for (let j = 0; j < coneProfile.length - 1; j++) for (let i = 0; i < segments; i++) { const a = j * (segments + 1) + i, b = a + segments + 1; indices.push(a, b, a + 1, b, b + 1, a + 1); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geo.setIndex(indices); geo.computeVertexNormals();
  const cone = mesh(geo, new THREE.MeshStandardMaterial({ map: texture('volcano'), bumpMap: texture('volcano'), bumpScale: 0.035, roughness: 0.94 }), coneSection); cone.material.side = THREE.DoubleSide;

  // The summit opening is modeled as the inside wall of the cone itself, not a torus or floating disk.
  const craterProfile = [[1.14, 1.96], [1.08, 1.82], [0.96, 1.64], [0.8, 1.45], [0.61, 1.31], [0.39, 1.26], [0.17, 1.25], [0, 1.24]];
  const craterVertices = [], craterColors = [], craterUvs = [], craterIndices = [], craterSegments = 128;
  const summitSurfacePoint = (angle, radius, height, isRim = false) => {
    const broadRidge = Math.sin(angle * 2.3 + 0.45) * 0.34 + Math.sin(angle * 5.1 - 0.8) * 0.16 + Math.cos(angle * 8.2 + 1.7) * 0.08;
    const gullies = Math.sin(angle * 13.7 + (isRim ? summitRimIndex : height * 4) * 0.31) * 0.055 + Math.sin(angle * 24.2 - (isRim ? summitRimIndex : height * 4) * 0.17) * 0.026;
    const sector = Math.atan2(Math.sin(angle - 0.78), Math.cos(angle - 0.78));
    const upper = THREE.MathUtils.smoothstep(height, 0.72, 1.96), collapse = Math.exp(-(sector * sector) / 0.2);
    const roughness = (broadRidge + gullies + collapse * upper * 0.32) * Math.min(1, radius * 0.75);
    const lean = THREE.MathUtils.smoothstep(height, -3.18, 2.04) * 0.36;
    const brokenRim = collapse * upper * 0.74 + Math.sin(angle * 4.1 + 0.6) * upper * 0.16;
    const flankRelief = Math.sin(angle * 11 + height * 2.1) * Math.sin(height * 1.1 + angle * 2.4) * 0.075;
    const wallRelief = isRim ? 0 : Math.sin(angle * 17 + height * 21) * 0.018 + Math.sin(angle * 31 - height * 13) * 0.009;
    const edgeRadius = radius + roughness + (isRim ? 0 : wallRelief);
    return [Math.cos(angle) * edgeRadius + lean, height - brokenRim + flankRelief + wallRelief * 0.45, Math.sin(angle) * edgeRadius];
  };
  for (let ring = 0; ring < craterProfile.length; ring++) {
    const [radius, height] = craterProfile[ring];
    for (let i = 0; i <= craterSegments; i++) {
      const angle = i / craterSegments * Math.PI * 2;
      const isRim = ring === 0;
      const point = summitSurfacePoint(angle, radius, height, isRim);
      craterVertices.push(...point);
      const band = ring / (craterProfile.length - 1);
      const strata = Math.sin(angle * 19 + ring * 1.7) * 0.035 + Math.sin(angle * 37 - ring * 0.8) * 0.018;
      const color = new THREE.Color().setRGB(
        THREE.MathUtils.lerp(0.39, 0.095, band) + strata,
        THREE.MathUtils.lerp(0.28, 0.07, band) + strata * 0.72,
        THREE.MathUtils.lerp(0.19, 0.045, band) + strata * 0.45,
        THREE.SRGBColorSpace,
      );
      craterColors.push(color.r, color.g, color.b);
      craterUvs.push(i / craterSegments, band);
    }
  }
  for (let ring = 0; ring < craterProfile.length - 1; ring++) for (let i = 0; i < craterSegments; i++) {
    const a = ring * (craterSegments + 1) + i, b = a + craterSegments + 1;
    craterIndices.push(a, a + 1, b, a + 1, b + 1, b);
  }
  const craterGeo = new THREE.BufferGeometry();
  craterGeo.setAttribute('position', new THREE.Float32BufferAttribute(craterVertices, 3));
  craterGeo.setAttribute('color', new THREE.Float32BufferAttribute(craterColors, 3));
  craterGeo.setAttribute('uv', new THREE.Float32BufferAttribute(craterUvs, 2));
  craterGeo.setIndex(craterIndices); craterGeo.computeVertexNormals();
  mesh(craterGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide }), craterSection);

  const addRelief = (geometry, amount = 0.025) => {
    geometry.computeVertexNormals();
    const positions = geometry.attributes.position, normals = geometry.attributes.normal;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
      const noise = (Math.sin(x * 13.1 + y * 7.7) * Math.cos(z * 11.3 - x * 4.2) + Math.sin(y * 19 + z * 8.1) * 0.42) * amount;
      positions.setXYZ(i, x + normals.getX(i) * noise, y + normals.getY(i) * noise, z + normals.getZ(i) * noise);
    }
    geometry.computeVertexNormals();
    return geometry;
  };
  const sideVentCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.08, -0.35, -0.03), new THREE.Vector3(-0.18, 0.02, -0.34),
    new THREE.Vector3(-0.72, 0.12, -0.82), new THREE.Vector3(-1.12, 0.2, -1.18),
  ]);
  mesh(new THREE.TubeGeometry(sideVentCurve, 36, 0.1, 10, false), new THREE.MeshStandardMaterial({ color: '#8e4932', emissive: '#39180f', emissiveIntensity: 0.25, roughness: 0.7 }), sideVentSection);
  for (const [height, radius, start, end] of [[-1.72, 3.35, 0.1, 3.0], [-2.48, 4.05, 0.18, 2.95]]) {
    const benchPoints = [];
    for (let i = 0; i <= 70; i++) {
      const a = start + (end - start) * i / 70;
      const y = height + Math.sin(a * 3.2 + height) * 0.085 + Math.sin(a * 8.4) * 0.035;
      const r = radius + Math.sin(a * 5.2) * 0.12;
      benchPoints.push(new THREE.Vector3(Math.cos(a) * r + 0.28, y, Math.sin(a) * r));
    }
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(benchPoints), 160, 0.026, 5, false), new THREE.MeshStandardMaterial({ color: '#514233', roughness: 1 }), layersSection);
  }
  // Uneven magma conduits and reservoirs replace the smooth primitive shapes.
  const conduitCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.1, -2.34, -0.03), new THREE.Vector3(0.17, -1.78, -0.1),
    new THREE.Vector3(0.06, -1.08, 0.04), new THREE.Vector3(0.12, -0.35, 0.02),
    new THREE.Vector3(0.08, 0.42, -0.05), new THREE.Vector3(0.08, 1.23, -0.03),
  ]);
  mesh(addRelief(new THREE.TubeGeometry(conduitCurve, 72, 0.14, 16, false), 0.025), new THREE.MeshStandardMaterial({ color: '#49362a', roughness: 1 }), conduitSection);
  const ventOpening = mesh(addRelief(new THREE.SphereGeometry(1, 32, 16), 0.035), new THREE.MeshStandardMaterial({ color: '#d68b43', emissive: '#8b2c12', emissiveIntensity: 0.6, roughness: 0.85 }), ventSection, [0.08, 1.255, -0.03]);
  ventOpening.scale.set(0.15, 0.035, 0.12);
  const chamber = mesh(addRelief(new THREE.SphereGeometry(1, 48, 32), 0.1), new THREE.MeshStandardMaterial({ color: '#e05a24', emissive: '#b52e0b', emissiveIntensity: 0.75, roughness: 0.82 }), chamberSection, [0.1, -2.38, -0.03]); chamber.scale.set(1.02, 0.48, 0.82);
  const dikeShape = new THREE.Shape();
  dikeShape.moveTo(-0.075, -1.12); dikeShape.lineTo(-0.11, -0.76); dikeShape.lineTo(-0.065, -0.3);
  dikeShape.lineTo(-0.09, 0.16); dikeShape.lineTo(-0.045, 0.68); dikeShape.lineTo(0.015, 1.12);
  dikeShape.lineTo(0.09, 0.72); dikeShape.lineTo(0.055, 0.22); dikeShape.lineTo(0.11, -0.26);
  dikeShape.lineTo(0.062, -0.72); dikeShape.lineTo(0.09, -1.08); dikeShape.closePath();
  const dikeGeometry = new THREE.ExtrudeGeometry(dikeShape, { depth: 0.17, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.035, bevelThickness: 0.035, curveSegments: 2 });
  const dike = mesh(addRelief(dikeGeometry, 0.018), new THREE.MeshStandardMaterial({ color: '#ad5735', emissive: '#4c1c10', emissiveIntensity: 0.24, roughness: 0.9 }), dikeSection, [-0.72, -0.95, -0.13]); dike.rotation.z = -0.18;
  const sill = mesh(addRelief(new THREE.SphereGeometry(1, 40, 24), 0.075), new THREE.MeshStandardMaterial({ color: '#96523a', roughness: 0.92 }), sillSection, [0.08, -2.02, -0.03]); sill.scale.set(0.78, 0.12, 0.65);
  const flowPoints = [[0.42, 1.63, 1.08], [0.72, 1.05, 1.46], [0.38, 0.42, 1.95], [0.82, -0.28, 2.48], [0.45, -1.08, 3.02], [0.86, -2.0, 3.62], [0.2, -2.87, 4.1]];
  const flowOnCone = (width, material, parent, lift = 0.012, pathPoints = flowPoints) => {
    const flowCurve = new THREE.CatmullRomCurve3(pathPoints.map((point) => new THREE.Vector3(...point)));
    const vertices = [], uvs = [], indices = [], sideSegments = 72;
    const surfacePoint = (angle, y) => {
      let segment = 0;
      while (segment < 9 && profile[segment + 1][1] < y) segment++;
      const [r0, y0] = profile[segment], [r1, y1] = profile[segment + 1];
      const blend = THREE.MathUtils.clamp((y - y0) / (y1 - y0), 0, 1);
      const radius = THREE.MathUtils.lerp(r0, r1, blend);
      const ring = (segment + blend) * 4;
      const sector = Math.atan2(Math.sin(angle - 0.78), Math.cos(angle - 0.78));
      const broad = Math.sin(angle * 2.3 + 0.45) * 0.34 + Math.sin(angle * 5.1 - 0.8) * 0.16 + Math.cos(angle * 8.2 + 1.7) * 0.08;
      const gullies = Math.sin(angle * 13.7 + ring * 0.31) * 0.055 + Math.sin(angle * 24.2 - ring * 0.17) * 0.026;
      const upper = THREE.MathUtils.smoothstep(y, 0.72, 1.96), collapse = Math.exp(-(sector * sector) / 0.2);
      const roughness = (broad + gullies + collapse * upper * 0.32) * Math.min(1, radius * 0.75);
      const lean = THREE.MathUtils.smoothstep(y, -3.18, 2.04) * 0.36;
      const brokenRim = collapse * upper * 0.74 + Math.sin(angle * 4.1 + 0.6) * upper * 0.16;
      const flankRelief = Math.sin(angle * 11 + y * 2.1) * Math.sin(y * 1.1 + angle * 2.4) * 0.075;
      const edgeRadius = radius + roughness + 0.012;
      return [Math.cos(angle) * edgeRadius + lean, y - brokenRim + flankRelief + lift, Math.sin(angle) * edgeRadius];
    };
    for (let i = 0; i <= sideSegments; i++) {
      const t = i / sideSegments, point = flowCurve.getPointAt(t), angle = Math.atan2(point.z, point.x);
      let segment = 0;
      while (segment < 9 && profile[segment + 1][1] < point.y) segment++;
      const blend = THREE.MathUtils.clamp((point.y - profile[segment][1]) / (profile[segment + 1][1] - profile[segment][1]), 0, 1);
      const radius = THREE.MathUtils.lerp(profile[segment][0], profile[segment + 1][0], blend);
      const taper = Math.sin(Math.PI * (0.12 + 0.82 * t)) * 0.65 + 0.35, halfAngle = width * taper / (2 * radius);
      for (const sign of [-1, 1]) {
        vertices.push(...surfacePoint(angle + sign * halfAngle, point.y));
        uvs.push(t, sign * 0.5 + 0.5);
      }
      if (i < sideSegments) { const a = i * 2; indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    material.side = THREE.DoubleSide;
    return mesh(geometry, material, parent);
  };
  const gullyMat = new THREE.MeshStandardMaterial({ color: '#382b22', roughness: 1, transparent: true, opacity: 0.34 });
  for (const [angle, channel] of [[0.85, 0], [2.18, 1]]) {
    const points = [];
    for (let i = 0; i <= 18; i++) {
      const t = i / 18, y = 1.55 - t * 4.25, r = 1.2 + t * 2.8;
      const a = angle + Math.sin(t * 7 + channel) * 0.075;
      const rough = Math.sin(a * 5.1 - 0.8) * 0.14 + Math.cos(a * 8.2 + 1.7) * 0.06;
      points.push([Math.cos(a) * (r + rough) + t * 0.35, y, Math.sin(a) * (r + rough)]);
    }
    flowOnCone(0.045, gullyMat, channelSection, 0.008, points);
  }
  const crustedFlow = new THREE.MeshStandardMaterial({ map: texture('volcano'), bumpMap: texture('volcano'), bumpScale: 0.035, color: '#b2a184', emissive: '#281b10', emissiveIntensity: 0.16, roughness: 1 });
  flowOnCone(0.36, crustedFlow, lavaSection, 0.01);
  const lavaMat = new THREE.MeshStandardMaterial({ map: texture('lava'), emissive: new THREE.Color('#ff4a12'), emissiveMap: texture('lava'), emissiveIntensity: 1.15, roughness: 0.75 });
  const lavaStream = flowOnCone(0.16, lavaMat, lavaSection, 0.026);
  const lavaCore = flowOnCone(0.045, new THREE.MeshBasicMaterial({ color: '#ffd27a', transparent: true, opacity: 0.9 }), lavaSection, 0.04);
  group.userData.lava = [lavaMat, lavaStream, lavaCore];
  // Intense eruptions throw visible molten blobs from the crater. Their size
  // and short ballistic arcs read as lava, rather than tiny fire-like sparks.
  const lavaFragments = [];
  const fragmentGeometry = new THREE.SphereGeometry(0.1, 10, 8);
  const fragmentColors = ['#ff5a18', '#ff7a1c', '#d93612', '#ff9b32'];
  for (let i = 0; i < 36; i++) {
    const material = new THREE.MeshStandardMaterial({
      color: fragmentColors[i % fragmentColors.length],
      emissive: new THREE.Color(fragmentColors[i % fragmentColors.length]),
      emissiveIntensity: 0.72,
      roughness: 0.72,
      toneMapped: false,
    });
    const fragment = mesh(fragmentGeometry, material, lavaSection);
    fragment.visible = false;
    fragment.userData = {
      index: i,
      angle: i * 2.399 + (i % 3) * 0.18,
      phase: (i * 0.61803398875) % 1,
      reach: 0.72 + ((i * 7) % 13) * 0.14,
      height: 1.25 + ((i * 11) % 12) * 0.17,
      size: 0.62 + ((i * 5) % 8) * 0.11,
    };
    lavaFragments.push(fragment);
  }
  group.userData.lavaFragments = lavaFragments;
  const smoke = new THREE.Group(); ashSection.add(smoke);
  const puffCanvas = document.createElement('canvas'); puffCanvas.width = puffCanvas.height = 64;
  const puffCtx = puffCanvas.getContext('2d'), puffGradient = puffCtx.createRadialGradient(32, 32, 2, 32, 32, 31);
  puffGradient.addColorStop(0, 'rgba(222,217,207,0.78)'); puffGradient.addColorStop(0.32, 'rgba(188,185,177,0.55)'); puffGradient.addColorStop(0.7, 'rgba(143,143,137,0.27)'); puffGradient.addColorStop(1, 'rgba(95,93,89,0)');
  puffCtx.fillStyle = puffGradient; puffCtx.fillRect(0, 0, 64, 64);
  const puffMap = new THREE.CanvasTexture(puffCanvas), ashPuffs = [];
  // Several staggered streams keep the column continuous while leaving enough
  // space for billows to spread into an umbrella cloud above the crater.
  for (let i = 0; i < 156; i++) {
    const progress = (i % 78) / 77, angle = i * 2.399, radius = (0.12 + progress * 0.82) * (0.35 + ((i * 17) % 19) / 19);
    const tint = ['#d0ccc2', '#b9b7b0', '#a8a69f', '#c4beb2'][i % 4];
    const puff = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffMap, color: tint, transparent: true, opacity: 0.68, depthWrite: false, blending: THREE.NormalBlending }));
    puff.userData = { angle, radius, progress, phase: ((i % 78) / 78 + (i >= 78 ? 0.47 : 0)) % 1, size: 0.48 + progress * 0.9 };
    puff.scale.set(puff.userData.size, puff.userData.size * 0.82, 1); smoke.add(puff); ashPuffs.push(puff);
  }
  group.userData.ashPuffs = ashPuffs; group.userData.smoke = smoke;
  if (showLabels) {
    const focusLabels = {
      dike: label('Filon (dyke)', dikeSection, [0.85, 1.34, 0.12]),
      sill: label('Filon-couche', sillSection, [0.94, 0.26, 0.12]),
      'ash-cloud': label('Panache de cendres', ashSection, [1.3, 5.45, 0]),
    };
    Object.values(focusLabels).forEach((sprite) => { sprite.visible = false; });
    group.userData.volcanoFocusLabels = focusLabels;
    const callout = (text, parent, target, textPosition, color = '#f1dfbd') => {
      const direction = Math.sign(textPosition[0] - target[0]) || 1;
      const halfWidth = Math.min(4.2, 2 + text.length * 0.12) * 0.43;
      const labelEdge = [textPosition[0] - direction * halfWidth, textPosition[1], textPosition[2]];
      const elbow = [labelEdge[0] + direction * 0.34, (target[1] + labelEdge[1]) * 0.5, (target[2] + labelEdge[2]) * 0.5];
      const leader = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...target), new THREE.Vector3(...elbow), new THREE.Vector3(...labelEdge)]),
        new THREE.LineBasicMaterial({ color: '#d7b77f', transparent: true, opacity: 0.92, depthTest: false, depthWrite: false }),
      );
      leader.renderOrder = 20; parent.add(leader);
      const pin = mesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshBasicMaterial({ color: '#f1c77e', depthTest: false, toneMapped: false }), parent, target);
      pin.renderOrder = 21;
      const textSprite = label(text, parent, textPosition, color); textSprite.renderOrder = 22;
      return { leader, pin, text: textSprite };
    };
    group.userData.volcanoCallouts = [
      callout('Panache de cendres', ashSection, [-0.15, 4.65, 0], [-3.45, 5.25, 0]),
      callout('Cratere', craterSection, [0.52, 1.57, 0.08], [2.9, 2.45, 0.1]),
      callout('Bouche eruptive', ventSection, [0.28, 1.35, 0.3], [3.7, 0.95, 0.35]),
      callout('Cone volcanique', coneSection, [-1.85, -0.35, 1.05], [-4.35, 0.15, 0.7]),
      callout('Coulee de lave', lavaSection, [0.65, -0.5, 2.55], [3.9, -1.45, 2.2]),
    ];
  }
}

export function animateVolcano(group, { time, playing, intense, eruptionType = 'effusive' }) {
  if (!group.userData.smoke) return;
  const explosive = eruptionType === 'explosive';
  const burst = explosive && intense;
  group.userData.ashPuffs?.forEach((puff, index) => {
    if (!explosive && index % 4 !== 0) { puff.visible = false; return; }
    puff.visible = true;
    const { angle, radius, progress, phase, size } = puff.userData, drift = (phase + time * (burst ? 0.2 : 0.11)) % 1;
    const inColumn = progress < 0.7, regionProgress = inColumn ? progress / 0.7 : (progress - 0.7) / 0.3;
    const heightFactor = explosive ? (burst ? 1 : 0.82) : (intense ? 0.5 : 0.34);
    const widthFactor = explosive ? (burst ? 1 : 0.82) : 0.42;
    const plumeWidth = inColumn ? 0.12 + regionProgress * 0.62 * widthFactor : 0.35 + regionProgress * 1.72 * widthFactor;
    const spread = (plumeWidth + radius * (explosive ? 0.48 : 0.2) + drift * (burst ? 0.62 : 0.12)) * (burst ? 1.38 : 1);
    const plumeHeight = inColumn ? 1.8 + regionProgress * (burst ? 3.7 : 3.25) * heightFactor : (explosive ? (burst ? 5.35 : 4.9) : 2.9) + regionProgress * (explosive ? (burst ? 2.05 : 1.45) : 0.65) * heightFactor;
    const turbulence = Math.sin(time * (explosive ? 1.8 : 0.85) + angle * 2.3) * (burst ? 0.22 : explosive ? 0.13 : 0.05);
    puff.position.set(Math.cos(angle + time * 0.08) * spread + Math.sin(time + angle) * (burst ? 0.16 : 0.05) + turbulence, plumeHeight + drift * (burst ? 1.8 : 0.14), Math.sin(angle + time * 0.08) * spread - turbulence);
    const puffSize = size * (explosive ? (0.76 + drift * (burst ? 1.25 : 0.8)) : 0.58 + drift * 0.3) * (burst ? 1.24 : 0.82); puff.scale.set(puffSize, puffSize * 0.86, 1);
    const opacity = explosive ? (0.4 + Math.sin(drift * Math.PI) * 0.2) * (burst ? 1.25 : 1) : (0.18 + Math.sin(drift * Math.PI) * 0.08) * (intense ? 1.15 : 1);
    puff.material.opacity = Math.min(explosive ? (burst ? 0.86 : 0.68) : 0.3, opacity * (1 - drift * 0.2));
  });
  group.userData.lavaFragments?.forEach((fragment) => {
    const { angle, phase, reach, height, size, index } = fragment.userData;
    fragment.visible = explosive && (intense || index % 3 === 0);
    if (!fragment.visible) return;
    const flight = (phase + time * (intense ? 0.68 : 0.42)) % 1;
    const arc = Math.sin(flight * Math.PI);
    const radius = 0.18 + flight * reach * (intense ? 1 : 0.62);
    fragment.position.set(
      0.22 + Math.cos(angle) * radius,
      1.62 + arc * height * (intense ? 1 : 0.68) - flight * 0.78,
      Math.sin(angle) * radius,
    );
    const scale = size * (intense ? 1 : 0.62) * (0.82 + arc * 0.55);
    fragment.scale.set(scale, scale * (0.9 + arc * 0.18), scale);
    fragment.rotation.set(flight * 3.2, angle + flight * 2, flight * 1.7);
  });
  const pulse = (eruptionType === 'effusive' ? 1.35 : 0.94) * (intense ? 1.22 : 1) * (playing ? 0.9 + Math.sin(time * 2.5) * 0.1 : 0.9);
  if (group.userData.lava) {
    group.userData.lava[0].emissiveIntensity = pulse;
    group.userData.lava[2].material.opacity = pulse * 0.88;
    if (group.userData.lava[0].map) group.userData.lava[0].map.offset.x = (time * (eruptionType === 'effusive' ? 0.04 : 0.025)) % 1;
  }
}

export function inspectVolcano(group, selectedPart = 'all', exploded = false) {
  const parts = group.userData.volcanoParts;
  if (!parts) return;
  const key = `${selectedPart}:${exploded}`;
  if (group.userData.inspectionKey === key) return;
  group.userData.inspectionKey = key;
  const offsets = { cone:[0,0,-0.9], crater:[0,0.48,0], 'main-vent':[0,0.3,0.3], conduit:[0.14,0,0.55], chamber:[0,-0.78,0.22], 'lava-flow':[0.42,0,0.32], 'ash-cloud':[0,0.9,0], layers:[0,-0.1,-0.32], 'side-vent':[-0.62,0,0], channels:[0,0.12,-0.3], dike:[-0.62,0,0.38], sill:[0,-0.32,0] };
  const applyInspectionStyle = (object, focused) => {
    const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
    materials.forEach((material) => {
      material.userData.baseOpacity ??= material.opacity;
      material.userData.baseTransparent ??= material.transparent;
      material.userData.baseDepthWrite ??= material.depthWrite;
      material.opacity = material.userData.baseOpacity * (focused ? 1 : 0.3);
      material.transparent = material.userData.baseTransparent || !focused;
      material.depthWrite = focused ? material.userData.baseDepthWrite : false;
      material.needsUpdate = true;
    });
  };
  for (const [id, section] of Object.entries(parts)) {
    const focused = selectedPart === 'all' || selectedPart === id;
    const separation = exploded ? 1 : 0;
    section.position.set(...offsets[id].map((value) => value * separation));
    section.traverse((object) => applyInspectionStyle(object, focused));
  }
  Object.entries(group.userData.volcanoFocusLabels ?? {}).forEach(([id, sprite]) => { sprite.visible = selectedPart === id; });
  if (group.userData.terrainSurface) applyInspectionStyle(group.userData.terrainSurface, selectedPart === 'all');
}

export async function loadVolcanoTerrain(group, isCancelled = () => false) {
  const response = await fetch('/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/apps/geologie-futur-haiti/models/volcano/mount-st-helens-dem.json');
  if (!response.ok) throw new Error(`DEM local indisponible (${response.status})`);
  const data = await response.json();
  if (isCancelled()) return null;
  const terrain = addJsonSurface(data, group, { color: '#b2a184', textureKind: 'volcano' });
  group.userData.terrainSurface = terrain;
  group.userData.inspectionKey = null;
  return terrain;
}
