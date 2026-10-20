import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { hydrocarbon3dById } from './hydrocarbon3dData.js';
import { reaction3dData } from './reaction3dData.js';

const COLORS = { H: '#e8f1ee', C: '#677b83', O: '#ff5f72', N: '#67a8ff', S: '#ffc45d', P: '#ff9860', F: '#8ce09d', Cl: '#7ee0ad', Na: '#b89aff', Mg: '#74d5c1', Fe: '#d77b55', Cu: '#edaa72', B: '#f1a8c8', Ca: '#d9c5a5', Si: '#bdc3ad', e: '#72f4d0', p: '#ff6475', n: '#a9c6d3', rust: '#bc6745' };
const V = (v) => new THREE.Vector3(v[0], v[1], v[2]);
const atomRadius = (symbol) => symbol === 'H' || symbol === 'e' ? 0.24 : symbol === 'O' || symbol === 'N' ? 0.43 : symbol === 'C' ? 0.48 : 0.42;
const formulaLabel = (formula) => ({ H2O: 'H₂O', CO2: 'CO₂', CH4: 'CH₄', NH3: 'NH₃', O2: 'O₂', HCl: 'HCl', NaCl: 'NaCl', C2H4: 'C₂H₄', C2H6: 'C₂H₆' }[formula] || formula);

