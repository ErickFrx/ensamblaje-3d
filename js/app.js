const PASOS = [
  {
    f: "1 · Ensamblar la torre",
    n: "Fuente de alimentación",
    p: ["psu"],
    t: "Entrega la tensión a todos los circuitos. Se fija al fondo del case con tornillos.",
    c: [-2, 5, 15, -9, 3, 0],
  },
  {
    f: "1 · Ensamblar la torre",
    n: "Placa madre",
    p: ["mobo"],
    t: "Conecta todos los componentes. Se alinea con los separadores del case y se atornilla.",
    c: [-5, 7, 13, -9, 5, 0],
  },
  {
    f: "1 · Ensamblar la torre",
    n: "Procesador",
    p: ["cpu"],
    t: "Alinee el indicador con el pin 1 del zócalo y cierre la palanca de carga.",
    c: [-8, 6.5, 8, -10, 6.3, 0],
  },
  {
    f: "1 · Ensamblar la torre",
    n: "Refrigeración líquida RGB",
    p: ["aio"],
    t: "La bomba va sobre la CPU y el radiador con 3 ventiladores RGB al frente del case.",
    c: [-3, 7, 12, -8, 5.5, 0],
  },
  {
    f: "1 · Ensamblar la torre",
    n: "Memoria RAM RGB (×4)",
    p: ["ram"],
    t: "Alinee la muesca y presione hasta que las pestañas hagan clic.",
    c: [-6, 7, 9, -8.5, 6, 0],
  },
  {
    f: "1 · Ensamblar la torre",
    n: "Unidad SSD M.2",
    p: ["ssd"],
    t: "Almacenamiento rápido sin partes móviles. Se instala directo en la placa con su disipador.",
    c: [-7, 5.5, 8, -10, 4.5, 0],
  },
  {
    f: "1 · Ensamblar la torre",
    n: "Tarjeta de video RGB",
    p: ["gpu"],
    t: "Se inserta en la ranura PCIe x16 y se asegura con tornillos al soporte.",
    c: [-4, 4.5, 12, -9, 3.2, 0],
  },
  {
    f: "1 · Ensamblar la torre",
    n: "Panel de cristal",
    p: ["glass"],
    t: "Cierra el case. La torre queda lista.",
    c: [-3, 6, 17, -9, 4.5, 0],
  },
  {
    f: "2 · Periféricos",
    n: "Teclado RGB",
    p: ["kb"],
    cab: "kb",
    t: "Se conecta por USB al panel frontal de la torre.",
    c: [-1, 8, 15, -2, 1, 3],
  },
  {
    f: "2 · Periféricos",
    n: "Mouse RGB",
    p: ["mouse"],
    cab: "mouse",
    t: "Se conecta por USB al panel frontal de la torre.",
    c: [2, 8, 15, 1, 1, 3],
  },
  {
    f: "3 · Monitor",
    n: "Monitor",
    p: ["mon"],
    cab: "mon",
    t: "El cable de video une la tarjeta de video con el monitor.",
    c: [2, 7, 17, 2, 4, -2],
  },
  {
    f: "3 · Monitor",
    n: "Parlantes",
    p: ["spk"],
    t: "Coloque un parlante a cada lado del monitor y conéctelos al equipo para tener sonido.",
    c: [2, 7, 18, 2, 2, -4],
  },
  {
    f: "4 · Finalizado",
    n: "Encender el equipo",
    p: [],
    end: 1,
    t: "<b>¡Ensamblaje completo!</b> Equipo encendido y funcionando.",
    c: [5, 8, 26, -3, 4, 0],
  },
];

const cv = document.getElementById("c"),
  R = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
R.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.5 : 2));
const S = new THREE.Scene();
S.background = new THREE.Color(0x04060b);
S.fog = new THREE.Fog(0x04060b, 35, 80);
const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
cam.position.set(-2, 5, 15);
const ctl = new THREE.OrbitControls(cam, cv);
ctl.target.set(-9, 3, 0);
ctl.enableDamping = true;
ctl.autoRotateSpeed = 1.2;
const bloom = configurarIluminacion(R, S);
const comp = new THREE.EffectComposer(R);
comp.addPass(new THREE.RenderPass(S, cam));
comp.addPass(bloom);
const M = (c, o = {}) =>
  new THREE.MeshStandardMaterial(
    Object.assign({ color: c, roughness: 0.4, metalness: 0.7 }, o),
  );
const dark = M(0x12151c),
  metal = M(0x2a2f3a, { roughness: 0.3 }),
  pcb = M(0x0a0d14, { roughness: 0.6, metalness: 0.2 });
let rgbOn = true;
const rgbs = [];
const rgb = (o = 0) => {
  const m = new THREE.MeshBasicMaterial({ color: 0xffffff });
  m.userData.o = o;
  rgbs.push(m);
  return m;
};
function rb(w, h, d, r, m) {
  const s = new THREE.Shape(),
    x = -w / 2,
    y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: d,
    bevelEnabled: true,
    bevelThickness: Math.min(r, d) * 0.25,
    bevelSize: r * 0.2,
    bevelSegments: 2,
    curveSegments: 6,
  });
  g.translate(0, 0, -d / 2);
  return new THREE.Mesh(g, m);
}
const G = (...k) => {
  const g = new THREE.Group();
  k.forEach((c) => g.add(c));
  return g;
};
const at = (o, x, y, z) => {
  o.position.set(x, y, z);
  return o;
};
const spin = [];
function rbf(w, d, h, r, m) {
  const s = new THREE.Shape(),
    x = -w / 2,
    y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d);
  s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: h,
    bevelEnabled: false,
    curveSegments: 6,
  });
  g.translate(0, 0, -h / 2);
  g.rotateX(-Math.PI / 2);
  return new THREE.Mesh(g, m);
}
const tex = (w, h, fn) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  fn(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 8;
  return t;
};
const plane = (w, h, t, op = 1) =>
  new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({
      map: t,
      transparent: true,
      opacity: op,
      depthWrite: false,
    }),
  );
