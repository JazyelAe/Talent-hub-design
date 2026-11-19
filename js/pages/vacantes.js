// Listado de vacantes: búsqueda en vivo y filtros combinables sincronizados con la URL.
import { $, $$, html, raw, icon, formatoMXN, norm, debounce } from "../utils.js";
import { api } from "../api.js";
import { vacanteCard } from "../components/vacante-card.js";
import { cargarCon, estadoVacio } from "../components/estados.js";

const POR_PAGINA = 12;
const form = $("#filtros");
const lista = $("#lista");
const contador = $("#contador");
const campos = { q: $("#f-q"), lugar: $("#f-lugar"), tec: $("#f-tec"), nivel: $("#f-nivel"), smin: $("#f-smin"), smax: $("#f-smax") };

let todas = [];
let SAL_MIN = 0, SAL_MAX = 100000;

// ── Estado ↔ URL ─────────────────────────────────────────────────────────────
function leerURL() {
  const p = new URLSearchParams(location.search);
  return {
    q: p.get("q") || "", lugar: p.get("lugar") || "", modalidad: p.get("modalidad") || "",
    tec: p.get("tec") || "", nivel: p.get("nivel") || "",
    smin: Number(p.get("smin")) || 0, smax: Number(p.get("smax")) || 0,
    pagina: Math.max(1, Number(p.get("pagina")) || 1),
  };
}
let estado = leerURL();

function escribirURL({ reemplazar = true } = {}) {
  const p = new URLSearchParams();
  for (const k of ["q", "lugar", "modalidad", "tec", "nivel"]) if (estado[k]) p.set(k, estado[k]);
  if (estado.smin > SAL_MIN) p.set("smin", estado.smin);
  if (estado.smax && estado.smax < SAL_MAX) p.set("smax", estado.smax);
  if (estado.pagina > 1) p.set("pagina", estado.pagina);
  const demo = new URLSearchParams(location.search).get("demo");
  if (demo) p.set("demo", demo);
  const url = `${location.pathname}${p.size ? `?${p}` : ""}`;
  history[reemplazar ? "replaceState" : "pushState"](null, "", url);
}

// ── Filtro ──────────────────────────────────────────────────────────────────
function filtrar() {
  const q = norm(estado.q.trim());
  const lugar = norm(estado.lugar.trim());
  return todas.filter((v) => {
    if (q) {
      const texto = norm([v.titulo, v.empresa?.nombre, ...v.tecnologias].join(" "));
      if (!q.split(/\s+/).every((w) => texto.includes(w))) return false;
    }
    if (lugar) {
      if (lugar === "remoto") { if (v.modalidad !== "remoto") return false; }
      else if (!norm(v.ciudad).includes(lugar)) return false;
    }
    if (estado.modalidad && v.modalidad !== estado.modalidad) return false;
    if (estado.tec && !v.tecnologias.includes(estado.tec)) return false;
    if (estado.nivel && v.nivel !== estado.nivel) return false;
    // Rango: la vacante entra si su rango se cruza con el elegido
    if (estado.smin > SAL_MIN && v.salario_max < estado.smin) return false;
    if (estado.smax && estado.smax < SAL_MAX && v.salario_min > estado.smax) return false;
    return true;
  });
}

function filtrosActivos() {
  return ["q", "lugar", "modalidad", "tec", "nivel"].filter((k) => estado[k]).length +
    (estado.smin > SAL_MIN || (estado.smax && estado.smax < SAL_MAX) ? 1 : 0);
}

// ── Pintado ─────────────────────────────────────────────────────────────────
function pintar() {
  const res = filtrar();
  const total = todas.length;
  contador.textContent = filtrosActivos()
    ? `${res.length} de ${total} vacantes`
    : `${total} vacantes abiertas`;
  const paginas = Math.max(1, Math.ceil(res.length / POR_PAGINA));
  estado.pagina = Math.min(estado.pagina, paginas);
  const desde = (estado.pagina - 1) * POR_PAGINA;
  if (!res.length) {
    lista.innerHTML = estadoVacio({
      titulo: "Ninguna vacante coincide",
      texto: "Prueba con otros términos, otra ciudad o un rango de sueldo más amplio.",
      accion: html`<button class="btn btn--ghost" type="button" data-limpiar>${icon("x")}Limpiar filtros</button>`,
    });
  } else {
    lista.innerHTML = res.slice(desde, desde + POR_PAGINA).map((v) => vacanteCard(v)).join("");
  }
  pintarPaginacion(res.length, paginas, desde);
  sincronizarControles();
}