function sphere(parent, symbol, position, scale = 1, options = {}) {
  const color = COLORS[symbol] || '#9ab2a9';
  const geometry = new THREE.SphereGeometry(atomRadius(symbol) * scale, 40, 32);
  const material = new THREE.MeshPhysicalMaterial({ color, roughness: 0.24, metalness: 0.16, clearcoat: 1, clearcoatRoughness: 0.16, emissive: color, emissiveIntensity: options.glow ? 0.65 : 0.1, transparent: options.opacity != null, opacity: options.opacity ?? 1 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(V(position));
  mesh.userData.chemicalSymbol=symbol;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  if (options.label) {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 128;
    const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, 256, 128); ctx.fillStyle = 'rgba(7,17,22,.76)'; ctx.beginPath(); ctx.roundRect(38, 27, 180, 72, 34); ctx.fill(); ctx.strokeStyle = `${color}aa`; ctx.lineWidth = 4; ctx.stroke(); ctx.font = '700 48px Manrope, Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#f3f8f5'; ctx.fillText(symbol, 128, 64);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
    const hydrogen = symbol === 'H';
    tag.position.copy(V(position)).add(new THREE.Vector3(0, atomRadius(symbol) * scale + (hydrogen ? 0.16 : 0.22), 0));
    tag.scale.set(hydrogen ? 0.42 : 0.56, hydrogen ? 0.23 : 0.28, 1); tag.renderOrder = 20; parent.add(tag);
  }
  return mesh;
}

function bond(parent, start, end, order = 1, color = '#88a89b', thickness = 0.065) {
  const a = V(start), b = V(end), direction = new THREE.Vector3().subVectors(b, a);
  const length = direction.length();
  const basis = Math.abs(direction.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const side = new THREE.Vector3().crossVectors(direction, basis).normalize();
  for (let i = 0; i < order; i++) {
    const offset = (i - (order - 1) / 2) * 0.105;
    const geometry = new THREE.CylinderGeometry(thickness, thickness, length, 16, 1, false);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({ color, roughness: 0.3, metalness: 0.4, emissive: color, emissiveIntensity: 0.18 }));
    mesh.position.copy(a).add(b).multiplyScalar(0.5).addScaledVector(side, offset);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    mesh.castShadow = true; parent.add(mesh);
  }
}

function molecule(parent, formula, origin = [0, 0, 0], scale = 1, options = {}) {
  const sets = {
    H2O: { atoms: ['O', 'H', 'H'], points: [[0, 0, 0], [-0.78, 0.62, 0], [0.78, 0.62, 0]], links: [[0,1,1],[0,2,1]] },
    CO2: { atoms: ['C','O','O'], points: [[0,0,0],[-1.1,0,0],[1.1,0,0]], links: [[0,1,2],[0,2,2]] },
    CH4: { atoms: ['C','H','H','H','H'], points: [[0,0,0],[-0.72,-0.72,-0.72],[0.72,0.72,-0.72],[-0.72,0.72,0.72],[0.72,-0.72,0.72]], links: [[0,1,1],[0,2,1],[0,3,1],[0,4,1]] },
    NH3: { atoms: ['N','H','H','H'], points: [[0,0.05,0],[-0.78,-0.48,0.5],[0.78,-0.48,0.5],[0,-0.48,-0.85]], links: [[0,1,1],[0,2,1],[0,3,1]] },
    H2: { atoms: ['H','H'], points: [[-0.48,0,0],[0.48,0,0]], links: [[0,1,1]] },
    O2: { atoms: ['O','O'], points: [[-0.54,0,0],[0.54,0,0]], links: [[0,1,2]] },
    HCl: { atoms: ['H','Cl'], points: [[-0.55,0,0],[0.55,0,0]], links: [[0,1,1]] },
    NaCl: { atoms: ['Na','Cl'], points: [[-0.55,0,0],[0.55,0,0]], links: [[0,1,0]] },
    C2H4: { atoms: ['C','C','H','H','H','H'], points: [[-0.65,0,0],[0.65,0,0],[-1.05,0.75,0],[-1.05,-0.75,0],[1.05,0.75,0],[1.05,-0.75,0]], links: [[0,1,2],[0,2,1],[0,3,1],[1,4,1],[1,5,1]] },
    C2H6: { atoms: ['C','C','H','H','H','H','H','H'], points: [[-0.73,0,0],[0.73,0,0],[-1.15,0.65,0.5],[-1.15,-0.65,0.5],[-0.73,0,0.85],[1.15,0.65,-0.5],[1.15,-0.65,-0.5],[0.73,0,-0.85]], links: [[0,1,1],[0,2,1],[0,3,1],[0,4,1],[1,5,1],[1,6,1],[1,7,1]] },
  };
  const data = sets[formula] || sets.H2O; const points = data.points.map(([x,y,z]) => [origin[0]+x*scale, origin[1]+y*scale, origin[2]+z*scale]);
  data.links.forEach(([a,b,order]) => { if (order) bond(parent, points[a], points[b], order, '#a6c4b8', 0.055 * scale); });
  data.atoms.forEach((symbol, i) => sphere(parent, symbol, points[i], scale, { label: options.labels }));
  return { points, atoms: data.atoms };
}

function renderMolecularModel(parent, model, scale = 0.72, labels = true) {
  const center = model.atoms.reduce((sum, atom) => sum.map((value, axis) => value + atom.position[axis] / model.atoms.length), [0, 0, 0]);
  const points = new Map(model.atoms.map((atom) => [atom.id, atom.position.map((value, axis) => (value - center[axis]) * scale)]));
  model.bonds.forEach(({ from, to, order }) => bond(parent, points.get(from), points.get(to), order, '#a6c4b8', 0.055 * scale));
  model.atoms.forEach((atom) => sphere(parent, atom.symbol, points.get(atom.id), atom.symbol === 'H' ? 0.78 : 1, { label: labels }));
}

function renderReactionSnapshot(parent, reaction, snapshotIndex) {
  const snapshot = reaction.snapshots[snapshotIndex];
  if (!snapshot) return;
  const center = snapshot.atoms.reduce((sum, atom) => sum.map((value, axis) => value + atom.position[axis] / snapshot.atoms.length), [0, 0, 0]);
  const points = new Map(snapshot.atoms.map((atom) => [atom.id, atom.position.map((value, axis) => (value - center[axis]) * 0.78)]));
  snapshot.bonds.forEach(({ a, b, order }) => bond(parent, points.get(a), points.get(b), order, '#a6c4b8', 0.055));
  snapshot.atoms.forEach((atom) => sphere(parent, atom.element, points.get(atom.id), atom.element === 'H' ? 0.78 : 1, { label: true }));
}

function atomModel(parent, symbol, protons, neutrons, electrons, element) {
  const nucleus = new THREE.Group(); parent.add(nucleus);
  const total = protons + neutrons;
  const placements=[];
  for (let i = 0; i < total; i++) {
    const phi = Math.acos(1 - 2 * (i + 0.5) / total), theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const radius = total === 1 ? 0 : 0.34 * Math.cbrt(i / Math.max(1,total));
    placements.push([radius * Math.sin(phi) * Math.cos(theta), radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi)]);
  }
  const center=placements.reduce((sum,point)=>sum.map((value,axis)=>value+point[axis]/total),[0,0,0]);
  placements.forEach((point)=>point.forEach((value,axis)=>{point[axis]=value-center[axis];}));
  for (const [kind,count,start] of [['p',protons,0],['n',neutrons,protons]]) {
    const geometry=new THREE.SphereGeometry(.105,16,12), material=new THREE.MeshPhysicalMaterial({color:COLORS[kind],roughness:.2,emissive:COLORS[kind],emissiveIntensity:.25});
    const mesh=new THREE.InstancedMesh(geometry,material,count);const dummy=new THREE.Object3D();
    for(let i=0;i<count;i++){dummy.position.set(...placements[start+i]);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=true;nucleus.add(mesh);
  }
  const makeAnchor=(position)=>{const anchor=new THREE.Object3D();anchor.position.set(...position);parent.add(anchor);return anchor;};
  const anchors={nucleus:makeAnchor([0,0,0]),proton:makeAnchor(placements[0]||[0,0,0]),neutron:makeAnchor(neutrons?placements[protons]:[0,0,0])};
  const shells = (element.shells||[]).map((n)=>n); let remaining = electrons;
  if(electrons < protons){for(let i=shells.length-1;i>=0&&remaining<protons;i--){const remove=Math.min(shells[i],protons-remaining);shells[i]-=remove;remaining+=remove;}}
  else if(electrons > protons){shells[shells.length-1]=(shells[shells.length-1]||0)+(electrons-protons);}
  let index = 0; let electronAnchor=null; let shellAnchorPosition=[1,0,0];
  shells.forEach((count, shell) => {
    const radius = 1.0 + shell * 0.43;
    const orientation=new THREE.Euler(.35+shell*.34,shell*.27,shell*.42);
    if(count>0){const shellPoint=new THREE.Vector3(0,0,radius).applyEuler(orientation);shellAnchorPosition=shellPoint.toArray();}
    if(count>0){const trackPoints=[];for(let i=0;i<240;i++){const a=i/240*Math.PI*2;trackPoints.push(new THREE.Vector3(Math.cos(a)*radius,0,Math.sin(a)*radius).applyEuler(orientation));}const geometry=new THREE.BufferGeometry().setFromPoints(trackPoints);const colors=['#74e3d7','#7bb9e8','#b09bf2','#e1b681','#77d5bc','#93a6ef','#d39abb'];const path=new THREE.LineLoop(geometry,new THREE.LineBasicMaterial({color:colors[shell%colors.length],transparent:true,opacity:.46,depthWrite:false}));path.renderOrder=2;parent.add(path);}
    for (let j=0;j<count;j++) {
      const phase=2*Math.PI*j/count+shell*.35;const position=new THREE.Vector3(Math.cos(phase)*radius,0,Math.sin(phase)*radius).applyEuler(orientation).toArray();
      const e=sphere(parent,'e',position,0.42,{glow:true,orbit:{radius,phase,speed:(shell%2?-1:1)*(.66+shell*.04),rotation:orientation.clone()}});e.userData.electronIndex=index++;if(!electronAnchor)electronAnchor=e;
    }
  });
  anchors.electron=electronAnchor||makeAnchor([1,0,0]);anchors.shell=makeAnchor(shellAnchorPosition);parent.userData.atomAnchors=anchors;parent.userData.neutronCount=neutrons;
}

function makeBeaker(parent) {
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(2.25,2.0,3.1,64,1,true),new THREE.MeshPhysicalMaterial({color:'#72ccdb',roughness:.16,metalness:.04,transparent:true,opacity:.12,side:THREE.DoubleSide,clearcoat:1}));
  glass.position.y = -0.15; parent.add(glass);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.99,2,0.12,64),new THREE.MeshPhysicalMaterial({color:'#73d7e3',transparent:true,opacity:.32,roughness:.18})); base.position.y=-1.72; parent.add(base);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(2.25,0.045,12,64),new THREE.MeshStandardMaterial({color:'#a4edf0',emissive:'#2e9fa6',emissiveIntensity:.5,transparent:true,opacity:.7})); lip.rotation.x=Math.PI/2; lip.position.y=1.4; parent.add(lip);
}

