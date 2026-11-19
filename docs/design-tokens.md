# Design tokens — TalentHub México

> Extraídos el 2026-11-18 de los **estilos computados** de https://www.talent-hub.me (páginas
> públicas: `/`, `/vacantes`, `/login`) con Playwright, a 1440 px y 390 px.
> Esta es la versión "en bruto" de la Fase 0; en la Fase 4 se amplía con la explicación de diseño.

## Contraste con la fuente oficial

Después de medir, encontré el código del proyecto en
[gitlab.com/talenthub4902147/talenthub-mexico](https://gitlab.com/talenthub4902147/talenthub-mexico):
su `DESIGN.md` y `frontend/tailwind.config.js` son la guía de estilo oficial. **Mis mediciones
coinciden**; estos son los tokens que el código aclara o que no aparecían en las páginas públicas:

| Token oficial (Tailwind) | Valor | Nota |
|---|---|---|
| `night` | `#0a0a0a` | Fondo de página (coincide) |
| `canvas` | `#141416` | Tarjetas y campos **opacos** (pantallas con sesión, tablas) |
| `surface` | `#0f0f11` | Bandas alternas, fondo de controles segmentados |
| `elevated` | `#161616` | Tarjeta opaca dentro de banda oscura (coincide) |
| `ink` / `ink-2` / `muted` / `muted-d` | `#ededed` / `#c2c2c2` / `#8f8f8f` / `#8a8a8a` | Todos pasan AA. El `#6b6b6b` que medí no es un token del sistema (probablemente texto decorativo de la maqueta del teléfono) |
| `accent` / `accent-hover` / `accent-on-dark` | `#3355ff` / `#2544e6` / `#9db0ff` | El azul **nunca** va como texto sobre oscuro (3.4:1); como texto se usa `accent-on-dark` |
| `ok` | `#5eead4` | Resuelto a favor: aceptada, publicada, remoto |
| `danger` / `danger-fill` / `danger-fill-hover` | `#f87171` / `#dc2626` / `#b91c1c` | Rechazada/error (texto) y botón destructivo (relleno) |
| `warn` | `#fcd34d` | Solo avisos de formulario, **nunca** un estado (daltonismo) |
| `hairline` / `hairline-strong` | `rgba(255,255,255,.10)` / `.18` | Bordes |
| Escala tipográfica | display 52 · h1 48 · h2 36 · h3 24 · sub 18 · body 16 · caption 13 | Con `clamp()`: por eso medí h1 = 38px y h2 = 32px |
| Pesos | `book` 460 · `mid` 500 · `demi` 540 | |
| Radios | `pill` 9999 · `card` 24 · `cardlg` 40 · `panel` 42 · `nav` 19 · `ui` 10 · `icon` 4 | |
| Sombras | `glass-edge-d` `inset 0 1px 0 rgba(255,255,255,.14)` · `focus-accent-d` `0 0 0 3px rgba(157,176,255,.24)` | No hay sombras de elevación |
| Desenfoque | card 22px · nav 16px · overlay 28px | Vidrio con `saturate(1.6)` |
| Curva | `cubic-bezier(.22,.61,.36,1)` · 0.18s / 0.42s / 0.75s | Única curva CSS |
| Contenedor | `max-width: 1200px`, gutters 24px (28px desde `md`); lectura 896px | |
| Iconos | Phosphor, estilo *duotone* | |

Principios de diseño explícitos en `DESIGN.md` que guiarán la réplica: vidrio sobre halos de color,
un solo color de acción, color de estado solo para *resolución* (teal/rojo), progreso por posición
(`ProcessTrack`), botones con icono salvo "Cancelar", cada lista con estados de carga, vacío y error.

## Hallazgos técnicos

- El sitio usa **Tailwind CSS** con tema propio (clases como `text-ink`, `text-body`), breakpoints por
  defecto de Tailwind y prefijos `--tw-*`. Las notificaciones usan la librería *Sileo* (`--sileo-*`).
- **Tema oscuro único** (no hay modo claro).
- Grosor tipográfico variable (fuentes variables 100–900): pesos no estándar como **460** y **540**.
- Respeta `prefers-reduced-motion` y usa `(hover: hover)` para no aplicar hovers en táctil.

## Color

### Superficies
| Token propuesto | Valor | Uso observado |
|---|---|---|
| `--color-bg` | `#0a0a0a` | Fondo de `body` y del header |
| `--color-bg-raised` | `#161616` | Superficies sólidas (menús, avisos) |
| `--color-surface` | `rgba(255,255,255,.06)` | Tarjetas de vacante (el valor más usado) |
| `--color-surface-2` | `rgba(255,255,255,.04)` | Superficie sutil (barra de filtros) |
| `--color-input-bg` | `rgba(255,255,255,.07)` | Campos de formulario |
| `--color-overlay` | `rgba(10,10,10,.6–.7)` | Header translúcido / overlays |
| `--color-light-surface` | `#f1f3f8` | Tarjeta flotante "Descarga la app" (única superficie clara) |

### Texto
| Token | Valor | Uso | Contraste sobre `#0a0a0a` |
|---|---|---|---|
| `--color-ink` | `#ededed` | Texto principal, títulos | ≈ 16.8:1 ✅ |
| `--color-ink-2` | `#c2c2c2` | Etiquetas, chips de tecnología | ≈ 11.3:1 ✅ |
| `--color-muted` | `#8f8f8f` | Metadatos (empresa, ciudad, fecha) | ≈ 6.2:1 ✅ |
| `--color-muted-2` | `#8a8a8a` | Variante de metadatos | ≈ 5.8:1 ✅ |
| `--color-subtle` | `#6b6b6b` | Texto terciario | ≈ 3.7:1 ⚠️ **no pasa AA en texto normal** |

> ⚠️ `#6b6b6b` solo es válido para texto grande o decorativo. En la réplica lo subiré a `#8a8a8a`
> en texto pequeño (lo documentaré como mejora de accesibilidad).

### Marca y acentos
| Token | Valor | Uso |
|---|---|---|
| `--color-primary` | `#3355ff` | CTA "Registrarse", botón "Iniciar sesión", anillo de foco |
| `--color-primary-soft` | `#9db0ff` | Chip de filtro activo ("Todas"), enlaces, borde de foco |
| `--color-primary-softer` | `#b4c2ff` | Variante de texto de acento |
| `--color-primary-tint` | `rgba(51,85,255,.08)` | Fondo de chip activo |
| `--color-teal` | `#5eead4` / `#7eecd9` | Badge **Remoto** (texto) |
| `--color-teal-bg` | `rgba(45,212,191,.14)` | Fondo de avatar/badge teal |
| `--color-teal-border` | `rgba(94,234,212,.35)` | Borde del badge Remoto |
| `--color-violet` | `#cfc2ff` | Avatares de empresa (variante violeta) |
| `--color-violet-bg` | `rgba(167,139,250,.16)` | Fondo avatar violeta |
| Botón primario: texto | `#ffffff` sobre `#3355ff` | ≈ 5.4:1 ✅ |

### Bordes
| Token | Valor |
|---|---|
| `--border-subtle` | `rgba(255,255,255,.08)` (tarjetas) |
| `--border-default` | `rgba(255,255,255,.10)` (inputs, separadores) |
| `--border-strong` | `rgba(255,255,255,.18)` (badges Híbrido/Presencial, botones secundarios) |

### Estados (toasts, librería Sileo — en OKLCH)
| Estado | Valor |
|---|---|
| success | `oklch(.723 .219 142.1)` (verde) |
| error | `oklch(.637 .237 25.3)` (rojo) |
| warning | `oklch(.795 .184 86.0)` (ámbar) |
| info | `oklch(.685 .169 237.3)` (azul cielo) |
| loading | `oklch(.556 0 0)` (gris) |

Los estados de postulación ("Enviada", "En revisión", "Aceptada") aparecen en la maqueta del inicio;
sus colores exactos dependen de las capturas con sesión que aún no tengo (ver inventario).

## Tipografía

| Rol | Familia | Tamaño / interlínea | Peso | Tracking |
|---|---|---|---|---|
| Display (H1 inicio) | **Bricolage Grotesque** | 52px / 54.6px (1.05) | 500 | -0.02em (-1.04px) |
| H1 de página | Bricolage Grotesque | 38px / 47.5px (1.25) | 500 | -0.02em |
| H2 de sección | Bricolage Grotesque | 32px / 35.2px (1.1) | 540 | -0.015em |
| Título de tarjeta (H3) | **DM Sans** | 19px / 26.1px (1.375) | 540 | -0.01em |
| Salario en tarjeta | DM Sans | 20px | 540 | — |
| Cuerpo | DM Sans | 16px / 24px (1.5) | 460 | normal |
| Cuerpo secundario | DM Sans | 15px | 460 | — |
| Botón / chip / nav | DM Sans | 14px / 21px | 500 | — |
| Botón grande (form) | DM Sans | 15px / 22.5px | 500 | — |
| Label / metadato | DM Sans | 13px / 19.5px | 460 | 0.025em |
| Micro (badge, "MXN mensual") | DM Sans | 12–12.5px | 460 | — |
| Overline de footer ("EXPLORAR") | DM Sans | 13px, mayúsculas | 540 | amplio |

Pila de respaldo: `ui-sans-serif, system-ui, -apple-system, sans-serif`. Ambas fuentes están en
Google Fonts (se cargarán desde ahí en la réplica).

## Espaciado

Escala de 4px (Tailwind). Valores más frecuentes:

- **Gaps:** 4, 6, 8, 10, 12, 16, 20, 24 px; grid de footer `48px 32px`.
- **Padding de tarjeta:** 28px. Separación entre tarjetas: 16px.
- **Chips de tecnología:** `4px 10px`; chips de filtro: `6px 14px`; badges: `4px 12px`.
- **Botón pequeño (nav):** `8px 18px`; botón grande (formularios): `11px 22px`.
- **Inputs:** `10px 14px`, `44px` a la izquierda cuando llevan icono.
- **Header:** 64px de alto (`--nav-flow: calc(64px + var(--aviso-alto))`).
- **Contenedor:** `max-width: 1200px` (≈1144px útil con 28px de gutter); gutter móvil 24px.

## Radios

| Token | Valor | Uso |
|---|---|---|
| `--radius-pill` | `9999px` | Botones, chips, badges (el más usado) |
| `--radius-xl` | `24px` | Tarjetas |
| `--radius-md` | `12px` | Avatares de empresa, contenedores pequeños |
| `--radius-sm` | `10px` | Inputs |

## Sombras y efectos

- Tarjetas: **sin sombra exterior**; usan un brillo superior `inset 0 1px 0 rgba(255,255,255,.14)`
  + borde `rgba(255,255,255,.08)` (estilo "vidrio" sobre fondo oscuro).
- Fondo de las cabeceras: degradados difusos azul/teal sobre `#0a0a0a` (glow).
- **Foco en inputs:** borde `rgba(157,176,255,.55)` + anillo `0 0 0 3px rgba(157,176,255,.24)`.
- **Foco en botones:** `0 0 0 2px #fff, 0 0 0 4px #3355ff` (doble anillo, visible sobre cualquier fondo).

## Breakpoints (Tailwind por defecto)

| Nombre | min-width | Cambio observado |
|---|---|---|
| `sm` | 640px | — |
| `md` | 768px | Nav completa vs. menú hamburguesa |
| `lg` | 1024px | Grid de vacantes a 2 columnas |
| `xl` | 1280px | — |
| `2xl` | 1536px | — |

## Movimiento

- Curva "spring" para toasts, duración 600ms.
- Animaciones condicionadas a `prefers-reduced-motion: no-preference`.
