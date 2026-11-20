// Mis vacantes (empresa): métricas, filtro por estado, pausar/reactivar y eliminar.
import { $, ROOT, html, raw, icon, rangoSalario, fechaRelativa } from "../utils.js";
import { api } from "../api.js";
import { USUARIO_DEMO } from "../store.js";
import { exigirRol } from "../session.js";
import { cargarCon, estadoVacio } from "../components/estados.js";
import { animarContadores } from "../components/contador.js";
import { activarMantener } from "../components/mantener.js";
import { confirmar } from "../components/dialog.js";
import { toast } from "../components/toast.js";
import { tagModalidad } from "../components/vacante-card.js";

const EMPRESA = USUARIO_DEMO.empresa.empresa_id;
const lista = $("#lista");
const ESTADO = { publicada: ["Publicada", "bien"], en_revision: ["En revisión", "curso"], pausada: ["Pausada", "neutro"] };
let vacantes = [], candidatos = [], filtro = "";

const recibidas = (id) => candidatos.filter((c) => c.vacante_id === id);

function fila(v) {
  const [txt, tono] = ESTADO[v.estado];
  const n = recibidas(v.id).length, sinAbrir = recibidas(v.id).filter((c) => c.estado === "sin_abrir").length;
  return html`
    <article class="fila fila--linea">
      <div class="fila__top">
        <div class="fila__id">
          <h2 class="fila__titulo">${v.estado === "publicada" ? raw(html`<a href="${ROOT}vacante.html?id=${v.id}">${v.titulo}</a>`) : v.titulo}</h2>
          <p class="fila__meta">
            <span class="tabular">${rangoSalario(v.salario_min, v.salario_max)}</span><span>${icon("map-pin")}${v.ciudad}</span>
            <span>Publicada ${fechaRelativa(v.fecha_publicacion)}</span>
          </p>
          <p class="cluster" style="margin-top:8px"><span class="tag tag--${tono}">${txt}</span>${tagModalidad(v.modalidad)}
            ${v.estado === "en_revision" ? raw(html`<span style="font-size:var(--fs-caption);color:var(--muted)">Un validador la revisa antes de publicarla.</span>`) : ""}</p>
        </div>
      </div>
      <div class="fila__acciones">
        <a class="btn btn--ghost btn--sm" href="postulaciones.html?vacante=${v.id}">${icon("tray")}${n} ${n === 1 ? "postulación" : "postulaciones"}${sinAbrir ? raw(html`<span class="chip__count" title="Sin abrir">${sinAbrir} nuevas</span>`) : ""}</a>
        ${v.estado === "publicada" ? raw(html`<button class="btn btn--ghost btn--sm" type="button" data-pausar="${v.id}">${icon("pause")}Pausar</button>`) : ""}
        ${v.estado === "pausada" ? raw(html`<button class="btn btn--ghost btn--sm" type="button" data-reactivar="${v.id}">${icon("play")}Reactivar</button>`) : ""}
        <button class="btn btn--ghost btn--danger-text btn--sm btn-mantener" type="button" data-eliminar="${v.id}" aria-label="Eliminar ${v.titulo}">${icon("trash")}Eliminar</button>
      </div>
    </article>`;
}

function pintar() {
  const n = (e) => vacantes.filter((v) => v.estado === e).length;
  $("#metricas").innerHTML = [
    ["Publicadas", n("publicada"), "metrica--bien"], ["En revisión", n("en_revision"), ""],
    ["Postulaciones recibidas", candidatos.filter((c) => c.vacante?.empresa_id === EMPRESA).length, ""],
    ["Sin abrir", candidatos.filter((c) => c.vacante?.empresa_id === EMPRESA && c.estado === "sin_abrir").length, ""],
  ].map(([t, v, c]) => html`<div class="metrica ${c}"><span class="metrica__n tabular" data-contar="${v}">${v}</span><span class="metrica__t">${t}</span></div>`).join("");
  animarContadores($("#metricas"));

  $("#filtro").innerHTML = [["", "Todas"], ["publicada", "Publicadas"], ["en_revision", "En revisión"], ["pausada", "Pausadas"]]
    .map(([k, t]) => html`<button class="chip" type="button" data-filtro="${k}" aria-pressed="${filtro === k}">${t}<span class="chip__count">${k ? n(k) : vacantes.length}</span></button>`).join("");

  const res = vacantes.filter((v) => !filtro || v.estado === filtro);
  lista.innerHTML = !vacantes.length
    ? estadoVacio({ icono: "briefcase", titulo: "Todavía no has publicado vacantes", texto: "Publica la primera: es gratis y un validador la revisa antes de que salga.",
        accion: html`<a class="btn btn--primary" href="publicar.html">${icon("plus")}Publicar vacante</a>` })
    : !res.length
      ? estadoVacio({ icono: "funnel", titulo: "Ninguna vacante en este estado", texto: "Prueba con otro filtro." })
      : res.map(fila).join("");
  activarMantener(lista);
}

async function cambiar(id, estado, mensaje) {
  await api.cambiarEstadoVacante(id, estado);
  vacantes = vacantes.map((v) => (v.id === id ? { ...v, estado } : v));
  pintar();
  toast(mensaje);
}

$("#filtro").addEventListener("click", (e) => {
  const b = e.target.closest("[data-filtro]");
  if (!b) return;
  filtro = b.dataset.filtro;
  pintar();
  $(`[data-filtro="${filtro}"]`).focus();
});
lista.addEventListener("click", (e) => {
  const p = e.target.closest("[data-pausar]"), r = e.target.closest("[data-reactivar]");
  if (p) cambiar(Number(p.dataset.pausar), "pausada", "Vacante pausada: ya no aparece en el listado");
  if (r) cambiar(Number(r.dataset.reactivar), "publicada", "Vacante reactivada");
});
lista.addEventListener("mantenido", async (e) => {
  const id = Number(e.target.dataset.eliminar);
  const v = vacantes.find((x) => x.id === id);
  const n = recibidas(id).length;
  const ok = await confirmar({
    titulo: `¿Eliminar «${v.titulo}»?`,
    texto: n
      ? `Se quitará del listado y ${n === 1 ? "la persona que se postuló verá" : `las ${n} personas que se postularon verán`} que la vacante se cerró. No se puede deshacer.`
      : "Se quitará del listado. No se puede deshacer.",
    aceptar: "Eliminar vacante", iconoAceptar: "trash", peligro: true,
  });
  if (!ok) return;
  await api.cambiarEstadoVacante(id, "eliminada");
  vacantes = vacantes.filter((x) => x.id !== id);
  pintar();
  toast("Vacante eliminada");
});

if (exigirRol("empresa", $("#pagina"), { que: "tus vacantes" })) {
  cargarCon(lista, {
    pedir: async () => {
      const [vs, cs] = await Promise.all([api.vacantesEmpresa(EMPRESA), api.candidatos()]);
      return { vs, cs };
    },
    skeleton: '<div class="fila"><span class="sk" style="height:64px"></span></div>'.repeat(3),
    pintar: ({ vs, cs }) => {
      const orden = { en_revision: 0, publicada: 1, pausada: 2 };
      vacantes = vs.sort((a, b) => orden[a.estado] - orden[b.estado] || b.fecha_publicacion.localeCompare(a.fecha_publicacion));
      candidatos = cs;
      pintar();
    },
    error: { titulo: "No pudimos cargar tus vacantes" },
  });
}
