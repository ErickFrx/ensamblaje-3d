# Registro de mejoras

## 14 de octubre de 2026 — Línea base y auditoría

- Se creó `AUDITORIA.md` con hallazgos contrastados frente al prompt maestro y un plan priorizado.
- Se capturaron encuadres base en `auditoria/capturas/` y se inventariaron materiales y geometrías en `auditoria/mediciones.json`.
- `auditoria/addons.json` registra tamaños y SHA-256 de Three.js y addons locales.
- Validación de esta corrida: 10 pruebas de componentes/recursos aprobadas.
- No se modificó el simulador. No hay métricas «después» ni mejoras implementadas todavía.
- Las métricas de nube con SwiftShader no representan el equipo objetivo Intel UHD. Falta comparación en hardware real y prueba de estabilidad de 10 ciclos.

## 14 de octubre de 2026 — Color, salida y resolución compartidos

- Se añadió `js/render-base.js` para PC y laptop: gestión sRGB de colores/materiales, composición lineal y salida única ACES/sRGB con exposición 1.
- Se corrigieron texturas de color con API r147, conservando lineales los mapas de datos. Se sincroniza el pixel ratio del composer al cambiar calidad.
- El modo ligero usa buffers LDR y hasta 2 muestras de antialias; el completo puede usar HDR y hasta 4 muestras en WebGL2. Se conserva alternativa LDR cuando HDR no está disponible.
- [Seis encuadres antes/después](renderizado/comparacion.html), [mediciones y límites](renderizado/RESULTADOS.md) y script reproducible en `renderizado/medir.cjs`.
- Contadores: vista completa PC 1.492 calls del render de escena anterior, 1.493 del frame completo nuevo; laptop abierta 59 y 60. El incremento es el pase final. No se afirma mejora de FPS ni reducción de geometría.
- Prueba nueva de WebGL: color de píxeles, exposición, bloom, HDR/alternativa LDR, mapas de datos y cambios DPR 1/2 en ambas rutas aprobados. Las 10 pruebas de recursos/componentes siguen aprobadas.
- El renderer y la UI mantienen sus funciones; las fases de iluminación, animación, optimización de mallas, interfaz y voces siguen pendientes.
- Corrida final: controles de giro, selección exacta, arrastre y 12 descargas GLB aprobados. Se reforzó el test para elegir una región interior de la malla y evitar un píxel de borde inestable por el damping residual de cámara.

## 14 de octubre de 2026 — Interfaz clara con rojo cálido

- Se integró el diseño claro seleccionado en PC y laptop: barra de etapas reales, tarjeta de instrucciones y menú de opciones con los controles originales.
- Se usa terracota `#A64B43` sobre superficies claras. Las luces RGB del equipo tienen un color independiente; no modifican la interfaz.
- Se conservaron fichas, galería, despiece, modo manual, ayuda, quiz, voz, aula, calidad y descargas. Se corrigió el ID duplicado del panel de galería PC.
- Portada clara con las dos opciones visibles, controles de 44 px y contador compacto en móvil. Se retiró el desplazamiento de cámara de laptop que compensaba el panel lateral anterior.
- Pruebas: 10 de recursos/componentes, integración de interfaz PC/laptop, color/calidad de render, selección/arrastre y 12 descargas GLB, exterior y diez etapas de laptop. Capturas y contrastes en `interfaz/rojo-calido/`.
