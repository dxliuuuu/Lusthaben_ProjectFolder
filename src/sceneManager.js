// sceneManager.js
import * as THREE from "three";
import { addResize } from "./resize.js";
import { LightManager } from "./lightManager.js";

// POSTPROCESSING (CINEMATIC GLARE)
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.162/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.162/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.162/examples/jsm/postprocessing/UnrealBloomPass.js";

export class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true
        });

        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        // SHADOWS
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.006);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            40,
            window.innerWidth / window.innerHeight,
            0.1,
            15000
        );
        this.camera.position.set(-8, 15, 4);

        // --------------------------------------------------
        // LIGHT MANAGER
        // --------------------------------------------------
        this.lights = new LightManager(this.scene);

        // light 1
        this.lights.createSpotlight({
            color: 0xff0000,
            intensity: 9000,
            angle: 0.2,
            position: [10, 100, 30],
            target: [0, -40, -120],
            pulse: true,
            pulseSpeed: 2.0,
            pulseAmount: 0.25
        });

        // light 2
        this.lights.createSpotlight({
          color: 0xff0000,
          intensity: 4000,
          angle: 0.15,
          position: [10, 50, 30],
          target: [-60, 20, -150],
          pulse: true,
          pulseSpeed: 3.5,
          pulseAmount: 0.15
      });

        // light 3
        this.lights.createSpotlight({
            color: 0xff0000,
            intensity: 4000,
            angle: 0.45,
            position: [-50, 60, -150],
            target: [-20, 0, -300],
            pulse: true,
            pulseSpeed: 0.8,
            pulseAmount: 0.4
        });

      this.lights.createSpotlight({
        color: 0xff0000,
        intensity: 7000,
        angle: 0.45,
        position: [-80, 63, -120],
        target: [-140, -10, -120],
        pulse: true,
        pulseSpeed: 3.5,
        pulseAmount: 0.55
      });

      this.lights.createSpotlight({
        color: 0xff0000,
        intensity: 7000,
        angle: 0.45,
        position: [-80, 63, -280],
        target: [-140, -10, -280],
        pulse: true,
        pulseSpeed: 3.5,
        pulseAmount: 0.55
      });


      this.lights.createSpotlight({
        color: 0xff0000,
        intensity: 7000,
        angle: 0.45,
        position: [-80, 53, -420],
        target: [-140, -10, -420],
        pulse: true,
        pulseSpeed: 3.5,
        pulseAmount: 0.55
      });

      this.lights.createSpotlight({
        color: 0xffffff,
        intensity: 6000,
        angle: 0.45,
        position: [-10, 53, -65],
        target: [-10, 250, -650],
        pulse: true,
        pulseSpeed: 3.5,
        pulseAmount: 0.55
      });

        // Bloom
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        this.bloom = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.8,   // strength
            0.3,   // radius
            0.55   // threshold
        );

        this.composer.addPass(this.bloom);

        // Internal clocks
        this.clock = new THREE.Clock();
        this._running = false;

        addResize(this.renderer, this.camera, this.scene, this.canvas);
        this._boundTick = this._tick.bind(this);
    }

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

        const delta = this.clock.getDelta();
        const elapsed = this.clock.elapsedTime;

        // update lights (pulse)
        this.lights.update(delta, elapsed);

        // update controls
        if (this.controls && this.controls.update) {
            this.controls.update(delta);
        }

        // animations on scene objects
        this.scene.traverse(obj => {
            if (obj.userData.rotationAxis) {
                obj.rotateOnAxis(obj.userData.rotationAxis, obj.userData.rotationSpeed);
            }
        });

        // render with bloom
        this.composer.render();

        // hover control
        this.scene.traverse(obj => {
          if (obj.userData?.targetScale !== undefined) {
              const t = obj.userData.targetScale;
              obj.scale.lerp(new THREE.Vector3(t, t, t), 0.1);
          }
      });
      

        requestAnimationFrame(this._boundTick);
    }
}
