// ===== mejoras.js — textos unificados, nota técnica, ayuda, quiz y estadísticas del modo manual =====
(()=>{
const $=id=>document.getElementById(id);
const TXT={
 psu:'Coloca la fuente en la parte inferior del case con su ventilador hacia la rejilla. Alinea sus 4 agujeros con los del chasis y fíjala con 4 tornillos.',
 mobo:'Instala primero los separadores en el case, baja la placa alineando sus agujeros con ellos y atorníllala. Comprueba que el panel de puertos encaje en la abertura trasera.',
 cpu:'Abre la palanca del zócalo, alinea el triángulo dorado del procesador con la marca del zócalo y déjalo caer sin presionar. Cierra la placa de carga y asegura la palanca.',
 aio:'Aplica pasta térmica sobre el procesador, coloca la bomba y ajusta sus 4 tornillos en cruz. Fija el radiador con sus 2 ventiladores al frente del case y conecta los cables de la bomba y de los ventiladores.',
 ram:'Abre las pestañas laterales de la ranura, alinea la muesca del módulo y presiona por ambos extremos hasta oír un clic. Repite con los 4 módulos.',
 ssd:'Retira el disipador de la ranura M.2, inserta el SSD inclinado alineando la muesca, presiónalo hasta dejarlo plano y fíjalo con su tornillo. Vuelve a colocar el disipador.',
 gpu:'Retira las tapas traseras del case, alinea la tarjeta con la ranura PCIe x16 y presiona hasta que la traba haga clic. Fíjala al case con tornillos y conecta el cable de energía de 8 pines.',
 glass:'Apoya el panel en las guías del case, deslízalo hasta cerrarlo y asegúralo con los tornillos de mariposa traseros. Va al final para no estorbar durante el montaje.',
 kb:'Conecta el cable USB del teclado a un puerto USB del panel frontal o trasero de la torre.',
 mouse:'Conecta el cable USB del mouse a un puerto USB de la torre. El sistema instala el controlador automáticamente.',
 mon:'Conecta el cable DisplayPort o HDMI a la tarjeta de video (no a la placa madre), enchufa el cable de alimentación del monitor y enciéndelo.',
 spk:'Coloca un parlante a cada lado del monitor y conéctalos a la salida de audio del equipo para tener sonido.'};
const N1='En un ensamblaje real, el procesador, la RAM y el SSD M.2 se instalan sobre la placa madre <b>antes</b> de atornillarla al case: hay más espacio y es más seguro. Aquí se muestran después para ver cada pieza en su lugar final. Antes de tocar componentes, descarga la electricidad estática tocando una superficie metálica.';
const NOTA={psu:'Muchos armadores instalan la fuente después de la placa madre; ambos órdenes son válidos según el case.',cpu:N1,ram:N1,ssd:N1,glass:'Es lo último que se coloca, después de revisar y ordenar los cables.'};
PASOS.forEach(p=>{const t=TXT[p.p[0]];if(t)p.t=t});
PASOS[PASOS.length-1].t='<b>¡Ensamblaje completo!</b> El equipo está encendido: el monitor muestra imagen y la iluminación RGB funciona. En la vida real, antes de encender conecta el cable de corriente a la fuente y a la pared.';

// ---- ventana modal ----
let md=null;
function modal(h){cerrar();md=document.createElement('div');md.id='mod';md.innerHTML='<div class="card">'+h+'</div>';document.body.appendChild(md)}
function cerrar(){if(md){md.remove();md=null}}
addEventListener('keydown',e=>{if(e.key==='Escape')cerrar()});

// ---- estadísticas del modo manual ----
let EST={t0:0,t1:0,ints:0,ayudas:0},tF=0;
const fmt=ms=>{const s=Math.floor(ms/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
const nuevo=()=>{EST={t0:0,t1:0,ints:0,ayudas:0};clearTimeout(tF)};
$('rst').addEventListener('click',nuevo);$('auto').addEventListener('click',()=>{if(cur>=PASOS.length-1)nuevo()});
mano.insertAdjacentHTML('afterbegin','<div id="mhud"></div>');
setInterval(()=>{const h=$('mhud');if(!h||!EST.t0)return;h.innerHTML='⏱ <b>'+fmt((EST.t1||performance.now())-EST.t0)+'</b> · Intentos fallidos: <b>'+EST.ints+'</b>'+(EST.ayudas?' · Ayudas: <b>'+EST.ayudas+'</b>':'')},500);
const _im=iniciarManual;iniciarManual=function(...a){if(!EST.t0)EST.t0=performance.now();return _im(...a)};
let dr=0;
addEventListener('pointerdown',()=>{if(man&&man.drag)dr=1},true);
addEventListener('pointerup',()=>{if(!dr)return;dr=0;if(man&&man.act&&!man.snap)EST.ints++});
$('mauto').addEventListener('click',()=>{if(man)EST.ayudas++},true);

// ---- nota técnica + felicitación al terminar ----
const _paso=paso;
paso=function(inst,fa){const antes=cur;_paso(inst,fa);if(cur===antes)return;const p=PASOS[cur],n=NOTA[p.p[0]];
 if(n)info.insertAdjacentHTML('beforeend','<div class="nota">ℹ️ <b>En la práctica:</b> '+n+'</div>');
 if(p.end){info.insertAdjacentHTML('beforeend','<div style="margin-top:8px"><button id="qzi">🎓 Hacer el quiz</button></div>');$('qzi').onclick=quiz;
  if(!inst){clearTimeout(tF);tF=setTimeout(()=>{if(cur>=PASOS.length-1)felicitar()},2600)}}};
function felicitar(){EST.t1=EST.t1||performance.now();
 let h='<h2>🎉 ¡Ensamblaje completado!</h2><p>La torre, los periféricos y el monitor están listos y el equipo está encendido.</p>';
 if(EST.t0)h+='<div class="stats"><div><b>'+fmt(EST.t1-EST.t0)+'</b>Tiempo</div><div><b>'+EST.ints+'</b>Intentos fallidos</div><div><b>'+EST.ayudas+'</b>Ayudas</div></div><p>'+(EST.ayudas?'Buen trabajo. Repítelo sin usar «Colocar por mí» para mejorar tu marca.':EST.ints<=5?'¡Excelente! Lo armaste tú solo y con muy pocos errores.':'Muy bien: lo lograste sin ayudas. Con práctica reducirás los intentos.')+'</p>';
 else h+='<p>Para practicar tú mismo, activa el modo <b>✋ Manual</b> y coloca cada pieza con el mouse o el dedo.</p>';
 h+='<div class="bt"><button id="q1">🎓 Hacer el quiz</button><button class="sec" id="c1">Cerrar</button></div>';modal(h);$('q1').onclick=quiz;$('c1').onclick=cerrar}

// ---- cómo usar ----
function ayuda(){modal('<h2>Cómo usar el simulador</h2><ul><li><b>Ver:</b> arrastra para girar la vista y usa la rueda (o pellizca en el celular) para acercar.</li><li><b>Avanzar:</b> «Siguiente ▶» arma la torre pieza por pieza, «Auto» lo hace solo y «🔍 Galería» muestra cada pieza por dentro.</li><li><b>✋ Manual:</b> arrastra la pieza hasta su guía y gírala (Q/E, W/S, A/D). Cuando la guía se pone verde, encaja sola.</li><li><b>🎓 Quiz:</b> comprueba lo aprendido con 8 preguntas.</li></ul><p class="cr">Créditos: modelo 3D «Gaming Desktop PC» de Yolala1232 (Sketchfab, licencia CC BY 4.0) · motor gráfico three.js (licencia MIT).</p><div class="bt"><button id="ok1">Entendido</button></div>');$('ok1').onclick=cerrar}
window.mostrarAyuda=ayuda;

// ---- quiz ----
const QS=[
['¿Qué pieza convierte la corriente de la pared en la electricidad que necesita cada componente?','Fuente de alimentación',['Placa madre','Tarjeta de video','Refrigeración líquida'],'La fuente reparte la energía por sus cables; sin ella el equipo no enciende.'],
['¿Cuál es el «cerebro» de la computadora?','Procesador (CPU)',['Memoria RAM','Unidad SSD','Placa madre'],'La CPU ejecuta las instrucciones de los programas y hace los cálculos.'],
['¿Qué pasa con los datos de la memoria RAM cuando apagas el equipo?','Se borran',['Se guardan para siempre','Pasan a la tarjeta de video','Se copian a la fuente de alimentación'],'La RAM es memoria de trabajo temporal: es muy rápida, pero pierde su contenido sin electricidad.'],
['¿Qué pieza guarda de forma permanente el sistema operativo y tus archivos?','Unidad SSD',['Memoria RAM','Procesador','Panel de cristal'],'El SSD conserva los datos aunque se apague el equipo y los entrega a gran velocidad.'],
['¿Para qué sirve la refrigeración líquida (AIO)?','Para sacar el calor del procesador con un radiador y ventiladores',['Para guardar archivos','Para dar energía a la placa madre','Para mejorar la imagen del monitor'],'Un líquido absorbe el calor de la CPU y lo lleva al radiador, donde los ventiladores lo expulsan.'],
['En un ensamblaje real, ¿qué conviene instalar sobre la placa madre antes de atornillarla al case?','Procesador, RAM y SSD M.2',['Panel de cristal, teclado y mouse','Monitor y parlantes','Solo la fuente de alimentación'],'Fuera del case hay más espacio y visibilidad, lo que reduce el riesgo de doblar pines o dañar piezas.'],
['Si el equipo tiene tarjeta de video dedicada, ¿a qué pieza se conecta el cable del monitor?','A la tarjeta de video',['A la placa madre','A la fuente de alimentación','Al teclado'],'La tarjeta de video genera la imagen y la envía al monitor por DisplayPort o HDMI.'],
['¿Por qué el panel de cristal se coloca al final?','Porque cierra la torre y estorbaría durante el montaje',['Porque es la pieza más pesada','Porque da energía al monitor','Porque guarda los archivos'],'Al final también puedes revisar y ordenar los cables antes de cerrar el case.']];
const mez=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
function quiz(){let i=0,ok=0;
 const ver=()=>{
  if(i>=QS.length){modal('<h2>Resultado: '+ok+' / '+QS.length+'</h2><p>'+(ok>=7?'🏆 ¡Excelente! Dominas los componentes de una PC.':ok>=5?'👍 Muy bien. Repasa en la galería las piezas que fallaste.':'📘 Sigue practicando: revisa la galería de piezas e inténtalo otra vez.')+'</p><div class="bt"><button id="r1">Reintentar</button><button class="sec" id="c2">Cerrar</button></div>');$('r1').onclick=quiz;$('c2').onclick=cerrar;return}
  const q=QS[i],op=mez([q[1],...q[2]]);
  modal('<small>Pregunta '+(i+1)+' de '+QS.length+'</small><div class="pb"><i style="width:'+i/QS.length*100+'%"></i></div><h3>'+q[0]+'</h3>'+op.map((o,k)=>'<button class="op" data-k="'+k+'">'+o+'</button>').join('')+'<div id="fb"></div>');
  md.querySelectorAll('.op').forEach(b=>b.onclick=()=>{const bien=op[b.dataset.k]===q[1];if(bien)ok++;
   md.querySelectorAll('.op').forEach(x=>{x.disabled=true;if(op[x.dataset.k]===q[1])x.classList.add('good')});if(!bien)b.classList.add('bad');
   $('fb').innerHTML='<p>'+(bien?'✅ ¡Correcto! ':'❌ No es esa. ')+q[3]+'</p><div class="bt"><button id="nx">'+(i+1<QS.length?'Siguiente':'Ver resultado')+'</button></div>';$('nx').onclick=()=>{i++;ver()}})};
 ver()}

// ---- botones nuevos y menú móvil ----
$('bar').insertAdjacentHTML('beforeend','<button id="ayu">❓ Ayuda</button><button id="qzb">🎓 Quiz</button><button id="mnu">☰ Menú</button>');
$('ayu').onclick=ayuda;$('qzb').onclick=quiz;$('mnu').onclick=()=>$('panel').classList.toggle('min');
if(innerWidth<700)$('panel').classList.add('min');
})();
