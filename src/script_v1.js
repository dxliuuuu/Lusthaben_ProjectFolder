import * as THREE from "three";
import { FlyControls } from "jsm/controls/FlyControls.js";
import { GLTFLoader } from "jsm/loaders/GLTFLoader.js";

function main() {

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
    camera.position.z = 20;
    scene.add(camera);

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(-1, 2, 4);
    camera.add(light);

    // GLTF Loader
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
        './assets/warehouse_finland.gltf',
        gltf => {
            loadedModel = gltf.scene;
            loadedModel.scale.set(80, 80, 80);
            loadedModel.position.y = -300;
            scene.add(loadedModel);
        },
        undefined,
        err => console.error('GLTF load error:', err)
    );

    // Random cubes
    function rand(min, max) {
        if (max === undefined) { max = min; min = 0; }
        return min + (max - min) * Math.random();
    }

    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    for (let i = 0; i < 10; i++) {
        const cube = new THREE.Mesh(
            cubeGeo,
            new THREE.MeshPhongMaterial({ color: 0x000000 })
        );
        cube.position.set(rand(-1000, 1000), rand(-100, 100), rand(-300, 50));
        cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
        cube.scale.set(rand(30, 60), rand(30, 60), rand(30, 60));
        scene.add(cube);
    }

    // Picking helper
    class PickHelper {
        constructor() {
            this.raycaster = new THREE.Raycaster();
            this.pickedObject = null;
            this.originalEmissive = 0;
        }
        pick(normPos, scene, camera) {
            if (this.pickedObject) {
                this.pickedObject.material.emissive.setHex(this.originalEmissive);
                this.pickedObject = null;
            }
            this.raycaster.setFromCamera(normPos, camera);
            const hits = this.raycaster.intersectObjects(scene.children);
            if (hits.length > 0) {
                this.pickedObject = hits[0].object;
                this.originalEmissive = this.pickedObject.material.emissive.getHex();
            }
        }
    }

    const pick = new PickHelper();
    const pickPos = { x: -100000, y: -100000 };

    function getCanvasPos(e) {
        const r = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - r.left) * canvas.width / r.width,
            y: (e.clientY - r.top) * canvas.height / r.height
        };
    }

    function setPick(e) {
        const p = getCanvasPos(e);
        pickPos.x = (p.x / canvas.width) * 2 - 1;
        pickPos.y = (p.y / canvas.height) * -2 + 1;
    }

    function clearPick() {
        pickPos.x = -100000;
        pickPos.y = -100000;
    }

    window.addEventListener("mousemove", setPick);
    window.addEventListener("mouseout", clearPick);
    window.addEventListener("mouseleave", clearPick);

    // FlyControls
    controls = new FlyControls(camera, renderer.domElement);
    controls.movementSpeed = 300;
    controls.rollSpeed = Math.PI / 6;
    controls.dragToLook = true;

    // Resize (correct)
    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    function resizeToDisplay(renderer) {
        const canvas = renderer.domElement;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const need = (canvas.width !== w || canvas.height !== h);
        if (need) renderer.setSize(w, h, false);
        return need;
    }

    // Render loop
    function render() {
        const dt = clock.getDelta();
        controls.update(dt);

        if (resizeToDisplay(renderer)) {
            const c = renderer.domElement;
            camera.aspect = c.clientWidth / c.clientHeight;
            camera.updateProjectionMatrix();
        }

        pick.pick(pickPos, scene, camera);

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();
