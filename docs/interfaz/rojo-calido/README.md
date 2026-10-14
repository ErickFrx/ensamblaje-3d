# Interfaz integrada: rojo cálido

Se aplica al simulador real de PC y laptop el diseño claro elegido en las capturas: barra superior numerada, tarjeta inferior izquierda y opciones secundarias en un diálogo. El acento es terracota `#A64B43`, sobre superficies `#F3F5F7`. Se usa en acciones, avance y foco; la iluminación RGB del hardware conserva su selector independiente.

La tarjeta reutiliza los botones originales y muestra instrucciones del motor. «Ver más» conserva fichas, fuentes, ayudas y controles manuales. El menú permite cambiar equipo, aula, calidad, automático, galería, voz y ajustes del PC. La galería conserva despiece y descargas. La portada mantiene acceso a los integrantes. Fuentes y scripts son locales, sin dependencias nuevas.

En pantallas estrechas se muestra el contador en lugar de los trece números, manteniendo botones de 44 px. Al pasar de montaje manual a automático se cierra la ficha ampliada; se puede volver a abrir. El encuadre de laptop queda centrado al retirar el panel lateral permanente.

Validación reproducible con Node y Playwright existentes:

```bash
node --test tests/*.test.cjs
SKY_CHROMIUM=/usr/bin/chromium SKY_SCREENSHOTS=docs/interfaz/rojo-calido node tests/interfaz.cjs
SKY_CHROMIUM=/usr/bin/chromium node tests/renderizado.cjs
SKY_CHROMIUM=/usr/bin/chromium node tests/controles-descargas.cjs
SKY_CHROMIUM=/usr/bin/chromium node tests/laptop-exterior.cjs
```

Capturas: `pc-1366.png`, `laptop-1366.png`, `galeria-pc-1366.png`, `opciones-1366.png`, `pc-movil.png`, `opciones-movil.png` e `inicio-movil.png`. `contraste.json` registra luminancia sRGB: texto blanco sobre el botón 5,66:1; terracota sobre superficie clara 5,18:1. Ambos cumplen AA para texto normal.

Las comprobaciones de navegador usan SwiftShader en la nube; no son mediciones de FPS del equipo del usuario. La revisión pública de GitHub Pages queda pendiente de su despliegue: este entorno bloquea ese dominio.
