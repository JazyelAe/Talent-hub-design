// Postulaciones recibidas (empresa): filtrar, revisar, aceptar, agendar entrevista, rechazar, reabrir.
import { $, html, raw, icon, fechaRelativa, fechaHora, HOY_DEMO, iniciales, tinte } from "../utils.js";
import { api } from "../api.js";
import { USUARIO_DEMO } from "../store.js";
import { exigirRol } from "../session.js";
import { cargarCon, estadoVacio } from "../components/estados.js";
import { activarMantener } from "../components/mantener.js";
import { abrirDialogo, confirmar } from "../components/dialog.js";
import { validarFormulario } from "../components/form.js";
import { toast } from "../components/toast.js";

const EMPRESA = USUARIO_DEMO.empresa.empresa_id;
const lista = $("#lista");
const params = new URLSearchParams(location.search);
let todos = [], filtro = params.get("estado") || "", vacante = params.get("vacante") || "";

const ESTADO = { sin_abrir: ["Sin abrir", "curso"], en_revision: ["En revisión", "curso"], aceptada: ["Aceptada", "bien"], rechazada: ["Rechazada", "mal"] };
const FILTROS = [["", "Todas"], ["sin_abrir", "Sin abrir"], ["en_revision", "En revisión"], ["aceptada", "Aceptadas"], ["rechazada", "Rechazadas"]];

function acciones(c) {
  const id = c.id;
  switch (c.estado) {
    case "sin_abrir":
      return html`<button class="btn btn--ghost btn--sm" type="button" data-accion="revisar" data-id="${id}">${icon("eye")}Marcar en revisión</button>`;
    case "en_revision":
      return html`<button class="btn btn--ghost btn--ok btn--sm" type="button" data-accion="aceptar" data-id="${id}">${icon("check")}Aceptar</button>
        <button class="btn btn--ghost btn--danger-text btn--sm btn-mantener" type="button" data-accion="rechazar" data-id="${id}" aria-label="Rechazar a ${c.nombre}">${icon("x")}Rechazar</button>`;
    case "aceptada":
      return html`<button class="btn btn--ghost btn--sm" type="button" data-accion="entrevista" data-id="${id}">${icon("calendar-blank")}${c.entrevista ? "Cambiar entrevista" : "Agendar entrevista"}</button>
        <button class="btn btn--ghost btn--danger-text btn--sm btn-mantener" type="button" data-accion="rechazar" data-id="${id}" aria-label="Rechazar a ${c.nombre}">${icon("x")}Rechazar</button>`;
    case "rechazada":
      return html`<button class="btn btn--ghost btn--sm" type="button" data-accion="reabrir" data-id="${id}">${icon("arrow-counter-clockwise")}Reabrir</button>`;
  }
}

function fila(c) {
  const [txt, tono] = ESTADO[c.estado];
  const ini = iniciales(c.nombre);
  return html`
    <article class="fila" id="cand-${c.id}">
      <div class="fila__top">
        <span class="iniciales iniciales--${tinte(c.nombre)}" aria-hidden="true">${ini}</span>
        <div class="fila__id">
          <h2 class="fila__titulo">${c.nombre}</h2>
          <p class="fila__meta"><span>${c.profesion}</span><span>${icon("briefcase")}${c.vacante?.titulo ?? "Vacante"}</span><span>Recibida ${fechaRelativa(c.fecha)}</span></p>
        </div>
        <span class="tag tag--${tono}">${txt}</span>
      </div>
      ${c.mensaje ? raw(html`<p class="mensaje-cand">«${c.mensaje}»</p>`) : ""}
      ${c.estado === "aceptada" ? raw(html`<p class="contacto" aria-label="Datos de contacto">
        <span>${icon("envelope-simple")}${c.correo || "Correo no disponible"}</span>
        <span>${icon("phone")}${c.telefono || "Teléfono no proporcionado"}</span></p>`) : ""}
      ${c.entrevista && c.estado === "aceptada" ? raw(html`<p class="entrevista">${icon("calendar-blank")}Entrevista: ${fechaHora(c.entrevista)}</p>`) : ""}
      <div class="fila__acciones">
        <button class="btn btn--text" type="button" data-accion="cv" data-id="${c.id}">${icon("file-pdf")}${c.cv}</button>
        <span style="flex:1"></span>
        ${raw(acciones(c))}
      </div>
    </article>`;
}

function pintar(foco) {
  const propios = todos.filter((c) => !vacante || c.vacante_id === Number(vacante));
  const cuenta = (k) => propios.filter((c) => c.estado === k).length;
  $("#filtro").innerHTML = FILTROS.map(([k, t]) => html`
    <button class="chip" type="button" data-filtro="${k}" aria-pressed="${filtro === k}">${t}<span class="chip__count">${k ? cuenta(k) : propios.length}</span></button>`).join("");
  const res = propios.filter((c) => !filtro || c.estado === filtro);
  if (!todos.length) {
    lista.innerHTML = estadoVacio({ icono: "tray", titulo: "Todavía no recibes postulaciones", texto: "Cuando alguien se postule a tus vacantes publicadas, aparecerá aquí." });
  } else if (!res.length) {
    lista.innerHTML = estadoVacio({ icono: "funnel", titulo: "Ninguna postulación en este estado", texto: "Prueba con otro filtro para ver el resto." });
  } else {
    lista.innerHTML = res.map(fila).join("");
  }
  activarMantener(lista);
  $("#anuncio").textContent = `${res.length} postulaciones`;
  if (foco) (document.getElementById(`cand-${foco}`)?.querySelector(".fila__acciones .btn:last-child") || lista).focus?.();
}

