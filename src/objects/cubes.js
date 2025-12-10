// InteractableObject.js
import * as THREE from 'three';

export class InteractableObject extends THREE.Mesh {
    constructor(geometry, material) {
        super(geometry, material);

        // interaction flags
        this.isInteractableObject = true;

        // interaction state
        this.baseScale = 0.5;   // starting scale
        this.currentTargetScale = this.baseScale;

        // apply initial size immediately (prevents "shrinking later")
        this.scale.setScalar(this.baseScale);
    }

    // Set world position
    setPosition(x, y, z) {
        this.position.set(x, y, z);
        return this;
    }

    // Triggered externally (click logic)
    onClick(hit) {
        // example click scale highlight
        this.animateScale(0.9);

        if (this.onObjectClick) {
            this.onObjectClick(hit);
        }
    }

    // Smooth animation to target scale
    animateScale(target, speed = 0.1) {
        this.currentTargetScale = target;
        this.scaleSpeed = speed;
    }

    // Called every frame by sceneManager
    update(dt) {
        if (this.currentTargetScale !== undefined) {
            const s = this.scale;
            const t = this.currentTargetScale;

            // smooth interpolation
            s.x += (t - s.x) * 0.1;
            s.y += (t - s.y) * 0.1;
            s.z += (t - s.z) * 0.1;

            if (Math.abs(s.x - t) < 0.001) {
                this.scale.set(t, t, t);
                this.currentTargetScale = undefined;
            }
        }
    }
}
