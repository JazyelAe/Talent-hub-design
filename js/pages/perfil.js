// Mi perfil (candidato): edición con aviso de cambios sin guardar, habilidades en chips y CV.
import { $, html, raw, icon } from "../utils.js";
import { api } from "../api.js";
import { exigirRol } from "../session.js";
import { validarFormulario, contadores } from "../components/form.js";
import { chipsEntrada } from "../components/chips-entrada.js";
import { activarMantener } from "../components/mantener.js";
import { confirmar } from "../components/dialog.js";
import { toast } from "../components/toast.js";

const form = $("#form-perfil");
let guardado = null;   // último perfil guardado
let cvActual = null;   // nombre del CV (o null)
let chips;

const leer = () => ({
  usuario: form.usuario.value.trim(), correo: form.correo.value.trim(), telefono: form.telefono.value.trim(),
  profesion: form.profesion.value.trim(), resumen: form.resumen.value.trim(),
  habilidades: chips.valores(), cv: form.cv.files[0]?.name || cvActual,
});
const sucio = () => JSON.stringify(leer()) !== JSON.stringify(guardado);

function pintarResumen(p) {
  const ini = (p.usuario || "?").replace(/[._]/g, " ").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();
  const dato = (t, v, vacio) => raw(html`<dt>${t}</dt><dd class="${v ? "" : "vacio"}">${v || vacio}</dd>`);
  $("#resumen").innerHTML = html`
    <span class="iniciales iniciales--xl iniciales--blue" aria-hidden="true">${ini}</span>
    <div><strong style="font-size:var(--fs-sub)">${p.usuario}</strong><p style="color:var(--ink-2);font-size:var(--fs-ui)">${p.profesion || "Sin profesión"}</p></div>
    <dl>
      ${dato("Correo", p.correo, "")}${dato("Teléfono", p.telefono, "Sin teléfono")}
      ${dato("Habilidades", p.habilidades.join(", "), "Sin habilidades")}${dato("Resumen", p.resumen, "Sin resumen")}
      ${dato("CV", p.cv, "Aún no subes tu CV")}
    </dl>`;
}

function pintarCV() {
  $("#cv-actual").innerHTML = cvActual
    ? html`<div class="archivo">
        <span class="archivo__icono">${icon("file-pdf")}</span>
        <span class="archivo__info"><strong>${cvActual}</strong><span>PDF · las empresas lo ven al recibir tu postulación</span></span>
        <button class="btn btn--ghost btn--danger-text btn--sm btn-mantener" type="button" id="quitar-cv">${icon("trash")}Quitar CV</button>
      </div>`
    : html`<p class="aviso aviso--warn">${icon("warning-circle")}<span><strong>Aún no subes tu CV.</strong> Lo necesitas para postularte · PDF, máximo 5 MB.</span></p>`;
  activarMantener($("#cv-actual"));
}

function volcar(p) {
  for (const k of ["usuario", "correo", "telefono", "profesion", "resumen"]) form[k].value = p[k] || "";
  form.resumen.dispatchEvent(new Event("input"));
  form.cv.value = "";
  cvActual = p.cv || null;
  chips.poner(p.habilidades || []);
  pintarCV();
  actualizarBarra();
}

function actualizarBarra() { $("#barra-guardar").hidden = !guardado || !sucio(); }

async function iniciar() {
  chips = chipsEntrada($("#habilidades"), { alCambiar: () => guardado && actualizarBarra() });
  contadores(form);
  try {
    guardado = await api.perfil();
  } catch (e) {
    $("#pagina").innerHTML = html`<div class="estado estado--error" role="alert"><h2 class="estado__titulo">No pudimos cargar tu perfil</h2><p class="estado__texto">${e.message}</p></div>`;
    return;
  }
  guardado.habilidades ||= [];
  volcar(guardado);
  pintarResumen(guardado);
  guardado = leer();   // normaliza el formato para comparar
}

form.addEventListener("input", actualizarBarra);
form.addEventListener("change", actualizarBarra);
$("#descartar").addEventListener("click", () => { volcar(guardado); toast("Cambios descartados", { tipo: "info" }); form.usuario.focus(); });

// Quitar CV: mantener presionado + diálogo que nombra la consecuencia
$("#cv-actual").addEventListener("mantenido", async () => {
  const ok = await confirmar({
    titulo: "¿Quitar tu CV?",
    texto: "No podrás postularte hasta que subas otro. Tus postulaciones enviadas conservan el CV que mandaste.",
    aceptar: "Quitar CV", iconoAceptar: "trash", peligro: true,
  });
  if (!ok) return;
  cvActual = null;
  pintarCV();
  actualizarBarra();
});

validarFormulario(form, async () => {
  const btn = form.querySelector('[type="submit"]');
  btn.setAttribute("aria-busy", "true");
  const nuevo = leer();
  await api.guardarPerfil(nuevo);
  guardado = nuevo;
  cvActual = nuevo.cv;
  form.cv.value = "";
  pintarCV();
  pintarResumen(nuevo);
  btn.removeAttribute("aria-busy");
  actualizarBarra();
  toast("Perfil guardado");
});

// Aviso del navegador al salir con cambios sin guardar
addEventListener("beforeunload", (e) => { if (guardado && sucio()) { e.preventDefault(); e.returnValue = ""; } });

if (exigirRol("candidato", $("#pagina"), { que: "tu perfil" })) iniciar();
