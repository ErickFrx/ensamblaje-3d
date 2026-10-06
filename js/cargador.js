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
    if (rgbOn)
      r.mats.forEach((m) => {
        if (m.emissive && m.emissive.r + m.emissive.g + m.emissive.b > 0)
          rgbs.push({ color: m.emissive, userData: { o: Math.random() } });
      });
    if (capas <= 1) {
      r.meshes.forEach((m) => root.add(m));
      return root;
    }
    const c = r.meshes.map((m) =>
        m.geometry.boundingBox.getCenter(new THREE.Vector3()).getComponent(ax),
      ),
      ord = r.meshes.map((_, i) => i).sort((a, b) => c[a] - c[b]),
      nb = Math.min(capas, ord.length),
      gr = Array.from({ length: nb }, () => new THREE.Group());
    ord.forEach((mi, k) =>
      gr[Math.floor((k * nb) / ord.length)].add(r.meshes[mi]),
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
  T.add(pieza("case", 2, 1, true));
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
        color: 0x99ccff,
        transparent: true,
        opacity: 0.12,
        roughness: 0.05,
        metalness: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
    g.traverse((o) => {
      if (o.isMesh) o.material = gm;
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
  poner("spk", pieza("spk", 2, 2, true), D, V(2, 0, -3.4), "z");
  {
    const mk = (id, pts, r) => {
      const m = cabs[id];
      m.geometry.dispose();
      m.geometry = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(pts.map((p) => V(...p))),
        90,
        r,
        8,
      );
      m.geometry.setDrawRange(0, 0);
    };
    const fx = -9 + GLBMETA.front + 0.15,
      u = GLBMETA.usb,
      ux = (i) => -9 + u[i][0],
      uy = (i) => u[i][1] + 0.04,
      uz = (i) => u[i][2];
    mk(
      "kb",
      [
        [-3.1, 0.2, 3.3],
        [-3.4, 0.1, 2.9],
        [fx, 0.1, 2.4],
        [fx, 3, 1.6],
        [fx, 8, 1.1],
        [fx - 0.1, 9.5, uz(1)],
        [ux(1), uy(1) + 0.12, uz(1)],
      ],
      0.05,
    );
    mk(
      "mouse",
      [
        [7.05, 0.075, 3.3],
        [6.75, 0.09, 3.18],
        [5.4, 0.1, 3.0],
        [4.0, 0.1, 2.45],
        [fx - 0.4, 0.1, 1.9],
        [fx, 4, 0.9],
        [fx, 8, 0.2],
        [fx - 0.1, 9.5, uz(2)],
        [ux(2), uy(2) + 0.12, uz(2)],
      ],
      0.04,
    );
    T.updateMatrixWorld(true);
    D.updateMatrixWorld(true);
    const bm = new THREE.Box3().setFromObject(P.mon);
    mk(
      "mon",
      [
        [2, 2.2, bm.min.z + 0.7],
        [1.5, 0.1, bm.min.z - 0.2],
        [-8, 0.1, -4.4],
        [-13.6, 0.2, -3],
        [-13.7, 2.5, -1],
        [-13.4, 3.1, -1],
      ],
      0.07,
    );
  }
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
  const paso = (id) => PASOS.find((q) => q.p[0] === id);
  paso("aio").t =
    "La bomba va sobre la CPU y el radiador con 2 ventiladores RGB al frente del case.";
  paso("ram").t =
    "Alinee la muesca de cada módulo y presione hasta que las pestañas hagan clic. Repita con los 4 módulos.";
  Object.assign(FICHA, {
    kb: [
      "Teclado mecánico con retroiluminación RGB.",
      [
        "Formato completo con teclado numérico",
        "Iluminación RGB por tecla",
        "Teclas con perfil bajo y base rígida",
        "Conexión USB por cable",
      ],
    ],
    aio: [
      "Refrigeración líquida todo en uno (AIO).",
      [
        "Bloque sobre la CPU que absorbe el calor",
        "Radiador frontal con aletas de aluminio",
        "2 ventiladores de 120 mm con iluminación RGB",
        "Se fija al zócalo y al frente del case con tornillos",
      ],
    ],
    ram: [
      "Memoria de acceso rápido para los programas abiertos.",
      [
        "4 módulos DDR5 con disipador metálico",
        "Barra de luz RGB direccionable",
        "Se instalan en ranuras con pestañas laterales",
        "En pares para activar el doble canal",
      ],
    ],
  });
})();
