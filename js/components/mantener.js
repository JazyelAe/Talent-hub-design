// Botón de mantener presionado para acciones destructivas (Hold Button).
// Llenar la píldora toma 1.2 s; soltar antes revierte. Funciona con puntero (ratón/táctil)
// y con teclado (mantener Espacio o Enter). Al completarse emite el evento "mantenido",
// y la página abre un diálogo que nombra la consecuencia.
const DURACION = 1200;

function preparar(btn) {
  if (btn.dataset.mantenerListo) return;
  btn.dataset.mantenerListo = "1";
  const etiqueta = btn.getAttribute("aria-label") || btn.textContent.trim();
  btn.setAttribute("aria-label", `${etiqueta}. Mantén presionado para confirmar`);
  btn.setAttribute("aria-roledescription", "botón de mantener presionado");

  let inicio = 0, raf = 0, activo = false;

  const pintar = (p) => btn.style.setProperty("--progreso", p.toFixed(3));
  const tick = (t) => {
    const p = Math.min(1, (t - inicio) / DURACION);
    pintar(p);
    if (p >= 1) { terminar(true); return; }
    raf = requestAnimationFrame(tick);
  };
  const empezar = () => {
    if (activo || btn.disabled) return;
    activo = true;
    btn.classList.add("is-holding");
    inicio = performance.now();
    raf = requestAnimationFrame(tick);
  };
  function terminar(completo) {
    if (!activo) return;
    activo = false;
    cancelAnimationFrame(raf);
    btn.classList.remove("is-holding");
    if (completo) {
      pintar(1);
      btn.dispatchEvent(new CustomEvent("mantenido", { bubbles: true }));
      setTimeout(() => pintar(0), 300);
    } else {
      // revertir suavemente
      const desde = parseFloat(btn.style.getPropertyValue("--progreso")) || 0;
      const t0 = performance.now();
      const back = (t) => { const p = Math.max(0, desde - (t - t0) / 250); pintar(p); if (p > 0) requestAnimationFrame(back); };
      requestAnimationFrame(back);
    }
  }

  btn.addEventListener("pointerdown", (e) => { if (e.button === 0) { btn.setPointerCapture(e.pointerId); empezar(); } });
  btn.addEventListener("pointerup", () => terminar(false));
  btn.addEventListener("pointercancel", () => terminar(false));
  btn.addEventListener("keydown", (e) => {
    if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); empezar(); }
  });
  btn.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") terminar(false); });
  btn.addEventListener("blur", () => terminar(false));
  btn.addEventListener("click", (e) => e.preventDefault()); // un clic corto no hace nada
}

export function activarMantener(ctx = document) {
  ctx.querySelectorAll(".btn-mantener").forEach(preparar);
}
