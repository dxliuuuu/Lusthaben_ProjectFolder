import * as THREE from "three";
import { SceneManager } from "./sceneManager.js";
import { createPointer } from "./pointer.js";
import { Inventory } from "./objects/inventory.js";
import { loadModelSafe } from "./loadModelSafe.js";
import { openModal } from "./modal.js";
import { FlyControls } from "jsm/controls/FlyControls.js";
import Stats from "jsm/libs/stats.module.js";
import { EXRLoader } from "jsm/loaders/EXRLoader.js";

/* ------------------ Core setup ------------------ */

const canvas = document.getElementById("c");
const manager = new SceneManager(canvas);

/* ------------------ Constants ------------------ */

const BASE_SCALE = 1.3;
const HOVER_SCALE = 1.5;
const CLICK_SCALE = 2.1;
const NORMAL_SCALE = 2;

/* ------------------ Audio ------------------ */

const bgAudio = new Audio("./audio/LUSTHABEN Sonic Pi Audio/Ambient Melody.wav");
bgAudio.loop = true;
bgAudio.volume = 0.8;

bgAudio.play().catch(() =>
  window.addEventListener("click", () => bgAudio.play(), { once: true })
);

/* ------------------ Materials ------------------ */

const mirrorMaterialLight = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 1,
  roughness: 0.2,
  reflectivity: 1, 
  clearcoat: 1,
  clearcoatRoughness: 0
});

const mirrorMaterialDark = new THREE.MeshPhysicalMaterial({
    color: 0x000000,
    metalness: 1,
    roughness: 0.2,
    reflectivity: 1, 
    clearcoat: 1,
    clearcoatRoughness: 0
  });

/* ------------------ HDRI helper ------------------ */

async function loadHDRI(path) {
    const pmrem = new THREE.PMREMGenerator(manager.renderer);
    pmrem.compileEquirectangularShader();
  
    return new Promise((resolve, reject) => {
      new EXRLoader().load(
        path,
        texture => {
          const envMap = pmrem.fromEquirectangular(texture).texture;
          texture.dispose();
          pmrem.dispose();
          resolve(envMap);
        },
        undefined,
        reject
      );
    });
  }  

/* ------------------ Interaction helpers ------------------ */

function makeInteractable(
    obj,
    modalId,
    {
      scale = { base: BASE_SCALE, hover: HOVER_SCALE, click: CLICK_SCALE },
      rotation = null
    } = {}
  ) {
    obj.userData.interactable = true;
  
    // ----- Scale -----
    obj.userData.scale = scale;
    obj.userData.targetScale = scale.base;
    obj.scale.setScalar(scale.base);
  
    // ----- Rotation -----
    if (rotation) {
      obj.userData.rotationAxis = new THREE.Vector3(...rotation.axis).normalize();
      obj.userData.rotationSpeed = rotation.speed;
    }
  
    // ----- Interaction -----
    obj.userData.onHoverEnter = () => {
      obj.userData.targetScale = scale.hover;
    };
  
    obj.userData.onHoverExit = () => {
      obj.userData.targetScale = scale.base;
    };
  
    obj.userData.onClick = () => {
      if (modalId) openModal(obj, modalId);
      obj.userData.targetScale = scale.click ?? scale.hover;
    };
  }

  function applyInteractionRecursively(obj, modalId, options) {
    makeInteractable(obj, modalId, options);
  
    obj.traverse(child => {
      if (child.isMesh) {
        makeInteractable(child, modalId, options);
      }
    });
  }
  
/* ------------------ Pointer ------------------ */

createPointer(manager.scene, manager.camera, canvas, {
  onClick: obj => obj.userData?.onClick?.(),
  onHoverEnter: obj => obj.userData?.onHoverEnter?.(),
  onHoverExit: obj => obj.userData?.onHoverExit?.()
});

/* ------------------ Controls ------------------ */

const controls = new FlyControls(manager.camera, manager.renderer.domElement);
controls.movementSpeed = 50;
controls.dragToLook = false;
controls.rollSpeed = 0;
manager.controls = controls;

let mouseX = 0.5;
canvas.addEventListener("mousemove", e => {
  const r = canvas.getBoundingClientRect();
  mouseX = (e.clientX - r.left) / r.width;
});

const edgeMargin = 0.05;
const panSpeed = 0.02;
const originalUpdate = controls.update.bind(controls);

controls.update = delta => {
  originalUpdate(delta);
  const euler = new THREE.Euler().setFromQuaternion(controls.object.quaternion, "YXZ");
  if (mouseX < edgeMargin) euler.y += panSpeed;
  if (mouseX > 1 - edgeMargin) euler.y -= panSpeed;
  controls.object.quaternion.setFromEuler(euler);
};