// Paginación numerada: primera, última, la actual y sus vecinas; puntos suspensivos en medio
function numeros(actual, total) {
  const set = new Set([1, total, actual - 1, actual, actual + 1].filter((n) => n >= 1 && n <= total));
  const orden = [...set].sort((a, b) => a - b);
  const out = [];
  orden.forEach((n, i) => { if (i && n - orden[i - 1] > 1) out.push("…"); out.push(n); });
  return out;
}

function enlacePagina(n) {
  const p = new URLSearchParams(location.search);
  if (n > 1) p.set("pagina", n); else p.delete("pagina");
  return `?${p}`;
}

function pintarPaginacion(total, paginas, desde) {
  const nav = $("#paginacion");
  nav.hidden = !total;
  if (!total) return;
  const a = estado.pagina;
  const hasta = Math.min(desde + POR_PAGINA, total);
  const flecha = (n, txt, ico, rel) => n < 1 || n > paginas
    ? html`<li><span class="pag pag--flecha" aria-disabled="true">${rel === "prev" ? icon(ico) : ""}<span>${txt}</span>${rel === "next" ? icon(ico) : ""}</span></li>`
    : html`<li><a class="pag pag--flecha" href="${enlacePagina(n)}" data-pagina="${n}" rel="${rel}">${rel === "prev" ? icon(ico) : ""}<span>${txt}</span>${rel === "next" ? icon(ico) : ""}</a></li>`;
  nav.innerHTML = html`
    <p class="paginacion__resumen">Ves ${desde + 1}–${hasta} de ${total} vacantes</p>
    ${paginas > 1 ? raw(html`<ul>
      ${raw(flecha(a - 1, "Anterior", "caret-left", "prev"))}
      ${numeros(a, paginas).map((n) => raw(n === "…"
        ? `<li><span class="pag__puntos" aria-hidden="true">…</span></li>`
        : html`<li><a class="pag" href="${enlacePagina(n)}" data-pagina="${n}" aria-label="Página ${n}"${n === a ? raw(' aria-current="page"') : ""}>${n}</a></li>`))}
      ${raw(flecha(a + 1, "Siguiente", "caret-right", "next"))}
    </ul>`) : ""}`;
}

// Cambiar de página: el foco va al encabezado de resultados y la vista sube a la lista
$("#paginacion").addEventListener("click", (e) => {
  const a = e.target.closest("[data-pagina]");
  if (!a) return;
  e.preventDefault();
  estado.pagina = Number(a.dataset.pagina);
  escribirURL({ reemplazar: false });
  pintar();
  const titulo = $("#res-titulo");
  titulo.focus({ preventScroll: true });
  // sube hasta donde empieza la barra de filtros (la banda queda justo arriba)
  scrollTo({ top: $(".band").getBoundingClientRect().bottom + scrollY - 64 });
});
lista.addEventListener("click", (e) => { if (e.target.closest("[data-limpiar]")) $("#limpiar").click(); });

