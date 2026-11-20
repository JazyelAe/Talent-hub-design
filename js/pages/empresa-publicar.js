// Publicar vacante (empresa): formulario validado con vista previa en vivo de la tarjeta.
import { $, ROOT, html, icon } from "../utils.js";
import { api } from "../api.js";
import { USUARIO_DEMO } from "../store.js";
import { exigirRol } from "../session.js";
import { validarFormulario, contadores } from "../components/form.js";
import { chipsEntrada } from "../components/chips-entrada.js";
import { vacanteCard } from "../components/vacante-card.js";
import { toast } from "../components/toast.js";

const form = $("#form-publicar");
const EMPRESA = { id: USUARIO_DEMO.empresa.empresa_id, nombre: USUARIO_DEMO.empresa.nombre };
let chips;

function datos() {
  const fd = new FormData(form);
  return {
    titulo: (fd.get("titulo") || "").trim(),
    nivel: fd.get("nivel"),
    modalidad: fd.get("modalidad") || "remoto",
    ciudad: (fd.get("ciudad") || "").trim(),
    salario_min: Number(fd.get("salario_min")) || 0,
    salario_max: Number(fd.get("salario_max")) || 0,
    tecnologias: chips.valores(),
    experiencia_anios: Number(fd.get("experiencia")) || 0,
    descripcion: (fd.get("descripcion") || "").trim(),
    requisitos_extra: (fd.get("requisitos_extra") || "").trim(),
  };
}

// Vista previa: refleja lo escrito con textos de relleno donde aún falta algo
function previa() {
  const d = datos();
  const titulo = d.titulo ? `${d.titulo}${d.nivel && !d.titulo.endsWith(d.nivel) ? ` ${d.nivel}` : ""}` : "Título del puesto";
  $("#vista-previa").innerHTML = vacanteCard({
    ...d, id: 0, titulo, empresa: EMPRESA,
    ciudad: d.ciudad || "Ciudad",
    salario_min: d.salario_min || 0, salario_max: d.salario_max || 0,
    tecnologias: d.tecnologias.length ? d.tecnologias : ["Tecnología"],
    descripcion: d.descripcion || "Aquí aparecerá el inicio de la descripción.",
    fecha_publicacion: "2026-11-18",
  }, { nivelTitulo: "p" });
}

function validarExtras() {
  let ok = true;
  const tecErr = $("#tec-error");
  if (!chips.valores().length) {
    tecErr.innerHTML = icon("warning-circle").value + "<span>Agrega al menos una tecnología.</span>";
    ok = false;
  } else tecErr.textContent = "";
  const modErr = $("#modalidad-error");
  if (!form.querySelector('input[name="modalidad"]:checked')) {
    modErr.innerHTML = icon("warning-circle").value + "<span>Elige una modalidad.</span>";
    ok = false;
  } else modErr.textContent = "";
  return ok;
}

function iniciar() {
  chips = chipsEntrada($("#tecnologias"), { max: 8, alCambiar: () => { previa(); if ($("#tec-error").textContent) validarExtras(); } });
  contadores(form);
  form.addEventListener("input", previa);
  form.addEventListener("change", previa);
  previa();

  // Chips y grupo de radios no tienen validación nativa: se marcan al enviar junto con el resto
  form.addEventListener("submit", () => validarExtras(), { capture: true });

  validarFormulario(form, async () => {
    if (!validarExtras()) {
      (form.querySelector('input[name="modalidad"]:checked') ? $("#v-tec") : form.querySelector('input[name="modalidad"]')).focus();
      return;
    }
    const btn = form.querySelector('[type="submit"]');
    btn.setAttribute("aria-busy", "true");
    btn.disabled = true;
    const d = datos();
    const v = await api.crearVacante({
      ...d, titulo: d.titulo.endsWith(d.nivel) ? d.titulo : `${d.titulo} ${d.nivel}`,
      rol: d.titulo, empresa_id: EMPRESA.id, beneficios: [],
    });
    toast("Vacante enviada a revisión");
    $("#pagina").innerHTML = html`
      <div class="estado" role="status">
        <span class="estado__icono">${icon("shield-check")}</span>
        <h2 class="estado__titulo" tabindex="-1" id="ok-t">«${v.titulo}» está en revisión</h2>
        <p class="estado__texto">Un validador la revisará antes de publicarla. Mientras tanto la verás en Mis vacantes con el estado «En revisión».</p>
        <div class="cluster" style="justify-content:center;margin-top:var(--sp-3)">
          <a class="btn btn--primary" href="vacantes.html">${icon("arrow-right")}Ir a mis vacantes</a>
          <a class="btn btn--ghost" href="publicar.html">${icon("plus")}Publicar otra</a>
        </div>
      </div>`;
    $("#ok-t").focus();
  });
}

if (exigirRol("empresa", $("#pagina"), { que: "el formulario de publicación" })) iniciar();
void ROOT;
