# PLAN — Implementación de la réplica

> Estado: **aprobado**. Avance: **T00–T21 completadas** (ver [bitácora](docs/bitacora.md)); siguiente: T22.
> Basado en `SPEC.md` (aprobado).

## Reglas de ejecución

- **Una tarea = un commit** (Conventional Commits en español: `feat:`, `fix:`, `style:`, `docs:`,
  `chore:`, `refactor:`), en la rama `main` salvo que indiques otra.
- Al terminar cada tarea: verificación en el navegador a **390 y 1440 px** (y 768 px en las
  pantallas), revisión con teclado y consola sin errores; después, explicación de 3–5 líneas de las
  decisiones tomadas.
- Servidor local para probar: `python -m http.server 8000` (ya instalado; no añade dependencias).
- Orden: **cimientos → componentes → pantallas públicas → sesión demo → candidato → empresa →
  pulido → documentación**. Cada pantalla solo usa componentes ya hechos.
- Los IDs `P#` de las pantallas son los de `SPEC.md` §3.

## Etapa A — Cimientos

| # | Tarea | Archivos | Hecho cuando… | Commit |
|---|---|---|---|---|
| T00 | Estructura del repo y documentos de las fases 0–2 | `.gitignore`, `docs/`, `referencias/`, `SPEC.md`, `PLAN.md`, carpetas vacías | El árbol de carpetas existe y está commiteado | `chore: estructura inicial y documentos de relevamiento` |
| T01 | Tokens de diseño en CSS | `css/tokens.css` | Todas las variables de `design-tokens.md` (color, tipo, espacio, radios, sombras, blur, movimiento) | `feat: tokens de diseño como variables CSS` |
| T02 | Base: reset, fuentes, tipografía, foco visible, *skip link*, reduced-motion, halos de página | `css/base.css`, `css/layout.css` | Página de prueba con escala tipográfica y foco visible | `feat: estilos base y tipografía` |
| T03 | Iconos Phosphor duotone (~30 SVG) en sprite | `assets/icons/sprite.svg`, `assets/icons/LICENSE` | Se ven con `<svg><use href>`; licencia MIT incluida | `chore: sprite de iconos Phosphor` |
| T04 | Datos ficticios | `data/vacantes.json` (~60), `empresas.json`, `postulaciones.json`, `candidatos.json`, `planes.json` | JSON válido; ningún dato real del sitio | `feat: datos de ejemplo ficticios` |
| T05 | API simulada, almacenamiento demo y utilidades | `js/api.js`, `js/store.js`, `js/utils.js` | Retardo, `?demo=lento/error/vacio`, `localStorage` + restablecer, formato MXN y fechas relativas | `feat: capa de datos simulada` |

## Etapa B — Componentes

| # | Tarea | Archivos | Hecho cuando… | Commit |
|---|---|---|---|---|
| T06 | Navbar (visitante/candidato/empresa, activo, menú móvil, barra de carga), Brand y Footer | `js/layout.js`, `css/components/nav.css`, `footer.css` | Igual a la captura en ambos anchos; menú móvil operable con teclado | `feat: navegación, marca y pie de página` |
| T07 | Botones (primary, ghost, danger, sm/md, icono, destacado con borde de luz y chispas) | `css/components/button.css`, `js/components/chispas.js` | Página de muestra con todas las variantes y estados | `feat: componente botón` |
| T08 | Tag, Iniciales, chips de filtro | `css/components/tag.css` | Tonos neutro/curso/bien/mal; 5 tintes de iniciales deterministas | `feat: etiquetas, iniciales y chips` |
| T09 | Campos de formulario y validación | `css/components/field.css`, `js/components/form.js` | Texto, email, tel, password (mostrar), textarea, select, con icono; errores con `role="alert"`; foco al primer error | `feat: campos de formulario con validación` |
| T10 | PageHeader (familias de banda) y tarjeta de vidrio | `css/components/band.css`, `card.css` | Las 5 familias se distinguen; vidrio con blur y filo | `feat: bandas de página y tarjetas de vidrio` |
| T11 | VacanteCard | `js/components/vacante-card.js`, `css/components/vacante-card.css` | Igual a la captura; un solo enlace por tarjeta; reflejo en hover | `feat: tarjeta de vacante` |
| T12 | Estados: skeleton, vacío, error con reintentar, aviso "Despertando el servidor", toasts | `js/components/estados.js`, `toast.js`, `css/components/estados.css` | Los 4 estados visibles con `?demo=` | `feat: estados de carga, vacío y error` |
| T13 | Diálogo accesible y BotonMantener | `js/components/dialog.js`, `mantener.js` | Foco atrapado y devuelto, Esc; mantener 1.2 s con ratón y teclado | `feat: diálogo y botón de mantener presionado` |

## Etapa C — Pantallas públicas

