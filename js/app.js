const PASOS = window.COMPONENTES.PASOS;

const cv = document.getElementById("c"),
  R = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
R.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.5 : 2));
const S = new THREE.Scene();
S.background = new THREE.Color(0x04060b);
S.fog = new THREE.Fog(0x04060b, 35, 80);
const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
const centroCamaraInicio = new THREE.Vector3(-9, 4.6, 0);
const direccionCamaraInicio = new THREE.Vector3(7, 3, 21).normalize();
const ctl = new THREE.OrbitControls(cam, cv);
ctl.target.copy(centroCamaraInicio);
ctl.enableDamping = true;
ctl.autoRotateSpeed = 1.2;
function ajustarCamaraInicio() {
  const fovVertical = THREE.MathUtils.degToRad(cam.fov);
  const fovHorizontal =
    2 * Math.atan(Math.tan(fovVertical / 2) * cam.aspect);
  const medioFov = Math.min(fovVertical, fovHorizontal) / 2;
  const distancia = (7.5 / Math.sin(medioFov)) * 1.08;
  cam.position
    .copy(centroCamaraInicio)
    .addScaledVector(direccionCamaraInicio, distancia);
  ctl.target.copy(centroCamaraInicio);
}
const bloom = configurarIluminacion(R, S);
bloom.strength = 0.45;
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
const lucesTorre = agregarLucesTorre(T);
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
{
  const panel = rb(
    8.4,
    9,
    0.08,
    0.2,
    new THREE.MeshPhysicalMaterial({
      color: 0xc5e3f5,
      roughness: 0.08,
      metalness: 0,
      transmission: 0.9,
      thickness: 0.08,
      ior: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    }),
  );
  panel.add(
    new THREE.LineSegments(
      new THREE.EdgesGeometry(panel.geometry),
      new THREE.LineBasicMaterial({
        color: 0x80cfff,
        transparent: true,
        opacity: 0.85,
      }),
    ),
  );
  reg("glass", panel, 0, 4.6, 2.3, [0, 6, 10]);
}

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
  c.fillText("MAG Z790 TOMAHAWK", 30, 495);
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
        c.fillText("GAMING", 6, 30);
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
P.cpu.add(
  at(lab("intel|CORE i9|14900K", 0.62, 0.62, 44, "#2a2210"), 0, 0, 0.11),
);
P.ram.children.forEach((k) => {
  const l = lab("DDR5-4800", 2.3, 0.4, 40);
  l.rotation.set(0, Math.PI / 2, Math.PI / 2);
  l.position.set(0.105, 0, 0.05);
  k.add(l);
});
P.ssd.add(
  at(lab("Samsung 990 PRO|2TB PCIe 4.0", 1.7, 0.3, 38), 0, 0.12, 0.16),
);
P.aio.children[0].add(at(lab("CORSAIR", 0.9, 0.35, 52), 0, 0, 0.33));
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
P.psu.add(at(lab("1000W|80 PLUS GOLD", 2.2, 0.8, 38), 1.5, 0, 1.93));
S.add(
  at(
    rbf(36, 14, 0.42, 0.3, M(0x171b23, { roughness: 0.65, metalness: 0.18 })),
    0,
    -0.24,
    0,
  ),
);
const tableroCanvas = document.createElement("canvas");
tableroCanvas.width = 1024;
tableroCanvas.height = 512;
const tableroContext = tableroCanvas.getContext("2d");
tableroContext.fillStyle = "#11151c";
tableroContext.fillRect(0, 0, tableroCanvas.width, tableroCanvas.height);
for (let i = 0; i < 180; i++) {
  const y = (i / 180) * tableroCanvas.height;
  tableroContext.strokeStyle = `rgba(180, 195, 215, ${0.018 + Math.random() * 0.022})`;
  tableroContext.lineWidth = 1 + Math.random() * 2;
  tableroContext.beginPath();
  tableroContext.moveTo(0, y + Math.sin(i * 0.25) * 5);
  tableroContext.bezierCurveTo(
    280,
    y + Math.cos(i * 0.31) * 7,
    690,
    y + Math.sin(i * 0.17) * 6,
    tableroCanvas.width,
    y + Math.cos(i * 0.22) * 5,
  );
  tableroContext.stroke();
}
const tableroTextura = new THREE.CanvasTexture(tableroCanvas);
tableroTextura.colorSpace = THREE.SRGBColorSpace;
tableroTextura.anisotropy = 8;
const superficieTablero = new THREE.Mesh(
  new THREE.PlaneGeometry(35.7, 13.7),
  new THREE.MeshStandardMaterial({
    map: tableroTextura,
    roughness: 0.88,
    metalness: 0.04,
    envMapIntensity: 0.35,
  }),
);
superficieTablero.rotation.x = -Math.PI / 2;
superficieTablero.position.set(0, -0.026, 0);
superficieTablero.renderOrder = 1;
S.add(superficieTablero);
const bordeTablero = M(0x343c49, { roughness: 0.42, metalness: 0.68 });
const lineaTablero = M(0x1e92a7, { roughness: 0.3, metalness: 0.45 });
S.add(
  at(new THREE.Mesh(new THREE.BoxGeometry(35.5, 0.045, 0.055), bordeTablero), 0, -0.29, 6.97),
  at(new THREE.Mesh(new THREE.BoxGeometry(35.2, 0.018, 0.025), lineaTablero), 0, -0.25, 7.01),
);
const pataTablero = M(0x202630, { roughness: 0.38, metalness: 0.72 });
const pieTablero = M(0x11151c, { roughness: 0.55, metalness: 0.48 });
[-16.2, 16.2].forEach((x) => {
  [-5.7, 5.7].forEach((z) => {
    S.add(
      at(new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.35, 0.3), pataTablero), x, -2.62, z),
      at(new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.48), pieTablero), x, -4.85, z),
    );
  });
});
S.add(
  at(new THREE.Mesh(new THREE.BoxGeometry(32.5, 0.22, 0.22), pataTablero), 0, -0.68, -5.7),
  at(new THREE.Mesh(new THREE.BoxGeometry(32.5, 0.22, 0.22), pataTablero), 0, -0.68, 5.7),
  at(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 11.4), pataTablero), -16.2, -0.68, 0),
  at(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 11.4), pataTablero), 16.2, -0.68, 0),
);
S.add(
  at(
    new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x05070d }),
    ),
    0,
    -4.92,
    0,
  ),
);
const sombraCanvas = document.createElement("canvas");
sombraCanvas.width = sombraCanvas.height = 128;
const sombraContext = sombraCanvas.getContext("2d");
const gradienteSombra = sombraContext.createRadialGradient(64, 64, 8, 64, 64, 64);
gradienteSombra.addColorStop(0, "rgba(0, 0, 0, 0.38)");
gradienteSombra.addColorStop(0.55, "rgba(0, 0, 0, 0.2)");
gradienteSombra.addColorStop(1, "rgba(0, 0, 0, 0)");
sombraContext.fillStyle = gradienteSombra;
sombraContext.fillRect(0, 0, 128, 128);
const texturaSombra = new THREE.CanvasTexture(sombraCanvas);
const agregarSombraContacto = (x, z, ancho, fondo, opacidad = 1) => {
  const sombra = new THREE.Mesh(
    new THREE.PlaneGeometry(ancho, fondo),
    new THREE.MeshBasicMaterial({
      map: texturaSombra,
      transparent: true,
      opacity: opacidad,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.set(x, -0.022, z);
  sombra.renderOrder = 1;
  S.add(sombra);
};
agregarSombraContacto(-9, 0, 10, 6, 0.85);
agregarSombraContacto(0.5, 4.1, 8, 3.4, 0.75);
agregarSombraContacto(7.2, 4.1, 2.8, 2.5, 0.8);
agregarSombraContacto(2, -3.4, 5.2, 2.8, 0.7);
const barraRGB = new THREE.Group();
const materialBarra = M(0x171c26, { roughness: 0.3, metalness: 0.75 });
const baseBarra = new THREE.Mesh(
  new THREE.CylinderGeometry(0.5, 0.58, 0.16, 40),
  materialBarra,
);
baseBarra.position.y = 0.08;
barraRGB.add(baseBarra);
const anilloBarra = new THREE.Mesh(
  new THREE.TorusGeometry(0.38, 0.025, 8, 40),
  rgb(0.45),
);
anilloBarra.rotation.x = Math.PI / 2;
anilloBarra.position.y = 0.17;
barraRGB.add(anilloBarra);
barraRGB.add(
  at(
    new THREE.Mesh(new THREE.BoxGeometry(0.26, 3.9, 0.22), materialBarra),
    0,
    2.12,
    0,
  ),
);
const degradadoRGB = document.createElement("canvas");
degradadoRGB.width = 32;
degradadoRGB.height = 512;
const contextoRGB = degradadoRGB.getContext("2d");
const gradienteRGB = contextoRGB.createLinearGradient(0, 0, 0, 512);
gradienteRGB.addColorStop(0, "#f42cdb");
gradienteRGB.addColorStop(0.27, "#623cff");
gradienteRGB.addColorStop(0.52, "#20d9ff");
gradienteRGB.addColorStop(0.76, "#42ff9b");
gradienteRGB.addColorStop(1, "#ffbd42");
contextoRGB.fillStyle = gradienteRGB;
contextoRGB.fillRect(0, 0, 32, 512);
const texturaRGB = new THREE.CanvasTexture(degradadoRGB);
texturaRGB.colorSpace = THREE.SRGBColorSpace;
const haloRGB = new THREE.Mesh(
  new THREE.PlaneGeometry(0.42, 3.82),
  new THREE.MeshBasicMaterial({
    map: texturaRGB,
    transparent: true,
    opacity: 0.42,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  }),
);
haloRGB.position.set(0, 2.12, 0.126);
barraRGB.add(haloRGB);
const panelRGB = new THREE.Mesh(
  new THREE.PlaneGeometry(0.2, 3.62),
  new THREE.MeshBasicMaterial({
    map: texturaRGB,
    color: 0xffffff,
    toneMapped: false,
  }),
);
panelRGB.position.set(0, 2.12, 0.14);
barraRGB.add(panelRGB);
const bordeRGB = new THREE.Mesh(
  new THREE.BoxGeometry(0.035, 3.75, 0.035),
  rgb(0.4),
);
bordeRGB.position.set(0.12, 2.12, 0.13);
barraRGB.add(bordeRGB);
const baseRGB = new THREE.Mesh(
  new THREE.BoxGeometry(0.34, 0.1, 0.3),
  materialBarra,
);
baseRGB.position.set(0, 0.22, 0);
barraRGB.add(baseRGB);
const luzBarra = new THREE.PointLight(0x5c45ff, 8, 7, 2);
luzBarra.position.set(0, 2.1, 0.45);
barraRGB.add(luzBarra);
barraRGB.position.set(11.4, 0, -3.6);
S.add(barraRGB);

const soporteAuriculares = new THREE.Group();
const materialSoporte = M(0x252c38, { roughness: 0.3, metalness: 0.78 });
const materialAuricular = M(0x171b22, { roughness: 0.32, metalness: 0.48 });
const materialAlmohadilla = M(0x090b10, { roughness: 0.92, metalness: 0.02 });
const materialRojo = M(0xd21e35, { roughness: 0.86, metalness: 0.02 });
const pieSoporte = new THREE.Mesh(
  new THREE.CylinderGeometry(0.48, 0.55, 0.14, 40),
  materialSoporte,
);
pieSoporte.position.y = 0.07;
soporteAuriculares.add(pieSoporte);
const aroSoporte = new THREE.Mesh(
  new THREE.TorusGeometry(0.34, 0.022, 8, 36),
  rgb(0.45),
);
aroSoporte.rotation.x = Math.PI / 2;
aroSoporte.position.y = 0.15;
soporteAuriculares.add(aroSoporte);
const posteSoporte = new THREE.Mesh(
  new THREE.CylinderGeometry(0.08, 0.12, 1.65, 20),
  materialSoporte,
);
posteSoporte.position.set(0, 0.98, -0.1);
soporteAuriculares.add(posteSoporte);
const ganchoAuricular = new THREE.Mesh(
  new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.78, -0.1),
      new THREE.Vector3(0, 1.98, -0.1),
      new THREE.Vector3(0, 2.08, 0.02),
      new THREE.Vector3(0, 2.08, 0.2),
      new THREE.Vector3(0, 1.98, 0.28),
    ]),
    24,
    0.075,
    10,
    false,
  ),
  materialSoporte,
);
soporteAuriculares.add(ganchoAuricular);
const auriculares = new THREE.Group();
auriculares.position.set(0, 1.72, 0.25);
auriculares.rotation.y = 0;
const geometriaAuriculares = new THREE.Group();
geometriaAuriculares.position.set(0, -1.72, -0.25);
auriculares.add(geometriaAuriculares);
const curvaArco = (z, puntos = [
  [-0.58, 1.45],
  [-0.72, 2.12],
  [-0.52, 2.63],
  [0, 2.82],
  [0.52, 2.63],
  [0.72, 2.12],
  [0.58, 1.45],
]) =>
  new THREE.CatmullRomCurve3(
    puntos.map(([x, y]) => new THREE.Vector3(x, y, z)),
  );
