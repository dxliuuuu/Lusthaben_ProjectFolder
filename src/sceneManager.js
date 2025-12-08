import * as THREE from "three";
import { addResize } from "./resize.js";

export class SceneManager {
  constructor(canvas) {
    if (!canvas) throw new Error("SceneManager requires a canvas element");
    this.canvas = canvas;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    if ("outputColorSpace" in this.renderer) {
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    // Scene
    this.scene = new THREE.Scene();

    // Camera (positioned a bit back so FlyControls has room)
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 15000);
    this.camera.position.set(0, 2, 8);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(5, 10, 7);
    this.scene.add(ambient, dir);

    this.clock = new THREE.Clock();
    this._running = false;

    // resize helper
    this.removeResize = addResize(this.renderer, this.camera, this.scene, this.canvas);

    this._boundTick = this._tick.bind(this);
  }

  // no setYaw or manual camera rotation here — FlyControls manages rotation

  start() {
    if (this._running) return;
    this._running = true;
    requestAnimationFrame(this._boundTick);
  }

  stop() {
    this._running = false;
  }

  _tick() {
    if (!this._running) return;
    const dt = this.clock.getDelta();

    // update scene children who expose render(dt)
    this.scene.traverse(obj => {
      if (typeof obj.render === "function") {
        obj.render(dt);
      }
    });

    // let external controls update if attached
    if (this.controls && typeof this.controls.update === "function") {
      // FlyControls expects seconds delta
      this.controls.update(dt);
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this._boundTick);
  }
}
