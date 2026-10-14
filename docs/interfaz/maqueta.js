(function(){
 'use strict';
 const byId=id=>document.getElementById(id),theme=document.body.dataset.theme;
 const pc=[
  ['Coloca la fuente','Alinea los cuatro agujeros de la fuente con el gabinete.','El ventilador debe orientarse hacia la rejilla. Fija los cuatro tornillos sin forzar la carcasa.'],
  ['Instala la placa madre','Alinea los puertos y apoya la placa sobre los separadores.','Los separadores evitan que la placa toque directamente el gabinete. Comprueba la alineación antes de atornillar.'],
  ['Coloca el procesador','Alinea el triángulo y cierra la palanca del zócalo.','Apoya el procesador sin presionarlo. Sus contactos son delicados; no toques la superficie inferior.'],
  ['Fija la refrigeración','Coloca la bomba sobre el procesador y fija el radiador.','Sigue las indicaciones de pasta térmica y ajusta los tornillos en cruz. Conecta los ventiladores.'],
  ['Instala la RAM','Alinea la muesca y presiona.','Presiona ambos extremos hasta que las pestañas encajen. Repite con los cuatro módulos. La orientación de la muesca evita insertarlos al revés.'],
  ['Instala el SSD','Introduce el SSD inclinado y asegúralo con su tornillo.','Retira el disipador de la ranura M.2 y vuelve a colocarlo después de fijar la unidad.'],
  ['Coloca la tarjeta gráfica','Alinea la tarjeta con la ranura PCIe y presiónala con cuidado.','Comprueba el cierre de la ranura, fija la tarjeta al gabinete y conecta su alimentación.'],
  ['Cierra el gabinete','Apoya el panel de vidrio en sus guías y asegúralo.','Deja el cierre del gabinete para después de revisar las conexiones internas.'],
  ['Conecta el teclado','Conecta su cable USB a un puerto del gabinete.','La ruta del cable debe dejar libre el espacio de trabajo.'],
  ['Conecta el mouse','Utiliza otro puerto USB del gabinete.','Comprueba que el cable permita mover el mouse con comodidad.'],
  ['Conecta el monitor','Conecta el cable de vídeo a la tarjeta gráfica.','Utiliza HDMI o DisplayPort y conecta la alimentación del monitor.'],
  ['Conecta los parlantes','Colócalos a ambos lados del monitor y conecta el audio.','Revisa también la alimentación de los parlantes.'],
  ['Enciende el equipo','Revisa las conexiones y enciende tu computadora.','El simulador representa un montaje educativo. Sigue siempre el manual de cada equipo real.']
 ];
 const laptop=[['Reconoce el chasis','Identifica los soportes y puntos de fijación del equipo.'],['Instala la placa base','Alinea sus puertos con las aberturas del chasis.'],['Identifica el procesador','La CPU BGA está soldada a la placa.'],['Coloca la memoria RAM','Inserta el SO-DIMM inclinado y baja el módulo hasta encajar.'],['Instala el SSD','Introduce la unidad M.2 y fija el tornillo de soporte.'],['Fija la refrigeración','Apoya los heatpipes sobre CPU y GPU.'],['Coloca la batería','Revisa su posición y la conexión del arnés.'],['Cierra la cubierta','Revisa el teclado y el touchpad antes de cerrar.'],['Fija la pantalla','Alinea las bisagras y revisa el cable de vídeo.'],['Enciende la laptop','Revisa todas las conexiones antes de encender.']];
 let equipment='pc',step=4,view='paso',exploded=false,idleTimer;
 const steps=()=>equipment==='pc'?pc:laptop;
 function wake(){document.body.dataset.idle='false';clearTimeout(idleTimer);const keyboardFocus=document.activeElement?.matches(':focus-visible')&&document.activeElement?.closest('.stage-ui');if(view==='paso'&&!document.querySelector('dialog[open]')&&!byId('more').open&&byId('piece-tip').hidden&&byId('sky-message').hidden&&!keyboardFocus)idleTimer=setTimeout(()=>document.body.dataset.idle='true',3000)}
 function render(){
  const items=steps(),item=items[step];document.body.dataset.view=view;
  byId('intro').hidden=view!=='inicio';byId('chrome').hidden=view==='inicio'||view==='final';byId('viewport').hidden=view==='inicio'||view==='final';byId('step-card').hidden=view!=='paso';byId('gallery-bar').hidden=view!=='galeria';byId('finished').hidden=view!=='final';byId('sky').hidden=view==='inicio'||view==='final'||!byId('sky-visible').checked;
  byId('equipment').textContent=equipment==='pc'?'Ensamblaje PC':'Ensamblaje laptop';
  byId('progress-label').textContent=view==='galeria'?'Galería de piezas':view==='final'?'Equipo completo':'Paso '+(step+1)+' de '+items.length;
  byId('progress').style.setProperty('--completed',((step+1)/items.length*100)+'%');
  byId('segments').innerHTML=items.map((s,i)=>'<li><button class="'+(i<step?'done':'')+'" data-step="'+i+'" aria-label="Paso '+(i+1)+': '+s[0]+'"'+(i===step?' aria-current="step"':'')+'>'+(i+1)+'</button></li>').join('');
  byId('segments').hidden=view!=='paso';
  byId('step-number').textContent='Paso '+(step+1)+' de '+items.length;byId('step-title').textContent=item[0];byId('instruction').textContent=item[1];byId('details-copy').textContent=item[2]||item[1];
  byId('previous').disabled=step===0;byId('next').textContent=step===items.length-1?'Terminar':'Siguiente pieza';
  byId('hotspot').hidden=view!=='paso';byId('guide').hidden=view!=='paso';byId('hotspot').textContent=String(step+1).padStart(2,'0');
  byId('hotspot').setAttribute('aria-label','Ver información: '+item[0]);byId('piece-tip-title').textContent=item[0];byId('piece-tip-copy').textContent=item[1];
  byId('hotspot').setAttribute('aria-expanded',String(!byId('piece-tip').hidden));byId('sky-button').setAttribute('aria-expanded',String(!byId('sky-message').hidden));
  byId('scene-image').src=view==='galeria'?'assets/ram-'+theme+(exploded?'-despiece':'')+'.png':'assets/'+(equipment==='pc'?'estudio':'laptop')+'-'+theme+'.png';
  byId('scene-image').alt=view==='galeria'?'Vista de los cuatro módulos de memoria RAM':equipment==='pc'?'Modelo real de una torre de PC en ensamblaje':'Modelo real de laptop con componentes internos visibles';
  byId('gallery-markers').hidden=view!=='galeria'||!exploded;byId('explode').textContent=exploded?'Reunir módulos':'Separar módulos';byId('explode').setAttribute('aria-pressed',String(exploded));
  byId('steps-list').innerHTML=items.map((s,i)=>'<li><button data-step="'+i+'" class="'+(i===step?'current':'')+'">'+(i+1)+'. '+s[0]+'</button></li>').join('');
  byId('piece-count').textContent=equipment==='pc'?'12':'9';
  wake();
 }
 function changeView(next){document.querySelectorAll('dialog[open]').forEach(d=>d.close());if(next!=='paso')document.body.dataset.presentation='false';view=next;byId('piece-tip').hidden=true;byId('sky-message').hidden=true;byId('sky-button').setAttribute('aria-expanded','false');byId('hotspot').setAttribute('aria-expanded','false');byId('more').open=false;render()}
 function advance(direction){if(view!=='paso')return;if(direction>0&&step===steps().length-1){changeView('final');return}step=Math.max(0,Math.min(steps().length-1,step+direction));byId('piece-tip').hidden=true;byId('more').open=false;render()}
 document.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button)return;
  if(button.dataset.step!==undefined){step=Number(button.dataset.step);byId('steps-dialog').close();changeView('paso');return}
  if(button.dataset.equipment){equipment=button.dataset.equipment;step=0;changeView('paso');return}
  switch(button.dataset.action){
   case 'inicio':changeView('inicio');break;
   case 'menu':byId('menu-dialog').showModal();wake();break;
   case 'close':button.closest('dialog').close();wake();break;
   case 'pasos':byId('menu-dialog').close();byId('steps-dialog').showModal();wake();break;
   case 'gallery':byId('menu-dialog').close();exploded=false;changeView('galeria');break;
   case 'mounting':changeView('paso');break;
   case 'next':advance(1);break;
   case 'previous':advance(-1);break;
   case 'piece':byId('piece-tip').hidden=!byId('piece-tip').hidden;button.setAttribute('aria-expanded',String(!byId('piece-tip').hidden));wake();break;
   case 'help':byId('more').open=!byId('more').open;wake();break;
   case 'sky':byId('sky-message').hidden=!byId('sky-message').hidden;button.setAttribute('aria-expanded',String(!byId('sky-message').hidden));wake();break;
   case 'sky-close':byId('sky-message').hidden=true;byId('sky-button').setAttribute('aria-expanded','false');byId('sky-button').focus();wake();break;
   case 'explode':exploded=!exploded;render();break;
   case 'restart':step=0;changeView('paso');break;
   case 'presentation':byId('menu-dialog').close();document.body.dataset.presentation=String(document.body.dataset.presentation!=='true');changeView('paso');break;
  }
 });
 document.addEventListener('keydown',e=>{
  if(e.target.matches('input,select,textarea'))return;
  if(e.key==='Escape'){byId('piece-tip').hidden=true;byId('sky-message').hidden=true;byId('hotspot').setAttribute('aria-expanded','false');byId('sky-button').setAttribute('aria-expanded','false');document.body.dataset.presentation='false';wake()}
  if((e.key==='/'||e.key==='?')&&!document.querySelector('dialog[open]')){e.preventDefault();byId('menu-dialog').showModal();wake()}
  if(document.body.dataset.presentation==='true'&&!document.querySelector('dialog[open]')){
   if(e.key==='ArrowRight'||(e.key===' '&&!e.target.closest('button,summary,a'))){e.preventDefault();advance(1)}if(e.key==='ArrowLeft'){e.preventDefault();advance(-1)}
  }
 });
 byId('camera').addEventListener('change',e=>byId('viewport').dataset.camera=e.target.value);
 byId('sky-visible').addEventListener('change',render);
 document.addEventListener('pointermove',wake);document.addEventListener('focusin',wake);document.addEventListener('focusout',()=>setTimeout(wake,0));byId('more').addEventListener('toggle',wake);document.querySelectorAll('dialog').forEach(d=>d.addEventListener('close',wake));
 const initial=new URLSearchParams(location.search).get('pantalla');if(['inicio','galeria','final'].includes(initial))view=initial;if(view==='galeria')exploded=true;
 render();
})();
