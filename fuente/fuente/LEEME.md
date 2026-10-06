# Versión editable (por carpetas)

Misma aplicación que el `index.html` único de la raíz, pero separada en archivos para que el equipo pueda editarla.

## Qué hay en cada archivo
| Archivo | Para qué sirve |
|---|---|
| `index.html` | Estructura de la página, estilos (CSS) y pantalla de carga |
| `js/app.js` | Lógica principal: lista de pasos (`PASOS`), escena 3D, modo manual, galería, fichas técnicas |
| `js/mejoras.js` | Textos de instalación, notas «En la práctica», quiz (`QS`), «Cómo usar» y estadísticas del modo manual |
| `js/modelos.js` | Carga los modelos 3D reales y ajusta cámaras y cables |
| `js/detalle.js` | Detalle interno de CPU, RAM, SSD, GPU, etc. |
| `js/three.min.js`, `js/*Pass.js`, `js/*Shader.js`, `OrbitControls.js` | Librería three.js (no editar) |
| `models/*.js` | Modelos 3D codificados en texto (no editar a mano) |

## Cambios frecuentes
- **Textos de cada paso:** `TXT` en `js/mejoras.js`.
- **Preguntas del quiz:** `QS` en `js/mejoras.js` (pregunta, respuesta correcta, 3 incorrectas, explicación).
- **Nombres de piezas y fases:** `PASOS` al inicio de `js/app.js`.
- **Colores y estilos:** bloque `<style>` de `index.html`.

## Cómo probarlo
- No funciona abriendo `index.html` desde dentro de un zip: descomprime primero y mantén `js/` y `models/` junto a `index.html`.
- Para verlo en línea, súbelo a GitHub y abre `https://USUARIO.github.io/REPOSITORIO/fuente/`.

## Trabajo en equipo
Avisen por el grupo quién edita qué archivo. Antes de editar, bajen los últimos cambios (Fetch/Pull en GitHub Desktop). No editen `models/*.js` ni `three.min.js`.

Créditos: modelo 3D «Gaming Desktop PC» de Yolala1232 (Sketchfab, CC BY 4.0) · three.js (MIT).
