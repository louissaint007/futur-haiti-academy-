import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const STAR_PROFILES = {
  'red-dwarf': { radius: 1.24, color: '#f26848', glow: '#ff5138', speed: 0.34 },
  'sun-like': { radius: 1.48, color: '#ffffff', glow: '#ffad45', speed: 0.26 },
  'red-giant': { radius: 1.78, color: '#ff8a42', glow: '#ff6338', speed: 0.2 },
  'blue-giant': { radius: 1.56, color: '#a9ceff', glow: '#6daeff', speed: 0.3 },
  protostar: { radius: 1.3, color: '#ffb26d', glow: '#ff863f', speed: 0.16 },
  'brown-dwarf': { radius: 0.95, color: '#b47a5a', glow: '#b86543', speed: 0.12 },
  'white-dwarf': { radius: 0.82, color: '#eaf5ff', glow: '#a7d8ff', speed: 0.4 },
  'neutron-star': { radius: 0.62, color: '#c7eaff', glow: '#76caff', speed: 0.7 },
  pulsar: { radius: 0.62, color: '#c9e7ff', glow: '#70bfff', speed: 1.1 },
  magnetar: { radius: 0.62, color: '#e1caff', glow: '#bd83ff', speed: 0.85 },
};

function makeLuminanceTexture(sourceTexture, renderer) {
  const image = sourceTexture.image;
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let index = 0; index < pixels.data.length; index += 4) {
    const luminance = Math.round(
      pixels.data[index] * 0.2126 +
      pixels.data[index + 1] * 0.7152 +
      pixels.data[index + 2] * 0.0722
    );
    pixels.data[index] = luminance;
    pixels.data[index + 1] = luminance;
    pixels.data[index + 2] = luminance;
  }
  context.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  texture.generateMipmaps = true;
  return texture;
}

function makeDustSprite() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(32, 32, 1, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.48)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

function makeDustLayer(count, seed, color, opacity, sprite, size, shape) {
  let state = seed >>> 0;
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const angle = random() * Math.PI * 2;
    const spread = (random() + random() + random() - 1.5) * shape.radialTurbulence;
    const radius = shape.innerRadius + random() * (shape.outerRadius - shape.innerRadius) + spread + Math.sin(angle * 4 + seed) * shape.ripple;
    const thickness = (random() + random() - 1) * shape.thickness + Math.sin(angle * 3 + seed) * shape.verticalRipple;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = thickness;
    positions[index * 3 + 2] = Math.sin(angle) * radius;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color,
    size,
    map: sprite,
    transparent: true,
    opacity,
    alphaTest: 0.015,
    depthWrite: false,
    sizeAttenuation: true,
    toneMapped: false,
  });
  return { points: new THREE.Points(geometry, material), geometry, material };
}

function makeJetLayer(count, seed, inner, sprite) {
  let state = seed >>> 0;
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const direction = random() < 0.5 ? -1 : 1;
    const distance = random() * 2.9;
    const angle = random() * Math.PI * 2;
    const spread = (inner ? 0.025 : 0.07) + distance * (inner ? 0.035 : 0.105);
    const radius = Math.sqrt(random()) * spread;
    const ripple = Math.sin(distance * 5 + angle * 3 + seed) * 0.035;
    const y = direction * (STAR_PROFILES.pulsar.radius + 0.08 + distance);
    positions[index * 3] = Math.cos(angle) * (radius + ripple);
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = Math.sin(angle) * (radius + ripple);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: inner ? '#d9f1ff' : '#70bfff',
    size: inner ? 0.075 : 0.16,
    map: sprite,
    transparent: true,
    opacity: inner ? 0.48 : 0.3,
    alphaTest: 0.015,
    depthWrite: false,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  return { points: new THREE.Points(geometry, material), geometry, material };
}

