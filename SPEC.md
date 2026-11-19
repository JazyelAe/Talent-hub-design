# SPEC — Réplica de portafolio de TalentHub México

> Estado: **aprobado** el 2026-11-18 (Fase 1). Fuentes: `docs/inventario.md`,
> `docs/design-tokens.md`, capturas en `referencias/capturas/` y el código público del proyecto
> (gitlab.com/talenthub4902147/talenthub-mexico) para las pantallas con sesión.

## 1. Objetivo y alcance

Réplica **estática y navegable** de las pantallas de TalentHub México para portafolio: alta fidelidad
visual, flujos del candidato y de la empresa simulados en el navegador con datos ficticios, sin
backend. Se publica en GitHub Pages.

**Fuera de alcance:** autenticación real, pagos (PayPal), envío de correos, notificaciones push,
panel del validador interno, IA (`IAAspirante`, `IAEmpresa`, `IAValidador`), app móvil.

## 2. Decisiones técnicas

### 2.1 CSS propio con variables, no Tailwind

El original usa Tailwind, pero el requisito es **sin paso de compilación**. Tailwind sin compilar
solo existe como *Play CDN*, que genera el CSS en el navegador en cada carga: su propia
documentación lo desaconseja en producción, pesa ~100 KB de JS y necesita estilos inyectados en
tiempo de ejecución (justo lo que la CSP del sitio real bloquea, ver `DESIGN.md`).

En su lugar: **CSS vanilla con custom properties que llevan los mismos nombres que los tokens de
Tailwind del original** (`--night`, `--canvas`, `--ink`, `--accent-on-dark`, `--radius-card`…).
Así la correspondencia con el diseño original es 1:1 y explicable, sin herramientas.

Organización (capas con `@layer`):

```
css/
  tokens.css      variables de diseño (colores, tipo, espacio, radios, movimiento)
  base.css        reset, tipografía, foco visible, reduced-motion, color-scheme: dark
  layout.css      contenedor 1200px, bandas, grids, breakpoints 640/768/1024
  components.css  botones, campos, tarjetas, tags, chips, diálogos, etc.
  pages/*.css     solo lo propio de cada pantalla
```

### 2.2 HTML multipágina, JS vanilla en módulos ES

- **Una página HTML por pantalla** (no SPA): funciona en GitHub Pages sin reglas de reescritura,
  cada página tiene su `<title>` y el botón Atrás funciona solo. El detalle usa
  `vacante.html?id=…`; los filtros viven en la query (`vacantes.html?q=react&modalidad=remoto`),
  así una búsqueda se puede compartir y recargar.
- Header, footer y aviso de la app se inyectan desde `js/layout.js` para no duplicar marcado.
- `<script type="module">`: módulos nativos, sin bundler.
- Datos con `fetch('data/*.json')` → requiere servirse por HTTP (`python -m http.server`), no
  `file://`. Lo indicará el README.
- Persistencia simulada en `localStorage` (postulaciones nuevas, vacantes publicadas, perfil), con
  botón **"Restablecer demo"**. Nunca se guardan contraseñas.

### 2.3 Efectos del original y cómo se replican

| Original | Réplica | Motivo |
|---|---|---|
| Velo animado WebGL (React Bits *Dark Veil*) | Halos con `radial-gradient` fijos + leve deriva CSS | Sin dependencias; misma lectura visual |
| Grano animado en `/empresas` (*Grainient*) | Degradado + ruido SVG estático | Ídem |
| framer-motion (resortes, `layoutId`) | Transiciones CSS + View Transitions donde aplique | Sin framework |
| Carrusel por scroll del inicio | Carrusel horizontal con `scroll-snap` | Más simple, accesible por teclado |
| Contadores, chispas, borde de luz, "mantener presionado" | Se replican en JS/CSS vanilla | Son firma del diseño |
| Fuentes Bricolage Grotesque + DM Sans | Google Fonts | Mismas fuentes |

## 3. Pantallas a replicar

| # | Archivo | Ruta original | Usuario | Fuente de diseño |
|---|---|---|---|---|
| P1 | `index.html` | `/` | Ambos | Captura |
| P2 | `vacantes.html` | `/vacantes` | Candidato | Captura |
| P3 | `vacante.html?id=` | `/vacantes/:id` | Candidato | Captura |
| P4 | `planes.html` | `/planes` | Ambos | Captura |
| P5 | `empresas.html` | `/empresas` | Empresa | Captura |
| P6 | `privacidad.html` | `/politicas` | Ambos | Captura (texto propio, ficticio y breve) |
| P7 | `login.html` | `/login` | Ambos | Captura · **maqueta** |
| P8 | `registro.html` | `/register` | Ambos | Captura · **maqueta** |
| P9 | `404.html` | `*` | Ambos | Captura (GitHub Pages sirve `404.html` solo) |
| P10 | `mis-postulaciones.html` | `/mis-aplicaciones` | Candidato | Código |
| P11 | `perfil.html` | `/mi-perfil` | Candidato | Código |
| P12 | `empresa/vacantes.html` | `/dashboard` | Empresa | Código |
| P13 | `empresa/publicar.html` | `/dashboard` (formulario) | Empresa | Código |
| P14 | `empresa/postulaciones.html` | `/aplicaciones-empresa` | Empresa | Código |
| P15 | `recuperar.html` | `/olvide-password` | Ambos | Código · maqueta |

