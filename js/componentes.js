(function () {
  const PASOS = [
    {
      f: "1 · Ensamblar la torre",
      n: "Fuente de alimentación",
      p: ["psu"],
      t: "Coloca la fuente en la parte inferior del case con el ventilador hacia la rejilla. Alinea sus 4 agujeros con el chasis y fíjala con 4 tornillos.",
      c: [-2, 5, 15, -9, 3, 0],
    },
    {
      f: "1 · Ensamblar la torre",
      n: "Placa madre",
      p: ["mobo"],
      t: "Instala primero los separadores del case, baja la placa alineando sus agujeros con ellos y atorníllala. Comprueba que el panel de puertos encaje en la abertura trasera.",
      c: [-5, 7, 13, -9, 5, 0],
    },
    {
      f: "1 · Ensamblar la torre",
      n: "Procesador",
      p: ["cpu"],
      t: "Abre la palanca del zócalo, alinea el triángulo dorado del procesador con la marca y colócalo sin presionar. Cierra la placa de carga y asegura la palanca.",
      c: [-8, 6.5, 8, -10, 6.3, 0],
    },
    {
      f: "1 · Ensamblar la torre",
      n: "Refrigeración líquida RGB",
      p: ["aio"],
      t: "Aplica pasta térmica sobre el procesador, coloca la bomba y ajusta sus 4 tornillos en cruz. Fija el radiador de 240 mm con sus 2 ventiladores RGB al frente del case y conecta sus cables.",
      c: [-3, 7, 12, -8, 5.5, 0],
    },
    {
      f: "1 · Ensamblar la torre",
      n: "Memoria RAM RGB (×4)",
      p: ["ram"],
      t: "Abre las pestañas de las ranuras, alinea la muesca de cada módulo DDR5 y presiona por ambos extremos hasta que encaje. Repite con los 4 módulos.",
      c: [-6, 7, 9, -8.5, 6, 0],
    },
    {
      f: "1 · Ensamblar la torre",
      n: "Unidad SSD M.2",
      p: ["ssd"],
      t: "Retira el disipador de la ranura M.2, inserta el SSD inclinado, presiónalo hasta dejarlo plano y fíjalo con su tornillo. Vuelve a colocar el disipador.",
      c: [-7, 5.5, 8, -10, 4.5, 0],
    },
    {
      f: "1 · Ensamblar la torre",
      n: "Tarjeta de video RGB",
      p: ["gpu"],
      t: "Retira las tapas traseras del case, alinea la tarjeta con la ranura PCIe x16 y presiónala hasta que la traba haga clic. Fíjala al case y conecta su cable de alimentación de 16 pines.",
      c: [-4, 4.5, 12, -9, 3.2, 0],
    },
    {
      f: "1 · Ensamblar la torre",
      n: "Conectar los cables internos",
      p: [],
      t: "Identifica el conector ATX de 24 pines de la placa madre, el EPS de 8 pines del procesador y la alimentación PCIe de la tarjeta gráfica. En un equipo real, conecta también la bomba y los ventiladores según sus manuales. Usa solo los cables modulares suministrados con la fuente y mantenlos lejos de las aspas.",
      c: [-5, 8, 13, -9, 5.5, -1],
    },
    {
      f: "1 · Ensamblar la torre",
      n: "Panel de cristal",
      p: ["glass"],
      t: "Apoya el panel de vidrio en las guías, deslízalo hasta cerrarlo y asegúralo con los tornillos traseros. Colócalo al final para que no estorbe durante el montaje.",
      c: [-3, 6, 17, -9, 4.5, 0],
    },
    {
      f: "2 · Periféricos",
      n: "Teclado RGB",
      p: ["kb"],
      t: "Conecta el cable USB que sale de la parte posterior del teclado a un puerto USB del panel superior/frontal del case. La ruta del cable se muestra sobre la mesa y sube hasta el puerto.",
      c: [7, 13, 25, -2, 3, 2],
    },
    {
      f: "2 · Periféricos",
      n: "Mouse RGB",
      p: ["mouse"],
      t: "Conecta el cable USB que sale de la parte posterior del mouse a otro puerto USB del panel superior/frontal del case. La ruta del cable se muestra sobre la mesa y sube hasta el puerto.",
      c: [7, 13, 25, -2, 3, 2],
    },
    {
      f: "3 · Monitor",
      n: "Monitor",
      p: ["mon"],
      t: "Conecta el cable DisplayPort o HDMI a la tarjeta de video (no a la placa madre), conecta el cable de alimentación del monitor y enciéndelo.",
      c: [2, 7, 17, 2, 4, -2],
    },
    {
      f: "3 · Monitor",
      n: "Parlantes",
      p: ["spk"],
      t: "Coloca los satélites a ambos lados del monitor y conecta el sistema de sonido a la computadora y a la corriente.",
      c: [2, 7, 18, 2, 2, -4],
    },
    {
      f: "4 · Verificación final",
      n: "Comprobar antes de encender",
      p: [],
      checklist: [
        "El conector ATX de 24 pines y el EPS de CPU están firmes; la GPU tiene conectado su cable PCIe de alimentación.",
        "La bomba y los ventiladores están conectados a los encabezados correctos y pueden girar sin cables en medio.",
        "La RAM está asentada, el SSD está fijado y la tarjeta gráfica está encajada y sujeta al chasis.",
        "El monitor está conectado a una salida de la tarjeta gráfica, no a la placa madre.",
        "No quedaron tornillos sueltos ni objetos dentro del case; los cables no obstruyen el flujo de aire.",
        "Con el equipo desconectado de la corriente, terminaste de revisar las conexiones; enciende la fuente solo al finalizar.",
      ],
      t: "Marca cada comprobación después de revisar el montaje. No energices el equipo si detectas una conexión floja, un cable dañado o un ventilador bloqueado.",
      c: [-5, 8, 13, -9, 5.5, -1],
    },
    {
      f: "5 · Finalizado",
      n: "Encender el equipo",
      p: [],
      end: 1,
      t: "<b>¡Ensamblaje completo!</b> La revisión previa está hecha. En un equipo real, conecta la fuente y el monitor a la corriente y enciende el equipo.",
      c: [5, 8, 26, -3, 4, 0],
    },
  ];
  const AVISO_MODELO =
    "El modelo 3D es una representación educativa; su geometría y detalles visuales no necesariamente corresponden exactamente al producto propuesto.";
  const FICHA = {
    psu: [
      "Entrega energía estable a todo el equipo.",
      [
        "1000 W · certificación 80 PLUS Gold",
        "Diseño modular compatible con ATX 3.0 y PCIe 5.0",
        "Cables modulares",
        "Protecciones contra sobrecarga y cortocircuito",
      ],
    ],
    mobo: [
      "Tarjeta principal que conecta todos los componentes.",
      [
        "Chipset Z790 · formato ATX · zócalo LGA1700",
        "Compatible con procesadores Intel Core de 14.ª generación",
        "4 ranuras DIMM para RAM DDR5",
        "Ranuras PCIe x16 / x1 y M.2",
        "Conector de 24 pines y disipadores de energía (VRM)",
      ],
    ],
    cpu: [
      "Procesador: el cerebro que ejecuta las instrucciones.",
      [
        "Zócalo LGA1700 · 24 núcleos (8 P-core + 16 E-core) · 32 hilos",
        "Frecuencia turbo máxima de 6,0 GHz",
        "Potencia base 125 W · potencia turbo máxima 253 W",
        "Usa una BIOS actualizada con Intel Default Settings",
        "Para cargas sostenidas de 253 W, vigila la temperatura; puede convenir un AIO de 360 mm",
        "Tapa metálica (IHS) que reparte el calor",
        "Requiere pasta térmica y disipador",
      ],
    ],
    aio: [
      "Refrigeración líquida todo en uno (AIO).",
      [
        "Radiador de 240 mm · dos ventiladores RGB de 120 mm",
        "Compatible con el zócalo LGA1700",
        "Dos mangueras con líquido refrigerante",
        "Radiador con aletas de aluminio",
      ],
    ],
    ram: [
      "Memoria de acceso rápido para los programas abiertos.",
      [
        "64 GB (4 × 16 GB) DDR5",
        "Configuración conservadora de 4800 MT/s para cuatro módulos",
        "Disipador metálico",
        "Barra de luz RGB direccionable",
        "Cuatro módulos en las ranuras DIMM de la placa",
      ],
    ],
    ssd: [
      "Disco de estado sólido: guarda datos sin partes móviles.",
      [
        "M.2 NVMe PCIe 4.0 · 2 TB",
        "Lectura secuencial máxima de hasta 7450 MB/s",
        "Disipador con etiqueta",
        "Se atornilla directo a la placa madre",
      ],
    ],
    gpu: [
      "Tarjeta de video: procesa los gráficos y envía imagen al monitor.",
      [
        "16 GB GDDR6X · arquitectura NVIDIA Ada Lovelace",
        "Fuente recomendada por el fabricante: 850 W",
        "Disipador de triple ventilador",
        "Iluminación RGB en el borde",
        "Alimentación mediante conector de 16 pines",
        "Soporte metálico y ranura PCIe x16",
      ],
    ],
    glass: [
      "Panel lateral de vidrio templado para una torre ATX de alto flujo.",
      [
        "Deja ver los componentes internos",
        "Se fija con tornillos al case",
        "Protege del polvo y ruido",
      ],
    ],
    kb: [
      "Teclado mecánico RGB de tamaño completo.",
      [
        "Teclas con retroiluminación RGB",
        "Conexión USB por cable",
        "Base de aluminio",
      ],
    ],
    mouse: [
      "Mouse gamer ergonómico con iluminación LIGHTSYNC RGB.",
      [
        "Sensor óptico de alta precisión",
        "Rueda con luz RGB y botones laterales",
        "Conexión USB por cable",
      ],
    ],
    spk: [
      "Sistema de parlantes 2.1 para el audio del equipo.",
      [
        "Parlante izquierdo y derecho",
        "Se ubican a ambos lados del monitor",
        "Conexión por audio de 3,5 mm o USB",
        "Reproducen el sonido del sistema",
      ],
    ],
    mon: [
      "Monitor QHD IPS de 27 pulgadas.",
      [
        "Resolución QHD 2560 × 1440",
        "Frecuencia de actualización de hasta 170 Hz (modo OC)",
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
  const PRODUCTOS = {
    psu: {
      nombre: "Corsair RM1000e",
      fuente:
        "https://www.corsair.com/us/en/p/psu/cp-9020264-na/rm1000e-fully-modular-low-noise-atx-power-supply-cp-9020264-na",
    },
    mobo: {
      nombre: "MSI MAG Z790 TOMAHAWK MAX WIFI (DDR5)",
      fuente: "https://www.msi.com/Motherboard/MAG-Z790-TOMAHAWK-MAX-WIFI",
    },
    cpu: {
      nombre: "Intel Core i9-14900K",
      fuente:
        "https://www.intel.com/content/www/us/en/products/sku/236773/intel-core-i9-processor-14900k-36m-cache-up-to-6-00-ghz/specifications.html",
    },
    aio: {
      nombre: "Corsair iCUE H100i RGB ELITE",
      fuente:
        "https://www.corsair.com/us/en/p/cpu-coolers/cw-9060058-ww/icue-h100i-rgb-elite-liquid-cpu-cooler-cw-9060058-ww",
    },
    ram: {
      nombre: "Corsair Vengeance RGB DDR5 64 GB · kit de 4 módulos (seleccionar kit validado en QVL)",
      fuente:
        "https://www.msi.com/Motherboard/MAG-Z790-TOMAHAWK-MAX-WIFI/support#mem",
    },
    ssd: {
      nombre: "Samsung 990 PRO 2 TB",
      fuente:
        "https://www.samsung.com/us/memory-storage/nvme-ssd/990-pro-pcie-4-0-nvme-ssd-1tb-sku-mz-v9p2t0b-am/",
    },
    gpu: {
      nombre: "MSI GeForce RTX 4080 SUPER 16G VENTUS 3X OC",
      fuente:
        "https://www.msi.com/Graphics-Card/GeForce-RTX-4080-SUPER-16G-VENTUS-3X-OC",
    },
    glass: {
      nombre: "Corsair 5000D AIRFLOW",
      fuente:
        "https://www.corsair.com/us/en/p/pc-cases/cc-9011210-ww/5000d-airflow-tempered-glass-mid-tower-atx-pc-case-black-cc-9011210-ww",
    },
    kb: {
      nombre: "HyperX Alloy Origins Full Size",
      fuente: "https://hyperx.com/collections/gaming-keyboards",
    },
    mouse: {
      nombre: "Logitech G502 HERO",
      fuente:
        "https://www.logitechg.com/en-us/products/gaming-mice/g502-hero-gaming-mouse.html",
    },
    mon: {
      nombre: "GIGABYTE M27Q",
      fuente: "https://www.gigabyte.com/Monitor/M27Q",
    },
    spk: {
      nombre: "Logitech Z407",
      fuente:
        "https://www.logitech.com/en-us/products/speakers/z407-bluetooth-computer-speakers.html",
    },
  };
  window.COMPONENTES = {
    PASOS,
    FICHA,
    FUNCION,
    CAPAS,
    PRODUCTOS,
    AVISO_MODELO,
  };
})();
