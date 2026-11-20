// Auditoría de accesibilidad sin dependencias. Pégalo en la consola del navegador
// (o ejecútalo con una herramienta de automatización) en cualquier página de la réplica.
// Revisa: contraste WCAG AA del texto, controles sin nombre accesible, campos sin etiqueta,
// imágenes sin alt, IDs duplicados, un solo h1 y saltos en la jerarquía de encabezados.
// Devuelve { errores: [...], avisos: [...] }.
(() => {
  const errores = [], avisos = [];
  const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
  const desc = (el) => `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : ""}`;

  // ── Contraste ─────────────────────────────────────────────────────────
  const rgba = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 }; };
  const mezcla = (arriba, abajo) => ({ r: arriba.r * arriba.a + abajo.r * (1 - arriba.a), g: arriba.g * arriba.a + abajo.g * (1 - arriba.a), b: arriba.b * arriba.a + abajo.b * (1 - arriba.a), a: 1 });
  const lum = ({ r, g, b }) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  // Fondo efectivo: compone las capas translúcidas sobre el fondo de la página (#0a0a0a)
  function fondo(el) {
    const capas = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) { capas.push(c); if (c.a >= 1) break; }
    }
    let base = { r: 10, g: 10, b: 10, a: 1 };
    for (const c of capas.reverse()) base = mezcla(c, base);
    return base;
  }
  const textos = [...document.querySelectorAll("body *")].filter((el) =>
    [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && visible(el) && !el.closest("[aria-hidden=true], .sr-only, .promo__card, .sk"));
  for (const el of textos) {
    const s = getComputedStyle(el);
    const color = rgba(s.color);
    if (!color || color.a === 0) continue;            // texto con relleno de degradado (ilustración)
    const bg = fondo(el);
    const c = ratio(mezcla(color, bg), bg);
    const grande = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && Number(s.fontWeight) >= 700);
    const minimo = grande ? 3 : 4.5;
    if (c < minimo && !el.closest(":disabled, [aria-disabled=true]")) errores.push(`Contraste ${c.toFixed(2)}:1 (< ${minimo}) en ${desc(el)}: «${el.textContent.trim().slice(0, 40)}»`);
  }

  // ── Nombres accesibles ───────────────────────────────────────────────
  const nombre = (el) => (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") && document.getElementById(el.getAttribute("aria-labelledby"))?.textContent || el.textContent || el.title || "").trim();
  document.querySelectorAll("button, a[href], [role=button]").forEach((el) => { if (visible(el) && !nombre(el)) errores.push(`Control sin nombre accesible: ${desc(el)}`); });
  document.querySelectorAll("input:not([type=hidden]), select, textarea").forEach((el) => {
    const etiqueta = el.labels?.length || el.getAttribute("aria-label") || el.getAttribute("aria-labelledby");
    if (!etiqueta) errores.push(`Campo sin etiqueta: ${desc(el)}`);
  });
  document.querySelectorAll("img").forEach((el) => { if (!el.hasAttribute("alt")) errores.push(`Imagen sin alt: ${desc(el)}`); });
  document.querySelectorAll("svg:not([aria-hidden=true])").forEach((el) => { if (!el.closest("[aria-hidden=true]") && !el.getAttribute("aria-label") && !el.querySelector("title") && el.closest("body") && !el.closest("[role=img]")) avisos.push(`SVG sin aria-hidden ni nombre: ${desc(el.parentElement)}`); });

  // ── Estructura ───────────────────────────────────────────────────────
  const ids = {};
  document.querySelectorAll("[id]").forEach((el) => { ids[el.id] = (ids[el.id] || 0) + 1; });
  Object.entries(ids).filter(([, n]) => n > 1).forEach(([id]) => errores.push(`ID duplicado: #${id}`));
  const h1 = [...document.querySelectorAll("h1")].filter((h) => !h.closest("dialog"));
  if (h1.length !== 1) errores.push(`Se esperaba un h1 y hay ${h1.length}`);
  let previo = 0;
  document.querySelectorAll("main h1, main h2, main h3, main h4").forEach((h) => {
    const n = Number(h.tagName[1]);
    if (previo && n > previo + 1) avisos.push(`Salto de encabezado h${previo} → h${n}: «${h.textContent.trim().slice(0, 40)}»`);
    previo = n;
  });
  if (!document.documentElement.lang) errores.push("Falta lang en <html>");
  if (!document.querySelector("main")) errores.push("Falta <main>");
  return { pagina: location.pathname + location.search, errores: [...new Set(errores)], avisos: [...new Set(avisos)] };
})();
