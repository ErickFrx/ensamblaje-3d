(function () {
  "use strict";
  if (window.SKY) return;

  const infoEl = document.getElementById("info");
  if (!infoEl) return;

  const BASE = new URL(
    "../",
    (document.currentScript && document.currentScript.src) || location.href,
  ).href;
  const resolve = (path) => new URL(path, BASE).href;

  const SKY_IMAGE_PRIMARY = resolve("images/sky-transparent.webp");
  const SKY_IMAGE_FALLBACK = resolve("images/sky.webp");
  const SKY_EXPRESSIONS = {
    feliz: { eyes: "open", mouth: "tiny", brow: "happy" },
    sorp: { eyes: "round", mouth: "smallo", brow: "raised" },
    triste: { eyes: "sad", mouth: "frown", brow: "sad" },
    contento: { eyes: "laugh", mouth: "smile", brow: "happy" },
    nervioso: { eyes: "worried", mouth: "smallo", brow: "worried" },
    enojado: { eyes: "angry", mouth: "flat", brow: "angry" },
    pensando: { eyes: "curious", mouth: "softsmile", brow: "curious" },
    dormido: { eyes: "closed", mouth: "softsmile", brow: "none" },
  };
  const SKY_STEP_EXPRESSIONS = {
    bienvenida: "feliz",
    psu: "nervioso",
    mobo: "feliz",
    cpu: "feliz",
    aio: "pensando",
    ram: "nervioso",
    ssd: "pensando",
    gpu: "pensando",
    glass: "nervioso",
    kb: "feliz",
    mouse: "feliz",
    mon: "pensando",
    spk: "contento",
    final: "contento",
  };
  const AUDIO_MANIFEST = {
    bienvenida: {
      clip: resolve("audio/sky/bienvenida.mp3"),
      subtitle: "¡Hola! Soy Sky, tu guía del ensamblaje.",
    },
    final: {
      clip: resolve("audio/sky/final.mp3"),
      subtitle: "¡Excelente trabajo! Sigue aprendiendo junto a Sky.",
    },
  };

  const MISSING_AUDIO = [
    {
      file: "audio/sky/psu.mp3",
      script:
        "Fuente de alimentación. Alinea la fuente con el chasis y fija los cuatro tornillos.",
    },
    {
      file: "audio/sky/mobo.mp3",
      script:
        "Placa madre. Ubica la placa sobre los separadores y atorníllala con cuidado.",
    },
    {
      file: "audio/sky/cpu.mp3",
      script:
        "Procesador. Alinea el triángulo dorado con la marca del zócalo y cierra la palanca.",
    },
    {
      file: "audio/sky/aio.mp3",
      script: "Refrigeración. Coloca la bomba y ajusta los tornillos en cruz.",
    },
    {
      file: "audio/sky/ram.mp3",
      script:
        "Memoria RAM. Alinea la muesca con la ranura y empuja hasta encajar.",
    },
    {
      file: "audio/sky/ssd.mp3",
      script:
        "SSD M.2. Inserta el disco inclinado, apriétalo y fíjalo con el tornillo.",
    },
    {
      file: "audio/sky/gpu.mp3",
      script:
        "Tarjeta gráfica. Alinea la GPU con la ranura PCIe y asegúrala al case.",
    },
    {
      file: "audio/sky/glass.mp3",
      script: "Panel de vidrio. Desliza el panel hasta cerrar el gabinete.",
    },
    {
      file: "audio/sky/kb.mp3",
      script: "Teclado. Conecta el cable USB del teclado al puerto disponible.",
    },
    {
      file: "audio/sky/mouse.mp3",
      script: "Mouse. Conecta su cable USB a un puerto disponible.",
    },
    {
      file: "audio/sky/mon.mp3",
      script: "Monitor. Conecta el cable de video y enciéndelo.",
    },
    {
      file: "audio/sky/spk.mp3",
      script:
        "Parlantes. Colócalos a ambos lados del monitor y conecta el audio.",
    },
    {
      file: "audio/sky/end.mp3",
      script:
        "Encender el equipo. Conecta la fuente y el monitor a la corriente y enciende el equipo.",
    },
  ];

  const STYLE = document.createElement("style");
  STYLE.textContent = `
    :root {
      --sky-accent: #7ce7ff;
      --sky-accent-strong: #9df7ff;
      --sky-panel: rgba(15, 20, 28, 0.72);
      --sky-border: rgba(124, 231, 255, 0.42);
      --sky-shadow: rgba(17, 194, 255, 0.33);
      --sky-text: #eefbff;
    }

    #sky-sticker {
      position: fixed;
      left: 0;
      top: 0;
      z-index: 90;
      width: 140px;
      height: 140px;
      pointer-events: auto;
      user-select: none;
      touch-action: none;
    }

    #sky-sticker.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .sky-shell {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
    }

    .sky-figure {
      position: relative;
      width: 120px;
      height: 120px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: transparent;
      filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.22));
      animation: skyFloat 4.5s ease-in-out infinite;
      cursor: grab;
      touch-action: none;
      transition: transform 220ms ease;
    }

    .sky-figure:active {
      cursor: grabbing;
    }

    .sky-figure.speaking {
      filter: drop-shadow(0 0 0 rgba(0,0,0,0)) drop-shadow(0 0 18px rgba(116, 235, 255, 0.75));
    }

    .sky-figure canvas {
      display: block;
      width: 100%;
      height: 100%;
      background: transparent;
      pointer-events: none;
    }

    .sky-bubble {
      position: absolute;
      left: 120px;
      top: 16px;
      width: min(280px, calc(100vw - 180px));
      max-width: 280px;
      padding: 11px 12px;
      border-radius: 16px 16px 16px 6px;
      background: rgba(9, 19, 27, 0.84);
      border: 1px solid var(--sky-border);
      box-shadow: 0 12px 24px rgba(0,0,0,0.28);
      color: var(--sky-text);
      font-size: 12.4px;
      line-height: 1.45;
      backdrop-filter: blur(10px);
      pointer-events: auto;
      transition: opacity 180ms ease;
      z-index: 2;
    }

    .sky-bubble[hidden] {
      display: none;
    }

    .sky-bubble strong {
      color: var(--sky-accent-strong);
    }

    .sky-menu {
      position: absolute;
      left: 110px;
      top: 110px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 8px;
      border-radius: 12px;
      background: rgba(11, 19, 28, 0.92);
      border: 1px solid var(--sky-border);
      box-shadow: 0 12px 24px rgba(0,0,0,0.28);
      min-width: 170px;
      pointer-events: auto;
      z-index: 3;
    }

    .sky-menu[hidden] {
      display: none;
    }

    .sky-menu button,
    #sky-reveal {
      appearance: none;
      border: 1px solid rgba(153, 227, 255, 0.32);
      background: rgba(27, 42, 57, 0.85);
      color: var(--sky-text);
      font: inherit;
      font-size: 11px;
      padding: 6px 8px;
      border-radius: 999px;
      cursor: pointer;
      transition: background 120ms ease, border-color 120ms ease, transform 120ms ease;
    }

    .sky-menu button:hover,
    #sky-reveal:hover {
      background: rgba(36, 59, 77, 0.96);
      border-color: rgba(153, 227, 255, 0.7);
    }

    .sky-menu button:focus-visible,
    #sky-reveal:focus-visible,
    .sky-figure:focus-visible {
      outline: 2px solid rgba(150, 232, 255, 0.9);
      outline-offset: 2px;
    }

    #sky-reveal {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 85;
      display: none;
      background: rgba(11, 19, 28, 0.9);
      border-radius: 999px;
      padding: 7px 10px;
      box-shadow: 0 8px 18px rgba(0,0,0,0.3);
      pointer-events: auto;
    }

    #sky-reveal.visible {
      display: inline-flex;
    }

    @keyframes skyFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }

    @media (max-width: 720px) {
      #sky-sticker {
        width: 110px;
        height: 110px;
      }
      .sky-figure {
        width: 92px;
        height: 92px;
      }
      .sky-bubble {
        left: 95px;
        width: min(210px, calc(100vw - 120px));
        max-width: 210px;
        font-size: 11.5px;
      }
      .sky-menu {
        left: 92px;
        min-width: 160px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .sky-figure { animation: none; }
    }
  `;
  document.head.appendChild(STYLE);

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // ignore storage restrictions
    }
  }

  const tooltip = document.createElement("div");
  tooltip.id = "sky-sticker";
  tooltip.setAttribute("aria-live", "polite");
  tooltip.innerHTML = `
    <div class="sky-shell">
      <div class="sky-figure" id="sky-figure" tabindex="0" role="button" aria-label="Sky, asistente de ensamblaje">
        <canvas id="sky-canvas" width="160" height="160"></canvas>
      </div>
      <div class="sky-bubble" id="sky-bubble" hidden></div>
      <div class="sky-menu" id="sky-menu" hidden>
        <button type="button" data-action="repeat">Repetir</button>
        <button type="button" data-action="voice">Voz: on</button>
        <button type="button" data-action="subtitles">Subtítulos</button>
        <button type="button" data-action="hide">Ocultar</button>
        <button type="button" data-action="reset">Restaurar</button>
      </div>
    </div>
  `;
  document.body.appendChild(tooltip);

  const skySticker = document.getElementById("sky-sticker");
  const skyFigure = document.getElementById("sky-figure");
  const skyBubble = document.getElementById("sky-bubble");
  const skyMenu = document.getElementById("sky-menu");
  const canvas = document.getElementById("sky-canvas");
  const ctx = canvas.getContext("2d");
  const revealButton = document.createElement("button");
  revealButton.id = "sky-reveal";
  revealButton.type = "button";
  revealButton.textContent = "Sky";
  revealButton.setAttribute("aria-label", "Mostrar a Sky");
  document.body.appendChild(revealButton);

  const state = {
    voiceEnabled: true,
    subtitles: true,
    hidden: false,
    speaking: false,
    expression: "feliz",
    suspended: false,
    currentText: "",
    currentKey: null,
    currentMessageKey: null,
    currentAudio: null,
    currentUtterance: null,
    currentToken: 0,
    hideTimer: null,
    drag: null,
    position: { x: 0, y: 0 },
  };

  function setPosition(x, y) {
    const maxX = Math.max(0, window.innerWidth - 140);
    const maxY = Math.max(0, window.innerHeight - 140);
    state.position.x = clamp(x, 0, maxX);
    state.position.y = clamp(y, 0, maxY);
    skySticker.style.transform =
      "translate(" + state.position.x + "px, " + state.position.y + "px)";
    writeStorage("sky.position", {
      x: state.position.x / Math.max(window.innerWidth, 1),
      y: state.position.y / Math.max(window.innerHeight, 1),
    });
  }

  function restorePosition() {
    const stored = readStorage("sky.position", { x: 0.72, y: 0.16 });
    const x = clamp(
      Number(stored.x || 0.72) * window.innerWidth,
      0,
      Math.max(0, window.innerWidth - 140),
    );
    const y = clamp(
      Number(stored.y || 0.16) * window.innerHeight,
      0,
      Math.max(0, window.innerHeight - 140),
    );
    setPosition(x, y);
  }

  function resetPosition() {
    const x = clamp(
      window.innerWidth - 200,
      0,
      Math.max(0, window.innerWidth - 140),
    );
    const y = clamp(90, 0, Math.max(0, window.innerHeight - 140));
    setPosition(x, y);
  }

  function setHidden(value) {
    state.hidden = value;
    skySticker.classList.toggle("hidden", value);
    revealButton.classList.toggle("visible", value);
  }

  function updateMenu() {
    const voiceButton = skyMenu.querySelector('[data-action="voice"]');
    const subtitleButton = skyMenu.querySelector('[data-action="subtitles"]');
    if (voiceButton)
      voiceButton.textContent = "Voz: " + (state.voiceEnabled ? "on" : "off");
    if (subtitleButton)
      subtitleButton.textContent =
        "Subtítulos: " + (state.subtitles ? "on" : "off");
  }

  function hideBubble() {
    if (!state.subtitles && !state.speaking) {
      skyBubble.hidden = true;
    }
  }

  function showBubble(text, keepOpen) {
    if (!text) {
      skyBubble.hidden = true;
      return;
    }
    state.currentText = text;
    skyBubble.innerHTML = text.replace(/\n/g, "<br>");
    skyBubble.hidden = false;
    if (state.hideTimer) {
      clearTimeout(state.hideTimer);
      state.hideTimer = null;
    }
    if (!keepOpen && !state.subtitles) {
      state.hideTimer = setTimeout(() => {
        skyBubble.hidden = true;
      }, 4200);
    }
  }

  function stopAudio() {
    if (state.currentAudio) {
      try {
        state.currentAudio.pause();
      } catch (error) {}
      state.currentAudio = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    state.currentUtterance = null;
  }

  function setSpeaking(value) {
    state.speaking = value;
    skyFigure.classList.toggle("speaking", value);
    if (!value && !state.subtitles) {
      hideBubble();
    }
  }

  function setExpression(expression) {
    state.expression = SKY_EXPRESSIONS[expression] ? expression : "feliz";
  }

  function finaliseSpeaking() {
    setSpeaking(false);
    if (state.subtitles) {
      if (state.currentText) {
        skyBubble.hidden = false;
      }
    } else {
      hideBubble();
    }
  }

  function speakWithBrowserVoice(text) {
    if (
      !("speechSynthesis" in window) ||
      typeof SpeechSynthesisUtterance === "undefined"
    ) {
      finaliseSpeaking();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    utterance.lang = "es-PE";
    utterance.rate = 0.96;
    utterance.pitch = 1.04;
    utterance.volume = 1;
    utterance.voice =
      voices.find((voice) => /^es(-|_)(PE|MX|ES)/i.test(voice.lang)) ||
      voices.find((voice) => /^es/i.test(voice.lang)) ||
      null;
    state.currentUtterance = utterance;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      if (state.currentUtterance === utterance) state.currentUtterance = null;
      finaliseSpeaking();
    };
    utterance.onerror = () => {
      if (state.currentUtterance === utterance) state.currentUtterance = null;
      finaliseSpeaking();
    };
    try {
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      state.currentUtterance = null;
      finaliseSpeaking();
    }
  }

  function playAudio(url, text, key) {
    if (!url || !state.voiceEnabled) {
      finaliseSpeaking();
      return;
    }

    const audio = new Audio(url);
    state.currentAudio = audio;
    audio.volume = 1;
    audio.preload = "auto";
    audio.onplay = () => setSpeaking(true);
    audio.onended = () => {
      if (state.currentAudio === audio) {
        state.currentAudio = null;
      }
      finaliseSpeaking();
    };
    audio.onerror = () => {
      if (state.currentAudio === audio) {
        state.currentAudio = null;
        speakWithBrowserVoice(text);
      }
    };
    audio.play().catch(() => {
      if (state.currentAudio === audio) {
        state.currentAudio = null;
        speakWithBrowserVoice(text);
      }
    });
  }

  function getCurrentStep() {
    const pasos =
      window.COMPONENTES && window.COMPONENTES.PASOS
        ? window.COMPONENTES.PASOS
        : [];
    const source = (infoEl.textContent || "").trim();
    if (!source) return pasos[0] || null;

    for (const paso of pasos) {
      const titleMatch = paso.n && source.includes(paso.n);
      const partMatch = paso.p && paso.p.some((item) => source.includes(item));
      if (titleMatch || partMatch) {
        return paso;
      }
    }

    const infoTitle =
      (
        document.querySelector("#info b") ||
        document.querySelector("#info strong") ||
        infoEl
      ).textContent || "";
    if (infoTitle && infoTitle !== "") {
      const stepByTitle = pasos.find(
        (paso) => paso.n && infoTitle.includes(paso.n),
      );
      if (stepByTitle) return stepByTitle;
    }

    return pasos[0] || null;
  }

  function conciseGuideMessage() {
    const sourceText = (infoEl.textContent || "").replace(/\s+/g, " ").trim();
    const paso = getCurrentStep();
    if (!sourceText) {
      return "Sigue el siguiente paso del montaje.";
    }
    if (/colocada correctamente|correctamente/i.test(sourceText)) {
      return "¡Encajó! Continúa con el siguiente componente.";
    }
    if (paso && paso.id && paso.t) {
      return paso.t;
    }
    if (/fuente|psu/i.test(sourceText)) {
      return "Alinea la fuente con el chasis y fija sus cuatro tornillos.";
    }
    if (/placa madre|mobo/i.test(sourceText)) {
      return "Ubica la placa madre sobre los separadores y atorníllala.";
    }
    if (/procesador|cpu/i.test(sourceText)) {
      return "Alinea el triángulo dorado con la marca del zócalo y cierra la palanca.";
    }
    if (/refrigeraci|aio/i.test(sourceText)) {
      return "Coloca la bomba sobre el procesador y ajusta los tornillos en cruz.";
    }
    if (/memoria|ram/i.test(sourceText)) {
      return "Alinea la muesca con la ranura y empuja hasta encajar.";
    }
    if (/ssd|m\.2|nvme/i.test(sourceText)) {
      return "Inserta el SSD inclinado, apriétalo y fíjalo con el tornillo.";
    }
    if (/tarjeta de video|gpu/i.test(sourceText)) {
      return "Alinea la GPU con la ranura PCIe y asegúrala al case.";
    }
    if (/panel de cristal|glass/i.test(sourceText)) {
      return "Desliza el panel de vidrio hasta cerrar el gabinete.";
    }
    if (/teclado|kb/i.test(sourceText)) {
      return "Conecta el teclado al puerto USB disponible.";
    }
    if (/mouse|ratón/i.test(sourceText)) {
      return "Conecta el mouse al puerto USB disponible.";
    }
    if (/monitor|mon/i.test(sourceText)) {
      return "Conecta el cable de video del monitor y enciéndelo.";
    }
    if (/parlantes|spk/i.test(sourceText)) {
      return "Coloca los parlantes a ambos lados del monitor.";
    }
    if (/encender|final/i.test(sourceText)) {
      return "¡Muy bien! El equipo está listo para encenderse.";
    }
    if (paso && paso.n) {
      return paso.t || "Sigue la indicación de " + paso.n + ".";
    }
    return "Sigue el siguiente paso del montaje.";
  }

  function getAudioEntryForKey(key) {
    const entry = AUDIO_MANIFEST[key];
    if (entry && entry.clip) {
      return entry;
    }
    return null;
  }

  function speakText(text, key, force) {
    const safeKey = key || "bienvenida";
    const entry = getAudioEntryForKey(safeKey);
    const subtitle = (entry && entry.subtitle) || text;
    const messageKey = safeKey + "::" + text;

    if (!force && state.currentMessageKey === messageKey && state.speaking) {
      return;
    }

    stopAudio();
    state.currentKey = safeKey;
    state.currentMessageKey = messageKey;
    setExpression(
      /correctamente|encajó|excelente|muy bien|ensamblaje completo|equipo listo/i.test(
        text,
      )
        ? "contento"
        : SKY_STEP_EXPRESSIONS[safeKey] || "pensando",
    );
    showBubble(subtitle, true);

    if (!state.voiceEnabled) {
      setSpeaking(false);
      return;
    }

    if (entry && entry.clip) {
      setSpeaking(true);
      playAudio(entry.clip, subtitle, safeKey);
      return;
    }

    speakWithBrowserVoice(subtitle);
  }

  function getStepAudioKey(step) {
    if (step && step.p && step.p[0]) return step.p[0];
    const source = (infoEl.textContent || "").toLowerCase();
    if (/encender|ensamblaje completo|equipo listo/.test(source))
      return "final";
    if (/chasis inferior|base de la laptop/.test(source)) return "base";
    if (/placa base|motherboard/.test(source)) return "mobo";
    if (/ryzen|procesador|\bcpu\b/.test(source)) return "cpu";
    if (/memoria ram|\bram\b/.test(source)) return "ram";
    if (/ssd|nvme|m\.2/.test(source)) return "ssd";
    if (/enfriamiento|ventiladores/.test(source)) return "cool";
    if (/bater[ií]a/.test(source)) return "bat";
    if (/teclado|carcasa superior/.test(source)) return "deck";
    if (/pantalla/.test(source)) return "lid";
    return "bienvenida";
  }

  function handleMessageFromInfo() {
    const text = conciseGuideMessage();
    const step = getCurrentStep();
    const key = getStepAudioKey(step);
    const messageKey = key + "::" + text;
    if (lastMessageKey && lastMessageKey === messageKey) {
      return;
    }
    lastMessageKey = messageKey;
    speakText(text, key, false);
  }

  let lastMessageKey = "";

  function triggerIntro() {
    const text = "¡Hola! Soy Sky, tu guía del ensamblaje.";
    lastMessageKey = "intro::" + text;
    setExpression("feliz");
    speakText(text, "bienvenida", true);
  }

  function setSkyVoiceLabel() {
    const voiceButton = skyMenu.querySelector('[data-action="voice"]');
    if (voiceButton) {
      voiceButton.textContent = "Voz: " + (state.voiceEnabled ? "on" : "off");
    }
  }

  function bindActionButtons() {
    skyMenu.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const action = button.dataset.action;

      if (action === "repeat") {
        if (state.currentText) {
          speakText(state.currentText, state.currentKey || "bienvenida", true);
        }
      }
      if (action === "voice") {
        state.voiceEnabled = !state.voiceEnabled;
        if (!state.voiceEnabled) {
          stopAudio();
          setSpeaking(false);
        }
        updateMenu();
      }
      if (action === "subtitles") {
        state.subtitles = !state.subtitles;
        if (state.subtitles) {
          showBubble(state.currentText || "Sky te acompaña.", true);
        } else {
          skyBubble.hidden = true;
        }
        updateMenu();
      }
      if (action === "hide") {
        setHidden(true);
      }
      if (action === "reset") {
        resetPosition();
      }
      skyMenu.hidden = true;
    });

    skyFigure.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        skyMenu.hidden = !skyMenu.hidden;
      }
    });

    skyFigure.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      skyMenu.hidden = !skyMenu.hidden;
    });

    revealButton.addEventListener("click", () => {
      setHidden(false);
      skyMenu.hidden = true;
    });

    skySticker.addEventListener(
      "pointerdown",
      (event) => {
        if (event.target.closest("button")) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        state.drag = {
          offsetX: event.clientX - state.position.x,
          offsetY: event.clientY - state.position.y,
          moved: false,
        };
        skySticker.setPointerCapture(event.pointerId);
      },
      { passive: false },
    );

    skySticker.addEventListener(
      "pointermove",
      (event) => {
        if (!state.drag) return;
        event.preventDefault();
        state.drag.moved = true;
        setPosition(
          event.clientX - state.drag.offsetX,
          event.clientY - state.drag.offsetY,
        );
      },
      { passive: false },
    );

    function endDrag(event) {
      if (!state.drag) return;
      if (event && event.pointerId !== undefined) {
        try {
          skySticker.releasePointerCapture(event.pointerId);
        } catch (error) {}
      }
      if (!state.drag.moved) {
        skyMenu.hidden = !skyMenu.hidden;
      }
      state.drag = null;
    }

    skySticker.addEventListener("pointerup", endDrag);
    skySticker.addEventListener("pointercancel", endDrag);
    window.addEventListener("resize", () => {
      setPosition(state.position.x, state.position.y);
    });
  }

  function paintSkyPortrait() {
    const image = new Image();
    let imageLoaded = false;
    let imageFailed = false;
    image.onload = () => {
      imageLoaded = true;
    };
    image.onerror = () => {
      imageFailed = true;
    };

    function drawFallback() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(124, 231, 255, 0.85)";
      ctx.beginPath();
      ctx.arc(80, 80, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#071218";
      ctx.beginPath();
      ctx.arc(63, 70, 7, 0, Math.PI * 2);
      ctx.arc(97, 70, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(80, 92, 18, 0, Math.PI, false);
      ctx.strokeStyle = "#071218";
      ctx.lineWidth = 5;
      ctx.stroke();
    }

    function line(points, width) {
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let index = 1; index < points.length; index++) {
        ctx.lineTo(points[index][0], points[index][1]);
      }
      ctx.stroke();
    }

    function arc(x, y, radiusX, radiusY, start, end, width) {
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.ellipse(x, y, radiusX, radiusY, 0, start, end);
      ctx.stroke();
    }

    function eye(x, y, radiusX, radiusY, blink) {
      ctx.beginPath();
      ctx.ellipse(
        x,
        y,
        radiusX,
        Math.max(3, radiusY * blink),
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      if (blink > 0.5) {
        ctx.fillStyle = "rgba(246, 255, 255, 0.94)";
        ctx.beginPath();
        ctx.ellipse(
          x + radiusX * 0.28,
          y - radiusY * 0.38,
          radiusX * 0.25,
          radiusY * 0.25,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.fillStyle = "#42f7ff";
      }
    }

    function drawExpression(time) {
      const expression = SKY_EXPRESSIONS[state.expression] || SKY_EXPRESSIONS.feliz;
      const blink =
        expression.eyes === "closed"
          ? 0.08
          : (time % 4.3 > 4.16 ? 0.06 : 1);
      const leftX = 515;
      const rightX = 725;
      const baseY = 482;

      ctx.save();
      ctx.scale(canvas.width / 1254, canvas.height / 1254);
      ctx.shadowColor = "#15dcff";
      ctx.shadowBlur = 16;
      ctx.fillStyle = "#3cf3ff";
      ctx.strokeStyle = "#35eaff";

      if (expression.eyes === "laugh") {
        arc(leftX, 478, 34, 22, Math.PI * 1.04, Math.PI * 1.96, 12);
        arc(rightX, 478, 34, 22, Math.PI * 1.04, Math.PI * 1.96, 12);
      } else if (expression.eyes === "closed") {
        arc(leftX, 485, 38, 13, Math.PI * 1.05, Math.PI * 1.95, 10);
        arc(rightX, 485, 38, 13, Math.PI * 1.05, Math.PI * 1.95, 10);
      } else if (expression.eyes === "curious") {
        eye(leftX, 474, 25, 38, blink);
        eye(rightX, 488, 29, 31, blink);
      } else if (expression.eyes === "round") {
        eye(leftX, baseY, 36, 46, blink);
        eye(rightX, baseY, 36, 46, blink);
      } else if (expression.eyes === "happy") {
        arc(leftX, 476, 35, 25, Math.PI * 1.03, Math.PI * 1.97, 13);
        arc(rightX, 476, 35, 25, Math.PI * 1.03, Math.PI * 1.97, 13);
      } else {
        const eyeY = expression.eyes === "open" ? baseY : 486;
        const eyeRadiusX =
          expression.eyes === "open"
            ? 28
            : expression.eyes === "angry"
              ? 26
              : expression.eyes === "curious"
                ? 25
                : 24;
        const eyeRadiusY =
          expression.eyes === "open"
            ? 50
            : expression.eyes === "angry"
              ? 30
              : expression.eyes === "curious"
                ? 38
                : expression.eyes === "worried"
                  ? 32
                  : 36;
        eye(leftX, eyeY, eyeRadiusX, eyeRadiusY, blink);
        eye(rightX, eyeY, eyeRadiusX, eyeRadiusY, blink);
      }

      if (expression.brow !== "none") {
        ctx.shadowBlur = 8;
        if (expression.brow === "angry") {
          line([[486, 401], [548, 420]], 9);
          line([[702, 420], [760, 399]], 9);
        } else if (expression.brow === "sad") {
          line([[484, 398], [545, 386]], 8);
          line([[705, 386], [763, 398]], 8);
        } else if (expression.brow === "worried") {
          arc(516, 392, 28, 9, Math.PI * 1.06, Math.PI * 1.93, 8);
          arc(738, 392, 28, 9, Math.PI * 1.06, Math.PI * 1.93, 8);
        } else if (expression.brow === "curious") {
          arc(516, 389, 26, 8, Math.PI * 1.06, Math.PI * 1.93, 8);
          line([[704, 397], [760, 390]], 8);
        } else {
          const raised = expression.brow === "raised";
          arc(
            520,
            raised ? 382 : 399,
            34,
            12,
            Math.PI * 1.1,
            Math.PI * 1.9,
            9,
          );
          arc(
            739,
            raised ? 384 : 402,
            34,
            12,
            Math.PI * 1.1,
            Math.PI * 1.9,
            9,
          );
        }
      }

      ctx.shadowBlur = 12;
      const mouth = state.speaking
        ? ["smallo", "open", "tiny", "open"][Math.floor(time * 9) % 4]
        : expression.mouth;
      if (mouth === "o" || mouth === "smallo" || mouth === "open") {
        ctx.beginPath();
        ctx.ellipse(
          625,
          mouth === "open" ? 548 : mouth === "o" ? 547 : 546,
          mouth === "open" ? 18 : mouth === "o" ? 12 : 10,
          mouth === "open" ? 12 : mouth === "o" ? 17 : 12,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      } else if (mouth === "smile") {
        arc(624, 536, 30, 18, 0.18, Math.PI - 0.18, 9);
      } else if (mouth === "softsmile") {
        arc(625, 541, 18, 9, 0.22, Math.PI - 0.22, 7);
      } else if (mouth === "frown") {
        arc(625, 560, 22, 13, Math.PI * 1.12, Math.PI * 1.88, 8);
      } else if (mouth === "flat") {
        line([[610, 545], [640, 545]], 7);
      } else if (mouth === "zigzag") {
        line([[600, 542], [612, 549], [625, 542], [638, 549], [650, 542]], 7);
      } else {
        ctx.beginPath();
        ctx.moveTo(614, 540);
        ctx.quadraticCurveTo(625, 538, 636, 540);
        ctx.quadraticCurveTo(636, 551, 625, 554);
        ctx.quadraticCurveTo(614, 551, 614, 540);
        ctx.fill();
      }

      if (
        ["feliz", "contento", "pensando"].includes(state.expression)
      ) {
        ctx.save();
        ctx.globalAlpha = state.expression === "contento" ? 0.18 : 0.12;
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#72eaff";
        ctx.beginPath();
        ctx.ellipse(448, 548, 14, 8, 0, 0, Math.PI * 2);
        ctx.ellipse(804, 555, 14, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (state.expression === "triste") {
        ctx.save();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.ellipse(782, 565, 5, 11, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      if (!state.speaking) {
        ctx.save();
        ctx.fillStyle = "#78eaff";
        ctx.shadowColor = "#15dcff";
        ctx.shadowBlur = 10;
        if (state.expression === "pensando") {
          ctx.font = "700 42px system-ui";
          ctx.fillText(
            "?",
            846 + Math.sin(time * 1.5) * 4,
            354 + Math.cos(time * 1.8) * 3,
          );
        } else if (state.expression === "nervioso") {
          ctx.font = "700 40px system-ui";
          ctx.fillText("!", 850, 351 + Math.sin(time * 2) * 2);
        } else if (state.expression === "contento") {
          ctx.font = "700 30px system-ui";
          ctx.fillText("♥", 847, 350);
          ctx.fillText("♥", 885, 378);
        } else if (state.expression === "dormido") {
          ctx.font = "bold 42px system-ui";
          ctx.fillText("Z", 865 + Math.sin(time) * 10, 325 - ((time * 12) % 65));
        } else if (state.expression === "sorp") {
          ctx.font = "700 42px system-ui";
          ctx.fillText("!", 850, 351);
        }
        ctx.restore();
      }
    }

    function draw(time) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (imageLoaded) {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      } else if (imageFailed) {
        drawFallback();
      }
      drawExpression(time);
      window.requestAnimationFrame(draw);
    }

    window.requestAnimationFrame(draw);
    image.src = SKY_IMAGE_PRIMARY;
  }

  function bindInfoObserver() {
    const observer = new MutationObserver(() => {
      if (state.hidden || state.suspended) return;
      clearTimeout(handleInfoObserverTimer);
      handleInfoObserverTimer = setTimeout(() => {
        if (!state.suspended) handleMessageFromInfo();
      }, 180);
    });
    observer.observe(infoEl, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return observer;
  }

  let handleInfoObserverTimer = 0;

  bindActionButtons();
  bindInfoObserver();
  updateMenu();
  setSkyVoiceLabel();
  resetPosition();
  paintSkyPortrait();
  revealButton.classList.remove("visible");

  window.SKY = {
    hablando: () => state.speaking,
    decir: (texto, expr) => {
      if (!texto) return;
      state.currentKey = (expr || "bienvenida") + "::" + texto;
      showBubble(texto, true);
      setSpeaking(true);
      setTimeout(() => {
        setSpeaking(false);
        if (!state.subtitles) {
          skyBubble.hidden = true;
        }
      }, 1600);
    },
    detener: () => {
      stopAudio();
      setSpeaking(false);
      if (!state.subtitles) {
        skyBubble.hidden = true;
      }
    },
    suspender: () => {
      if (state.suspended) return;
      state.suspended = true;
      stopAudio();
      setSpeaking(false);
      skyBubble.hidden = true;
      skyMenu.hidden = true;
      skySticker.hidden = true;
      revealButton.hidden = true;
    },
    reanudar: () => {
      if (!state.suspended) return;
      state.suspended = false;
      skySticker.hidden = false;
      revealButton.hidden = false;
      setHidden(state.hidden);
    },
    repetir: () => {
      if (state.currentText) {
        speakText(state.currentText, state.currentKey || "bienvenida", true);
      }
    },
    mostrar: () => setHidden(false),
    ocultar: () => setHidden(true),
    resetearPosicion: resetPosition,
    voz: () => state.voiceEnabled,
    alternarVoz: () => {
      state.voiceEnabled = !state.voiceEnabled;
      if (!state.voiceEnabled) {
        stopAudio();
        setSpeaking(false);
      }
      updateMenu();
      return state.voiceEnabled;
    },
    subtitulos: () => state.subtitles,
  };

  triggerIntro();
})();
