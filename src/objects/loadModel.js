import * as THREE from 'three';
import { GLTFLoader } from "jsm/loaders/GLTFLoader.js";

export function loadModel(url) {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader()

        loader.load(
            url,
            gltf => resolve(gltf.scene),
            undefined,
            err => reject(err)
        )
    })
}