async function cambiar(c, cambio, mensaje) {
  await api.actualizarCandidato(c.id, cambio);
  Object.assign(c, cambio);
  pintar(c.id);
  toast(mensaje, { texto: "La persona verá el cambio en su panel." });
}

function agendar(c) {
  const manana = new Date(HOY_DEMO.getTime() + 86400000).toISOString().slice(0, 10);
  const { dlg, cerrar } = abrirDialogo({
    titulo: `Entrevista con ${c.nombre}`,
    contenido: html`<form class="form" id="form-ent" novalidate>
      <div class="form__row form__row--2">
        <div class="field"><label class="field__label" for="e-fecha">Fecha</label><input class="input" id="e-fecha" type="date" required min="${manana}" value="${c.entrevista?.slice(0, 10) || ""}"></div>
        <div class="field"><label class="field__label" for="e-hora">Hora</label><input class="input" id="e-hora" type="time" required min="08:00" max="20:00" step="900" value="${c.entrevista?.slice(11, 16) || "11:00"}"></div>
      </div>
      <p class="field__help">Horario de 8:00 a 20:00. La persona recibe el aviso al guardar.</p></form>`,
    acciones: html`<button class="btn btn--ghost" type="button" data-cerrar>Cancelar</button>
      <button class="btn btn--primary" type="submit" form="form-ent">${icon("paper-plane-tilt")}Agendar y avisar</button>`,
  });
  validarFormulario(dlg.querySelector("#form-ent"), async () => {
    const valor = `${dlg.querySelector("#e-fecha").value}T${dlg.querySelector("#e-hora").value}`;
    cerrar("ok");
    await cambiar(c, { entrevista: valor }, c.entrevista ? "Entrevista actualizada" : "Entrevista agendada");
  });
}

lista.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-accion]");
  if (!b || b.classList.contains("btn-mantener")) return;
  const c = todos.find((x) => String(x.id) === b.dataset.id);
  switch (b.dataset.accion) {
    case "revisar": return cambiar(c, { estado: "en_revision" }, "Marcada en revisión");
    case "aceptar": return cambiar(c, { estado: "aceptada" }, "Candidatura aceptada");
    case "entrevista": return agendar(c);
    case "reabrir": {
      const ok = await confirmar({
        titulo: c.entrevista ? "¿Reabrir y cancelar la entrevista?" : `¿Reabrir la postulación de ${c.nombre}?`,
        texto: "Vuelve a «En revisión» y la persona verá que su proceso sigue abierto.",
        aceptar: "Reabrir", iconoAceptar: "arrow-counter-clockwise",
      });
      if (ok) return cambiar(c, { estado: "en_revision", entrevista: null }, "Postulación reabierta");
      return;
    }
    case "cv":
      return abrirDialogo({
        titulo: c.cv,
        contenido: html`<p class="aviso">${icon("info")}<span><strong>Demo de portafolio.</strong> En el producto real aquí se abre el PDF del CV. Esta réplica no guarda archivos.</span></p>`,
        acciones: html`<button class="btn btn--primary" type="button" data-cerrar>${icon("check")}Entendido</button>`,
      });
  }
});

// Rechazar: mantener presionado y luego un diálogo que nombra la consecuencia
lista.addEventListener("mantenido", async (e) => {
  const c = todos.find((x) => String(x.id) === e.target.dataset.id);
  const ok = await confirmar({
    titulo: c.entrevista ? "¿Rechazar y cancelar la entrevista?" : `¿Rechazar a ${c.nombre}?`,
    texto: `Se le avisa de inmediato que no continúa en «${c.vacante?.titulo}».${c.entrevista ? " La entrevista agendada se cancela." : ""} Puedes reabrirla después.`,
    aceptar: "Rechazar", iconoAceptar: "x", peligro: true,
  });
  if (ok) cambiar(c, { estado: "rechazada", entrevista: null }, "Candidatura rechazada");
});

$("#filtro").addEventListener("click", (e) => {
  const b = e.target.closest("[data-filtro]");
  if (!b) return;
  filtro = b.dataset.filtro;
  sincronizarURL();
  pintar();
  $(`[data-filtro="${filtro}"]`).focus();
});
$("#f-vacante").addEventListener("change", (e) => { vacante = e.target.value; sincronizarURL(); pintar(); });

function sincronizarURL() {
  const u = new URL(location.href);
  filtro ? u.searchParams.set("estado", filtro) : u.searchParams.delete("estado");
  vacante ? u.searchParams.set("vacante", vacante) : u.searchParams.delete("vacante");
  history.replaceState(null, "", u);
}

if (exigirRol("empresa", $("#pagina"), { que: "las postulaciones" })) {
  cargarCon(lista, {
    pedir: api.candidatos,
    skeleton: '<div class="fila"><span class="sk" style="height:80px"></span></div>'.repeat(3),
    pintar: (cs) => {
      todos = cs.filter((c) => c.vacante?.empresa_id === EMPRESA).sort((a, b) => (a.estado === "sin_abrir" ? -1 : 0) - (b.estado === "sin_abrir" ? -1 : 0) || b.fecha.localeCompare(a.fecha));
      const vacs = [...new Map(todos.map((c) => [c.vacante_id, c.vacante])).values()];
      $("#f-vacante").insertAdjacentHTML("beforeend", vacs.map((v) => html`<option value="${v.id}">${v.titulo}</option>`).join(""));
      $("#f-vacante").value = vacante;
      pintar();
    },
    error: { titulo: "No pudimos cargar las postulaciones" },
  });
}
