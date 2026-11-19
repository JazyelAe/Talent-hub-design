# Inventario de pantallas — Fase 0

Relevamiento del 2026-11-18 con Playwright (Chromium), solo páginas públicas, sin sesión,
con pausas de ~3.5 s entre páginas. Capturas de página completa en `referencias/capturas/`
con el patrón `<pantalla>-escritorio.png` (1440 px) y `<pantalla>-movil.png` (390 px).

## Notas del sitio

- `https://talent-hub.me` (sin `www`) da error SSL (`ERR_SSL_VERSION_OR_CIPHER_MISMATCH`);
  el sitio responde en **`https://www.talent-hub.me`**.
- El backend "se duerme": la primera carga muestra un estado propio
  (*"Despertando el servidor · N s"*) que tardó ~60 s. Es un **estado de carga real** a replicar.
- Un aviso flotante "Descarga la app / Lleva TalentHub en tu celular" (QR, maqueta de teléfono)
  aparece en escritorio a la derecha y en móvil como barra inferior con "Descargar".

## Rutas públicas

| # | Ruta | Pantalla | Usuario | Contenido clave | Capturas |
|---|---|---|---|---|---|
| 1 | `/` | Inicio | Ambos | Hero "Tu siguiente empleo en TI ya trae el sueldo", buscador (puesto + ciudad), 3 pasos, maqueta "Mis postulaciones", bloque "¿Contratas? Publica gratis" | `inicio-*` |
| 2 | `/vacantes` | Listado de vacantes | Candidato | Contador "N vacantes abiertas", búsqueda por texto, ciudad, chips de modalidad (Todas/Remoto/Híbrido/Presencial), slider "Sueldo mínimo", grid 2 col de tarjetas, "Ves 12 de N" + botón **"Ver más vacantes"** | `vacantes-*` |
| 3 | `/vacantes?q=…` | Estado vacío | Candidato | "Ninguna vacante coincide", sugerencia, botón "Limpiar filtros" | `vacantes-sin-resultados-*` |
| 4 | `/vacantes/:id` | Detalle de vacante | Candidato | Migas, avatar de empresa, salario, modalidad/ciudad/fecha, Requisitos (tecnologías, experiencia, "Además"), Descripción, tarjeta "¿Te interesa?" → Iniciar sesión / Crear cuenta | `vacante-detalle-*` |
| 5 | `/planes` | Planes | Ambos | Empresas: Gratis / Pro ($399) / Enterprise; Aspirantes: Gratis / Premium; "Sin permanencia", "Pago con PayPal" | `planes-*` |
| 6 | `/empresas` | Landing empresas | Empresa | Hero "Contrata gente de TI…", maqueta de vacante y postulación, 3 pasos (publicas → validador → panel), CTA final | `empresas-*` |
| 7 | `/politicas` | Aviso de privacidad | Ambos | Texto legal largo | `politicas-*` |
| 8 | `/login` | Inicio de sesión | Ambos | Panel lateral con propuesta de valor, Usuario, Contraseña, "¿Olvidaste tu contraseña?", "Regístrate" | `login-*` |
| 9 | `/register` | Registro | Ambos | Selector de tipo de cuenta (Busco empleo / Publico vacantes), usuario, teléfono (opcional), correo, contraseña ×2 | `register-*` |
| 10 | `/*` | 404 | Ambos | "Esta página no existe", Ver vacantes / Ir al inicio, buscador | `404-*` |

