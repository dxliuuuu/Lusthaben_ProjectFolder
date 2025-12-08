import { SceneManager } from "./sceneManager.js";
import { createPointer } from "./pointer.js";
import { Cube } from "./objects/cubes.js";
import { Inventory } from "./objects/inventory.js";
import { loadModel } from "./objects/loadModel.js";
import { Modal } from "./modal.js";
import { FlyControls } from 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/controls/FlyControls.js';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/libs/stats.module.js';

// Setup
const canvas = document.getElementById("c");
const manager = new SceneManager(canvas);
const inventory = new Inventory();

// Create cubes
const cube1 = new Cube("white").setPosition(-2, 0.5, 0); 
const cube2 = new Cube("white").setPosition(2, 0.5, 0);
const cube3 = new Cube("white").setPosition(4, 0.5, 0);
const cube4 = new Cube("white").setPosition(-4, 0.5, 0);
manager.scene.add(cube1, cube2, cube3, cube4);

// Assign HTML modal callback for cube click
cube1.onCubeClick = () => {
  Modal.show(`
    <h2>Artifact 1 Info</h2>
    <p>Position: ${cube1.position.x.toFixed(2)}, ${cube1.position.y.toFixed(2)}, ${cube1.position.z.toFixed(2)}</p>
    <p>Enter Text Here</p>
  `);
};

cube2.onCubeClick = () => {
  Modal.show(`
    <h2>Arifact 2 Info</h2>
    <p>Position: ${cube2.position.x.toFixed(2)}, ${cube2.position.y.toFixed(2)}, ${cube2.position.z.toFixed(2)}</p>
    <p>Enter Text Here</p>
  `);
};

cube3.onCubeClick = () => {
    Modal.show(`
      <h2>Arifact 3 Info</h2>
      <p>Position: ${cube3.position.x.toFixed(2)}, ${cube3.position.y.toFixed(2)}, ${cube3.position.z.toFixed(2)}</p>
      <p>Enter Text Here</p>
    `);
  };

// Pointer interactions (single instance)
createPointer(manager.scene, manager.camera, canvas, {
  onClick(obj, hit) {
    if (obj.isCube) {
      obj.onClick(hit); // toggles scale and triggers onCubeClick
    }
  },
  onHoverEnter(obj, hit) {
    // example hover effect (optional)
    if (obj.isCube) obj.material.emissive?.set?.(0x222222);
  },
  onHoverExit(obj) {
    if (obj.isCube) obj.material.emissive?.set?.(0x000000);
  }
});

// Stats
const stats = new Stats();
document.body.appendChild(stats.dom);

// FlyControls
const controls = new FlyControls(manager.camera, manager.renderer.domElement);
controls.movementSpeed = 100;
controls.rollSpeed = Math.PI / 6;
controls.dragToLook = true;
manager.controls = controls; // SceneManager._tick will call controls.update(dt)

// Load model (unchanged)
loadModel("./assets/warehouse_finland.gltf")
  .then((model) => {
    model.scale.setScalar(20);
    inventory.add(model, "DemoModel");
    const clone = model.clone(true);
    clone.position.set(0, -50, -2);
    manager.scene.add(clone);
  })
  .catch(err => console.error("Model load failed:", err));

// Start the loop
manager.start();