const fins = (n, w, d, gap, m) => {
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(w, 0.045, d), m, n),
    o = new THREE.Object3D();
  for (let i = 0; i < n; i++) {
    o.position.set(0, (i - (n - 1) / 2) * gap, 0);
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
  }
  return im;
};
function fan(r, m = dark) {
  const g = new THREE.Group(),
    b = new THREE.Group();
  g.add(rb(r * 2.1, r * 2.1, 0.18, r * 0.2, m));
  g.add(
    new THREE.Mesh(
      new THREE.TorusGeometry(r * 0.95, 0.035, 8, 40),
      rgb(),
    ).translateZ(0.1),
  );
  for (let i = 0; i < 9; i++) {
    const bl = rb(r * 0.5, r * 0.85, 0.03, r * 0.15, M(0x1d222c));
    bl.position.set(0, r * 0.5, 0);
    bl.rotation.set(0.5, 0, 0);
    const h = new THREE.Group();
    h.add(bl);
    h.rotation.z = (i / 9) * 6.283;
    b.add(h);
  }
  b.add(
    new THREE.Mesh(
      new THREE.CylinderGeometry(r * 0.22, r * 0.22, 0.12, 20),
      M(0x0a0a0f),
    ).rotateX(Math.PI / 2),
  );
  b.position.z = 0.05;
  g.add(b);
  spin.push(b);
  return g;
}
const T = new THREE.Group();
T.position.set(-9, 0, 0);
S.add(T);
agregarLucesTorre(T);
const P = {};
const reg = (id, o, x, y, z, ex) => {
  o.position.set(x, y, z);
  o.userData = { to: o.position.clone(), ex: new THREE.Vector3(...ex) };
  o.visible = false;
  T.add(o);
  P[id] = o;
  return o;
};
{
  const cs = M(0x0d0f15, { roughness: 0.35 });
  T.add(
    at(rbf(8.6, 4.6, 0.3, 0.12, cs), 0, 0.1, 0),
    at(rbf(8.6, 4.6, 0.3, 0.12, cs), 0, 9.1, 0),
  );
  T.add(
    at(rb(8.6, 9.2, 0.15, 0.1, cs), 0, 4.6, -2.25),
    at(rb(0.25, 9.2, 4.6, 0.1, cs), 4.3, 4.6, 0),
  );
  [
    [-4.2, -2.1],
    [-4.2, 2.1],
    [4.2, 2.1],
  ].forEach(([x, z]) =>
    T.add(
      at(
        new THREE.Mesh(new THREE.BoxGeometry(0.2, 9.2, 0.2), M(0x3a4150)),
        x,
        4.6,
        z,
      ),
    ),
  );
  T.add(
    at(
      new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 3.6), rgb()),
      4.15,
      0.3,
      0,
    ),
  );
  [-1, 1].forEach((s) =>
    T.add(
      at(
        new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.3), M(0x000)),
        4.45,
        8.4,
        s * 0.7,
      ),
    ),
  );
}
reg(
  "psu",
  G(
    rb(6.4, 1.5, 3.8, 0.12, metal),
    at(
      new THREE.Mesh(new THREE.BoxGeometry(6, 0.05, 0.12), rgb(0.3)),
      0,
      0.78,
      1.9,
    ),
    at(
      new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 24), dark),
      -2,
      0,
      1.95,
    ).rotateX(Math.PI / 2),
  ),
  -0.6,
  1.05,
  -0.1,
  [0, -3, 9],
);
const mobo = G(
  rb(6.5, 6.8, 0.14, 0.15, pcb),
  at(rb(1.9, 1.1, 0.3, 0.1, M(0x050608)), -2.6, 1.9, 0.2),
  at(rb(1.9, 1.1, 0.3, 0.1, M(0x050608)), -2.6, 0.3, 0.2),
  at(rb(1.4, 1.4, 0.2, 0.1, M(0x16191f)), 1.8, -1.6, 0.15),
  at(
    new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.03), rgb(0.5)),
    1.8,
    -1.6,
    0.27,
  ),
  at(
    new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.12, 0.06), M(0x000)),
    -0.5,
    -1.1,
    0.1,
  ),
  at(
    new THREE.Mesh(new THREE.BoxGeometry(0.04, 6.4, 0.03), rgb(0.2)),
    3.0,
    0,
    0.1,
  ),
);
reg("mobo", mobo, -0.6, 5.35, -1.9, [0, 0, 10]);
reg(
  "cpu",
  G(
    rb(1, 1, 0.1, 0.08, M(0xb9bec8, { roughness: 0.2 })),
    at(
      rb(0.7, 0.7, 0.06, 0.05, M(0xd9b66a, { metalness: 1, roughness: 0.25 })),
      0,
      0,
      0.07,
    ),
  ),
  -1.2,
  6.3,
  -1.78,
  [-5, 2, 10],
);
{
  const pump = G(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.9, 0.55, 40),
      M(0x14161d),
    ).rotateX(Math.PI / 2),
    at(
      new THREE.Mesh(
        new THREE.CircleGeometry(0.62, 40),
        new THREE.MeshPhysicalMaterial({
          color: 0x05060a,
          metalness: 0.9,
          roughness: 0.1,
        }),
      ),
      0,
      0,
      0.29,
    ),
    at(
      new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.045, 8, 48), rgb()),
      0,
      0,
      0.3,
    ),
    at(
      new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 8, 32), rgb(0.5)),
      0,
      0,
      0.31,
    ),
  );
  pump.position.set(-1.2, 6.3, -1.4);
  const tube = (pts) =>
    new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))),
        40,
        0.14,
        10,
      ),
      M(0x08090c, { roughness: 0.8, metalness: 0.1 }),
    );
  const rad = G(rb(0.55, 6.6, 1.9, 0.1, M(0x1a1d25)));
  rad.position.set(3.4, 5.3, -0.9);
  [3.2, 5.3, 7.4].forEach((y) => {
    const f = fan(1, dark);
    f.rotation.y = -Math.PI / 2;
    f.position.set(-0.45, y - 5.3, 0);
    rad.add(f);
  });
  reg(
    "aio",
    G(
      pump,
      tube([
        [-0.7, 6.5, -1.3],
        [0.2, 7.7, -1.1],
        [2.2, 8.4, -0.9],
        [3.3, 8.2, -0.9],
      ]),
      tube([
        [-0.9, 6.0, -1.3],
        [0, 4.9, -1.1],
        [2.2, 2.6, -0.9],
        [3.3, 2.4, -0.9],
      ]),
      rad,
    ),
    0,
    0,
    0,
    [10, 0, 3],
  );
  P.aio.userData.to.set(0, 0, 0);
}
{
  const st = (x) =>
    G(
      rb(0.17, 3, 0.8, 0.06, pcb),
      at(rb(0.2, 2.9, 0.7, 0.05, metal), 0, 0, 0.05),
      at(
        new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.5, 0.14), rgb(x)),
        0,
        0,
        0.42,
      ),
    );
  reg(
    "ram",
    G(at(st(0.0), 0, 0, 0), at(st(0.3), 0.45, 0, 0)),
    0.9,
    6.0,
    -1.5,
    [8, 3, 6],
  );
}
reg(
  "ssd",
  G(
    rb(2.1, 0.65, 0.08, 0.05, pcb),
    at(rb(2, 0.6, 0.12, 0.05, metal), 0, 0, 0.09),
    at(
      new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.05, 0.04), rgb(0.7)),
      0,
      0,
      0.17,
    ),
  ),
  -1.2,
  4.5,
  -1.78,
  [-6, 0, 9],
);
{
  const g = G(
    rb(6, 1.7, 1.5, 0.2, M(0x0c0e14, { roughness: 0.3 })),
    at(
      new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.07, 0.1), rgb(0.4)),
      0,
      0.88,
      0.2,
    ),
    at(
      new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.04, 0.04), rgb(0.8)),
      0,
      -0.88,
      0.3,
    ),
    at(rb(0.1, 1.9, 1.5, 0.05, metal), -3.05, 0, 0),
  );
  [-2, 0, 2].forEach((x) => {
    const f = fan(0.62, M(0x0c0e14));
    f.position.set(x, 0, 0.77);
    g.add(f);
  });
  reg("gpu", g, -0.4, 3.0, -1.0, [0, 0, 11]);
}
reg(
  "glass",
  rb(
    8.4,
    9,
    0.08,
    0.2,
    new THREE.MeshPhysicalMaterial({
      color: 0x99ccff,
      transparent: true,
      opacity: 0.1,
      roughness: 0.03,
      metalness: 0.1,
    }),
  ),
  0,
  4.6,
  2.3,
  [0, 6, 10],
);

const pcbT = tex(512, 512, (c, w, h) => {
  c.strokeStyle = "#2aa3b5";
  c.lineWidth = 2;
  for (let i = 0; i < 70; i++) {
    c.beginPath();
    let x = Math.random() * w,
      y = Math.random() * h;
    c.moveTo(x, y);
    for (let k = 0; k < 4; k++) {
      x += (Math.random() - 0.5) * 150;
      c.lineTo(x, y);
      y += (Math.random() - 0.5) * 150;
      c.lineTo(x, y);
    }
    c.stroke();
  }
  c.fillStyle = "#d6ae55";
  for (let i = 0; i < 160; i++)
    c.fillRect(Math.random() * w, Math.random() * h, 5, 5);
  c.fillStyle = "#bff";
  c.font = "bold 30px monospace";
  c.fillText("UNDC · Z790 GAMING", 30, 495);
});
const tr = plane(6.3, 6.6, pcbT, 0.5);
tr.position.z = 0.09;
P.mobo.add(tr);
[1.5, 1.95, 2.4, 2.85].forEach((x) =>
  P.mobo.add(
    at(
      new THREE.Mesh(new THREE.BoxGeometry(0.17, 3.1, 0.3), M(0x1a1c22)),
      x,
      0.65,
      0.2,
    ),
  ),
);
[
  [-0.75, -2.4, 4.6],
  [-0.75, -1.35, 2],
].forEach(([x, y, l]) =>
  P.mobo.add(
    at(
      new THREE.Mesh(new THREE.BoxGeometry(l, 0.18, 0.3), M(0x050608)),
      x,
      y,
      0.2,
    ),
  ),
);
P.mobo.add(
  at(
    new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 1.7, 0.4),
      M(0xe8e8e8, { roughness: 0.8, metalness: 0 }),
    ),
    2.95,
    -0.7,
    0.2,
  ),
);
for (let i = 0; i < 12; i++)
  P.mobo.add(
    at(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.3, 12),
        M(i % 2 ? 0x222a33 : 0xb8bcc4, { roughness: 0.3 }),
      ).rotateX(Math.PI / 2),
      -2.9 + (i % 6) * 0.32,
      2.9 - (i % 2) * 0.35,
      0.2,
    ),
  );
