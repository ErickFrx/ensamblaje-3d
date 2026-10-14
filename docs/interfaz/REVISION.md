# Revisión de las maquetas

Se entregan A (Manual de taller) y B (Banco de trabajo), junto a una página comparativa. Todavía no se integró ninguna dirección en el simulador.

## Qué se ejercitó

En ambas propuestas se comprobó: elegir PC/laptop; avanzar y volver al paso; abrir/cerrar menú y secuencia; consultar el marcador de pieza; entrar a galería y reunir/separar módulos; completar el último paso y reiniciar; presentación con flechas; Escape y `/`; atenuación por inactividad y mantenimiento de visibilidad con foco de teclado. Se verificó que el menú móvil quede dentro del viewport.

Resultado: sin excepciones JavaScript ni recursos HTTP fallidos en los recorridos; sin desbordamiento horizontal en los cuatro tamaños. Los controles medidos no tienen objetivos inferiores a 44×44 px. Son controles de maqueta, no pruebas del ensamblaje real.

## Superficie UI en reposo

Se mide la unión de rectángulos de barra superior, tarjeta, Sky y marcador, recortados al viewport, sin sumar dos veces los solapamientos. Se excluyen escena, líneas de referencia y paneles cerrados. La muestra es el paso de RAM, con foco fuera de la UI y superficies visibles; no se reduce el área por la atenuación de opacidad.

| Viewport | A | B |
|---|---:|---:|
| 1920×1080 | 8.0% | 8.2% |
| 1366×768 | 13.2% | 13.8% |
| 1024×768 | 13.9% | 14.9% |
| 390×844 | 27.3% | 26.8% |

En escritorio y tablet ambas cumplen menos del 15% para el encuadre medido. **En móvil no cumplen ese presupuesto**: la tarjeta inferior conserva frase, anterior, siguiente y ayuda con objetivos accesibles; ocupa aproximadamente 27%. Queda pendiente decidir si en la integración se ofrece una tarjeta móvil contraída. El modelo sigue visible arriba.

## Contraste

Las combinaciones evaluadas de texto, botones, enlaces, aviso, acierto y texto secundario superan 4.5:1. Mínimo A: 4.52:1; mínimo B: 4.79:1. El aviso original de B (`#D1495B`) daba 3.43:1; se reemplazó por `#E46C7A`. Las cifras describen los tokens evaluados, no certifican todos los píxeles de imágenes/logos ni todas las situaciones de accesibilidad. Datos completos en `contraste.json`.

## Evidencias y reproducción

Se guardaron 20 capturas: inicio, paso, galería, final, menú y versiones de escritorio, tablet y móvil. `validacion.json` conserva métricas sin redondear.

Con el servidor Python activo en la raíz, ejecuta `SKY_CHROMIUM=/ruta/a/chromium node docs/interfaz/verificar.cjs`. Este script actualiza las capturas y la validación de las maquetas. `capturar-modelos.cjs` reproduce las ocho imágenes de referencia desde el simulador; modifica únicamente el estado en memoria de un navegador y sus salidas en `assets/`. Ambos aceptan `SKY_BASE_URL` si cambia el puerto.

El simulador actual, sus IDs/eventos, voces y modelos permanecen en la versión anterior. La galería del prototipo muestra RAM; descargar GLB está desactivado. Los encuadres alternativos del menú son recortes de una imagen, no cámaras 3D reales. Las estadísticas finales son ilustrativas. Al aplicar la dirección elegida, hay que integrar estas superficies con el motor real y medir renderizado, puentes, accesibilidad, manual y galería nuevamente.

Créditos: las capturas conservan la procedencia de los modelos PC/RAM de Yolala1232 y el exterior de laptop de Diego G. (CC-BY-4.0). La página comparativa y el menú enlazan los créditos. Las fuentes y Sky usan archivos locales existentes.
