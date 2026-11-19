// Diálogo modal sobre <dialog> nativo: showModal() ya atrapa el foco, hace inerte el resto
// de la página y cierra con Esc. Aquí se añade: devolver el foco a quien lo abrió,
// cerrar al hacer clic en el fondo y una confirmación que nombra la consecuencia.
import { html, raw, icon } from "../utils.js";

export function abrirDialogo({ titulo, contenido, acciones = "", clase = "", alCerrar }) {
  const previo = document.activeElement;
  const dlg = document.createElement("dialog");
  dlg.className = `dialog ${clase}`;
  const idTitulo = `dlg-t-${Date.now()}`;
  dlg.setAttribute("aria-labelledby", idTitulo);
  dlg.innerHTML = html`
    <div class="dialog__caja">
      <header class="dialog__head">
        <h2 class="dialog__titulo" id="${idTitulo}">${titulo}</h2>
        <button class="btn btn--ghost btn--icon btn--sm" type="button" data-cerrar aria-label="Cerrar">${icon("x")}</button>
      </header>
      <div class="dialog__cuerpo">${raw(contenido)}</div>
      ${acciones ? raw(html`<footer class="dialog__acciones">${raw(acciones)}</footer>`) : ""}
    </div>`;
  document.body.append(dlg);

  const cerrar = (valor) => dlg.close(valor ?? "");
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg || e.target.closest("[data-cerrar]")) cerrar("cancelar");
  });
  dlg.addEventListener("close", () => {
    alCerrar?.(dlg.returnValue);
    dlg.remove();
    previo?.focus?.();
  });
  dlg.showModal();
  // Foco inicial: el primer campo, o el botón de acción menos destructivo
  (dlg.querySelector("[autofocus], input, select, textarea") || dlg.querySelector("[data-cerrar]"))?.focus();
  return { dlg, cerrar };
}

/** Confirmación que nombra lo que pasa (no "¿estás seguro?"). Resuelve true/false. */
export function confirmar({ titulo, texto, aceptar = "Confirmar", iconoAceptar = "check", peligro = false }) {
  return new Promise((resolve) => {
    let ok = false;
    const { dlg, cerrar } = abrirDialogo({
      titulo,
      contenido: html`<p>${texto}</p>`,
      acciones: html`
        <button class="btn btn--ghost" type="button" data-cerrar>Cancelar</button>
        <button class="btn ${peligro ? "btn--danger" : "btn--primary"}" type="button" data-ok>${icon(iconoAceptar)}${aceptar}</button>`,
      alCerrar: () => resolve(ok),
    });
    dlg.querySelector("[data-ok]").addEventListener("click", () => { ok = true; cerrar("ok"); });
    dlg.querySelector(".dialog__acciones [data-cerrar]").focus();   // por defecto, la salida segura
  });
}