[
  [-2.6, 1.9],
  [-2.6, 0.3],
].forEach(([x, y]) =>
  P.mobo.add(at(fins(9, 1.8, 0.5, 0.12, M(0x3a4150)), x, y, 0.5)),
);
P.mobo.add(at(fins(7, 1.3, 0.3, 0.15, M(0x3a4150)), 1.8, -1.6, 0.4));
P.aio.children[3].add(at(fins(32, 0.55, 1.7, 0.2, M(0x2a2f3a)), 0, 0, 0.96));
P.gpu.add(
  at(
    new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.28, 0.5), dark),
    1.6,
    0.95,
    0.2,
  ),
);
P.gpu.add(
  at(
    plane(
      1.6,
      0.25,
      tex(256, 40, (c) => {
        c.fillStyle = "#fff";
        c.font = "bold 26px Segoe UI";
        c.fillText("UNDC GAMING", 6, 30);
      }),
    ),
    -2.1,
    -0.55,
    0.79,
  ),
);
const lab = (t, w, h, fs, col = "#e8f4ff") =>
  plane(
    w,
    h,
    tex(256, Math.round((256 * h) / w), (c, W, H) => {
      c.fillStyle = col;
      c.font = "bold " + fs + "px Segoe UI";
      c.textAlign = "center";
      c.textBaseline = "middle";
      t.split("|").forEach((s, i, a) =>
        c.fillText(s, W / 2, (H * (i + 0.5)) / a.length),
      );
    }),
    1,
  );
P.cpu.add(at(lab("UNDC|i9-14900K", 0.62, 0.62, 44, "#2a2210"), 0, 0, 0.11));
P.ram.children.forEach((k) => {
  const l = lab("DDR5-6000  CL30", 2.3, 0.4, 40);
  l.rotation.set(0, Math.PI / 2, Math.PI / 2);
  l.position.set(0.105, 0, 0.05);
  k.add(l);
});
P.ssd.add(at(lab("UNDC NVMe 2TB|PCIe Gen4", 1.7, 0.3, 38), 0, 0.12, 0.16));
P.aio.children[0].add(at(lab("UNDC", 0.9, 0.35, 70), 0, 0, 0.33));
[0.35, 0.6, 0.85, 1.1].forEach((r) =>
  P.psu.add(
    at(
      new THREE.Mesh(new THREE.TorusGeometry(r, 0.025, 8, 40), M(0x59606e)),
      -2,
      0,
      1.92,
    ),
  ),
);
P.psu.add(at(lab("UNDC 850W|80 PLUS GOLD", 2.2, 0.8, 38), 1.5, 0, 1.93));
S.add(
  at(
    rbf(36, 14, 0.5, 0.3, M(0x0b0d12, { roughness: 0.2, metalness: 0.5 })),
    0,
    -0.28,
    0,
  ),
);
S.add(
  at(
    new THREE.Mesh(
      new THREE.PlaneGeometry(36.4, 14.4).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x0b0d12 }),
    ),
    0,
    -0.5,
    0,
  ),
);
const D = new THREE.Group();
S.add(D);
const regD = (id, o, x, y, z, ex) => {
  o.position.set(x, y, z);
  o.userData = { to: o.position.clone(), ex: new THREE.Vector3(...ex) };
  o.visible = false;
  D.add(o);
  P[id] = o;
};
{
  const keys = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.42, 0.16, 0.42),
      M(0x1a1d25),
      70,
    ),
    d = new THREE.Object3D();
  let n = 0;
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 14; c++) {
      d.position.set(-3 + c * 0.46, 0.27, -0.85 + r * 0.43);
      d.updateMatrix();
      keys.setMatrixAt(n++, d.matrix);
    }
  regD(
    "kb",
    G(
      rbf(7.2, 2.5, 0.3, 0.14, metal),
      keys,
      at(
        new THREE.Mesh(new THREE.BoxGeometry(6.9, 0.05, 2.1), rgb()),
        0,
        0.22,
        0,
      ),
    ),
    0.5,
    0.2,
    4.1,
    [0, 6, 4],
  );
}
{
  const kT = tex(1450, 500, (c, w, h) => {
    c.fillStyle = "#bff";
    c.font = "bold 34px monospace";
    c.textAlign = "center";
    [
      "ESC1234567890-+",
      "TQWERTYUIOP[]",
      "CASDFGHJKL;↵",
      "SZXCVBNM,./^",
    ].forEach((r, i) =>
      [...r]
        .slice(0, 14)
        .forEach((ch, j) =>
          c.fillText(
            ch,
            ((j * 0.46 + 0.23) / 6.46) * w,
            ((i * 0.43 + 0.3) / 2.15) * h,
          ),
        ),
    );
  });
  const kp = plane(6.46, 2.15, kT, 0.95);
  kp.rotation.x = -Math.PI / 2;
  kp.position.set(-0.01, 0.365, 0.01);
  P.kb.add(kp);
}
regD(
  "mouse",
  G(
    at(
      ((m) => {
        m.scale.set(0.5, 0.27, 0.82);
        return m;
      })(
        new THREE.Mesh(
          new THREE.SphereGeometry(1, 40, 24),
          M(0x13161d, { roughness: 0.22 }),
        ),
      ),
      0,
      0.2,
      0,
    ),
    at(
      new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.02, 0.75), M(0x000)),
      0,
      0.46,
      -0.3,
    ),
    at(
      new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.3), rgb(0.8)),
      -0.47,
      0.2,
      0.1,
    ),
    at(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.16, 16),
        rgb(),
      ).rotateZ(Math.PI / 2),
      0,
      0.46,
      -0.3,
    ),
    at(
      new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.03, 8, 32),
        rgb(0.6),
      ).rotateX(Math.PI / 2),
      0,
      0.04,
      0,
    ),
  ),
  7.2,
  0.05,
  4.1,
  [0, 6, 4],
);
D.add(at(rbf(14.4, 5.2, 0.04, 0.15, rgb(0.2)), 3.2, 0.02, 4.2));
D.add(
  at(
    rbf(14, 4.8, 0.06, 0.12, M(0x080a0f, { roughness: 0.8, metalness: 0.1 })),
    3.2,
    0.05,
    4.2,
  ),
);
const sc = document.createElement("canvas");
sc.width = 1280;
sc.height = 720;
const x = sc.getContext("2d");
const gr = x.createLinearGradient(0, 0, 1280, 720);
gr.addColorStop(0, "#05122b");
gr.addColorStop(0.5, "#2b0b5e");
gr.addColorStop(1, "#00a6c8");
x.fillStyle = gr;
x.fillRect(0, 0, 1280, 720);
x.fillStyle = "rgba(255,255,255,.08)";
for (let i = 0; i < 7; i++) {
  x.beginPath();
  x.arc(200 + i * 180, 500 - i * 40, 90 + i * 14, 0, 7);
  x.fill();
}
x.fillStyle = "#fff";
x.textAlign = "center";
x.font = "bold 54px Segoe UI";
x.fillText("UNIVERSIDAD NACIONAL DE CAÑETE", 640, 320);
x.font = "28px Segoe UI";
x.fillStyle = "#8ff";
x.fillText("Simulador Virtual de Ensamblaje  ·  Equipo 02", 640, 375);
x.fillStyle = "rgba(8,12,24,.85)";
x.fillRect(0, 672, 1280, 48);
x.fillStyle = "#fff";
x.font = "20px Segoe UI";
x.textAlign = "left";
x.fillText("●  UNDC   |   Windows", 20, 704);
const scrM = new THREE.MeshBasicMaterial({
  map: new THREE.CanvasTexture(sc),
  color: 0x000000,
});
{
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(10.6, 5.9), scrM);
  scr.position.z = 0.14;
  regD(
    "mon",
    G(
      rb(11, 6.3, 0.22, 0.15, M(0x0b0d12)),
      scr,
      at(
        new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.06, 0.05), rgb(0.3)),
        0,
        -3.08,
        -0.14,
      ),
      at(rb(11.3, 6.6, 0.05, 0.2, rgb(0.1)), 0, 0, -0.2),
      at(
        new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.6, 0.3), metal),
        0,
        -4.2,
        -0.1,
      ),
      at(rbf(3.4, 2.2, 0.15, 0.12, metal), 0, -5.4, 0),
    ),
    2,
    5.7,
    -3.4,
    [0, 7, -3],
  );
}
const cabs = {},
  cab = (id, pts, r, col) => {
    const g = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))),
      90,
      r,
      8,
    );
    g.setDrawRange(0, 0);
    const m = new THREE.Mesh(g, M(col, { roughness: 0.9, metalness: 0 }));
    m.visible = false;
    S.add(m);
    cabs[id] = m;
  };
