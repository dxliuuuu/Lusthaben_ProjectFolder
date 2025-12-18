// lightManager.js
import * as THREE from "three";

export class LightManager {
    constructor(scene) {
        this.scene = scene;
        this.pulsingLights = [];
    }

    createSpotlight({
        color = 0xffffff,
        intensity = 2000,
        distance = 0,
        angle = 0.3,
        penumbra = 0.1,
        decay = 1,
        position = [0, 20, 0],
        target = [0, 0, 0],
        castShadow = true,
        shadowSize = 1080,

        pulse = false,
        pulseSpeed = 1.5,
        pulseAmount = 0.3
    }) {

        const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.02 );
        this.scene.add(directionalLight);

        const light = new THREE.SpotLight(
            color,
            intensity,
            distance,
            angle,
            penumbra,
            decay
        );

        light.position.set(...position);


        // target
        light.target.position.set(...target);
        this.scene.add(light.target);

        // shadows
        light.castShadow = castShadow;
        if (castShadow) {
            light.shadow.mapSize.width = shadowSize;
            light.shadow.mapSize.height = shadowSize;
            light.shadow.camera.near = 1;
            light.shadow.camera.far = 600;
            light.shadow.camera.fov = THREE.MathUtils.radToDeg(angle);
        }

        this.scene.add(light);

        // // helper
        // const helper = new THREE.SpotLightHelper(light);
        // this.scene.add(helper); 
        // light.updateMatrixWorld(true); 
        // helper.update();

        // pulsing
        if (pulse) {
            this.pulsingLights.push({
                light,
                baseIntensity: intensity,
                pulseSpeed,
                pulseAmount
            });
        }

        return light;
    }

    /**
     * Called manually every frame from SceneManager.tick()
     */
    update(delta, elapsed) {
        for (const p of this.pulsingLights) {
            p.light.intensity =
                p.baseIntensity *
                (1 + p.pulseAmount * Math.sin(elapsed * p.pulseSpeed));
        }
    }
}
