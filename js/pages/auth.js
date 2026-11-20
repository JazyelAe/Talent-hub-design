// Pantallas cerradas: login, recuperar y registro. Son MAQUETAS:
// validan el formato, no envían nada, no guardan contraseñas y lo dicen.
import { $, html, raw, icon } from "../utils.js";
import { sesion } from "../store.js";
import { avisoDemo, entrarDemo } from "../session.js";
import { validarFormulario, mostrarPassword } from "../components/form.js";

const params = new URLSearchParams(location.search);
const volver = params.get("volver");

$("#aviso-demo")?.insertAdjacentHTML("afterbegin", avisoDemo());
mostrarPassword();

// Los accesos demo respetan ?volver= (p. ej. volver a la vacante que se estaba viendo)
document.querySelectorAll("[data-entrar]").forEach((b) => { if (volver) b.dataset.volver = volver; });

/** Borra cualquier contraseña escrita: la demo nunca la conserva. */
const olvidarPasswords = (form) => form.querySelectorAll('input[type="password"]').forEach((i) => { i.value = ""; });

// ── Login ─────────────────────────────────────────────────────────────────
const login = $("#form-login");
if (login) {
  validarFormulario(login, (datos, form) => {
    olvidarPasswords(form);
    const usuario = datos.get("usuario");
    $("#aviso-demo").innerHTML = html`<p class="aviso" role="status">${icon("info")}<span>
      <strong>Formato correcto, pero aquí no hay cuentas reales.</strong>
      No enviamos «${usuario}» ni tu contraseña a ningún lado. Elige una cuenta de prueba para seguir.</span></p>`;
    const atajos = $("#atajos");
    atajos.focus();
    atajos.scrollIntoView({ block: "nearest" });
  });
}

// ── Recuperar ─────────────────────────────────────────────────────────────
const recuperar = $("#form-recuperar");
if (recuperar) {
  validarFormulario(recuperar, (datos) => {
    $("#rec-card").innerHTML = html`
      <div class="estado" role="status" style="border:0;background:none;padding:var(--sp-6) 0">
        <span class="estado__icono">${icon("envelope-simple")}</span>
        <h1 class="estado__titulo">Revisa tu correo</h1>
        <p class="estado__texto">Si existe una cuenta con <strong>${datos.get("correo")}</strong>, te llegará un enlace para crear una contraseña nueva.</p>
        ${raw(avisoDemo().replace("Este formulario no envía datos a ningún lado y no guarda contraseñas.", "No se envió ningún correo: esta pantalla es una maqueta."))}
      </div>`;
    $("#rec-t")?.focus();
  });
}

// ── Registro ──────────────────────────────────────────────────────────────
const registro = $("#form-registro");
if (registro) {
  if (params.get("tipo") === "empresa") $("#tipo-empresa").checked = true;

  // Validador visual de contraseña: cada regla se marca al cumplirse
  const pass = $("#g-pass");
  const reglas = {
    largo: (v) => v.length >= 8,
    numero: (v) => /\d/.test(v),
    mayus: (v) => /[A-ZÁÉÍÓÚÑ]/.test(v),
  };
  pass.addEventListener("input", () => {
    for (const [k, f] of Object.entries(reglas)) {
      const li = document.querySelector(`[data-regla="${k}"]`);
      const ok = f(pass.value);
      li.classList.toggle("ok", ok);
      li.querySelector("use").setAttribute("href", li.querySelector("use").getAttribute("href").replace(/#i-.*/, ok ? "#i-check" : "#i-x"));
      li.querySelector(".sr-only").textContent = ok ? "cumplido" : "pendiente";
    }
  });
  window.validarPassword = (el) => Object.values(reglas).every((f) => f(el.value)) ? "" : "La contraseña no cumple los requisitos de abajo.";

  validarFormulario(registro, (datos, form) => {
    olvidarPasswords(form);
    const rol = datos.get("tipo") === "empresa" ? "empresa" : "candidato";
    $("#reg-card").innerHTML = html`
      <div class="estado" role="status" style="border:0;background:none;padding:var(--sp-6) 0">
        <span class="estado__icono">${icon("check")}</span>
        <h1 class="estado__titulo" tabindex="-1" id="reg-ok">Todo en orden, ${datos.get("usuario")}</h1>
        <p class="estado__texto">El formulario es válido. Como esto es una demo, no se creó ninguna cuenta ni se guardó tu contraseña: sigue con la cuenta de prueba de ${rol}.</p>
        <button class="btn btn--primary" type="button" data-entrar="${rol}" ${volver ? raw(`data-volver="${volver.replace(/"/g, "")}"`) : ""}>${icon("sign-in")}Entrar como ${rol} demo</button>
      </div>`;
    $("#reg-ok").focus();
  });
}

// Si ya hay sesión demo, las pantallas cerradas lo dicen (como «SoloVisitantes» del original)
if (sesion.rol()) {
  const aviso = $("#aviso-demo");
  aviso?.insertAdjacentHTML("beforeend", html`<p class="aviso" style="margin-top:var(--sp-3)">${icon("user")}<span>Ya entraste como <strong>${sesion.rol()}</strong>.
    <button class="btn btn--text" type="button" data-salir>Cerrar sesión</button></span></p>`);
}
void entrarDemo;
