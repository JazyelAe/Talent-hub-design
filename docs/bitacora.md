# Bitácora de implementación (Fase 3)

Decisiones tomadas en cada tarea del [PLAN](../PLAN.md), en 3–5 líneas. Cada tarea es un commit (Conventional Commits en español).

## Etapa A — Cimientos

**T00 · Estructura.** El repo de GitHub estaba vacío; se clonó y se commitearon primero los documentos de las fases 0–2 (inventario, capturas, tokens, SPEC, PLAN), así el historial empieza con la investigación y no con el código. `.playwright-mcp/` y `referencias/privado/` quedan fuera de git.

**T01 · Tokens.** Las variables CSS usan los **mismos nombres que el `tailwind.config.js` original** (`--night`, `--canvas`, `--ink`, `--accent-on-dark`…), para que la correspondencia sea 1:1 y explicable. La escala tipográfica usa `clamp()`: el rol (display, h1, h2) se mantiene y el tamaño fluye con el ancho. Cada color de texto lleva anotado su contraste.

**T02 · Base.** `@layer` (reset → tokens → base → layout → components → pages) hace la cascada predecible sin pelear especificidad. Las fuentes de respaldo llevan `size-adjust` medido para que el titular no salte al cargar la fuente real. El foco es siempre visible y `prefers-reduced-motion` quita desplazamiento pero conserva la retroalimentación.

**T03 · Iconos.** Se descargaron solo los 55 iconos Phosphor *duotone* necesarios (licencia MIT incluida) a un sprite SVG: una sola petición, se tiñen con `currentColor` y no hay dependencia de una librería JS. Todos llevan `aria-hidden`.

**T04 · Datos.** Un script con semilla fija (`tools/gen_data.py`) genera 64 vacantes, 12 empresas y postulaciones **ficticias**; los nombres de empresa son inventados y distintos a los del sitio. Ser determinista permite regenerarlos idénticos y explicar de dónde sale cada dato.

**T05 · API simulada.** `js/api.js` imita una API: retardo de red, y modos `?demo=lento|error|vacio` para demostrar cada estado en vivo. Lo que hace la persona (postular, publicar, aceptar) se guarda en `localStorage` y se mezcla con los JSON, así ambos flujos se conectan; nunca se guardan contraseñas. Las fechas relativas se calculan contra una "fecha de hoy" fija para que "hace 3 días" siga siendo cierto.

## Etapa B — Componentes

**T06 · Navegación.** Nav de vidrio de 64 px con el enlace activo marcado por una línea de 2 px (`aria-current`), variantes por rol, menú móvil y de cuenta como *disclosure* (Esc y clic fuera cierran, el foco regresa). Se inyecta desde JS para no duplicar marcado en cada página; el footer incluye el aviso "Demo de portafolio".

**T07 · Botones.** Siempre en píldora; `primary` uno por sección, `ghost` para lo secundario y `danger` solo para confirmar algo destructivo. Todo botón que ejecuta o navega lleva icono; "Cancelar" no, para que sea la salida tranquila. El "destacado" (borde de luz + chispas) se reserva para los momentos de conversión.

**T08 · Tags e iniciales.** Los tags son de contorno y **no hay tono azul**: un tag azul parecería botón. Teal = resuelto a favor, rojo = en contra; el ámbar no se usa como estado porque con daltonismo rojo-verde se confunde con el rojo. Las iniciales reciben un tinte determinista por nombre.

**T09 · Formularios.** Se apoya en la validación nativa del navegador, con mensajes propios en español, `aria-invalid`, `aria-describedby` y `role="alert"`. Valida al salir del campo (no mientras escribes la primera vez) y al enviar lleva el foco al primer error. Reglas extra declarativas con `data-*` (igual a otro campo, mínimo ≤ máximo, PDF ≤ 5 MB).

**T10 · Bandas y vidrio.** Cada página abre con una banda oscura de una de cinco "familias" (explorar, ficha, venta, trabajo, lectura) que cambian halo, velo y altura, para que ninguna se lea igual que su vecina. El velo WebGL del original se aproxima con degradados CSS. Profundidad sin sombras: translucidez, filo superior y paneles que cruzan el borde de la banda.

