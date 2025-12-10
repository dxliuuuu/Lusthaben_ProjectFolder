import * as THREE from "three";
import { SceneManager } from "./sceneManager.js";
import { createPointer } from "./pointer.js";
import { Inventory } from "./objects/inventory.js";
import { loadModel } from "./objects/loadModel.js";
import { Modal, openModal } from "./modal.js";
import { FlyControls } from "https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/controls/FlyControls.js";
import Stats from "https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/libs/stats.module.js";

const canvas = document.getElementById("c");
const manager = new SceneManager(canvas);
const inventory = new Inventory();
const bS = 1;
const hS = 1.5;
const cS = 1.9;
const nScale = 2;

// Background audio
const bgAudio = new Audio("./audio/LUSTHABEN Sonic Pi Audio/Ambient Melody.wav");
bgAudio.currentTime = 1;
bgAudio.loop = true;       // loops continuously
bgAudio.volume = 0.8;      // adjust as needed
bgAudio.play().catch(err => console.log("Autoplay blocked, will play on first user interaction"));

window.addEventListener("click", () => {
  bgAudio.play();
}, { once: true });

// material
const mirrorMaterial_dark = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 1,
  roughness: 0.2,
  reflectivity: 1,     // how reflective the surface is
  clearcoat: 1,        // shiny coating
  clearcoatRoughness: 0
});

const Material_light = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 1,
  roughness: 0.2,
  reflectivity: 1,     // how reflective the surface is
  clearcoat: 1,        // shiny coating
  clearcoatRoughness: 0
});

// Assign it as environment map
mirrorMaterial_dark.envMap = "./assets/studio_small_09_4k.exr";
mirrorMaterial_dark.envMapIntensity = 500; // reflection intensity

canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (event.clientX - rect.left) / rect.width;
});


function makeInteractableObject(obj, modalId, baseScale = bS, hoverScale = hS, clickScale = cS) {
  obj.userData.interactable = true;

  // set initial scale
  obj.scale.setScalar(baseScale);
  obj.userData.targetScale = baseScale;

  // store original emissive per mesh
  const originalEmissives = new Map();
  obj.traverse(child => {
      if (child.isMesh) {
          originalEmissives.set(child, child.material.emissive ? child.material.emissive.clone() : new THREE.Color(0x000000));
      }
  });

  obj.userData.onHoverEnter = () => {
      obj.userData.targetScale = hoverScale;
      obj.traverse(child => {
          if (child.isMesh) {
              child.material.emissive = new THREE.Color(0xffffff);
              child.material.emissiveIntensity = 1;
          }
      });
  };

  obj.userData.onHoverExit = () => {
      obj.userData.targetScale = baseScale;
      obj.traverse(child => {
          if (child.isMesh && originalEmissives.has(child)) {
              child.material.emissive = originalEmissives.get(child).clone();
          }
      });
  };

  obj.userData.onClick = () => {
      openModal(obj, modalId);
      obj.userData.targetScale = clickScale;
  };

  return obj;
}

// recursively apply interaction to imported models
function applyInteractionRecursively(obj, modalId, baseScale = bS, hoverScale = hS, clickScale = cS) {
    makeInteractableObject(obj, modalId, baseScale, hoverScale, clickScale);

    obj.traverse(child => {
        if (child.isMesh) {
            makeInteractableObject(child, modalId, baseScale, hoverScale, clickScale);
        }
    });

    return obj;
}

// --------------------------------------------------
// Pointer interactions
// --------------------------------------------------

createPointer(manager.scene, manager.camera, canvas, {
  onClick(obj) {
      obj.userData?.interactable && obj.userData.onClick?.();
  },
  onHoverEnter(obj) {
      obj.userData?.interactable && obj.userData.onHoverEnter?.();
  },
  onHoverExit(obj) {
      obj.userData?.interactable && obj.userData.onHoverExit?.();
  }
});

// --------------------------------------------------
// Stats
// --------------------------------------------------

const stats = new Stats();
document.body.appendChild(stats.dom);

// --------------------------------------------------
// FlyControls with edge-screen panning
// --------------------------------------------------

const controls = new FlyControls(manager.camera, manager.renderer.domElement);
controls.movementSpeed = 50;
controls.rollSpeed = 0; // lock roll
controls.dragToLook = false; // user doesn't have to click

// Edge pan settings
const edgeMargin = 0.05; // 5% of canvas width
const panSpeed = 0.02;   // radians per frame
let mouseX = 0.5;

// Track mouse position
canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (event.clientX - rect.left) / rect.width;
});

// Override update to implement horizontal-only edge panning
const originalUpdate = controls.update.bind(controls);
controls.update = function(delta) {
    originalUpdate(delta);

    // Get current yaw from camera quaternion
    const euler = new THREE.Euler().setFromQuaternion(controls.object.quaternion, "YXZ");
    let yaw = euler.y;

    // Rotate left/right if mouse is near edges
    if (mouseX < edgeMargin) {
        yaw += panSpeed;
    } else if (mouseX > 1 - edgeMargin) {
        yaw -= panSpeed;
    }

    // Lock pitch and roll
    const pitch = 0;
    const roll = 0;

    controls.object.quaternion.setFromEuler(new THREE.Euler(pitch, yaw, roll, "YXZ"));
};

// Attach to SceneManager
manager.controls = controls;

// --------------------------------------------------
// Load Imported Models 
// --------------------------------------------------

