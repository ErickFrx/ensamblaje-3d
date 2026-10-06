const bx = (w, h, d, m, x = 0, y = 0, z = 0) =>
  at(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), x, y, z);
const cyl = (r, h, m, x, y, z, rot) => {
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 16), m);
  if (rot === "x") c.rotateZ(Math.PI / 2);
  if (rot === "z") c.rotateX(Math.PI / 2);
  return at(c, x, y, z);
};
const inst = (geo, m, pts) => {
  const im = new THREE.InstancedMesh(geo, m, pts.length),
    o = new THREE.Object3D();
  pts.forEach((p, i) => {
    o.position.set(...p);
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
  });
  return im;
};
const clr = (g) => {
  while (g.children.length) g.remove(g.children[0]);
};
const gold = M(0xd8b04a, { metalness: 1, roughness: 0.25 }),
  nick = M(0xc9ced6, { metalness: 1, roughness: 0.2 }),
  blk = M(0x07080b, { roughness: 0.5, metalness: 0.3 }),
  grn = M(0x14583a, { roughness: 0.55, metalness: 0.15 }),
  cu = M(0xb87333, { metalness: 1, roughness: 0.3 }),
  sil = M(0xaab0ba, { metalness: 1, roughness: 0.3 });
const range = (n, f) => Array.from({ length: n }, (_, i) => f(i));
clr(P.cpu);
{
  const pads = [];
  for (let i = 0; i < 34; i++)
    for (let j = 0; j < 34; j++)
      if (!(i > 11 && i < 22 && j > 11 && j < 22))
        pads.push([-0.4 + i * 0.0242, -0.4 + j * 0.0242, -0.036]);
  const smd = [];
  for (let i = 0; i < 9; i++)
    smd.push(
      [-0.4 + i * 0.1, 0.455, 0.04],
      [-0.4 + i * 0.1, -0.455, 0.04],
      [0.455, -0.4 + i * 0.1, 0.04],
      [-0.455, -0.4 + i * 0.1, 0.04],
    );
  P.cpu.add(
    bx(1, 1, 0.06, grn),
    inst(new THREE.BoxGeometry(0.016, 0.016, 0.01), gold, pads),
    inst(
      new THREE.BoxGeometry(0.05, 0.025, 0.02),
      M(0x7a6a4a, { roughness: 0.5 }),
      smd,
    ),
    at(
      new THREE.Mesh(new THREE.CircleGeometry(0.045, 3), gold),
      -0.43,
      -0.43,
      0.032,
    ),
    at(rb(0.64, 0.64, 0.07, 0.04, nick), 0, 0, 0.065),
    at(rb(0.84, 0.46, 0.07, 0.03, nick), 0, 0, 0.065),
    at(rb(0.46, 0.84, 0.07, 0.03, nick), 0, 0, 0.065),
    at(lab("intel|CORE i9|14900K", 0.5, 0.38, 34, "#1b1f26"), 0, 0, 0.125),
  );
}
clr(P.ram);
{
  const stick = (o) => {
    const g = new THREE.Group(),
      sp = M(0x2b2f38, { roughness: 0.35, metalness: 0.9 });
    g.add(
      bx(0.07, 2.9, 0.7, grn),
      inst(
        new THREE.BoxGeometry(0.075, 0.026, 0.09),
        gold,
        range(68, (i) =>
          Math.abs(i - 34) > 1 ? [0, -1.35 + i * 0.04, -0.31] : [0, -9, 0],
        ),
      ),
    );
    [-1, 1].forEach((s) => {
      g.add(
        bx(0.04, 2.7, 0.55, sp, s * 0.065, 0, 0.08),
        inst(
          new THREE.BoxGeometry(0.045, 0.03, 0.5),
          M(0x15171c),
          range(16, (i) => [s * 0.068, -1.2 + i * 0.16, 0.08]),
        ),
      );
      const l = lab("DDR5-4800", 2.3, 0.4, 40);
      l.rotation.set(0, (s * Math.PI) / 2, Math.PI / 2);
      l.position.set(s * 0.09, 0, 0.1);
      g.add(l);
    });
    g.add(
      bx(
        0.15,
        2.6,
        0.15,
        new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.35,
          roughness: 0.2,
        }),
        0,
        0,
        0.42,
      ),
      bx(0.1, 2.5, 0.07, rgb(o), 0, 0, 0.42),
    );
    return g;
  };
  P.ram.add(at(stick(0), 0, 0, 0), at(stick(0.3), 0.45, 0, 0));
}
clr(P.ssd);
{
  const chip = (x, w) =>
    G(
      bx(w, 0.42, 0.025, blk, x, 0, 0.04),
      at(
        new THREE.Mesh(new THREE.CircleGeometry(0.02, 10), M(0xdddddd)),
        x - w / 2 + 0.06,
        0.15,
        0.054,
      ),
    );
  P.ssd.add(
    bx(2.1, 0.6, 0.04, grn),
    inst(
      new THREE.BoxGeometry(0.1, 0.026, 0.01),
      gold,
      range(14, (i) => [0.99, -0.28 + i * 0.043, -0.025]),
    ),
    chip(-0.65, 0.5),
    chip(-0.05, 0.5),
    chip(0.6, 0.36),
    bx(
      1.8,
      0.5,
      0.02,
      M(0x9aa3ad, { roughness: 0.9, metalness: 0 }),
      0,
      0,
      0.075,
    ),
    at(rb(1.9, 0.56, 0.08, 0.05, M(0x2a2f3a, { roughness: 0.3 })), 0, 0, 0.12),
    inst(
      new THREE.BoxGeometry(0.035, 0.5, 0.01),
      M(0x14161c),
      range(20, (i) => [-0.85 + i * 0.09, 0, 0.17]),
    ),
    cyl(0.06, 0.1, gold, -1.0, 0, 0.1, "z"),
    at(lab("NVMe 2TB|PCIe Gen4", 1.5, 0.3, 38), 0.1, 0.12, 0.18),
    bx(1.5, 0.04, 0.03, rgb(0.7), 0.1, -0.2, 0.18),
  );
}
[-0.5, -0.2, 0.1, 0.4].forEach((z) =>
  P.gpu.add(cyl(0.07, 5.4, cu, 0, -0.87, z, "x")),
);
P.gpu.add(
  inst(
    new THREE.BoxGeometry(0.045, 0.3, 0.02),
    gold,
    range(60, (i) => [-2.4 + i * 0.075, -0.3, -0.77]),
  ),
  ...range(3, (i) => bx(0.04, 0.28, 0.5, blk, -3.12, 0.45, -0.4 + i * 0.4)),
  bx(0.04, 0.3, 0.5, blk, -3.12, -0.2, 0),
  inst(
    new THREE.BoxGeometry(0.06, 0.06, 0.12),
    M(0xd8b04a, { metalness: 1 }),
    range(8, (i) => [
      1.35 + (i % 4) * 0.14,
      0.98 + (i > 3 ? 0.0 : 0.0),
      0.2 - (i > 3 ? 0.1 : 0.0),
    ]),
  ),
  bx(
    2.6,
    0.04,
    1.3,
    M(0x1c2029, { metalness: 0.9, roughness: 0.3 }),
    0,
    0.87,
    0,
  ),
  inst(
    new THREE.BoxGeometry(0.04, 0.12, 1.2),
    M(0x2a2f3a, { metalness: 1 }),
    range(40, (i) => [-2.4 + i * 0.12, 0.93, 0]),
  ),
);
P.psu.add(
  inst(
    new THREE.BoxGeometry(0.7, 0.38, 0.06),
    blk,
    range(5, (i) => [-2.5 + i * 1, 0, -1.93]),
  ),
  inst(
    new THREE.BoxGeometry(0.06, 0.06, 0.08),
    gold,
    range(30, (i) => [
      -2.78 + (i % 6) * 0.11 + Math.floor(i / 6) * 1,
      i % 2 ? 0.1 : -0.1,
      -1.95,
    ]),
  ),
  bx(0.06, 0.62, 0.9, blk, 3.22, 0.1, 0),
  ...range(3, (i) => bx(0.08, 0.14, 0.04, gold, 3.27, 0.1, -0.25 + i * 0.25)),
  bx(0.1, 0.3, 0.2, M(0xcc2222), 3.25, -0.5, 0.4),
  ...[
    [-3, 0.6],
    [3, 0.6],
    [-3, -0.6],
    [3, -0.6],
  ].map(([x, y]) => cyl(0.07, 0.06, sil, x, y, 1.92, "z")),
);
P.mobo.add(
  bx(1.4, 1.4, 0.05, M(0x050608), -0.6, 0.95, 0.09),
  bx(1.3, 0.1, 0.1, sil, -0.6, 1.72, 0.14),
  bx(0.1, 1.3, 0.1, sil, 0.12, 0.95, 0.14),
  bx(0.25, 3.5, 0.9, M(0x15171c), -3.25, 0.3, 0.4),
  ...range(4, (i) =>
    bx(0.12, 0.2, 0.28, M(0x1b6bff), -3.38, 1.55 - i * 0.3, 0.4),
  ),
  bx(0.12, 0.55, 0.5, sil, -3.38, -0.2, 0.4),
  ...range(3, (i) =>
    cyl(
      0.08,
      0.1,
      M(i ? 0x2ea84a : 0xe03c8a),
      -3.38,
      -0.8 - i * 0.22,
      0.4,
      "x",
    ),
  ),
  ...range(4, (i) =>
    bx(0.5, 0.28, 0.2, blk, 2.4, -3.0 + i * 0.001 - (i % 2) * 0, -0.0 + 0.2),
  ).map((m, i) => {
    m.position.set(2.35, -2.7 - i * 0.0 + (i - 1.5) * -0.0, 0.2);
    m.position.y = -2.1 - i * 0.0;
    m.position.x = 2.4;
    m.position.y = -3.15 + (i % 2) * 0;
    m.position.x = 1.5 + i * 0.55;
    return m;
  }),
  inst(
    new THREE.BoxGeometry(0.04, 0.04, 0.2),
    gold,
    range(20, (i) => [
      -1.2 + (i % 10) * 0.1,
      -3.25 + Math.floor(i / 10) * 0.1,
      0.2,
    ]),
  ),
  cyl(0.26, 0.1, sil, 0.3, -1.3, 0.14, "z"),
  bx(0.4, 0.1, 0.12, blk, -0.6, -0.85, 0.12),
  cyl(0.05, 0.08, gold, 0.55, -0.85, 0.12, "z"),
);
P.mon.add(
  bx(0.05, 0.05, 0.02, rgb(0.5), 4.8, -3.0, 0.16),
  bx(1.6, 0.5, 0.06, blk, 0, -1, -0.14),
  ...range(3, (i) =>
    bx(0.3, 0.14, 0.05, M(0x222831), -0.4 + i * 0.4, -1, -0.18),
  ),
);
P.kb.add(cyl(0.18, 0.12, rgb(0.4), 3.2, 0.3, -0.85, "z"));
const detallePieza = document.getElementById("detalle-pieza");
const detalleTitulo = document.getElementById("detalle-titulo");
const detalleFuncion = document.getElementById("detalle-funcion");
const detalleCaracteristicas = document.getElementById(
  "detalle-caracteristicas",
);
const detalleInstalacion = document.getElementById("detalle-instalacion");
const cerrarDetalle = () => {
  detallePieza.hidden = true;
};
detallePieza
  .querySelector(".detalle-cerrar")
  .addEventListener("click", cerrarDetalle);
addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !detallePieza.hidden) cerrarDetalle();
});

const piezaRaycaster = new THREE.Raycaster(),
  piezaNdc = new THREE.Vector2();
const raizPorObjeto = new Map();
let inicioClic = null;
cv.addEventListener("pointerdown", (e) => {
  if (e.button === 0)
    inicioClic = { x: e.clientX, y: e.clientY, id: e.pointerId };
});
addEventListener("pointerup", (e) => {
  if (!inicioClic || inicioClic.id !== e.pointerId) return;
  const inicio = inicioClic;
  inicioClic = null;
  if (
    e.button !== 0 ||
    e.target !== cv ||
    Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y) > 6 ||
    gal ||
    man
  )
    return;
  raizPorObjeto.clear();
  Object.entries(P).forEach(([id, o]) => raizPorObjeto.set(o, id));
  piezaNdc.set(
    ((e.clientX - cv.getBoundingClientRect().left) / cv.clientWidth) * 2 - 1,
    -((e.clientY - cv.getBoundingClientRect().top) / cv.clientHeight) * 2 + 1,
  );
  piezaRaycaster.setFromCamera(piezaNdc, cam);
  const piezasVisibles = Object.values(P).filter((o) => o.visible);
  const impactos = piezaRaycaster.intersectObjects(piezasVisibles, true);
  const impacto =
    impactos.find((hit) => {
      let o = hit.object;
      while (o && !raizPorObjeto.has(o)) o = o.parent;
      return o && raizPorObjeto.get(o) !== "glass";
    }) || impactos[0];
  if (!impacto) return;
  let raiz = impacto.object;
  while (raiz && !raizPorObjeto.has(raiz)) raiz = raiz.parent;
  if (!raiz) return;
  const id = raizPorObjeto.get(raiz),
    ficha = FICHA[id],
    pasoPieza = PASOS.find((p) => p.p.includes(id));
  if (!ficha) return;

  detalleTitulo.textContent = pasoPieza ? pasoPieza.n : id;
  detalleFuncion.textContent = FUNCION[id] || ficha[0];
  const producto = PRODUCTOS[id],
    modelo = document.createElement("li"),
    enlaceProducto = document.createElement("a");
  enlaceProducto.href = producto.fuente;
  enlaceProducto.target = "_blank";
  enlaceProducto.rel = "noopener noreferrer";
  enlaceProducto.textContent = producto.nombre;
  modelo.append("Modelo propuesto: ", enlaceProducto);
  const avisoModelo = document.createElement("li");
  avisoModelo.className = "modelo-nota";
  avisoModelo.textContent = AVISO_MODELO;
  detalleCaracteristicas.replaceChildren(
    modelo,
    avisoModelo,
    ...ficha[1].map((caracteristica) => {
      const li = document.createElement("li");
      li.textContent = caracteristica;
      return li;
    }),
  );
  detalleInstalacion.textContent = pasoPieza ? pasoPieza.t : "";
  detallePieza.hidden = false;

  raiz.updateMatrixWorld(true);
  const caja = new THREE.Box3().setFromObject(raiz),
    centro = caja.getCenter(new THREE.Vector3()),
    tamano = caja.getSize(new THREE.Vector3());
  const distancia = Math.max(
    2.5,
    Math.min(18, Math.max(tamano.x, tamano.y, tamano.z) * 1.7),
  );
  const direccion = cam.position.clone().sub(ctl.target);
  if (direccion.lengthSq() < 1e-6) direccion.set(0, 0, 1);
  direccion.setLength(distancia);
  const camInicio = cam.position.clone(),
    objetivoInicio = ctl.target.clone(),
    camFin = centro.clone().add(direccion);
  tw = tw.filter((a) => a.tag !== "camera");
  ctl.autoRotate = false;
  add(
    0.9,
    (k) => {
      k = out(k);
      cam.position.lerpVectors(camInicio, camFin, k);
      ctl.target.lerpVectors(objetivoInicio, centro, k);
    },
    0,
    "camera",
  );
});
