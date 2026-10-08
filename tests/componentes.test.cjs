const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const contexto = { window: {} };
const rutaDatos = path.join(__dirname, "..", "js", "componentes.js");
vm.runInNewContext(fs.readFileSync(rutaDatos, "utf8"), contexto);

const { PASOS, FICHA, FUNCION, CAPAS, PRODUCTOS, AVISO_MODELO } =
  contexto.window.COMPONENTES;
const idsDePiezas = PASOS.flatMap((paso) => paso.p);
const gruposEsperados = {
  psu: 6,
  mobo: 6,
  cpu: 8,
  aio: 6,
  ram: 4,
  ssd: 11,
  gpu: 6,
  glass: 1,
  kb: 3,
  mouse: 3,
  mon: 5,
  spk: 2,
};

test("los pasos cubren una vez cada componente documentado", () => {
  assert.equal(PASOS.length, 13);
  assert.equal(PASOS.at(-1).end, 1);
  assert.deepEqual([...new Set(idsDePiezas)].sort(), Object.keys(FICHA).sort());
  assert.equal(idsDePiezas.length, Object.keys(FICHA).length);
});

test("el encendido es el paso final sin una comprobación intermedia", () => {
  assert.ok(PASOS.every((paso) => paso.n !== "Conectar los cables internos"));
  assert.equal(PASOS.at(-1).n, "Encender el equipo");
  assert.ok(PASOS.slice(0, -1).every((paso) => paso.p.length > 0));
  assert.match(AVISO_MODELO, /representación educativa/);
});

test("teclado y mouse explican su conexión USB al case", () => {
  for (const id of ["kb", "mouse"]) {
    const paso = PASOS.find((item) => item.p.includes(id));
    assert.match(paso.t, /cable USB/i);
    assert.match(paso.t, /puerto USB/i);
    assert.match(paso.t, /case/i);
  }
});

test("todas las piezas tienen función, ficha y modelo con fuente", () => {
  for (const id of Object.keys(FICHA)) {
    assert.ok(FUNCION[id], `Falta la función de ${id}`);
    assert.ok(FICHA[id][0], `Falta la descripción de ${id}`);
    assert.ok(FICHA[id][1].length > 0, `Faltan datos técnicos de ${id}`);
    assert.ok(PRODUCTOS[id]?.nombre, `Falta el modelo de referencia de ${id}`);
    assert.match(PRODUCTOS[id].fuente, /^https:\/\/.+/);
  }
  assert.deepEqual(Object.keys(PRODUCTOS).sort(), Object.keys(FICHA).sort());
});

test("cada capa del modelo tiene exactamente una descripción", () => {
  assert.deepEqual(
    Object.keys(CAPAS).sort(),
    Object.keys(gruposEsperados).sort(),
  );
  for (const [id, cantidad] of Object.entries(gruposEsperados)) {
    assert.equal(CAPAS[id].length, cantidad, `Cantidad de capas para ${id}`);
    assert.ok(
      CAPAS[id].every(([nombre, descripcion]) => nombre && descripcion),
      `Descripción incompleta en ${id}`,
    );
  }
});

test("la propuesta conserva el zócalo, la memoria y la potencia coherentes", () => {
  const cpu = FICHA.cpu[1].join(" ");
  const placa = FICHA.mobo[1].join(" ");
  const ram = FICHA.ram[1].join(" ");
  const fuente = FICHA.psu[1].join(" ");

  assert.match(PRODUCTOS.cpu.nombre, /i9-14900K/);
  assert.match(PRODUCTOS.mobo.nombre, /Z790.*DDR5/);
  assert.match(cpu, /LGA1700/);
  assert.match(placa, /LGA1700/);
  assert.match(ram, /64 GB \(4 × 16 GB\)/);
  assert.match(ram, /4800 MT\/s/);
  assert.match(fuente, /1000 W/);
  assert.match(FICHA.aio[1].join(" "), /240 mm/);
});

test("las instrucciones y las cámaras existen en todos los pasos de pieza", () => {
  for (const paso of PASOS.slice(0, -1)) {
    assert.ok(paso.t, `Falta instrucción: ${paso.n}`);
    assert.equal(paso.c.length, 6, `Cámara inválida: ${paso.n}`);
    assert.ok(
      paso.p.length > 0 || paso.end,
      `Paso sin pieza ni actividad: ${paso.n}`,
    );
  }
});
