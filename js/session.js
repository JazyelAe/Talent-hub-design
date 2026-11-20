// Sesión simulada por rol. No hay credenciales: entrar solo guarda "candidato" o "empresa"
// en sessionStorage (se borra al cerrar la pestaña).
import { ROOT, html, raw, icon } from "./utils.js";
import { sesion } from "./store.js";

export const INICIO_ROL = { candidato: "vacantes.html", empresa: "empresa/vacantes.html" };
const NOMBRE_ROL = { candidato: "candidato", empresa: "empresa" };

/** Solo acepta destinos internos de la demo (evita redirecciones abiertas con ?volver=). */
export function destinoSeguro(volver, rol) {
  if (volver && /^[a-z0-9\-/]+\.html(\?[\w=&%.-]*)?$/i.test(volver) && !volver.startsWith("/")) return ROOT + volver;
  return ROOT + INICIO_ROL[rol];
}

export function entrarDemo(rol, volver) {
  sesion.entrar(rol);
  location.href = destinoSeguro(volver, rol);
}

/** Aviso fijo de las pantallas cerradas. */
export function avisoDemo() {
  return html`<p class="aviso aviso-demo">${icon("info")}<span><strong>Demo de portafolio.</strong>
    Este formulario no envía datos a ningún lado y no guarda contraseñas.</span></p>`;
}

/**
 * Protege una página por rol. Si la sesión demo no tiene ese rol, sustituye el contenido
 * del contenedor por el estado "Inicia sesión para ver…" del original y devuelve false.
 */
export function exigirRol(rol, contenedor, { que }) {
  const actual = sesion.rol();
  if (actual === rol) return true;
  const volver = location.pathname.split("/").slice(-(ROOT === "../" ? 2 : 1)).join("/") + location.search;
  const otro = actual && actual !== rol;
  contenedor.innerHTML = html`
    <div class="estado" role="status">
      <span class="estado__icono">${icon(otro ? "lock-simple" : "sign-in")}</span>
      <h2 class="estado__titulo">${otro ? `Este panel es solo para cuentas de ${NOMBRE_ROL[rol]}` : `Inicia sesión para ver ${que}`}</h2>
      <p class="estado__texto">${otro
        ? `Entraste como ${NOMBRE_ROL[actual]}. Puedes cambiar de cuenta demo sin escribir nada.`
        : "En esta demo no hay contraseñas: entra con una cuenta de prueba en un clic."}</p>
      <div class="cluster" style="justify-content:center;margin-top:var(--sp-3)">
        <button class="btn btn--primary" type="button" data-entrar="${rol}" data-volver="${volver}">${icon("sign-in")}Entrar como ${NOMBRE_ROL[rol]} demo</button>
        ${otro ? "" : raw(html`<a class="btn btn--ghost" href="${ROOT}login.html?volver=${encodeURIComponent(volver)}">${icon("arrow-right")}Ir a iniciar sesión</a>`)}
      </div>
    </div>`;
  return false;
}

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-entrar]");
  if (b) entrarDemo(b.dataset.entrar, b.dataset.volver);
});
