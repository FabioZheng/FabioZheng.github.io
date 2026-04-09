import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const container = document.getElementById("cake-3d-container");

if (!container) {
  console.error("[cake-3d] Missing #cake-3d-container element.");
} else {
  // Scene setup
  const scene = new THREE.Scene();

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.6, 4.8);

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffd9f2, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
  directionalLight.position.set(3, 5, 2);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(1024, 1024);
  directionalLight.shadow.camera.near = 0.1;
  directionalLight.shadow.camera.far = 20;
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xff89d6, 0.8, 15);
  pointLight.position.set(-2.2, 2.5, 2.4);
  scene.add(pointLight);

  // Subtle stage to receive shadows
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 64),
    new THREE.MeshStandardMaterial({ color: 0xffcde9, roughness: 0.7, metalness: 0.05 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.15;
  ground.receiveShadow = true;
  scene.add(ground);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = true;
  controls.panSpeed = 0.55;
  controls.minDistance = 2;
  controls.maxDistance = 8;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.target.set(0, 0.35, 0);
  controls.update();

  let cakeRoot = null;
  let userInteracting = false;
  let destroyed = false;

  controls.addEventListener("start", () => {
    userInteracting = true;
  });

  controls.addEventListener("end", () => {
    setTimeout(() => {
      userInteracting = false;
    }, 350);
  });

  function centerAndFrameModel(object3D) {
    const bbox = new THREE.Box3().setFromObject(object3D);
    const size = bbox.getSize(new THREE.Vector3());

    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const fitScale = 2.1 / maxAxis;
    object3D.scale.multiplyScalar(fitScale);

    const adjustedBox = new THREE.Box3().setFromObject(object3D);
    const adjustedCenter = adjustedBox.getCenter(new THREE.Vector3());
    object3D.position.sub(adjustedCenter);
    object3D.position.y += 0.15;

    controls.target.set(0, 0.35, 0);
    camera.position.set(0, 1.6, 4.8);
    camera.lookAt(controls.target);
    controls.update();
  }

  function applyCakeShadows(root) {
    root.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  function createFallbackCake() {
    console.warn("[cake-3d] Falling back to procedural cake model.");

    const group = new THREE.Group();

    const tiers = [
      { r: 1.15, h: 0.55, y: -0.55, color: 0xffd5ea },
      { r: 0.82, h: 0.45, y: -0.02, color: 0xffb4dd },
      { r: 0.54, h: 0.36, y: 0.43, color: 0xff91cf },
    ];

    tiers.forEach((tier) => {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(tier.r, tier.r * 0.96, tier.h, 48),
        new THREE.MeshStandardMaterial({
          color: tier.color,
          roughness: 0.42,
          metalness: 0.08,
        })
      );
      mesh.position.y = tier.y;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    });

    const candleCount = 6;
    for (let i = 0; i < candleCount; i += 1) {
      const angle = (i / candleCount) * Math.PI * 2;
      const candle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.38, 20),
        new THREE.MeshStandardMaterial({ color: 0xfff0f8, roughness: 0.35 })
      );
      candle.position.set(Math.cos(angle) * 0.32, 0.8, Math.sin(angle) * 0.32);
      candle.castShadow = true;
      group.add(candle);

      const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 12, 12),
        new THREE.MeshStandardMaterial({
          color: 0xffd166,
          emissive: 0xff9c3d,
          emissiveIntensity: 1.2,
        })
      );
      flame.position.copy(candle.position);
      flame.position.y += 0.24;
      group.add(flame);
    }

    return group;
  }

  // Model loading
  const loader = new GLTFLoader();
  loader.load(
    "/public/models/cake.glb",
    (gltf) => {
      cakeRoot = gltf.scene;
      applyCakeShadows(cakeRoot);
      centerAndFrameModel(cakeRoot);
      scene.add(cakeRoot);
    },
    undefined,
    (error) => {
      console.error("[cake-3d] Failed to load /public/models/cake.glb", error);
      cakeRoot = createFallbackCake();
      centerAndFrameModel(cakeRoot);
      scene.add(cakeRoot);
    }
  );

  // Animation loop
  const clock = new THREE.Clock();
  function animate() {
    if (destroyed) return;

    const elapsed = clock.getElapsedTime();

    if (cakeRoot) {
      const floatingBase = 0.12;
      if (!userInteracting) {
        cakeRoot.rotation.y += 0.0025;
        cakeRoot.position.y = floatingBase + Math.sin(elapsed * 0.8) * 0.03;
      }
    }

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // Resize handling + cleanup
  function onResize() {
    if (!container || destroyed) return;
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
  }

  window.addEventListener("resize", onResize);

  window.addEventListener("beforeunload", () => {
    destroyed = true;
    window.removeEventListener("resize", onResize);
    controls.dispose();
    renderer.dispose();
  });
}
