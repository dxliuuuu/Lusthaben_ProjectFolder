import * as THREE from "three";

export function createPointer(scene, camera, domElement, handlers = {}) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const hovered = new Map();
  let lastIntersects = [];

  function updateIntersects(event) {
    const rect = domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    lastIntersects = raycaster.intersectObjects(scene.children, true);
  }

  function onPointerMove(e) {
    updateIntersects(e);

    const hitIds = new Set(lastIntersects.map(h => h.object.uuid));
    Array.from(hovered.keys()).forEach(uuid => {
      if (!hitIds.has(uuid)) {
        const obj = hovered.get(uuid);
        handlers.onHoverExit?.(obj, null);
        hovered.delete(uuid);
      }
    });

    // handle pointer over/move
    lastIntersects.forEach(hit => {
      const obj = hit.object;
      if (!hovered.has(obj.uuid)) {
        hovered.set(obj.uuid, obj);
        handlers.onHoverEnter?.(obj, hit);
      }
      // optional move callback
      handlers.onHoverMove?.(obj, hit);
    });
  }

  function onClick(e) {
    if (!lastIntersects.length) updateIntersects(e);
    if (lastIntersects.length) {
      lastIntersects.forEach(hit => handlers.onClick?.(hit.object, hit));
    }
  }

  domElement.addEventListener("pointermove", onPointerMove);
  domElement.addEventListener("click", onClick);

  return {
    dispose() {
      domElement.removeEventListener("pointermove", onPointerMove);
      domElement.removeEventListener("click", onClick);
    }
  };
}
