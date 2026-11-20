// EntradaChips: escribir y pulsar Enter o coma añade una etiqueta; × o Retroceso la quitan.
// Mantiene un <input type="hidden"> con los valores separados por comas para el formulario.
import { html, icon } from "../utils.js";

export function chipsEntrada(raiz, { valores = [], max = 15, alCambiar } = {}) {
  const input = raiz.querySelector("input[type=text]");
  const oculto = raiz.querySelector("input[type=hidden]");
  const lista = raiz.querySelector("[data-chips]");
  let items = [...valores];

  const pintar = () => {
    lista.innerHTML = items.map((v, i) => html`<li class="chip-q">${v}<button type="button" data-quitar="${i}" aria-label="Quitar ${v}">${icon("x")}</button></li>`).join("");
    oculto.value = items.join(", ");
    input.placeholder = items.length ? "" : input.dataset.placeholder;
    alCambiar?.(items);
  };
  const agregar = (texto) => {
    const v = texto.trim().replace(/,$/, "");
    if (!v || items.length >= max) return;
    if (items.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    items.push(v);
    pintar();
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); agregar(input.value); input.value = ""; }
    else if (e.key === "Backspace" && !input.value && items.length) { items.pop(); pintar(); }
  });
  input.addEventListener("blur", () => { if (input.value.trim()) { agregar(input.value); input.value = ""; } });
  lista.addEventListener("click", (e) => {
    const b = e.target.closest("[data-quitar]");
    if (!b) return;
    items.splice(Number(b.dataset.quitar), 1);
    pintar();
    input.focus();
  });
  raiz.addEventListener("click", (e) => { if (e.target === raiz) input.focus(); });
  pintar();
  return { valores: () => [...items], poner: (vs) => { items = [...vs]; pintar(); } };
}