cab(
  "kb",
  [
    [-3.1, 0.2, 3.3],
    [-3.9, 0.1, 2.9],
    [-4.6, 0.1, 2.2],
    [-4.7, 3, 1.4],
    [-4.5, 7.9, 0.7],
    [-4.6, 8.35, 0.7],
  ],
  0.05,
  0x15181f,
);
cab(
  "mouse",
  [
    [6.7, 0.2, 3.4],
    [4, 0.1, 2.2],
    [-1, 0.1, 2.0],
    [-4.2, 0.1, 1.9],
    [-4.7, 4, 1.2],
    [-4.5, 8.0, -0.7],
    [-4.6, 8.35, -0.7],
  ],
  0.04,
  0x15181f,
);
cab(
  "mon",
  [
    [2, 2.8, -3.6],
    [1, 0.1, -4.3],
    [-8, 0.1, -4.4],
    [-13.6, 0.2, -3],
    [-13.7, 2.5, -1],
    [-13.4, 3.1, -1],
  ],
  0.07,
  0x050507,
);
const lista = document.getElementById("lista"),
  info = document.getElementById("info");
let tw = [],
  cur = -1,
  fPrev = "";
function ocultarInfoComponente() {
  document.getElementById("detalle-pieza").hidden = true;
}
PASOS.forEach((p, i) => {
  if (p.f !== fPrev) {
    lista.insertAdjacentHTML("beforeend", `<div class="fase">${p.f}</div>`);
    fPrev = p.f;
  }
  const d = document.createElement("div");
  d.className = "paso";
  d.textContent = i + 1 + ". " + p.n;
  d.onclick = () => {
    stopAuto();
    goTo(i);
  };
  p.el = d;
  lista.appendChild(d);
});
const out = (k) => 1 - Math.pow(1 - k, 3),
  easeB = (k) => {
    const c = 1.4;
    return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);
  };
const add = (dur, fn, delay = 0, tag) => {
  const o = { dur, fn, t: -delay, tag };
  tw.push(o);
  return o;
};
function cables(p, inst, d0 = 0) {
  if (!p.cab) return;
  const c = cabs[p.cab];
  c.visible = true;
  const n = c.geometry.index.count;
  if (inst) {
    c.geometry.setDrawRange(0, n);
    if (p.cab === "mon") scrM.color.setScalar(1);
  } else {
    add(
      1.6,
      (k) => {
        c.geometry.setDrawRange(0, Math.floor((n * out(k)) / 3) * 3);
      },
      d0,
    );
    if (p.cab === "mon") add(0.8, (k) => scrM.color.setScalar(k), d0 + 1.7);
  }
}
function paso(inst, forzarAuto) {
  if (cur >= PASOS.length - 1) return;
  ocultarInfoComponente();
  if (man) completarManual();
  const p = PASOS[++cur];
  const manual = !inst && !forzarAuto && modoManual && p.p.length > 0;
  const ca = cam.position.clone(),
    ta = ctl.target.clone(),
    cb = new THREE.Vector3(...p.c.slice(0, 3)),
    tb = new THREE.Vector3(...p.c.slice(3));
  p.p.forEach((id, j) => {
    const o = P[id];
    o.visible = true;
    o.quaternion.identity();
    const a = o.userData.to.clone().add(o.userData.ex),
      b = o.userData.to;
    if (manual) o.position.copy(b);
    else {
      o.position.copy(inst ? b : a);
      if (!inst)
        add(1.2, (k) => o.position.lerpVectors(a, b, easeB(k)), j * 0.15);
    }
  });
  if (manual) iniciarManual(p, cb, tb);
  else cables(p, inst, 1.1);
  if (p.end) {
    endOn = 1;
    ctl.autoRotate = true;
  }
  if (inst) {
    cam.position.copy(cb);
    ctl.target.copy(tb);
  } else
    add(
      1.8,
      (k) => {
        k = out(k);
        cam.position.lerpVectors(ca, cb, k);
        ctl.target.lerpVectors(ta, tb, k);
      },
      0,
      "camera",
    );
  PASOS.forEach((q, j) => {
    q.el.classList.toggle("ok", j < cur);
    q.el.classList.toggle("act", j === cur);
    q.el.classList.toggle("active", j === cur);
    if (j === cur) q.el.setAttribute("aria-current", "step");
    else q.el.removeAttribute("aria-current");
  });
  info.innerHTML =
    `<b>${p.n}</b><br>${p.t}` +
    (manual
      ? '<div style="margin-top:8px;color:#ff737b">✋ Arrastra la pieza hasta la guía y gírala para que encaje.</div>'
      : "");
  btnPrev.disabled = false;
}
let endOn = 0,
  autoT = 0;
function reset() {
  ocultarInfoComponente();
  cerrarManual();
  tw = [];
  cur = -1;
  endOn = 0;
  ctl.autoRotate = false;
  Object.values(P).forEach((o) => {
    o.visible = false;
    o.quaternion.identity();
  });
  Object.values(cabs).forEach((c) => {
    c.visible = false;
    c.geometry.setDrawRange(0, 0);
  });
  scrM.color.setScalar(0);
  PASOS.forEach((q) => {
    q.el.className = "paso";
    q.el.removeAttribute("aria-current");
  });
  cam.position.set(-2, 5, 15);
  ctl.target.set(-9, 3, 0);
  info.innerHTML =
    "<b>Listo para empezar</b><br>Pulsa «Siguiente» para ensamblar la torre.";
  btnPrev.disabled = true;
}
function stopAuto() {
  clearInterval(autoT);
  autoT = 0;
  document.getElementById("auto").textContent = "Auto ▶";
}
function irAtras(i) {
  const ca = cam.position.clone(),
    ta = ctl.target.clone();
  reset();
  while (cur < i) paso(true);
  const cb = cam.position.clone(),
    tb = ctl.target.clone();
  cam.position.copy(ca);
  ctl.target.copy(ta);
  add(
    1.2,
    (k) => {
      k = out(k);
      cam.position.lerpVectors(ca, cb, k);
      ctl.target.lerpVectors(ta, tb, k);
    },
    0,
    "camera",
  );
}
function goTo(i) {
  if (i < 0) {
    irAtras(-1);
    return;
  }
  if (i <= cur || man) {
    irAtras(i);
    return;
  }
  while (cur < i - 1) paso(true);
  paso();
}
function siguiente() {
  if (man) {
    manAviso("Primero coloca la pieza en su lugar (o usa «Colocar por mí»).");
    return;
  }
  paso();
}
function anterior() {
  if (cur < 0) return;
  goTo(cur - 1);
}
const btnPrev = document.getElementById("prev");
btnPrev.disabled = true;
document.getElementById("sig").onclick = () => {
  stopAuto();
  siguiente();
};
btnPrev.onclick = () => {
  stopAuto();
  anterior();
};
document.getElementById("rst").onclick = () => {
  stopAuto();
  reset();
};
document.getElementById("rgb").onclick = (e) => {
  rgbOn = !rgbOn;
  bloom.strength = rgbOn ? 0.75 : 0;
  e.currentTarget.textContent = rgbOn ? "RGB: ENCENDIDO" : "RGB: APAGADO";
  e.currentTarget.classList.toggle("on", rgbOn);
};
document.getElementById("auto").onclick = () => {
  if (autoT) {
    stopAuto();
    return;
  }
  document.getElementById("auto").textContent = "Pausar ⏸";
  if (man) completarManual();
  if (cur >= PASOS.length - 1) reset();
  autoT = setInterval(() => {
    if (cur >= PASOS.length - 1) stopAuto();
    else paso(false, true);
  }, 3600);
};
document.getElementById("modo").onclick = () => {
  modoManual = !modoManual;
  if (!modoManual && man) completarManual();
  actualizarModo();
};
function actualizarModo() {
  const b = document.getElementById("modo");
  b.textContent = modoManual ? "Manual: SÍ" : "Manual: NO";
  b.classList.toggle("on", modoManual);
}
let modoManual = false,
  man = null;
const ST = {},
  ghosts = {};
