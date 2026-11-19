// ProcessTrack + etiqueta de estado de una postulación.
import { html, raw } from "../utils.js";

export const ESTADOS_POST = {
  enviada: { texto: "Enviada", paso: 1, tono: "neutro" },
  en_revision: { texto: "En revisión", paso: 2, tono: "curso" },
  aceptada: { texto: "Aceptada", paso: 3, tono: "bien" },
  rechazada: { texto: "Rechazada", paso: 3, tono: "mal" },
};

export function track(estado, { grande = false } = {}) {
  const e = ESTADOS_POST[estado];
  const segs = [1, 2, 3].map((i) => {
    const cls = ["track__seg", i <= e.paso && "is-on", i === e.paso && "is-last"].filter(Boolean).join(" ");
    return raw(`<span class="${cls}"></span>`);
  });
  return raw(html`<span class="track ${grande ? "track--lg" : ""} track--${e.tono} is-anim" role="img" aria-label="Paso ${e.paso} de 3: ${e.texto}">${segs}</span>`);
}

export function estadoPostulacion(estado) {
  const e = ESTADOS_POST[estado];
  return raw(html`<span class="estado-post estado-post--${e.tono}">${track(estado)}<span class="estado-post__txt" aria-hidden="true">${e.texto}</span></span>`);
}
