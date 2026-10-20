(() => {
  const scene = S;
  const root = new THREE.Group();
  root.name = "Laboratorio de Ingenieria de Sistemas UNDC";
  scene.add(root);

  const backgroundOriginal = scene.background;
  const fogOriginal = scene.fog;
  const colors = {
    cream: new THREE.MeshStandardMaterial({
      color: 0x9d8d73,
      roughness: 0.92,
    }),
    orange: new THREE.MeshStandardMaterial({
      color: 0x8f4d19,
      roughness: 0.86,
    }),
    floor: new THREE.MeshStandardMaterial({
      color: 0x665a47,
      roughness: 0.96,
    }),
    wood: new THREE.MeshStandardMaterial({
      color: 0x60402a,
      roughness: 0.83,
    }),
    darkWood: new THREE.MeshStandardMaterial({
      color: 0x513921,
      roughness: 0.82,
    }),
    metal: new THREE.MeshStandardMaterial({
      color: 0x42454a,
      roughness: 0.6,
      metalness: 0.48,
    }),
    black: new THREE.MeshStandardMaterial({
      color: 0x17191c,
      roughness: 0.48,
      metalness: 0.18,
    }),
    screen: new THREE.MeshStandardMaterial({
      color: 0x242a30,
      roughness: 0.5,
      emissive: 0x080b0e,
    }),
    white: new THREE.MeshStandardMaterial({
      color: 0xbdb9aa,
      roughness: 0.78,
    }),
    glass: new THREE.MeshStandardMaterial({
      color: 0x9bb7bd,
      roughness: 0.24,
      metalness: 0.12,
      transparent: true,
      opacity: 0.62,
    }),
    curtain: new THREE.MeshStandardMaterial({
      color: 0xa96920,
      roughness: 0.95,
    }),
    curtainShade: new THREE.MeshStandardMaterial({
      color: 0x824b17,
      roughness: 0.96,
    }),
    cushion: new THREE.MeshStandardMaterial({
      color: 0x242529,
      roughness: 0.91,
    }),
    light: new THREE.MeshBasicMaterial({
      color: 0xb39968,
    }),
  };
  const geometries = new Map();
  const boxGeometry = (w, h, d) => {
    const key = `${w}:${h}:${d}`;
    if (!geometries.has(key))
      geometries.set(key, new THREE.BoxGeometry(w, h, d));
    return geometries.get(key);
  };
  const box = (parent, w, h, d, material, x, y, z) => {
    const mesh = new THREE.Mesh(boxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.userData.decorativoLaboratorio = true;
    parent.add(mesh);
    return mesh;
  };
  const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 20);
  const cylinder = (parent, radius, height, material, x, y, z) => {
    const mesh = new THREE.Mesh(cylinderGeometry, material);
    mesh.scale.set(radius, height, radius);
    mesh.position.set(x, y, z);
    mesh.userData.decorativoLaboratorio = true;
    parent.add(mesh);
    return mesh;
  };
  const floorY = -4.89;
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 100),
    colors.floor,
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, floorY, -10);
  floor.userData.decorativoLaboratorio = true;
  root.add(floor);

  const wallY = 6.1;
  box(root, 100, 22, 0.42, colors.cream, 0, wallY, -42);
  box(root, 0.42, 22, 82, colors.cream, -50, wallY, -1);
  const windowBandBottom = 5;
  const windowBandTop = 12.2;
  const rightWallX = 50;
  box(
    root,
    0.42,
    windowBandBottom - floorY,
    82,
    colors.orange,
    rightWallX,
    (floorY + windowBandBottom) / 2,
    -1,
  );
  box(
    root,
    0.42,
    17 - windowBandTop,
    82,
    colors.orange,
    rightWallX,
    (17 + windowBandTop) / 2,
    -1,
  );
  [
    [-42, -32.25],
    [-21.75, -17.25],
    [-6.75, 40],
  ].forEach(([start, end]) => {
    box(
      root,
      0.42,
      windowBandTop - windowBandBottom,
      end - start,
      colors.orange,
      rightWallX,
      (windowBandBottom + windowBandTop) / 2,
      (start + end) / 2,
    );
  });
  box(root, 31, 21.8, 0.08, colors.orange, 31, wallY, -41.76);

  box(root, 15, 6.2, 0.28, colors.white, 5, 8.2, -41.55);
  box(root, 15.5, 0.12, 0.12, colors.metal, 5, 5.05, -41.34);
  box(root, 0.12, 6.2, 0.12, colors.metal, -2.5, 8.2, -41.34);
  box(root, 0.12, 6.2, 0.12, colors.metal, 12.5, 8.2, -41.34);

  const projectionFrame = box(
    root,
    11,
    6.2,
    0.2,
    colors.black,
    5,
    8.3,
    -41.12,
  );
  box(root, 10.55, 5.72, 0.025, colors.screen, 5, 8.3, -41);
  projectionFrame.userData.esPantallaProyeccion = true;

  const cabinet = new THREE.Group();
  cabinet.position.set(-42.5, 12.5, -41.45);
  root.add(cabinet);
  box(cabinet, 5.2, 5.6, 2.8, colors.black, 0, 0, 0);
  box(cabinet, 4.7, 0.12, 0.12, colors.metal, 0, 1.65, 1.46);
  box(cabinet, 4.7, 0.12, 0.12, colors.metal, 0, -1.65, 1.46);
  [-1.7, -0.55, 0.6, 1.7].forEach((x) => {
    box(cabinet, 0.035, 2.8, 0.04, colors.metal, x, 0, 1.47);
  });

  const addFan = (x, y) => {
    const fan = new THREE.Group();
    fan.position.set(x, y, -41.4);
    root.add(fan);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.35, 0.09, 8, 32),
      colors.metal,
    );
    ring.userData.decorativoLaboratorio = true;
    fan.add(ring);
    cylinder(fan, 0.2, 0.28, colors.metal, 0, 0, 0).rotation.x =
      Math.PI / 2;
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const blade = box(
        fan,
        0.34,
        1.05,
        0.1,
        colors.black,
        Math.sin(angle) * 0.55,
        Math.cos(angle) * 0.55,
        0,
      );
      blade.rotation.z = -angle;
    }
  };
  addFan(-31, 9.1);
  addFan(24, 9.1);

  const projector = new THREE.Group();
  projector.position.set(4.5, 14.4, -20);
  root.add(projector);
  box(projector, 2.8, 0.85, 2, colors.white, 0, 0, 0);
  box(projector, 0.4, 0.4, 0.4, colors.metal, 0, -0.48, 0);
  box(projector, 0.44, 0.44, 0.08, colors.glass, 0, 0, 1.04);
  box(root, 0.16, 1.4, 0.16, colors.metal, 4.5, 15.45, -20);

  [-25, -5, 15, 35].forEach((x) => {
    [-18, -34].forEach((z) => {
      box(root, 12.5, 0.26, 0.3, colors.white, x, 16.72, z);
      box(root, 10.5, 0.05, 0.12, colors.light, x, 16.54, z);
    });
  });
  box(root, 100, 0.4, 0.5, colors.cream, 0, 17.35, -41);
  box(root, 0.5, 0.4, 82, colors.cream, -49.6, 17.35, -1);
  box(root, 0.5, 0.4, 82, colors.cream, 49.6, 17.35, -1);

  [-27, -12].forEach((z) => {
    box(root, 0.16, 7.2, 10.5, colors.white, 49.68, 8.6, z);
    box(root, 0.12, 6.5, 9.8, colors.glass, 49.56, 8.6, z);
    [-4.8, -3.8, -2.8, 2.8, 3.8, 4.8].forEach((offset, index) => {
      box(
        root,
        0.34,
        8.4,
        0.42,
        index % 2 ? colors.curtainShade : colors.curtain,
        49.25,
        8,
        z + offset,
      );
    });
    box(root, 0.35, 0.28, 11.2, colors.metal, 49.16, 12.95, z);
  });

  const makeChair = (x, z) => {
    const chair = new THREE.Group();
    chair.position.set(x, floorY, z);
    root.add(chair);
    box(chair, 2.6, 0.42, 2.4, colors.cushion, 0, 2.55, 0);
    box(chair, 2.6, 3.4, 0.38, colors.cushion, 0, 4.3, -1.02);
    cylinder(chair, 0.22, 1.9, colors.metal, 0, 1.35, 0);
    for (let i = 0; i < 5; i++) {
      const spoke = box(chair, 0.16, 0.12, 1.3, colors.metal, 0, 0.35, 0);
      spoke.rotation.y = (i * Math.PI * 2) / 5;
    }
  };
  const addComputerStation = (x, z) => {
    const station = new THREE.Group();
    station.position.set(x, 0, z);
    root.add(station);
    box(station, 12, 0.3, 5, colors.wood, 0, -0.2, 0);
    box(station, 11.8, 0.08, 0.08, colors.darkWood, 0, -0.37, 0);
    [-5.4, 5.4].forEach((lx) => {
      [-1.9, 1.9].forEach((lz) => {
        box(station, 0.28, 4.5, 0.28, colors.metal, lx, -2.58, lz);
      });
    });

    box(station, 4.7, 3.1, 0.22, colors.black, 0, 1.72, -1.45);
    box(station, 4.35, 2.73, 0.05, colors.screen, 0, 1.74, -1.31);
    box(station, 0.34, 0.65, 0.42, colors.metal, 0, 0.25, -1.42);
    box(station, 1.9, 0.14, 0.9, colors.black, 0, 0.04, -1.32);
    box(station, 2.8, 0.14, 1, colors.black, 0, 0.015, 0.9);
    box(station, 0.5, 0.1, 0.7, colors.metal, 4, 0.02, 0.95);
    box(station, 1.5, 2.4, 1.8, colors.black, -4.1, 1.2, -0.1);
    box(station, 1.2, 2.05, 0.04, colors.screen, -4.1, 1.2, 0.82);
    makeChair(x, z + 4.3);
  };
  [-25, -9, 7, 23].forEach((x) => {
    addComputerStation(x, -16);
    addComputerStation(x, -29);
  });

  const woodCanvas = document.createElement("canvas");
  woodCanvas.width = 512;
  woodCanvas.height = 256;
  const woodContext = woodCanvas.getContext("2d");
  woodContext.fillStyle = "#613f29";
  woodContext.fillRect(0, 0, woodCanvas.width, woodCanvas.height);
  for (let i = 0; i < 90; i++) {
    const y = (i / 90) * woodCanvas.height;
    woodContext.strokeStyle = `rgba(54, 31, 17, ${0.025 + (i % 4) * 0.008})`;
    woodContext.lineWidth = 1 + (i % 3);
    woodContext.beginPath();
    woodContext.moveTo(0, y);
    woodContext.bezierCurveTo(150, y - 5, 340, y + 6, 512, y + 1);
    woodContext.stroke();
  }
  const woodTexture = new THREE.CanvasTexture(woodCanvas);
  woodTexture.colorSpace = THREE.SRGBColorSpace;
  woodTexture.anisotropy = Math.min(4, R.capabilities.getMaxAnisotropy());
  const mainTableTop = new THREE.Mesh(
    new THREE.PlaneGeometry(34, 12),
    new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.84,
      metalness: 0.02,
    }),
  );
  mainTableTop.rotation.x = -Math.PI / 2;
  mainTableTop.position.set(0, -0.017, 0);
  mainTableTop.userData.decorativoLaboratorio = true;
  root.add(mainTableTop);

  scene.background = new THREE.Color(0x9e896c);
  scene.fog = new THREE.Fog(0x9e896c, 58, 140);
  const windowLight = new THREE.DirectionalLight(0xffe4bc, 0.16);
  windowLight.position.set(32, 13, 8);
  root.add(windowLight);

  window.setLaboratorioVisible = (visible) => {
    root.visible = visible;
    scene.background = visible
      ? new THREE.Color(0x9e896c)
      : backgroundOriginal;
    scene.fog = visible ? new THREE.Fog(0x9e896c, 58, 140) : fogOriginal;
    const button = document.getElementById("laboratorio-toggle");
    button.setAttribute("aria-pressed", String(visible));
    button.textContent = visible ? "Aula 3D: SÍ" : "Aula 3D: NO";
  };
  document
    .getElementById("laboratorio-toggle")
    .addEventListener("click", () => {
      window.setLaboratorioVisible(!root.visible);
    });
})();
