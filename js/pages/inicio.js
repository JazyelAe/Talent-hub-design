// Inicio: palabra giratoria, búsquedas rápidas, carrusel por stack, panel de ejemplo y vacante muestra.
import { $, html, raw, formatoMXN, norm, prefersReducedMotion, MODALIDAD } from "../utils.js";
import { api } from "../api.js";
import { vacanteCard } from "../components/vacante-card.js";
import { estadoPostulacion } from "../components/process.js";

const vacantes = await api.vacantes().catch(() => []);

// ── Palabra giratoria: solo nombra stacks que de verdad tienen vacantes ──────────
const CURADOS = ["Python", "React", "TypeScript", "Java", "Go", "SQL", "Kotlin", "Docker"];
const presentes = CURADOS.filter((t) => vacantes.some((v) => v.tecnologias.includes(t) || norm(v.titulo).includes(norm(t))));
const palabras = ["TI", ...presentes].slice(0, 9);
const giro = $(".giro");
if (palabras.length > 1 && !prefersReducedMotion()) {
  let i = 0, timer;
  const siguiente = () => {
    const actual = giro.querySelector(".giro__palabra:not(.sale)");
    i = (i + 1) % palabras.length;
    const nueva = document.createElement("span");
    nueva.className = "giro__palabra entra";
    nueva.textContent = palabras[i];
    actual.classList.add("sale");
    actual.addEventListener("animationend", () => actual.remove(), { once: true });
    giro.append(nueva);
  };
  const iniciar = () => { clearInterval(timer); timer = setInterval(siguiente, 2800); };
  iniciar();
  document.addEventListener("visibilitychange", () => (document.hidden ? clearInterval(timer) : iniciar()));
}

// ── Agregados para búsquedas rápidas y carrusel ──────────────────────────────────
function agrupar(clave) {
  const m = new Map();
  for (const v of vacantes) for (const k of [].concat(clave(v))) {
    const g = m.get(k) || { n: 0, min: Infinity, max: 0 };
    g.n++; g.min = Math.min(g.min, v.salario_min); g.max = Math.max(g.max, v.salario_max);
    m.set(k, g);
  }
  return [...m].sort((a, b) => b[1].n - a[1].n);
}
const porTech = agrupar((v) => v.tecnologias);
const porCiudad = agrupar((v) => v.ciudad.split(",")[0]);
const porModalidad = agrupar((v) => v.modalidad);

const rapidas = [
  ["Remoto", "vacantes.html?modalidad=remoto"],
  ...porTech.slice(0, 2).map(([t]) => [t, `vacantes.html?q=${encodeURIComponent(t)}`]),
  ...porCiudad.slice(0, 2).map(([c]) => [c, `vacantes.html?lugar=${encodeURIComponent(c)}`]),
  ...porTech.slice(2, 3).map(([t]) => [t, `vacantes.html?q=${encodeURIComponent(t)}`]),
];
$("#rapidas").innerHTML = rapidas.map(([t, h]) => html`<li><a href="${h}">${t}</a></li>`).join("");

const PALETAS = [
  ["#ff3d6e", "#ff6fae", "#8b3dff"], ["#2dd4bf", "#3355ff", "#0ea5e9"], ["#3355ff", "#9db0ff", "#7c3aed"],
  ["#f97316", "#f43f5e", "#a855f7"], ["#10b981", "#22d3ee", "#3355ff"], ["#a78bfa", "#f472b6", "#3355ff"],
];
const tarjetas = [
  ...porTech.slice(0, 6).map(([t, g]) => ({ tipo: "Stack", nombre: t, g, href: `vacantes.html?q=${encodeURIComponent(t)}`, rango: true })),
  ...porCiudad.slice(0, 3).map(([c, g]) => ({ tipo: "Ciudad", nombre: c, g, href: `vacantes.html?lugar=${encodeURIComponent(c)}` })),
  ...porModalidad.map(([m, g]) => ({ tipo: "Modalidad", nombre: MODALIDAD[m], g, href: `vacantes.html?modalidad=${m}` })),
];

const pista = $("#carrusel-pista");
if (tarjetas.length) {
  pista.innerHTML = tarjetas.map((t, i) => {
    const [c1, c2, c3] = PALETAS[i % PALETAS.length];
    const dato = t.rango ? `${formatoMXN(t.g.min)} – ${formatoMXN(t.g.max)} · ${t.g.n} vacantes` : `${t.g.n} vacantes`;
    return html`
      <article class="stack-card">
        <div class="stack-card__arte" style="--c1:${c1};--c2:${c2};--c3:${c3}" aria-hidden="true"></div>
        <div>
          <p class="stack-card__tipo">${t.tipo}</p>
          <h3 class="stack-card__nombre"><a href="${t.href}">${t.nombre}</a></h3>
          <p class="stack-card__dato">${dato}</p>
        </div>
      </article>`;
  }).join("");
} else {
  $("#carrusel").hidden = true;
}

// La tarjeta más cercana al centro es la activa (las demás se ven en gris)
const cards = [...pista.querySelectorAll(".stack-card")];
function marcarActiva() {
  const centro = pista.getBoundingClientRect().left + pista.clientWidth / 2;
  let mejor = null, dist = Infinity;
  for (const c of cards) {
    const r = c.getBoundingClientRect();
    const d = Math.abs(r.left + r.width / 2 - centro);
    if (d < dist) { dist = d; mejor = c; }
  }
  cards.forEach((c) => c.classList.toggle("is-activa", c === mejor));
}
let raf;
pista.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(marcarActiva); }, { passive: true });
marcarActiva();
const mover = (dir) => {
  const paso = cards[0]?.getBoundingClientRect().width + 16;
  pista.scrollBy({ left: dir * paso, behavior: prefersReducedMotion() ? "auto" : "smooth" });
};
document.querySelectorAll(".carrusel__ctrl [data-dir]").forEach((b) => b.addEventListener("click", () => mover(Number(b.dataset.dir))));
pista.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); mover(e.key === "ArrowRight" ? 1 : -1); }
});
// Clic en una tarjeta lateral: primero la centra
pista.addEventListener("click", (e) => {
  const card = e.target.closest(".stack-card");
  if (card && !card.classList.contains("is-activa")) {
    e.preventDefault();
    card.scrollIntoView({ inline: "center", block: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }
});

// ── Panel de ejemplo "Mis postulaciones" (marcado como ejemplo) ──────────────────
const ejemplo = [["Desarrollador Backend", "en_revision"], ["Frontend React", "aceptada"], ["Analista de Datos", "enviada"]];
$("#ejemplo-post").innerHTML = ejemplo.map(([t, e]) => html`<li><span>${t}</span>${estadoPostulacion(e)}</li>`).join("");

// ── Vacante publicada de muestra ────────────────────────────────────────────────
const muestra = vacantes.find((v) => v.empresa_id === 1) || vacantes[0];
$("#vacante-muestra").innerHTML = muestra ? vacanteCard(muestra) : "";
void raw;
