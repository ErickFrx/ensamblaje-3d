/* Shared presentation layer. Native engine controls keep their handlers and IDs. */
(() => {
  'use strict';
  const laptop = document.body.classList.contains('laptop-mode');
  const api = window.SIM_UI;
  if (!api) return;
  const el = (tag, id, html) => {const n=document.createElement(tag);n.id=id;if(html)n.innerHTML=html;return n;};
  const setText = (node,text) => {if(node.textContent!==text)node.textContent=text;};
  const card = el('section','ui-step-card','<div class="ui-step-heading"><span id="ui-step-label" aria-live="polite"></span><button id="ui-step-help" aria-label="Ver instrucciones">?</button></div><h2 id="ui-step-title"></h2><p id="ui-step-copy"></p><div id="ui-step-actions"></div>');
  card.setAttribute('aria-label','Paso del ensamblaje');
  const details = el('details','ui-details','<summary>Ver más</summary><div id="ui-details-content"></div>');
  const oldInfo = document.getElementById(laptop?'info':'detalle-pieza');
  details.lastElementChild.append(oldInfo);
  const actions=card.querySelector('#ui-step-actions');
  const prev=document.getElementById('prev'), next=document.getElementById('sig');
  prev.textContent='‹';prev.setAttribute('aria-label','Paso anterior');
  next.textContent='Siguiente pieza';
  actions.append(prev,details,next);
  card.querySelector('#ui-step-help').onclick=()=>{details.open=!details.open;};
  document.body.append(card);
  const dialog=el('dialog','ui-options','<div class="ui-dialog-heading"><h2>Opciones</h2><button id="ui-close-options" aria-label="Cerrar opciones">×</button></div>');
  const bar=document.getElementById('bar');dialog.append(bar);
  document.body.append(dialog);
  dialog.querySelector('#ui-close-options').onclick=()=>dialog.close();
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  dialog.addEventListener('click',e=>{if(['gbtn','rst','ayu','qzb','modo'].includes(e.target.id))dialog.close();},true);
  let header,segments,label,remote=null,signature='';
  const frame=()=>document.getElementById('laptop-view');
  const send=data=>frame()?.contentWindow.postMessage(data,'*');
  const allowed=['auto','rst','gbtn','voice-toggle'];
  if(!laptop){
    header=el('header','ui-header','<button id="ui-home" aria-label="Volver al inicio"><img src="images/logo-universidad-ajustado.png" alt="Universidad Nacional de Cañete"><span id="ui-equipment">Ensamblaje PC</span></button><nav id="ui-progress" aria-label="Progreso del ensamblaje"><span id="ui-progress-label"></span><div id="ui-segments"></div></nav><button id="ui-menu" aria-label="Abrir opciones" aria-haspopup="dialog">⋯</button>');
    document.body.append(header);
    segments=header.querySelector('#ui-segments');label=header.querySelector('#ui-progress-label');
    header.querySelector('#ui-home').onclick=()=>window.SIM_ROUTER.go('inicio');
    header.querySelector('#ui-menu').onclick=()=>dialog.showModal();
    dialog.append(document.getElementById('sim-nav'));
    const proxies=el('div','ui-laptop-options','<h3>Controles de laptop</h3>');
    for(const [id,text] of [['auto','Auto'],['rst','Reiniciar'],['gbtn','Galería de piezas'],['voice-toggle','Voz de Sky']]){
      const b=el('button','ui-laptop-'+id);b.textContent=text;b.onclick=()=>{send({type:'sim:ui:control',id});dialog.close();};proxies.append(b);
    }
    dialog.append(proxies);
    window.addEventListener('message',e=>{if(e.source!==frame()?.contentWindow)return;if(e.data?.type==='sim:ui:state'){remote=e.data.state;update();}if(e.data?.type==='sim:ui:menu')dialog.showModal();});
    new MutationObserver(()=>{send({type:'sim:ui:request'});update();}).observe(document.body,{attributes:true,attributeFilter:['data-route']});
    const intro=document.getElementById('intro');intro?.classList.add('eligiendo');document.getElementById('intro-elegir')?.classList.add('visible');
  }else{
    window.addEventListener('message',e=>{
      if(e.source!==window.parent)return;
      if(e.data?.type==='sim:ui:control'&&allowed.includes(e.data.id))document.getElementById(e.data.id)?.click();
      if(e.data?.type==='sim:ui:jump'&&Number.isInteger(e.data.index)&&e.data.index>=0&&e.data.index<api.getState().steps.length)api.jump(e.data.index);
      if(e.data?.type==='sim:ui:request')update(true);
    });
  }
  let lastState='',lastStep='',componentWasShown=false,manualWasActive=false,lastManual=false;
  function update(force=false){
    const state=api.getState(), step=state.steps[state.index];
    document.body.classList.toggle('ui-gallery',state.gallery);
    setText(card.querySelector('#ui-step-label'),state.gallery?'Galería de piezas':state.index<0?'Listo para empezar':`Paso ${state.index+1} de ${state.steps.length}`);
    setText(card.querySelector('#ui-step-title'),state.gallery?'Explora el componente':step?.name||'Comienza el ensamblaje');
    setText(card.querySelector('#ui-step-copy'),state.gallery?'Gira la pieza o separa sus capas. Consulta su ficha en «Ver más».':state.ready===false?'Preparando el equipo…':step?.text?.replace(/<[^>]*>/g,' ')||'Avanza pieza por pieza y sigue las instrucciones de montaje.');
    prev.hidden=next.hidden=state.gallery;
    if(lastManual&&!state.manual)details.open=false;lastManual=state.manual;
    const stepKey=state.index+':'+state.gallery, changedStep=lastStep!==stepKey;
    if(changedStep){details.open=false;lastStep=stepKey;}
    const component=document.getElementById('detalle-contenido'),shown=!!component&&!component.hidden;
    if(shown&&!componentWasShown)details.open=true;componentWasShown=shown;
    const manualActive=state.manual&&oldInfo.classList.contains('pieza-activa');
    if(manualActive&&(changedStep||!manualWasActive))details.open=true;manualWasActive=manualActive;
    if(laptop){const serialized=JSON.stringify(state);if(force||serialized!==lastState){window.parent.postMessage({type:'sim:ui:state',state},'*');lastState=serialized;}return;}
    const isLaptop=document.body.dataset.route==='laptop', active=isLaptop?remote:state;
    if(bar.hidden!==isLaptop)bar.hidden=isLaptop;document.getElementById('ui-laptop-options').hidden=!isLaptop;
    document.getElementById('ui-equipment').textContent=isLaptop?'Ensamblaje Laptop':'Ensamblaje PC';
    if(!active)return;
    if(isLaptop)for(const id of allowed){const b=document.getElementById('ui-laptop-'+id);if(active.controls?.[id]){setText(b,active.controls[id].label);if(active.controls[id].pressed!==null)b.setAttribute('aria-pressed',active.controls[id].pressed);}}
    label.textContent=active.gallery?'Galería':`Paso ${Math.max(0,active.index+1)} de ${active.steps.length}`;
    const key=(isLaptop?'laptop':'pc')+active.steps.length;
    if(signature!==key){segments.replaceChildren();active.steps.forEach((s,i)=>{const b=document.createElement('button');b.textContent=i+1;b.setAttribute('aria-label',`Paso ${i+1}: ${s.name}`);b.onclick=()=>{if(document.body.dataset.route==='laptop')send({type:'sim:ui:jump',index:i});else api.jump(i);};segments.append(b);});signature=key;}
    segments.hidden=active.gallery;
    [...segments.children].forEach((b,i)=>{b.classList.toggle('done',i<active.index);if(i===active.index)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  }
  let queued=false;
  const schedule=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;update();});};
  // Watch only native information/control nodes, never the new card's own text.
  const observer=new MutationObserver(schedule);
  observer.observe(oldInfo,{subtree:true,childList:true,characterData:true,attributes:true});
  observer.observe(bar,{subtree:true,childList:true,characterData:true,attributes:true});
  const gallery=document.getElementById('gallery-panel');if(gallery)observer.observe(gallery,{attributes:true,attributeFilter:['hidden','style']});
  document.addEventListener('click',schedule);window.addEventListener('sim:step',schedule);window.addEventListener('sim:reset',schedule);
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.target.closest?.('input,textarea,select,dialog')){e.preventDefault();if(laptop)window.parent.postMessage({type:'sim:ui:menu'},'*');else dialog.showModal();}});
  R.domElement.tabIndex=0;R.domElement.setAttribute('aria-label','Vista 3D: arrastra para girar y usa la rueda para acercar');
  update();
})();
