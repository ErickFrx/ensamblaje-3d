# Simulador de Ensamblaje en 3D

Proyecto universitario de la Universidad Nacional de Cañete.

[▶ Abrir simulador](https://erickfrx.github.io/ensamblaje-3d/)

Para ejecutarlo sin Internet, abre una terminal en esta carpeta y ejecuta `python iniciar.py` (o `python3 iniciar.py`). Deja la terminal abierta mientras utilizas el simulador.

El renderizado usa Three.js r147 y recursos locales. PC y laptop comparten `js/render-base.js`: composición lineal, bloom opcional y salida ACES/sRGB. El modo ligero mantiene la corrección de color y reduce la resolución; la exposición se configura en `comp.outputPass.uniforms.toneMappingExposure.value`. No requiere paquetes ni compilación para ejecutar la aplicación.

Pruebas de desarrollo: `node --test tests/*.test.cjs`. Con Playwright y Chromium instalados, ejecuta `SKY_CHROMIUM=/ruta/a/chromium node tests/renderizado.cjs` para verificar color, calidad y resolución en PC/laptop. Playwright solo es necesario para las pruebas. Consulta [la auditoría](docs/AUDITORIA.md) y [el registro de mejoras](docs/MEJORAS_LOG.md) para resultados y limitaciones.