function buildMatterZoom(parent) {
  const glass = new THREE.Group(), water = new THREE.Group(), waterMolecules = new THREE.Group(), waterMolecule = new THREE.Group(), waterAtoms = new THREE.Group(), glassNetwork = new THREE.Group();
  parent.add(glass,water,waterMolecules,waterMolecule,waterAtoms,glassNetwork);
  const glassMaterial=new THREE.MeshPhysicalMaterial({color:'#b9dce0',roughness:.12,metalness:.02,transparent:true,opacity:.16,side:THREE.DoubleSide,clearcoat:1,clearcoatRoughness:.08});
  const shell=new THREE.Mesh(new THREE.CylinderGeometry(1.35,1.14,2.45,96,1,true),glassMaterial);shell.position.y=-.15;glass.add(shell);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(1.14,1.15,.1,96),new THREE.MeshPhysicalMaterial({color:'#d5eef0',transparent:true,opacity:.22,roughness:.14,clearcoat:1}));base.position.y=-1.38;glass.add(base);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(1.35,.035,16,96),new THREE.MeshStandardMaterial({color:'#e2ffff',transparent:true,opacity:.68,emissive:'#65dce0',emissiveIntensity:.24}));rim.rotation.x=Math.PI/2;rim.position.y=1.075;glass.add(rim);
  // The water column reaches the beaker floor and its surface sits just below the rim.
  const liquid=new THREE.Mesh(new THREE.CylinderGeometry(1.115,1.005,1.76,80),new THREE.MeshPhysicalMaterial({color:'#238ca3',roughness:.16,metalness:.01,transparent:true,opacity:.48,clearcoat:1,clearcoatRoughness:.08}));liquid.position.y=-.46;water.add(liquid);
  const surface=new THREE.Mesh(new THREE.CircleGeometry(1.115,80),new THREE.MeshPhysicalMaterial({color:'#58c4cb',roughness:.12,transparent:true,opacity:.68,side:THREE.DoubleSide,emissive:'#175d70',emissiveIntensity:.12}));surface.rotation.x=-Math.PI/2;surface.position.y=.415;water.add(surface);
  // A schematic molecule field reveals progressively as the camera penetrates the material.
  for(let x=0;x<7;x++)for(let y=0;y<5;y++)for(let z=0;z<7;z++){
    const px=(x-3)*.24, py=-.46+(y-2)*.23, pz=(z-3)*.24;
    if(px*px+pz*pz<.78)molecule(waterMolecules,'H2O',[px,py,pz],.065,{labels:false});
  }
  molecule(waterMolecule,'H2O',[0,0,0],.16,{labels:false});
  molecule(waterAtoms,'H2O',[0,0,0],.025,{labels:false});
  // Dense schematic silica network. Instancing keeps hundreds of atoms smooth to navigate.
  const silicon=[], oxygen=[], links=[];
  const tetra=[[-1,-1,-1],[-1,1,1],[1,-1,1],[1,1,-1]];
  for(let ix=0;ix<5;ix++)for(let iy=0;iy<4;iy++)for(let iz=0;iz<5;iz++){
    const si=new THREE.Vector3((ix-2)*.155+Math.sin(ix*17+iy*5+iz)*.012,(iy-1.5)*.16+Math.sin(iy*11+iz*3)*.01,(iz-2)*.155+Math.sin(iz*13+ix*7)*.012);
    silicon.push(si);
    for(const [dx,dy,dz] of tetra){const o=si.clone().add(new THREE.Vector3(dx,dy,dz).normalize().multiplyScalar(.072));oxygen.push(o);links.push([si,o]);}
  }
  const makeField=(positions,radius,symbol,material)=>{const mesh=new THREE.InstancedMesh(new THREE.SphereGeometry(radius,16,12),material,positions.length),dummy=new THREE.Object3D();mesh.userData.chemicalSymbol=symbol;positions.forEach((point,index)=>{dummy.position.copy(point);dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix);});mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=true;glassNetwork.add(mesh);};
  makeField(silicon,.027,'Si',new THREE.MeshPhysicalMaterial({color:COLORS.Si,roughness:.23,metalness:.08,emissive:COLORS.Si,emissiveIntensity:.2}));
  makeField(oxygen,.019,'O',new THREE.MeshPhysicalMaterial({color:COLORS.O,roughness:.2,metalness:.05,emissive:COLORS.O,emissiveIntensity:.17}));
  const sodium=silicon.filter((_,index)=>index%13===2).map(point=>point.clone().add(new THREE.Vector3(.035,.025,-.025)));
  const calcium=silicon.filter((_,index)=>index%17===5).map(point=>point.clone().add(new THREE.Vector3(-.035,-.02,.03)));
  makeField(sodium,.022,'Na',new THREE.MeshPhysicalMaterial({color:COLORS.Na,roughness:.24,metalness:.08,emissive:COLORS.Na,emissiveIntensity:.18}));
  makeField(calcium,.024,'Ca',new THREE.MeshPhysicalMaterial({color:COLORS.Ca,roughness:.25,metalness:.06,emissive:COLORS.Ca,emissiveIntensity:.15}));
  const bondGeometry=new THREE.CylinderGeometry(.0045,.0045,1,8,1,false),bondMaterial=new THREE.MeshStandardMaterial({color:'#9db5ac',roughness:.38,metalness:.24});
  const bondField=new THREE.InstancedMesh(bondGeometry,bondMaterial,links.length),dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0);
  links.forEach(([from,to],index)=>{const direction=new THREE.Vector3().subVectors(to,from);dummy.position.copy(from).add(to).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,direction.clone().normalize());dummy.scale.set(1,direction.length(),1);dummy.updateMatrix();bondField.setMatrixAt(index,dummy.matrix);});bondField.instanceMatrix.needsUpdate=true;glassNetwork.add(bondField);
  parent.userData.matterLayers={glass,water,waterMolecules,waterMolecule,waterAtoms,glassNetwork};
  for(const layer of Object.values(parent.userData.matterLayers)){layer.userData.opacityMaterials=[];layer.traverse(obj=>{if(!obj.material)return;for(const material of Array.isArray(obj.material)?obj.material:[obj.material])layer.userData.opacityMaterials.push({material,base:material.opacity});});}
}

