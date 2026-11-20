// Para empresas: una vacante real de la demo y un panel de postulaciones de ejemplo.
import { $, html } from "../utils.js";
import { api } from "../api.js";
import { vacanteCard } from "../components/vacante-card.js";
import { estadoPostulacion } from "../components/process.js";

$("#emp-track").innerHTML = estadoPostulacion("en_revision").value;

const ejemplo = [
  ["A1", "Aspirante 1", "Desarrollador Backend", "enviada", "teal"],
  ["A2", "Aspirante 2", "Desarrollador Backend", "en_revision", "violet"],
  ["A3", "Aspirante 3", "Frontend React", "aceptada", "neutral"],
];
$("#emp-recibidas").innerHTML = ejemplo.map(([ini, n, p, e, t]) => html`
  <li>
    <span class="iniciales iniciales--sm iniciales--${t}" aria-hidden="true">${ini}</span>
    <span class="recibida__id"><strong>${n}</strong><span>${p} · CV</span></span>
    ${estadoPostulacion(e)}
  </li>`).join("");

try {
  const vs = await api.vacantes();
  const v = vs.find((x) => x.empresa_id === 1) || vs[0];
  $("#emp-vacante").innerHTML = v ? vacanteCard(v, { nivelTitulo: "p" }) : "";   // ilustración: no entra en la jerarquía de títulos
} catch {
  $("#emp-vacante").innerHTML = "";
}
