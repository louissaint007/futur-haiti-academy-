import * as THREE from 'three';
import { label, material, mesh } from '../shared/threeHelpers.js';

export function buildRocks(group, rock) {
  const kinds = { Granite: 'granite', Basalte: 'basalt', Grès: 'sandstone', Gneiss: 'gneiss' };
  const textureType = kinds[rock] || 'granite';
  const shape = new THREE.IcosahedronGeometry(1.55, 5), pos = shape.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(pos, i), n = 1 + Math.sin(v.x * 8 + v.y * 3) * 0.045 + Math.sin(v.z * 13 - v.y * 4) * 0.03;
    pos.setXYZ(i, v.x * n, v.y * n, v.z * n);
  }
  shape.computeVertexNormals();
  const stoneMaterial = material(textureType), sample = mesh(shape, stoneMaterial, group, [-1.35, 0.05, 0]);
  sample.rotation.set(0.24, 0.35, -0.12); sample.scale.set(1.15, 0.98, 0.87);
  const chips = Array.from({ length: 8 }, (_, i) => {
    const geom = new THREE.DodecahedronGeometry(0.45 + (i % 3) * 0.12, 1);
    const item = mesh(geom, stoneMaterial, group, [1.45 + (i % 3) * 0.25, -0.8 + Math.floor(i / 3) * 0.63, 0.4 + ((i * 7) % 4) * 0.38]);
    item.rotation.set(i * 0.7, i * 0.4, i * 0.22); return item;
  });
  if (rock === 'Granite') {
    const mineralGeo = new THREE.SphereGeometry(1, 6, 5), mineralColors = ['#c9bda7', '#d5c6a9', '#453b32', '#b2694c'], dummy = new THREE.Object3D();
    mineralColors.forEach((color) => {
      const flecks = new THREE.InstancedMesh(mineralGeo, new THREE.MeshStandardMaterial({ color, roughness: 0.9 }), 60);
      for (let i = 0; i < 60; i++) {
        const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), size = 0.018 + Math.random() * 0.025;
        dummy.position.copy(v.multiplyScalar(1.02)); dummy.scale.set(size * 1.6, size * 0.7, size); dummy.updateMatrix(); flecks.setMatrixAt(i, dummy.matrix);
      }
      sample.add(flecks);
    });
  }
  const plinth = mesh(new THREE.CylinderGeometry(2.1, 2.25, 0.25, 80), new THREE.MeshStandardMaterial({ color: '#292a25', roughness: 0.65 }), group, [0, -1.82, 0]);
  plinth.material.metalness = 0.12; group.userData.rocks = [sample, ...chips]; label(rock, group, [-1.35, 1.95, 0]);
}
