// Inyecta la navegación y el pie de página comunes, según el rol de la sesión demo.
// Cada página declara su sección en <body data-page="vacantes"> para marcar el enlace activo.
import { ROOT, html, raw, icon, $ } from "./utils.js";
import { sesion, store, USUARIO_DEMO } from "./store.js";
import "./components/chispas.js";
import "./components/app-promo.js";
import "./session.js";

const LINKS = {
  visitante: [
    ["vacantes", "Vacantes", "vacantes.html", "briefcase"],
    ["planes", "Planes", "planes.html", "currency-dollar"],
    ["empresas", "Para empresas", "empresas.html", "buildings"],
    ["privacidad", "Privacidad", "privacidad.html", "shield-check"],
  ],
  candidato: [
    ["vacantes", "Vacantes", "vacantes.html", "briefcase"],
    ["postulaciones", "Mis postulaciones", "mis-postulaciones.html", "paper-plane-tilt"],
    ["planes", "Planes", "planes.html", "currency-dollar"],
  ],
  empresa: [
    ["empresa-vacantes", "Mis vacantes", "empresa/vacantes.html", "briefcase"],
    ["empresa-postulaciones", "Postulaciones", "empresa/postulaciones.html", "tray"],
    ["planes", "Planes", "planes.html", "currency-dollar"],
  ],
};

const MENU_CUENTA = {
  candidato: [["Mi perfil", "perfil.html", "user"], ["Mis postulaciones", "mis-postulaciones.html", "paper-plane-tilt"]],
  empresa: [["Mis vacantes", "empresa/vacantes.html", "briefcase"], ["Publicar vacante", "empresa/publicar.html", "plus"]],
};

const actual = document.body.dataset.page;
const rol = sesion.rol();
const links = LINKS[rol] || LINKS.visitante;
const aria = (id) => (id === actual ? raw(' aria-current="page"') : "");

function accionesVisitante(clase = "") {
  return html`
    <a class="nav-link ${clase}" href="${ROOT}login.html" style="height:auto">Iniciar sesión</a>
    <a class="btn btn--primary btn--sm btn--destacado" href="${ROOT}registro.html">Registrarse</a>`;
}

function menuCuenta() {
  const u = USUARIO_DEMO[rol];
  return html`
    <div class="cuenta">
      <button class="cuenta__btn" type="button" aria-expanded="false" aria-controls="menu-cuenta">
        <span class="iniciales iniciales--sm iniciales--${rol === "empresa" ? "teal" : "blue"}" aria-hidden="true">${u.nombre.split(" ").map((p) => p[0]).join("").slice(0, 2)}</span>
        <span>${u.nombre}</span>${icon("caret-down")}
      </button>
      <ul class="cuenta__menu" id="menu-cuenta" hidden>
        <li class="cuenta__head"><strong>${u.nombre}</strong><span>Cuenta demo · ${rol}</span></li>
        ${MENU_CUENTA[rol].map(([t, h, i]) => raw(html`<li><a href="${ROOT}${h}">${icon(i)}${t}</a></li>`))}
        <li><button type="button" data-salir>${icon("sign-out")}Cerrar sesión</button></li>
      </ul>
    </div>`;
}

function nav() {
  return html`
    <header class="site-nav">
      <div class="container site-nav__inner">
        <a class="brand" href="${ROOT}index.html" aria-label="TalentHub, inicio">
          <span class="brand__mark" aria-hidden="true">th</span><span class="brand__name">TalentHub</span>
        </a>
        <nav aria-label="Principal" style="display:contents">
          <ul class="nav-links" role="list">
            ${links.map(([id, t, h]) => raw(html`<li><a class="nav-link" href="${ROOT}${h}"${aria(id)}>${t}</a></li>`))}
          </ul>
        </nav>
        <div class="nav-actions">${rol ? raw(menuCuenta()) : raw(accionesVisitante())}</div>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-panel" aria-label="Abrir menú">
          ${icon("list")}
        </button>
      </div>
      <div class="barra-carga" aria-hidden="true"></div>
    </header>
    <div class="nav-panel" id="nav-panel" hidden>
      <nav aria-label="Principal móvil">
        <ul>
          ${links.map(([id, t, h, i]) => raw(html`<li><a href="${ROOT}${h}"${aria(id)}>${icon(i)}${t}</a></li>`))}
          ${rol ? MENU_CUENTA[rol].map(([t, h, i]) => raw(html`<li><a href="${ROOT}${h}">${icon(i)}${t}</a></li>`)) : ""}
        </ul>
      </nav>
      <div class="nav-panel__actions">
        ${rol
          ? raw(html`<button class="btn btn--ghost" type="button" data-salir>${icon("sign-out")}Cerrar sesión</button>`)
          : raw(html`<a class="btn btn--ghost" href="${ROOT}login.html">${icon("sign-in")}Iniciar sesión</a>
                     <a class="btn btn--primary" href="${ROOT}registro.html">${icon("user-plus")}Crear cuenta</a>`)}
      </div>
    </div>`;
}

