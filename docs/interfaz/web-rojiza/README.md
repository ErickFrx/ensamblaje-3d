# Interfaz web rojiza sobre el simulador original

El usuario aclaró que quería una presentación de página web interactiva sobre la interfaz de su ZIP, conservando escena, controles y color rojizo. Se sustituye la propuesta clara anterior por una interfaz oscura con navegación superior, panel lateral de montaje, tarjetas de información, ajustes desplegables y estados de pasos visibles.

La presentación vive en `css/interfaz-web.css` y `js/interfaz-web.js`. Los botones, pasos y opciones conservan sus manejadores originales. El progreso se obtiene del indicador nativo; la interfaz no simula estadísticas ni modifica objetos Three.js. Las luces RGB conservan su selector independiente de la paleta del sitio.

En móvil el panel se abre desde la cabecera. Se puede cerrar con Escape, al elegir un paso o mediante el fondo; el foco se mantiene dentro del panel mientras está abierto. Aula, calidad y ayuda siguen accesibles desde ese panel en PC y laptop. Se respetan las preferencias de movimiento reducido.

La entrega ZIP se construyó sobre `simulador_3d.zip`. Solo cambian tres archivos originales para cargar la presentación (`index.html`, `laptop.html`, `js/inicio.js`) y se añaden los dos archivos de interfaz. Los otros 103 archivos originales permanecen idénticos byte por byte, incluidos motores, modelos y audio. `alcance-zip.json` registra el alcance y SHA-256 de la entrega. En GitHub también se restauran las escenas y motores al estado previo a la propuesta clara, sin nuevas alteraciones de renderizado.

Comprobaciones realizadas:

- Diez pruebas de recursos y componentes.
- Navegación, pasos reales, indicador de progreso, giro, selector RGB, modo manual, galería/despiece, ayuda, quiz, laptop y panel móvil: aprobadas en el repositorio y sobre la base del ZIP.
- Selección exacta, arrastre y doce descargas GLB: aprobadas.
- Revisión visual de escritorio y móvil; comprobación de desbordamiento, cierre por teclado y controles móviles de aula.

Reproducción con Node y Playwright ya instalados:

```bash
node --test tests/*.test.cjs
SKY_CHROMIUM=/usr/bin/chromium node tests/interfaz.cjs
SKY_CHROMIUM=/usr/bin/chromium node tests/controles-descargas.cjs
# Para probar la carpeta extraída del ZIP:
SIM_ROOT=/ruta/ensamblaje-3d-sky SKY_CHROMIUM=/usr/bin/chromium node tests/interfaz.cjs
```

Las capturas se hicieron con Chromium/SwiftShader en la nube; no son mediciones de rendimiento del equipo del usuario.
