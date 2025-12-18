import { GLTFLoader } from "jsm/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

export function loadModelSafe(path) {
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      gltf => resolve(gltf.scene),
      undefined,
      err => reject(err)
    );
  });
}
