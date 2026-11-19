// Estados de las listas: carga (skeleton + aviso de espera larga), vacío y error con reintentar.
// "Cada espera dice algo, y una espera larga dice cuánto lleva" (DESIGN.md).
import { html, raw, icon } from "../utils.js";

export function skeletonCards(n = 4) {
  const una = html`
    <div class="vcard sk-card" aria-hidden="true">
      <div class="vcard__head">
        <span class="sk sk--circle" style="width:44px;height:44px"></span>
        <div class="vcard__id"><span class="sk" style="width:60%;height:18px"></span><span class="sk" style="width:35%;height:14px;margin-top:8px"></span></div>
      </div>
      <span class="sk" style="width:45%;height:22px"></span>
      <span class="sk" style="width:100%;height:14px"></span><span class="sk" style="width:80%;height:14px"></span>
      <div class="vcard__foot"><span class="sk sk--pill" style="width:180px;height:28px"></span><span class="sk" style="width:120px;height:14px"></span></div>
    </div>`;
  return una.repeat(n);
}

export function estadoVacio({ icono = "magnifying-glass", titulo, texto, accion = "" }) {
  return html`
    <div class="estado" role="status">
      <span class="estado__icono">${icon(icono)}</span>
      <h2 class="estado__titulo">${titulo}</h2>
      <p class="estado__texto">${texto}</p>
      ${raw(accion)}
    </div>`;
}

export function estadoError({ titulo = "No pudimos cargar la información", texto }) {
  return html`
    <div class="estado estado--error" role="alert">
      <span class="estado__icono">${icon("warning-circle")}</span>
      <h2 class="estado__titulo">${titulo}</h2>
      <p class="estado__texto">${texto || "La conexión con el servidor falló. Puede ser temporal."}</p>
      <button class="btn btn--ghost" type="button" data-reintentar>${icon("arrow-clockwise")}Reintentar</button>
    </div>`;
}

/**
 * Carga datos en un contenedor con todos sus estados.
 *  - Muestra el skeleton mientras espera; a los 4 s, el aviso "Despertando el servidor · N s";
 *    al minuto, ofrece "Reintentar".
 *  - Si falla: estado de error con "Reintentar".
 *  - Si llega vacío y hay `vacio`: estado vacío.
 */
export async function cargarCon(contenedor, { pedir, pintar, skeleton = skeletonCards(), vacio, error }) {
  contenedor.setAttribute("aria-busy", "true");
  contenedor.innerHTML = skeleton;
  const aviso = document.createElement("div");
  let segundos = 0, intervalo;
  const timer = setTimeout(() => {
    segundos = 4;
    aviso.className = "aviso-lento";
    aviso.setAttribute("role", "status");
    const pintarAviso = () => {
      aviso.innerHTML = html`
        <span class="aviso-lento__anillo" aria-hidden="true"></span>
        <div>
          <p class="aviso-lento__titulo">Despertando el servidor<span aria-hidden="true"> · ${segundos} s</span></p>
          <p>El servidor se duerme cuando nadie lo usa y la primera carga puede tardar hasta un minuto. No recargues la página: en cuanto responda, esto se llena solo.</p>
          ${segundos >= 60 ? raw(html`<button class="btn btn--ghost btn--sm" type="button" data-reintentar>${icon("arrow-clockwise")}Reintentar</button>`) : ""}
        </div>`;
    };
    pintarAviso();
    contenedor.before(aviso);
    // los segundos están ocultos a lectores de pantalla: el estado se anuncia una vez
    intervalo = setInterval(() => { segundos++; if (segundos <= 60 || segundos % 10 === 0) pintarAviso(); }, 1000);
  }, 4000);

  const limpiar = () => { clearTimeout(timer); clearInterval(intervalo); aviso.remove(); contenedor.removeAttribute("aria-busy"); };
  const reintentar = (e) => {
    if (!e.target.closest("[data-reintentar]")) return;
    document.removeEventListener("click", reintentar);
    limpiar();
    cargarCon(contenedor, { pedir, pintar, skeleton, vacio, error });
  };
  document.addEventListener("click", reintentar);

  try {
    const datos = await pedir();
    limpiar();
    document.removeEventListener("click", reintentar);
    if (vacio && (!datos || (Array.isArray(datos) && !datos.length))) contenedor.innerHTML = estadoVacio(vacio);
    else pintar(datos);
    return datos;
  } catch (e) {
    limpiar();
    contenedor.innerHTML = estadoError({ ...(error || {}), texto: e.message });
    return null;
  }
}
