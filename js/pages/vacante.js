// Detalle de vacante: membrete en la banda, paneles de vidrio y tarjeta de acción según el rol.
import { $, ROOT, html, raw, icon, formatoMXN, fechaLarga, iniciales, tinte } from "../utils.js";
import { api } from "../api.js";
import { sesion } from "../store.js";
import { tagModalidad } from "../components/vacante-card.js";
import { estadoError, estadoVacio } from "../components/estados.js";

const id = new URLSearchParams(location.search).get("id");
const principal = $("#principal");
const lateral = $("#lateral");

function pintarMembrete(v) {
  const emp = v.empresa.nombre;
  $("#miga-actual").textContent = v.titulo;
  $("#membrete").removeAttribute("aria-busy");
  $("#membrete").innerHTML = html`
    <div class="membrete__id">
      <span class="iniciales iniciales--lg iniciales--${tinte(emp)}" aria-hidden="true">${iniciales(emp)}</span>
      <div>
        <h1 class="membrete__titulo">${v.titulo}</h1>
        <p class="membrete__empresa">${emp}</p>
      </div>
    </div>
    <p class="membrete__salario"><strong>${formatoMXN(v.salario_min)} – ${formatoMXN(v.salario_max)} MXN</strong><span>al mes</span></p>`;
  document.title = `${v.titulo} · TalentHub (réplica de portafolio)`;
}

function pintarCuerpo(v) {
  principal.innerHTML = html`
    <section class="glass-panel" aria-label="Resumen">
      <ul class="resumen" role="list">
        <li>${icon("laptop")}<span class="sr-only">Modalidad:</span>${tagModalidad(v.modalidad)}</li>
        <li>${icon("map-pin")}<span class="sr-only">Ubicación:</span>${v.ciudad}</li>
        <li>${icon("calendar-blank")}<span class="sr-only">Publicada el</span><time datetime="${v.fecha_publicacion}">${fechaLarga(v.fecha_publicacion)}</time></li>
      </ul>
    </section>
    <section class="glass-panel" aria-labelledby="req-t">
      <h2 class="card__title" id="req-t">Requisitos</h2>
      <div class="bloque">
        <h3 class="bloque__titulo">${icon("code")}Tecnologías</h3>
        <ul class="cluster" role="list">${v.tecnologias.map((t) => raw(html`<li class="tech">${t}</li>`))}</ul>
      </div>
      <div class="bloque">
        <h3 class="bloque__titulo">${icon("briefcase")}Experiencia</h3>
        <p>${v.experiencia_anios ? `${v.experiencia_anios} ${v.experiencia_anios === 1 ? "año" : "años"}.` : "Sin experiencia previa requerida."}</p>
      </div>
      ${v.requisitos_extra ? raw(html`
      <div class="bloque">
        <h3 class="bloque__titulo">${icon("list")}Además</h3>
        <p>${v.requisitos_extra}</p>
      </div>`) : ""}
    </section>
    <section class="glass-panel" aria-labelledby="desc-t">
      <h2 class="card__title" id="desc-t">Descripción del puesto</h2>
      <p class="descripcion">${v.descripcion}</p>
    </section>`;
}

async function pintarLateral(v) {
  const rol = sesion.rol();
  const volver = encodeURIComponent(`vacante.html?id=${v.id}`);
  let contenido;
  if (rol === "candidato") {
    const ya = await api.yaPostulado(v.id);
    contenido = ya
      ? html`<p class="interes__titulo">Ya te postulaste</p>
             <a class="btn btn--ghost btn--block" href="${ROOT}mis-postulaciones.html">${icon("arrow-right")}Ver mis postulaciones</a>`
      : html`<p class="interes__titulo">¿Te interesa?</p>
             <button class="btn btn--primary btn--block btn--destacado" type="button" id="postularme" data-vacante="${v.id}">${icon("paper-plane-tilt")}Postularme</button>
             <p class="interes__nota">Tu perfil y tu CV van con la postulación.</p>`;
  } else if (rol === "empresa") {
    contenido = html`<p class="interes__titulo">Vista de empresa</p>
      <p class="interes__nota" style="text-align:left">Las cuentas de empresa no se postulan. Así ven tu vacante las personas candidatas.</p>
      <a class="btn btn--ghost btn--block" href="${ROOT}empresa/vacantes.html">${icon("arrow-right")}Ir a mis vacantes</a>`;
  } else {
    contenido = html`<p class="interes__titulo">¿Te interesa?</p>
      <a class="btn btn--primary btn--block" href="${ROOT}login.html?volver=${volver}">${icon("sign-in")}Iniciar sesión</a>
      <a class="btn btn--text" href="${ROOT}registro.html?volver=${volver}">Crear cuenta</a>`;
  }
  lateral.innerHTML = html`<div class="glass-panel interes">${raw(contenido)}</div>`;
  lateral.dispatchEvent(new CustomEvent("lateral:listo", { bubbles: true, detail: v }));
}

async function cargar() {
  try {
    const v = await api.vacante(id);
    if (!v || v.estado !== "publicada") {
      $("#membrete").innerHTML = html`<h1 class="membrete__titulo">Vacante no disponible</h1>`;
      $("#miga-actual").textContent = "No disponible";
      principal.innerHTML = estadoVacio({
        icono: "briefcase",
        titulo: "Esta vacante ya no está disponible",
        texto: "Puede que la empresa la haya cerrado o que el enlace esté mal escrito.",
        accion: html`<a class="btn btn--primary" href="${ROOT}vacantes.html">${icon("arrow-right")}Ver vacantes abiertas</a>`,
      });
      lateral.remove();
      document.title = "Vacante no disponible · TalentHub (réplica de portafolio)";
      return;
    }
    pintarMembrete(v);
    pintarCuerpo(v);
    await pintarLateral(v);
  } catch (e) {
    $("#membrete").innerHTML = html`<h1 class="membrete__titulo">Vacante</h1>`;
    principal.innerHTML = estadoError({ titulo: "No pudimos cargar la vacante", texto: e.message });
  }
}

principal.addEventListener("click", (e) => { if (e.target.closest("[data-reintentar]")) cargar(); });
cargar();
