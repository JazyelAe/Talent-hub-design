// Count Up: las cifras de los paneles suben a su valor al entrar en pantalla.
// Con reduced-motion se muestran directo. El valor real está siempre en el texto final.
import { prefersReducedMotion } from "../utils.js";

export function animarContadores(ctx = document) {
  const els = [...ctx.querySelectorAll("[data-contar]")];
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    els.forEach((el) => { el.textContent = el.dataset.contar; });
    return;
  }
  const io = new IntersectionObserver((entradas) => {
    for (const en of entradas) {
      if (!en.isIntersecting) continue;
      io.unobserve(en.target);
      const fin = Number(en.target.dataset.contar);
      const t0 = performance.now();
      const paso = (t) => {
        const p = Math.min(1, (t - t0) / 700);
        en.target.textContent = Math.round(fin * (1 - (1 - p) ** 3));
        if (p < 1) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    }
  });
  els.forEach((el) => { el.textContent = "0"; io.observe(el); });
}