**Sesión simulada:** login y registro **no envían ni guardan nada**. Muestran el aviso
*"Demo de portafolio"* y dos accesos: **"Entrar como candidato demo"** y **"Entrar como empresa
demo"**, que solo guardan el rol en `sessionStorage`. Las páginas P10–P14 comprueban el rol y, si
no hay, muestran el estado "Inicia sesión para ver…" del original.

## 4. Componentes reutilizables

| Componente | Variantes / estados | Usado en |
|---|---|---|
| **Navbar** | visitante · candidato · empresa; activo con línea 2px `accent-on-dark`; menú móvil (hamburguesa con `aria-expanded`); barra de carga 2px | Todas salvo AuthShell |
| **Footer** | 4 columnas; colapsa a 2 en móvil | Todas salvo AuthShell |
| **Brand** | monograma "th" 32px + nombre | Navbar, footer, auth |
| **PageHeader** (banda oscura) | familias `explorar`, `ficha`, `venta`, `trabajo`, `lectura`; migas | P2–P6, P10–P14 |
| **Button** | `primary`, `ghost`, `danger`; `sm`/`md`; con icono; `destacado` (borde de luz + chispas); deshabilitado; cargando | Todas |
| **Field / Input** | texto, email, tel, password (mostrar/ocultar), textarea, select, con icono; ayuda; error `role="alert"`; foco con halo | Formularios |
| **ChoiceCards** | radiogroup visual (tipo de cuenta, modalidad) | P8, P13 |
| **EntradaChips** | escribir + Enter/coma para añadir, × para quitar | P11, P13 |
| **Chip de filtro** | activo/inactivo, `aria-pressed` | P2, P14 |
| **SliderSalario** | range nativo con etiqueta de valor | P2 |
| **VacanteCard** | iniciales, título (enlace que cubre la tarjeta), empresa, badge modalidad, salario `tabular-nums`, extracto, ≤3 tecnologías, ciudad, fecha relativa; hover con reflejo | P1, P2, P5, P12 |
| **Iniciales** | 5 tintes (azul, teal, violeta, rosa, neutro) derivados del nombre | Tarjetas, detalle |
| **Tag** | `neutro`, `curso`, `bien`, `mal` (contorno, sin relleno) | Modalidad, estados |
| **ProcessTrack** | 3 segmentos; solo el último alcanzado lleva color | P10, P14, maqueta P1 |
| **Línea de tiempo** | eventos de seguimiento (enviada, revisión, entrevista…) | P10 |
| **PlanCard** | gratis / destacado | P4 |
| **Tabs** (segmentado) | indicador que se desliza, roving tabindex | P4, P14 |
| **Dialog** | `<dialog>` nativo, foco atrapado, Esc cierra, consecuencia explícita | P3, P12, P14 |
| **BotonMantener** | mantener 1.2 s (ratón, Espacio, Enter) para acciones destructivas | P12, P14 |
| **Toast** | éxito / error, `aria-live` | Acciones |
| **EmptyState** | icono, título, texto, acción | P2, P10, P12, P14 |
| **ErrorState** | "No pudimos cargar…" + **Reintentar** | Listas |
| **Skeleton** | tarjeta, detalle, fila | Listas, detalle |
| **AvisoLento** | "Despertando el servidor · N s" a los 4 s; "Reintentar" al minuto | Listas (simulado) |
| **AuthShell** | tarjeta de vidrio sin nav ni footer | P7, P8, P15 |
| **AvisoDemo** | banda "Demo de portafolio" | Auth, global |
| **AppPromo** | tarjeta flotante (escritorio) / barra inferior (móvil), minimizable | Páginas públicas |

## 5. Datos de ejemplo (`/data`)

Todo **ficticio** (nombres de empresas inventados distintos a los del sitio, textos propios):

- `vacantes.json` — ~60 vacantes: id, título, nivel (Jr/Mid/Sr), empresa_id, modalidad, ciudad,
  salario_min, salario_max, tecnologías[], experiencia, requisitos, descripción, fecha.
- `empresas.json` — ~12 empresas ficticias.
- `postulaciones.json` — postulaciones del candidato demo en distintos estados y con eventos.
- `candidatos.json` — postulantes ficticios para la vista de empresa.
- `planes.json` — planes de empresa y de aspirante.

