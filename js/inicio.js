(function () {
  const pantallaCarga = document.getElementById("carga");
  const barraProgreso = document.getElementById("cb");
  const textoProgreso = document.getElementById("ct");
  const archivos = [
    ["js/three.min.js", 607784],
    ["js/OrbitControls.js", 29929],
    ["js/CopyShader.js", 631],
    ["js/LuminosityHighPassShader.js", 1281],
    ["js/EffectComposer.js", 6832],
    ["js/MaskPass.js", 2328],
    ["js/ShaderPass.js", 1612],
    ["js/RenderPass.js", 1869],
    ["js/UnrealBloomPass.js", 13502],
    ["js/luces.js", 1709],
    ["js/animaciones.js", 1822],
    ["js/app.js", 54705],
    ["js/detalle.js", 13899],
    ["models/meta.js", 491],
    ["models/case.js", 1201075],
    ["models/glass.js", 35644],
    ["models/psu.js", 212446],
    ["models/mobo.js", 437231],
    ["models/aio.js", 473298],
    ["models/ram.js", 129790],
    ["models/gpu.js", 270810],
    ["models/kb.js", 2681065],
    ["models/mouse.js", 270340],
    ["models/mon.js", 275514],
    ["models/spk.js", 317354],
    ["js/cargador.js", 10387],
    ["js/mejoras.js", 13472],
  ];
  const bytesTotales = archivos.reduce((total, archivo) => total + archivo[1], 0);
  let bytesCargados = 0;

  function mostrarError(mensaje) {
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

  function cargarSiguiente(indice) {
    if (indice >= archivos.length) {
      barraProgreso.style.width = "100%";
      textoProgreso.textContent = "¡Listo!";
      setTimeout(() => {
        pantallaCarga.classList.add("listo");
        setTimeout(() => {
          pantallaCarga.remove();
          if (window.mostrarAyuda) mostrarAyuda();
        }, 400);
      }, 200);
      return;
    }

    const [ruta, tamano] = archivos[indice];
    const porcentaje = Math.round((bytesCargados / bytesTotales) * 100);
    textoProgreso.textContent =
      "Cargando " + ruta.split("/").pop() + "… " + porcentaje + "%";

    const script = document.createElement("script");
    script.src = ruta;
    script.onload = () => {
      bytesCargados += tamano;
      barraProgreso.style.width =
        Math.round((bytesCargados / bytesTotales) * 100) + "%";
      setTimeout(() => cargarSiguiente(indice + 1), 20);
    };
    script.onerror = () => {
      mostrarError(
        "No se pudo cargar " +
          ruta +
          ". Comprueba que las carpetas js/ y models/ estén junto a index.html (no abras index.html desde dentro del zip).",
      );
    };
    document.head.appendChild(script);
  }

  requestAnimationFrame(() => cargarSiguiente(0));
})();
