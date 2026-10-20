/* Sky · Asistente de ensamblaje UNDC
   Reemplaza el cuadro de información por un robot que explica cada paso con voz.
   - Escucha los cambios de #info y de #detalle-contenido (no modifica tu lógica).
   - Voz: grabaciones de Sky (bienvenida y final) + voz en español del navegador.
   - Para usar tu propia voz en otros pasos: mira audio/sky/GUION.txt y la tabla AUDIOS. */
(function () {
  "use strict";
  if (window.SKY) return;
  const info = document.getElementById("info");
  if (!info) return;
  const BASE = new URL("../", (document.currentScript && document.currentScript.src) || location.href).href;
  const ruta = (r) => new URL(r, BASE).href;
  let panel = document.getElementById("detalle-pieza");
  const modoSolo = !panel; // página sin panel de información propio (laptop.html)
  if (modoSolo) {
    panel = document.createElement("aside");
    panel.id = "detalle-pieza";
    panel.className = "sky-solo";
    panel.setAttribute("aria-label", "Sky, asistente de ensamblaje");
    panel.innerHTML = '<div class="info-panel-header"><span>Sky · Asistente</span></div><div id="detalle-panel-content"></div>';
    document.body.appendChild(panel);
    panel.querySelector("#detalle-panel-content").appendChild(info);
  }
  const detalle = document.getElementById("detalle-contenido");

  /* ---------- Configuración ---------- */
  const IMAGEN = ruta("images/sky.webp");
  const TEXTO_BIENVENIDA =
    "¡Hola! Soy Sky, tu pequeña asistente de ensamblaje de computadoras de la UNDC.";
  const TEXTO_FINAL =
    "¡Excelente trabajo! Lo hiciste muy bien. Sigamos aprendiendo juntos.";
  /* Grabaciones. Clave "bienvenida" y "final" ya existen.
     Para grabar un paso con tu voz agrega, por ejemplo:  psu: ruta("audio/sky/psu.mp3")
     (las claves son: psu, mobo, cpu, aio, ram, ssd, gpu, glass, kb, mouse, mon, spk, end) */
  const AUDIOS = {
    bienvenida: ruta("audio/sky/bienvenida.mp3"),
    final: ruta("audio/sky/final.mp3"),
  };
  const EXPRESION = {
    psu: "nervioso", mobo: "feliz", cpu: "pensando", aio: "pensando",
    ram: "nervioso", ssd: "pensando", gpu: "feliz", glass: "contento",
    kb: "feliz", mouse: "feliz", mon: "contento", spk: "feliz", end: "contento",
  };

  /* ---------- Preferencias ---------- */
  const pref = {
    leer(k, d) {
      try { const v = localStorage.getItem("sky." + k); return v === null ? d : v === "1"; }
      catch (e) { return d; }
    },
    guardar(k, v) { try { localStorage.setItem("sky." + k, v ? "1" : "0"); } catch (e) {} },
  };
  let vozActiva = pref.leer("voz", true);
  let subtitulos = pref.leer("texto", false);
  const synth = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window ? window.speechSynthesis : null;
  if (!synth) subtitulos = true; // sin voz del navegador: el texto siempre se ve

  /* ---------- Estilos ---------- */
  const css = document.createElement("style");
  css.textContent = `
  #detalle-pieza.sky-on #info,
  #detalle-pieza.sky-on #detalle-contenido { display: none; }
  #detalle-pieza.sky-on.sky-ficha #info { display: block; margin-top: 10px; }
  #detalle-pieza.sky-on.sky-ficha #detalle-contenido:not([hidden]) { display: block; margin-top: 10px; }
  #detalle-pieza.sky-solo { position: fixed; right: 14px; bottom: 14px; width: min(370px, calc(100% - 28px));
    background: rgba(8,12,24,.88); backdrop-filter: blur(14px); border: 1px solid rgba(112,0,255,.5);
    border-radius: 14px; padding: 14px; z-index: 25; box-shadow: 0 10px 30px rgba(0,0,0,.4); font: 13px/1.5 'Segoe UI', system-ui, sans-serif; color: #cfe; }
  #detalle-pieza.sky-solo .info-panel-header { margin: -2px 0 10px; color: #9daac0; font-size: 10px; font-weight: 700; letter-spacing: .11em; text-transform: uppercase; }
  #detalle-pieza.sky-solo #info { position: static; width: auto; background: none; border: 0; padding: 0; backdrop-filter: none; }
  #detalle-pieza.sky-solo .sky-botones button { background: rgba(20,60,100,.55); font-weight: 400; }
  #sky { display: flex; gap: 12px; align-items: flex-start; margin: 2px 0 0; }
  .sky-avatar { position: relative; flex: 0 0 96px; width: 96px; height: 96px; border-radius: 20px;
    overflow: hidden; border: 1px solid rgba(80,230,255,.5); background: #023b7e;
    box-shadow: 0 0 16px rgba(40,200,255,.22); animation: skyFlota 4.1s ease-in-out infinite; transition: box-shadow .25s; }
  .sky-avatar canvas { display: block; width: 100%; height: 100%; }
  #sky.sky-hablando .sky-avatar { box-shadow: 0 0 0 2px rgba(60,240,255,.75), 0 0 26px rgba(60,240,255,.5); }
  @keyframes skyFlota { 0%,100% { transform: translateY(1.5px); } 50% { transform: translateY(-2px); } }
  .sky-col { flex: 1; min-width: 0; }
  .sky-nombre { color: #8eeefa; font-weight: 700; font-size: 14px; letter-spacing: .02em; }
  .sky-estado { color: #9db5d6; font-size: 11.5px; min-height: 17px; }
  .sky-botones { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; }
  .sky-botones button { min-width: 34px; height: 30px; padding: 0 9px; font-size: 14px; line-height: 1;
    border-radius: 9px; border: 1px solid rgba(120,200,255,.28); background: rgba(20,60,100,.55); color: #e9f6ff; cursor: pointer; }
  .sky-botones button:hover { background: rgba(30,100,150,.75); border-color: rgba(80,230,255,.7); }
  .sky-botones button[aria-pressed="true"] { background: rgba(0,120,170,.8); border-color: #55eaff; }
  .sky-botones button:focus-visible, .sky-quiz:focus-visible { outline: 2px solid #55eaff; outline-offset: 2px; }
  .sky-burbuja { margin-top: 12px; padding: 10px 13px; border-radius: 14px 14px 14px 4px; background: rgba(10,52,86,.82);
    border: 1px solid rgba(80,170,220,.4); color: #eaf8ff; font-size: 13px; line-height: 1.5;
    max-height: min(26vh, 190px); overflow-y: auto; animation: skyBurbuja .22s ease-out; }
  .sky-burbuja[hidden] { display: none; }
  .sky-burbuja b { color: #8eeefa; }
  .sky-quiz { margin-top: 8px; padding: 7px 12px; border-radius: 9px; border: 1px solid #55eaff; background: #006999; color: #fff; cursor: pointer; font: inherit; }
  @keyframes skyBurbuja { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  #detalle-pieza.collapsed .sky-burbuja, #detalle-pieza.collapsed .sky-botones,
  #detalle-pieza.collapsed .sky-estado { display: none; }
  #detalle-pieza.collapsed .sky-avatar { flex-basis: 52px; width: 52px; height: 52px; border-radius: 14px; }
  #detalle-pieza.collapsed #sky { margin-top: 8px; }
  @media (max-width: 600px) {
    .sky-avatar { flex-basis: 64px; width: 64px; height: 64px; border-radius: 14px; }
    .sky-burbuja { font-size: 12.5px; max-height: 15vh; margin-top: 8px; padding: 8px 11px; }
    .sky-estado { display: none; }
    .sky-botones button { height: 28px; min-width: 32px; padding: 0 7px; }
  }
  @media (prefers-reduced-motion: reduce) { .sky-avatar, .sky-burbuja { animation: none; } }`;
  document.head.appendChild(css);

  /* ---------- Interfaz ---------- */
  const cab = panel.querySelector(".info-panel-header span");
  if (cab) cab.textContent = "Sky · Asistente";
  const sky = document.createElement("div");
  sky.id = "sky";
  sky.innerHTML = `
    <div class="sky-avatar" aria-hidden="true"><canvas id="sky-cv" width="200" height="200"></canvas></div>
    <div class="sky-col">
      <div class="sky-nombre">Sky</div>
      <div class="sky-estado" id="sky-estado" role="status" aria-live="polite"></div>
      <div class="sky-botones">
        <button type="button" id="sky-play" title="Escuchar de nuevo" aria-label="Escuchar de nuevo">▶</button>
        <button type="button" id="sky-voz" title="Activar o silenciar la voz de Sky" aria-label="Voz de Sky" aria-pressed="true">🔊</button>
        <button type="button" id="sky-texto" title="Mostrar siempre el texto" aria-label="Mostrar siempre el texto" aria-pressed="false">Aa</button>
        <button type="button" id="sky-ficha" title="Ver ficha técnica completa" aria-label="Ver ficha técnica completa" aria-pressed="false">📋</button>
      </div>
    </div>`;
  const burbuja = document.createElement("div");
  burbuja.className = "sky-burbuja";
  burbuja.id = "sky-burbuja";
  burbuja.hidden = true;
  const contenedor = document.createElement("div");
  contenedor.append(sky, burbuja);
  const contenido = document.getElementById("detalle-panel-content");
  panel.insertBefore(contenedor, contenido);
  panel.classList.add("sky-on");

  const $ = (id) => document.getElementById(id);
  const estadoEl = $("sky-estado");
  const btnPlay = $("sky-play"), btnVoz = $("sky-voz"), btnTexto = $("sky-texto"), btnFicha = $("sky-ficha");

  /* ---------- Cara (adaptada de robot_undc.html) ---------- */
  const cvs = $("sky-cv"), ctx = cvs.getContext("2d");
  const W = 200, OX = 215, OY = 60, LADO = 820, K = W / LADO;
  const fondo = document.createElement("canvas");
  fondo.width = fondo.height = W;
  (function () {
    const g = fondo.getContext("2d");
    g.fillStyle = "#023b7e";
    g.fillRect(0, 0, W, W);
    const img = new Image();
    img.onload = () => g.drawImage(img, OX * (640 / 1254), OY * (640 / 1254), LADO * (640 / 1254), LADO * (640 / 1254), 0, 0, W, W);
    img.src = IMAGEN;
  })();
        const defs = {
        feliz: { eyes: "open", mouth: "tiny", brow: "happy" },
        sorp: { eyes: "round", mouth: "smallo", brow: "raised" },
        triste: { eyes: "sad", mouth: "frown", brow: "sad" },
        contento: { eyes: "laugh", mouth: "smile", brow: "happy" },
        nervioso: { eyes: "worried", mouth: "smallo", brow: "worried" },
        enojado: { eyes: "angry", mouth: "flat", brow: "angry" },
        pensando: { eyes: "curious", mouth: "softsmile", brow: "curious" },
        dormido: { eyes: "closed", mouth: "softsmile", brow: "none" },
      };

  let state = "feliz", talking = false;
  const bocaHablando = (t) => {
    const v = Math.sin(t * 13) + Math.sin(t * 7.3 + 1.2) * 0.8;
    return v > 0.9 ? "open" : v > 0.1 ? "smallo" : v > -0.7 ? "tiny" : "open";
  };
        function line(points, w = 8) {
        ctx.lineWidth = w;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(...points[0]);
        for (let i = 1; i < points.length; i++) ctx.lineTo(...points[i]);
        ctx.stroke();
      }
      function arc(cx, cy, rx, ry, a1, a2, w = 8) {
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, a1, a2);
        ctx.stroke();
      }
      function eye(x, y, rx, ry, blink) {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, Math.max(3, ry * blink), 0, 0, Math.PI * 2);
        ctx.fill();
        if (blink > 0.5) {
          ctx.fillStyle = "rgba(246,255,255,.94)";
          ctx.beginPath();
          ctx.ellipse(
            x + rx * 0.28,
            y - ry * 0.38,
            rx * 0.25,
            ry * 0.25,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.fillStyle = "#42f7ff";
        }
      }
      function draw(t) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, W, W);
        ctx.drawImage(fondo, 0, 0);
        ctx.setTransform(K, 0, 0, K, -OX * K, -OY * K);
        const c = defs[state];
        let blink = t % 4.3 > 4.16 ? 0.06 : 1;
        if (c.eyes === "closed") blink = 0.08;
        ctx.save();
        ctx.shadowColor = "#15dcff";
        ctx.shadowBlur = 16 * K;
        ctx.fillStyle = "#3cf3ff";
        ctx.strokeStyle = "#35eaff";
        const leftX = 515,
          rightX = 725,
          baseY = 482;
        const drawCheeks = (alpha = 0.16) => {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.shadowBlur = 0 * K;
          ctx.fillStyle = "#72eaff";
          ctx.beginPath();
          ctx.ellipse(448, 548, 14, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(804, 555, 14, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          ctx.fillStyle = "#3cf3ff";
          ctx.strokeStyle = "#35eaff";
        };

        if (c.eyes === "laugh") {
          arc(leftX, 478, 34, 22, Math.PI * 1.04, Math.PI * 1.96, 12);
          arc(rightX, 478, 34, 22, Math.PI * 1.04, Math.PI * 1.96, 12);
        } else if (c.eyes === "closed") {
          arc(leftX, 485, 38, 13, Math.PI * 1.05, Math.PI * 1.95, 10);
          arc(rightX, 485, 38, 13, Math.PI * 1.05, Math.PI * 1.95, 10);
        } else if (c.eyes === "angry") {
          eye(leftX, baseY, 26, 30, blink);
          eye(rightX, baseY, 26, 30, blink);
        } else if (c.eyes === "curious") {
          eye(leftX, 474, 25, 38, blink);
          eye(rightX, 488, 29, 31, blink);
        } else if (c.eyes === "worried") {
          eye(leftX, 486, 24, 32, blink);
          eye(rightX, 486, 24, 32, blink);
        } else if (c.eyes === "round") {
          eye(leftX, baseY, 36, 46, blink);
          eye(rightX, baseY, 36, 46, blink);
        } else if (c.eyes === "sad") {
          eye(leftX, 488, 24, 36, blink);
          eye(rightX, 488, 24, 36, blink);
        } else if (c.eyes === "happy") {
          arc(leftX, 476, 35, 25, Math.PI * 1.03, Math.PI * 1.97, 13);
          arc(rightX, 476, 35, 25, Math.PI * 1.03, Math.PI * 1.97, 13);
        } else {
          eye(leftX, baseY, 28, 50, blink);
          eye(rightX, baseY, 28, 50, blink);
        }

        if (c.brow !== "none") {
          ctx.shadowBlur = 8 * K;
          if (c.brow === "angry") {
            line(
              [
                [486, 401],
                [548, 420],
              ],
              9,
            );
            line(
              [
                [702, 420],
                [760, 399],
              ],
              9,
            );
          } else if (c.brow === "sad") {
            line(
              [
                [484, 398],
                [545, 386],
              ],
              8,
            );
            line(
              [
                [705, 386],
                [763, 398],
              ],
              8,
            );
          } else if (c.brow === "worried") {
            arc(516, 392, 28, 9, Math.PI * 1.06, Math.PI * 1.93, 8);
            arc(738, 392, 28, 9, Math.PI * 1.06, Math.PI * 1.93, 8);
          } else if (c.brow === "curious") {
            arc(516, 389, 26, 8, Math.PI * 1.06, Math.PI * 1.93, 8);
            line(
              [
                [704, 397],
                [760, 390],
              ],
              8,
            );
          } else {
            arc(
              520,
              c.brow === "raised" ? 382 : 399,
              34,
              12,
              Math.PI * 1.1,
              Math.PI * 1.9,
              9,
            );
            arc(
              739,
              c.brow === "raised" ? 384 : 402,
              34,
              12,
              Math.PI * 1.1,
              Math.PI * 1.9,
              9,
            );
          }
        }

        ctx.shadowBlur = 12 * K;
        let mouth = talking
          ? bocaHablando(t)
          : c.mouth;
        if (mouth === "o") {
          ctx.beginPath();
          ctx.ellipse(625, 547, 12, 17, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (mouth === "smallo") {
          ctx.beginPath();
          ctx.ellipse(625, 546, 10, 12, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (mouth === "open") {
          ctx.beginPath();
          ctx.ellipse(625, 548, 18, 12, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (mouth === "smile") {
          arc(624, 536, 30, 18, 0.18, Math.PI - 0.18, 9);
        } else if (mouth === "softsmile") {
          arc(625, 541, 18, 9, 0.22, Math.PI - 0.22, 7);
        } else if (mouth === "frown") {
          arc(625, 560, 22, 13, Math.PI * 1.12, Math.PI * 1.88, 8);
        } else if (mouth === "flat") {
          line(
            [
              [610, 545],
              [640, 545],
            ],
            7,
          );
        } else if (mouth === "zigzag") {
          line(
            [
              [600, 542],
              [612, 549],
              [625, 542],
              [638, 549],
              [650, 542],
            ],
            7,
          );
        } else {
          ctx.beginPath();
          ctx.moveTo(614, 540);
          ctx.quadraticCurveTo(625, 538, 636, 540);
          ctx.quadraticCurveTo(636, 551, 625, 554);
          ctx.quadraticCurveTo(614, 551, 614, 540);
          ctx.fill();
        }

        if (["feliz", "contento", "pensando"].includes(state))
          drawCheeks(state === "contento" ? 0.18 : 0.12);
        if (state === "triste") {
          drawCheeks(0.08);
          ctx.save();
          ctx.shadowBlur = 0 * K;
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.ellipse(782, 565, 5, 11, 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        ctx.save();
        ctx.fillStyle = "#78eaff";
        ctx.shadowColor = "#15dcff";
        ctx.shadowBlur = 10 * K;
        if (state === "pensando" && !talking) {
          ctx.font = "700 42px system-ui";
          ctx.fillText(
            "?",
            846 + Math.sin(t * 1.5) * 4,
            354 + Math.cos(t * 1.8) * 3,
          );
        }
        if (state === "nervioso" && !talking) {
          ctx.font = "700 40px system-ui";
          ctx.fillText("!", 850, 351 + Math.sin(t * 2) * 2);
        }
        if (state === "contento" && !talking) {
          ctx.font = "700 30px system-ui";
          ctx.fillText("♥", 847, 350);
          ctx.fillText("♥", 885, 378);
        }
        if (state === "dormido" && !talking) {
          ctx.font = "bold 42px system-ui";
          ctx.fillText("Z", 865 + Math.sin(t) * 10, 325 - ((t * 12) % 65));
        }
        ctx.restore();
      }



  let ultimoFrame = 0;
  const inicio = performance.now();
  function bucle(ahora) {
    requestAnimationFrame(bucle);
    if (document.hidden || ahora - ultimoFrame < 33) return;
    ultimoFrame = ahora;
    draw((ahora - inicio) / 1000);
  }
  requestAnimationFrame(bucle);

  /* ---------- Voz ---------- */
  let voz = null;
  function elegirVoz() {
    if (!synth) return;
    const todas = synth.getVoices().filter((v) => /^es/i.test(v.lang));
    if (!todas.length) return;
    const puntaje = (v) => {
      let p = 0;
      if (/es[-_]PE/i.test(v.lang)) p += 3;
      else if (/es[-_](MX|US|419|AR|CO|CL)/i.test(v.lang)) p += 2;
      else p += 1;
      if (/sabina|dalia|paulina|helena|paola|elvira|m[oó]nica|laura|luc[ií]a|catalina|camila|salom[eé]|sof[ií]a|google espa|female|mujer|natural/i.test(v.name)) p += 4;
      if (/jorge|diego|pablo|raul|raúl|alvaro|álvaro|carlos|juan|enrique|male\b/i.test(v.name)) p -= 4;
      return p;
    };
    voz = todas.sort((a, b) => puntaje(b) - puntaje(a))[0];
  }
  if (synth) {
    elegirVoz();
    if (synth.addEventListener) synth.addEventListener("voiceschanged", elegirVoz);
  }

  let token = 0, hablando = false, audioActivo = null, ultimoGuion = null;
  let tOcultar = 0, tVigilante = 0, tInicio = 0;

  function detener() {
    token++;
    clearTimeout(tVigilante);
    clearTimeout(tInicio);
    if (synth) { try { synth.cancel(); } catch (e) {} }
    if (audioActivo) { try { audioActivo.pause(); } catch (e) {} audioActivo = null; }
    hablando = false;
    talking = false;
    actualizarUI();
  }
  function actualizarUI() {
    sky.classList.toggle("sky-hablando", hablando);
    btnPlay.textContent = hablando ? "■" : "▶";
    const t = hablando ? "Detener a Sky" : "Escuchar de nuevo";
    btnPlay.title = t;
    btnPlay.setAttribute("aria-label", t);
    btnVoz.textContent = vozActiva ? "🔊" : "🔇";
    btnVoz.setAttribute("aria-pressed", String(vozActiva));
    btnTexto.setAttribute("aria-pressed", String(subtitulos));
    if (hablando) estadoEl.textContent = "Sky está hablando…";
    else if (!estadoEl.dataset.fijo) estadoEl.textContent = "";
  }
  function avisar(msg) {
    estadoEl.dataset.fijo = "1";
    estadoEl.textContent = msg;
  }
  function limpiarAviso() { delete estadoEl.dataset.fijo; }

  function trocear(texto) {
    const frases = texto.split(/(?<=[.!?…])\s+/);
    const trozos = [];
    let acum = "";
    for (const f of frases) {
      if ((acum + " " + f).length > 170 && acum) { trozos.push(acum); acum = f; }
      else acum = acum ? acum + " " + f : f;
    }
    if (acum) trozos.push(acum);
    return trozos;
  }
  function esperar(mi, ms, fn) {
    clearTimeout(tVigilante);
    tVigilante = setTimeout(() => { if (mi === token) fn(); }, ms);
  }
  function sintetizar(texto, mi, siguiente) {
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = voz ? voz.lang : "es-MX";
    if (voz) u.voice = voz;
    u.rate = 1;
    u.pitch = 1.12;
    let fin = false;
    const seguir = () => { if (fin || mi !== token) return; fin = true; clearTimeout(tVigilante); siguiente(); };
    u.onstart = () => { if (mi === token) { talking = true; hablando = true; actualizarUI(); } };
    u.onend = seguir;
    u.onerror = (e) => {
      if (mi !== token) return;
      if (e.error === "interrupted" || e.error === "canceled") return;
      if (e.error === "not-allowed") avisar("Toca ▶ para que Sky hable");
      seguir();
    };
    esperar(mi, Math.max(5000, texto.length * 140), seguir); // por si el navegador nunca avisa el final
    synth.speak(u);
  }
  function reproducirClip(src, textoRespaldo, mi, siguiente) {
    const a = new Audio(src);
    audioActivo = a;
    a.volume = 1;
    let fin = false;
    const seguir = () => { if (fin || mi !== token) return; fin = true; clearTimeout(tVigilante); audioActivo = null; siguiente(); };
    const respaldo = () => {
      if (fin || mi !== token) return;
      fin = true; audioActivo = null; clearTimeout(tVigilante);
      if (synth && textoRespaldo) sintetizar(textoRespaldo, mi, siguiente); else siguiente();
    };
    a.onplaying = () => { if (mi === token) { talking = true; hablando = true; actualizarUI(); } };
    a.onended = seguir;
    a.onerror = respaldo;
    esperar(mi, 30000, seguir);
    const p = a.play();
    if (p && p.catch) p.catch((e) => {
      if (mi !== token) return;
      if (e && e.name === "NotAllowedError") { avisar("Toca ▶ para que Sky hable"); fin = true; siguiente(); }
      else respaldo();
    });
  }

  function mostrarBurbuja(texto, quiz, fija) {
    clearTimeout(tOcultar);
    burbuja.replaceChildren();
    const p = document.createElement("div");
    p.textContent = texto;
    burbuja.append(p);
    if (quiz) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sky-quiz";
      b.textContent = "🎓 Hacer el quiz";
      b.onclick = () => window.hacerQuiz && window.hacerQuiz();
      burbuja.append(b);
    }
    burbuja.hidden = false;
    burbuja.dataset.fija = fija ? "1" : "";
  }
  function programarOcultar(ms) {
    clearTimeout(tOcultar);
    if (subtitulos || burbuja.dataset.fija) return;
    tOcultar = setTimeout(() => { if (!subtitulos && !hablando) burbuja.hidden = true; }, ms);
  }

  /* guion = { texto, expr, items: [{tts}|{clip, respaldo}], quiz, fija } */
  function decir(guion) {
    const habiaVoz = !!(synth && (synth.speaking || synth.pending)) || hablando;
    detener();
    limpiarAviso();
    ultimoGuion = guion;
    state = defs[guion.expr] ? guion.expr : "feliz";
    mostrarBurbuja(guion.texto, guion.quiz, guion.fija);
    const lectura = Math.min(20000, Math.max(5000, guion.texto.length * 65));
    if (!vozActiva || !synth && !guion.items.some((i) => i.clip)) {
      actualizarUI();
      programarOcultar(lectura);
      return;
    }
    const mi = token;
    const cola = guion.items.slice();
    const siguiente = () => {
      if (mi !== token) return;
      const it = cola.shift();
      if (!it) {
        hablando = false; talking = false; actualizarUI();
        programarOcultar(3500);
        return;
      }
      if (it.clip) reproducirClip(it.clip, it.respaldo, mi, siguiente);
      else if (synth) {
        const trozos = trocear(it.tts);
        const sig = () => {
          if (mi !== token) return;
          const t = trozos.shift();
          if (!t) return siguiente();
          sintetizar(t, mi, sig);
        };
        sig();
      } else siguiente();
    };
    hablando = true; actualizarUI();
    if (habiaVoz) {
      tInicio = setTimeout(() => { if (mi === token) siguiente(); }, 90); // da tiempo al cancel() previo
    } else siguiente(); // inmediato: así cuenta como gesto del usuario en móviles
  }

  /* ---------- Qué dice Sky ---------- */
  const QUITAR = /[\u{1F000}-\u{1FFFF}\u{2190}-\u{21FF}\u{2139}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu;
  function limpiar(t) {
    return t
      .replace(/\(\u00D7\s*(\d+)\)/g, "por $1")
      .replace(/\u00D7/g, " por ")
      .replace(QUITAR, "")
      .replace(/\s+/g, " ")
      .replace(/([.!?:])\s*\./g, "$1")
      .replace(/\s+([.,!?])/g, "$1")
      .trim();
  }
  function pasoPorNombre(nombre) {
    const lista = (window.COMPONENTES && window.COMPONENTES.PASOS) || [];
    return lista.find((p) => p.n === nombre);
  }
  function guionDeInfo() {
    const c = info.cloneNode(true);
    c.querySelectorAll(".modelo-referencia,.modelo-nota,.manual-step-hint,button,details,script").forEach((n) => n.remove());
    const quiz = !!info.querySelector("#qzi");
    const titulo = c.querySelector("b");
    const nombre = titulo ? titulo.textContent.trim() : "";
    c.querySelectorAll("br").forEach((n) => n.replaceWith(". "));
    c.querySelectorAll("div,p,li").forEach((n) => n.append(". "));
    let txt = limpiar(c.textContent);
    const i = info.textContent.indexOf("💡");
    if (/colocada correctamente/i.test(txt)) txt = "¡Pieza colocada correctamente! Pulsa «Siguiente» para continuar.";
    else if (i > -1) txt = limpiar(txt.split(/Pulsa «Explotar»/)[0]);
    if (!txt) return null;
    const paso = pasoPorNombre(nombre);
    const id = paso ? (paso.end ? "end" : paso.p[0]) : null;
    const g = { texto: txt, expr: EXPRESION[id] || "feliz", items: [{ tts: txt }], quiz, fija: quiz };
    if (/colocada correctamente/i.test(txt)) g.expr = "contento";
    if (id && AUDIOS[id]) g.items = [{ clip: AUDIOS[id], respaldo: txt }];
    if (id === "end") {
      g.items.push({ clip: AUDIOS.final, respaldo: TEXTO_FINAL });
      g.texto = txt + "\n" + TEXTO_FINAL;
    }
    return g;
  }
  function guionDeDetalle() {
    const t = (id) => (document.getElementById(id) || {}).textContent || "";
    const titulo = limpiar(t("detalle-titulo"));
    const txt = limpiar(titulo + ". " + t("detalle-funcion") + " " + t("detalle-instalacion"));
    const paso = pasoPorNombre(titulo);
    return { texto: txt, expr: EXPRESION[paso ? paso.p[0] : ""] || "pensando", items: [{ tts: txt }], origen: "detalle" };
  }

  /* ---------- Escuchar cambios ---------- */
  let activo = false, ultimoTexto = "", tUltimo = 0, tInfo = 0, tDet = 0;
  function nuevo(g) {
    if (!g) return;
    if (g.texto === ultimoTexto && Date.now() - tUltimo < 4000) return;
    ultimoTexto = g.texto;
    tUltimo = Date.now();
    decir(g);
  }
  new MutationObserver(() => {
    clearTimeout(tInfo);
    tInfo = setTimeout(() => activo && nuevo(guionDeInfo()), 160);
  }).observe(info, { childList: true, subtree: true, characterData: true });
  if (detalle) {
    new MutationObserver(() => {
      clearTimeout(tDet);
      tDet = setTimeout(() => {
        if (!activo) return;
        if (detalle.hidden) {
          if (ultimoGuion && ultimoGuion.origen === "detalle") { detener(); burbuja.hidden = true; }
          return;
        }
        nuevo(guionDeDetalle());
      }, 160);
    }).observe(detalle, { attributes: true, attributeFilter: ["hidden"], childList: true, subtree: true, characterData: true });
  }

  /* El saludo se da cuando termina la carga y se cierra la ventana de ayuda */
  function saludar() {
    if (activo) return;
    clearInterval(espera);
    activo = true;
    const g = {
      texto: TEXTO_BIENVENIDA,
      expr: "feliz",
      items: [{ clip: AUDIOS.bienvenida, respaldo: TEXTO_BIENVENIDA }],
    };
    ultimoTexto = g.texto;
    tUltimo = Date.now();
    decir(g);
  }
  const conIntro = !!document.getElementById("intro");
  const espera = conIntro ? setInterval(() => {
    if (document.getElementById("carga") || document.getElementById("intro") || document.getElementById("mod")) return;
    saludar();
  }, 400) : 0;
  if (!conIntro) {
    // sin pantalla de inicio: Sky se activa con el primer toque (el navegador no deja hablar antes)
    addEventListener("pointerdown", (e) => {
      if (activo) return;
      if (e.target && e.target.closest && e.target.closest("button")) { clearInterval(espera); activo = true; return; }
      saludar();
    }, { once: true, capture: true });
  }
  // si el usuario cierra la ayuda con «Entendido», saluda en ese mismo clic (los móviles lo exigen)
  document.addEventListener("click", (e) => {
    if (!activo && e.target && e.target.id === "ok1") saludar();
  }, true);
  // desbloquea la voz del navegador con el primer toque
  addEventListener("pointerdown", () => {
    if (!synth) return;
    try { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; synth.speak(u); } catch (e) {}
  }, { once: true, capture: true });

  /* ---------- Botones ---------- */
  btnPlay.onclick = () => {
    if (hablando) { detener(); programarOcultar(1500); return; }
    if (!vozActiva) { vozActiva = true; pref.guardar("voz", true); }
    if (ultimoGuion) decir(ultimoGuion);
  };
  btnVoz.onclick = () => {
    vozActiva = !vozActiva;
    pref.guardar("voz", vozActiva);
    if (!vozActiva) detener();
    else if (ultimoGuion) decir(ultimoGuion);
    actualizarUI();
  };
  btnTexto.onclick = () => {
    subtitulos = !subtitulos;
    pref.guardar("texto", subtitulos);
    if (subtitulos && ultimoGuion) mostrarBurbuja(ultimoGuion.texto, ultimoGuion.quiz, ultimoGuion.fija);
    else if (!hablando) programarOcultar(500);
    actualizarUI();
  };
  btnFicha.onclick = () => {
    const abierta = panel.classList.toggle("sky-ficha");
    btnFicha.setAttribute("aria-pressed", String(abierta));
    if (abierta && contenido) contenido.scrollTop = 0;
  };
  addEventListener("pagehide", detener);
  actualizarUI();

  window.SKY = {
    hablando: () => hablando && vozActiva,
    decir: (texto, expr) => decir({ texto, expr: expr || "feliz", items: [{ tts: texto }] }),
    detener,
  };
})();
