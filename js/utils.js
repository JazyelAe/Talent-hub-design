// Utilidades compartidas: DOM, formato, iconos, iniciales.

/** Ruta a la raíz del sitio, declarada en <html data-root="./"> (o "../" en /empresa). */
export const ROOT = document.documentElement.dataset.root || "./";

/** Fecha "de hoy" de la demo: los datos están fechados respecto a ella,
 *  así "hace 3 días" sigue siendo cierto aunque se abra la demo meses después. */
export const HOY_DEMO = new Date("2026-11-18T12:00:00");

export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
/** Escapa texto antes de insertarlo como HTML (los datos de localStorage los escribe el usuario). */
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ESC[c]);

/** Plantilla etiquetada que escapa las interpolaciones salvo las marcadas con raw(). */
export function html(strings, ...values) {
  return strings.reduce((out, str, i) => {
    if (i === 0) return str;
    const v = values[i - 1];
    const val = Array.isArray(v) ? v.map((x) => (x?.__raw ? x.value : esc(x))).join("")
      : v?.__raw ? v.value : esc(v);
    return out + val + str;
  }, "");
}
export const raw = (value) => ({ __raw: true, value });

export function icon(name, cls = "icon") {
  return raw(`<svg class="${cls}" aria-hidden="true" focusable="false"><use href="${ROOT}assets/icons/sprite.svg#i-${name}"></use></svg>`);
}

const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
export const formatoMXN = (n) => mxn.format(n).replace("MX", "").trim();
export const rangoSalario = (min, max) => `${formatoMXN(min)} – ${formatoMXN(max)}`;

const DIA = 86400000;
export function fechaRelativa(iso) {
  const d = Math.round((HOY_DEMO - new Date(iso + (iso.length === 10 ? "T12:00:00" : ""))) / DIA);
  if (d <= 0) return "hoy";
  if (d === 1) return "ayer";
  if (d < 14) return `hace ${d} días`;
  if (d < 31) return `hace ${Math.floor(d / 7)} semanas`;
  const m = Math.floor(d / 30);
  return m === 1 ? "hace 1 mes" : `hace ${m} meses`;
}
export const fechaLarga = (iso) =>
  new Date(iso + (iso.length === 10 ? "T12:00:00" : "")).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
export const fechaHora = (iso) =>
  new Date(iso).toLocaleString("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });

export const MODALIDAD = { remoto: "Remoto", hibrido: "Híbrido", presencial: "Presencial" };

/** Iniciales de una empresa: dos letras de las dos primeras palabras. */
export function iniciales(nombre) {
  return nombre.split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}
/** Tinte determinista: la misma empresa siempre recibe el mismo tono. */
const TINTES = ["blue", "teal", "violet", "rose", "neutral"];
export function tinte(nombre) {
  let h = 0;
  for (const c of nombre) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TINTES[h % TINTES.length];
}

export function debounce(fn, ms = 250) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/** Normaliza para búsquedas: minúsculas y sin acentos ("Mérida" encuentra "merida"). */
export const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export const prefersReducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
