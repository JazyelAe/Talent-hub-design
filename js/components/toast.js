// Toasts: confirmaciones breves anunciadas con aria-live (polite; assertive para errores).
import { html, raw, icon } from "../utils.js";

let region;
function asegurarRegion() {
  if (region) return region;
  region = document.createElement("div");
  region.className = "toasts";
  region.setAttribute("aria-live", "polite");
  region.setAttribute("aria-atomic", "false");
  document.body.append(region);
  return region;
}

const ICONOS = { ok: "check", error: "warning-circle", info: "info" };

export function toast(titulo, { texto = "", tipo = "ok", ms = 4500 } = {}) {
  const r = asegurarRegion();
  const el = document.createElement("div");
  el.className = `toast toast--${tipo}`;
  if (tipo === "error") el.setAttribute("role", "alert");
  el.innerHTML = html`${icon(ICONOS[tipo])}<div><strong>${titulo}</strong>${texto ? raw(html`<p>${texto}</p>`) : ""}</div>`;
  r.append(el);
  setTimeout(() => el.remove(), ms);
}
