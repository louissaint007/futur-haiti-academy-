import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function makeAccretionDiskMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      float noise2(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
          mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
      }
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float r = length(p);
        float a = atan(p.y, p.x);
        float innerEdge = smoothstep(0.335, 0.375, r);
        float outerEdge = 1.0 - smoothstep(0.91, 1.0, r);
        float swirl = a * 3.15 + log(max(r, 0.36)) * 1.7 - uTime * 0.12;
        // The texture drifts radially inward while the disk rotates, suggesting
        // matter spiralling toward the event horizon.
        vec2 flow = vec2(swirl * 7.0, (r + uTime * 0.42) * 29.0 + sin(swirl * 2.0) * 0.42);
        float turbulence = noise2(flow) * 0.62 + noise2(flow * 2.13) * 0.26 + noise2(flow * 4.7) * 0.12;
        float filaments = smoothstep(0.34, 0.78, turbulence);
        float heat = 1.0 - smoothstep(0.37, 0.98, r);
        vec3 color = mix(vec3(0.32, 0.012, 0.018), vec3(0.92, 0.105, 0.018), heat);
        color = mix(color, vec3(1.0, 0.37, 0.045), smoothstep(0.56, 0.88, filaments) * 0.72);
        color = mix(color, vec3(1.0, 0.82, 0.42), exp(-pow((r - 0.385) * 39.0, 2.0)) * (0.54 + filaments * 0.36));
        color = mix(color, vec3(1.0, 0.97, 0.86), exp(-pow((r - 0.355) * 92.0, 2.0)) * 0.52);
        float doppler = mix(0.78, 1.18, smoothstep(-0.62, 0.62, -p.x));
        color *= doppler * (0.86 + filaments * 0.26);
        float alpha = innerEdge * outerEdge * (0.62 + filaments * 0.38);
        gl_FragColor = vec4(color, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
}

export default function BlackHoleScene({ locale = 'fr' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      const fallback = document.createElement('p');
      fallback.className = 'black-hole-webgl-error';
      fallback.textContent = locale === 'fr'
        ? 'La scène 3D demande un navigateur compatible WebGL.'
        : 'Sèn 3D a mande yon navigatè ki sipòte WebGL.';
      mount.appendChild(fallback);
      return undefined;
    }

    let disposed = false;
    let animationFrame = 0;
    let lastFrame = 0;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    camera.position.set(0, 0.54, 7.4);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.enablePan = false;
    controls.minDistance = 3.45;
    controls.maxDistance = 11;
    controls.minPolarAngle = 0.32;
    controls.maxPolarAngle = Math.PI - 0.32;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
    renderer.setSize(Math.max(mount.clientWidth, 1), Math.max(mount.clientHeight, 1), false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = 'black-hole-canvas';
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute('aria-label', locale === 'fr'
      ? 'Simulation 3D manipulable d’un trou noir : glisser pour tourner, molette ou pincement pour zoomer.'
      : 'Modèl 3D twou nwa ou ka manipile: trennen pou vire, woulo oswa pense pou rale.');
    mount.appendChild(renderer.domElement);

    const centralBlackness = new THREE.Mesh(
      // Keep the horizon silhouette above the disk plane so it does not form
      // a second dark circular bar beneath the accretion flow.
      new THREE.SphereGeometry(0.79, 72, 56, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: '#010104', toneMapped: false })
    );
    scene.add(centralBlackness);

    const diskGroup = new THREE.Group();
    diskGroup.rotation.x = 0.075;
    diskGroup.rotation.z = -0.018;
    const diskGeometry = new THREE.RingGeometry(0.92, 2.62, 360, 8);
    diskGeometry.rotateX(-Math.PI / 2);
    const diskMaterial = makeAccretionDiskMaterial();
    const accretionDisk = new THREE.Mesh(diskGeometry, diskMaterial);
    accretionDisk.renderOrder = 1;
    diskGroup.add(accretionDisk);
    scene.add(diskGroup);

    let state = 202403;
    const random = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
    const starPositions = new Float32Array(1200 * 3);
    for (let index = 0; index < 1200; index += 1) {
      starPositions[index * 3] = (random() - 0.5) * 18;
      starPositions[index * 3 + 1] = (random() - 0.5) * 12;
      starPositions[index * 3 + 2] = -2.5 - random() * 7;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: '#c5d7f3', size: 0.022, transparent: true, opacity: 0.48, sizeAttenuation: true, depthWrite: false, toneMapped: false });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resize = () => {
      if (disposed) return;
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(mount);
    window.addEventListener('resize', resize);

    const render = time => {
      if (disposed) return;
      const delta = lastFrame ? Math.min((time - lastFrame) / 1000, 0.05) : 0;
      lastFrame = time;
      if (!reducedMotion) {
        diskGroup.rotation.y += delta * 0.035;
        diskMaterial.uniforms.uTime.value = time * 0.00018;
      }
      controls.update();
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
      centralBlackness.geometry.dispose();
      centralBlackness.material.dispose();
      diskGeometry.dispose();
      diskMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [locale]);

  return <div className="black-hole-scene" ref={mountRef} />;
}
