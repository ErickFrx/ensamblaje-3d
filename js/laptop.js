
      // ================= 1. PASOS DEL ENSAMBLAJE =================
      // id = nombre de la pieza | c = cámara [x,y,z, mira-x,mira-y,mira-z]
      const VISTA = [0, 18, 24, 0, 0, -1];
      const PASOS = [
        {
          n: "Chasis inferior",
          id: "base",
          t: "Es la base de la laptop. Aquí se alojan todos los componentes internos.",
          c: [0, 15, 15, 0, 0, 0],
        },
        {
          n: "Placa base",
          id: "mobo",
          t: "Alinea la placa base con los soportes y los puertos del chasis; fíjala en sus puntos de montaje.",
          c: [0, 19, 10, 0, 0.2, -1.9],
        },
        {
          n: "Identificar el procesador",
          id: "cpu",
          t: "Identifica el procesador soldado a la placa. En esta laptop educativa no se extrae ni se inserta en un zócalo.",
          c: [-2, 7, 5, -1.5, 0.4, -2.6],
        },
        {
          n: "Memoria RAM",
          id: "ram",
          t: "Alinea la muesca del SO-DIMM, introdúcelo inclinado y bájalo hasta que los retenedores lo sujeten. Repite con el segundo módulo.",
          c: [4, 7, 6, 4.5, 0.4, 0],
        },
        {
          n: "SSD M.2",
          id: "ssd",
          t: "Inserta la unidad en su ranura M.2 y asegúrala con el tornillo.",
          c: [-4, 7, 6, -4.5, 0.4, 0.2],
        },
        {
          n: "Enfriamiento",
          id: "cool",
          t: "Instala el sistema térmico sobre la placa para disipar el calor de los componentes.",
          c: [-1, 9, 7, -1.5, 0.5, -2.6],
        },
        {
          n: "Batería",
          id: "bat",
          t: "Coloca la batería en la parte delantera del chasis y conecta su cable.",
          c: [0, 10, 13, 0, 0.3, 3],
        },
        {
          id: "deck",
          n: "Teclado y carcasa superior",
          t: "Antes de cerrar la carcasa superior, revisa las conexiones del teclado y el touchpad. Alinea y fija la cubierta.",
          c: [0, 11, 16, 0, 1, 0],
        },
        {
          n: "Pantalla",
          id: "lid",
          t: "Une la pantalla a la base por las bisagras y conecta el cable plano.",
          c: [0, 8, 22, 0, 3, -3],
        },
        {
          n: "Revisión y encendido",
          id: null,
          t: "Comprueba las conexiones, fijaciones y refrigeración. ¡Ensamblaje completo!",
          c: [0, 6, 23, 0, 3, -1],
        },
      ];
      window.COMPONENTES = window.COMPONENTES || {};
      window.COMPONENTES.PASOS = PASOS.map((p) => ({
        n: p.n,
        id: p.id,
        p: p.id && p.id !== "base" ? [p.id] : [],
        t: p.t,
      }));

      // ================= 2. ESCENA =================
      const cv = document.getElementById("c"),
        R = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
      R.setPixelRatio(1);
      const S = new THREE.Scene();
      S.background = new THREE.Color(0x04060b);
      const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
      cam.position.set(...VISTA.slice(0, 3));
      const ctl = new THREE.OrbitControls(cam, cv);
      ctl.enableDamping = true;
      ctl.target.set(0, 0, -1);
      S.add(new THREE.HemisphereLight(0xaabbee, 0x101018, 1.1));
      const dl = new THREE.DirectionalLight(0xffffff, 1.1);
      dl.position.set(6, 14, 12);
      S.add(dl);
      S.fog=new THREE.Fog(0x04060b,35,80);
      {
        const pm = new THREE.PMREMGenerator(R),
          es = new THREE.Scene();
        es.background = new THREE.Color(0x0b0e16); // reflejos de paneles de luz
        [
          [0x44ccff, -8, 6, 5],
          [0xff44cc, 9, 5, -4],
          [0xffffff, 0, 10, 2],
        ].forEach(([c, x, y, z]) => {
          const b = new THREE.Mesh(
            new THREE.BoxGeometry(7, 0.4, 7),
            new THREE.MeshBasicMaterial({
              color: new THREE.Color(c).multiplyScalar(4),
            }),
          );
          b.position.set(x, y, z);
          es.add(b);
        });
        S.environment = pm.fromScene(es, 0.04).texture;
        es.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose()}});pm.dispose();
      }
      const comp = new THREE.EffectComposer(R);
      comp.addPass(new THREE.RenderPass(S, cam));
      comp.addPass(
        new THREE.UnrealBloomPass(
          new THREE.Vector2(innerWidth, innerHeight),
          0.6,
          0.6,
          0.9,
        ),
      );
      comp.passes[1].enabled=false;
      function ajustar() {
        R.setSize(innerWidth, innerHeight, false);
        comp.setSize(innerWidth, innerHeight);
        cam.aspect = innerWidth / innerHeight;
        cam.fov = innerWidth < 600 ? 82 : 42;
        if(innerWidth>700)cam.setViewOffset(innerWidth,innerHeight,-Math.min(110,(innerWidth-700)*.18),0,innerWidth,innerHeight);else cam.clearViewOffset();
        cam.updateProjectionMatrix();
      }
      addEventListener("resize", ajustar);
      ajustar();

      // ================= 3. UTILIDADES =================
      const M = (c, o = {}) =>
        new THREE.MeshStandardMaterial(
          Object.assign({ color: c, roughness: 0.5, metalness: 0.4 }, o),
        );
      const box = (w, h, d, m, x, y, z) => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
        b.position.set(x, y, z);
        return b;
      };
      const dark = M(0x1b2030),
        pcbM = M(0x155f42, {
          metalness: 0.2,
          emissive: 0x07180e,
          emissiveIntensity: 0.12,
        }),
        chip = M(0x0a0a0f),
        cobre = M(0xc4733a, { metalness: 0.9, roughness: 0.3 });
      const neon = M(0x00e5ff, { emissive: 0x00e5ff, emissiveIntensity: 0.9 });
      const L = new THREE.Group();
      S.add(L); // grupo de toda la laptop
      const P = {}; // piezas por id
      function pieza(id, hijos, pos) {
        const g = new THREE.Group();
        hijos.forEach((h) => g.add(h));
        g.userData = { to: pos || new THREE.Vector3(), t: 1 };
        g.position.copy(g.userData.to);
        g.visible = false;
        L.add(g);
        P[id] = g;
        return g;
      }

      const {fans,teclas,scr,texOn,texOff}=crearLaptopEducativa(THREE,pieza,M);
      // ================= 5. CONTROL DE PASOS =================
      let paso = -1,
        encendido = false,
        trans = 1,
        c0 = { p: new THREE.Vector3(), t: new THREE.Vector3() },
        c1 = { p: new THREE.Vector3(), t: new THREE.Vector3() },
        timer = null;
      const lista = document.getElementById("lista"),
        info = document.getElementById("info-content");
      PASOS.forEach((p, i) => {
        const d = document.createElement("div");
        d.className = "paso";
        d.textContent = i + 1 + " · " + p.n;
        d.tabIndex=0;d.setAttribute('role','button');
        d.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();ir(i)}};
        d.onclick = () => ir(i);
        lista.appendChild(d);
      });
      window.LAPTOP_READY=false;
      let skyStepTimer=0;
      function ir(n, silent=false) {
        if(n>=0&&!window.LAPTOP_READY)return;
        n = Math.max(-1, Math.min(PASOS.length - 1, n));
        PASOS.forEach((p, i) => {
          if (!p.id) return;
          const g = P[p.id],
            ver = p.id==='cpu' ? n>=1 : i<=n;
          if (ver && !g.visible && p.id!=="cpu") g.userData.t = 0; // pieza nueva: empieza la animación de entrada
          g.visible = ver;
        });
        if(window.LAPTOP_EXTERIOR_CARGADO&&n>=7)for(const id of ['mobo','cpu','ram','ssd','cool','bat'])P[id].visible=false;
        encendido = n === PASOS.length - 1;
        scr.map = encendido ? texOn : texOff;
        scr.needsUpdate = true;
        [...lista.children].forEach(
          (d, i) =>
            (d.className = "paso" + (i < n ? " ok" : i === n ? " act" : "")),
        );
        info.innerHTML =
          n < 0
          ? "<b>Listo para empezar</b><br>Pulsa «Siguiente» para iniciar el ensamblaje."
            : "<b>" + PASOS[n].n + "</b><br>" + PASOS[n].t;
        const instalados = Math.min(Math.max(n + 1, 0), PASOS.length - 1),
          siguiente = PASOS[Math.min(n + 1, PASOS.length - 1)];
        document.querySelector("#dock-state strong").textContent =
          n === PASOS.length - 1 ? "COMPLETO" : n < 0 ? "LISTO" : "ENSAMBLAJE";
        document.getElementById("dock-progress-label").textContent =
          n === PASOS.length - 1
            ? "10 de 10 etapas · Equipo encendido"
            : Math.max(n+1,0) + " de 10 etapas · Siguiente: " + siguiente.n;
        document.getElementById("dock-progress-fill").style.width =
          (Math.max(n+1,0) / 10) * 100 + "%";
        document.getElementById("sig").disabled=n===PASOS.length-1;
        document.getElementById("prev").disabled = n < 0;
        document.getElementById("dock-prev").disabled = n < 0;
        document.getElementById("dock-next").disabled = n === PASOS.length - 1;
        if(!window.LAPTOP_READY){for(const id of ['sig','prev','dock-next','dock-prev'])document.getElementById(id).disabled=true;info.textContent='Preparando el equipo…';}
        const c = n < 0 ? VISTA : PASOS[n].c;
        c0.p.copy(cam.position);
        c0.t.copy(ctl.target);
        c1.p.set(c[0], c[1], c[2]);
        c1.t.set(c[3], c[4], c[5]);
        if(n>=0)c1.p.sub(c1.t).multiplyScalar(1.48).add(c1.t);
        trans = 0;
        paso = n;
        if(!silent){
        clearTimeout(skyStepTimer);
        if(n<0) window.dispatchEvent(new Event('sim:reset'));
        else skyStepTimer=setTimeout(()=>window.dispatchEvent(new CustomEvent('sim:step',{detail:{mode:'laptop',id:PASOS[n].id,end:n===PASOS.length-1,text:PASOS[n].t.replace(/<[^>]*>/g,' ')}})),80);
        }
      }
      document.getElementById("sig").onclick = () => ir(paso + 1);
      document.getElementById("prev").onclick = () => ir(paso - 1);
      document.getElementById("rst").onclick = () => {
        clearInterval(timer);
        timer = null;
        auto.classList.remove("on");
        ir(-1);
      };
      const auto = document.getElementById("auto");
      auto.onclick = () => {
        if (timer) {
          clearInterval(timer);
          timer = null;
          auto.classList.remove("on");
          return;
        }
        auto.classList.add("on");
        if (paso >= PASOS.length - 1) ir(-1);
        timer = setInterval(() => {
          if (paso >= PASOS.length - 1) {
            clearInterval(timer);
            timer = null;
            auto.classList.remove("on");
          } else if (!(window.SKY && window.SKY.hablando())) ir(paso + 1);
        }, 2800);
      };
      document.getElementById("dock-prev").onclick = () =>
        document.getElementById("prev").click();
      document.getElementById("dock-next").onclick = () =>
        document.getElementById("sig").click();
      document.getElementById("dock-auto").onclick = () => auto.click();
      document.getElementById("panel-toggle").onclick = (event) => {
        const collapsed = document
          .getElementById("panel")
          .classList.toggle("min");
        event.currentTarget.textContent = collapsed ? "⌄" : "⌃";
        event.currentTarget.setAttribute("aria-expanded", String(!collapsed));
        event.currentTarget.setAttribute(
          "aria-label",
          collapsed
            ? "Mostrar panel del simulador"
            : "Ocultar panel del simulador",
        );
      };
      if (innerWidth <= 600) {
        const panelToggle = document.getElementById("panel-toggle");
        document.getElementById("panel").classList.add("min");
        panelToggle.textContent = "⌄";
        panelToggle.setAttribute("aria-expanded", "false");
        panelToggle.setAttribute("aria-label", "Mostrar panel del simulador");
      }
      document.getElementById("info-toggle").onclick = (event) => {
        const collapsed = document
          .getElementById("info")
          .classList.toggle("collapsed");
        event.currentTarget.setAttribute("aria-expanded", String(!collapsed));
        event.currentTarget.setAttribute(
          "aria-label",
          collapsed ? "Expandir información" : "Contraer información",
        );
      };
      document.getElementById("voice-toggle").onclick = (event) => {
        const enabled = window.SKY ? window.SKY.alternarVoz() : false;
        event.currentTarget.textContent =
          "Voz de Sky: " + (enabled ? "SÍ" : "NO");
        event.currentTarget.classList.toggle("on", enabled);
        event.currentTarget.setAttribute("aria-pressed", String(enabled));
      };

      const FICHA = {"base": {"funcion": "Sostiene y protege el conjunto.", "datos": ["Carcasa inferior con aberturas para puertos", "Soportes, rejillas y tornillos", "Modelo educativo propio; no reproduce un SKU comercial"]}, "mobo": {"funcion": "Distribuye energía y señales entre los componentes.", "datos": ["PCB con conectores y puntos de fijación", "GPU y componentes soldados", "Diseño educativo genérico"]}, "cpu": {"funcion": "Ejecuta instrucciones y coordina las tareas.", "datos": ["Encapsulado BGA representado sobre la placa", "La CPU se observa; no se instala como pieza extraíble", "No se atribuyen especificaciones de un procesador comercial"]}, "ram": {"funcion": "Mantiene disponibles los datos de trabajo.", "datos": ["Dos módulos SO-DIMM ilustrativos", "Contactos, muesca y retenedores", "Consulta compatibilidad y capacidad en el manual de tu equipo"]}, "ssd": {"funcion": "Almacena el sistema y los archivos.", "datos": ["Unidad M.2 NVMe ilustrativa", "Controlador, memorias NAND y fijación", "El formato por sí solo no garantiza compatibilidad"]}, "cool": {"funcion": "Transporta el calor hacia los ventiladores.", "datos": ["Placas de contacto sobre CPU y GPU", "Heatpipes de cobre y aletas", "Dos ventiladores con aspas visibles"]}, "bat": {"funcion": "Alimenta el equipo sin el adaptador.", "datos": ["Módulo de batería ilustrativo", "Cable y conector hacia la placa", "Durante el mantenimiento debe desconectarse según el manual"]}, "deck": {"funcion": "Integra el teclado y la superficie de apoyo.", "datos": ["Teclas, touchpad y rejillas", "Bastidor con abertura de teclado", "Su construcción y desmontaje dependen del equipo"]}, "lid": {"funcion": "Muestra la imagen y se articula con la base.", "datos": ["Panel, marco, cámara y bisagras", "Representación de conexión eDP", "Modelo educativo de pantalla"]}};
      const galleryPanel = document.getElementById("gallery-panel");
      const galleryList = document.getElementById("gallery-list");
      const infoHeading = document.getElementById("info-heading");
      const galleryScene = new THREE.Scene();
      galleryScene.background = new THREE.Color(0x05070d);
      galleryScene.environment = S.environment;
      galleryScene.add(new THREE.HemisphereLight(0xaabbee, 0x101018, 1.2));
      const galleryLight = new THREE.DirectionalLight(0xffffff, 1.4);
      galleryLight.position.set(6, 12, 10);
      galleryScene.add(galleryLight);
      const galleryBase = new THREE.Mesh(new THREE.CylinderGeometry(4.2,4.5,.20,64), M(0x10151c,{roughness:.85,metalness:.1}));
      galleryBase.position.y=-2.1;
      galleryScene.add(galleryBase);
      const galleryCamera = new THREE.PerspectiveCamera(
        42,
        innerWidth / innerHeight,
        0.1,
        100,
      );
      galleryCamera.position.set(0, 8, 13);
      const galleryControls = new THREE.OrbitControls(galleryCamera, cv);
      galleryControls.enabled = false;
      galleryControls.enableDamping = true;
      galleryControls.minDistance = 4;
      galleryControls.maxDistance = 24;
      galleryControls.autoRotate = true;
      galleryControls.autoRotateSpeed = 1.8;
      let galeriaActiva = false;
      let galleryObject = null;
      let galleryExploded = false;
      let galleryChildPositions = [];
      let infoBeforeGallery = "";
      let infoWasCollapsed = false;
      const galleryNames = {
        base: "▱",
        mobo: "▦",
        cpu: "▣",
        ram: "▥",
        ssd: "▰",
        cool: "❄",
        bat: "▰",
        deck: "⌨",
        lid: "▣",
      };
      const galleryIds = PASOS.map((p) => p.id).filter(Boolean);
      galleryIds.forEach((id) => {
        const step = PASOS.find((p) => p.id === id);
        const item = document.createElement("div");
        const icon = document.createElement("span");
        const label = document.createElement("span");
        item.className = "paso";
        item.dataset.id = id;
        item.tabIndex = 0;
        item.setAttribute("role", "button");
        item.setAttribute("aria-pressed", "false");
        icon.className = "gallery-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = galleryNames[id] || "◈";
        label.textContent = step.n;
        item.append(icon, label);
        item.onclick = () => mostrarPiezaGaleria(id);
        item.onkeydown = (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            item.click();
          }
        };
        galleryList.appendChild(item);
      });

      function mostrarPiezaGaleria(id) {
        if(!window.LAPTOP_READY)return;
        if (galleryObject) galleryScene.remove(galleryObject);
        const source = P[id];
        const model = source.clone(true);
        model.position.set(0, 0, 0);
        model.rotation.set(0, 0, 0);
        model.scale.set(1, 1, 1);
        model.traverse((object) => {
          object.visible = true;
        });
        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        model.position.sub(center);
        galleryControls.target.set(0,0,0);galleryCamera.position.set(0,8,13);
        galleryObject = new THREE.Group();
        galleryObject.add(model);
        galleryObject.scale.setScalar(
          6 / Math.max(size.x, size.y, size.z, 0.01),
        );
        galleryObject.rotation.y = -0.35;
        galleryScene.add(galleryObject);
        galleryChildPositions = model.children.flatMap(g=>g.children.filter(o=>o.isMesh||o.children.length)).map((child) => ({
          child,
          position: child.position.clone(),
          direction: child.position
            .clone()
            .sub(center)
            .normalize(),
        }));
        galleryChildPositions.forEach((part, index) => {
          if (part.direction.lengthSq() === 0) {
            part.direction.set(index % 2 ? 1 : -1, 0.45, index % 3 ? 0.5 : -0.5);
            part.direction.normalize();
          }
        });
        galleryExploded = false;
        document.getElementById("gallery-explode").setAttribute(
          "aria-pressed",
          "false",
        );
        galleryList.querySelectorAll(".paso").forEach((item) => {
          const selected = item.dataset.id === id;
          item.classList.toggle("act", selected);
          item.setAttribute("aria-pressed", String(selected));
        });
        const detail = FICHA[id];
        const step = PASOS.find((p) => p.id === id);
        info.innerHTML =
          "<b>" +
          step.n +
          '</b><div style="margin:8px 0 2px;color:#ff4057;font-weight:700">¿Para qué sirve?</div>' +
          detail.funcion +
          '<details style="margin-top:8px;color:#9daac0"><summary style="cursor:pointer">Datos técnicos</summary><ul style="margin:4px 0 0 18px">' +
          detail.datos.map((dato) => "<li>" + dato + "</li>").join("") +
          "</ul></details>" +
          '<div style="margin-top:8px;color:#9daac0;font-size:11px">Arrastra el modelo para girarlo.</div>';
      }

      function alternarExplosion() {
        galleryExploded = !galleryExploded;
        galleryChildPositions.forEach((part) => {
          part.child.position
            .copy(part.position)
            .addScaledVector(part.direction, galleryExploded ? 0.9 : 0);
        });
        document.getElementById("gallery-explode").setAttribute(
          "aria-pressed",
          String(galleryExploded),
        );
      }

      function cambiarGaleria(open) {
        if (galeriaActiva === open) return;
        galeriaActiva = open;window.SIM_GALLERY=open;
        if (open) {
          infoBeforeGallery = info.innerHTML;
          infoWasCollapsed = document
            .getElementById("info")
            .classList.contains("collapsed");
          document.getElementById("info").classList.remove("collapsed");
          infoHeading.textContent = "Detalle de la pieza";
          document.getElementById("panel").style.display = "none";
          document.getElementById("dock").style.display = "none";
          galleryPanel.hidden = false;
          comp.passes[0].scene = galleryScene;
          comp.passes[0].camera = galleryCamera;
          ctl.enabled = false;
          galleryControls.enabled = true;
          if (timer) {
            clearInterval(timer);
            timer = null;
            auto.classList.remove("on");
          }
          if (window.SKY && window.SKY.suspender) window.SKY.suspender();
          mostrarPiezaGaleria(galleryIds[0]);
        } else {
          galleryPanel.hidden = true;
          document.getElementById("panel").style.display = "";
          document.getElementById("dock").style.display = "";
          document
            .getElementById("info")
            .classList.toggle("collapsed", infoWasCollapsed);
          infoHeading.textContent = "Información";
          info.innerHTML = infoBeforeGallery;
          comp.passes[0].scene = S;
          comp.passes[0].camera = cam;
          ctl.enabled = true;
          galleryControls.enabled = false;
          if (window.SKY && window.SKY.reanudar) window.SKY.reanudar();
        }
      }
      document.getElementById("gbtn").onclick = () => cambiarGaleria(true);
      document.getElementById("gallery-close").onclick = () =>
        cambiarGaleria(false);
      document.getElementById("gallery-rotate").onclick = (event) => {
        galleryControls.autoRotate = !galleryControls.autoRotate;
        event.currentTarget.classList.toggle("on", galleryControls.autoRotate);
        event.currentTarget.setAttribute(
          "aria-pressed",
          String(galleryControls.autoRotate),
        );
      };
      document.getElementById("gallery-explode").onclick =
        alternarExplosion;
      addEventListener("keydown", (event) => {
        if (event.key === "Escape" && galeriaActiva) cambiarGaleria(false);
      });
      addEventListener("resize", () => {
        galleryCamera.aspect = innerWidth / innerHeight;
        galleryCamera.updateProjectionMatrix();
      });

      // ================= 6. ANIMACIÓN =================
      const ease = (k) => 1 - Math.pow(1 - k, 3),
        EX = new THREE.Vector3(0, 9, 0),
        clk = new THREE.Clock();
      let laptopFrame=0;
      function scheduleLaptop(){cancelAnimationFrame(laptopFrame);laptopFrame=0;clk.getDelta();if(window.SIM_ACTIVE&&!document.hidden)laptopFrame=requestAnimationFrame(loop)}
      window.addEventListener('sim:visibility',e=>{if(!e.detail){clearInterval(timer);timer=null;auto.classList.remove('on')}scheduleLaptop()});
      document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInterval(timer);timer=null;auto.classList.remove('on')}scheduleLaptop()});
      window.addEventListener('sim:quality',e=>{R.setPixelRatio(e.detail?1:Math.min(devicePixelRatio,2));comp.passes[1].enabled=!e.detail;ajustar()});
      function loop() {
        laptopFrame=0;if(!window.SIM_ACTIVE||document.hidden)return;
        laptopFrame=requestAnimationFrame(loop);
        const dt = Math.min(clk.getDelta(), 0.05),
          tm = clk.elapsedTime;
        Object.values(P).forEach((g) => {
          if (g.userData.t < 1) {
            g.userData.t = Math.min(1, g.userData.t + dt / 0.9);
            g.position
              .copy(g.userData.to)
              .addScaledVector(EX, 1 - ease(g.userData.t));
          }
        });
        if (trans < 1) {
          trans = Math.min(1, trans + dt / 1.2);
          const k = ease(trans);
          cam.position.lerpVectors(c0.p, c1.p, k);
          ctl.target.lerpVectors(c0.t, c1.t, k);
        }
        fans.forEach((f,i)=>{if(encendido)f.rotation.y+=dt*14*(i?-1:1)});
        teclas.forEach((m) => {
          m.emissive.setHex(0x2a0910);
          m.emissiveIntensity = encendido ? 0.28 : P.deck.visible ? 0.08 : 0;
        });
        if (galeriaActiva) galleryControls.update();
        else ctl.update();
        comp.render();
      }
      scheduleLaptop();
      ir(-1);


window.addEventListener("sky:voice",e=>{const b=document.getElementById("voice-toggle");b.textContent="Voz de Sky: "+(e.detail?"SÍ":"NO");b.setAttribute("aria-pressed",String(e.detail))});

window.dispatchEvent(new CustomEvent("sky:voice",{detail:window.SKY.voz()}));

cargarLaptopExterior(P,scr).then(()=>{
 window.LAPTOP_READY=true;
 document.getElementById('modelo-laptop-status').textContent='Equipo listo para ensamblar';
 ir(paso,true);
 if(galeriaActiva)mostrarPiezaGaleria(galleryList.querySelector('.act')?.dataset.id||'base');
}).catch(error=>{window.LAPTOP_READY=true;ir(-1,true);console.error('Modelo exterior:',error);document.getElementById('modelo-laptop-status').textContent='No se pudo cargar el exterior. Se muestra el modelo educativo.'});

FICHA.base.datos[2]='Carcasa adaptada de Gaming Laptop - Computer · Diego G. · CC-BY-4.0';
FICHA.deck.datos.push('Teclado y carcasa superior del modelo aportado de Diego G.');
FICHA.lid.datos.push('Exterior del modelo aportado; pantalla del simulador UNDC');
