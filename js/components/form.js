// Validación de formularios accesible, sobre la API nativa de validación.
//  - Valida al salir del campo (blur) y, después del primer error, mientras se escribe.
//  - Mensajes en español, conectados con aria-describedby y anunciados (role="alert").
//  - Al enviar, el foco va al primer campo con error.
// Reglas extra con data-*: data-match="#id" (igual a otro campo), data-min-campo="#id"
// (número mayor o igual a otro), data-max-mb="5" y data-tipo="pdf" (archivos).
import { icon } from "../utils.js";

const MENSAJES = {
  valueMissing: (el) => el.type === "checkbox" ? "Marca esta casilla para continuar." : el.type === "file" ? "Selecciona un archivo." : "Este campo es obligatorio.",
  typeMismatch: (el) => el.type === "email" ? "Escribe un correo válido, por ejemplo nombre@dominio.com." : "El formato no es válido.",
  tooShort: (el) => `Escribe al menos ${el.minLength} caracteres (llevas ${el.value.length}).`,
  tooLong: (el) => `Máximo ${el.maxLength} caracteres.`,
  patternMismatch: (el) => el.dataset.patronMsg || "El formato no es válido.",
  rangeUnderflow: (el) => `El valor mínimo es ${Number(el.min).toLocaleString("es-MX")}.`,
  rangeOverflow: (el) => `El valor máximo es ${Number(el.max).toLocaleString("es-MX")}.`,
  stepMismatch: () => "Usa un número entero.",
  badInput: () => "Escribe un número.",
};

function reglasExtra(el) {
  const form = el.form;
  if (el.dataset.match) {
    const otro = form.querySelector(el.dataset.match);
    if (el.value && otro && el.value !== otro.value) return el.dataset.matchMsg || "Los valores no coinciden.";
  }
  if (el.dataset.minCampo) {
    const otro = form.querySelector(el.dataset.minCampo);
    if (el.value && otro?.value && Number(el.value) < Number(otro.value)) return el.dataset.minCampoMsg || "Debe ser mayor o igual al otro valor.";
  }
  if (el.type === "file" && el.files?.[0]) {
    const f = el.files[0];
    if (el.dataset.tipo === "pdf" && !/\.pdf$/i.test(f.name) && f.type !== "application/pdf") return "El archivo debe ser PDF.";
    const max = Number(el.dataset.maxMb || 0);
    if (max && f.size > max * 1024 * 1024) return `El archivo pesa ${(f.size / 1048576).toFixed(1)} MB; el máximo es ${max} MB.`;
  }
  if (el.dataset.validar && typeof window[el.dataset.validar] === "function") return window[el.dataset.validar](el);
  return "";
}

function mensajeDe(el) {
  el.setCustomValidity("");
  const extra = reglasExtra(el);
  if (extra) { el.setCustomValidity(extra); return extra; }
  if (el.validity.valid) return "";
  for (const k in MENSAJES) if (el.validity[k]) return MENSAJES[k](el);
  return el.validationMessage;
}

function cajaError(el) {
  const id = `${el.id}-error`;
  let caja = document.getElementById(id);
  if (!caja) {
    caja = document.createElement("p");
    caja.id = id;
    caja.className = "field__error";
    caja.setAttribute("role", "alert");
    const field = el.closest(".field");
    if (field) field.append(caja);
    else (el.closest("label") || el).after(caja);
  }
  const ids = new Set((el.getAttribute("aria-describedby") || "").split(" ").filter(Boolean));
  ids.add(id);
  el.setAttribute("aria-describedby", [...ids].join(" "));
  return caja;
}

export function validarCampo(el) {
  const msg = mensajeDe(el);
  const caja = cajaError(el);
  if (msg) {
    el.setAttribute("aria-invalid", "true");
    caja.innerHTML = icon("warning-circle").value + `<span>${msg}</span>`;
  } else {
    el.removeAttribute("aria-invalid");
    caja.textContent = "";
  }
  return !msg;
}

const campos = (form) => [...form.elements].filter((el) => el.id && el.willValidate && !el.disabled);

/** Activa la validación en un formulario. onSubmit recibe FormData si todo es válido. */
export function validarFormulario(form, onSubmit) {
  form.noValidate = true;
  form.addEventListener("focusout", (e) => {
    if (e.target.willValidate && (e.target.value || e.target.dataset.tocado)) {
      e.target.dataset.tocado = "1";
      validarCampo(e.target);
    }
  });
  form.addEventListener("input", (e) => {
    if (e.target.getAttribute("aria-invalid") === "true") validarCampo(e.target);
    // revalida el campo dependiente (confirmar contraseña, salario máximo)
    campos(form).filter((c) => [c.dataset.match, c.dataset.minCampo].includes(`#${e.target.id}`) && c.value)
      .forEach(validarCampo);
  });
  form.addEventListener("change", (e) => { if (e.target.type === "file" || e.target.type === "checkbox") validarCampo(e.target); });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const invalidos = campos(form).filter((el) => !validarCampo(el));
    if (invalidos.length) { invalidos[0].focus(); return; }
    await onSubmit?.(new FormData(form), form);
  });
}

/** Contador de caracteres para campos con maxlength y data-contador. */
export function contadores(ctx = document) {
  ctx.querySelectorAll("[data-contador]").forEach((el) => {
    const out = document.getElementById(el.dataset.contador);
    const max = Number(el.getAttribute("maxlength"));
    const pintar = () => {
      out.textContent = `${el.value.length} / ${max}`;
      out.classList.toggle("is-over", el.value.length >= max);
    };
    el.addEventListener("input", pintar);
    pintar();
  });
}

/** Botones de "mostrar contraseña" (.control__btn[data-mostrar]). */
export function mostrarPassword(ctx = document) {
  ctx.querySelectorAll("[data-mostrar]").forEach((btn) => {
    const input = document.getElementById(btn.dataset.mostrar);
    btn.addEventListener("click", () => {
      const ver = input.type === "password";
      input.type = ver ? "text" : "password";
      btn.setAttribute("aria-pressed", String(ver));
      btn.setAttribute("aria-label", ver ? "Ocultar contraseña" : "Mostrar contraseña");
      btn.innerHTML = icon(ver ? "eye-slash" : "eye").value;
    });
  });
}
