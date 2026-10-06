function configurarIluminacion(renderer, scene) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const entorno = new THREE.Scene();
  entorno.background = new THREE.Color(0x0b0e16);

  [
    [0x44ccff, -8, 6, 5],
    [0xff44cc, 9, 5, -4],
    [0xffffff, 0, 10, 2],
  ].forEach(([color, x, y, z]) => {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(7, 0.4, 7),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(4),
      }),
    );
    panel.position.set(x, y, z);
    entorno.add(panel);
  });

  scene.environment = pmrem.fromScene(entorno, 0.04).texture;
  scene.add(new THREE.HemisphereLight(0x8899cc, 0x080810, 0.9));

  const direccional = new THREE.DirectionalLight(0xffffff, 1);
  direccional.position.set(6, 14, 12);
  scene.add(direccional);

  return new THREE.UnrealBloomPass(
    new THREE.Vector2(innerWidth, innerHeight),
    0.75,
    0.7,
    0.9,
  );
}

function agregarLucesTorre(torre) {
  [
    [0x00e5ff, -2, 6, 1.2],
    [0xff2bd6, 2, 2.6, 1.4],
    [0x7a3cff, 0, 8, 0.5],
  ].forEach(([color, x, y, z]) => {
    const luz = new THREE.PointLight(color, 1.6, 13, 1.4);
    luz.position.set(x, y, z);
    torre.add(luz);
  });
}

function configurarIluminacionGaleria(scene) {
  scene.add(new THREE.HemisphereLight(0x99aaff, 0x101018, 0.8));

  const foco = new THREE.SpotLight(0xffffff, 2.4, 60, 0.7, 0.5);
  foco.position.set(8, 12, 10);
  scene.add(foco);

  [
    [0x00e5ff, -9, 4, -6],
    [0xff2bd6, 9, 3, -6],
  ].forEach(([color, x, y, z]) => {
    const luz = new THREE.PointLight(color, 3, 34);
    luz.position.set(x, y, z);
    scene.add(luz);
  });
}