const GM = new THREE.MeshBasicMaterial({
  color: 0xff4466,
  transparent: true,
  opacity: 0.26,
  depthWrite: false,
  depthTest: false,
  side: THREE.DoubleSide,
});
const mano = document.getElementById("mano"),
  mst = document.getElementById("mst"),
  mnom = document.getElementById("mnom");
const V3 = (...a) => new THREE.Vector3(...a),
  QI = new THREE.Quaternion(),
  DEG = Math.PI / 180,
  PASO_ROT = 15 * DEG;
function ghostDe(id) {
  if (ghosts[id]) return ghosts[id];
  const g = P[id].clone(true);
  g.traverse((o) => {
    o.visible = true;
    if (o.isMesh) {
      o.material = GM;
      o.renderOrder = 50;
    }
  });
  g.userData = {};
  g.visible = false;
  P[id].parent.add(g);
  return (ghosts[id] = g);
}
function aplicar(id) {
  const s = ST[id],
    o = P[id];
  o.quaternion.copy(s.q);
  o.position.copy(s.pc).sub(s.c0.clone().applyQuaternion(s.q));
}
function iniciarManual(p, cb, tb) {
  man = { p, cola: p.p.slice(), act: null, hecho: false };
  mano.style.display = "block";
  siguientePieza(cb, tb);
}
function siguientePieza(cb, tb) {
  const m = man;
  m.act = m.cola.shift();
  const id = m.act,
    o = P[id],
    par = o.parent,
    to = o.userData.to;
  o.position.copy(to);
  o.quaternion.identity();
  par.updateMatrixWorld(true);
  o.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(o),
    size = bb.getSize(V3()),
    cen = par.worldToLocal(bb.getCenter(V3())),
    c0 = cen.clone().sub(to),
    dim = Math.max(size.x, size.y, size.z);
  const tol = Math.min(1.1, Math.max(0.55, dim * 0.1));
  const cbv = cb || cam.position.clone(),
    tbv = tb || ctl.target.clone(),
    v = cbv.clone().sub(tbv).normalize(),
    f = v.clone().negate(),
    right = new THREE.Vector3().crossVectors(f, V3(0, 1, 0)).normalize(),
    up2 = new THREE.Vector3().crossVectors(right, f).normalize();
  const halfH = cbv.distanceTo(tbv) * Math.tan((cam.fov * DEG) / 2),
    halfW = halfH * cam.aspect;
  const start = cen
    .clone()
    .add(right.multiplyScalar(Math.min(halfW * 0.5, halfW * 0.3 + dim * 0.4)))
    .add(up2.multiplyScalar(halfH * 0.15))
    .add(v.clone().multiplyScalar(Math.min(1, dim * 0.2 + 0.4)));
  const ys = [-90, -45, 45, 90],
    ex = [0, 0, 0, 0, 30, -30],
    ez = [0, 0, 0, 0, 0, 30, -30];
  const q = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(
      ex[(Math.random() * ex.length) | 0] * DEG,
      ys[(Math.random() * ys.length) | 0] * DEG,
      ez[(Math.random() * ez.length) | 0] * DEG,
      "YXZ",
    ),
  );
  ST[id] = {
    pc: start,
    q,
    c0,
    tgt: cen.clone(),
    tol,
    tolA: 16 * DEG,
    dim,
    par,
  };
  aplicar(id);
  const g = ghostDe(id);
  g.position.copy(to);
  g.quaternion.identity();
  g.visible = true;
  mnom.textContent = PASOS.find((x) => x.p.includes(id)).n;
  man.drag = null;
  man.ok = false;
  man.guia = true;
  man.prof = false;
  document.getElementById("mprof").classList.remove("on");
  document.getElementById("mguia").classList.add("on");
  actualizarEstado();
}
function estado(id) {
  const s = ST[id],
    d = s.pc.distanceTo(s.tgt),
    a = s.q.angleTo(QI);
  return { d, a, okP: d <= s.tol, okA: a <= s.tolA };
}
function actualizarEstado() {
  if (!man || !man.act || man.snap) return;
  const id = man.act,
    s = ST[id],
    e = estado(id),
    ok = e.okP && e.okA;
  let hint = "";
  if (!ok) {
    const f = cam.getWorldDirection(V3()),
      dv = s.tgt.clone().sub(s.pc),
      dz = dv.dot(f),
      lat = Math.sqrt(Math.max(0, dv.lengthSq() - dz * dz));
    if (lat > s.tol * 0.8) hint = "Arrastra la pieza hacia la guía.";
    else if (Math.abs(dz) > s.tol * 0.6)
      hint =
        dz > 0
          ? "Casi: aléjala un poco (▲ Más lejos)."
          : "Casi: acércala un poco (▼ Más cerca).";
    else if (!e.okA)
      hint = "Gírala hasta que quede como la guía (Q/E, W/S, A/D).";
  }
  const col = ok
    ? 0x33ff99
    : e.d < s.tol * 4 && e.a < 45 * DEG
      ? 0xffd23f
      : 0xff4466;
  GM.color.setHex(col);
  GM.opacity = ok ? 0.38 : 0.26;
  mst.innerHTML =
    `Posición ${e.okP ? '<b style="color:#5f8">✔</b>' : '<b style="color:#f66">✖</b>'} <small>(${e.d.toFixed(1)} de distancia)</small> &nbsp;·&nbsp; Orientación ${e.okA ? '<b style="color:#5f8">✔</b>' : '<b style="color:#f66">✖</b>'} <small>(${Math.round(e.a / DEG)}° de giro)</small>` +
    (man.msg ? `<div style="color:#fc6;margin-top:4px">${man.msg}</div>` : "") +
    (hint ? `<div style="color:#ff737b;margin-top:4px">💡 ${hint}</div>` : "");
}
function manAviso(t) {
  if (!man) return;
  man.msg = t;
  actualizarEstado();
  clearTimeout(man.mt);
  man.mt = setTimeout(() => {
    if (man) {
      man.msg = "";
      actualizarEstado();
    }
  }, 3500);
}
function intentarEncaje() {
  if (!man || !man.act || man.drag || man.snap) return;
  const e = estado(man.act);
  if (e.okP && e.okA) encajar(false);
}
function encajar(forzado) {
  const m = man,
    id = m.act,
    o = P[id],
    s = ST[id];
  m.snap = true;
  const pc0 = s.pc.clone(),
    q0 = s.q.clone(),
    to = o.userData.to,
    dur = forzado ? 0.8 : 0.35;
  GM.color.setHex(0x33ff99);
  GM.opacity = 0.4;
  add(dur, (k) => {
    k = out(k);
    s.pc.lerpVectors(pc0, s.tgt, k);
    s.q.slerpQuaternions(q0, QI, k);
    aplicar(id);
    if (k >= 1) {
      o.position.copy(to);
      o.quaternion.identity();
    }
  }).manual = true;
  add(dur + 0.05, (k) => {
    if (k < 1) return;
    ghosts[id].visible = false;
    m.snap = false;
    if (m.cola.length) {
      siguientePieza();
      return;
    }
    m.hecho = true;
    mano.style.display = "none";
    cables(m.p, false, 0.1);
    if (m.p.end) {
      endOn = 1;
    }
    info.innerHTML = `<b>${m.p.n}</b><br>${m.p.t}<div style="margin-top:8px;color:#5f8">✔ ¡Pieza colocada correctamente! Pulsa «Siguiente» para continuar.</div>`;
    man = null;
  }).manual = true;
}
function completarManual() {
  if (!man) return;
  const m = man;
  [m.act, ...m.cola].forEach((id) => {
    if (!id) return;
    const o = P[id];
    o.position.copy(o.userData.to);
    o.quaternion.identity();
    if (ghosts[id]) ghosts[id].visible = false;
  });
  if (!m.hecho) cables(m.p, false, 0.1);
  mano.style.display = "none";
  clearTimeout(m.mt);
  man = null;
  tw = tw.filter((a) => !a.manual);
}
function cerrarManual() {
  Object.values(ghosts).forEach((g) => (g.visible = false));
  mano.style.display = "none";
  if (man) clearTimeout(man.mt);
  man = null;
  drag = null;
}
const RC = new THREE.Raycaster(),
  NDC = new THREE.Vector2();
