(() => {
  const $ = (id) => document.getElementById(id);
  const N1 =
    "En un ensamblaje real, el procesador, la RAM y el SSD M.2 se instalan sobre la placa madre <b>antes</b> de atornillarla al case: hay más espacio y es más seguro. Aquí se muestran después para ver cada pieza en su lugar final. Antes de tocar componentes, descarga la electricidad estática tocando una superficie metálica.";
  const NOTA = {
    psu: "Muchos armadores instalan la fuente después de la placa madre; ambos órdenes son válidos según el case.",
    cpu: N1,
    ram: N1,
    ssd: N1,
    glass:
      "Es lo último que se coloca, después de revisar y ordenar los cables.",
  };
  let md = null;
  let focoPrevio = null;
  function modal(h) {
    cerrar();
    focoPrevio = document.activeElement;
    md = document.createElement("div");
    md.id = "mod";
    md.innerHTML = '<div class="card" tabindex="-1">' + h + "</div>";
    document.body.appendChild(md);
    const tarjeta = md.firstElementChild;
    tarjeta.setAttribute("role", "dialog");
    tarjeta.setAttribute("aria-modal", "true");
    const titulo = tarjeta.querySelector("h2, h3");
    if (titulo) {
      titulo.id = "titulo-modal";
      tarjeta.setAttribute("aria-labelledby", titulo.id);
    }
    const primerControl = tarjeta.querySelector("button");
    (primerControl || tarjeta).focus();
  }
  function cerrar() {
    if (md) {
      md.remove();
      md = null;
      if (focoPrevio && focoPrevio.isConnected) focoPrevio.focus();
      focoPrevio = null;
    }
  }
  addEventListener("keydown", (e) => {
    if (!md) return;
    if (e.key === "Escape") {
      cerrar();
      return;
    }
    if (e.key !== "Tab") return;
    const controles = md.querySelectorAll(
      'a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])',
    );
    if (!controles.length) {
      e.preventDefault();
      md.firstElementChild.focus();
      return;
    }
    const primero = controles[0],
      ultimo = controles[controles.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  });
  let EST = { t0: 0, t1: 0, ints: 0, ayudas: 0 },
    tF = 0;
  const fmt = (ms) => {
    const s = Math.floor(ms / 1000);
    return (
      String(Math.floor(s / 60)).padStart(2, "0") +
      ":" +
      String(s % 60).padStart(2, "0")
    );
  };
  const nuevo = () => {
    EST = { t0: 0, t1: 0, ints: 0, ayudas: 0 };
    clearTimeout(tF);
  };
  $("rst").addEventListener("click", nuevo);
  $("auto").addEventListener("click", () => {
    if (cur >= PASOS.length - 1) nuevo();
  });
  mano.insertAdjacentHTML("afterbegin", '<div id="mhud"></div>');
  setInterval(() => {
    const h = $("mhud");
    if (!h || !EST.t0) return;
    h.innerHTML =
      "⏱ <b>" +
      fmt((EST.t1 || performance.now()) - EST.t0) +
      "</b> · Intentos fallidos: <b>" +
      EST.ints +
      "</b>" +
      (EST.ayudas ? " · Ayudas: <b>" + EST.ayudas + "</b>" : "");
  }, 500);
  mano.insertAdjacentHTML(
    "afterbegin",
    '<button id="mmin">▾ Ocultar controles</button>',
  );
  $("mmin").onclick = () => {
    const v = mano.classList.toggle("mini");
    $("mmin").textContent = v ? "▴ Mostrar controles" : "▾ Ocultar controles";
  };
  const _im = iniciarManual;
  iniciarManual = function (...a) {
    if (!EST.t0) EST.t0 = performance.now();
    if (innerWidth < 700) $("panel").classList.add("min");
    return _im(...a);
  };
  let dr = 0;
  addEventListener(
    "pointerdown",
    () => {
      if (man && man.drag) dr = 1;
    },
    true,
  );
  addEventListener("pointerup", () => {
    if (!dr) return;
    dr = 0;
    if (man && man.act && !man.snap) EST.ints++;
  });
  $("mauto").addEventListener(
    "click",
    () => {
      if (man) EST.ayudas++;
    },
    true,
  );
  const _paso = paso;
  paso = function (inst, fa) {
    const antes = cur;
    _paso(inst, fa);
    if (cur === antes) return;
    const p = PASOS[cur],
      n = NOTA[p.p[0]];
    if (n)
      info.insertAdjacentHTML(
        "beforeend",
        '<div class="nota">ℹ️ <b>En la práctica:</b> ' + n + "</div>",
      );
    if (p.end) {
      info.insertAdjacentHTML(
        "beforeend",
        '<div style="margin-top:8px"><button id="qzi">🎓 Hacer el quiz</button></div>',
      );
      $("qzi").onclick = quiz;
      if (!inst) {
        clearTimeout(tF);
        tF = setTimeout(() => {
          if (cur >= PASOS.length - 1) felicitar();
        }, 2600);
      }
    }
  };
  function felicitar() {
    EST.t1 = EST.t1 || performance.now();
    const indiceRevision = PASOS.findIndex((paso) => paso.checklist),
      revisionCompleta =
        indiceRevision >= 0 &&
        PASOS[indiceRevision].checklist.every((_, i) => verificaciones.has(i));
    let h =
      "<h2>🎉 ¡Vista final del ensamblaje!</h2><p>La torre, los periféricos y el monitor están listos. " +
      (revisionCompleta
        ? "La revisión previa también está completa."
        : "Si solo querías ver el resultado, puedes saltarte la lista; para energizar un equipo real, completa primero la revisión.") +
      "</p>";
    if (EST.t0)
      h +=
        '<div class="stats"><div><b>' +
        fmt(EST.t1 - EST.t0) +
        "</b>Tiempo</div><div><b>" +
        EST.ints +
        "</b>Intentos fallidos</div><div><b>" +
        EST.ayudas +
        "</b>Ayudas</div></div><p>" +
        (EST.ayudas
          ? "Buen trabajo. Repítelo sin usar «Colocar por mí» para mejorar tu marca."
          : EST.ints <= 5
            ? "¡Excelente! Lo armaste tú solo y con muy pocos errores."
            : "Muy bien: lo lograste sin ayudas. Con práctica reducirás los intentos.") +
        "</p>";
    else
      h +=
        "<p>Para practicar tú mismo, activa el modo <b>✋ Manual</b> y coloca cada pieza con el mouse o el dedo.</p>";
    h +=
      '<div class="bt"><button id="q1">🎓 Hacer el quiz</button><button class="sec" id="c1">Cerrar</button></div>';
    modal(h);
    $("q1").onclick = quiz;
    $("c1").onclick = cerrar;
  }
  function ayuda() {
    modal(
      '<h2>Cómo usar el simulador</h2><ul><li><b>Ver:</b> arrastra para girar la vista y usa la rueda (o pellizca en el celular) para acercar.</li><li><b>Avanzar:</b> «Siguiente» recorre las piezas y los periféricos. «Auto» avanza automáticamente y «Piezas» abre la galería.</li><li><b>Manual:</b> arrastra las piezas hasta su guía y gíralas (Q/E, W/S, A/D). Cuando la guía se pone verde, encajan solas.</li><li><b>Conexiones:</b> sigue las indicaciones de cada pieza y comprueba las conexiones internas en la lista antes de encender.</li><li><b>Revisión:</b> es obligatoria al avanzar paso a paso; selecciona «Encender el equipo» en la lista si solo quieres ver el resultado.</li><li><b>Quiz:</b> comprueba lo aprendido con 8 preguntas.</li></ul><div class="bt"><button id="ok1">Entendido</button></div>',
    );
    $("ok1").onclick = cerrar;
  }
  window.mostrarAyuda = ayuda;
  const QS = [
    [
      "¿Qué pieza convierte la corriente de la pared en la electricidad que necesita cada componente?",
      "Fuente de alimentación",
      ["Placa madre", "Tarjeta de video", "Refrigeración líquida"],
      "La fuente reparte la energía por sus cables; sin ella el equipo no enciende.",
    ],
    [
      "¿Cuál es el «cerebro» de la computadora?",
      "Procesador (CPU)",
      ["Memoria RAM", "Unidad SSD", "Placa madre"],
      "La CPU ejecuta las instrucciones de los programas y hace los cálculos.",
    ],
    [
      "¿Qué pasa con los datos de la memoria RAM cuando apagas el equipo?",
      "Se borran",
      [
        "Se guardan para siempre",
        "Pasan a la tarjeta de video",
        "Se copian a la fuente de alimentación",
      ],
      "La RAM es memoria de trabajo temporal: es muy rápida, pero pierde su contenido sin electricidad.",
    ],
    [
      "¿Qué pieza guarda de forma permanente el sistema operativo y tus archivos?",
      "Unidad SSD",
      ["Memoria RAM", "Procesador", "Panel de cristal"],
      "El SSD conserva los datos aunque se apague el equipo y los entrega a gran velocidad.",
    ],
    [
      "¿Para qué sirve la refrigeración líquida (AIO)?",
      "Para sacar el calor del procesador con un radiador y ventiladores",
      [
        "Para guardar archivos",
        "Para dar energía a la placa madre",
        "Para mejorar la imagen del monitor",
      ],
      "Un líquido absorbe el calor de la CPU y lo lleva al radiador, donde los ventiladores lo expulsan.",
    ],
    [
      "En un ensamblaje real, ¿qué conviene instalar sobre la placa madre antes de atornillarla al case?",
      "Procesador, RAM y SSD M.2",
      [
        "Panel de cristal, teclado y mouse",
        "Monitor y parlantes",
        "Solo la fuente de alimentación",
      ],
      "Fuera del case hay más espacio y visibilidad, lo que reduce el riesgo de doblar pines o dañar piezas.",
    ],
    [
      "Si el equipo tiene tarjeta de video dedicada, ¿a qué pieza se conecta el cable del monitor?",
      "A la tarjeta de video",
      ["A la placa madre", "A la fuente de alimentación", "Al teclado"],
      "La tarjeta de video genera la imagen y la envía al monitor por DisplayPort o HDMI.",
    ],
    [
      "¿Por qué el panel de cristal se coloca al final?",
      "Porque cierra la torre y estorbaría durante el montaje",
      [
        "Porque es la pieza más pesada",
        "Porque da energía al monitor",
        "Porque guarda los archivos",
      ],
      "Al final también puedes revisar y ordenar los cables antes de cerrar el case.",
    ],
  ];
  const mez = (a) =>
    a
      .map((v) => [Math.random(), v])
      .sort((x, y) => x[0] - y[0])
      .map((x) => x[1]);
  function quiz() {
    let i = 0,
      ok = 0;
    const ver = () => {
      if (i >= QS.length) {
        modal(
          "<h2>Resultado: " +
            ok +
            " / " +
            QS.length +
            "</h2><p>" +
            (ok >= 7
              ? "🏆 ¡Excelente! Dominas los componentes de una PC."
              : ok >= 5
                ? "👍 Muy bien. Repasa en la galería las piezas que fallaste."
                : "📘 Sigue practicando: revisa la galería de piezas e inténtalo otra vez.") +
            '</p><div class="bt"><button id="r1">Reintentar</button><button class="sec" id="c2">Cerrar</button></div>',
        );
        $("r1").onclick = quiz;
        $("c2").onclick = cerrar;
        return;
      }
      const q = QS[i],
        op = mez([q[1], ...q[2]]);
      modal(
        "<small>Pregunta " +
          (i + 1) +
          " de " +
          QS.length +
          '</small><div class="pb"><i style="width:' +
          (i / QS.length) * 100 +
          '%"></i></div><h3>' +
          q[0] +
          "</h3>" +
          op
            .map(
              (o, k) =>
                '<button class="op" data-k="' + k + '">' + o + "</button>",
            )
            .join("") +
          '<div id="fb"></div>',
      );
      md.querySelectorAll(".op").forEach(
        (b) =>
          (b.onclick = () => {
            const bien = op[b.dataset.k] === q[1];
            if (bien) ok++;
            md.querySelectorAll(".op").forEach((x) => {
              x.disabled = true;
              if (op[x.dataset.k] === q[1]) x.classList.add("good");
            });
            if (!bien) b.classList.add("bad");
            $("fb").innerHTML =
              "<p>" +
              (bien ? "✅ ¡Correcto! " : "❌ No es esa. ") +
              q[3] +
              '</p><div class="bt"><button id="nx">' +
              (i + 1 < QS.length ? "Siguiente" : "Ver resultado") +
              "</button></div>";
            $("nx").onclick = () => {
              i++;
              ver();
            };
          }),
      );
    };
    ver();
  }
  document.querySelector("#bar .toolbar-utilities").insertAdjacentHTML(
    "beforeend",
    '<button id="ayu">Ayuda</button><button id="qzb">Quiz</button>',
  );
  $("ayu").onclick = ayuda;
  $("qzb").onclick = quiz;
  $("panel-toggle").onclick = (e) => {
    const panel = $("panel");
    const oculto = panel.classList.toggle("min");
    const boton = e.currentTarget;
    boton.textContent = oculto ? "⌄" : "⌃";
    boton.setAttribute("aria-expanded", String(!oculto));
    boton.setAttribute(
      "aria-label",
      oculto ? "Mostrar panel del simulador" : "Ocultar panel del simulador",
    );
    boton.title = oculto ? "Mostrar panel" : "Ocultar panel";
  };
})();