**Simulación de red** (`js/api.js`): retardo artificial configurable, y parámetros de URL para
demostrar estados: `?demo=lento` (aviso "Despertando el servidor"), `?demo=error`
(estado de error con Reintentar), `?demo=vacio`.

## 6. Flujos de usuario

### Candidato
1. **Buscar:** Inicio → escribe puesto/ciudad → Vacantes con filtros aplicados → ajusta filtros →
   pagina → abre detalle.
2. **Postularse:** Detalle → "Postularme" → (sin sesión: login demo y regreso a la vacante) →
   diálogo de postulación con validación → confirmación (toast) → botón cambia a "Ya te postulaste".
3. **Seguir:** Mis postulaciones → filtra por estado → ve ProcessTrack y línea de tiempo →
   abre la vacante.
4. **Perfil:** Mi perfil → edita datos, habilidades (chips) y CV → aviso "Cambios sin guardar" →
   Guardar.

### Empresa
1. **Conocer:** Para empresas → Planes → Registro (maqueta, tipo "Publico vacantes").
2. **Publicar:** Mis vacantes → "Publicar vacante" → formulario con validación (salario máx ≥ mín,
   tecnologías obligatorias) → vista previa de la tarjeta → publicar → aparece "En revisión".
3. **Gestionar:** Mis vacantes → pausar / editar / eliminar (mantener + diálogo).
4. **Responder:** Postulaciones recibidas → filtra (Todas / Sin abrir / En revisión / Aceptadas /
   Rechazadas) → aceptar → ver contacto → agendar entrevista; o rechazar (mantener + diálogo) →
   el estado se refleja en "Mis postulaciones" del candidato (mismo `localStorage`).

## 7. Interacciones a simular

- Búsqueda en vivo con *debounce* (250 ms) y sincronización con la URL.
- Filtros combinables, contador "N vacantes", botón "Limpiar filtros".
- Paginación (ver pregunta 1).
- Estados de carga (skeleton), vacío, error con reintentar y "servidor despertando".
- Validación de formularios: en `blur` y al enviar; foco al primer error; mensajes con
  `aria-describedby` y `role="alert"`; validador de contraseña visual en registro (sin guardarla).
- Diálogos con foco atrapado y retorno de foco; Esc cierra.
- Toasts con `aria-live="polite"`.
- Menú móvil, menú de cuenta, aviso de la app minimizable.
- Persistencia demo en `localStorage` + "Restablecer demo".

## 8. Responsivo y accesibilidad

- **Mobile-first**; breakpoints 640 / 768 / 1024 px; contenido hasta 1200 px; texto de lectura 896 px.
  Se verifica a 390, 768 y 1440 px.
- **WCAG AA:** se usan los pares de color ya medidos en `DESIGN.md`; ningún texto con `#3355ff`.
- Teclado: todo operable, orden lógico, *skip link* "Saltar al contenido", foco visible
  (`outline` + halo `focus-accent-d`).
- Formularios con `<label>` asociado, `autocomplete`, campos obligatorios marcados en texto.
- Imágenes con `alt`; iconos decorativos con `aria-hidden="true"`.
- `prefers-reduced-motion`: se quita desplazamiento, no la retroalimentación.
- HTML semántico: `header`, `nav`, `main`, `article` (tarjeta), `aside`, `footer`, un `h1` por página.

## 9. Criterios de aceptación (por pantalla)

1. Se parece a su captura a 1440 y 390 px (comparación lado a lado).
2. Funciona con teclado y sin errores en consola.
3. Pasa una revisión con Lighthouse/axe sin errores de accesibilidad.
4. Tiene estados de carga, vacío y error si muestra una lista.
5. Solo usa datos ficticios de `/data`.

## 10. Decisiones aprobadas

1. **Tecnología y nivel:** dos desplegables en la barra de filtros; en móvil, botón "Filtros" que
   abre un panel.
2. **Rango salarial:** slider de doble manija (mínimo y máximo).
3. **Paginación:** paginación numerada (12 por página) con "Ves 13–24 de N vacantes". Se descarta
   combinarla con "Ver más": dos mecanismos para lo mismo confunden (heurística de consistencia).
   La página vive en la URL (`&pagina=2`) y al cambiarla el foco va al encabezado de resultados.
4. **Postulación:** diálogo con CV (el del perfil o PDF ≤ 5 MB), mensaje opcional (≤ 500
   caracteres) y consentimiento, con validación.
5. **Iconos:** se descargan ~30 SVG de Phosphor (MIT) a `assets/icons/`.
6. **Aviso de la app:** se incluye, sin QR real ni enlace a Play Store (QR decorativo).
7. **Pantallas sin captura:** se componen con el sistema de diseño a partir del código; se mostrará
   cada una para validación al terminar su tarea.
