// Aviso "Lleva TalentHub en tu celular". Visible solo para visitantes (sin sesión demo).
// Escritorio: tarjeta en su columna de 340px que se minimiza a un botón; la página se
// reacomoda. Móvil: barra inferior que se puede cerrar. El estado se recuerda.
// El QR es decorativo y no lleva a ningún lado: la app real es solo para testers.
import { html, raw, icon } from "../utils.js";
import { store, sesion } from "../store.js";
import { abrirDialogo } from "./dialog.js";

const body = document.body;
const omitir = sesion.rol() || body.hasAttribute("data-sin-promo") || body.hasAttribute("data-sin-nav");

/** QR decorativo determinista: tres marcas de posición y módulos pseudoaleatorios. */
function qr() {
  const n = 25, celda = 4;
  let semilla = 7;
  const rnd = () => ((semilla = (semilla * 9301 + 49297) % 233280) / 233280);
  const marca = (x, y) => (x >= 0 && x < 7 && y >= 0 && y < 7);
  let rects = "";
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const enMarca = marca(x, y) || marca(x - (n - 7), y) || marca(x, y - (n - 7));
    if (enMarca) continue;
    if (rnd() > 0.52) rects += `<rect x="${x * celda}" y="${y * celda}" width="${celda}" height="${celda}"/>`;
  }
  const finder = (x, y) => `<rect x="${x}" y="${y}" width="28" height="28"/><rect x="${x + 4}" y="${y + 4}" width="20" height="20" fill="#fff"/><rect x="${x + 8}" y="${y + 8}" width="12" height="12"/>`;
  return `<svg viewBox="0 0 100 100" aria-hidden="true" fill="#111">${finder(0, 0)}${finder(72, 0)}${finder(0, 72)}${rects}</svg>`;
}

function avisoDemo() {
  abrirDialogo({
    titulo: "App de TalentHub",
    contenido: html`<p>La app móvil de TalentHub existe, pero por ahora solo está disponible para testers.</p>
      <p class="aviso">${icon("info")}<span><strong>Demo de portafolio.</strong> Este QR y este botón son decorativos y no descargan nada.</span></p>`,
    acciones: html`<button class="btn btn--primary" type="button" data-cerrar>${icon("check")}Entendido</button>`,
  });
}

if (!omitir) {
  const app = (ico, txt, cls = "") => html`<span class="promo__app ${cls}"><span>${ico}</span><span>${txt}</span></span>`;
  const el = document.createElement("aside");
  el.className = "promo";
  el.setAttribute("aria-label", "Aplicación móvil");
  el.innerHTML = html`
    <div class="promo__card" id="promo-card">
      <button class="promo__cerrar" type="button" data-promo="min" aria-label="Minimizar aviso de la app">${icon("x")}</button>
      <div class="promo__qr">${raw(qr())}</div>
      <h2 class="promo__titulo">Lleva TalentHub<br>en tu celular</h2>
      <p class="promo__sub">${icon("scan")}Escanéalo con tu cámara</p>
      <p class="promo__nota">Por ahora solo para testers · QR de demostración</p>
      <div class="promo__tel" aria-hidden="true">
        <div class="promo__barra"><span>9:41</span><span class="promo__isla"></span><span>▮▮</span></div>
        <div class="promo__apps">
          ${raw(app("th", "TalentHub", "promo__app--th"))}${raw(app(icon("scan"), "Cámara"))}${raw(app(icon("chat-circle"), "Mensajes"))}
          ${raw(app(icon("calendar-blank"), "Calendario"))}${raw(app(icon("map-pin"), "Mapas"))}${raw(app(icon("clock"), "Reloj"))}
        </div>
      </div>
    </div>
    <button class="btn btn--primary promo__mini" type="button" data-promo="max" aria-controls="promo-card">${icon("device-mobile")}Descarga la app</button>
    <div class="promo__bar">
      <span class="brand__mark" aria-hidden="true">th</span>
      <span class="promo__bar-txt"><strong>TalentHub</strong><span>App para Android</span></span>
      <button class="btn btn--primary btn--sm" type="button" data-promo="demo">${icon("download-simple")}Descargar</button>
      <button class="btn btn--ghost btn--icon btn--sm" type="button" data-promo="cerrar" aria-label="Cerrar aviso de la app">${icon("x")}</button>
    </div>`;
  body.append(el);
  body.classList.add("has-promo");
  if (store.get("promo-min")) body.classList.add("promo-min");
  if (store.get("promo-cerrado")) body.classList.add("promo-cerrado");

  // Al minimizar, la página recupera la columna (transición de padding en layout.css)
  el.addEventListener("click", (e) => {
    const accion = e.target.closest("[data-promo]")?.dataset.promo;
    if (accion === "min") {
      body.classList.add("promo-min");
      store.set("promo-min", true);
      el.querySelector(".promo__mini").focus();
    } else if (accion === "max") {
      body.classList.remove("promo-min");
      store.set("promo-min", false);
      el.querySelector(".promo__cerrar").focus();
    } else if (accion === "cerrar") {
      body.classList.add("promo-cerrado");
      store.set("promo-cerrado", true);
    } else if (accion === "demo") {
      avisoDemo();
    }
  });
}