const smoothStep=(start,end,value)=>{const t=Math.max(0,Math.min(1,(start-value)/(start-end)));return t*t*(3-2*t);};

function buildModel(parent, p) {
  if (p.type === 'atom') { const element=p.element||{symbol:'Na',number:11,massNumber:23,shells:[2,8,1]}; atomModel(parent,element.symbol,element.number,element.massNumber-element.number,Math.max(0,element.number-(p.charge||0)),element); return; }
  if (p.type === 'matter-zoom') {
    buildMatterZoom(parent);
    return;
  }
  if (p.type === 'molecule') { molecule(parent,p.formula,[0,0,0],1.18,{labels:true}); return; }
  if (p.type === 'matter') {
    const count = p.mixture === 'Air' ? 23 : 18; const gas = p.phase === 'Gaz', solid = p.phase === 'Solide';
    for(let i=0;i<count;i++) { const a=i%5, b=Math.floor(i/5)%4, c=Math.floor(i/20); const x=solid?(a-2)*.68:(Math.sin(i*14.4)*2.3), z=solid?(b-1.5)*.68:(Math.cos(i*9.1)*2.0), y=solid?-.35+c*.65:gas?Math.cos(i*4.3)*1.55:-1.0+((i*7)%11)*.18;
      if(p.mixture==='Eau salée' && i%5===0) molecule(parent,'NaCl',[x,y,z],.62); else if(p.mixture==='Eau boueuse' && i%4===0) sphere(parent,'Si',[x,y,z],.78,{glow:true}); else if(p.mixture==='Air') molecule(parent,i%2?'CO2':'O2',[x,y,z],.56); else molecule(parent,'H2O',[x,y,z],.52);
    } return;
  }
  if (p.type === 'balance') {
    const left = new THREE.Group(), right = new THREE.Group(); parent.add(left,right);
    const groups = [[p.coefficients[0],'CH4',[-2.45,0,0]],[p.coefficients[1],'O2',[-.8,0,0]],[p.coefficients[2],'CO2',[.8,0,0]],[p.coefficients[3],'H2O',[2.45,0,0]]];
    groups.forEach(([n,f,base],idx)=>{ const target=idx<2?left:right; for(let i=0;i<Math.min(n,3);i++) molecule(target,f,[base[0],(i-(Math.min(n,3)-1)/2)*.85,base[2]],.46,{labels:false}); });
    return;
  }
  if (p.type === 'ph') {
    makeBeaker(parent); const acid = p.ph < 6.7, base = p.ph > 7.3, count = 6 + Math.round(Math.abs(7-p.ph)*1.25);
    for(let i=0;i<count;i++){ const x=Math.sin(i*8.7)*1.45,z=Math.cos(i*3.1)*1.35,y=-1.25+(i%5)*.43; sphere(parent,acid?(i%3?'H':'O'):base?(i%3?'O':'H'):(i%2?'H':'O'),[x,y,z],.7,{glow:i%3===0}); }
    return;
  }
  if (p.type === 'strength') {
    const ions = p.strength === 'Fort' ? 9 : 3;
    for(let i=0;i<9;i++){ const x=(i%3-1)*1.25,z=(Math.floor(i/3)-1)*1.0,y=(i%2)*.62-.3; if(i<ions){sphere(parent,'H',[x-.26,y,z],.75,{glow:true});sphere(parent,'Cl',[x+.26,y,z],.92);}else molecule(parent,'HCl',[x,y,z],.62); }
    return;
  }
  if (p.type === 'lewis') {
    molecule(parent,'NH3',[-1.5,0,0],.95,{labels:true});
    const b = sphere(parent,'B',[1.28,0,0],1.1,{label:true});
    const fluorines=[[-.3,.8,.5],[-.3,-.8,.5],[-.3,0,-.85]]; fluorines.forEach((xyz)=>{ bond(parent,[1.28,0,0],xyz,1,'#a6c4b8',.06);sphere(parent,'F',xyz,1.0); });
    if(p.reacted){ bond(parent,[-.52,0,0],[.82,0,0],1,'#72f4d0',.09); sphere(parent,'e',[.05,.16,.12],.8,{glow:true}); sphere(parent,'e',[.05,-.16,.12],.8,{glow:true}); b.material.emissiveIntensity=.7; }
    else { sphere(parent,'e',[-.3,.15,-.5],.6,{glow:true});sphere(parent,'e',[-.3,-.15,-.5],.6,{glow:true}); }
    return;
  }
  if (p.type === 'application') {
    const soil = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7,3),new THREE.MeshStandardMaterial({color:'#876748',roughness:.95,flatShading:true})); soil.position.y=-.72; soil.scale.set(1.7,.52,1.2); parent.add(soil);
    for(let i=0;i<22;i++){const x=Math.sin(i*7.1)*2,z=Math.cos(i*4.7)*1.3,y=-.04+(i%4)*.46;sphere(parent,p.choice==='Eau'? (i%2?'H':'O'):p.choice==='Sol calcaire'?'Ca':i%3?'H':'O',[x,y,z],.62,{glow:i%4===0});}
    return;
  }
  if (p.type === 'redox') {
    sphere(parent,'Fe',[-1.2,0,0],1.6,{glow:true,label:true}); molecule(parent,'O2',[1.35,0,0],.95,{labels:true});
    for(let i=0;i<2;i++){const start=new THREE.Vector3(-.25+i*.25,.35,0);const e=sphere(parent,'e',start.toArray(),.72,{glow:true});if(p.reacted)e.userData.transfer={start,end:new THREE.Vector3(.7+i*.14,-.2,.1),phase:i*.25};}
    return;
  }
  if (p.type === 'cell' || p.type === 'electrolysis') {
    makeBeaker(parent);
    const reversed = p.type==='electrolysis' && p.reversed;
    const leftSymbol = reversed?'Cu':'Zn', rightSymbol = reversed?'Zn':'Cu';
    const leftX=-1.1,rightX=1.1;
    const electrode = (symbol,x)=>{ const rod=new THREE.Mesh(new THREE.CylinderGeometry(.14,.2,2.3,32),new THREE.MeshPhysicalMaterial({color:COLORS[symbol],metalness:.78,roughness:.22,clearcoat:1}));rod.position.set(x,-.05,0);parent.add(rod);};
    electrode(leftSymbol,leftX);electrode(rightSymbol,rightX);
    for(let i=0;i<17;i++){ const x=Math.sin(i*13.3)*1.65,y=-1.32+(i%6)*.48,z=Math.cos(i*4.7)*1.25;sphere(parent,i%2?'Cu':'Zn',[x,y,z],.57,{opacity:.9,glow:i%5===0}); }
    bond(parent,[leftX,1.15,0],[leftX,1.75,0],1,'#89c8b5',.055);bond(parent,[leftX,1.75,0],[rightX,1.75,0],1,'#89c8b5',.055);bond(parent,[rightX,1.75,0],[rightX,1.15,0],1,'#89c8b5',.055);
    const electron=sphere(parent,'e',[p.reacted?leftX:0,1.75,0],.82,{glow:true}); if(p.reacted)electron.userData.transfer={start:new THREE.Vector3(leftX,1.75,0),end:new THREE.Vector3(rightX,1.75,0),phase:0};
    return;
  }
  if (p.type === 'corrosion') {
    for(let x=-2;x<=2;x++)for(let z=-1;z<=1;z++){sphere(parent,'Fe',[x*.55,-.1,z*.55],.82);}
    const wet=p.choice==='Humide', coated=p.choice==='Protégé';
    for(let i=0;i<(coated?3:wet?17:7);i++){const x=Math.sin(i*7.8)*1.35,y=.55+(i%3)*.28,z=Math.cos(i*3.7)*.55;sphere(parent,wet?'rust':'O',[x,y,z],.56,{glow:wet&&i%4===0,opacity:coated?.5:1});}
    for(let i=0;i<6;i++){sphere(parent,'H',[Math.sin(i*7)*1.8,1.65+(i%2)*.3,Math.cos(i*3)*1.1],.45,{opacity:.7});}
    return;
  }
  if (p.type === 'naming') {
    const model = hydrocarbon3dById[['methane','ethane','propane','butane','pentane'][p.carbonCount - 1]];
    if (model) renderMolecularModel(parent, model);
    return;
  }
  if (p.type === 'functional') {
    const variants={Alcool:{a:['C','C','O','H'],x:[[-.9,0,0],[0,0,0],[.88,0,0],[1.5,0,0]],links:[[0,1,1],[1,2,1],[2,3,1]]},'Acide carboxylique':{a:['C','C','O','O','H'],x:[[-1.2,0,0],[0,0,0],[.85,.62,0],[.85,-.62,0],[1.45,-.62,0]],links:[[0,1,1],[1,2,2],[1,3,1],[3,4,1]]},Ester:{a:['C','C','O','C','O'],x:[[-1.5,0,0],[-.5,0,0],[.35,0,0],[1.3,0,0],[.35,.8,0]],links:[[0,1,1],[1,2,1],[2,3,1],[2,4,2]]},Aldéhyde:{a:['C','C','O','H'],x:[[-.9,0,0],[0,0,0],[.8,.62,0],[.8,-.62,0]],links:[[0,1,1],[1,2,2],[1,3,1]]}};
    const m=variants[p.choice]||variants.Alcool; m.links.forEach(([a,b,o])=>bond(parent,m.x[a],m.x[b],o));m.a.forEach((sym,i)=>sphere(parent,sym,m.x[i],1,{label:true})); return;
  }
  if (p.type === 'organic-reaction') {
    const reaction = reaction3dData.find(({ id }) => id === 'ethene-hydrogenation');
    renderReactionSnapshot(parent, reaction, p.reacted ? 1 : 0);
    return;
  }
  if (p.type === 'biomolecule') {
    if(p.choice==='ADN') { const pointsA=[],pointsB=[];for(let i=0;i<48;i++){const t=i*.27,y=(i-24)*.09;pointsA.push([Math.cos(t)*1.05,y,Math.sin(t)*1.05]);pointsB.push([Math.cos(t+Math.PI)*1.05,y,Math.sin(t+Math.PI)*1.05]);sphere(parent,i%4===0?'O':'C',pointsA[i],.45);sphere(parent,i%3===0?'N':'C',pointsB[i],.45);if(i%4===0)bond(parent,pointsA[i],pointsB[i],1,'#879eb8',.05);if(i>0){bond(parent,pointsA[i-1],pointsA[i],1,'#80d9d0',.05);bond(parent,pointsB[i-1],pointsB[i],1,'#b69cff',.05);}} }
    else if(p.choice==='Protéines'){let prev=null;for(let i=0;i<44;i++){const t=i*.47,point=[Math.sin(t)*(.85+Math.sin(t*.23)*.3),Math.cos(t*.61)*.92,Math.sin(t*.73)*.7];sphere(parent,['C','N','O','C','S'][i%5],point,.55);if(prev)bond(parent,prev,point,1,'#b6a1e5',.05);prev=point;}}
    else if(p.choice==='Lipides'){sphere(parent,'O',[-1.45,0,0],1.3,{glow:true});for(let strand=0;strand<2;strand++){let prev=[-1.2,0,0];for(let i=0;i<11;i++){const point=[-1.0+i*.24,Math.sin(i*.43+strand)*(.15+strand*.08),(strand-.5)*.42];sphere(parent,i%5===0?'O':'C',point,.45);bond(parent,prev,point,1,'#e5bc80',.05);prev=point;}}}
    else {const pts=[];for(let i=0;i<12;i++){const a=i*Math.PI/3,pt=[Math.cos(a)*1.2,Math.sin(a)*1.2,Math.sin(a*2)*.18];pts.push(pt);sphere(parent,i===0?'O':'C',pt,.82,{label:i===0});}for(let i=0;i<6;i++)bond(parent,pts[i],pts[(i+1)%6],1,'#8dddaf',.06);for(let i=0;i<4;i++)sphere(parent,'H',[Math.cos(i*Math.PI/2)*2,.55,Math.sin(i*Math.PI/2)*1.7],.65,{opacity:.88});}
    return;
  }
}