// Warehouse
loadModel("./assets/warehouse/warehouse_remeshed.gltf")
    .then(model => {
        model.scale.setScalar(20);
        inventory.add(model, "Warehouse");

        const clone = model.clone(true);
        clone.position.set(100, -50, -300);
        clone.rotation.y = Math.PI / 2;

        clone.traverse(child => {
          if (child.isMesh) {
              const mat = child.material;
              child.material = mat.clone(); // clone material so other objects are unaffected
              child.material.color = new THREE.Color(0x454545); // dark gray
              child.material.needsUpdate = true;
              child.castShadow = true;
              child.receiveShadow = true;
          }
      });

      
        manager.scene.add(clone);
    })
    .catch(err => console.error("Model load failed:", err));

// Pressure
loadModel("./assets/pressure/pressure.gltf")
.then(model => {
    model.scale.setScalar(nScale);
    inventory.add(model, "hands");

    const clone = model.clone(true);
    clone.position.set(10, 20, -80);

    applyInteractionRecursively(clone, "text-1", bS, hS, cS);

    clone.userData.rotationAxis = new THREE.Vector3(0, 0.3, 0); // y-axis
    clone.userData.rotationSpeed = 0.01; // radians per frame

    clone.traverse(child => {
      if (child.isMesh) {
          child.material = mirrorMaterial_dark;
          child.castShadow = true;
          child.receiveShadow = true;
      }
  });

    manager.scene.add(clone);
})
.catch(err => console.error("Model load failed:", err));

// Skin
loadModel("./assets/hands/hands.gltf")
    .then(model => {
        model.scale.setScalar(nScale);
        inventory.add(model, "hands");

        const clone = model.clone(true);
        clone.position.set(-60, 20, -150);

        applyInteractionRecursively(clone, "text-2", bS, hS, cS);

        clone.traverse(child => {
          if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
          }
      });

        clone.userData.rotationAxis = new THREE.Vector3(0, 0.5, 0);
        clone.userData.rotationSpeed = 0.01; // radians per frame

        manager.scene.add(clone);
    })
    .catch(err => console.error("Model load failed:", err));

// LightShape
loadModel("./assets/weird_shape/weird_shape2.gltf")
    .then(model => {
        model.scale.setScalar(0.3);
        inventory.add(model, "weirdShape");

        const clone = model.clone(true);
        clone.position.set(-20, 10, -250);

        applyInteractionRecursively(clone, "text-3", 0.3, 0.33, 0.36);

        clone.userData.rotationAxis = new THREE.Vector3(0.3, 0, 0);
        clone.userData.rotationSpeed = 0.01; // radians per frame

        clone.traverse(child => {
          if (child.isMesh) {
              child.material = mirrorMaterial_dark;
              child.castShadow = true;
              child.receiveShadow = true;
          }
      });

        manager.scene.add(clone);
    })
    .catch(err => console.error("Model load failed:", err));

// Air
loadModel("./assets/air/air.gltf")
    .then(model => {
        model.scale.setScalar(2.8);
        inventory.add(model, "air");

        const clone = model.clone(true);
        clone.position.set(40, 30, -360);

        applyInteractionRecursively(clone, "text-4", 2.8, 3.2, 3.5);

        clone.userData.rotationAxis = new THREE.Vector3(0, 0.3, 0);
        clone.userData.rotationSpeed = 0.01; // radians per frame

        clone.traverse(child => {
          if (child.isMesh) {
              child.material = mirrorMaterial_dark;
              child.castShadow = true;
              child.receiveShadow = true;
          }
      });

        manager.scene.add(clone);
    })
    .catch(err => console.error("Model load failed:", err));

// Time
loadModel("./assets/melting/melting_man2.gltf")
.then(model => {
    model.scale.setScalar(2.8);
    inventory.add(model, "melting_man");

    const clone = model.clone(true);
    clone.position.set(-60, 20, -500);
    clone.rotation.y = - Math.PI / 2;

    applyInteractionRecursively(clone, "text-5", 2.8, 3.1, 3.5);

    clone.userData.rotationAxis = new THREE.Vector3(0, 0, 0.5);
    clone.userData.rotationSpeed = 0.01; // radians per frame


    manager.scene.add(clone);

    console.log("imported");
})
.catch(err => console.error("Model load failed:", err));

// --------------------
// Load Darkroom Sphere
// --------------------
function loadDarkroomSphere() {
  const sphereGeometry = new THREE.SphereGeometry(15, 64, 64);
  const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      metalness: 1,
      roughness: 0,
      emissive: 0x000000,
      emissiveIntensity: 0
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(-80, 20, -700);
  manager.scene.add(sphere);
  inventory.add(sphere, "Darkroom Sphere");

  makeInteractableObject(sphere, "modal-darkroom", 1, 1.5, 1.7);

  sphere.userData.onHoverEnter = () => {
      sphere.userData.targetScale = 1.5;
      sphere.material.emissive = new THREE.Color(0xff0000);
      sphere.material.emissiveIntensity = 1.5;
  };

  sphere.userData.onHoverExit = () => {
      sphere.userData.targetScale = 1;
      sphere.material.emissive = new THREE.Color(0x000000);
      sphere.material.emissiveIntensity = 0;
  };

  sphere.userData.onClick = () => openModal(sphere, "modal-darkroom");
}

loadDarkroomSphere();


// --------------------------------------------------
// Start Render Loop
// --------------------------------------------------

manager.start();

// Animate object scale smoothly in SceneManager's tick
const originalTick = manager._tick.bind(manager);
manager._tick = function () {
    manager.scene.traverse(obj => {
        if (obj.userData?.targetScale !== undefined) {
            const s = obj.scale.x;
            const t = obj.userData.targetScale;
            const delta = (t - s) * 0.1;
            obj.scale.setScalar(s + delta);
        }
    });
    originalTick();
};