**T11 · Tarjeta de vacante.** El enlace del título cubre toda la tarjeta con `::after`, así un lector de pantalla anuncia **un solo enlace** y el foco enmarca la tarjeta completa. El salario usa cifras tabulares. El reflejo al pasar el cursor solo existe con `(hover: hover)`.

**T12 · Estados.** Cada lista tiene carga (skeleton), vacío, error con "Reintentar" y, a los 4 s, el aviso "Despertando el servidor · N s" del original (el servidor real se duerme en el plan gratuito). Los segundos están ocultos a lectores de pantalla para que el estado se anuncie una vez. Toasts con `aria-live`.

**T13 · Diálogo y mantener.** `<dialog>` nativo: `showModal()` ya atrapa el foco y vuelve inerte la página; se añadió devolver el foco y foco inicial en "Cancelar". Las acciones destructivas piden **mantener presionado 1.2 s** (también con Espacio/Enter) y luego un diálogo que nombra la consecuencia en vez de "¿estás seguro?".

## Etapa C — Pantallas públicas

**T14 · Inicio.** Hero con la palabra giratoria que **solo nombra stacks que tienen vacantes** (el titular nunca promete lo que no hay) y que nunca se desvanece porque es el LCP. El carrusel por scroll fijo del original se sustituyó por `scroll-snap` horizontal: mismo efecto visual, sin secuestrar el scroll y operable con flechas.

**T15 · Filtros.** Búsqueda en vivo con *debounce* que ignora acentos ("merida" encuentra "Mérida"), filtros combinables y **todo el estado en la URL**, así una búsqueda se puede compartir y recargar. Tecnología, nivel y rango (añadidos a petición) se derivan de los datos. En móvil quedan detrás de "Más filtros" para no empujar los resultados.

**T16 · Paginación.** Numerada (12 por página) en lugar de "Ver más", por decisión aprobada; dos mecanismos para lo mismo romperían la consistencia. La página vive en la URL (funciona Atrás) y al cambiarla el foco va al encabezado de resultados para que el lector de pantalla no se pierda.

**T17 · Detalle.** La banda y el membrete aparecen desde el primer cuadro en *skeleton* para que nada salte al llegar los datos. La tarjeta "¿Te interesa?" cambia por rol (visitante, candidato, empresa) y queda fija al hacer scroll. Vacante inexistente → estado propio con salida a vacantes abiertas.

**T18 · Planes.** El plan decía pestañas, pero el original **apila** empresas y aspirantes; se priorizó la fidelidad. El precio usa la cara de texto con cifras tabulares (es dato, no titular). "Contratar" abre un diálogo que aclara que la demo no procesa pagos.

**T19 · Para empresas.** El grano azul-violeta (identidad de esta página) se hace con degradados y ruido SVG estático; se enmascaró el ruido igual que el degradado para evitar una franja gris. Las piezas del hero son producto real de la demo (una vacante) y una postulación marcada "vista de ejemplo".

**T20 · Privacidad y 404.** El aviso de privacidad es un texto **propio** que explica qué guarda la demo, no una copia del legal real. En la 404, el número gigante es ilustración (`aria-hidden`) y el `h1` real sigue la escala; la página fija su `<base>` porque GitHub Pages la sirve en cualquier ruta.

**T21 · Aviso de la app.** En escritorio ocupa su columna de 340 px y la página se reacomoda con transición al minimizarlo; en móvil es una barra inferior. Solo lo ven visitantes, se recuerda si lo cerraste, y el QR es decorativo con un botón que explica que la app real es solo para testers.

## Etapa D — Sesión demo

**T22 · Sesión simulada.** El "inicio de sesión" solo guarda el rol (`candidato` o `empresa`) en `sessionStorage`; no hay credenciales en ningún lado. Las páginas privadas llaman a `exigirRol()`, que muestra el estado «Inicia sesión para ver…» del original con un acceso demo en un clic. El destino `?volver=` solo acepta rutas internas, para evitar redirecciones abiertas.

**T23 · Login y recuperar.** Son maquetas honestas: validan el formato, dicen que no hay cuentas reales y **vacían la contraseña del campo al enviar**. El foco va a los accesos demo, que respetan `?volver=` (si venías de una vacante, regresas a ella).

**T24 · Registro.** El tipo de cuenta usa tarjetas de opción (un radiogroup real con los radios ocultos) porque es una decisión de dos opciones que ramifica el formulario. Las reglas de contraseña se marcan al cumplirse y se anuncian a lectores de pantalla. El botón no se deshabilita: un botón gris no explica qué falta.