function footer() {
  const cuenta = rol
    ? MENU_CUENTA[rol].map(([t, h]) => html`<li><a href="${ROOT}${h}">${t}</a></li>`).join("") +
      html`<li><button type="button" data-salir>Cerrar sesión</button></li>`
    : html`<li><a href="${ROOT}login.html">Iniciar sesión</a></li><li><a href="${ROOT}registro.html">Crear cuenta</a></li>`;
  return html`
    <footer class="site-footer">
      <div class="container">
        <div class="site-footer__grid">
          <div class="site-footer__brand">
            <a class="brand" href="${ROOT}index.html"><span class="brand__mark" aria-hidden="true">th</span><span class="brand__name">TalentHub</span></a>
            <p>Vacantes de TI en México con el rango salarial a la vista desde el primer día.</p>
          </div>
          <nav aria-labelledby="f-explorar"><h2 id="f-explorar">Explorar</h2><ul>
            <li><a href="${ROOT}vacantes.html">Vacantes</a></li>
            <li><a href="${ROOT}planes.html">Planes</a></li>
            <li><a href="${ROOT}empresas.html">Para empresas</a></li></ul></nav>
          <nav aria-labelledby="f-empleos"><h2 id="f-empleos">Empleos por</h2><ul>
            <li><a href="${ROOT}vacantes.html?q=Python">Empleos de Python</a></li>
            <li><a href="${ROOT}vacantes.html?q=React">Empleos de React</a></li>
            <li><a href="${ROOT}vacantes.html?q=TypeScript">Empleos de TypeScript</a></li>
            <li><a href="${ROOT}vacantes.html?lugar=Ciudad+de+M%C3%A9xico">Empleos en Ciudad de México</a></li>
            <li><a href="${ROOT}vacantes.html?lugar=Monterrey">Empleos en Monterrey</a></li></ul></nav>
          <nav aria-labelledby="f-cuenta"><h2 id="f-cuenta">Cuenta</h2><ul>${raw(cuenta)}</ul></nav>
          <nav aria-labelledby="f-legal"><h2 id="f-legal">Legal</h2><ul>
            <li><a href="${ROOT}privacidad.html">Aviso de privacidad</a></li>
            <li><button type="button" data-reset>Restablecer demo</button></li></ul></nav>
        </div>
        <p class="site-footer__demo">${icon("info")}<span><strong>Demo de portafolio.</strong>
          Réplica de las pantallas de TalentHub México con datos ficticios. No es el sitio oficial:
          el producto real está en <a class="link" href="https://www.talent-hub.me" rel="noopener">talent-hub.me</a>.</span></p>
        <div class="site-footer__bottom">
          <span>© 2026 TalentHub México · réplica de portafolio</span>
          <span>Cada vacante pasa por revisión antes de publicarse.</span>
        </div>
      </div>
    </footer>`;
}

// ── Montaje ──────────────────────────────────────────────────────────────
const skip = html`<a class="skip-link" href="#contenido">Saltar al contenido</a>`;
if (!document.body.hasAttribute("data-sin-nav")) {
  document.body.insertAdjacentHTML("afterbegin", skip + nav());
  document.body.insertAdjacentHTML("beforeend", footer());
}

// Menú móvil
const toggle = $(".nav-toggle");
const panel = $("#nav-panel");
toggle?.addEventListener("click", () => {
  const abierto = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!abierto));
  toggle.setAttribute("aria-label", abierto ? "Abrir menú" : "Cerrar menú");
  toggle.innerHTML = icon(abierto ? "list" : "x").value;
  panel.hidden = abierto;
  document.body.style.overflow = abierto ? "" : "hidden";
});

// Menú de cuenta (disclosure): Esc y clic fuera lo cierran
const btnCuenta = $(".cuenta__btn");
const menu = $("#menu-cuenta");
function cerrarCuenta(focus) {
  if (!btnCuenta || menu.hidden) return;
  menu.hidden = true;
  btnCuenta.setAttribute("aria-expanded", "false");
  if (focus) btnCuenta.focus();
}
btnCuenta?.addEventListener("click", () => {
  const abrir = menu.hidden;
  menu.hidden = !abrir;
  btnCuenta.setAttribute("aria-expanded", String(abrir));
});
document.addEventListener("click", (e) => { if (!e.target.closest(".cuenta")) cerrarCuenta(false); });
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  cerrarCuenta(true);
  if (toggle?.getAttribute("aria-expanded") === "true") { toggle.click(); toggle.focus(); }
});

// Cerrar sesión y restablecer
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-salir]")) {
    sesion.salir();
    location.href = `${ROOT}index.html`;
  }
  if (e.target.closest("[data-reset]")) {
    store.reset();
    location.reload();
  }
});

// Barra de carga: solo si la espera supera 0.3 s
const barra = $(".barra-carga");
let t;
window.addEventListener("api:cargando", (e) => {
  clearTimeout(t);
  if (e.detail) t = setTimeout(() => barra?.classList.add("is-on"), 300);
  else barra?.classList.remove("is-on");
});