geometriaAuriculares.add(
  new THREE.Mesh(
    new THREE.TubeGeometry(curvaArco(0.26), 56, 0.15, 16, false),
    materialAuricular,
  ),
  new THREE.Mesh(
    new THREE.TubeGeometry(
      curvaArco(
        0.33,
        [
          [-0.53, 1.62],
          [-0.63, 2.12],
          [-0.45, 2.52],
          [0, 2.68],
          [0.45, 2.52],
          [0.63, 2.12],
          [0.53, 1.62],
        ],
      ),
      48,
      0.085,
      12,
      false,
    ),
    materialRojo,
  ),
);
[-1, 1].forEach((lado) => {
  const copa = new THREE.Group();
  const carcasa = rb(0.76, 0.98, 0.3, 0.23, materialAuricular);
  const almohadilla = rb(0.64, 0.85, 0.17, 0.27, materialAlmohadilla);
  almohadilla.position.z = 0.13;
  const placaCopa = rb(
    0.58,
    0.74,
    0.055,
    0.2,
    M(0x202630, { roughness: 0.38, metalness: 0.58 }),
  );
  placaCopa.position.z = 0.19;
  const aroCopa = new THREE.Mesh(
    new THREE.TorusGeometry(0.31, 0.035, 10, 48),
    materialAuricular,
  );
  aroCopa.scale.set(0.82, 1.16, 1);
  aroCopa.position.z = 0.29;
  aroCopa.material = rgb(lado > 0 ? 0.12 : 0.62);
  const detalleCopa = new THREE.Mesh(
    new THREE.CircleGeometry(0.075, 24),
    M(0xb8c0cc, { roughness: 0.3, metalness: 0.7 }),
  );
  detalleCopa.position.z = 0.287;
  copa.add(carcasa, almohadilla, placaCopa, aroCopa, detalleCopa);
  copa.position.set(lado * 0.6, 1.42, 0.23);
  copa.rotation.y = lado * (Math.PI / 2);
  geometriaAuriculares.add(copa);
});
const cableMicrofono = new THREE.Mesh(
  new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.68, 1.3, 0.4),
      new THREE.Vector3(-0.79, 1.08, 0.48),
      new THREE.Vector3(-1.02, 0.99, 0.56),
      new THREE.Vector3(-1.22, 1.07, 0.6),
      new THREE.Vector3(-1.3, 1.2, 0.6),
    ]),
    24,
    0.035,
    8,
    false,
  ),
  materialAuricular,
);
geometriaAuriculares.add(cableMicrofono);
const microfono = new THREE.Mesh(
  new THREE.SphereGeometry(0.14, 20, 14),
  materialAlmohadilla,
);
microfono.scale.set(1.2, 0.8, 1);
microfono.position.set(-1.3, 1.2, 0.6);
geometriaAuriculares.add(microfono);
const cableAuricular = new THREE.Mesh(
  new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.62, 1.18, 0.28),
      new THREE.Vector3(0.82, 0.86, 0.32),
      new THREE.Vector3(0.94, 0.52, 0.38),
      new THREE.Vector3(0.9, 0.12, 0.42),
    ]),
    24,
    0.025,
    8,
    false,
  ),
  materialAuricular,
);
geometriaAuriculares.add(cableAuricular);
soporteAuriculares.add(auriculares);
soporteAuriculares.position.set(8.7, 0, -3.3);
S.add(soporteAuriculares);
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
const imagenFacultad = new Image();
imagenFacultad.onload = () => {
  const escala = Math.max(
      sc.width / imagenFacultad.naturalWidth,
      sc.height / imagenFacultad.naturalHeight,
    ),
    ancho = sc.width / escala,
    alto = sc.height / escala;
  x.drawImage(
    imagenFacultad,
    (imagenFacultad.naturalWidth - ancho) / 2,
    (imagenFacultad.naturalHeight - alto) / 2,
    ancho,
    alto,
    0,
    0,
    sc.width,
    sc.height,
  );
  const sombra = x.createLinearGradient(0, 0, 0, sc.height);
  sombra.addColorStop(0, "rgba(5, 7, 13, 0.2)");
  sombra.addColorStop(1, "rgba(5, 7, 13, 0.58)");
  x.fillStyle = sombra;
  x.fillRect(0, 0, sc.width, sc.height);
  x.fillStyle = "#fff";
  x.textAlign = "center";
  x.font = "bold 48px Segoe UI";
  x.fillText("UNIVERSIDAD NACIONAL DE CAÑETE", 640, 320);
  x.font = "26px Segoe UI";
  x.fillStyle = "#f2f3f6";
  x.fillText("Simulador Virtual de Ensamblaje · Equipo 02", 640, 375);
  x.fillStyle = "rgba(8, 12, 24, 0.82)";
  x.fillRect(0, 672, 1280, 48);
  x.fillStyle = "#fff";
  x.font = "20px Segoe UI";
  x.textAlign = "left";
  x.fillText("●  UNDC   |   Windows", 20, 704);
  scrM.map.needsUpdate = true;
};
imagenFacultad.onerror = () => {
  console.error(
    "No se pudo decodificar la imagen de fondo embebida del monitor.",
  );
};
imagenFacultad.src = window.FACULTAD_IMAGE_DATA;
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
const lista = document.getElementById("lista"),
  info = document.getElementById("info");
