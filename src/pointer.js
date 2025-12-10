import * as THREE from "three";

export function createPointer(scene, camera, domElement, handlers = {}) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Track which objects are currently hovered
    const hovered = new Map();   // uuid → object
    let lastIntersects = [];

    // --------------------------------------------------
    // Update mouse → raycast
    // --------------------------------------------------
    function updateIntersects(event) {
        const rect = domElement.getBoundingClientRect();

        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        lastIntersects = raycaster.intersectObjects(scene.children, true);
    }

    // --------------------------------------------------
    // Pointer Move → Hover logic
    // --------------------------------------------------
    function onPointerMove(e) {
        updateIntersects(e);

        // Build a set of uuid's from objects under the pointer
        const hitIds = new Set(lastIntersects.map(hit => hit.object.uuid));

        // Hover Exit
        for (const [uuid, obj] of hovered) {
            if (!hitIds.has(uuid)) {
                handlers.onHoverExit?.(obj, null);
                hovered.delete(uuid);
            }
        }

        // Hover Enter
        lastIntersects.forEach(hit => {
            const obj = hit.object;

            // ignore if this object is already hovered
            if (!hovered.has(obj.uuid)) {
                hovered.set(obj.uuid, obj);
                handlers.onHoverEnter?.(obj, hit);
            }
        });
    }

    // --------------------------------------------------
    // Pointer Click
    // --------------------------------------------------
    function onClick(e) {
        updateIntersects(e);

        if (lastIntersects.length === 0) return;

        const hit = lastIntersects[0];
        const hitObject = hit.object;

        handlers.onClick?.(hitObject, hit);
    }

    // --------------------------------------------------
    // Events
    // --------------------------------------------------
    domElement.addEventListener("pointermove", onPointerMove);
    domElement.addEventListener("click", onClick);

    return {
        dispose() {
            domElement.removeEventListener("pointermove", onPointerMove);
            domElement.removeEventListener("click", onClick);
        }
    };
}
