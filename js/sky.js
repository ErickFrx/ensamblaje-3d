/* Sky · resources from the supplied robot_undc HTML; no browser TTS. */
(function () {
  'use strict';
  if (window.SKY) return;
  const base = new URL('../', document.currentScript.src);
  const resolve = p => new URL(p, base).href;
  const store = { get(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}}, set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}} };
  const state = {voiceEnabled:store.get('sky.voice',true), subtitles:store.get('sky.subtitles',true),hidden:store.get('sky.hidden',false),suspended:!document.body.classList.contains('laptop-mode') && location.hash!=='#pc',speaking:false,expression:'feliz',token:0,audio:null,frame:0,position:{x:0,y:0},message:null,reading:false};
  const defs = {feliz:{eyes:'open',mouth:'tiny',brow:'happy'},contento:{eyes:'laugh',mouth:'smile',brow:'happy'},sorp:{eyes:'round',mouth:'smallo',brow:'raised'},pensando:{eyes:'curious',mouth:'softsmile',brow:'curious'},nervioso:{eyes:'worried',mouth:'smallo',brow:'worried'},triste:{eyes:'sad',mouth:'frown',brow:'sad'},enojado:{eyes:'angry',mouth:'flat',brow:'angry'},dormido:{eyes:'closed',mouth:'softsmile',brow:'none'}};
  const lines = [
    '¡Hola! Soy Sky, tu pequeña asistente de ensamblaje de computadoras de la UNDC.',
    'Hoy aprenderemos algo muy interesante. Primero, reconozcamos las piezas que vamos a utilizar.',
    'Primero, vamos a colocar el procesador en la placa madre.',
    'Hazlo con cuidado, ¿de acuerdo?',
    'Ahora instalaremos el SSD. Comprobemos si tu unidad es M.2 o SATA y qué conexión necesita.',
    'Continuemos con la refrigeración. Un procesador necesita disipar el calor para funcionar correctamente.',
    '¡Muy bien! Ahora vamos a instalar la placa madre en el gabinete.',
    'Conectemos la alimentación con paciencia. Vamos a revisar cada conector.',
    '¡Oh! Parece que algo no encaja... Mmm, déjame comprobarlo. ¡Ah, ya lo tengo! Inténtalo una vez más.',
    '¡Excelente trabajo! Lo hiciste muy bien. Sigamos aprendiendo juntos.'
  ];
  const maps = {pc:{aio:5,mobo:6},laptop:{cool:5}};
  const guias = {
  "pc": {
    "psu": "Coloca la fuente en la parte inferior del gabinete, con el ventilador hacia la rejilla, y fija sus cuatro tornillos.",
    "mobo": "Coloca la placa madre sobre los separadores del gabinete, alinea sus agujeros y fíjala con los tornillos.",
    "cpu": "Alinea el triángulo del procesador con la marca del zócalo. Colócalo sin presionar y cierra la palanca.",
    "aio": "Coloca la bomba sobre el procesador, fija el radiador y conecta sus ventiladores. Sigue las indicaciones de pasta térmica del panel.",
    "ram": "Abre las pestañas, alinea la muesca de la RAM y presiona ambos extremos hasta encajar. Instala los cuatro módulos.",
    "ssd": "Inserta el SSD M.2 inclinado, bájalo hasta su soporte y fíjalo con el tornillo. Vuelve a colocar el disipador.",
    "gpu": "Inserta la tarjeta gráfica en la ranura PCIe x16, fíjala al gabinete y conecta su cable de alimentación.",
    "glass": "Coloca el panel de vidrio en sus guías, cierra el gabinete y asegura el panel.",
    "kb": "Conecta el cable USB del teclado a un puerto del gabinete. Sigue la ruta del cable que muestra el modelo.",
    "mouse": "Conecta el cable USB del mouse a otro puerto del gabinete.",
    "mon": "Conecta el monitor a la tarjeta gráfica mediante HDMI o DisplayPort y conecta su alimentación.",
    "spk": "Coloca los parlantes a ambos lados del monitor y conecta el sistema de audio y su alimentación."
  },
  "laptop": {
    "base": "Reconoce el chasis inferior: sus soportes, aberturas y puntos de fijación sostienen el conjunto.",
    "mobo": "Alinea la placa base con los soportes y los puertos del chasis; fíjala en sus puntos de montaje.",
    "cpu": "Identifica el procesador BGA sobre la placa. Está soldado: en este modelo no se extrae ni se instala en un zócalo.",
    "ram": "Alinea la muesca del SO-DIMM, introdúcelo inclinado y bájalo hasta que los retenedores lo sujeten. Repite con el segundo módulo.",
    "ssd": "Inserta el SSD M.2 en su conector, bájalo hasta el soporte y asegúralo con el tornillo.",
    "cool": "Coloca las placas de contacto sobre CPU y GPU y fija el conjunto de heatpipes y ventiladores.",
    "bat": "Fija la batería en su alojamiento y revisa su conector. Es una representación educativa; sigue el manual de tu equipo para conectarla.",
    "deck": "Antes de cerrar la carcasa superior, revisa las conexiones del teclado y el touchpad. Alinea y fija la cubierta.",
    "lid": "Alinea las bisagras, fija la pantalla y revisa la conexión del cable de video antes de encender el equipo."
  }
};
  const root=document.createElement('div');root.id='sky-sticker';
  root.innerHTML='<button id="sky-figure" aria-label="Saludar a Sky; arrastra para moverla"><canvas id="sky-canvas" width="384" height="384"></canvas></button><button id="sky-settings" aria-label="Ajustes de Sky" title="Ajustes de Sky" aria-expanded="false">⚙</button><div id="sky-bubble" role="status" aria-live="polite" hidden></div><div id="sky-menu" role="group" aria-label="Ajustes de Sky" hidden><strong>Sky · tu guía</strong><button data-action="voice"></button><button data-action="subtitles"></button><button data-action="repeat">↻ Repetir mensaje</button><button data-action="reset">↖ Restablecer posición</button><button data-action="hide">Ocultar a Sky</button></div>';
  document.body.appendChild(root);
  const figure=root.querySelector('#sky-figure'),bubble=root.querySelector('#sky-bubble'),menu=root.querySelector('#sky-menu'),settings=root.querySelector('#sky-settings');
  const reveal=document.createElement('button');reveal.id='sky-reveal';reveal.textContent='Mostrar a Sky';document.body.appendChild(reveal);
  const cvs=root.querySelector('canvas'),ctx=cvs.getContext('2d'),portrait=new Image();portrait.src=resolve('images/sky-cutout.png');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let timers=[],drag=null, suppressClick=false, reactionTimer=0,lastDraw=0;
  function later(f,ms){const id=setTimeout(f,ms);timers.push(id);return id}
  function active(){return !state.hidden&&!state.suspended&&!document.hidden}
  function clearMessage(){timers.forEach(clearTimeout);timers=[];state.token++;if(state.audio){state.audio.onended=state.audio.onerror=state.audio.onplay=null;state.audio.pause();state.audio=null;}state.speaking=false;state.reading=false;figure.classList.remove('speaking');bubble.hidden=true;bubble.classList.remove('leaving');}
  function dismiss(delay){later(()=>{bubble.classList.add('leaving');later(()=>{bubble.hidden=true;state.reading=false},180)},delay)}
  function display(text){bubble.textContent=text;bubble.hidden=!state.subtitles;bubble.classList.remove('leaving');layout();}
  function message(text,index=null,expr='pensando'){
    state.message={text,index,expr};clearMessage();if(!active())return;
    state.expression=expr;const token=state.token;
    const spoken=index==null||!state.voiceEnabled?text:lines[index];display(spoken);
    if(index==null||!state.voiceEnabled){state.reading=true;dismiss(Math.max(2400,Math.min(8500,spoken.length*48)));return;}
    const a=new Audio(resolve('audio/sky/linea-'+String(index).padStart(2,'0')+'.mp3'));state.audio=a;state.reading=true;
    a.onplay=()=>{if(token!==state.token)return;state.speaking=true;figure.classList.add('speaking');};
    a.onended=()=>{if(token!==state.token)return;state.speaking=false;state.audio=null;figure.classList.remove('speaking');dismiss(420)};
    const fail=()=>{if(token!==state.token)return;state.speaking=false;state.audio=null;figure.classList.remove('speaking');display(text);dismiss(4500)};
    a.onerror=fail;a.play().catch(fail);
  }
  function layout(){
    const w=root.offsetWidth||160,h=root.offsetHeight||160;
    state.position.x=Math.max(0,Math.min(innerWidth-w,state.position.x));state.position.y=Math.max(0,Math.min(innerHeight-h-12,state.position.y));
    root.style.left=state.position.x+'px';root.style.top=state.position.y+'px';
    const mw=Math.min(280,innerWidth-24);for(const el of [bubble,menu]){
      el.style.width=mw+'px';const right=state.position.x+w+mw+12<=innerWidth;
      const x=right?state.position.x+w+8:state.position.x-mw-8;
      el.style.left=Math.max(12,Math.min(innerWidth-mw-12,x))+'px';
      el.style.top=Math.max(12,Math.min(innerHeight-(el.offsetHeight||180)-12,state.position.y+(el===menu?30:0)))+'px';
    }
  }
  function position(x,y,save=true){state.position={x,y};layout();if(save)store.set('sky.position',{x:state.position.x/innerWidth,y:state.position.y/innerHeight})}
  function resetPosition(){position(innerWidth-(innerWidth<650?138:180),84)}
  const saved=store.get('sky.position',null);if(saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.y))position(saved.x*innerWidth,saved.y*innerHeight,false);else resetPosition();
  function menuState(open){menu.hidden=!open;settings.setAttribute('aria-expanded',String(open));layout()}
  function labels(){menu.querySelector('[data-action="voice"]').textContent='Voz: '+(state.voiceEnabled?'activada':'desactivada');menu.querySelector('[data-action="subtitles"]').textContent='Subtítulos: '+(state.subtitles?'activados':'desactivados');window.dispatchEvent(new CustomEvent('sky:voice',{detail:state.voiceEnabled}))}
  function sync(){root.hidden=!active();reveal.hidden=!state.hidden||state.suspended;root.classList.toggle('reduced',reduced.matches);if(!active()){cancelAnimationFrame(state.frame);state.frame=0;}else if(!state.frame){lastDraw=0;state.frame=requestAnimationFrame(loop)}}
  function hide(v){clearMessage();state.hidden=v;store.set('sky.hidden',v);menuState(false);sync()}
  function react(expr='contento'){state.expression=expr;figure.classList.remove('greeting');void figure.offsetWidth;figure.classList.add('greeting');clearTimeout(reactionTimer);reactionTimer=setTimeout(()=>{figure.classList.remove('greeting');state.expression=state.message?.expr||'feliz'},1600);sync()}
  figure.addEventListener('pointerdown',e=>{if(e.button&&e.pointerType==='mouse')return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,px:state.position.x,py:state.position.y,moved:false};figure.setPointerCapture(e.pointerId);});
  figure.addEventListener('pointermove',e=>{if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>7)drag.moved=true;if(drag.moved){position(drag.px+dx,drag.py+dy,false);figure.classList.add('dragging');}}else if(!reduced.matches){const b=figure.getBoundingClientRect();figure.style.setProperty('--look',((e.clientX-b.x)/b.width-.5)*10+'deg');}});
  function end(e){if(!drag)return;suppressClick=drag.moved;if(drag.moved)position(state.position.x,state.position.y);drag=null;figure.classList.remove('dragging');if(figure.hasPointerCapture(e.pointerId))figure.releasePointerCapture(e.pointerId)}
  figure.addEventListener('pointerup',end);figure.addEventListener('pointercancel',end);figure.addEventListener('pointerleave',()=>figure.style.setProperty('--look','0deg'));
  figure.addEventListener('click',()=>{if(suppressClick){suppressClick=false;return;}react()});
  figure.addEventListener('keydown',e=>{if(e.key.startsWith('Arrow')){e.preventDefault();position(state.position.x+({ArrowLeft:-16,ArrowRight:16}[e.key]||0),state.position.y+({ArrowUp:-16,ArrowDown:16}[e.key]||0))}});
  settings.onclick=()=>menuState(menu.hidden);reveal.onclick=()=>hide(false);
  menu.onclick=e=>{const a=e.target.closest('[data-action]')?.dataset.action;if(!a)return;if(a==='voice'){state.voiceEnabled=!state.voiceEnabled;store.set('sky.voice',state.voiceEnabled);if(!state.voiceEnabled)clearMessage();labels()}if(a==='subtitles'){state.subtitles=!state.subtitles;store.set('sky.subtitles',state.subtitles);bubble.hidden=!state.subtitles||!state.reading;labels()}if(a==='repeat'&&state.message){const m=state.message;message(m.text,m.index,m.expr)}if(a==='hide')hide(true);if(a==='reset')resetPosition();menuState(false)};
  document.addEventListener('keydown',e=>{if(e.key==='Escape')menuState(false)});
  document.addEventListener('pointerdown',e=>{if(!root.contains(e.target))menuState(false)});
  window.addEventListener('resize',layout);document.addEventListener('visibilitychange',()=>{if(document.hidden)clearMessage();sync()});reduced.addEventListener('change',sync);
  window.addEventListener('sim:step',e=>{const d=e.detail;if(!d)return;const id=d.id;const index=d.end?9:maps[d.mode]?.[id]??null;message(d.end?d.text:(guias[d.mode]?.[id]||d.text),index,d.end?'contento':['ram','psu','bat'].includes(id)?'nervioso':'pensando');if(d.end)react('contento')});
  window.addEventListener('sim:installed',()=>react('contento'));window.addEventListener('sim:reset',()=>{clearMessage();state.message=null;state.expression='feliz'});
  window.SKY={hablando:()=>state.reading,voz:()=>state.voiceEnabled,subtitulos:()=>state.subtitles,decir:(text,expr)=>message(text,null,expr),detener:clearMessage,suspender:()=>{state.suspended=true;clearMessage();menuState(false);sync()},reanudar:()=>{state.voiceEnabled=store.get('sky.voice',true);state.subtitles=store.get('sky.subtitles',true);state.hidden=store.get('sky.hidden',false);state.suspended=false;labels();sync()},mostrar:()=>hide(false),ocultar:()=>hide(true),resetearPosicion:resetPosition,repetir:()=>{if(state.message){const m=state.message;message(m.text,m.index,m.expr)}},alternarVoz:()=>{state.voiceEnabled=!state.voiceEnabled;store.set('sky.voice',state.voiceEnabled);if(!state.voiceEnabled)clearMessage();labels();return state.voiceEnabled},saludar:()=>message(lines[0],0,'feliz')};
      function line(points, w = 8) {
        ctx.lineWidth = w;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(...points[0]);
        for (let i = 1; i < points.length; i++) ctx.lineTo(...points[i]);
        ctx.stroke();
      }
      function arc(cx, cy, rx, ry, a1, a2, w = 8) {
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, a1, a2);
        ctx.stroke();
      }
      function eye(x, y, rx, ry, blink) {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, Math.max(3, ry * blink), 0, 0, Math.PI * 2);
        ctx.fill();
        if (blink > 0.5) {
          ctx.fillStyle = "rgba(246,255,255,.94)";
          ctx.beginPath();
          ctx.ellipse(
            x + rx * 0.28,
            y - ry * 0.38,
            rx * 0.25,
            ry * 0.25,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.fillStyle = "#42f7ff";
        }
      }
      function draw(t) {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.save(); ctx.scale(cvs.width / 1254, cvs.height / 1254);
        if (portrait.complete && portrait.naturalWidth) ctx.drawImage(portrait,0,0,1254,1254);
        const c = defs[state.expression];
        let blink = t % 4.3 > 4.16 ? 0.06 : 1;
        if (c.eyes === "closed") blink = 0.08;
        ctx.save();
        ctx.shadowColor = "#15dcff";
        ctx.shadowBlur = 16;
        ctx.fillStyle = "#3cf3ff";
        ctx.strokeStyle = "#35eaff";
        const leftX = 515,
          rightX = 725,
          baseY = 482;
        const drawCheeks = (alpha = 0.16) => {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#72eaff";
          ctx.beginPath();
          ctx.ellipse(448, 548, 14, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(804, 555, 14, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          ctx.fillStyle = "#3cf3ff";
          ctx.strokeStyle = "#35eaff";
        };

        if (c.eyes === "laugh") {
          arc(leftX, 478, 34, 22, Math.PI * 1.04, Math.PI * 1.96, 12);
          arc(rightX, 478, 34, 22, Math.PI * 1.04, Math.PI * 1.96, 12);
        } else if (c.eyes === "closed") {
          arc(leftX, 485, 38, 13, Math.PI * 1.05, Math.PI * 1.95, 10);
          arc(rightX, 485, 38, 13, Math.PI * 1.05, Math.PI * 1.95, 10);
        } else if (c.eyes === "angry") {
          eye(leftX, baseY, 26, 30, blink);
          eye(rightX, baseY, 26, 30, blink);
        } else if (c.eyes === "curious") {
          eye(leftX, 474, 25, 38, blink);
          eye(rightX, 488, 29, 31, blink);
        } else if (c.eyes === "worried") {
          eye(leftX, 486, 24, 32, blink);
          eye(rightX, 486, 24, 32, blink);
        } else if (c.eyes === "round") {
          eye(leftX, baseY, 36, 46, blink);
          eye(rightX, baseY, 36, 46, blink);
        } else if (c.eyes === "sad") {
          eye(leftX, 488, 24, 36, blink);
          eye(rightX, 488, 24, 36, blink);
        } else if (c.eyes === "happy") {
          arc(leftX, 476, 35, 25, Math.PI * 1.03, Math.PI * 1.97, 13);
          arc(rightX, 476, 35, 25, Math.PI * 1.03, Math.PI * 1.97, 13);
        } else {
          eye(leftX, baseY, 28, 50, blink);
          eye(rightX, baseY, 28, 50, blink);
        }

        if (c.brow !== "none") {
          ctx.shadowBlur = 8;
          if (c.brow === "angry") {
            line(
              [
                [486, 401],
                [548, 420],
              ],
              9,
            );
            line(
              [
                [702, 420],
                [760, 399],
              ],
              9,
            );
          } else if (c.brow === "sad") {
            line(
              [
                [484, 398],
                [545, 386],
              ],
              8,
            );
            line(
              [
                [705, 386],
                [763, 398],
              ],
              8,
            );
          } else if (c.brow === "worried") {
            arc(516, 392, 28, 9, Math.PI * 1.06, Math.PI * 1.93, 8);
            arc(738, 392, 28, 9, Math.PI * 1.06, Math.PI * 1.93, 8);
          } else if (c.brow === "curious") {
            arc(516, 389, 26, 8, Math.PI * 1.06, Math.PI * 1.93, 8);
            line(
              [
                [704, 397],
                [760, 390],
              ],
              8,
            );
          } else {
            arc(
              520,
              c.brow === "raised" ? 382 : 399,
              34,
              12,
              Math.PI * 1.1,
              Math.PI * 1.9,
              9,
            );
            arc(
              739,
              c.brow === "raised" ? 384 : 402,
              34,
              12,
              Math.PI * 1.1,
              Math.PI * 1.9,
              9,
            );
          }
        }

        ctx.shadowBlur = 12;
        let mouth = state.speaking
          ? ["smallo", "open", "tiny", "open"][Math.floor(t * 9) % 4]
          : c.mouth;
        if (mouth === "o") {
          ctx.beginPath();
          ctx.ellipse(625, 547, 12, 17, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (mouth === "smallo") {
          ctx.beginPath();
          ctx.ellipse(625, 546, 10, 12, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (mouth === "open") {
          ctx.beginPath();
          ctx.ellipse(625, 548, 18, 12, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (mouth === "smile") {
          arc(624, 536, 30, 18, 0.18, Math.PI - 0.18, 9);
        } else if (mouth === "softsmile") {
          arc(625, 541, 18, 9, 0.22, Math.PI - 0.22, 7);
        } else if (mouth === "frown") {
          arc(625, 560, 22, 13, Math.PI * 1.12, Math.PI * 1.88, 8);
        } else if (mouth === "flat") {
          line(
            [
              [610, 545],
              [640, 545],
            ],
            7,
          );
        } else if (mouth === "zigzag") {
          line(
            [
              [600, 542],
              [612, 549],
              [625, 542],
              [638, 549],
              [650, 542],
            ],
            7,
          );
        } else {
          ctx.beginPath();
          ctx.moveTo(614, 540);
          ctx.quadraticCurveTo(625, 538, 636, 540);
          ctx.quadraticCurveTo(636, 551, 625, 554);
          ctx.quadraticCurveTo(614, 551, 614, 540);
          ctx.fill();
        }

        if (["feliz", "contento", "pensando"].includes(state.expression))
          drawCheeks(state.expression === "contento" ? 0.18 : 0.12);
        if (state.expression === "triste") {
          drawCheeks(0.08);
          ctx.save();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.ellipse(782, 565, 5, 11, 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        ctx.save();
        ctx.fillStyle = "#78eaff";
        ctx.shadowColor = "#15dcff";
        ctx.shadowBlur = 10;
        if (state.expression === "pensando" && !state.speaking) {
          ctx.font = "700 42px system-ui";
          ctx.fillText(
            "?",
            846 + Math.sin(t * 1.5) * 4,
            354 + Math.cos(t * 1.8) * 3,
          );
        }
        if (state.expression === "nervioso" && !state.speaking) {
          ctx.font = "700 40px system-ui";
          ctx.fillText("!", 850, 351 + Math.sin(t * 2) * 2);
        }
        if (state.expression === "contento" && !state.speaking) {
          ctx.font = "700 30px system-ui";
          ctx.fillText("♥", 847, 350);
          ctx.fillText("♥", 885, 378);
        }
        if (state.expression === "dormido" && !state.speaking) {
          ctx.font = "bold 42px system-ui";
          ctx.fillText("Z", 865 + Math.sin(t) * 10, 325 - ((t * 12) % 65));
        }
        ctx.restore();
        ctx.restore();
      }

  function loop(now){state.frame=0;if(!active())return;if(now-lastDraw>=1000/30){draw(reduced.matches?0:now/1000);lastDraw=now;}state.frame=requestAnimationFrame(loop)}
  portrait.onload=()=>{if(active())draw(0)};labels();sync();
})();
