// Mis postulaciones (candidato): métricas, filtro por estado, ProcessTrack e historial.
import { $, ROOT, html, raw, icon, fechaLarga, fechaRelativa, fechaHora, iniciales, tinte } from "../utils.js";
import { api } from "../api.js";
import { exigirRol } from "../session.js";
import { cargarCon, estadoVacio } from "../components/estados.js";
import { track, ESTADOS_POST } from "../components/process.js";
import { animarContadores } from "../components/contador.js";

const lista = $("#lista");
let todas = [];
let filtro = new URLSearchParams(location.search).get("estado") || "";

const FILTROS = [["", "Todas"], ["enviada", "Enviadas"], ["en_revision", "En revisión"], ["aceptada", "Aceptadas"], ["rechazada", "Rechazadas"]];
const EVENTO = {
  enviada: ["Postulación enviada", ""],
  en_revision: ["La empresa la está revisando", ""],
  entrevista: ["Entrevista agendada", ""],
  aceptada: ["Aceptada: la empresa ya puede ver tu contacto", "es-bien"],
  rechazada: ["La empresa decidió no continuar", "es-mal"],
};

function fila(p) {
  const v = p.vacante, emp = v.empresa?.nombre ?? "Empresa";
  const e = ESTADOS_POST[p.estado];
  const etiquetas = ["Enviada", "En revisión", p.estado === "rechazada" ? "No continuó" : "Aceptada"];
  const eventos = [...p.eventos].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const entrevista = eventos.find((x) => x.tipo === "entrevista" && x.fecha_entrevista);
  return html`
    <article class="fila">
      <div class="fila__top">
        <span class="iniciales iniciales--${tinte(emp)}" aria-hidden="true">${iniciales(emp)}</span>
        <div class="fila__id">
          <h2 class="fila__titulo"><a href="${ROOT}vacante.html?id=${v.id}">${v.titulo}</a></h2>
          <p class="fila__meta"><span>${emp}</span><span>${icon("map-pin")}${v.ciudad}</span><span>Enviada ${fechaRelativa(p.fecha)}</span></p>
        </div>
        <span class="tag tag--${e.tono === "neutro" ? "neutro" : e.tono}">${e.texto}</span>
      </div>
      <div class="seguimiento">
        ${track(p.estado, { grande: true })}
        <p class="seguimiento__pasos" aria-hidden="true">
          ${etiquetas.map((t, i) => raw(html`<span class="${i + 1 === e.paso ? `es-actual ${e.tono}` : ""}">${t}</span>`))}
        </p>
      </div>
      ${entrevista && p.estado !== "rechazada" ? raw(html`<p class="entrevista">${icon("calendar-blank")}Entrevista: ${fechaHora(entrevista.fecha_entrevista)}</p>`) : ""}
      <details class="historial">
        <summary>Ver historial (${eventos.length}) ${icon("caret-down")}</summary>
        <ol class="linea">
          ${eventos.map((ev, i) => {
            const [txt, cls] = EVENTO[ev.tipo] || [ev.tipo, ""];
            return raw(html`<li class="${cls} ${i === eventos.length - 1 ? "es-ultimo" : ""}"><span><strong>${txt}</strong><time datetime="${ev.fecha}">${fechaLarga(ev.fecha)}</time></span></li>`);
          })}
        </ol>
      </details>
    </article>`;
}

function pintar() {
  const cuenta = (k) => todas.filter((p) => p.estado === k).length;
  $("#filtro").innerHTML = FILTROS.map(([k, t]) => html`
    <button class="chip" type="button" data-filtro="${k}" aria-pressed="${filtro === k}">${t}<span class="chip__count">${k ? cuenta(k) : todas.length}</span></button>`).join("");
  const res = todas.filter((p) => !filtro || p.estado === filtro);
  if (!todas.length) {
    lista.innerHTML = estadoVacio({
      icono: "paper-plane-tilt",
      titulo: "Todavía no te has postulado",
      texto: "Cuando te postules a una vacante, aquí verás en qué punto va tu proceso.",
      accion: html`<a class="btn btn--primary" href="${ROOT}vacantes.html">${icon("magnifying-glass")}Buscar vacantes</a>`,
    });
  } else if (!res.length) {
    lista.innerHTML = estadoVacio({ icono: "funnel", titulo: "Ninguna postulación en este estado", texto: "Prueba con otro filtro para ver el resto." });
  } else {
    lista.innerHTML = res.map(fila).join("");
  }
  $("#anuncio").textContent = `${res.length} postulaciones`;
}

$("#filtro").addEventListener("click", (e) => {
  const b = e.target.closest("[data-filtro]");
  if (!b) return;
  filtro = b.dataset.filtro;
  const u = new URL(location.href);
  filtro ? u.searchParams.set("estado", filtro) : u.searchParams.delete("estado");
  history.replaceState(null, "", u);
  pintar();
  $(`[data-filtro="${filtro}"]`).focus();
});

if (exigirRol("candidato", $("#pagina"), { que: "tus postulaciones" })) {
  cargarCon(lista, {
    pedir: api.postulaciones,
    skeleton: '<div class="fila"><span class="sk" style="height:90px"></span></div>'.repeat(3),
    pintar: (ps) => {
      todas = ps.sort((a, b) => b.fecha.localeCompare(a.fecha));
      const n = (k) => todas.filter((p) => p.estado === k).length;
      $("#metricas").innerHTML = [
        ["Postulaciones", todas.length, ""], ["En revisión", n("en_revision"), ""],
        ["Aceptadas", n("aceptada"), "metrica--bien"], ["Enviadas esta semana", todas.filter((p) => fechaRelativa(p.fecha).match(/hoy|ayer|hace [1-6] días/)).length, ""],
      ].map(([t, v, c]) => html`<div class="metrica ${c}"><span class="metrica__n tabular" data-contar="${v}">${v}</span><span class="metrica__t">${t}</span></div>`).join("");
      animarContadores($("#metricas"));
      pintar();
    },
    vacio: undefined,
    error: { titulo: "No pudimos cargar tus postulaciones" },
  }).then((r) => { if (r && !r.length) pintar(); });
}