let tw = [],
  cur = -1,
  fPrev = "";
function ocultarInfoComponente() {
  document.getElementById("detalle-contenido").hidden = true;
}
PASOS.forEach((p, i) => {
  if (p.f !== fPrev) {
    lista.insertAdjacentHTML(
      "beforeend",
      `<div class="fase" role="heading" aria-level="2">${p.f}</div>`,
    );
    fPrev = p.f;
  }
  const d = document.createElement("div");
  d.className = "paso";
  d.textContent = i + 1 + ". " + p.n;
  d.setAttribute("role", "listitem");
  d.tabIndex = 0;
  d.onclick = () => {
    stopAuto();
    goTo(i);
  };
  d.onkeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      d.click();
    }
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
const verificaciones = new Set();
function actualizarEstadoRevision() {
  const indiceRevision = PASOS.findIndex((p) => p.checklist);
  if (cur !== indiceRevision) return;
  const completo = PASOS[indiceRevision].checklist.every((_, i) =>
    verificaciones.has(i),
  );
  btnNext.disabled = !completo;
  const estado = document.getElementById("revision-estado");
  if (estado)
    estado.textContent = completo
      ? "Revisión completa. Ya puedes avanzar al encendido."
      : "Marca todas las comprobaciones para habilitar «Siguiente».";
}
function mostrarListaRevision(p) {
  if (!p.checklist) return;
  const lista = document.createElement("fieldset");
  lista.className = "lista-revision";
  const titulo = document.createElement("legend");
  titulo.textContent = "Lista de comprobación";
  lista.appendChild(titulo);
  p.checklist.forEach((texto, i) => {
    const etiqueta = document.createElement("label");
    const casilla = document.createElement("input");
    casilla.type = "checkbox";
    casilla.checked = verificaciones.has(i);
    casilla.addEventListener("change", () => {
      if (casilla.checked) verificaciones.add(i);
      else verificaciones.delete(i);
      actualizarEstadoRevision();
    });
    etiqueta.append(casilla, document.createTextNode(texto));
    lista.appendChild(etiqueta);
  });
  const estado = document.createElement("div");
  estado.id = "revision-estado";
  estado.setAttribute("role", "status");
  estado.setAttribute("aria-live", "polite");
  lista.appendChild(estado);
  info.appendChild(lista);
  actualizarEstadoRevision();
}
function paso(inst, forzarAuto) {
  if (cur >= PASOS.length - 1) return;
  const pasoActual = PASOS[cur];
  if (
    !inst &&
    pasoActual?.checklist &&
    !pasoActual.checklist.every((_, i) => verificaciones.has(i))
  ) {
    stopAuto();
    actualizarEstadoRevision();
    return;
  }
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
        add(
          1.2,
          (k) => {
            o.position.lerpVectors(a, b, easeB(k));
            if (k >= 1 && (id === "kb" || id === "mouse"))
              window.actualizarCablePeriferico?.(id, true);
          },
          j * 0.15,
        );
    }
    if (inst && (id === "kb" || id === "mouse"))
      window.actualizarCablePeriferico?.(id, true);
  });
  if (manual) iniciarManual(p, cb, tb);
  if (p.p.includes("mon")) {
    if (inst) scrM.color.setScalar(1);
    else add(0.8, (k) => scrM.color.setScalar(k), 2.8);
  }
  if (p.end) {
    endOn = 1;
    ctl.autoRotate = true;
  }
  actualizarLucesTorre();
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
  const producto = p.p.length ? PRODUCTOS[p.p[0]] : null;
  const indiceRevision = PASOS.findIndex((paso) => paso.checklist);
  const revisionCompleta =
    indiceRevision >= 0 &&
    PASOS[indiceRevision].checklist.every((_, i) => verificaciones.has(i));
  const textoPaso =
    p.end && !revisionCompleta
      ? "<b>¡Vista final del equipo!</b> Puedes omitir la lista para ver el resultado. Para un ensamblaje real, completa la revisión antes de conectar la corriente."
      : p.t;
  info.classList.toggle(
    "periferico",
    p.p.includes("kb") || p.p.includes("mouse"),
  );
  info.innerHTML =
    `<b>${p.n}</b>` +
    (producto
      ? `<div class="modelo-referencia">Modelo propuesto: <a href="${producto.fuente}" target="_blank" rel="noopener noreferrer">${producto.nombre}</a></div><div class="modelo-nota">${AVISO_MODELO}</div>`
      : "") +
    `<br>${textoPaso}` +
    (manual
      ? '<div class="manual-step-hint mode-reveal manual-only" style="margin-top:8px;color:#ff737b">✋ Arrastra la pieza hasta la guía y gírala para que encaje.</div>'
      : "");
  if (p.p.includes("kb") && window.cargarModeloTeclado)
    window.cargarModeloTeclado();
  btnNext.disabled = false;
  mostrarListaRevision(p);
  btnPrev.disabled = false;
}
let endOn = 0,
  autoT = 0;
