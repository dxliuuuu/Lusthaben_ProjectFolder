export const Modal = {
    show(html) {
      const modal = document.getElementById("modal");
      const content = document.getElementById("modal-content");
      if (!modal || !content) {
        console.warn("Modal: missing DOM elements");
        return;
      }
  
      content.innerHTML = html;
      // ensure element is laid out as flex before adding .show so transition runs
      modal.style.display = "flex";
      // allow the browser a frame to apply display before toggling opacity
      requestAnimationFrame(() => modal.classList.add("show"));
      modal.setAttribute("aria-hidden", "false");
    },
  
    hide() {
      const modal = document.getElementById("modal");
      if (!modal) return;
      modal.classList.remove("show");
      modal.addEventListener("transitionend", function handler() {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
        modal.removeEventListener("transitionend", handler);
      }, { once: true });
    }
  };
  
  // Attach the close button after DOM content is available
  document.addEventListener("DOMContentLoaded", () => {
    const close = document.getElementById("modal-close");
    if (close) close.addEventListener("click", () => Modal.hide());
  });
  