Rutas de SEO enlazadas en el footer (mismas pantallas que #2 con filtro): `/vacantes?q=Python`,
`?q=JavaScript`, `?q=TypeScript`, `?lugar=Ciudad de México`, `?lugar=Chihuahua`, `?lugar=León`.

## Componentes identificados

Header (logo "th", nav con indicador activo subrayado, Iniciar sesión, CTA pill "Registrarse",
menú hamburguesa en móvil) · Footer (4 columnas: Explorar, Empleos por, Cuenta, Legal) ·
Barra de búsqueda con iconos · Chips de filtro · Slider de sueldo · Tarjeta de vacante (avatar con
iniciales, badge de modalidad, salario, extracto, chips de tecnología, ciudad, fecha relativa) ·
Badge de modalidad (Remoto en teal; Híbrido/Presencial en neutro) · Migas de pan · Tarjeta de plan ·
Inputs con icono y foco con anillo · Botón primario/secundario pill · Estado vacío · 404 ·
Estado de carga "Despertando el servidor" · Aviso flotante de app · Badges de estado de postulación
(Enviada / En revisión / Aceptada).

## Pantallas con sesión — tomadas del código fuente

No había capturas tuyas en `/referencias` (el repo de GitHub estaba vacío). En lugar de crear
cuentas falsas en producción, leí el código público del proyecto:
**https://gitlab.com/talenthub4902147/talenthub-mexico** (React 19 + TypeScript + Tailwind, backend
Django). Lo cloné en una carpeta temporal solo para leerlo; no lo ejecuté ni lo copié a este repo.

Rutas declaradas en `frontend/src/App.tsx`:

| Ruta | Pantalla | Usuario | Contenido (según el código) |
|---|---|---|---|
| `/mis-aplicaciones` | Mis postulaciones | Candidato | Lista con **ProcessTrack** (Enviada → En revisión → Aceptada/Rechazada), línea de tiempo de seguimiento (entrevista agendada/modificada/cancelada), estados vacío ("Todavía no te has postulado") y error ("No pudimos cargar tus postulaciones") |
| `/mi-perfil` | Mi perfil | Candidato | Secciones Información de cuenta (usuario, correo, teléfono), Perfil profesional (profesión, resumen, habilidades en chips), Currículum (PDF ≤ 5 MB), aviso "Cambios sin guardar" |
| `/dashboard` | Mis vacantes + publicar | Empresa | Métricas con contador, lista de vacantes, formulario: Título, Descripción, Modalidad (Remoto/Híbrido/Presencial), Ubicación, Salario mín./máx. (MXN), Tecnologías (separadas por comas), Experiencia, Otros requisitos (opcional); revisión por validador |
| `/aplicaciones-empresa` | Postulaciones recibidas | Empresa | Filtros por estado (Todas / Sin abrir / En revisión / Aceptadas / Rechazadas), aceptar, rechazar (botón "mantener presionado" + diálogo), reabrir, agendar entrevista, enviar mensaje, datos de contacto tras aceptar |
| `/checkout/:planId` | Pago de plan | Ambos | Resumen del plan + PayPal ("Completar pago") |
| `/validador` | Panel del validador | Validador (interno) | Cola de vacantes por revisar, aprobar/rechazar |
| `/olvide-password`, `/restablecer-password/:uid/:token`, `/verificar-correo/:token` | Recuperación y verificación | Ambos | Pantallas cerradas con `AuthShell` |

Componentes compartidos encontrados en `components/` y `components/ui/`: `navbar`, `footer`,
`Brand`, `VacanteCard`, `Iniciales`, `Campana` (notificaciones), `MenuCuenta`, `AppPromo`,
`PageHeader` (banda oscura con migas), `AuthShell`, `Button`, `Card`, `Field`, `ChoiceCards`,
`Tabs`, `Tag`, `ProcessTrack`, `EmptyState`, `Skeleton`, `AvisoLento` (“Despertando el servidor”),
`BarraCarga`, `Dialog`, `BotonMantener`, `SliderElastico`, `EntradaChips`, `PasswordValidator`.

> Lo que **no** puedo saber sin verlas renderizadas: la composición visual exacta de esas pantallas
> (proporciones, orden en móvil). La reconstruiré con el sistema de diseño y los componentes
> públicos que sí capturé, y te pediré confirmación en la Fase 1 donde haya dudas.

## Diferencias entre lo pedido y el sitio real (para decidir en la Fase 1)

| Pedido | Sitio real (público) |
|---|---|
| Filtros por tecnología y nivel | Tecnología solo por búsqueda de texto; nivel va en el título ("Jr/Mid/Sr"), sin filtro dedicado |
| Rango salarial | Solo "Sueldo mínimo" (un slider) |
| Paginación | "Ver más vacantes" (carga incremental, 12 por tanda) |
| Postulación con formulario | Pide iniciar sesión; el perfil/CV se envía sin llenar formulario |