## Etapa E — Flujo del candidato

**T25 · Postulación.** Es un diálogo con el CV del perfil por defecto (sin repetir datos), la opción de subir un PDF validado (tipo y ≤ 5 MB, sin subirlo a ningún lado), un mensaje opcional y consentimiento obligatorio. Al enviar, un toast y la tarjeta cambian a «Ya te postulaste».

**T26 · Mis postulaciones.** El ProcessTrack grande con etiquetas reemplaza al punto de color. Las métricas cuentan hacia arriba al aparecer (sin animación con reduced-motion) y el historial va en `<details>` (accesible sin JavaScript extra). El filtro de estado vive en la URL.

**T27 · Perfil.** Una barra fija de «Cambios sin guardar» aparece solo cuando hay diferencias con lo guardado; hay aviso del navegador al salir con cambios. Las habilidades son chips (Enter o coma) y quitar el CV usa mantener presionado más un diálogo. Se corrigió un error del componente de chips: avisaba de un cambio durante su propio pintado inicial.

## Etapa F — Flujo de la empresa

**T28 · Mis vacantes.** Pausar es reversible y directo; eliminar exige mantener presionado y el diálogo dice cuántas personas se enteran. La API se extendió para que las postulaciones del candidato demo a la empresa demo aparezcan aquí, y para que las decisiones de la empresa vuelvan a «Mis postulaciones»: los dos flujos se demuestran en una sola pestaña.

**T29 · Publicar.** La vista previa en vivo de la tarjeta muestra el resultado mientras se escribe. La validación nativa y la propia (tecnologías en chips, modalidad) se muestran a la vez, no una por una. La vacante queda «En revisión». Las píldoras de modalidad usan `:has(input:checked)` en vez de un `aria-checked` inválido sobre un `<label>`.

**T30 · Postulaciones recibidas.** Las acciones dependen del estado (revisar → aceptar o rechazar → entrevista o reabrir). El contacto se revela solo al aceptar. La entrevista valida fecha futura y horario, y rechazar con entrevista agendada lo dice en el diálogo. Se verificó el ciclo completo candidato → empresa → candidato.

## Etapa G — Pulido y publicación

**T31 · Auditoría.** No se permitió cargar axe-core desde un CDN en el navegador de pruebas, así que escribí una auditoría propia (`tools/auditoria.js`): contraste WCAG con composición de capas translúcidas, nombres accesibles, etiquetas, IDs, `h1` y jerarquía. Más un modo de QA que revisa 20 pantallas a 390/768/1440 px. Encontró y se corrigieron: el desborde de Planes en tableta, la falta de `h1` durante la carga del detalle y saltos de encabezado en tarjetas ilustrativas.

**T32 · Capturas.** `--screenshot` de Chrome headless capturaba antes de que corriera el JavaScript y no respetaba 390 px. La solución fue un cliente mínimo del protocolo DevTools con la librería estándar de Python (WebSocket propio): emula el ancho real, espera a que no haya skeletons y captura la página completa. Resultado: 40 capturas reproducibles con un comando.

**T33 · GitHub Pages.** Todas las rutas son relativas (funcionan bajo `/Talent-hub-design/`), `.nojekyll` para servir los archivos tal cual, y la 404 fija su `<base>`. Se añadió `?como=candidato|empresa` para enlazar directo a las vistas privadas desde el README.

## Etapa H — Documentación

**T34–T38.** Tokens explicados con su porqué y contraste medido; flujos en Mermaid; decisiones de UX por pantalla con heurísticas de Nielsen y WCAG; el proceso HTML vs Figma; y el README con aviso, rol, capturas, índice y ejecución local.

## Apoyos añadidos fuera del plan

- `componentes.html`: guía viva de componentes con todas sus variantes y estados (útil para revisión y para mostrar el sistema).
- `tools/auditoria.js` y `tools/capturas.py` (con `--revisar`): QA y capturas automáticas sin dependencias.
- `?como=candidato|empresa`: enlace directo a las vistas privadas con la cuenta demo.
- `tools/servidor.py`: servidor local con `Cache-Control: no-store`, porque el servidor estándar de Python dejaba CSS en caché del navegador durante el desarrollo.