let drag = null;
function rayo(e) {
  const r = cv.getBoundingClientRect();
  NDC.set(
    ((e.clientX - r.left) / r.width) * 2 - 1,
    -((e.clientY - r.top) / r.height) * 2 + 1,
  );
  RC.setFromCamera(NDC, cam);
  return RC.ray;
}
const pivW = (id) => ST[id].par.localToWorld(ST[id].pc.clone());
window.addEventListener(
  "pointerdown",
  (e) => {
    if (
      !man ||
      !man.act ||
      man.snap ||
      gal ||
      e.target !== cv ||
      e.button !== 0
    )
      return;
    const id = man.act,
      o = P[id];
    o.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(o).expandByScalar(0.35),
      hit = rayo(e).intersectBox(box, V3());
    if (!hit) return;
    const dir = cam.getWorldDirection(V3());
    drag = {
      id,
      plane: new THREE.Plane().setFromNormalAndCoplanarPoint(dir, hit),
      off: pivW(id).sub(hit),
      y: e.clientY,
      prof: e.shiftKey || man.prof,
      pid: e.pointerId,
    };
    man.drag = drag;
    ctl.enabled = false;
    cv.style.cursor = "grabbing";
    try {
      cv.setPointerCapture(e.pointerId);
    } catch (_) {}
    e.stopPropagation();
  },
  true,
);
window.addEventListener("pointermove", (e) => {
  if (!drag) {
    if (man && man.act && !gal && e.target === cv && !man.snap) {
      const o = P[man.act],
        box = new THREE.Box3().setFromObject(o).expandByScalar(0.35);
      cv.style.cursor = rayo(e).intersectBox(box, V3()) ? "grab" : "";
    }
    return;
  }
  const s = ST[drag.id];
  let w;
  if (drag.prof) {
    const dir = cam.getWorldDirection(V3()),
      dy = drag.y - e.clientY;
    drag.y = e.clientY;
    w = pivW(drag.id).add(
      dir.multiplyScalar(
        dy * 0.012 * Math.max(4, cam.position.distanceTo(pivW(drag.id))) * 0.25,
      ),
    );
  } else {
    const pt = rayo(e).intersectPlane(drag.plane, V3());
    if (!pt) return;
    w = pt.add(drag.off);
  }
  s.pc.copy(s.par.worldToLocal(w));
  aplicar(drag.id);
  actualizarEstado();
});
const finDrag = (e) => {
  if (!drag) return;
  drag = null;
  if (man) man.drag = null;
  if (!gal) ctl.enabled = true;
  cv.style.cursor = "";
  intentarEncaje();
};
window.addEventListener("pointerup", finDrag);
window.addEventListener("pointercancel", finDrag);
function rotar(eje, sg) {
  if (!man || !man.act || man.snap) return;
  const s = ST[man.act];
  s.q.premultiply(new THREE.Quaternion().setFromAxisAngle(eje, sg * PASO_ROT));
  aplicar(man.act);
  actualizarEstado();
  intentarEncaje();
}
function mover(dx, dy, dz) {
  if (!man || !man.act || man.snap) return;
  const s = ST[man.act],
    f = cam.getWorldDirection(V3()),
    r = new THREE.Vector3().crossVectors(f, V3(0, 1, 0)).normalize(),
    u = new THREE.Vector3().crossVectors(r, f).normalize(),
    st = 0.25;
  s.pc
    .add(r.multiplyScalar(dx * st))
    .add(u.multiplyScalar(dy * st))
    .add(f.multiplyScalar(dz * st * 2));
  aplicar(man.act);
  actualizarEstado();
  intentarEncaje();
}
const EX = V3(1, 0, 0),
  EY = V3(0, 1, 0),
  EZ = V3(0, 0, 1);
addEventListener("keydown", (e) => {
  if (!man || !man.act || gal || man.snap) return;
  const k = e.key.toLowerCase();
  let h = true;
  if (k === "q") rotar(EY, 1);
  else if (k === "e") rotar(EY, -1);
  else if (k === "w") rotar(EX, -1);
  else if (k === "s") rotar(EX, 1);
  else if (k === "a") rotar(EZ, 1);
  else if (k === "d") rotar(EZ, -1);
  else if (k === "arrowleft") mover(-1, 0, 0);
  else if (k === "arrowright") mover(1, 0, 0);
  else if (k === "arrowup") mover(0, 1, 0);
  else if (k === "arrowdown") mover(0, -1, 0);
  else if (k === "pageup") mover(0, 0, 1);
  else if (k === "pagedown") mover(0, 0, -1);
  else h = false;
  if (h) e.preventDefault();
});
const bm = (id, fn) => (document.getElementById(id).onclick = fn);
bm("mqi", () => rotar(EY, 1));
bm("mqe", () => rotar(EY, -1));
bm("mw", () => rotar(EX, -1));
bm("ms", () => rotar(EX, 1));
bm("ma", () => rotar(EZ, 1));
bm("md", () => rotar(EZ, -1));
bm("mlej", () => mover(0, 0, 1));
bm("mcer", () => mover(0, 0, -1));
bm("mprof", () => {
  if (!man) return;
  man.prof = !man.prof;
  document.getElementById("mprof").classList.toggle("on", man.prof);
});
bm("mguia", () => {
  if (!man || !man.act) return;
  man.guia = !man.guia;
  ghosts[man.act].visible = man.guia;
  document.getElementById("mguia").classList.toggle("on", man.guia);
});
bm("mauto", () => {
  if (!man || !man.act || man.snap) return;
  man.drag = null;
  drag = null;
  if (!gal) ctl.enabled = true;
  encajar(true);
});
actualizarModo();
const FICHA = {
  psu: [
    "Entrega energía estable a todo el equipo.",
    [
      "850 W · certificación 80 PLUS Gold",
      "Ventilador de 140 mm con rejilla",
      "Cables modulares",
      "Protecciones contra sobrecarga y cortocircuito",
    ],
  ],
  mobo: [
    "Tarjeta principal que conecta todos los componentes.",
    [
      "Formato ATX · zócalo para CPU",
      "4 ranuras DIMM para RAM DDR5",
      "Ranuras PCIe x16 / x1 y M.2",
      "Conector de 24 pines y disipadores de energía (VRM)",
    ],
  ],
  cpu: [
    "Procesador: el cerebro que ejecuta las instrucciones.",
    [
      "Zócalo LGA con pads dorados",
      "Tapa metálica (IHS) que reparte el calor",
      "24 núcleos · hasta 6 GHz",
      "Requiere pasta térmica y disipador",
    ],
  ],
  aio: [
    "Refrigeración líquida todo en uno (AIO).",
    [
      "Bomba con tapa RGB sobre la CPU",
      "Dos mangueras con líquido refrigerante",
      "Radiador con aletas de aluminio",
      "3 ventiladores de 120 mm con anillo RGB",
    ],
  ],
  ram: [
    "Memoria de acceso rápido para los programas abiertos.",
    [
      "2 módulos DDR5-6000 CL30",
      "Disipador metálico",
      "Barra de luz RGB direccionable",
      "Se instala en ranuras con pestañas laterales",
    ],
  ],
  ssd: [
    "Disco de estado sólido: guarda datos sin partes móviles.",
    [
      "NVMe M.2 PCIe Gen4 · 2 TB",
      "Lectura hasta 7000 MB/s",
      "Disipador con etiqueta",
      "Se atornilla directo a la placa madre",
    ],
  ],
  gpu: [
    "Tarjeta de video: procesa los gráficos y envía imagen al monitor.",
    [
      "Disipador de triple ventilador",
      "Iluminación RGB en el borde",
      "Conector de energía de 8 pines",
      "Soporte metálico y ranura PCIe x16",
    ],
  ],
  glass: [
    "Panel lateral de vidrio templado.",
    [
      "Deja ver los componentes internos",
      "Se fija con tornillos al case",
      "Protege del polvo y ruido",
    ],
  ],
  kb: [
    "Teclado mecánico RGB.",
    [
      "Teclas con retroiluminación RGB",
      "Conexión USB por cable",
      "Base de aluminio",
    ],
  ],
  mouse: [
    "Mouse gamer ergonómico RGB.",
    [
      "Sensor óptico de alta precisión",
      "Rueda con luz RGB y botones laterales",
      "Conexión USB por cable",
    ],
  ],
  spk: [
    "Par de parlantes estéreo para el audio del equipo.",
    [
      "Parlante izquierdo y derecho",
      "Se ubican a ambos lados del monitor",
      "Conexión por audio de 3,5 mm o USB",
      "Reproducen el sonido del sistema",
    ],
  ],
  mon: [
    "Monitor de pantalla plana con luz ambiental RGB.",
    [
      'Panel de 27" · bordes mínimos',
      "Luz RGB trasera (ambilight)",
      "Entrada de video DisplayPort / HDMI",
      "Base metálica estable",
    ],
  ],
};

