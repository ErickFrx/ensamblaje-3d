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
  document.getElementById("detalle-pieza").hidden = true;
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
      ? '<div style="margin-top:8px;color:#ff737b">✋ Arrastra la pieza hasta la guía y gírala para que encaje.</div>'
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
  bloom.strength = rgbOn ? 0.75 : 0;
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
    if (id === "kb" || id === "mouse")
      window.actualizarCablePeriferico?.(id, true);
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
    if (id === "kb" || id === "mouse")
      window.actualizarCablePeriferico?.(id, true);
  });
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
