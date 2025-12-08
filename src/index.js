import * as THREE from "three";
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/libs/stats.module.js';
import { FlyControls } from 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/controls/FlyControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/loaders/GLTFLoader.js';



let camera;
let controls;
let loadedModel;
const clock = new THREE.Clock();

// Renderer
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('black');

    // Camera
    camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    15000
);
camera.position.set(0,0,20);

scene.add(camera);

// Light
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(0,0,0);
camera.add(light);

// Controls
controls = new FlyControls(camera, renderer.domElement);
controls.movementSpeed = 300;
controls.rollSpeed = 0.5;
controls.dragToLook = true;

// Stats
const stats = new Stats();
document.body.appendChild(stats.dom);

// Geometry helper
function rand(min, max) {
    if (max === undefined) { max = min; min = 0; }
    return min + (max - min) * Math.random();
}

// Resize
window.addEventListener('resize', () => {
renderer.setSize(window.innerWidth, window.innerHeight);
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
});

// Cubes
const geometry = new THREE.BoxGeometry(1, 1, 1);
for (let i = 0; i < 10; ++i) {
    const material = new THREE.MeshPhongMaterial({ color: 0x00000 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(rand(-1000, 1000), rand(-100, 100), rand (-300, 50));
    cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
    cube.scale.set(rand(30, 60), rand(30, 60), rand(30, 60));
    scene.add(cube);
}

// Picking
class PickHelper {
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.pickedObject = null;
        this.pickedObjectSavedColor = 0;
    }
    pick(normalizedPosition, scene, camera) {
        if (this.pickedObject) {
            this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
            this.pickedObject = null;
        }

        this.raycaster.setFromCamera(normalizedPosition, camera);
        const intersected = this.raycaster.intersectObjects(scene.children);
        if (intersected.length > 0) {
            this.pickedObject = intersected[0].object;
            this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
            // this.pickedObject.material.emissive.setHex(0xffff00);
        }
    }
}

const pickHelper = new PickHelper();
const pickPosition = { x: -100000, y: -100000 };

// GLTF Loader
const gltfLoader = new GLTFLoader();

gltfLoader.load(
    './assets/warehouse_finland.gltf',
    (gltf) => {
        loadedModel = gltf.scene;
        gltf.scene.scale.set(80, 80, 80); 
        gltf.scene.position.y = -300;
        scene.add(loadedModel);
        console.log('Model loaded', loadedModel);
    },
    undefined,
    (error) => {
        console.error('Error loading GLTF:', error);
    }
);

// Render loop
function render() {
    const delta = clock.getDelta();
    controls.update(delta);

    // camera.rotation.x = 0;
    // camera.rotation.z = 0;

    if (resizeRendererToDisplaySize(renderer)) {
        const c = renderer.domElement;
        camera.aspect = c.clientWidth / c.clientHeight;
        camera.updateProjectionMatrix();
    }

    pickHelper.pick(pickPosition, scene, camera);
    renderer.render(scene, camera);
    stats.update();

    requestAnimationFrame(render);

}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = (canvas.width !== width || canvas.height !== height);
    if (needResize) renderer.setSize(width, height, false);
    return needResize;
}

function randomColor() {
    return `hsl(${rand(360) | 0}, ${rand(50, 100) | 0}%, 50%)`;
}

function clearPickPosition() {
    pickPosition.x = -100000;
    pickPosition.y = -100000;
}

requestAnimationFrame(render);
