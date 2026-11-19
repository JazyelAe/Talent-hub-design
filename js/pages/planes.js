// Planes: tarjetas desde data/planes.json. "Contratar" explica que la demo no procesa pagos.
import { $, ROOT, html, raw, icon } from "../utils.js";
import { api } from "../api.js";
import { sesion } from "../store.js";
import { abrirDialogo } from "../components/dialog.js";
import { estadoError } from "../components/estados.js";

const rol = sesion.rol();
// En la demo, toda cuenta empieza en el plan gratuito de su tipo
const actual = rol === "empresa" ? "empresa-gratis" : rol === "candidato" ? "aspirante-gratis" : null;
const precio = (n) => `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

function tarjeta(p) {
  const esActual = p.id === actual;
  const gratis = p.precio === 0;
  const boton = esActual
    ? html`<span class="btn btn--ghost btn--block" aria-disabled="true">${icon("check")}Tu plan actual</span>`
    : gratis
      ? html`<a class="btn btn--ghost btn--block" href="${ROOT}registro.html">Plan gratuito</a>`
      : html`<button class="btn btn--primary btn--block" type="button" data-plan="${p.id}" data-nombre="${p.nombre}" data-precio="${p.precio}">${icon("arrow-right")}Contratar ${p.nombre.toUpperCase()}</button>`;
  return html`
    <article class="plan ${esActual ? "plan--actual" : ""}">
      ${esActual ? raw(html`<span class="tag tag--bien plan__badge">Plan actual</span>`) : ""}
      <div>
        <h3 class="plan__nombre">${p.nombre}</h3>
        <p class="plan__lema">${p.lema}</p>
      </div>
      <p class="plan__precio"><strong>${precio(p.precio)}</strong><span>MXN / mes</span></p>
      <ul class="plan__rasgos" role="list">${p.rasgos.map((r) => raw(html`<li>${icon("check")}${r}</li>`))}</ul>
      ${raw(boton)}
    </article>`;
}

async function cargar() {
  try {
    const planes = await api.planes();
    $("#planes-empresas").innerHTML = planes.empresas.map(tarjeta).join("");
    $("#planes-aspirantes").innerHTML = planes.aspirantes.map(tarjeta).join("");
  } catch (e) {
    $("#planes-empresas").innerHTML = estadoError({ titulo: "No pudimos cargar los planes", texto: e.message });
    $("#planes-aspirantes").closest("section").hidden = true;
  }
}

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-reintentar]")) { $("#planes-aspirantes").closest("section").hidden = false; cargar(); }
  const b = e.target.closest("[data-plan]");
  if (!b) return;
  abrirDialogo({
    titulo: `Plan ${b.dataset.nombre}`,
    contenido: html`
      <p>En el producto real aquí se abre el pago con PayPal por <strong>${precio(Number(b.dataset.precio))} MXN al mes</strong>, sin permanencia.</p>
      <p class="aviso">${icon("info")}<span><strong>Demo de portafolio.</strong> Esta réplica no procesa pagos ni pide datos bancarios.</span></p>`,
    acciones: html`<button class="btn btn--primary" type="button" data-cerrar>${icon("check")}Entendido</button>`,
  });
});

cargar();
