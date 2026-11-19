// Tarjeta de vacante. Devuelve HTML (string) a partir de una vacante con su empresa.
import { ROOT, html, raw, icon, rangoSalario, fechaRelativa, iniciales, tinte, MODALIDAD } from "../utils.js";

export function tagModalidad(modalidad) {
  const tono = modalidad === "remoto" ? "bien" : "curso";
  return raw(html`<span class="tag tag--${tono}">${MODALIDAD[modalidad]}</span>`);
}

export function vacanteCard(v, { nivelTitulo = "h3" } = {}) {
  const emp = v.empresa?.nombre ?? "Empresa";
  const h = nivelTitulo;
  return html`
    <article class="vcard">
      <div class="vcard__head">
        <span class="iniciales iniciales--${tinte(emp)}" aria-hidden="true">${iniciales(emp)}</span>
        <div class="vcard__id">
          ${raw(`<${h} class="vcard__title">`)}<a href="${ROOT}vacante.html?id=${v.id}">${v.titulo}</a>${raw(`</${h}>`)}
          <p class="vcard__empresa">${emp}</p>
        </div>
        ${tagModalidad(v.modalidad)}
      </div>
      <p class="vcard__salario"><span class="sr-only">Sueldo: </span>${rangoSalario(v.salario_min, v.salario_max)}<small>MXN mensual</small></p>
      <p class="vcard__desc">${v.descripcion}</p>
      <div class="vcard__foot">
        <ul class="vcard__techs" aria-label="Tecnologías">
          ${v.tecnologias.slice(0, 3).map((t) => raw(html`<li class="tech">${t}</li>`))}
        </ul>
        <p class="vcard__meta">
          ${tagModalidad(v.modalidad)}
          <span>${icon("map-pin")}${v.ciudad}</span>
          <span><time datetime="${v.fecha_publicacion}">${fechaRelativa(v.fecha_publicacion)}</time></span>
        </p>
      </div>
    </article>`;
}