export default function ChemistryScene3D({ type, element, charge, formula, ph, carbonCount, phase, mixture, strength, choice, reversed, coefficients, reacted, spinning, onToggleSpin, onReset, compact = false }) {
  const mountRef = useRef(null); const controlsRef = useRef(null); const cameraRef=useRef(null); const groupRef = useRef(null); const [failed,setFailed]=useState(false); const spinningRef=useRef(spinning); const typeRef=useRef(type); spinningRef.current=spinning; typeRef.current=type;
  const settings=useMemo(()=>({type,element,charge,formula,ph,carbonCount,phase,mixture,strength,choice,reversed,coefficients,reacted}),[type,element,charge,formula,ph,carbonCount,phase,mixture,strength,choice,reversed,coefficients,reacted]);
  useEffect(()=>{
    const host=mountRef.current;if(!host)return;
    let renderer,controls,observer,frame=0;
    try { renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'}); }
    catch { setFailed(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.setClearColor(0x071113,0);renderer.domElement.className='chemistry-canvas';renderer.domElement.setAttribute('aria-label','Scène scientifique 3D manipulable : fais glisser pour tourner et utilise la molette ou le pincement pour zoomer.');host.appendChild(renderer.domElement);
    const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x071113,.045);
    const camera=new THREE.PerspectiveCamera(36,1,type==='matter-zoom' ? 0.001 : 0.1,90);camera.position.set(type==='atom'?7.8:compact?3.6:4.8,type==='atom'?5.2:compact?2.4:2.8,type==='atom'?9.6:compact?4.7:6.2);cameraRef.current=camera;
    controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.12;controls.enablePan=type==='matter-zoom';controls.enableRotate=type!=='matter-zoom';controls.enableZoom=true;controls.minDistance=type==='matter-zoom' ? 0.008 : 4;controls.maxDistance=18;controls.zoomSpeed=2.1;controls.autoRotate=spinningRef.current;controls.autoRotateSpeed=.6;controlsRef.current=controls;
    scene.add(new THREE.HemisphereLight(0xc9fff2,0x16252f,2.15));
    const key=new THREE.DirectionalLight(0xffffff,3.7);key.position.set(4,7,6);scene.add(key);
    const rim=new THREE.PointLight(0x35d8c3,95,18,2);rim.position.set(-4,1,3);scene.add(rim);
    const violet=new THREE.PointLight(0x7b76ff,58,16,2);violet.position.set(2,-1,-5);scene.add(violet);
    const starPos=[];for(let i=0;i<170;i++)starPos.push((Math.random()-.5)*24,(Math.random()-.5)*15,(Math.random()-.5)*16-5);const stars=new THREE.BufferGeometry();stars.setAttribute('position',new THREE.Float32BufferAttribute(starPos,3));scene.add(new THREE.Points(stars,new THREE.PointsMaterial({color:0x91c8bc,size:.018,transparent:true,opacity:.66,sizeAttenuation:true})));
    const group=new THREE.Group();scene.add(group);groupRef.current=group;
    const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),spherical=new THREE.Spherical();
    const pointers=new Map();let press=null,pinchStart=null;
    const onScenePointerDown=(event)=>{if(typeRef.current!=='matter-zoom'||event.button!==0)return;event.preventDefault();event.stopImmediatePropagation();const point={x:event.clientX,y:event.clientY};pointers.set(event.pointerId,point);if(pointers.size===1)press={id:event.pointerId,x:point.x,y:point.y,moved:0};if(pointers.size===2){const values=[...pointers.values()];pinchStart={distance:Math.hypot(values[0].x-values[1].x,values[0].y-values[1].y),radius:camera.position.distanceTo(controls.target)};}try{renderer.domElement.setPointerCapture(event.pointerId);}catch{}}
    const onScenePointerMove=(event)=>{const previous=pointers.get(event.pointerId);if(!previous)return;event.preventDefault();event.stopImmediatePropagation();pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(press)press.moved=Math.max(press.moved,Math.hypot(event.clientX-press.x,event.clientY-press.y));if(pointers.size>=2&&pinchStart){const values=[...pointers.values()],distance=Math.hypot(values[0].x-values[1].x,values[0].y-values[1].y),radius=Math.max(.008,Math.min(18,pinchStart.radius*pinchStart.distance/Math.max(distance,1))),direction=camera.position.clone().sub(controls.target).normalize();camera.position.copy(controls.target).addScaledVector(direction,radius);camera.lookAt(controls.target);controls.update();}else{const bounds=renderer.domElement.getBoundingClientRect(),dx=event.clientX-previous.x,dy=event.clientY-previous.y,offset=camera.position.clone().sub(controls.target);spherical.setFromVector3(offset);spherical.theta-=dx/Math.max(bounds.width,1)*Math.PI*2;spherical.phi-=dy/Math.max(bounds.height,1)*Math.PI*2;spherical.makeSafe();camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));camera.lookAt(controls.target);controls.update();}}
    const onScenePointerUp=(event)=>{if(!pointers.has(event.pointerId))return;event.preventDefault();event.stopImmediatePropagation();pointers.delete(event.pointerId);if(pointers.size<2)pinchStart=null;const wasClick=press&&press.id===event.pointerId&&press.moved<5;press=null;if(wasClick&&typeRef.current==='matter-zoom'){const bounds=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-((event.clientY-bounds.top)/bounds.height*2-1));raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObject(group,true).find(({object})=>{const material=object.material;return object.userData.chemicalSymbol&&object.visible&&(!material||((Array.isArray(material)?material[0]:material).opacity??1)>.12);});if(hit){const symbol=hit.object.userData.chemicalSymbol,names={H:'Hydrogène',O:'Oxygène',Si:'Silicium',Na:'Sodium',Ca:'Calcium'};const label=host.querySelector('.matter-selection-label');if(label)label.textContent=names[symbol]+' · '+symbol+' · atome sélectionné';}}try{renderer.domElement.releasePointerCapture(event.pointerId);}catch{}}
    const onScenePointerCancel=(event)=>{pointers.delete(event.pointerId);press=null;pinchStart=null;};
    renderer.domElement.addEventListener('pointerdown',onScenePointerDown,true);renderer.domElement.addEventListener('pointermove',onScenePointerMove,true);renderer.domElement.addEventListener('pointerup',onScenePointerUp,true);renderer.domElement.addEventListener('pointercancel',onScenePointerCancel,true);
    const resize=()=>{const width=Math.max(host.clientWidth,1),height=Math.max(host.clientHeight,1);camera.aspect=width/height;camera.updateProjectionMatrix();group.scale.x=typeRef.current==='balance'&&width<500?Math.max(.58,width/600):1;renderer.setSize(width,height,false);renderer.render(scene,camera);};observer=new ResizeObserver(resize);observer.observe(host);resize();
    let lastFrame=performance.now();renderer.setAnimationLoop((t)=>{const sec=t*.001,delta=Math.min((t-lastFrame)/1000,.05);lastFrame=t;controls.autoRotate=typeRef.current==='matter-zoom'?false:spinningRef.current;controls.enableZoom=true;controls.enablePan=typeRef.current==='matter-zoom';controls.enableRotate=typeRef.current!=='matter-zoom';controls.minDistance=typeRef.current==='matter-zoom'?.008:4;controls.update();group.rotation.y=typeRef.current==='atom'?0:Math.sin(sec*.25)*.045;group.rotation.x=typeRef.current==='molecule'?Math.sin(sec*.31)*.025:0;group.traverse(obj=>{if(obj.userData.orbit){const o=obj.userData.orbit,a=sec*o.speed+o.phase;obj.position.set(Math.cos(a)*o.radius,0,Math.sin(a)*o.radius).applyEuler(o.rotation);}if(obj.userData.transfer){const {start,end,phase:offset=0}=obj.userData.transfer;const f=(Math.sin(sec*1.25+offset)+1)/2;obj.position.copy(start).lerp(end,f);} });
      if(typeRef.current==='matter-zoom'&&group.userData.matterLayers){const d=camera.position.distanceTo(controls.target),vertical=(camera.position.y-controls.target.y)/Math.max(d,.001),waterView=smoothStep(.12,.72,vertical),glassView=1-waterView,layers=group.userData.matterLayers;const waterLayer=smoothStep(.9,.28,d)*waterView,waterCore=smoothStep(.32,.095,d)*waterView,waterAtomsFade=smoothStep(.09,.022,d)*waterView,glassCore=smoothStep(1.5,1.0,d)*glassView,shellFade=1-smoothStep(.45,.1,d)*.72,waterFade=Math.max(0,1-smoothStep(.9,.25,d)*.96);const azimuth=Math.atan2(camera.position.x-controls.target.x,camera.position.z-controls.target.z);layers.glassNetwork.position.set(0,0,0);layers.glassNetwork.rotation.y=azimuth;const fades={glass:shellFade,water:waterFade,waterMolecules:waterLayer,waterMolecule:waterCore,waterAtoms:waterAtomsFade,glassNetwork:glassCore};for(const [name,opacity] of Object.entries(fades)){for(const {material,base} of layers[name].userData.opacityMaterials){material.opacity=base*opacity;material.transparent=base<.999||opacity<.999;material.depthWrite=base>=.999&&opacity>=.999;}}const focus=waterView>.58?'EAU · H₂O':'VERRE · RÉSEAU Si/O · Na/Ca';const scale=d>.9?'MATIÈRE · SURFACE':d>.28?'ZOOM DANS LA MATIÈRE':d>.095?'MOLÉCULES H₂O':waterView>.58?'ATOMES · H / O':'ATOMES · Si / O';const badge=host.querySelector('.matter-focus-label');if(badge){const value=focus+'  ·  '+scale;if(badge.textContent!==value)badge.textContent=value;}const composition=host.querySelector('.matter-composition-label');if(composition){const value=waterView>.58?'H hydrogène · O oxygène · H₂O — clique une sphère pour identifier l’atome':'Si silicium · O oxygène · Na sodium · Ca calcium — clique une sphère pour identifier l’atome';if(composition.textContent!==value)composition.textContent=value;}}
      if(typeRef.current==='atom'&&group.userData.atomAnchors){const svg=host.querySelector('.atom-callouts svg');if(svg){const bounds=host.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);svg.setAttribute('preserveAspectRatio','none');const specs=[['nucleus','callout-nucleus'],['proton','callout-proton'],['neutron','callout-neutron'],['shell','callout-shell'],['electron','callout-electron']];for(const [key,labelClass] of specs){const path=svg.querySelector(`[data-anchor="${key}"]`),label=host.querySelector(`.${labelClass}`),anchor=group.userData.atomAnchors[key];if(!path||!label||!anchor)continue;if(key==='neutron'&&!group.userData.neutronCount){path.style.display='none';continue;}path.style.display='';const labelBounds=label.getBoundingClientRect();const target=anchor.getWorldPosition(new THREE.Vector3()).project(camera);const tx=(target.x*.5+.5)*bounds.width,ty=(-target.y*.5+.5)*bounds.height;const sx=(labelBounds.left+(labelBounds.right<bounds.left+bounds.width/2?labelBounds.width:0))-bounds.left,sy=labelBounds.top+labelBounds.height/2-bounds.top;const elbow=sx+(tx-sx)*.55;path.setAttribute('d',`M ${sx} ${sy} L ${elbow} ${sy} L ${tx} ${ty}`);}}
      }renderer.render(scene,camera);});
    return()=>{renderer.setAnimationLoop(null);observer?.disconnect();renderer.domElement.removeEventListener('pointerdown',onScenePointerDown,true);renderer.domElement.removeEventListener('pointermove',onScenePointerMove,true);renderer.domElement.removeEventListener('pointerup',onScenePointerUp,true);renderer.domElement.removeEventListener('pointercancel',onScenePointerCancel,true);controls.dispose();scene.traverse(obj=>{if(obj.geometry)obj.geometry.dispose();if(obj.material){const materials=Array.isArray(obj.material)?obj.material:[obj.material];materials.forEach(m=>{if(m.map)m.map.dispose();m.dispose();});}});renderer.dispose();renderer.domElement.remove();};
  },[]);
  useEffect(()=>{const group=groupRef.current;if(!group)return;while(group.children.length){const child=group.children[0];group.remove(child);child.traverse?.(obj=>{if(obj.geometry)obj.geometry.dispose();if(obj.material){const materials=Array.isArray(obj.material)?obj.material:[obj.material];materials.forEach(mat=>{if(mat.map)mat.map.dispose();mat.dispose();});}});}if(settings.type==='molecule'&&compact)molecule(group,settings.formula,[0,0,0],1.55,{labels:true});else buildModel(group,settings);if(cameraRef.current&&controlsRef.current){if(settings.type==='atom'){const outer=1+((settings.element?.shells?.length||1)-1)*.43;const aspect=Math.max(.65,(mountRef.current?.clientWidth||400)/(mountRef.current?.clientHeight||400));const distance=Math.max(13.5,outer/(Math.tan(36*Math.PI/360)*aspect)*1.28);cameraRef.current.position.set(7.8,5.2,9.6).setLength(distance);cameraRef.current.near=.1;cameraRef.current.updateProjectionMatrix();controlsRef.current.minDistance=4;controlsRef.current.enablePan=false;controlsRef.current.enableRotate=true;}else if(settings.type==='matter-zoom'){cameraRef.current.position.set(4.8,2.8,6.2);cameraRef.current.near=.001;cameraRef.current.updateProjectionMatrix();controlsRef.current.minDistance=.008;controlsRef.current.enablePan=true;controlsRef.current.enableRotate=false;}controlsRef.current.target.set(0,settings.type==='matter-zoom'?.45:0,0);controlsRef.current.update();controlsRef.current.saveState();}},[settings,compact]);
  const reset=()=>{if(controlsRef.current){controlsRef.current.reset();onReset?.();}};
  const readout={atom:`${element.symbol} · ${element.number} p⁺ · ${Math.max(0,element.number-charge)} e⁻`,molecule:formulaLabel(formula),matter:`${phase} · ${mixture}`,'matter-zoom':'Explore la matière · zoom continu',balance:'Combustion du méthane',ph:`pH ${String(ph).replace('.',',')}`,strength:`Acide ${strength.toLowerCase()}`,lewis:reacted?'Complexe donneur-accepteur':'Doublet libre de NH₃',application:choice,redox:'Transfert d’électrons',cell:'Pile galvanique Zn / Cu',electrolysis:'Électrolyse · courant imposé',corrosion:choice,naming:['Méthane','Éthane','Propane','Butane','Pentane'][carbonCount-1],functional:choice,'organic-reaction':reacted?'Éthane formé':'Réaction d’addition',biomolecule:choice}[type]||'Modèle moléculaire';
  return <div className={`scene3d-shell ${compact ? 'compact' : ''}`}>
    <div className="scene3d-toolbar"><span className="scene-live"><i/> SCÈNE 3D · INTERACTIVE</span><div className="scene-tools">{type!=='matter-zoom'&&<button onClick={onToggleSpin} aria-pressed={spinning}>{spinning?'⏸ Pause rotation':'▶ Rotation'}</button>}<button onClick={reset}>◎ Recentrer</button></div></div>
    <div className={`scene3d-stage scene3d-${type} ${type==='atom'?'atom-stage':''} ${type==='matter-zoom'?'matter-zoom-stage':''}`} ref={mountRef}>{failed&&<div className="webgl-fallback"><span>3D indisponible</span><small>Ce navigateur ou cet appareil ne fournit pas WebGL.</small></div>}<div className="scene3d-vignette"/>{type==='matter-zoom'&&<><span className="matter-focus-label">VERRE · RÉSEAU Si/O · MATIÈRE</span><span className="matter-composition-label">Si silicium · O oxygène · Na sodium · Ca calcium <i>— clique sur une sphère pour l’identifier</i></span><span className="matter-selection-label">Clique sur un atome pour l’identifier</span></>}{type==='atom'&&<div className="atom-callouts" aria-label="Repères du modèle atomique"><svg aria-hidden="true"><defs><marker id="atom-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M1 1 L5 3 L1 5" fill="none" stroke="#9cbec0" strokeWidth=".8"/></marker></defs>{['nucleus','proton','neutron','shell','electron'].map((name)=><path key={name} data-anchor={name}/>)}</svg><span className="callout-nucleus">NOYAU</span><span className="callout-proton">PROTON · p⁺</span>{element.massNumber>element.number&&<span className="callout-neutron">NEUTRON · n⁰</span>}<span className="callout-shell">COUCHE ÉLECTRONIQUE</span><span className="callout-electron">ÉLECTRON · e⁻</span></div>}<div className="scene3d-readout"><b>{readout}</b><span>{type==='atom'?'NOYAU · ÉLECTRONS · COUCHES':type==='molecule'?'GÉOMÉTRIE MOLÉCULAIRE · LIAISONS':type==='matter-zoom'?'EAU OU VERRE SELON LE POINT DE VUE':'ATOMES · LIAISONS · INTERACTIONS'}</span></div><span className="scene3d-drag">GLISSER POUR ORBITER · CLIC DROIT POUR DÉPLACER · MOLETTE OU PINCE POUR ZOOMER</span></div>
    <div className="scene3d-legend">{(type==='atom'?['p','n','e']:['C','H','O','N','Na','Cl']).map((symbol)=><span key={symbol}><i style={{'--atom-color':COLORS[symbol]}}/>{symbol==='p'?'p⁺':symbol==='n'?'n⁰':symbol==='e'?'e⁻':symbol}</span>)}<small>{type==='matter-zoom'?'Structure agrandie pour rendre visible l’échelle atomique.':'Tailles et distances amplifiées pour observer les structures.'}</small></div>
  </div>;
}
