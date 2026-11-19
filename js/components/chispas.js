// Chispas: ocho trazos cortos salen del punto de clic y se apagan en 0.42 s.
// Solo en los botones .btn--destacado (los dos momentos de conversión).
// Con teclado salen del centro del botón. Se desactiva con prefers-reduced-motion.
import { prefersReducedMotion } from "../utils.js";

let canvas, ctx, chispas = [], corriendo = false;

function asegurarCanvas() {
  if (canvas) return;
  canvas = document.createElement("canvas");
  canvas.className = "chispas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.append(canvas);
  ctx = canvas.getContext("2d");
  const ajustar = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  ajustar();
  addEventListener("resize", ajustar);
}

function dibujar(t) {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  chispas = chispas.filter((c) => t - c.inicio < 420);
  for (const c of chispas) {
    const p = (t - c.inicio) / 420;               // progreso 0 → 1
    const e = 1 - (1 - p) ** 3;                    // desaceleración
    const r1 = 6 + e * 18, r2 = r1 + 8 * (1 - p);
    ctx.strokeStyle = `rgba(157, 176, 255, ${1 - p})`;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(c.x + Math.cos(c.a) * r1, c.y + Math.sin(c.a) * r1);
    ctx.lineTo(c.x + Math.cos(c.a) * r2, c.y + Math.sin(c.a) * r2);
    ctx.stroke();
  }
  if (chispas.length) requestAnimationFrame(dibujar);
  else corriendo = false;                          // el canvas solo dibuja mientras hay chispas
}

export function lanzar(x, y) {
  if (prefersReducedMotion()) return;
  asegurarCanvas();
  const inicio = performance.now();
  for (let i = 0; i < 8; i++) chispas.push({ x, y, a: (i / 8) * Math.PI * 2, inicio });
  if (!corriendo) { corriendo = true; requestAnimationFrame(dibujar); }
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn--destacado");
  if (!btn) return;
  if (e.detail === 0) {                            // activado con teclado
    const r = btn.getBoundingClientRect();
    lanzar(r.left + r.width / 2, r.top + r.height / 2);
  } else {
    lanzar(e.clientX, e.clientY);
  }
});