/* ------------------ Stats (optional) ------------------ */

const stats = new Stats();
document.body.appendChild(stats.dom);

/* ------------------ Model loader helper ------------------ */

async function loadInteractiveModel({
    path,
    position,
    modalId,
    scale = { base: NORMAL_SCALE, hover: NORMAL_SCALE * 1.1, click: NORMAL_SCALE * 1.2 },
    rotation = null,
    material = null,
    yRotation = 0
  }) {
    const model = await loadModelSafe(path);
    const clone = model.clone(true);
  
    clone.position.copy(position);
    clone.rotation.y = yRotation;
    clone.scale.setScalar(scale.base);
  
    clone.traverse(c => {
      if (c.isMesh) {
        if (material) c.material = material;
        c.castShadow = c.receiveShadow = true;
      }
    });
  
    applyInteractionRecursively(clone, modalId, { scale, rotation });
  
    manager.scene.add(clone);
  }
  
/* ------------------ Load models ------------------ */

const envMap = await loadHDRI("./assets/studio_small_09_4k.exr");

manager.scene.environment = envMap;

loadInteractiveModel({
    path: "./assets/pressure/pressure.gltf",
    position: new THREE.Vector3(10, 20, -70),
    modalId: "text-1",
    scale: { base: 1.2, hover: 1.8, click: 2 },
    rotation: { axis: [0, 1, 0], speed: 0.01 },
    material: mirrorMaterialDark
  });

loadInteractiveModel({
    path: "./assets/hands/hands.gltf",
    position: new THREE.Vector3(-60, 20, -150),
    modalId: "text-2",
    scale: { base: 1.5, hover: 1.8, click: 2 },
    rotation: { axis: [0, 1, 0], speed: 0.005 },
    material: mirrorMaterialLight
  });

loadInteractiveModel({
    path: "./assets/weird_shape/weird_shape2.gltf",
    position: new THREE.Vector3(-20, 15, -250),
    modalId: "text-3",
    scale: { base: 0.3, hover: 0.33, click: 0.36 },
    rotation: { axis: [1, 0, 0], speed: 0.01 },
    material: mirrorMaterialLight
  });

  loadInteractiveModel({
    path: "./assets/air/air.gltf",
    position: new THREE.Vector3(40, 30, -360),
    modalId: "text-4",
    scale: { base: 2.3, hover: 2.5, click: 2.8 },
    rotation: { axis: [0, 1, 0], speed: 0.08 }, // per second
    material: mirrorMaterialLight
  });

  loadInteractiveModel({
    path: "./assets/melting/melting_man2.gltf",
    position: new THREE.Vector3(-20, 25, -550),
    modalId: "text-5",
    scale: { base: 2.8, hover: 3, click: 3.5 },
    rotation: { axis: [0, 0, 1], speed: 0.01 },
    material: mirrorMaterialLight
  });
  

loadModelSafe("./assets/warehouse/warehouse_remeshed.gltf")
.then(model => {
    model.scale.setScalar(20);
    const clone = model.clone(true);
    clone.position.set(100, -50, -300)
    clone.rotation.y = Math.PI/2;

    clone.traverse(c => {
        if (c.isMesh) {
            c.castShadow = c.receiveShadow = true;
        }
        });

    manager.scene.add(clone);
    })
    .catch(console.error);
    

/* ------------------ Darkroom Sphere ------------------ */

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(15, 64, 64),
  new THREE.MeshStandardMaterial({ color: 0x000000 })
);

sphere.position.set(-80, 20, -700);
sphere.userData.interactable = true;
sphere.userData.targetScale = 1;
sphere.material = mirrorMaterialDark;


sphere.userData.onHoverEnter = () => (sphere.userData.targetScale = 1.5);
sphere.userData.onHoverExit  = () => (sphere.userData.targetScale = 1);
sphere.userData.onClick      = () => (window.location.href = "./darkroom.html");

manager.scene.add(sphere);

/* ------------------ Animate scale ------------------ */

const originalTick = manager._tick.bind(manager);

manager._tick = function(delta) {
    manager.scene.traverse(obj => {
      if (obj.userData?.rotationAxis && typeof obj.userData.rotationSpeed === "number") {
        obj.rotateOnAxis(obj.userData.rotationAxis, obj.userData.rotationSpeed * delta);
      }
      if (obj.userData?.targetScale !== undefined) {
        const s = obj.scale.x;
        const t = obj.userData.targetScale;
        obj.scale.setScalar(s + (t - s) * 0.1);
      }
    });
    originalTick(delta);
  };
  

manager.start();