function actualizarLucesTorre() {
  const encendidas = rgbOn && cur >= 3;
  lucesTorre.forEach((luz) => {
    luz.visible = encendidas;
  });
}
function reset(limpiarRevision = true) {
  ocultarInfoComponente();
  cerrarManual();
  tw = [];
  cur = -1;
  endOn = 0;
  if (limpiarRevision) verificaciones.clear();
  btnNext.disabled = false;
  actualizarLucesTorre();
  ctl.autoRotate = false;
  Object.values(P).forEach((o) => {
    o.visible = false;
    o.quaternion.identity();
  });
  window.ocultarCablesPerifericos?.();
  info.classList.remove("periferico");
  scrM.color.setScalar(0);
  PASOS.forEach((q) => {
    q.el.className = "paso";
    q.el.removeAttribute("aria-current");
  });
  ajustarCamaraInicio();
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
  reset(false);
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
  const indiceRevision = PASOS.findIndex((p) => p.checklist);
  const indiceFinal = PASOS.findIndex((p) => p.end);
  if (i === indiceFinal && i > cur) {
    while (cur < i - 1) paso(true);
    paso(true);
    return;
  }
  if (
    indiceRevision > cur &&
    indiceRevision <= i &&
    !PASOS[indiceRevision].checklist.every((_, j) => verificaciones.has(j))
  ) {
    while (cur < indiceRevision) paso(true);
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
const btnNext = document.getElementById("sig");
btnPrev.disabled = true;
btnNext.onclick = () => {
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
  actualizarLucesTorre();
  panelRGB.visible = rgbOn;
  haloRGB.visible = rgbOn;
  luzBarra.visible = rgbOn;
  bloom.strength = rgbOn ? 0.45 : 0;
  e.currentTarget.textContent = rgbOn ? "RGB: ENCENDIDO" : "RGB: APAGADO";
  e.currentTarget.classList.toggle("on", rgbOn);
  e.currentTarget.setAttribute("aria-pressed", String(rgbOn));
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
  b.setAttribute("aria-pressed", String(modoManual));
  const panelInfo = document.getElementById("detalle-pieza");
  panelInfo.classList.toggle("modo-manual", modoManual);
  panelInfo.classList.toggle("pieza-activa", Boolean(man && man.act));
}
let modoManual = false,
  man = null;
const ST = {},
  ghosts = {},
  manosVR = {};
const GM = new THREE.MeshBasicMaterial({
  color: 0xff4466,
  transparent: true,
  opacity: 0.26,
  depthWrite: false,
  depthTest: false,
  side: THREE.DoubleSide,
});
const MATERIAL_MANOS = new THREE.MeshPhysicalMaterial({
  color: 0x33cfff,
  transparent: true,
  opacity: 0.34,
  flatShading: true,
  roughness: 0.24,
  metalness: 0.12,
  emissive: 0x078dff,
  emissiveIntensity: 0.28,
  depthWrite: false,
  side: THREE.DoubleSide,
  clearcoat: 0.65,
  clearcoatRoughness: 0.2,
});
const MATERIAL_TRAMA_MANOS = new THREE.MeshBasicMaterial({
  color: 0x8af4ff,
  transparent: true,
  opacity: 0.82,
  wireframe: true,
  depthWrite: false,
  depthTest: false,
});
const MATERIAL_NODOS_MANOS = new THREE.MeshBasicMaterial({
  color: 0xc5fbff,
  transparent: true,
  opacity: 0.92,
  depthWrite: false,
});
let pulsoManos = 0;
const mano = document.getElementById("mano"),
  mst = document.getElementById("mst"),
  mnom = document.getElementById("mnom"),
  mhelp = document.getElementById("mhelp");
const panelInfo = document.getElementById("detalle-pieza"),
  botonPanelInfo = document.getElementById("detalle-toggle");
botonPanelInfo.addEventListener("click", () => {
  const retraido = panelInfo.classList.toggle("collapsed");
  botonPanelInfo.setAttribute("aria-expanded", String(!retraido));
  botonPanelInfo.setAttribute(
    "aria-label",
    retraido ? "Expandir panel de información" : "Contraer panel de información",
  );
  botonPanelInfo.title = retraido ? "Expandir panel" : "Contraer panel";
  botonPanelInfo.textContent = retraido ? "⌃" : "⌄";
});
const V3 = (...a) => new THREE.Vector3(...a),
  QI = new THREE.Quaternion(),
  DEG = Math.PI / 180,
  PASO_ROT = 15 * DEG;
const coloresEje = [
    0xff5b65,
    0xff5b65,
    0x50e890,
    0x50e890,
    0x63a7ff,
    0x63a7ff,
  ],
  guiaEjes = new THREE.Group(),
  flechasEje = coloresEje.map((color) => {
    const flecha = new THREE.ArrowHelper(
      V3(1, 0, 0),
      V3(),
      1,
      color,
      0.2,
      0.12,
    );
    flecha.traverse((objeto) => {
      objeto.renderOrder = 100;
      if (objeto.material) objeto.material.depthTest = false;
    });
    guiaEjes.add(flecha);
    return flecha;
  });
guiaEjes.visible = false;
S.add(guiaEjes);
function actualizarGuiaEjes(id) {
  const s = ST[id];
  if (!s || !guiaEjes.visible || !man || man.act !== id) return;
  s.par.updateMatrixWorld(true);
  guiaEjes.position.copy(s.par.localToWorld(s.pc.clone()));
}
function mostrarGuiaEjes(id) {
  const s = ST[id];
  if (!s) return;
  const frente = cam.getWorldDirection(V3()).normalize(),
    derecha = new THREE.Vector3().crossVectors(frente, V3(0, 1, 0)).normalize(),
    arriba = new THREE.Vector3().crossVectors(derecha, frente).normalize(),
    direcciones = [
      derecha,
      derecha.clone().negate(),
      arriba,
      arriba.clone().negate(),
      frente,
      frente.clone().negate(),
    ],
    radio = Math.max(0.3, s.dim * 0.18),
    longitud = Math.max(0.45, s.dim * 0.22),
    cabeza = Math.min(0.3, longitud * 0.3);
  flechasEje.forEach((flecha, i) => {
    const direccion = direcciones[i];
    flecha.setDirection(direccion);
    flecha.position.copy(direccion).multiplyScalar(radio);
    flecha.setLength(longitud, cabeza, cabeza * 0.65);
  });
  guiaEjes.visible = true;
  actualizarGuiaEjes(id);
}
function actualizarVisibilidadGuia(id) {
  const visible = Boolean(man && man.act === id && man.guia && !man.snap);
  if (ghosts[id]) ghosts[id].visible = visible;
  if (manosVR[id]) {
    if (visible && !manosVR[id].visible) manosVR[id].userData.init = false;
    manosVR[id].visible = visible;
  }
  guiaEjes.visible = visible;
  if (visible) {
    actualizarManosVR(id, true);
    mostrarGuiaEjes(id);
  }
}
ctl.addEventListener("change", () => {
  if (man && man.act && guiaEjes.visible) {
    actualizarManosVR(man.act, true);
    mostrarGuiaEjes(man.act);
  }
});
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
/* ---------- MANOS HOLOGRÁFICAS ----------
   Mano articulada (palma + 4 dedos de 3 falanges + pulgar + antebrazo).
   Sistema local de la mano: +Y = dedos, +X = palma (hacia la pieza), +Z = pulgar. */
const MANO_PALMA_Y = 0.26;
function crearManoVR() {
  const mano = new THREE.Group(),
    inclina = new THREE.Group(),
    modelo = new THREE.Group();
  modelo.position.set(0, -MANO_PALMA_Y, 0);
  inclina.add(modelo);
  mano.add(inclina);
  const malla = (geo, padre) => {
    const base = new THREE.Mesh(geo, MATERIAL_MANOS),
      trama = new THREE.Mesh(geo, MATERIAL_TRAMA_MANOS);
    trama.renderOrder = 2;
    padre.add(base, trama);
    return base;
  };
  const nodo = (padre, p, r) => {
    const n = new THREE.Mesh(
      new THREE.IcosahedronGeometry(r, 0),
      MATERIAL_NODOS_MANOS,
    );
    n.position.set(...p);
    n.renderOrder = 3;
    padre.add(n);
  };

  // Palma: caja ahusada (más estrecha en la muñeca) para que parezca el dorso de una mano
  const palma = new THREE.BoxGeometry(0.17, 0.46, 0.4, 1, 2, 2),
    pp = palma.attributes.position;
  for (let i = 0; i < pp.count; i++) {
    const y = pp.getY(i) / 0.46 + 0.5;
    pp.setZ(i, pp.getZ(i) * (0.76 + 0.24 * y));
    pp.setX(i, pp.getX(i) * (1.12 - 0.3 * y));
  }
  palma.translate(0, 0.23, 0);
  malla(palma, modelo);
  const talon = new THREE.IcosahedronGeometry(0.1, 0);
  talon.scale(0.9, 1.1, 1);
  talon.translate(0.05, 0.12, 0.15);
  malla(talon, modelo);

  // Antebrazo
  const brazo = new THREE.CylinderGeometry(0.15, 0.23, 1.1, 8, 3, true);
  brazo.translate(0, -0.57, 0);
  malla(brazo, modelo);
  const puño = new THREE.TorusGeometry(0.19, 0.016, 4, 12);
  puño.rotateX(Math.PI / 2);
  puño.translate(0, -0.13, 0);
  malla(puño, modelo);

  // Cadena de falanges: cada articulación es un Group que gira en Z (curvar)
  const cadena = (raiz, largos, r) => {
    const juntas = [];
    let padre = raiz;
    largos.forEach((largo, i) => {
      const j = new THREE.Group();
      if (i > 0) j.position.set(0, largos[i - 1], 0);
      const g = new THREE.CylinderGeometry(r * 0.78, r, largo, 6, 1);
      g.translate(0, largo / 2, 0);
      malla(g, j);
      nodo(j, [0, 0, 0], r * 0.72);
      padre.add(j);
      juntas.push(j);
      padre = j;
      r *= 0.8;
    });
    const punta = new THREE.Group();
    punta.position.set(0, largos[largos.length - 1], 0);
    padre.add(punta);
    nodo(punta, [0, 0, 0], r * 0.9);
    return juntas;
  };

  const defDedos = [
    { z: 0.15, y: 0.46, l: [0.21, 0.14, 0.12], r: 0.064, abre: 0.1 }, // índice
    { z: 0.05, y: 0.47, l: [0.24, 0.16, 0.13], r: 0.068, abre: 0.02 },
    { z: -0.05, y: 0.46, l: [0.22, 0.15, 0.12], r: 0.062, abre: -0.05 },
    { z: -0.14, y: 0.44, l: [0.17, 0.11, 0.1], r: 0.054, abre: -0.14 },
  ];
  mano.userData.dedos = defDedos.map((d) => {
    const raiz = new THREE.Group();
    raiz.position.set(0.0, d.y, d.z);
    raiz.rotation.x = d.abre;
    modelo.add(raiz);
    return { raiz, abre: d.abre, juntas: cadena(raiz, d.l, d.r), k: [1, 1.2, 0.8] };
  });

  const pulgarRaiz = new THREE.Group();
  pulgarRaiz.position.set(0.03, 0.1, 0.17);
  pulgarRaiz.rotation.set(0.95, 0, -0.35, "XYZ");
  modelo.add(pulgarRaiz);
  mano.userData.pulgar = {
    raiz: pulgarRaiz,
    juntas: cadena(pulgarRaiz, [0.17, 0.15, 0.12], 0.078),
    k: [0.7, 1.0, 0.8],
  };

  mano.userData.inclina = inclina;
  mano.userData.fase = Math.random() * 6.28;
  return mano;
}
function posarDedos(mano, curl, abrir, t) {
  const u = mano.userData;
  u.dedos.forEach((d, i) => {
    const onda = Math.sin(t * 1.6 + i * 0.8 + u.fase) * 0.035,
      c = Math.max(0, curl + onda);
    d.juntas.forEach((j, n) => (j.rotation.z = -c * d.k[n]));
    d.raiz.rotation.x = d.abre * (1 + abrir * 1.6);
  });
  const p = u.pulgar,
    cp = Math.max(0, curl * 0.9 + Math.sin(t * 1.3 + u.fase) * 0.03);
  p.juntas.forEach((j, n) => (j.rotation.z = -cp * p.k[n]));
}
function manosVRDe(id) {
  if (manosVR[id]) return manosVR[id];
  const o = P[id],
    holder = new THREE.Group();
  // Caja local de la pieza (se calcula una sola vez, sin las manos)
  o.updateMatrixWorld(true);
  const inv = o.matrixWorld.clone().invert(),
    caja = new THREE.Box3();
  o.traverse((m) => {
    if (!m.isMesh || !m.geometry) return;
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    if (!m.geometry.boundingBox) return;
    caja.union(
      m.geometry.boundingBox.clone().applyMatrix4(inv.clone().multiply(m.matrixWorld)),
    );
  });
  holder.add(crearManoVR(), crearManoVR());
  holder.visible = false;
  holder.userData = {
    caja,
    agarre: 0.55,
    fade: 0,
    t: 0,
    init: false,
    ultimo: null,
    vel: V3(),
    objetivo: [],
    hologramaManos: true,
  };
  o.add(holder);
  manosVR[id] = holder;
  actualizarManosVR(id, true);
  return holder;
}
// Calcula dónde deben agarrar las manos según la cámara y la orientación actual de la pieza
function actualizarManosVR(id, recalcular = false) {
  const H = manosVR[id],
    pieza = P[id];
  if (!H || !pieza || !recalcular) return;
  const u = H.userData,
    caja = u.caja;
  if (caja.isEmpty()) return;
  pieza.updateMatrixWorld(true);
  const qi = pieza.getWorldQuaternion(new THREE.Quaternion()).invert(),
    local = (v) => v.applyQuaternion(cam.quaternion).applyQuaternion(qi),
    aDer = local(V3(1, 0, 0)).toArray(),
    aArr = local(V3(0, 1, 0)).toArray(),
    aCam = local(V3(0, 0, 1)).toArray(),
    tam = caja.getSize(V3()).toArray(),
    cen = caja.getCenter(V3()),
    maxE = Math.max(...tam);
  let n = 0,
    mejor = -1;
  for (let i = 0; i < 3; i++)
    if (tam[i] >= 0.3 * maxE && Math.abs(aDer[i]) > mejor) {
      mejor = Math.abs(aDer[i]);
      n = i;
    }
  let f = -1;
  mejor = -1;
  for (let i = 0; i < 3; i++)
    if (i !== n && Math.abs(aArr[i]) > mejor) {
      mejor = Math.abs(aArr[i]);
      f = i;
    }
  const t = 3 - n - f,
    eje = (i, signo) => {
      const v = V3();
      v.setComponent(i, signo >= 0 ? 1 : -1);
      return v;
    },
    Y = eje(f, aArr[f]),
    T = eje(t, aCam[t]),
    X = new THREE.Vector3().crossVectors(Y, T),
    q = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(X, Y, T),
    );
  const ws = pieza.getWorldScale(V3()),
    k = Math.max(1e-6, (Math.abs(ws.x) + Math.abs(ws.y) + Math.abs(ws.z)) / 3),
    s = THREE.MathUtils.clamp(maxE * k * 0.34, 1.0, 2.8) / k,
    baja = -Math.min(0.14 * tam[f], 0.6 * s);
  u.escala = s;
  u.objetivo = [-1, 1].map((lado) => {
    const sal = X.clone().multiplyScalar(lado);
    return {
      lado,
      sal,
      base: cen
        .clone()
        .addScaledVector(sal, tam[n] / 2)
        .addScaledVector(Y, baja),
      q,
      espejo: lado === -1 ? 1 : -1,
    };
  });
}
// Animación por cuadro: sigue la pieza, agarra al mover y suelta al encajar
function animarManosVR(id, H, dt) {
  const u = H.userData,
    pieza = P[id];
  if (!u.objetivo.length) actualizarManosVR(id, true);
  if (!u.objetivo.length) return;
  u.t += dt;
  const suelta = Boolean(man && man.snap),
    activo = Boolean((man && man.drag) || pulsoManos > 0.12),
    metaAgarre = suelta ? 0 : activo ? 1 : 0.55;
  u.agarre += (metaAgarre - u.agarre) * Math.min(1, dt * 10);
  u.fade += ((suelta ? 0 : 1) - u.fade) * Math.min(1, dt * (suelta ? 12 : 8));
  if (!u.init) u.fade = 0;
  const curl = 0.08 + 0.47 * u.agarre,
    abrir = 1 - u.agarre,
    s = u.escala,
    kp = 1 - Math.exp(-dt * 18),
    kq = 1 - Math.exp(-dt * 11);
  // velocidad de la pieza para inclinar las manos hacia donde se mueve
  const wp = pieza.getWorldPosition(V3());
  if (u.ultimo && dt > 0)
    u.vel.lerp(wp.clone().sub(u.ultimo).divideScalar(dt), Math.min(1, dt * 10));
  u.ultimo = wp;
  H.children.forEach((mano, i) => {
    const o = u.objetivo[i];
    if (!o) return;
    const gap = s * (0.06 + 0.58 * curl) + s * (suelta ? 1.1 : abrir * 0.25),
      destino = o.base.clone().addScaledVector(o.sal, gap);
    if (!u.init) {
      mano.position.copy(destino);
      mano.quaternion.copy(o.q);
    } else {
      mano.position.lerp(destino, kp);
      mano.quaternion.slerp(o.q, kq);
    }
    mano.scale.set(o.espejo * s, s, s);
    const vl = u.vel
      .clone()
      .applyQuaternion(mano.getWorldQuaternion(new THREE.Quaternion()).invert()),
      lim = (v) => THREE.MathUtils.clamp(v, -0.25, 0.25),
      ink = mano.userData.inclina;
    ink.rotation.x =
      -0.3 + lim(vl.z * 0.03) + Math.sin(u.t * 1.2 + mano.userData.fase) * 0.025;
    ink.rotation.z =
      -lim(vl.x * 0.03) * o.espejo + Math.sin(u.t * 0.9 + mano.userData.fase) * 0.025;
    posarDedos(mano, curl, abrir, u.t);
  });
  u.init = true;
  MATERIAL_MANOS.opacity = 0.42 * u.fade;
  MATERIAL_TRAMA_MANOS.opacity = 0.75 * u.fade;
  MATERIAL_NODOS_MANOS.opacity = 0.9 * u.fade;
}
function aplicar(id) {
  const s = ST[id],
    o = P[id];
  o.quaternion.copy(s.q);
  o.position.copy(s.pc).sub(s.c0.clone().applyQuaternion(s.q));
  actualizarManosVR(id, true);
  actualizarGuiaEjes(id);
}
function iniciarManual(p, cb, tb) {
  man = { p, cola: p.p.slice(), act: null, hecho: false };
  mano.style.display = "block";
  siguientePieza(cb, tb);
}
function siguientePieza(cb, tb) {
  const m = man;
  m.act = m.cola.shift();
  limpiarTeclasMovimiento();
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
  const worldScale = o.getWorldScale(V3());
  const sizeLocal = size
    .clone()
    .set(
      size.x / Math.max(Math.abs(worldScale.x), 1e-6),
      size.y / Math.max(Math.abs(worldScale.y), 1e-6),
      size.z / Math.max(Math.abs(worldScale.z), 1e-6),
    );
  ST[id] = {
    pc: start,
    q,
    c0,
    tgt: cen.clone(),
    tol,
    tolA: 16 * DEG,
    dim,
    size,
    sizeLocal,
    centerLocal: o.worldToLocal(bb.getCenter(V3()).clone()),
    par,
  };
  aplicar(id);
  const g = ghostDe(id);
  g.position.copy(to);
  g.quaternion.identity();
  g.visible = false;
  manosVRDe(id);
  mnom.textContent = PASOS.find((x) => x.p.includes(id)).n;
  man.drag = null;
  man.ok = false;
  man.guia = true;
  man.prof = false;
  document.getElementById("mprof").classList.remove("on");
  document.getElementById("mguia").classList.add("on");
  actualizarModo();
  actualizarVisibilidadGuia(id);
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
    (man.msg ? `<div style="color:#fc6;margin-top:4px">${man.msg}</div>` : "");
  mhelp.innerHTML = hint
    ? `<div style="color:#ff737b">💡 ${hint}</div>`
    : "Ajusta la pieza con las flechas y los controles de rotación.";
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
      actualizarVisibilidadGuia(id);
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
    guiaEjes.visible = false;
    if (manosVR[id]) manosVR[id].visible = false;
    limpiarTeclasMovimiento();
    if (id === "kb" || id === "mouse")
      window.actualizarCablePeriferico?.(id, true);
    if (m.p.end) {
      endOn = 1;
    }
    info.innerHTML = `<b>${m.p.n}</b><br>${m.p.t}<div style="margin-top:8px;color:#5f8">✔ ¡Pieza colocada correctamente! Pulsa «Siguiente» para continuar.</div>`;
    man = null;
    actualizarModo();
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
    if (id === "kb" || id === "mouse")
      window.actualizarCablePeriferico?.(id, true);
  });
  mano.style.display = "none";
  Object.values(manosVR).forEach((hands) => (hands.visible = false));
  guiaEjes.visible = false;
  limpiarTeclasMovimiento();
  clearTimeout(m.mt);
  man = null;
  actualizarModo();
  tw = tw.filter((a) => !a.manual);
}
function cerrarManual() {
  Object.values(ghosts).forEach((g) => (g.visible = false));
  Object.values(manosVR).forEach((hands) => (hands.visible = false));
  mano.style.display = "none";
  guiaEjes.visible = false;
  limpiarTeclasMovimiento();
  if (man) clearTimeout(man.mt);
  man = null;
  actualizarModo();
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
    pulsoManos = 1;
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
  if (!desplazarPiezaA(drag.id, s.par.worldToLocal(w))) return;
  pulsoManos = 1;
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
  pulsoManos = 1;
  actualizarEstado();
  intentarEncaje();
}
function mover(dx, dy, dz) {
  if (!man || !man.act || man.snap) return;
  if (desplazarManual(man.act, dx, dy, dz, 0.25)) {
    pulsoManos = 1;
    actualizarEstado();
    intentarEncaje();
  }
}
function limitarMovimiento(id, candidato) {
  const s = ST[id];
  if (!s || s.par !== T) return candidato;
  const gabinete = T.userData.gabinete;
  if (gabinete) {
    T.updateMatrixWorld(true);
    const caja = new THREE.Box3()
      .setFromObject(gabinete)
      .applyMatrix4(T.matrixWorld.clone().invert())
      .expandByScalar(-0.12);
    const unidad = Math.max(0.14, Math.min(0.48, s.dim * 0.11)),
      rotacion = new THREE.Matrix4().makeRotationFromQuaternion(s.q).elements,
      hx = s.size.x / 2 + unidad * 0.62,
      hy = s.size.y / 2,
      hz = s.size.z / 2,
      margenX =
        Math.abs(rotacion[0]) * hx +
        Math.abs(rotacion[4]) * hy +
        Math.abs(rotacion[8]) * hz,
      margenZ =
        Math.abs(rotacion[2]) * hx +
        Math.abs(rotacion[6]) * hy +
        Math.abs(rotacion[10]) * hz,
      limites = [
        ["x", caja.min.x + margenX, caja.max.x - margenX],
        ["z", caja.min.z + margenZ, caja.max.z - margenZ],
      ];
    limites.forEach(([eje, min, max]) => {
      if (min > max) return;
      const actual = s.pc[eje];
      if (actual < min) {
        if (candidato[eje] < actual) candidato[eje] = actual;
        else if (candidato[eje] > max && actual < max) candidato[eje] = max;
      } else if (actual > max) {
        if (candidato[eje] > actual) candidato[eje] = actual;
        else if (candidato[eje] < min && actual > min) candidato[eje] = min;
      } else {
        candidato[eje] = THREE.MathUtils.clamp(candidato[eje], min, max);
      }
    });
  }
  return candidato;
}
function movimientoPermitido(id, candidato) {
  const s = ST[id],
    o = P[id];
  if (!s || s.par !== T) return true;
  const centroAnterior = s.par.localToWorld(s.pc.clone()),
    centroSiguiente = s.par.localToWorld(candidato.clone()),
    delta = centroSiguiente.sub(centroAnterior),
    cajaPieza = new THREE.Box3().setFromObject(o).translate(delta),
    suelo = superficieTablero.position.y + 0.025;
  if (cajaPieza.min.y < suelo) return false;
  const placa = P.mobo;
  if (placa && placa.visible && id !== "mobo") {
    const cajaPlaca = new THREE.Box3().setFromObject(placa);
    if (
      cajaPieza.intersectsBox(cajaPlaca) &&
      candidato.distanceTo(s.tgt) >= s.pc.distanceTo(s.tgt)
    )
      return false;
  }
  return true;
}
function desplazarPiezaA(id, candidato) {
  const s = ST[id];
  limitarMovimiento(id, candidato);
  if (candidato.distanceToSquared(s.pc) < 1e-10) return false;
  if (!movimientoPermitido(id, candidato)) return false;
  s.pc.copy(candidato);
  aplicar(id);
  return true;
}
function desplazarManual(id, dx, dy, dz, paso) {
  const s = ST[id],
    f = cam.getWorldDirection(V3()),
    r = new THREE.Vector3().crossVectors(f, V3(0, 1, 0)).normalize(),
    u = new THREE.Vector3().crossVectors(r, f).normalize(),
    longitud = Math.hypot(dx, dy, dz);
  if (!longitud) return false;
  const escala = paso / longitud,
    candidato = s.pc
      .clone()
      .add(r.multiplyScalar(dx * escala))
      .add(u.multiplyScalar(dy * escala))
      .add(f.multiplyScalar(dz * escala * 2));
  return desplazarPiezaA(id, candidato);
}
const EX = V3(1, 0, 0),
  EY = V3(0, 1, 0),
  EZ = V3(0, 0, 1);
