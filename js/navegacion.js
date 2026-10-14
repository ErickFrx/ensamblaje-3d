(function(){
'use strict';
const intro=document.getElementById('intro');let frame=null;let route='inicio';let quality=true;let classroom=false;let welcomed=false;
try{quality=JSON.parse(localStorage.getItem('sim.light')??'true')===true;classroom=JSON.parse(localStorage.getItem('sim.aula')??String(!quality))===true}catch{}
const nav=document.createElement('nav');nav.id='sim-nav';nav.setAttribute('aria-label','Cambiar simulador');nav.innerHTML='<button data-route="inicio" aria-label="Volver al inicio">← Inicio</button><button data-route="pc">PC</button><button data-route="laptop">Laptop</button><button id="sim-help" aria-label="Ayuda del simulador">?</button><button id="sim-aula" aria-pressed="false">Aula: NO</button><button id="sim-quality" aria-pressed="true" title="Reduce resolución y efectos; el aula se controla por separado">Modo: ligero</button>';document.body.appendChild(nav);
const help=document.createElement('dialog');help.id='sim-help-dialog';help.innerHTML='<h2>Cómo usar el simulador</h2><p>Arrastra el equipo para girarlo. Usa la rueda o separa dos dedos para acercar la vista.</p><p><b>Siguiente</b> añade una etapa; <b>Anterior</b> retrocede. <b>Auto</b> espera a la guía antes de avanzar. <b>Reiniciar</b> vuelve al estado inicial.</p><p>En <b>Galería de piezas</b> puedes girar y separar las capas de cada componente. El modelo de laptop es educativo y genérico.</p><p>Toca a Sky para que reaccione; arrástrala para moverla. Su engranaje permite cambiar voz, subtítulos y posición. Con el teclado, enfoca Sky y usa las flechas para moverla.</p><p>Al cambiar de equipo se conserva el montaje durante esta sesión. Volver al inicio pausa la actividad; recargar reinicia el montaje.</p><form method="dialog"><button>Cerrar ayuda</button></form>';document.body.appendChild(help);
document.getElementById('sim-help').onclick=()=>help.showModal();
function setActive(w,on){
 if(w!==window){w.postMessage({type:'sim:controls',active:on},'*');return}
 window.SIM_ACTIVE=on;window.dispatchEvent(new CustomEvent('sim:visibility',{detail:on}));
 if(window.SKY){if(on&&!window.SIM_GALLERY)SKY.reanudar();else SKY.suspender()}
}
function applyQuality(w=window){
 if(w!==window){w.postMessage({type:'sim:controls',light:quality,classroom},'*');return}
 window.SIM_LIGHT=quality;window.SIM_AULA=classroom;
 window.dispatchEvent(new CustomEvent('sim:quality',{detail:quality}));window.dispatchEvent(new CustomEvent('sim:aula',{detail:classroom}));
}
function applyClassroom(){
 window.SIM_AULA=classroom;window.dispatchEvent(new CustomEvent('sim:aula',{detail:classroom}));
 if(frame)frame.contentWindow.postMessage({type:'sim:controls',classroom},'*');
}
function syncClassroom(value){
 classroom=Boolean(value);try{localStorage.setItem('sim.aula',JSON.stringify(classroom))}catch{}
 label();applyClassroom();
}
function apply(){
 route=['pc','laptop'].includes(location.hash.slice(1))?location.hash.slice(1):'inicio';
 document.body.dataset.route=route;intro.hidden=route!=='inicio';nav.hidden=route==='inicio';
 intro.querySelector('video')?.[route==='inicio'?'play':'pause']()?.catch?.(()=>{});
 setActive(window,route==='pc');if(route==='pc'&&window.SKY&&!welcomed){welcomed=true;window.SKY.saludar()}
 if(route==='laptop'&&!frame){frame=document.createElement('iframe');frame.id='laptop-view';frame.title='Simulador de ensamblaje de laptop';frame.src='ensamblaje3d_con_laptop/ensamblaje3d/laptop.html';frame.allow='autoplay';frame.onload=()=>{setActive(frame.contentWindow,route==='laptop');applyQuality(frame.contentWindow)};document.body.appendChild(frame)}
 if(frame){frame.hidden=route!=='laptop';setActive(frame.contentWindow,route==='laptop')}
 nav.querySelectorAll('[data-route]').forEach(b=>b.setAttribute('aria-current',b.dataset.route===route?'page':'false'));
}
function go(r){if(location.hash==='#'+r){apply();return}history.pushState({sim:r},'', '#'+r);apply()}
window.SIM_ROUTER={go};window.addEventListener('popstate',apply);window.addEventListener('hashchange',apply);
nav.onclick=e=>{const r=e.target.dataset.route;if(r)go(r)};
document.getElementById('intro-laptop').onclick=e=>{e.preventDefault();go('laptop')};
const q=document.getElementById('sim-quality'),a=document.getElementById('sim-aula');function label(){q.textContent=quality?'Modo: ligero':'Modo: completo';q.setAttribute('aria-pressed',String(quality));a.textContent=classroom?'Aula: SÍ':'Aula: NO';a.setAttribute('aria-pressed',String(classroom))}q.onclick=()=>{quality=!quality;try{localStorage.setItem('sim.light',JSON.stringify(quality))}catch{}label();applyQuality();if(frame)applyQuality(frame.contentWindow)};
a.onclick=()=>syncClassroom(!classroom);
window.addEventListener('sim:aula:changed',e=>syncClassroom(e.detail));
window.addEventListener('sim:ready',()=>{applyQuality();apply()});window.addEventListener('sim:loaded',()=>{applyQuality();apply()});
window.addEventListener('message',e=>{if(!frame||e.source!==frame.contentWindow)return;if(e.data==='sim:inicio')go('inicio');if(e.data?.type==='sim:aula:changed'&&typeof e.data.visible==='boolean')syncClassroom(e.data.visible)});
history.replaceState({sim:location.hash.slice(1)||'inicio'},'',location.hash||'#inicio');label();apply();
})();
