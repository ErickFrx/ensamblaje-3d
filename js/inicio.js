(function () {
  const pantallaCarga = document.getElementById("carga");
  const barraProgreso = document.getElementById("cb");
  const textoProgreso = document.getElementById("ct");
  const archivos = [
    "js/three.min.js",
    "js/OrbitControls.js",
    "js/CopyShader.js",
    "js/LuminosityHighPassShader.js",
    "js/EffectComposer.js",
    "js/MaskPass.js",
    "js/ShaderPass.js",
    "js/RenderPass.js",
    "js/UnrealBloomPass.js",
    "js/luces.js",
    "js/animaciones.js",
    "images/facultad-data.js",
    "js/componentes.js",
    "js/app.js",
    "js/laboratorio.js",
    "js/detalle.js",
    "models/meta.js",
    "models/case.js",
    "models/glass.js",
    "models/psu.js",
    "models/mobo.js",
    "models/aio.js",
    "models/ram.js",
    "models/gpu.js",
    "models/mouse.js",
    "models/mon.js",
    "models/spk.js",
    "js/cargador.js",
    "js/mejoras.js",
  ];
  let archivosCargados = 0,
    errorCarga = false,
    tecladoSolicitado = false;

  window.cargarModeloTeclado = () => {
    if (tecladoSolicitado || window.GLB?.kb) {
      if (window.aplicarModeloTeclado) window.aplicarModeloTeclado();
      return;
    }
    tecladoSolicitado = true;
    const script = document.createElement("script");
    script.src = "models/kb.js";
    script.onload = () => {
      if (window.aplicarModeloTeclado) {
        window.aplicarModeloTeclado();
        return;
      }
      console.error("No se pudo inicializar el modelo detallado del teclado.");
      document.getElementById("info").insertAdjacentHTML(
        "beforeend",
        '<div class="modelo-nota">Se conserva el modelo simplificado del teclado.</div>',
      );
    };
    script.onerror = () => {
      console.error("No se pudo cargar models/kb.js.");
      document.getElementById("info").insertAdjacentHTML(
        "beforeend",
        '<div class="modelo-nota">No se pudo cargar el modelo detallado del teclado; se conserva el modelo simplificado.</div>',
      );
    };
    document.head.appendChild(script);
  };

  function mostrarError(mensaje) {
    if (errorCarga) return;
    errorCarga = true;
    pantallaCarga.classList.add("err");
    textoProgreso.innerHTML = "⚠️ " + mensaje;
  }

  try {
    const canvas = document.createElement("canvas");
    if (!(canvas.getContext("webgl2") || canvas.getContext("webgl"))) {
      mostrarError(
        "Tu navegador o dispositivo no tiene WebGL activado. Prueba con Chrome, Edge o Firefox actualizados.",
      );
      return;
    }
  } catch (error) {
    mostrarError("No se pudo comprobar la compatibilidad con WebGL.");
    return;
  }

  addEventListener("error", (evento) => {
    if (!pantallaCarga.classList.contains("listo") && evento.message) {
      mostrarError(
        "Ocurrió un error al cargar (" + evento.message + "). Recarga la página.",
      );
    }
  });

  function finalizarCarga() {
    barraProgreso.style.width = "100%";
    barraProgreso.setAttribute("aria-valuenow", "100");
    textoProgreso.textContent = "¡Listo!";
    setTimeout(() => {
      pantallaCarga.classList.add("listo");
      setTimeout(() => {
        pantallaCarga.remove();
        if (window.mostrarAyuda) mostrarAyuda();
      }, 400);
    }, 200);
  }

  function cargarScripts() {
    archivos.forEach((ruta) => {
      const script = document.createElement("script");
      script.async = false;
      script.src = ruta;
      script.onload = () => {
        if (errorCarga) return;
        archivosCargados++;
        const porcentaje = Math.round(
          (archivosCargados / archivos.length) * 100,
        );
        barraProgreso.style.width = porcentaje + "%";
        barraProgreso.setAttribute("aria-valuenow", String(porcentaje));
        if (archivosCargados === archivos.length) {
          finalizarCarga();
          return;
        }
        const siguiente = archivos[archivosCargados];
        textoProgreso.textContent =
          "Cargando " +
          (archivosCargados + 1) +
          " de " +
          archivos.length +
          ": " +
          siguiente.split("/").pop();
      };
      script.onerror = () => {
        mostrarError(
          "No se pudo cargar " +
            ruta +
            ". Comprueba que las carpetas js/, models/ e images/ estén junto a index.html (no abras index.html desde dentro del zip).",
        );
      };
      document.head.appendChild(script);
    });
  }

  requestAnimationFrame(cargarScripts);
})();
