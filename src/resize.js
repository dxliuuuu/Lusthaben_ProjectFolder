export function addResize(renderer, camera, scene, canvas) {
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;

    // update camera and renderer
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);

    // compute approximate viewport size at camera distance
    const target = { x: 0, y: 0, z: 0 };
    const distance = camera.position.distanceTo(target);
    const fov = (camera.fov * Math.PI) / 180;
    const viewportHeight = 2 * Math.tan(fov / 2) * distance;
    const viewportWidth = viewportHeight * (w / h);

    scene.traverse(obj => {
      if (typeof obj.onResize === "function") {
        obj.onResize(viewportWidth, viewportHeight, camera.aspect);
      }
    });
  }

  window.addEventListener("resize", resize);
  // initial call
  resize();
  return () => window.removeEventListener("resize", resize);
}