const FUNCION = {
  psu: "Convierte la corriente de la pared en la electricidad que necesita cada componente y la reparte por cables. Sin ella, la computadora no enciende.",
  mobo: "Es la placa donde se conectan todas las piezas y la que permite que se comuniquen entre sí.",
  cpu: "Es el cerebro de la computadora: ejecuta las instrucciones de los programas y hace todos los cálculos.",
  aio: "Enfría el procesador: un líquido absorbe su calor y lo lleva al radiador, donde los ventiladores lo sacan del equipo.",
  ram: "Es la memoria de trabajo: guarda temporalmente los datos de los programas abiertos para que el procesador los use rápido. Se borra al apagar.",
  ssd: "Guarda de forma permanente el sistema operativo, los programas y tus archivos, y los entrega muy rápido.",
  gpu: "Procesa las imágenes, los videos y los juegos, y envía la señal de imagen al monitor.",
  glass:
    "Cierra la torre, protege los componentes del polvo y deja ver el interior.",
  kb: "Sirve para escribir y dar órdenes a la computadora.",
  mouse:
    "Mueve el cursor y permite señalar, seleccionar y abrir cosas en la pantalla.",
  mon: "Muestra la imagen que genera la tarjeta de video: es la salida visual del equipo.",
  spk: "Reproducen el sonido de la computadora: música, videos, juegos y avisos.",
};
const CAPAS = {
  psu: [
    [
      "Cables modulares",
      "Llevan la electricidad desde la fuente hasta la placa madre, la tarjeta de video y los demás componentes.",
    ],
    [
      "Carcasa y circuitos",
      "Protege los circuitos que convierten la corriente de la pared en corriente de bajo voltaje. Su ventilador la mantiene fría.",
    ],
    [
      "Placa de identificación",
      "Etiqueta con la potencia y las certificaciones de la fuente.",
    ],
    [
      "Panel de conexión",
      "Zona donde se enchufa el cable de corriente y se enciende o apaga la fuente.",
    ],
    ["Logotipo", "Detalle decorativo de la marca."],
    ["Emblema", "Adorno estético; no cumple función eléctrica."],
  ],
  mobo: [
    [
      "Pines y conectores",
      "Puntos donde se enchufan los cables del panel frontal y los ventiladores.",
    ],
    [
      "Soportes y tornillos",
      "Sujetan la placa al case y evitan que toque el metal.",
    ],
    ["Detalle pequeño", "Pieza menor de la placa (conector o soporte)."],
    [
      "Placa principal (PCB)",
      "Circuito impreso con las ranuras de RAM y PCIe, el zócalo del procesador y el espacio M.2. Conecta y comunica todas las piezas.",
    ],
    [
      "Panel de puertos traseros",
      "Entradas de USB, red y audio hacia el exterior del equipo.",
    ],
    ["Detalle pequeño", "Pieza menor de la placa (terminal o soporte)."],
  ],
  aio: [
    [
      "Bomba y bloque frío",
      "Se apoya sobre el procesador, absorbe su calor y hace circular el líquido hacia el radiador.",
    ],
    ["Soporte de montaje", "Sujeta la bomba al zócalo del procesador."],
    [
      "Conector de mangueras",
      "Une la bomba con las mangueras por donde circula el líquido.",
    ],
    [
      "Ventilador RGB",
      "Empuja aire a través del radiador para enfriar el líquido. El anillo de luz es decorativo.",
    ],
    [
      "Ventilador RGB",
      "Segundo ventilador: ayuda a sacar el calor del radiador.",
    ],
    [
      "Radiador",
      "Cede al aire el calor del líquido; sus aletas aumentan la superficie de enfriamiento.",
    ],
  ],
  ram: [
    [
      "Disipadores",
      "Láminas metálicas que absorben el calor de los chips de memoria.",
    ],
    [
      "Placas y chips de memoria",
      "Circuitos donde se guardan temporalmente los datos de los programas abiertos.",
    ],
    [
      "Cubierta del módulo",
      "Tapa metálica que protege los chips y lleva la etiqueta del modelo.",
    ],
    ["Barra de luz RGB", "Iluminación decorativa de los módulos."],
  ],
  gpu: [
    [
      "Placa trasera (backplate)",
      "Refuerza la tarjeta para que no se doble y ayuda a disipar calor.",
    ],
    [
      "Carcasa y disipador",
      "Cubre el chip gráfico y la memoria, y guía el aire de los ventiladores sobre los tubos de calor.",
    ],
    [
      "Ventiladores",
      "Mueven aire para enfriar el chip gráfico cuando trabaja fuerte.",
    ],
    ["Barra de iluminación RGB", "Luz decorativa en el borde de la tarjeta."],
    ["Franja luminosa", "Detalle decorativo con luz."],
    [
      "Soporte metálico",
      "Fija la tarjeta al case y deja a la vista sus puertos de video.",
    ],
  ],
  kb: [
    [
      "Base y teclas",
      "La base sostiene el circuito; cada tecla activa un interruptor que envía la letra u orden a la computadora.",
    ],
    [
      "Teclas",
      "Cada tecla presiona un interruptor que envía su letra o función a la computadora.",
    ],
    [
      "Teclas",
      "Cada tecla presiona un interruptor que envía su letra o función a la computadora.",
    ],
    [
      "Teclas",
      "Cada tecla presiona un interruptor que envía su letra o función a la computadora.",
    ],
  ],
  mouse: [
    [
      "Cuerpo principal",
      "Es la estructura superior del mouse y contiene la zona de apoyo de la mano.",
    ],
    [
      "Detalles, botones y rueda",
      "Incluye los botones, la rueda y los elementos decorativos RGB.",
    ],
    [
      "Base inferior",
      "Es la parte que se apoya sobre la mesa e integra el sensor óptico.",
    ],
  ],
  mon: [
    [
      "Pedestal y soporte",
      "Sostienen la pantalla a la altura adecuada y le dan estabilidad.",
    ],
    ["Pieza de unión", "Conecta la pantalla con el soporte."],
    [
      "Carcasa trasera",
      "Protege la electrónica interna y aloja los conectores de video y energía.",
    ],
    ["Panel de pantalla", "Muestra la imagen que envía la tarjeta de video."],
    ["Base de apoyo", "Apoya el monitor en la mesa."],
  ],
  spk: [
    [
      "Cajas de los parlantes",
      "Contienen los altavoces que convierten la señal eléctrica en sonido.",
    ],
    [
      "Perillas y detalles",
      "Controles y adornos del parlante, como el volumen.",
    ],
  ],
  glass: [
    [
      "Panel de vidrio templado",
      "Cierra la torre, protege del polvo y deja ver los componentes.",
    ],
  ],
  cpu: [
    [
      "Sustrato (placa verde)",
      "Base sobre la que está el chip de silicio y sus conexiones eléctricas.",
    ],
    [
      "Contactos dorados (LGA)",
      "Tocan los pines del zócalo y llevan las señales hacia la placa madre.",
    ],
    [
      "Condensadores SMD",
      "Pequeños componentes que estabilizan la energía del procesador.",
    ],
    ["Triángulo guía", "Marca la orientación correcta para instalarlo."],
    [
      "Tapa metálica (IHS)",
      "Protege el chip y reparte el calor hacia la bomba o el disipador.",
    ],
    [
      "Tapa metálica (IHS)",
      "Protege el chip y reparte el calor hacia la bomba o el disipador.",
    ],
    [
      "Tapa metálica (IHS)",
      "Protege el chip y reparte el calor hacia la bomba o el disipador.",
    ],
    ["Etiqueta", "Indica el modelo del procesador."],
  ],
  ssd: [
    ["Placa del SSD", "Circuito donde se montan los chips de almacenamiento."],
    [
      "Contactos dorados",
      "Se insertan en la ranura M.2 y transmiten los datos.",
    ],
    [
      "Chip de memoria NAND",
      "Guarda tus archivos de forma permanente, incluso sin electricidad.",
    ],
    [
      "Chip de memoria NAND",
      "Guarda tus archivos de forma permanente, incluso sin electricidad.",
    ],
    [
      "Controlador",
      "Organiza dónde se guarda cada dato y gestiona la lectura y escritura.",
    ],
    ["Almohadilla térmica", "Pasa el calor de los chips al disipador."],
    ["Base del disipador", "Cubre los chips y los mantiene fríos."],
    ["Aletas del disipador", "Aumentan la superficie para liberar el calor."],
    ["Tornillo", "Fija el SSD a la placa madre."],
    ["Etiqueta", "Indica el modelo y la capacidad."],
    ["Luz RGB", "Detalle decorativo luminoso."],
  ],
};
const GS = new THREE.Scene();
GS.background = new THREE.Color(0x05070d);
GS.environment = S.environment;
configurarIluminacionGaleria(GS);
GS.add(
  at(
    new THREE.Mesh(
      new THREE.CylinderGeometry(5.2, 5.5, 0.3, 64),
      M(0x0b0d12, { roughness: 0.15, metalness: 0.9 }),
    ),
    0,
    -3.45,
    0,
  ),
  at(
    new THREE.Mesh(
      new THREE.TorusGeometry(5.3, 0.05, 8, 96).rotateX(Math.PI / 2),
      rgb(),
    ),
    0,
    -3.28,
    0,
  ),
);
const gcam = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
gcam.position.set(3, 2.5, 13);
const gctl = new THREE.OrbitControls(gcam, cv);
gctl.enabled = false;
gctl.enableDamping = true;
gctl.minDistance = 4;
gctl.maxDistance = 24;
gctl.autoRotate = true;
gctl.autoRotateSpeed = 2;
let gal = false,
  gobj = null,
  gspin = [],
  gexp = 0,
  gexpT = 0,
  gwire = false;