export default function StellarSphereScene({ starType, locale = 'fr', jetArrowRef, jetLabelRef }) {
  const mountRef = useRef(null);
  const typeRef = useRef(starType);
  const localeRef = useRef(locale);
  const runtimeRef = useRef(null);
  typeRef.current = starType;
  localeRef.current = locale;

  useEffect(() => {
    runtimeRef.current?.applyProfile();
  }, [starType.id, locale]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'low-power',
      });
    } catch {
      const fallback = document.createElement('p');
      fallback.className = 'stellar-webgl-error';
      fallback.textContent = localeRef.current === 'fr'
        ? 'La scène 3D ne peut pas démarrer sur ce navigateur.'
        : 'Sèn 3D a pa ka demare nan navigatè sa a.';
      mount.appendChild(fallback);
      return undefined;
    }

    let disposed = false;
    let animationFrame = 0;
    let sourceTexture = null;
    let luminanceTexture = null;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 40);
    camera.position.set(0, 0, 6.2);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    controls.enablePan = false;
    controls.minDistance = 2.9;
    controls.maxDistance = 14;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));
    renderer.setSize(Math.max(mount.clientWidth, 1), Math.max(mount.clientHeight, 1), false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = 'stellar-canvas';
    renderer.domElement.tabIndex = 0;
    mount.appendChild(renderer.domElement);

    const surfaceMaterial = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      toneMapped: false,
    });
    const surface = new THREE.Mesh(
      new THREE.SphereGeometry(1, 80, 56),
      surfaceMaterial
    );
    scene.add(surface);

    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color('#ff5138') } },
      vertexShader: 'varying vec3 vNormal; void main(){ vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 glowColor; varying vec3 vNormal; void main(){ float rim=pow(1.0-max(dot(normalize(vNormal),vec3(0.0,0.0,1.0)),0.0),2.0); gl_FragColor=vec4(glowColor,rim*0.24); }',
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      toneMapped: false,
    });
    const corona = new THREE.Mesh(new THREE.SphereGeometry(1.08, 40, 28), glowMaterial);
    scene.add(corona);

    const dustSprite = makeDustSprite();
    const dustCloudGroup = new THREE.Group();
    dustCloudGroup.rotation.x = Math.PI * 0.36;
    const dustLayers = [
      makeDustLayer(6500, 71, '#a66f50', 0.48, dustSprite, 0.22, { innerRadius: 1.02, outerRadius: 1.55, thickness: 0.28, radialTurbulence: 0.3, ripple: 0.08, verticalRipple: 0.07 }),
      makeDustLayer(5000, 193, '#e59764', 0.43, dustSprite, 0.21, { innerRadius: 1.15, outerRadius: 1.9, thickness: 0.34, radialTurbulence: 0.36, ripple: 0.1, verticalRipple: 0.08 }),
      makeDustLayer(3800, 419, '#ffd2a0', 0.34, dustSprite, 0.16, { innerRadius: 1.38, outerRadius: 2.18, thickness: 0.4, radialTurbulence: 0.4, ripple: 0.12, verticalRipple: 0.1 }),
      makeDustLayer(2400, 733, '#b66f59', 0.3, dustSprite, 0.13, { innerRadius: 1.48, outerRadius: 2.2, thickness: 0.48, radialTurbulence: 0.46, ripple: 0.14, verticalRipple: 0.12 }),
    ];
    dustLayers.forEach(layer => dustCloudGroup.add(layer.points));
    dustCloudGroup.visible = false;
    scene.add(dustCloudGroup);

    const emissionGroup = new THREE.Group();
    emissionGroup.rotation.z = Math.PI * 0.13;
    emissionGroup.rotation.x = Math.PI * 0.035;
    const jetSprite = makeDustSprite();
    const jetLayers = [
      makeJetLayer(3200, 113, false, jetSprite),
      makeJetLayer(1700, 257, true, jetSprite),
    ];
    jetLayers.forEach(layer => emissionGroup.add(layer.points));
    scene.add(emissionGroup);

    const fieldLineMaterial = new THREE.MeshBasicMaterial({ color: '#bd83ff', transparent: true, opacity: 0.56, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
    const magneticFieldGroup = new THREE.Group();
    const fieldLineGeometries = [];
    for (let line = 0; line < 5; line += 1) {
      const longitude = (Math.PI * 2 * line) / 5;
      const points = Array.from({ length: 33 }, (_, index) => {
        const angle = (index / 32) * Math.PI;
        const radial = 1.58 * Math.sin(angle);
        return new THREE.Vector3(
          radial * Math.cos(longitude),
          -1.2 * Math.cos(angle),
          radial * Math.sin(longitude)
        );
      });
      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(curve, 64, 0.012, 6, false);
      fieldLineGeometries.push(geometry);
      magneticFieldGroup.add(new THREE.Mesh(geometry, fieldLineMaterial));
    }
    magneticFieldGroup.visible = false;
    scene.add(magneticFieldGroup);

    const applyProfile = () => {
      const currentType = typeRef.current;
      const profile = STAR_PROFILES[currentType.id] || STAR_PROFILES['sun-like'];
      const isSunTwin = currentType.id === 'sun-like';
      surface.scale.setScalar(profile.radius);
      corona.scale.setScalar(profile.radius);
      dustCloudGroup.visible = currentType.id === 'protostar';
      dustCloudGroup.scale.setScalar(profile.radius);
      emissionGroup.visible = currentType.id === 'pulsar';
      emissionGroup.scale.setScalar(profile.radius);
      magneticFieldGroup.visible = currentType.id === 'magnetar';
      magneticFieldGroup.scale.setScalar(profile.radius * 1.12);
      magneticFieldGroup.rotation.z = 0.28;
      surfaceMaterial.color.set(isSunTwin ? '#ffffff' : profile.color);
      surfaceMaterial.map = isSunTwin ? sourceTexture : luminanceTexture;
      surfaceMaterial.needsUpdate = true;
      glowMaterial.uniforms.glowColor.value.set(profile.glow);
      controls.minDistance = profile.radius * 2.2;
      if (camera.position.length() < controls.minDistance) {
        camera.position.setLength(controls.minDistance * 1.08);
      }
      renderer.domElement.setAttribute(
        'aria-label',
        localeRef.current === 'fr'
          ? `Sphère 3D manipulable : ${currentType.title.fr}. Glisser pour tourner, molette pour zoomer.`
          : `Boul 3D ou ka manipile: ${currentType.title.ht}. Trennen pou vire, wou woulo a pou rale.`
      );
      controls.update();
    };

    runtimeRef.current = { applyProfile };
    applyProfile();

    const resize = () => {
      if (disposed) return;
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(resize)
      : null;
    resizeObserver?.observe(mount);
    window.addEventListener('resize', resize);

    const loader = new THREE.TextureLoader();
    loader.load('/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/sun-photosphere-texture.png', texture => {
      if (disposed) {
        texture.dispose();
        return;
      }
      sourceTexture = texture;
      sourceTexture.colorSpace = THREE.SRGBColorSpace;
      sourceTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      luminanceTexture = makeLuminanceTexture(sourceTexture, renderer);
      applyProfile();
    });

    let lastFrame = 0;
    const render = time => {
      if (disposed) return;
      const delta = lastFrame ? Math.min((time - lastFrame) / 1000, 0.05) : 0;
      lastFrame = time;
      if (!reducedMotion) {
        surface.rotation.y += delta * (STAR_PROFILES[typeRef.current.id]?.speed || 0.26);
        emissionGroup.rotation.y -= delta * (STAR_PROFILES[typeRef.current.id]?.speed || 0.26);
        magneticFieldGroup.rotation.y += delta * 0.08;
        const pulse = 0.27 + Math.sin(time * 0.0032) * 0.035;
        jetLayers[0].material.opacity = pulse;
        jetLayers[1].material.opacity = pulse + 0.19;
        dustCloudGroup.rotation.y += delta * 0.08;
      }
      controls.update();
      if (typeRef.current.id === 'pulsar' && jetArrowRef?.current) {
        const display = renderer.domElement.closest('.star-types-display');
        const label = jetLabelRef?.current;
        if (display && label) {
          const bounds = display.getBoundingClientRect();
          const labelBounds = label.getBoundingClientRect();
          const width = Math.max(bounds.width, 1);
          const height = Math.max(bounds.height, 1);
          emissionGroup.updateWorldMatrix(true, false);
          camera.updateMatrixWorld(true);
          const jetTargets = [
            emissionGroup.localToWorld(new THREE.Vector3(0, 2.25, 0)),
            emissionGroup.localToWorld(new THREE.Vector3(0, -2.25, 0)),
          ];
          const target = jetTargets.reduce((nearest, point) => (
            point.distanceToSquared(camera.position) < nearest.distanceToSquared(camera.position) ? point : nearest
          ));
          const projected = target.clone().project(camera);
          const endX = ((projected.x + 1) / 2) * width;
          const endY = ((1 - projected.y) / 2) * height;
          const startX = labelBounds.left - bounds.left;
          const startY = labelBounds.top - bounds.top + labelBounds.height / 2;
          const svg = jetArrowRef.current.ownerSVGElement;
          svg?.setAttribute('viewBox', `0 0 ${width} ${height}`);
          svg?.setAttribute('width', `${width}`);
          svg?.setAttribute('height', `${height}`);
          const inFront = projected.z > -1 && projected.z < 1;
          jetArrowRef.current.style.opacity = inFront ? '1' : '0';
          jetArrowRef.current.setAttribute('d', `M ${startX} ${startY} L ${endX} ${endY}`);
        }
      }
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    };
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resize);
      controls.dispose();
      surface.geometry.dispose();
      surfaceMaterial.dispose();
      corona.geometry.dispose();
      glowMaterial.dispose();
      jetLayers.forEach(layer => {
        layer.geometry.dispose();
        layer.material.dispose();
      });
      jetSprite.dispose();
      dustLayers.forEach(layer => {
        layer.geometry.dispose();
        layer.material.dispose();
      });
      dustSprite.dispose();
      fieldLineGeometries.forEach(geometry => geometry.dispose());
      fieldLineMaterial.dispose();
      sourceTexture?.dispose();
      luminanceTexture?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      runtimeRef.current = null;
    };
  }, []);

  return <div className="stellar-sphere-canvas" ref={mountRef} />;
}
