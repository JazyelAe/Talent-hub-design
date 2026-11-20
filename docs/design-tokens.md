# Design tokens — paleta, tipografía y espaciado explicados

Los tokens son las decisiones de diseño convertidas en variables: un solo lugar donde vive cada
color, tamaño y espacio. En la réplica están en [`css/tokens.css`](../css/tokens.css) y usan **los
mismos nombres que el `tailwind.config.js` del producto original** (`--night`, `--canvas`,
`--ink`, `--accent-on-dark`…), así que cada variable se puede rastrear hasta su origen.

## De dónde salen

1. **Medición** (Fase 0): con Playwright abrí las páginas públicas de
   [talent-hub.me](https://www.talent-hub.me) a 1440 y 390 px y extraje los estilos computados
   (colores, fuentes, tamaños, radios, sombras, media queries) recorriendo el DOM.
2. **Contraste con la fuente**: después encontré el código público del proyecto
   ([GitLab](https://gitlab.com/talenthub4902147/talenthub-mexico)), con su `DESIGN.md` y su
   configuración de Tailwind. **Las mediciones coincidieron**; el código aclaró los tokens que no
   aparecían en las páginas públicas (superficies opacas, rojo destructivo, ámbar, curvas).
3. **Una corrección**: medí un gris `#6b6b6b` con contraste de 3.7:1 (no pasa AA en texto
   pequeño). No es un token del sistema; en la réplica todo texto usa `--muted` o `--muted-d`.

---

## Paleta

### La idea: oscuro, con vidrio, y un solo color que significa "acción"

| Rol | Token | Valor | Por qué |
|---|---|---|---|
| Página | `--night` | `#0a0a0a` | Casi negro, no negro puro: reduce el deslumbramiento |
| Tarjeta opaca, campos | `--canvas` | `#141416` | Un escalón sobre la página; para tablas y pantallas de uso diario |
| Bandas alternas | `--surface` | `#0f0f11` | Diferencia secciones sin bordes |
| Vidrio | `--glass` | `rgba(255,255,255,.06)` | La firma visual: deja ver los halos de color de atrás |
| Texto principal | `--ink` | `#ededed` | 16.9:1; nunca blanco puro, otra vez por deslumbramiento |
| Texto de apoyo | `--ink-2` | `#c2c2c2` | 11.1:1 |
| Metadatos | `--muted` / `--muted-d` | `#8f8f8f` / `#8a8a8a` | 6.1:1 / 5.7:1: el gris más bajo que sigue pasando AA |
| **Acción** | `--accent` | `#3355ff` | Ultramar. Relleno de botones primarios; 5.41:1 con texto blanco |
| Acción como texto | `--accent-on-dark` | `#9db0ff` | Enlaces, iconos, anillos de foco: 9.51:1 |

**Regla del azul.** `#3355ff` como *texto* sobre oscuro mide 3.4:1 y reprueba AA, por eso cuando
el acento es texto se usa su versión clara `#9db0ff`. Y el azul **solo** marca "esto se puede
presionar": ningún tag, ícono decorativo ni estado es azul. Así la persona nunca duda qué es
clicable (heurística de *consistencia y estándares*).

### Estados: el color marca *resolución*, no actividad

| Significado | Token | Valor | Uso |
|---|---|---|---|
| Resuelto a favor | `--ok` | `#5eead4` (teal) | Aceptada, publicada, Remoto |
| Resuelto en contra | `--danger` | `#f87171` (rojo) | Rechazada, error |
| Botón destructivo | `--danger-fill` | `#dc2626` | 4.83:1 con blanco (el `#f87171` con blanco da 2.77:1) |
| Aviso de formulario | `--warn` | `#fcd34d` | Solo avisos; **nunca** un estado |

¿Por qué no ámbar para "en revisión"? Con daltonismo rojo-verde (deuteranopia), ámbar y rojo se
vuelven casi idénticos: "sigues en proceso" y "te rechazaron" se confundirían. Por eso lo que está
en curso no lleva color: lleva tinta plena y su **posición** en el `ProcessTrack` (paso 2 de 3).
El estado se entiende sin depender del color.

### Profundidad sin sombras

No hay `box-shadow` de elevación. La profundidad se construye con:
1. translucidez + `backdrop-filter: blur(22px) saturate(1.6)` sobre halos de color fijos;
2. escalones de superficie (`night` → vidrio → `canvas`);
3. un filo de 1 px (`rgba(255,255,255,.08)`) más una línea de luz arriba
   (`inset 0 1px 0 rgba(255,255,255,.14)`);
4. paneles que cruzan el borde de la banda oscura (−96 px).

Las únicas sombras son el filo del vidrio y los **anillos de foco**.

---

## Tipografía

| Rol | Fuente | Tamaño | Peso | Por qué |
|---|---|---|---|---|
| Display / h1 / h2 | **Bricolage Grotesque** | 52 · 38–48 · 26–36 px con `clamp()` | 500–540 | Anchos irregulares y eje óptico: personalidad en titulares |
| h3 hacia abajo y toda la interfaz | **DM Sans** | 24 · 19 · 16 · 15 · 14 · 13 px | 460 / 500 / 540 | Geométrica y tranquila; buena cobertura de acentos |
| Cifras (salarios, contadores) | DM Sans + `tabular-nums` | — | 540 | Los dígitos se alinean en columna |

- **Pesos 460 y 540**: intermedios a propósito (se necesitan las fuentes variables). Ningún
  titular pasa de 540: la contención es parte de la identidad.
- **Tracking**: negativo en titulares (−0.02 em), positivo en etiquetas pequeñas (+0.025 em).
- **`clamp()`**: el rol se mantiene y el tamaño fluye con el ancho; en móvil un h2 baja a 26 px y
  sigue siendo el nivel "display" de esa pantalla.
- **Los salarios no usan la fuente display**: sus anchos irregulares deshacen las cifras tabulares.
- **Fuentes de respaldo con `size-adjust`** medido (DM Sans 93 %, Bricolage 102.51 % respecto a
  Arial): el titular no "salta" cuando llega la fuente real.

---

## Espaciado y layout

- **Base 4 px**: 4 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 40 · 48 · 64 · 80.
- **Secciones**: `padding-block: clamp(3.5rem, 7vw, 6.5rem)`: fluido, no un valor fijo para un ancho.
- **Tarjetas**: 28 px en marketing, 16–24 px en pantallas de trabajo.
- **Contenedor**: 1200 px máximo con márgenes de 24 px (28 px desde 768 px); 896 px en lectura.
- **Nav**: 64 px de alto, guardado en `--nav-h`; las bandas suben exactamente esa medida para
  pasar por debajo del vidrio de la nav.
- **Breakpoints** (los de Tailwind): 640 · 768 · 1024 · 1280. Mobile-first: los estilos base son
  los de móvil y los `@media (min-width)` añaden columnas.

## Radios

| Token | Valor | Uso |
|---|---|---|
| `--r-pill` | 9999 px | **Todo** control: botones, chips, tags. La silueta en píldora es la identidad |
| `--r-card` | 24 px | Tarjetas y paneles |
| `--r-ui` | 10 px | Campos de formulario |
| `--r-md` | 12 px | Iniciales de empresa |

## Movimiento

- Una sola curva en CSS: `cubic-bezier(.22,.61,.36,1)` (desaceleración sin rebote); 0.18 / 0.42 / 0.75 s.
- `prefers-reduced-motion` quita **desplazamiento**, no retroalimentación: se apagan bucles,
  elevaciones y reflejos, pero los cambios de color y los spinners siguen (son la señal de que algo
  pasa).
- El vidrio solo anima **posición**, nunca opacidad: un ancestro con `opacity < 1` hace que el
  `backdrop-filter` pinte plano.

## Medidas extraídas (referencia)

| Elemento medido en el sitio | Valor computado |
|---|---|
| `body` | DM Sans 16/24 px, peso 460, `#ededed` sobre `#0a0a0a` |
| h1 de inicio | Bricolage 52/54.6 px, 500, −1.04 px |
| Tarjeta de vacante | padding 28 px, radio 24 px, fondo `rgba(255,255,255,.06)`, borde `.08`, filo `inset 0 1px 0 rgba(255,255,255,.14)` |
| Título de tarjeta | 19 px / 540 / −0.19 px |
| Salario en tarjeta | 20 px / 540 |
| Botón "Registrarse" | 14 px / 500, padding 8×18 px, `#3355ff`, píldora |
| Campo enfocado | borde `rgba(157,176,255,.55)` + `0 0 0 3px rgba(157,176,255,.24)` |
| Breakpoints en CSS | 640, 768, 1024, 1280, 1536 px; `(hover: hover)`; `prefers-reduced-motion` |