function sincronizarControles() {
  $$("[data-modalidad]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.modalidad === estado.modalidad)));
  const extra = ["tec", "nivel"].filter((k) => estado[k]).length + (estado.smin > SAL_MIN || (estado.smax && estado.smax < SAL_MAX) ? 1 : 0);
  $("#extra-n").hidden = !extra;
  $("#extra-n").textContent = extra;
  $("#limpiar").hidden = !filtrosActivos();
  pintarRango();
}

function pintarRango() {
  const a = Number(campos.smin.value), b = Number(campos.smax.value);
  const pct = (x) => ((x - SAL_MIN) / (SAL_MAX - SAL_MIN)) * 100;
  $("#rango-relleno").style.setProperty("--a", `${pct(a)}%`);
  $("#rango-relleno").style.setProperty("--b", `${100 - pct(b)}%`);
  const sinFiltro = a <= SAL_MIN && b >= SAL_MAX;
  $("#rango-valor").textContent = sinFiltro ? "Cualquiera" : `${formatoMXN(a)} – ${formatoMXN(b)}${b >= SAL_MAX ? "+" : ""}`;
  campos.smin.setAttribute("aria-valuetext", a <= SAL_MIN ? "Sin mínimo" : formatoMXN(a));
  campos.smax.setAttribute("aria-valuetext", b >= SAL_MAX ? "Sin máximo" : formatoMXN(b));
}

function aplicar() {
  estado.pagina = 1;
  escribirURL();
  pintar();
}

// ── Eventos ─────────────────────────────────────────────────────────────────
const enTexto = debounce(() => { estado.q = campos.q.value; estado.lugar = campos.lugar.value; aplicar(); }, 250);
campos.q.addEventListener("input", enTexto);
campos.lugar.addEventListener("input", enTexto);
form.addEventListener("submit", (e) => e.preventDefault());

$$("[data-modalidad]").forEach((b) => b.addEventListener("click", () => { estado.modalidad = b.dataset.modalidad; aplicar(); }));
campos.tec.addEventListener("change", () => { estado.tec = campos.tec.value; aplicar(); });
campos.nivel.addEventListener("change", () => { estado.nivel = campos.nivel.value; aplicar(); });

// Las manijas no se cruzan: la que se mueve empuja su límite
function enRango(e) {
  let a = Number(campos.smin.value), b = Number(campos.smax.value);
  if (a > b - 1000) {
    if (e.target === campos.smin) a = b - 1000; else b = a + 1000;
    campos.smin.value = a; campos.smax.value = b;
  }
  estado.smin = a; estado.smax = b;
  pintarRango();
  aplicarRango();
}
const aplicarRango = debounce(aplicar, 200);
campos.smin.addEventListener("input", enRango);
campos.smax.addEventListener("input", enRango);

$("#limpiar").addEventListener("click", () => {
  estado = { q: "", lugar: "", modalidad: "", tec: "", nivel: "", smin: SAL_MIN, smax: SAL_MAX, pagina: 1 };
  volcarEstado();
  aplicar();
  campos.q.focus();
});

const btnMas = $(".filtros__mas");
btnMas.addEventListener("click", () => {
  const abrir = btnMas.getAttribute("aria-expanded") !== "true";
  btnMas.setAttribute("aria-expanded", String(abrir));
  $("#filtros-extra").classList.toggle("is-abierto", abrir);
});

addEventListener("popstate", () => { estado = leerURL(); volcarEstado(); pintar(); });

function volcarEstado() {
  campos.q.value = estado.q;
  campos.lugar.value = estado.lugar;
  campos.tec.value = estado.tec;
  campos.nivel.value = estado.nivel;
  campos.smin.value = estado.smin || SAL_MIN;
  campos.smax.value = estado.smax || SAL_MAX;
}

// ── Carga inicial ───────────────────────────────────────────────────────────
volcarEstado();
await cargarCon(lista, {
  pedir: api.vacantes,
  pintar: (vs) => {
    todas = vs;
    // Límites del rango y opciones derivados de los datos (nunca se ofrece lo que no existe)
    SAL_MIN = Math.floor(Math.min(...vs.map((v) => v.salario_min)) / 1000) * 1000;
    SAL_MAX = Math.ceil(Math.max(...vs.map((v) => v.salario_max)) / 1000) * 1000;
    for (const r of [campos.smin, campos.smax]) { r.min = SAL_MIN; r.max = SAL_MAX; }
    const techs = [...new Set(vs.flatMap((v) => v.tecnologias))].sort((a, b) => a.localeCompare(b, "es"));
    campos.tec.insertAdjacentHTML("beforeend", techs.map((t) => html`<option>${t}</option>`).join(""));
    const ciudades = [...new Set(vs.map((v) => v.ciudad))].sort();
    $("#ciudades").innerHTML = ["Remoto", ...ciudades].map((c) => html`<option value="${c}"></option>`).join("");
    // Si la persona escribió mientras cargaba, se respeta lo que escribió
    estado.q = campos.q.value; estado.lugar = campos.lugar.value;
    volcarEstado();
    pintar();
  },
  vacio: { titulo: "Todavía no hay vacantes publicadas", texto: "Vuelve pronto: cada vacante pasa por revisión antes de publicarse." },
  error: { titulo: "No pudimos cargar las vacantes" },
});
if (!todas.length) contador.textContent = "Sin vacantes por ahora";
