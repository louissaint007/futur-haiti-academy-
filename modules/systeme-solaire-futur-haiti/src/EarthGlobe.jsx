import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// The 2K albedo and 1K LOLA relief maps keep the interactive model within
// modest GPU memory budgets while retaining enough detail for close viewing.
const MOON_COLOR_MAP = '/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/moon-lroc-color-2k.jpg';
const MOON_ELEVATION_MAP = '/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/moon-lola-elevation-1k.jpg';

export default function EarthGlobe({ bodyId = 'earth', copy, onClose, locale = 'fr' }) {
  const isMoon = bodyId === 'moon';
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    let renderer;
    let frameId = 0;
    let resizeObserver;
    let earthMaterial;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMoon,
        powerPreference: isMoon ? 'low-power' : 'high-performance',
      });
    } catch {
      mount.innerHTML = '<div class="webgl-error"><strong>Le globe 3D ne peut pas démarrer.</strong><span>Activez l’accélération graphique dans le navigateur, puis réessayez.</span></div>';
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.08, 3.55);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMoon ? 1.2 : 1.6));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.domElement.className = 'earth-globe-canvas';
    renderer.domElement.setAttribute('aria-label', isMoon ? (locale === 'ht' ? 'Modèl Lalin entèaktif' : 'Maquette lunaire interactive') : copy.globeCanvas);
    renderer.domElement.tabIndex = 0;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight('#a9d9ff', '#15243a', isMoon ? 0.82 : 1.18));
    const sunlight = new THREE.DirectionalLight('#fff1d6', 3.1);
    sunlight.position.set(-4, 2.4, 4);
    scene.add(sunlight);
    earthMaterial = new THREE.MeshStandardMaterial({ color: isMoon ? '#aaa9a2' : '#b8d9f3', roughness: 0.94, metalness: 0.01 });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, isMoon ? 160 : 96, isMoon ? 120 : 72), earthMaterial);
    earth.rotation.z = 0.055;
    scene.add(earth);
    if (!isMoon) {
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.025, 64, 48),
      new THREE.ShaderMaterial({
        vertexShader: 'varying vec3 vNormal; void main(){ vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
        fragmentShader: 'varying vec3 vNormal; void main(){ float rim=pow(1.0-max(dot(vNormal,vec3(0.0,0.0,1.0)),0.0),2.7); gl_FragColor=vec4(0.24,0.62,1.0,rim*0.32); }',
        transparent: true, depthWrite: false, side: THREE.BackSide,
      }),
    );
    scene.add(atmosphere);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.minDistance = isMoon ? 1.12 : 1.65;
    controls.maxDistance = 6.2;
    controls.rotateSpeed = 0.72;
    controls.zoomSpeed = 0.8;
    controls.target.set(0, 0, 0);
    controls.update();
    controls.saveState();
    controlsRef.current = controls;

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();
    if (isMoon) new THREE.TextureLoader().load(MOON_COLOR_MAP, texture => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      texture.wrapS = THREE.RepeatWrapping;
      if (earthMaterial.userData.disposed) {
        texture.dispose();
        return;
      }
      earthMaterial.map = texture;
      earthMaterial.color.set('#ffffff');
      earthMaterial.needsUpdate = true;
    }, undefined, () => {
      mount.innerHTML = '<div class="webgl-error"><strong>La texture lunaire n’a pas pu être chargée.</strong><span>Vérifiez la connexion locale, puis rechargez la page.</span></div>';
    });
    else new THREE.TextureLoader().load('/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/apps/systeme-solaire-futur-haiti/nasa/earth-surface-texture.png', texture => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      texture.wrapS = THREE.RepeatWrapping;
      if (earthMaterial.userData.disposed) {
        texture.dispose();
        return;
      }
      earthMaterial.map = texture;
      earthMaterial.color.set('#ffffff');
      earthMaterial.needsUpdate = true;
    });

    if (isMoon) new THREE.TextureLoader().load(MOON_ELEVATION_MAP, texture => {
      texture.anisotropy = Math.min(2, renderer.capabilities.getMaxAnisotropy());
      texture.wrapS = THREE.RepeatWrapping;
      if (earthMaterial.userData.disposed) {
        texture.dispose();
        return;
      }
      // Bump mapping gives the craters visible depth cues without displacing
      // every vertex of the globe or allocating another large GPU texture.
      earthMaterial.bumpMap = texture;
      earthMaterial.bumpScale = 0.055;
      earthMaterial.needsUpdate = true;
    }, undefined, () => {
      mount.innerHTML = '<div class="webgl-error"><strong>Le relief lunaire n’a pas pu être chargé.</strong><span>Rechargez la page pour réessayer.</span></div>';
    });

    const render = () => {
      frameId = requestAnimationFrame(render);
      controls.update();
      renderer.render(scene, camera);
    };
    render();
    mount.querySelector('canvas')?.focus({ preventScroll: true });
    const closeOnEscape = event => { if (event.key === 'Escape') closeRef.current(); };
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      controls.dispose();
      controlsRef.current = null;
      scene.traverse(object => {
        object.geometry?.dispose?.();
        if (object.material) {
          object.material.userData.disposed = true;
          new Set([object.material.map, object.material.displacementMap, object.material.bumpMap]).forEach(texture => texture?.dispose());
          object.material.dispose();
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [bodyId, copy.globeCanvas]);

  const resetView = () => controlsRef.current?.reset();
  const zoomIn = () => { controlsRef.current?.dollyOut(1.25); controlsRef.current?.update(); };
  const zoomOut = () => { controlsRef.current?.dollyIn(1.25); controlsRef.current?.update(); };

  return <div className="earth-globe-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="earth-globe-dialog" role="dialog" aria-modal="true" aria-labelledby="earth-globe-title">
      <header className="earth-globe-header">
        <div><span className="eyebrow">FUTUR HAITI · {copy.globeMode}</span><h2 id="earth-globe-title">{bodyId === 'moon' ? (locale === 'ht' ? 'Eksplore Lalin nan' : 'Explore la Lune') : copy.globeTitle}</h2><p>{bodyId === 'moon' ? (locale === 'ht' ? 'Trennen pou vire l; rale pou w wè kratè yo pi pre.' : 'Fais tourner la Lune et zoome pour examiner ses cratères.') : copy.globeSubtitle}</p></div>
        <button className="earth-globe-close" onClick={onClose} aria-label={copy.close} autoFocus>×</button>
      </header>
      <div className="earth-globe-stage" ref={mountRef}/>
      <div className="earth-globe-footer">
        <p><span>◉</span>{isMoon ? (locale === 'ht' ? 'Trennen pou vire l; sèvi ak + ak - pou rale sou sifas la.' : 'Glisse pour tourner; utilise + et - pour observer le relief de près.') : copy.globeInstructions}</p>
        <div className="earth-globe-controls" role="group" aria-label={copy.globeControls}>
          <button onClick={zoomOut} aria-label={copy.zoomOut} title={copy.zoomOut}>−</button>
          <button onClick={resetView} aria-label={copy.globeReset} title={copy.globeReset}>↺ <span>{copy.globeReset}</span></button>
          <button onClick={zoomIn} aria-label={copy.zoomIn} title={copy.zoomIn}>+</button>
        </div>
      </div>
    </section>
  </div>;
}
