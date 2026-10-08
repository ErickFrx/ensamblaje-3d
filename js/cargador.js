// Modelo base: «Gaming Desktop PC» · licencia CC-BY-4.0
(() => {
  if (typeof GLB === "undefined") {
    console.warn("Modelos GLB no encontrados: se mantienen las piezas simples");
    return;
  }
  const bytes = (s) => {
    const b = atob(s),
      u = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return u;
  };
  function cargarModeloGlb(id) {
    const u = bytes(GLB[id]),
      jl = new DataView(u.buffer).getUint32(12, true),
      J = JSON.parse(new TextDecoder().decode(u.subarray(20, 20 + jl))),
      bo = 28 + jl;
    const tx = [],
      tex = (i) => {
        if (tx[i]) return tx[i];
        const t = J.textures[i],
          im = J.images[t.source],
          bv = J.bufferViews[im.bufferView],
          o = bo - 28 + 28;
        const img = new Image(),
          T = new THREE.Texture(img);
        img.onload = () => {
          T.needsUpdate = true;
        };
        const st = bo + (bv.byteOffset || 0);
        img.src = URL.createObjectURL(
          new Blob([u.subarray(st, st + bv.byteLength)], { type: im.mimeType }),
        );
        const s = J.samplers[t.sampler || 0] || {};
        T.flipY = false;
        T.wrapS =
          s.wrapS === 33071 ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
        T.wrapT =
          s.wrapT === 33071 ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
        T.anisotropy = 4;
        return (tx[i] = T);
      };
    const mats = J.materials.map((m) => {
      const pb = m.pbrMetallicRoughness || {},
        o = {
          color: new THREE.Color().fromArray(
            (pb.baseColorFactor || [1, 1, 1]).slice(0, 3),
          ),
          metalness: pb.metallicFactor == null ? 1 : pb.metallicFactor,
          roughness: pb.roughnessFactor == null ? 1 : pb.roughnessFactor,
          side: m.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
        };
      if (pb.baseColorTexture) o.map = tex(pb.baseColorTexture.index);
      if (pb.metallicRoughnessTexture)
        o.metalnessMap = o.roughnessMap = tex(
          pb.metallicRoughnessTexture.index,
        );
      if (m.normalTexture) o.normalMap = tex(m.normalTexture.index);
      const ef = m.emissiveFactor || (m.emissiveTexture ? [1, 1, 1] : null);
      if (ef && ef.some((c) => c > 0)) {
        o.emissive = new THREE.Color().fromArray(ef);
        if (m.emissiveTexture) o.emissiveMap = tex(m.emissiveTexture.index);
        o.emissiveIntensity = Math.min((m.extras && m.extras.es) || 1, 1.6);
      }
      if (m.alphaMode === "MASK")
        o.alphaTest = m.alphaCutoff == null ? 0.5 : m.alphaCutoff;
      else if (m.alphaMode === "BLEND") o.transparent = true;
      const x = new THREE.MeshStandardMaterial(o);
      x.name = m.name || "";
      return x;
    });
    const meshes = J.nodes.map((n) => {
      const pr = J.meshes[n.mesh].primitives[0],
        A = J.accessors,
        view = (k, T, c) => {
          const a = A[k],
            bv = J.bufferViews[a.bufferView];
          return new BufferAttr(
            new T(
              u.buffer,
              bo + (bv.byteOffset || 0) + (a.byteOffset || 0),
              a.count * c,
            ),
            c,
          );
        },
        g = new THREE.BufferGeometry();
      g.setAttribute("position", view(pr.attributes.POSITION, Float32Array, 3));
      g.setAttribute("normal", view(pr.attributes.NORMAL, Float32Array, 3));
      g.setAttribute("uv", view(pr.attributes.TEXCOORD_0, Float32Array, 2));
      g.setIndex(view(pr.indices, Uint32Array, 1));
      g.computeBoundingBox();
      const m = new THREE.Mesh(g, mats[pr.material]);
      m.name = n.name;
      return m;
    });
    return { meshes, mats };
  }
  const BufferAttr = THREE.BufferAttribute;
  function pieza(id, ax, capas, rgbOn) {
    const r = cargarModeloGlb(id),
      root = new THREE.Group();
    const mallas = r.meshes.filter((m) =>
      id === "case"
        ? !/^Text(?:\.|_)/i.test(m.name)
        : id === "gpu"
          ? !/^BezierCurve\.\d+_/.test(m.name)
          : true,
    );
    r.mats.forEach((m) => {
      if (m.emissive && m.emissive.r + m.emissive.g + m.emissive.b > 0)
        rgbs.push({ color: m.emissive, userData: { o: Math.random() } });
    });
    if (capas <= 1) {
      mallas.forEach((m) => root.add(m));
      return root;
    }
    if (id === "kb") {
        const gr = [new THREE.Group(), new THREE.Group(), new THREE.Group()];
        mallas.forEach((m) => {
          const nombre = m.name || "";
          const i = /_Tasten(?:_|$)/i.test(nombre)
            ? 2
            : /_Tastatur_(?:Seite|Unterseite)_/i.test(nombre)
              ? 0
              : 1;
          gr[i].add(m);
        });
        gr.forEach((g) => root.add(g));
        return root;
    }
    const c = mallas.map((m) =>
        m.geometry.boundingBox.getCenter(new THREE.Vector3()).getComponent(ax),
      ),
      ord = mallas.map((_, i) => i).sort((a, b) => c[a] - c[b]),
      nb = Math.min(capas, ord.length),
      gr = Array.from({ length: nb }, () => new THREE.Group());
    ord.forEach((mi, k) =>
      gr[Math.floor((k * nb) / ord.length)].add(mallas[mi]),
    );
    gr.forEach((g) => root.add(g));
    return root;
  }
  function poner(id, root, padre, pos, ax, rx) {
    const o = P[id],
      ex = o.userData.ex.clone();
    o.parent && o.parent.remove(o);
    root.position.copy(pos);
    root.userData = { to: pos.clone(), ex, ax, rx: rx || 0 };
    root.visible = false;
    padre.add(root);
    P[id] = root;
    return root;
  }
  const Z = new THREE.Vector3(),
    V = (...a) => new THREE.Vector3(...a);
  T.children
    .filter((c) => !Object.values(P).includes(c) && !c.isLight)
    .forEach((c) => T.remove(c));
  T.userData.gabinete = pieza("case", 2, 1, true);
  T.add(T.userData.gabinete);
  [
    ["psu", 1],
    ["mobo", 1],
    ["aio", 1],
    ["ram", 1],
    ["gpu", 1],
  ].forEach(([id]) =>
    poner(
      id,
      pieza(id, 2, id === "ram" ? 4 : 6, true),
      T,
      Z,
      "z",
      id === "gpu" ? -1.1 : 0,
    ),
  );
  {
    const g = pieza("glass", 2, 1, false),
      gm = new THREE.MeshPhysicalMaterial({
        color: 0xc5e3f5,
        roughness: 0.08,
        metalness: 0,
        transmission: 0.9,
        thickness: 0.08,
        ior: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        side: THREE.DoubleSide,
      });
    g.traverse((o) => {
      if (o.isMesh) o.material = gm;
    });
    const bounds = new THREE.Box3().setFromObject(g),
      min = bounds.min,
      max = bounds.max,
      centerX = (min.x + max.x) / 2,
      centerY = (min.y + max.y) / 2,
      width = max.x - min.x,
      height = max.y - min.y,
      faceZ = max.z + 0.012,
      reflectionCanvas = document.createElement("canvas");
    reflectionCanvas.width = 512;
    reflectionCanvas.height = 512;
    const ctx = reflectionCanvas.getContext("2d"),
      tint = ctx.createLinearGradient(0, 0, 512, 0);
    tint.addColorStop(0, "rgba(115,185,230,0.22)");
    tint.addColorStop(0.16, "rgba(65,125,175,0.07)");
    tint.addColorStop(0.55, "rgba(30,70,110,0.035)");
    tint.addColorStop(0.88, "rgba(120,190,230,0.09)");
    tint.addColorStop(1, "rgba(170,220,250,0.26)");
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, 512, 512);
    const reflection = ctx.createLinearGradient(30, 460, 310, 20);
    reflection.addColorStop(0, "rgba(255,255,255,0)");
    reflection.addColorStop(0.42, "rgba(220,245,255,0.035)");
    reflection.addColorStop(0.5, "rgba(235,250,255,0.24)");
    reflection.addColorStop(0.58, "rgba(220,245,255,0.045)");
    reflection.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = reflection;
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = "rgba(205,235,255,0.3)";
    ctx.lineWidth = 3;
    ctx.strokeRect(5, 5, 502, 502);
    const reflectionMap = new THREE.CanvasTexture(reflectionCanvas);
    reflectionMap.colorSpace = THREE.SRGBColorSpace;
    const surface = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({
        map: reflectionMap,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    );
    surface.position.set(centerX, centerY, faceZ);
    surface.renderOrder = 2;
    g.add(surface);

    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x46515e,
      metalness: 0.82,
      roughness: 0.24,
    });
    const addFrameBar = (w, h, x, y) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.045), frameMaterial);
      bar.position.set(x, y, faceZ + 0.025);
      g.add(bar);
    };
    const frame = 0.065;
    addFrameBar(width, frame, centerX, min.y + frame / 2);
    addFrameBar(width, frame, centerX, max.y - frame / 2);
    addFrameBar(frame, height, min.x + frame / 2, centerY);
    addFrameBar(frame, height, max.x - frame / 2, centerY);

    const screwMaterial = new THREE.MeshStandardMaterial({
      color: 0x9aa7b4,
      metalness: 0.9,
      roughness: 0.2,
    });
    [
      [min.x + 0.22, min.y + 0.22],
      [max.x - 0.22, min.y + 0.22],
      [min.x + 0.22, max.y - 0.22],
      [max.x - 0.22, max.y - 0.22],
    ].forEach(([x, y]) => {
      const screw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.075, 0.035, 16),
        screwMaterial,
      );
      screw.rotation.x = Math.PI / 2;
      screw.position.set(x, y, faceZ + 0.055);
      g.add(screw);
    });
    poner("glass", g, T, Z, "z");
  }
  {
    const c = V(...GLBMETA.cpu);
    c.z += 0.06;
    P.cpu.position.copy(c);
    P.cpu.userData.to.copy(c);
    const s = V(...GLBMETA.ssd);
    s.z += 0.05;
    P.ssd.position.copy(s);
    P.ssd.userData.to.copy(s);
  }
  if (GLB.kb)
    poner("kb", pieza("kb", 1, 4, true), D, V(0.5, 0.08, 4.1), "y", 0.95);
  poner("mouse", pieza("mouse", 1, 3, true), D, V(7.05, 0.06, 4.05), "y", 0);
  P.mouse.scale.setScalar(1.8);
  {
    const mo = poner("mon", pieza("mon", 2, 5, true), D, V(2, 0, -3.4), "z"),
      ls = [];
    mo.traverse((o) => {
      if (o.isMesh && o.name.startsWith("MY SCREEN")) ls.push(o);
    });
    ls.forEach((o) => {
      const g = o.geometry,
        b = g.boundingBox,
        p = g.attributes.position,
        uv = new Float32Array(p.count * 2);
      for (let i = 0; i < p.count; i++) {
        uv[i * 2] = (p.getX(i) - b.min.x) / (b.max.x - b.min.x);
        uv[i * 2 + 1] = (p.getY(i) - b.min.y) / (b.max.y - b.min.y);
      }
      g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      o.material = scrM;
      o.renderOrder = 2;
    });
    scrM.polygonOffset = true;
    scrM.polygonOffsetFactor = -6;
    scrM.polygonOffsetUnits = -6;
  }
  P.spk = { userData: { ex: V(0, 7, 0) } };
  const parlantes = pieza("spk", 2, 2, true);
  parlantes.traverse((malla) => {
    if (
      malla.isMesh &&
      malla.geometry.boundingBox.getCenter(new THREE.Vector3()).x > 0
    )
      malla.position.x += 4.4;
  });
  poner("spk", parlantes, D, V(2, 0, -3.4), "z");
  T.updateMatrixWorld(true);
  ["psu", "mobo", "cpu", "aio", "ram", "ssd", "gpu", "glass"].forEach((id) => {
    const p = PASOS.find((q) => q.p[0] === id),
      bb = new THREE.Box3().setFromObject(P[id]),
      c = bb.getCenter(new THREE.Vector3()),
      s = bb.getSize(new THREE.Vector3()),
      d = Math.min(21, Math.max(9, Math.max(s.x, s.y) * 1.5 + 4)),
      v = V(0.4, 0.28, 1).normalize().multiplyScalar(d);
    p.c = [c.x + v.x, c.y + v.y, c.z + v.z, c.x, c.y, c.z];
  });
  {
    const p = PASOS.find((q) => q.p[0] === "spk"),
      bb = new THREE.Box3().setFromObject(P.spk),
      c = bb.getCenter(new THREE.Vector3()),
      s = bb.getSize(new THREE.Vector3()),
      d = Math.max(s.x, s.y) * 1.2 + 7;
    p.c = [c.x, c.y + d * 0.3, c.z + d, c.x, c.y, c.z];
  }
  window.aplicarModeloTeclado = () => {
    if (!GLB.kb || P.kb.userData.modeloDetallado) return;
    const teclado = pieza("kb", 1, 4, true);
    teclado.position.y = -0.15;
    P.kb.clear();
    P.kb.add(teclado);
    P.kb.userData.modeloDetallado = true;
    if (window.refrescarPiezaGaleria)
      window.refrescarPiezaGaleria("kb");
  };
  if (GLB.kb) window.aplicarModeloTeclado();
  const crearCablePeriferico = (id, puntosMesa, puerto) => {
    const radio = 0.03,
      cable = new THREE.Group(),
      material = new THREE.MeshStandardMaterial({
        color: 0x030405,
        roughness: 0.9,
        metalness: 0.05,
      }),
      tramo = (curva, segmentos) =>
        cable.add(
          new THREE.Mesh(
            new THREE.TubeGeometry(curva, segmentos, radio, 7, false),
            material,
          ),
        );
    tramo(
      new THREE.CatmullRomCurve3(puntosMesa.map((p) => V(...p))),
      70,
    );
    const puntosTorre = [
      V(...puntosMesa[puntosMesa.length - 1]),
      V(-4.3, 0.12, puerto[2]),
      V(-4.3, 8.9, puerto[2]),
      V(...puerto),
    ];
    puntosTorre.slice(1).forEach((punto, i) => {
      const anterior = puntosTorre[i];
      tramo(new THREE.LineCurve3(anterior, punto), 1);
      if (i < puntosTorre.length - 2) {
        const junta = new THREE.Mesh(
          new THREE.SphereGeometry(radio, 8, 6),
          material,
        );
        junta.position.copy(punto);
        cable.add(junta);
      }
    });
    cable.name = `Cable USB ${id}`;
    cable.visible = false;
    S.add(cable);
    return cable;
  };
  const puertosUsb = GLBMETA.usb.map(([x, y, z]) => [-9 + x, y, z]);
  const cablesPerifericos = {
    kb: crearCablePeriferico(
      "teclado",
      [
        [0.5, 0.12, 3.08],
        [0.5, 0.12, 2.98],
        [-3.65, 0.12, 2.98],
        [-4.3, 0.12, 2.35],
      ],
      puertosUsb[1],
    ),
    mouse: crearCablePeriferico(
      "mouse",
      [
        [6.8, 0.12, 3.35],
        [6.8, 0.12, 2.77],
        [-3.7, 0.12, 2.77],
        [-4.3, 0.12, 2.35],
      ],
      puertosUsb[2],
    ),
  };
  window.actualizarCablePeriferico = (id, visible) => {
    if (cablesPerifericos[id]) cablesPerifericos[id].visible = visible;
  };
  window.ocultarCablesPerifericos = () =>
    Object.values(cablesPerifericos).forEach((cable) => {
      cable.visible = false;
    });
})();
