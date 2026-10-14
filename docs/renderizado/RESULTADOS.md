# Primera corrección: color y resolución

Se mantiene Three.js r147, ejecución local, voces, UI y modelos. `js/render-base.js` comparte la creación del renderer y composer entre PC y laptop, incluidas sus galerías y aula.

- Gestión de colores hex/CSS en sRGB mediante `ColorManagement.legacyMode=false`.
- Mapas de color/emisión y canvas de color con `texture.encoding=sRGBEncoding`; mapas de normales, metalicidad y rugosidad permanecen lineales. El caché del cargador distingue la codificación aunque dos usos compartan índice de textura.
- Composición lineal: modo ligero usa UnsignedByte y hasta 2 muestras; modo completo activa HalfFloat si WebGL2 y EXT_color_buffer_float lo permiten, con hasta 4 muestras. La alternativa LDR puede recortar luces intensas antes de ACES.
- Pase final único: ACES + conversión sRGB, con exposición ajustable inicialmente 1. El renderer no aplica un segundo tone mapping.
- Antialias en los buffers intermedios, 2 muestras en ligero y hasta 4 en completo en WebGL2; el antialias del canvas por sí solo no suaviza un RenderPass fuera de pantalla.
- Cambio de calidad sincroniza resolución física de renderer/composer, manteniendo el pase de color activo también en modo ligero.

## Comparación visual y contadores

[Comparación de las seis vistas](comparacion.html). Las capturas finales usan los mismos pasos y cámaras a 1080p, modo ligero, DPR 1. Las transiciones se llevan a su posición final en memoria para estabilizar el encuadre; no se usan como prueba de duración de animaciones.

| Vista | Calls antes, último render | Calls después, frame completo | Geometrías antes/después | Texturas antes/después |
|---|---:|---:|---|---|
| 01-inicial | 49 | 50 | 73 / 74 | 11 / 13 |
| 02-torre-sin-panel | 139 | 140 | 164 / 165 | 42 / 44 |
| 03-placa-cpu-ram | 95 | 96 | 164 / 165 | 42 / 44 |
| 04-torre-rgb | 294 | 295 | 174 / 175 | 44 / 46 |
| 05-escritorio-completo | 1492 | 1493 | 774 / 775 | 62 / 64 |
| 06-laptop-abierta | 59 | 60 | 51 / 52 | 7 / 9 |

En estas vistas sin bloom, el frame completo añade una llamada y un triángulo del pase final. Se añadió una geometría y dos texturas de render. No se redujeron las mallas ni llamadas de la escena. No se interpreta el valor 1 del último render del nuevo pipeline como mejora: ese contador corresponde únicamente al pase de salida.

La corrida final tardó 6.483 ms hasta desaparecer el indicador de carga; la línea base fue 6.676 ms. Son corridas únicas en SwiftShader, no comparación estadística de carga ni FPS. El coste de HalfFloat/MSAA y del pase final debe medirse en el i5-1035G1 antes de prometer fluidez; el número de texturas no refleja por sí solo bytes de memoria GPU.

## Validación

`node --test tests/*.test.cjs`: 10 aprobadas. `tests/renderizado.cjs`: píxeles de negro, blanco y gris, color hex sRGB, exposición, bloom, HDR/alternativa LDR y cambios DPR 1/2 de PC y laptop aprobados. Gris lineal 18% produce [127,127,127], blanco [226,226,226], negro [0,0,0]. El gris con exposición 0.5 produce [80,80,80]. No hubo errores nuevos de shader o JavaScript.

La prueba de exterior laptop aprobó sus diez etapas, galería y reinicio. La corrida final de controles/descargas aprobó giro, rechazo del espacio vacío, selección/arrastre sobre la malla y las 12 exportaciones GLB con cabeceras, geometrías y texturas embebidas válidas. Los cuatro mensajes existentes de grupos vacíos de laptop quedan identificados y no se corrigen aquí. La discrepancia de `interaccion.cjs` y el bloqueo file:// siguen documentados en la auditoría. No se ejecuta `internos-originales.cjs` porque regenera modelos y no forma parte de esta corrección.

## Reproducir las capturas

Inicia el servidor con `python iniciar.py` desde la raíz. Con Playwright y Chromium disponibles, ejecuta `SKY_CHROMIUM=/ruta/a/chromium node docs/renderizado/medir.cjs`. Si usas otro puerto, pasa `SKY_BASE_URL`. Este comando actualiza solamente las capturas y el JSON de este directorio; no escribe modelos. Se recomienda cerrar otras pruebas de navegador para evitar competencia de CPU en renderizado por software.

Durante la validación, un intento agotó el timeout de animación en SwiftShader y otro eligió un píxel inestable del borde de la fuente. Se dejó HDR en el modo completo y 2 muestras en ligero. Una traza confirmó movimiento residual de cámara mientras el test elegía el borde; se reforzó la búsqueda para elegir una región interior de 3 píxeles, manteniendo la comprobación del espacio vacío y el arrastre real. No se eliminó ninguna aserción.