| # | Tarea | Pantalla | Hecho cuando… | Commit |
|---|---|---|---|---|
| T14 | Inicio | P1 `index.html` | Hero con titular giratorio, buscador que lleva a vacantes, carrusel, pasos, maqueta de postulaciones, bloque empresas | `feat: pantalla de inicio` |
| T15 | Vacantes: búsqueda y filtros | P2 `vacantes.html` | Texto, ciudad, modalidad, tecnología, nivel, rango salarial doble; URL sincronizada; panel "Filtros" en móvil | `feat: listado de vacantes con filtros` |
| T16 | Vacantes: paginación y estados | P2 | Paginación numerada accesible, "Ves X–Y de N", vacío "Ninguna vacante coincide" + limpiar | `feat: paginación y estados del listado` |
| T17 | Detalle de vacante | P3 `vacante.html` | Membrete, resumen y tarjeta de acción sobre la banda; skeleton; 404 de vacante inexistente | `feat: detalle de vacante` |
| T18 | Planes | P4 `planes.html` | Empresas y aspirantes apilados como en el original (se descartaron las pestañas), tarjetas de plan; "Contratar" muestra aviso de demo | `feat: pantalla de planes` |
| T19 | Para empresas | P5 `empresas.html` | Hero con grano, pasos, panel de postulaciones de ejemplo, cierre | `feat: landing para empresas` |
| T20 | Privacidad y 404 | P6 `privacidad.html`, P9 `404.html` | Texto ficticio con índice; 404 con número ilustrativo y buscador | `feat: aviso de privacidad y página 404` |
| T21 | Aviso "Descarga la app" | `js/components/app-promo.js` | Tarjeta flotante / barra móvil, minimizable, QR decorativo | `feat: aviso de la app móvil` |

## Etapa D — Sesión demo

| # | Tarea | Pantalla | Hecho cuando… | Commit |
|---|---|---|---|---|
| T22 | AuthShell, aviso "Demo de portafolio" y sesión por rol | `js/session.js`, `css/components/auth.css` | Rol en `sessionStorage`; páginas privadas muestran "Inicia sesión…" sin rol | `feat: sesión simulada por rol` |
| T23 | Login y recuperar contraseña | P7 `login.html`, P15 `recuperar.html` | No envían nada; validan formato; accesos "Entrar como candidato/empresa demo" | `feat: maquetas de inicio de sesión y recuperación` |
| T24 | Registro | P8 `registro.html` | ChoiceCards de tipo de cuenta, validador visual de contraseña, nada se guarda | `feat: maqueta de registro` |

## Etapa E — Flujo del candidato

| # | Tarea | Pantalla | Hecho cuando… | Commit |
|---|---|---|---|---|
| T25 | Postulación desde el detalle | P3 + diálogo | CV del perfil o PDF ≤ 5 MB, mensaje ≤ 500, consentimiento; guarda en `localStorage`; "Ya te postulaste" | `feat: postulación con validación` |
| T26 | Mis postulaciones | P10 `mis-postulaciones.html` | Filtro por estado, ProcessTrack, línea de tiempo, estados vacío/error | `feat: seguimiento de postulaciones` |
| T27 | Mi perfil | P11 `perfil.html` | Edición con EntradaChips, CV, "Cambios sin guardar", guardar | `feat: perfil del candidato` |

## Etapa F — Flujo de la empresa

| # | Tarea | Pantalla | Hecho cuando… | Commit |
|---|---|---|---|---|
| T28 | Mis vacantes | P12 `empresa/vacantes.html` | Métricas con contador, lista con estado (En revisión/Publicada/Pausada), pausar y eliminar (mantener + diálogo) | `feat: panel de vacantes de la empresa` |
| T29 | Publicar vacante | P13 `empresa/publicar.html` | Validación (máx ≥ mín, tecnologías), vista previa de tarjeta, publica "En revisión" | `feat: publicación de vacante` |
| T30 | Postulaciones recibidas | P14 `empresa/postulaciones.html` | Filtros por estado, aceptar/rechazar/reabrir, contacto tras aceptar, agendar entrevista; se refleja en P10 | `feat: gestión de postulaciones recibidas` |

## Etapa G — Pulido y publicación

| # | Tarea | Hecho cuando… | Commit |
|---|---|---|---|
| T31 | Auditoría de accesibilidad y responsivo (axe/Lighthouse, 390/768/1440, teclado) | Sin errores de axe; contraste AA; ajustes aplicados | `fix: ajustes de accesibilidad y responsivo` |
| T32 | Capturas de la réplica | `docs/capturas/` a 1440 y 390 px de cada pantalla | `docs: capturas de la réplica` |
| T33 | Preparar GitHub Pages | `.nojekyll`, rutas relativas verificadas | `chore: configuración para GitHub Pages` |

> **Publicar** (push a GitHub y activar Pages) es una acción externa: te pediré confirmación en ese
> momento. El repo es **privado**; GitHub Pages en repos privados requiere plan de pago, así que
> quizás haya que hacerlo público (lo decidimos al llegar).

## Etapa H — Documentación (Fase 4)

| # | Tarea | Commit |
|---|---|---|
| T34 | `docs/design-tokens.md` explicado (paleta, tipografía, espaciado y su porqué) | `docs: explicación de tokens de diseño` |
| T35 | `docs/user-flows.md` con diagramas Mermaid de candidato y empresa | `docs: flujos de usuario` |
| T36 | `docs/ux-decisions.md` por pantalla (objetivo, usuario, flujo, decisiones, Nielsen, accesibilidad, mobile-first, capturas) | `docs: decisiones de experiencia de usuario` |
| T37 | `docs/proceso.md`: prototipar en HTML vs Figma | `docs: proceso de prototipado en HTML` |
| T38 | `README.md` en español con aviso, rol, capturas, índice, ejecución local y Pages | `docs: README del proyecto` |

**Total:** 39 tareas. Las pantallas sin captura (P10–P15) te las mostraré al terminar su tarea
para que las valides antes de seguir.