const keysPressed = {
  up: { keyboard: false, pointers: new Set() },
  down: { keyboard: false, pointers: new Set() },
  left: { keyboard: false, pointers: new Set() },
  right: { keyboard: false, pointers: new Set() },
  near: { keyboard: false, pointers: new Set() },
  far: { keyboard: false, pointers: new Set() },
};
const dpadPresses = new Map();
function limpiarTeclasMovimiento() {
  Object.values(keysPressed).forEach((state) => {
    state.keyboard = false;
    state.pointers.clear();
  });
  dpadPresses.clear();
}
const directionKeys = {
  arrowup: "up",
  arrowdown: "down",
  arrowleft: "left",
  arrowright: "right",
  pageup: "far",
  pagedown: "near",
};
window.actualizarMovimientoManual = (dt) => {
  pulsoManos += (0 - pulsoManos) * Math.min(1, dt * 8);
  Object.entries(manosVR).forEach(([id, hands]) => {
    if (hands.visible) animarManosVR(id, hands, dt);
  });
  if (!man || !man.act || gal || man.snap) return;
  const activo = (key) =>
      keysPressed[key].keyboard || keysPressed[key].pointers.size > 0,
    dx = Number(activo("right")) - Number(activo("left")),
    dy = Number(activo("up")) - Number(activo("down")),
    dz = Number(activo("far")) - Number(activo("near"));
  if (!dx && !dy && !dz) return;
  const paso = 2.1 * dt;
  if (
    desplazarManual(
      man.act,
      dx,
      dy,
      dz,
      paso,
    )
  ) {
    dpadPresses.forEach((press) => (press.moved = true));
    actualizarEstado();
    intentarEncaje();
  }
};
addEventListener("keydown", (e) => {
  if (!man || !man.act || gal || man.snap) return;
  const k = e.key.toLowerCase();
  const direction = directionKeys[k];
  if (direction) {
    if (!keysPressed[direction].keyboard) pulsoManos = 1;
    keysPressed[direction].keyboard = true;
    e.preventDefault();
    return;
  }
  let h = true;
  if (k === "q") rotar(EY, 1);
  else if (k === "e") rotar(EY, -1);
  else if (k === "w") rotar(EX, -1);
  else if (k === "s") rotar(EX, 1);
  else if (k === "a") rotar(EZ, 1);
  else if (k === "d") rotar(EZ, -1);
  else h = false;
  if (h) e.preventDefault();
});
addEventListener("keyup", (e) => {
  const direction = directionKeys[e.key.toLowerCase()];
  if (direction) keysPressed[direction].keyboard = false;
});
addEventListener("blur", () => {
  Object.values(keysPressed).forEach((state) => {
    state.keyboard = false;
    state.pointers.clear();
  });
  dpadPresses.clear();
});
const dpadDirections = [
  ["mw", "up", 0, 1, 0],
  ["ms", "down", 0, -1, 0],
  ["ma", "left", -1, 0, 0],
  ["md", "right", 1, 0, 0],
];
dpadDirections.forEach(([id, direction, dx, dy, dz]) => {
  const button = document.getElementById(id);
  button.addEventListener("pointerdown", (e) => {
    if (!man || !man.act) return;
    e.preventDefault();
    keysPressed[direction].pointers.add(e.pointerId);
    dpadPresses.set(e.pointerId, { direction, moved: false });
    button.setPointerCapture(e.pointerId);
  });
  const liberar = (e) => {
    const press = dpadPresses.get(e.pointerId);
    if (!press) return;
    keysPressed[press.direction].pointers.delete(e.pointerId);
    dpadPresses.delete(e.pointerId);
    if (!press.moved && man && man.act && !man.snap) mover(dx, dy, dz);
  };
  button.addEventListener("pointerup", liberar);
  button.addEventListener("pointercancel", (e) => {
    const press = dpadPresses.get(e.pointerId);
    if (!press) return;
    keysPressed[press.direction].pointers.delete(e.pointerId);
    dpadPresses.delete(e.pointerId);
  });
  button.addEventListener("click", (e) => {
    if (e.detail === 0 && man && man.act) mover(dx, dy, dz);
  });
});
const bm = (id, fn) => (document.getElementById(id).onclick = fn);
bm("mqi", () => rotar(EY, 1));
bm("mqe", () => rotar(EY, -1));
bm("mwrot", () => rotar(EX, -1));
bm("msrot", () => rotar(EX, 1));
bm("marot", () => rotar(EZ, 1));
bm("mdrot", () => rotar(EZ, -1));
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
  actualizarVisibilidadGuia(man.act);
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
const FICHA = window.COMPONENTES.FICHA;

