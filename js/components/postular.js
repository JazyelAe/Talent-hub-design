// Diálogo de postulación: CV (el del perfil o un PDF nuevo), mensaje opcional y consentimiento.
// El PDF no se sube a ningún lado: solo se valida su tipo y tamaño y se guarda su nombre.
import { html, raw, icon } from "../utils.js";
import { api } from "../api.js";
import { abrirDialogo } from "./dialog.js";
import { validarFormulario, contadores } from "./form.js";
import { toast } from "./toast.js";

export async function abrirPostulacion(v, { alTerminar } = {}) {
  const perfil = await api.perfil().catch(() => ({}));
  const tieneCV = Boolean(perfil.cv);
  const { dlg, cerrar } = abrirDialogo({
    titulo: `Postularte a ${v.titulo}`,
    clase: "dialog--ancho",
    contenido: html`
      <p>${v.empresa.nombre} verá tu perfil, tu CV y tu mensaje. Podrás seguir el proceso en <strong>Mis postulaciones</strong>.</p>
      <form class="form" id="form-postular" novalidate>
        <fieldset class="field" style="border:0;padding:0;margin:0">
          <legend class="field__label" style="margin-bottom:8px">Currículum</legend>
          ${tieneCV ? raw(html`<label class="check"><input type="radio" name="cv-origen" value="perfil" checked> Usar el de mi perfil: <strong style="color:var(--ink)">${perfil.cv}</strong></label>`) : ""}
          <label class="check" style="margin-top:8px"><input type="radio" name="cv-origen" value="nuevo" ${tieneCV ? "" : raw("checked")}> Subir otro PDF</label>
          <div class="field" id="campo-cv" style="margin-top:8px" ${tieneCV ? raw("hidden") : ""}>
            <label class="sr-only" for="p-cv">Archivo PDF del CV</label>
            <input class="input" id="p-cv" name="cv" type="file" accept="application/pdf,.pdf" data-tipo="pdf" data-max-mb="5" ${tieneCV ? raw("disabled") : raw("required")}>
            <p class="field__help">PDF, máximo 5 MB. En la demo no se sube: solo se valida.</p>
          </div>
        </fieldset>
        <div class="field">
          <div class="field__meta"><label class="field__label" for="p-msg">Mensaje para la empresa <span class="field__opt">Opcional</span></label><span class="field__count" id="p-msg-count"></span></div>
          <textarea class="textarea" id="p-msg" name="mensaje" maxlength="500" data-contador="p-msg-count" placeholder="Cuéntales en pocas líneas por qué te interesa el puesto."></textarea>
        </div>
        <label class="check"><input type="checkbox" id="p-ok" name="consentimiento" required> Acepto compartir mi perfil y mi CV con ${v.empresa.nombre} para esta vacante.</label>
      </form>`,
    acciones: html`
      <button class="btn btn--ghost" type="button" data-cerrar>Cancelar</button>
      <button class="btn btn--primary" type="submit" form="form-postular">${icon("paper-plane-tilt")}Enviar postulación</button>`,
  });

  const form = dlg.querySelector("#form-postular");
  const archivo = form.querySelector("#p-cv");
  contadores(form);
  form.addEventListener("change", (e) => {
    if (e.target.name !== "cv-origen") return;
    const nuevo = e.target.value === "nuevo";
    form.querySelector("#campo-cv").hidden = !nuevo;
    archivo.disabled = !nuevo;
    archivo.required = nuevo;
    if (nuevo) archivo.focus();
  });

  validarFormulario(form, async (datos) => {
    const enviar = dlg.querySelector('[type="submit"]');
    enviar.setAttribute("aria-busy", "true");
    enviar.disabled = true;
    const cv = datos.get("cv-origen") === "nuevo" ? archivo.files[0].name : perfil.cv;
    try {
      await api.postular(v.id, { cv, mensaje: datos.get("mensaje").trim() });
      cerrar("ok");
      toast("Postulación enviada", { texto: `Te avisaremos cuando ${v.empresa.nombre} la revise.` });
      alTerminar?.();
    } catch (e) {
      enviar.removeAttribute("aria-busy");
      enviar.disabled = false;
      toast("No pudimos enviar tu postulación", { texto: e.message, tipo: "error" });
    }
  });
}
