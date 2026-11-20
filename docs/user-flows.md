# Flujos de usuario

Diagramas de los flujos principales de la réplica. GitHub dibuja los bloques Mermaid directamente.
Cada nodo corresponde a una pantalla real del repo; los rombos son decisiones o validaciones.

## Candidato

### Buscar y postularse

```mermaid
flowchart TD
    A([Inicio · index.html]) -->|Escribe puesto / ciudad<br/>o elige búsqueda rápida| B[Vacantes · vacantes.html]
    B -->|Filtra: modalidad, tecnología,<br/>nivel, rango salarial| B
    B --> C{¿Hay resultados?}
    C -->|No| C1[Estado vacío:<br/>«Ninguna vacante coincide»] -->|Limpiar filtros| B
    C -->|Sí| D[Detalle · vacante.html?id=…]
    D --> E{¿Sesión de candidato?}
    E -->|No| F[Login · login.html?volver=…]
    F -->|«Candidato demo»<br/>(maqueta sin contraseña)| D
    E -->|Sí| G[Diálogo «Postularte a…»]
    G --> H{¿Formulario válido?<br/>CV PDF ≤ 5 MB · consentimiento}
    H -->|No| G1[Errores junto al campo<br/>+ foco al primero] --> G
    H -->|Sí| I[Toast «Postulación enviada»<br/>tarjeta: «Ya te postulaste»]
    I --> J[Mis postulaciones]
```

### Seguir el proceso

```mermaid
flowchart LR
    A[Mis postulaciones<br/>mis-postulaciones.html] --> B[Filtra por estado]
    A --> C[ProcessTrack:<br/>Enviada → En revisión → Resultado]
    A --> D[Historial plegable<br/>con fechas y entrevista]
    C --> E{Estado}
    E -->|Enviada / En revisión| F[Tinta plena,<br/>sin color: sigue en curso]
    E -->|Aceptada| G[Teal + entrevista agendada]
    E -->|Rechazada| H[Rojo: «La empresa decidió no continuar»]
```

### Mantener el perfil

```mermaid
flowchart LR
    A[Mi perfil · perfil.html] --> B[Edita datos, habilidades<br/>en chips y CV]
    B --> C[Barra «Cambios sin guardar»]
    C -->|Descartar| A
    C -->|Guardar| D{¿Válido?}
    D -->|No| B
    D -->|Sí| E[Toast «Perfil guardado»<br/>resumen lateral actualizado]
    A -->|Quitar CV: mantener 1.2 s| F[Diálogo que nombra<br/>la consecuencia] --> A
```

## Empresa

### Conocer el producto y registrarse

```mermaid
flowchart LR
    A[Para empresas<br/>empresas.html] --> B[Planes · planes.html]
    A -->|«Publica tu primera vacante»| C[Registro · registro.html?tipo=empresa]
    B -->|«Contratar PRO»| D[Diálogo: la demo<br/>no procesa pagos]
    C --> E{¿Formulario válido?}
    E -->|No| C
    E -->|Sí| F[«Todo en orden»<br/>no se crea cuenta ni se guarda contraseña] -->|Entrar como empresa demo| G[Mis vacantes]
```

### Publicar una vacante

```mermaid
flowchart TD
    A[Mis vacantes · empresa/vacantes.html] -->|Publicar vacante| B[Formulario · empresa/publicar.html]
    B -->|Cada cambio| P[Vista previa en vivo<br/>de la tarjeta]
    B --> C{¿Válido?<br/>salario máx ≥ mín · al menos 1 tecnología}
    C -->|No| B
    C -->|Sí| D[Estado «En revisión»<br/>un validador la aprueba]
    D --> A
    A -->|Pausar / Reactivar| A
    A -->|Eliminar: mantener 1.2 s| E[Diálogo: «N personas verán<br/>que la vacante se cerró»] --> A
```

### Responder postulaciones

```mermaid
stateDiagram-v2
    [*] --> SinAbrir: llega la postulación
    SinAbrir --> EnRevision: Marcar en revisión
    EnRevision --> Aceptada: Aceptar (se revela el contacto)
    EnRevision --> Rechazada: Rechazar (mantener + diálogo)
    Aceptada --> Aceptada: Agendar / cambiar entrevista
    Aceptada --> Rechazada: Rechazar y cancelar entrevista
    Rechazada --> EnRevision: Reabrir
    note right of Aceptada
        Cada cambio se refleja en
        «Mis postulaciones» del candidato
    end note
```

## Cómo se conectan los dos lados en la demo

```mermaid
sequenceDiagram
    actor C as Candidato demo
    participant LS as localStorage
    actor E as Empresa demo (Cenote Labs)
    C->>LS: Se postula a una vacante de Cenote Labs
    E->>LS: Lee postulaciones recibidas (incluye la del candidato)
    E->>LS: Marca en revisión → acepta → agenda entrevista
    C->>LS: Abre Mis postulaciones
    LS-->>C: Estado «Aceptada», entrevista e historial
```

Sin servidor: ambos roles leen y escriben el mismo `localStorage` del navegador, así el flujo
completo se puede demostrar en una sola pestaña cambiando de cuenta demo.
