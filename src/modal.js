export let activeObj = null;

export const Modal = {
  show(html) {
    const modal = document.getElementById("modal");
    const content = document.getElementById("modal-content");
    if (!modal || !content) {
      console.warn("Modal: missing DOM elements");
      return;
    }

    content.innerHTML = html;
    modal.style.display = "flex";
    requestAnimationFrame(() => modal.classList.add("show"));
    modal.setAttribute("aria-hidden", "false");
  },


  hide() {
    const modal = document.getElementById("modal");
    if (!modal) return;

    // Reset scale when closing
    if (activeObj) {
      activeObj.scale.set(1, 1, 1);
      activeObj = null;
    }   
    
    modal.classList.remove("show");

    modal.addEventListener(
      "transitionend",
      function handler() {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
        modal.removeEventListener("transitionend", handler);
      },
      { once: true }
    );
  }
};

export function openModal(obj, htmlId) {
  activeObj = obj;

  const template = document.getElementById(htmlId).cloneNode(true);
  template.style.display = "block";

  const pos = template.querySelector(".position");
  if (pos) {
    pos.textContent = `Position: ${obj.position.x.toFixed(2)}, ${obj.position.y.toFixed(2)}, ${obj.position.z.toFixed(2)}`;
  }

  Modal.show(template.innerHTML);
}

// Close button functionality
document.addEventListener("DOMContentLoaded", () => {
  const close = document.getElementById("modal-close");
  if (close) close.addEventListener("click", () => Modal.hide());
});