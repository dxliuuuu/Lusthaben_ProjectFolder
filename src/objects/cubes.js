import * as THREE from 'three';

export class Cube extends THREE.Mesh {
    constructor(color = 'orange') {
        const geometry = new THREE.BoxGeometry()
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color).convertSRGBToLinear()
        })

        super(geometry, material)

        this.isCube = true
        this.cubeActive = false
        this.cubeSize = 1
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z)
        return this
    }

    onResize(viewportWidth) {
        this.cubeSize = viewportWidth / 5
        this.scale.setScalar(this.cubeSize * (this.cubeActive ? 1.5 : 1))
    }

    onClick(hit) {
        this.cubeActive = !this.cubeActive
        this.scale.setScalar(this.cubeSize * (this.cubeActive ? 1.5 : 1))

        if (this.onCubeClick) this.onCubeClick(hit)
    }
}