const gp = document.createElement("div");
gp.id = "panel";
gp.style.display = "none";
gp.innerHTML =
  '<h1>GALERÍA DE PIEZAS</h1><div id="bar"><button id="gv">◀ Volver</button><button id="gr">Girar ⏯</button><button id="ge">Explotar</button></div><div id="gl"></div>';
document.body.appendChild(gp);
const gl = gp.querySelector("#gl"),
  nom = (id) => PASOS.find((q) => q.p[0] === id).n;
Object.keys(FICHA).forEach((id) => {
  const d = document.createElement("div");
  d.className = "paso";
  d.textContent = nom(id);
  d.onclick = () => showPart(id);
  d.dataset.id = id;
  gl.appendChild(d);
});
function showPart(id) {
  limpiarHover();
  if (gobj) GS.remove(gobj);
  gspin = [];
  gexp = gexpT = 0;
  const src = P[id],
    c = src.clone(true);
  c.position.set(0, 0, 0);
  c.rotation.set(0, 0, 0);
  const A = [],
    B = [];
  src.traverse((o) => A.push(o));
  c.traverse((o) => {
    B.push(o);
    o.visible = true;
    if (o.isMesh && !o.material.isMeshBasicMaterial) {
      o.material = o.material.clone();
      o.material.wireframe = gwire;
      o.userData.cl = 1;
    }
  });
  A.forEach((o, i) => {
    if (spin.includes(o)) gspin.push(B[i]);
  });
  c.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(c),
    ct = bb.getCenter(new THREE.Vector3()),
    sz = bb.getSize(new THREE.Vector3());
  c.position.sub(ct);
  c.children.forEach((k) => (k.userData.p0 = k.position.clone()));
  gobj = new THREE.Group();
  gobj.add(c);
  gobj.scale.setScalar(6.4 / Math.max(sz.x, sz.y, sz.z));
  gobj.userData.ax = src.userData.ax || "z";
  gobj.userData.id = id;
  gobj.rotation.y = -0.45;
  gobj.rotation.x = src.userData.rx || 0;
  GS.add(gobj);
  gl.childNodes.forEach(
    (d) => (d.className = "paso" + (d.dataset.id === id ? " act" : "")),
  );
  const f = FICHA[id];
  info.innerHTML =
    "<b>" +
    nom(id) +
    '</b><div style="margin:8px 0 2px;color:#ff737b;font-weight:700">¿Para qué sirve?</div>' +
    FUNCION[id] +
    '<div style="margin-top:8px"><b style="font-size:13px">Cómo se instala</b><br>' +
    PASOS.find((q) => q.p[0] === id).t +
    "</div>" +
    '<details style="margin-top:8px;color:#8aa0c8"><summary style="cursor:pointer">Datos técnicos</summary><ul style="margin:4px 0 0 18px">' +
    f[1].map((t) => "<li>" + t + "</li>").join("") +
    "</ul></details>" +
    (id === "glass"
      ? ""
      : '<div style="margin-top:8px;color:#ff737b;font-size:12px">💡 Pulsa «Explotar» y pasa el cursor (o toca con el dedo) sobre cada parte para saber qué es.</div>');
}
function galeria(on) {
  ocultarInfoComponente();
  limpiarHover();
  gal = on;
  comp.passes[0].scene = on ? GS : S;
  comp.passes[0].camera = on ? gcam : cam;
  ctl.enabled = !on;
  gctl.enabled = on;
  document.getElementById("panel").style.display = on ? "none" : "";
  mano.style.display = on ? "none" : man ? "block" : "none";
  gp.style.display = on ? "" : "none";
  if (on) {
    stopAuto();
    showPart(Object.keys(FICHA)[0]);
  } else
    info.innerHTML =
      "<b>Simulador de ensamblaje</b><br>Pulsa «Siguiente» o «Auto» para continuar.";
}
gp.querySelector("#gv").onclick = () => galeria(false);
gp.querySelector("#gr").onclick = () => (gctl.autoRotate = !gctl.autoRotate);
gp.querySelector("#ge").onclick = () => (gexpT = gexpT ? 0 : 1);
document.getElementById("gbtn").onclick = () => galeria(true);
addEventListener("keydown", (e) => {
  if (e.key === "Escape" && gal) galeria(false);
});
const tip = document.getElementById("tip");
let hovK = null,
  hovT = 0;
function resaltar(k, on) {
  k.traverse((o) => {
    if (!(o.isMesh && o.material && o.material.emissive)) return;
    if (on) {
      o.userData.e0 = o.material.emissive.getHex();
      o.userData.i0 = o.material.emissiveIntensity;
      o.material.emissive.setHex(0x1f7f9f);
      o.material.emissiveIntensity = 1;
    } else if (o.userData.e0 !== undefined) {
      o.material.emissive.setHex(o.userData.e0);
      o.material.emissiveIntensity = o.userData.i0;
      o.userData.e0 = undefined;
    }
  });
}
function limpiarHover() {
  if (hovK) resaltar(hovK, false);
  hovK = null;
  if (tip) tip.style.display = "none";
}
cv.addEventListener("pointermove", (e) => {
  if (!gal || !gobj || gexp < 0.25 || e.buttons) {
    if (hovK || (tip && tip.style.display === "block")) limpiarHover();
    return;
  }
  const t = performance.now();
  if (t - hovT < 50) return;
  hovT = t;
  const r = cv.getBoundingClientRect();
  NDC.set(
    ((e.clientX - r.left) / r.width) * 2 - 1,
    -((e.clientY - r.top) / r.height) * 2 + 1,
  );
  RC.setFromCamera(NDC, gcam);
  const c = gobj.children[0],
    kk = c.children,
    hit = RC.intersectObjects(kk, true)[0];
  if (!hit) {
    limpiarHover();
    return;
  }
  let o = hit.object;
  while (o && o.parent !== c) o = o.parent;
  const i = kk.indexOf(o),
    d = (CAPAS[gobj.userData.id] || [])[i];
  if (!d) {
    limpiarHover();
    return;
  }
  if (hovK !== o) {
    if (hovK) resaltar(hovK, false);
    hovK = o;
    resaltar(o, true);
  }
  tip.innerHTML = "<b>" + d[0] + "</b><br>" + d[1];
  tip.style.display = "block";
  tip.style.left =
    Math.min(e.clientX + 16, innerWidth - tip.offsetWidth - 10) + "px";
  tip.style.top =
    Math.min(e.clientY + 16, innerHeight - tip.offsetHeight - 10) + "px";
});
cv.addEventListener("pointerleave", limpiarHover);
function resize() {
  R.setSize(innerWidth, innerHeight);
  comp.setSize(innerWidth, innerHeight);
  cam.aspect = gcam.aspect = innerWidth / innerHeight;
  cam.fov = gcam.fov =
    cam.aspect < 1
      ? Math.min(78, 42 / Math.max(0.5, cam.aspect))
      : gcam === gcam
        ? 42
        : 42;
  cam.updateProjectionMatrix();
  gcam.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();
iniciarCicloAnimacion();
reset();