const FUNCION = window.COMPONENTES.FUNCION;
const CAPAS = window.COMPONENTES.CAPAS;
const PRODUCTOS = window.COMPONENTES.PRODUCTOS;
const AVISO_MODELO = window.COMPONENTES.AVISO_MODELO;
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
gl.setAttribute("role", "group");
gl.setAttribute("aria-label", "Galería de componentes");
Object.keys(FICHA).forEach((id) => {
  const d = document.createElement("div");
  d.className = "paso";
  d.textContent = nom(id);
  d.setAttribute("role", "button");
  d.setAttribute("aria-pressed", "false");
  d.tabIndex = 0;
  d.onclick = () => showPart(id);
  d.onkeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      d.click();
    }
  };
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
    if (o.userData.hologramaManos) {
      o.visible = false;
      return;
    }
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
  const capas = CAPAS[id] || [],
    partes =
      c.children.length === capas.length
        ? c
        : c.children.length === 1 && c.children[0].children.length === capas.length
          ? c.children[0]
          : c;
  const bb = new THREE.Box3().setFromObject(c),
    ct = bb.getCenter(new THREE.Vector3()),
    sz = bb.getSize(new THREE.Vector3());
  c.position.sub(ct);
  partes.children.forEach((k) => (k.userData.p0 = k.position.clone()));
  gobj = new THREE.Group();
  gobj.add(c);
  gobj.scale.setScalar(6.4 / Math.max(sz.x, sz.y, sz.z));
  gobj.userData.ax = src.userData.ax || "z";
  gobj.userData.id = id;
  gobj.userData.partes = partes;
  gobj.rotation.y = -0.45;
  gobj.rotation.x = src.userData.rx || 0;
  GS.add(gobj);
  gl.childNodes.forEach(
    (d) => {
      const activo = d.dataset.id === id;
      d.className = "paso" + (activo ? " act" : "");
      d.setAttribute("aria-pressed", String(activo));
    },
  );
  const f = FICHA[id];
  const producto = PRODUCTOS[id];
  info.innerHTML =
    "<b>" +
    nom(id) +
    '</b><div class="modelo-referencia">Modelo propuesto: <a href="' +
    producto.fuente +
    '" target="_blank" rel="noopener noreferrer">' +
    producto.nombre +
    "</a></div><div class=\"modelo-nota\">" +
    AVISO_MODELO +
    "</div>" +
    '<div style="margin:8px 0 2px;color:#ff737b;font-weight:700">¿Para qué sirve?</div>' +
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
  if (id === "kb" && window.cargarModeloTeclado)
    window.cargarModeloTeclado();
}
window.refrescarPiezaGaleria = (id) => {
  if (gal && gobj && gobj.userData.id === id) showPart(id);
};
function galeria(on) {
  ocultarInfoComponente();
  limpiarHover();
  gal = on;
  guiaEjes.visible = false;
  Object.values(ghosts).forEach((g) => (g.visible = false));
  Object.values(manosVR).forEach((hands) => (hands.visible = false));
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
  } else {
    info.innerHTML =
      "<b>Simulador de ensamblaje</b><br>Pulsa «Siguiente» o «Auto» para continuar.";
    if (man && man.act) mostrarGuiaEjes(man.act);
  }
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
  hovT = 0,
  toqueGaleria = null,
  detalleTactil = false;
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
  detalleTactil = false;
  if (tip) tip.style.display = "none";
}
function mostrarCapaGaleria(x, y, persistente = false) {
  if (!gal || !gobj || gexp < 0.25) {
    limpiarHover();
    return;
  }
  const r = cv.getBoundingClientRect();
  NDC.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
  RC.setFromCamera(NDC, gcam);
  const c = gobj.userData.partes,
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
  detalleTactil = persistente;
  tip.style.left = Math.min(x + 16, innerWidth - tip.offsetWidth - 10) + "px";
  tip.style.top = Math.min(y + 16, innerHeight - tip.offsetHeight - 10) + "px";
}
cv.addEventListener("pointermove", (e) => {
  if (e.pointerType === "touch") return;
  if (!gal || !gobj || gexp < 0.25 || e.buttons) {
    if (hovK || (tip && tip.style.display === "block")) limpiarHover();
    return;
  }
  const t = performance.now();
  if (t - hovT < 50) return;
  hovT = t;
  mostrarCapaGaleria(e.clientX, e.clientY);
});
cv.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "touch") {
    if (gal) limpiarHover();
    toqueGaleria = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
    };
  } else toqueGaleria = null;
});
window.addEventListener("pointerup", (e) => {
  if (!toqueGaleria || toqueGaleria.id !== e.pointerId) return;
  const inicio = toqueGaleria;
  toqueGaleria = null;
  if (
    Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y) >= 12 ||
    performance.now() - inicio.t >= 600 ||
    !gal
  ) {
    return;
  }
  mostrarCapaGaleria(e.clientX, e.clientY, true);
});
window.addEventListener("pointercancel", () => {
  toqueGaleria = null;
});
cv.addEventListener("pointerleave", (e) => {
  if (e.pointerType !== "touch" && !detalleTactil) limpiarHover();
});
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
  if (cur === -1) ajustarCamaraInicio();
}
addEventListener("resize", resize);
resize();
iniciarCicloAnimacion();
reset();
