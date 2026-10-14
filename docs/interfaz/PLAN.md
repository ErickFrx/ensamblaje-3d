# Propuestas de interfaz

Esta fase presenta dos maquetas independientes. El simulador existente se conserva hasta elegir una dirección. Las imágenes de torre y RAM se capturaron de los modelos reales con iluminación de estudio temporal; no son renders de un equipo distinto. Los botones del prototipo recorren estados de interfaz sobre imágenes, sin simular una implementación completa de manipulación 3D.

## Inventario y jerarquía

| Actualmente | Propuesta |
|---|---|
| Panel completo de pasos y barra superior | Progreso compacto con acceso a la secuencia |
| Anterior/Siguiente/Auto en panel y dock | Una tarjeta de paso con acción principal y anterior |
| Panel permanente de información | Una frase y detalle desplegable |
| Calidad, giro, aula, manual, RGB, sonido, ayuda, quiz | Un menú, accesible con `/` o `?` |
| Galería y exportación | Herramientas contextuales dentro de galería |
| Sky grande y ajustes separados | Figura pequeña, ocultable; mensaje cuando corresponda |
| Logos, vídeo, «Comenzar», selector escondido | Logo y dos opciones de equipo visibles desde inicio |
| Listas técnicas y manos/controles manuales | Solo mientras se usa esa función; no se eliminan |

## Tokens y composición

| Rol | A: Manual de taller | B: Banco de trabajo |
|---|---|---|
| Superficie | `#F3F5F7` | `#25272C` |
| Texto | `#1B2433` | `#E9E6DF` |
| Acción | `#0078A8` | `#4DA3C7` |
| Atención | `#900018` | `#E46C7A` |
| Correcto | `#2F7D5B` | `#5FB08A` |
| Separación | `#D5DBE2` | `#3E4148` |

Fuentes locales: Lora para títulos y Poppins para texto/controles; pesos regular y medium. Tres roles de tamaño: cuerpo 14 px, título de paso 22 px y título de pantalla 32–40 px según viewport. Radios: controles 6 px, tarjeta 12 px, círculo para numeración/estado. Sin blur permanente, degradados decorativos, sombras voluminosas ni neón UI.

A usa la metáfora de un manual: progreso numerado, tarjeta de paso abajo a la izquierda y una línea técnica que relaciona un marcador con el componente. B usa un banco de trabajo: progreso reducido y acción centrada en una barra inferior horizontal. La diferencia no consiste solamente en cambiar colores.

Momento distintivo: despiece de RAM con cuatro referencias numeradas. Se conserva el RGB dentro del modelo; no se traslada a los botones.

## Wireframes

```text
Inicio
  Logo UNDC
  Aprende cómo se arma una computadora.
  [imagen PC / Ensamblar PC]  [imagen laptop / Ensamblar laptop]

Paso A
  [marca / equipo] [progreso 1..13] [opciones]
                modelo 3D dominante + un marcador
  [paso / título / frase / anterior / siguiente]       [Sky]

Paso B
  [marca / equipo] [progreso y paso actual] [opciones]
                 modelo 3D dominante + un marcador
       [paso / título y frase / anterior / siguiente] [Sky]

Galería
  [volver al montaje] [nombre de componente] [opciones]
                 despiece 3D y numeración
       [ficha breve / despiece / descargar pieza]

Final
  Equipo ensamblado
  [tiempo] [intentos] [piezas]
  [Volver a empezar]
```

En móvil, tarjeta de paso inferior y menú en hoja inferior; botones ≥44 px. Teclado, foco visible, Escape y movimiento reducido. Autoatenuación tras 3 s solo en la pantalla de paso, detenida cuando hay foco, menú o información abierta; presentación con flechas/espacio.

## Autocrítica y alcance

- Se descartó vidrio oscuro con blur: aumenta trabajo del compositor y compite con el 3D.
- Se descartaron tarjetas decorativas iguales para controles sin relación; se usa una fila de progreso y una sola acción principal.
- El granate claro original de B no alcanzaba contraste AA como texto pequeño; se aclaró a `#E46C7A` y se reservó para avisos.
- El azul proviene de la identidad UNDC y se usa únicamente para acciones; error y acierto tienen sus propias funciones.
- Las tipografías existentes se usan con jerarquía definida. No se descargan fuentes para enmascarar problemas de estructura.
- Los marcadores del prototipo están colocados sobre capturas, no proyectados con Vector3. La implementación posterior debe usar posición 3D, oclusión y accesibilidad real.
- Los datos de la pantalla final son demostrativos; no se presentan como estadísticas medidas de una sesión real.
- No se reimplementan todavía quiz, exportación, manos VR ni puentes `sim:*`. Se documenta su acceso previsto; al aplicar el diseño se conservarán IDs/eventos o se actualizarán juntos.

La revisión incluye contraste AA de texto y controles, proporción de superficies UI y capturas en 1920×1080, 1366×768 y 390×844. Los paneles abiertos se distinguen del estado de reposo al medir área. No se afirma rendimiento de una UI estática como si fuera la implementación sobre WebGL.
