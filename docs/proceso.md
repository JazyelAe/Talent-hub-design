# Proceso: prototipar en HTML en lugar de Figma

En TalentHub México diseñé los prototipos directamente en HTML y CSS en lugar de en Figma. Esta
réplica sigue el mismo enfoque. Aquí explico por qué, qué se gana, qué se pierde y qué aprendí.

## Por qué en HTML

El producto es web, oscuro, con vidrio translúcido, filtros que se combinan y estados que dependen
de datos (cargando, vacío, error, servidor dormido). Varias de esas decisiones **no se pueden
evaluar en una imagen estática**:

- el `backdrop-filter` del vidrio solo se ve sobre contenido real que pasa por detrás;
- el contraste del texto sobre vidrio depende de lo que haya debajo;
- un formulario solo se valida de verdad cuando se escribe en él;
- el comportamiento responsivo es un continuo, no tres mesas de trabajo (390, 768, 1440 px).

Prototipar en el material final hace que esas preguntas se respondan en el momento de diseñar, no
después.

## Ventajas

| Ventaja | Ejemplo en este proyecto |
|---|---|
| **El prototipo es el entregable**: no hay traducción de diseño a código ni deriva entre ambos | Los tokens de [`css/tokens.css`](../css/tokens.css) tienen los mismos nombres que la configuración de Tailwind del producto |
| **Estados reales, no maquetados uno por uno** | Carga, vacío y error salen de la misma función; se demuestran con `?demo=lento`, `?demo=error` y `?demo=vacio` |
| **Accesibilidad verificable desde el diseño** | Contraste, foco, orden de tabulación y nombres accesibles se auditan con [`tools/auditoria.js`](../tools/auditoria.js) |
| **Responsivo de verdad** | `clamp()` y `min-width` se prueban en cualquier ancho; `tools/capturas.py --revisar` busca desbordamientos a 390/768/1440 |
| **Interacciones con su timing real** | El botón de mantener presionado (1.2 s), las chispas o la palabra giratoria se ajustan a la sensación real, no a una flecha de prototipo |
| **Se puede probar con usuarios en su propio celular** | Basta un enlace; no hace falta una app de visualización |
| **Control de versiones** | Cada decisión es un commit con su mensaje ([historial](https://github.com/JazyelAe/Talent-hub-design/commits/main)) |

## Desventajas (y cómo las mitigué)

| Desventaja | Mitigación |
|---|---|
| **Explorar muchas alternativas visuales es más lento** que duplicar un marco en Figma | Explorar variantes en la [guía de componentes](../componentes.html) antes de llevarlas a una pantalla |
| **Es más difícil que personas no técnicas comenten** sobre el diseño | Capturas automáticas en `docs/capturas` y enlaces directos a cada estado (`?como=empresa`, `?demo=error`) |
| **Riesgo de que el código del prototipo se trate como código de producción** sin revisión | Separar claramente lo simulado (`js/api.js`, `localStorage`) y documentarlo |
| **No hay una biblioteca visual "arrastrable"** para diseñadores | El sistema vive en tokens y componentes documentados; la guía de componentes hace de biblioteca |
| **Requiere saber programar** | Sí: es un perfil híbrido diseño + frontend, y es justo lo que aporté al equipo |

## Cuándo sí usaría Figma

- Exploración temprana de identidad visual (logo, paleta, tono) con muchas variantes rápidas.
- Ilustraciones y piezas gráficas.
- Equipos donde diseño y desarrollo son personas distintas y Figma es el idioma común.

## Aprendizajes

1. **Los tokens primero.** Empezar por `tokens.css` (colores con su contraste anotado, escala
   tipográfica, espaciado) hizo que cada pantalla nueva fuera consistente casi sin esfuerzo.
2. **Diseñar los estados vacíos y de error al mismo tiempo que el estado ideal.** Son las
   pantallas que más ve un usuario nuevo y las que más se olvidan.
3. **Medir en lugar de estimar.** El contraste se mide con la fórmula de WCAG; las alturas y los
   desbordamientos, con scripts. Medir encontró problemas que a ojo pasaban (un gris de 3.7:1, una
   rejilla que se desbordaba solo en tableta).
4. **El color no puede ser la única señal.** El ProcessTrack comunica el avance por posición; el
   color solo confirma el resultado.
5. **Honestidad en las maquetas.** Login y registro dicen que son demo, no guardan contraseñas y
   las borran del campo. Un prototipo que parece real debe dejar claro qué no es.

## Cómo se construyó esta réplica

Seguí un **desarrollo guiado por especificaciones**, con una pausa para revisión al final de cada
fase:

| Fase | Entregable | Herramientas |
|---|---|---|
| 0. Relevamiento | Inventario de rutas, 20 capturas del sitio, tokens medidos ([inventario](inventario.md)) | Playwright, estilos computados, lectura del código público del proyecto |
| 1. Especificación | [SPEC.md](../SPEC.md): pantallas, componentes, flujos, decisiones técnicas | — |
| 2. Plan | [PLAN.md](../PLAN.md): 39 tareas pequeñas, un commit cada una | — |
| 3. Implementación | HTML5 semántico, CSS con capas y variables, JavaScript en módulos ES; [bitácora](bitacora.md) con las decisiones de cada tarea | Navegador, servidor local de Python, Chrome headless (CDP) para QA y capturas |
| 4. Documentación | Tokens, flujos, decisiones de UX, este documento y el README | Mermaid |
