import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

const container = document.getElementById("cake-3d-container");

if (!container) {
  console.error("Missing #cake-3d-container");
} else {
  const loadingLabel = document.getElementById("cake-loading");
  const modelUrl = container.dataset.modelUrl || "models/source/picnic.fbx";
  const texturePath = container.dataset.texturePath || "models/textures/";

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.2, 4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(3, 5, 2);
  scene.add(keyLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0.5, 0);
  controls.update();

  const loader = new FBXLoader();
  loader.setResourcePath(texturePath);

  loader.load(
    modelUrl,
    (model) => {
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxAxis = Math.max(size.x, size.y, size.z) || 1;
      model.scale.multiplyScalar(2 / maxAxis);
      model.position.sub(center);

      scene.add(model);
      if (loadingLabel) loadingLabel.remove();
    },
    undefined,
    () => {
      if (loadingLabel) {
        loadingLabel.textContent = `Unable to load ${modelUrl}`;
      }
    }
  );

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener("resize", () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}
