/* One local faculty wallpaper for both PC and laptop displays. */
window.crearPantallaUNDC=function(T){
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
const texture = new T.CanvasTexture(sc);texture.userData.fondoListo=false;
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
  texture.needsUpdate = true;texture.userData.fondoListo=true;
};
imagenFacultad.onerror = () => {
  console.error(
    "No se pudo decodificar la imagen de fondo embebida del monitor.",
  );
};
imagenFacultad.src = window.FACULTAD_IMAGE_DATA;
return texture;
};
