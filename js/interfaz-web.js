/* Presentation only: reuse the original controls without changing either 3D engine. */
(() => {
  'use strict';
  const laptop = document.body.classList.contains('laptop-mode');
  const create = (tag, className, html) => {
    const node = document.createElement(tag);
    node.className = className;
    if (html) node.innerHTML = html;
    return node;
  };
  const assembly = document.querySelector('#panel');
  assembly.dataset.webPanel = 'assembly';
  assembly.querySelector('h1').textContent=laptop?'Ensamblaje de laptop':'Ensamblaje de PC';
  document.querySelectorAll('#panel').forEach((panel, i) => {
    if (i) {panel.dataset.webPanel = 'gallery';panel.querySelector('h1').textContent='Galería de piezas';}
  });
  const settings = assembly.querySelector('.toolbar-options');
  if (settings) {
    const accordion = create('details', 'web-settings', '<summary><span>Ajustes y herramientas</span><span aria-hidden="true">⌄</span></summary>');
    settings.before(accordion);
    accordion.append(settings);
  }
  const meter = create('div', 'web-sidebar-meter', '<div><span>Tu progreso</span><strong>0%</strong></div><div class="web-meter-track" role="progressbar" aria-label="Progreso de ensamblaje" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>');
  const list = document.getElementById('lista');
  list.before(meter);
  const heading = create('div', 'web-section-heading', '<span>Ruta de ensamblaje</span><span></span>');
  list.before(heading);
  const steps = [...list.querySelectorAll('.paso')];
  heading.lastElementChild.textContent = steps.length + ' etapas';
  steps.forEach((step, i) => {
    step.childNodes.forEach(node=>{if(node.nodeType===Node.TEXT_NODE)node.textContent=node.textContent.replace(/^\d+\s*[.·]\s*/, '');});
    step.dataset.webNumber = String(i + 1).padStart(2, '0');
    step.title = 'Ir a ' + step.textContent.trim();
  });
  const stage = create('div', 'web-stage', '<div class="web-stage-top"><div><span class="web-eyebrow">ESPACIO INTERACTIVO</span><h2></h2></div><span class="web-stage-hint"><span aria-hidden="true">↔</span> Arrastra para explorar · Rueda para acercar</span></div>');
  stage.querySelector('h2').textContent = laptop ? 'Tu laptop, pieza a pieza' : 'Tu PC, pieza a pieza';
  document.body.append(stage);
  const backdrop = create('button', 'web-drawer-backdrop');
  backdrop.type = 'button';
  backdrop.setAttribute('aria-label', 'Cerrar panel de pasos');
  backdrop.onclick = () => drawer(false);
  document.body.append(backdrop);
  let drawerButton;
  function drawer(open) {
    const wasOpen=document.body.classList.contains('web-drawer-open');
    document.body.classList.toggle('web-drawer-open', open);
    if (open) {
      assembly.classList.remove('min', 'collapsed');
      assembly.querySelector('button:not(:disabled)')?.focus();
      list.querySelector('.paso.act')?.scrollIntoView({block:'nearest'});
    }
    drawerButton?.setAttribute('aria-expanded', String(open));
    if (laptop) parent.postMessage({type:'sim:web:drawer-state', open}, '*');
    if (!open && wasOpen) drawerButton?.focus();
  }
  const mobileSettings = create('div', 'web-mobile-settings');
  const globalIds = ['sim-aula','sim-quality','sim-help'];
  globalIds.forEach(id => {
    const button=create('button','web-global-option');
    button.type='button';button.dataset.control=id;
    button.textContent={'sim-aula':'Aula','sim-quality':'Calidad','sim-help':'Ayuda'}[id];
    button.onclick=()=>{
      if(laptop)parent.postMessage({type:'sim:web:global-control',id},'*');
      else document.getElementById(id)?.click();
    };
    mobileSettings.append(button);
  });
  assembly.append(mobileSettings);
  const applyGlobalLabels = controls => {
    mobileSettings.querySelectorAll('button').forEach(button=>{
      const state=controls[button.dataset.control];if(!state)return;
      button.textContent=state.label;
      if(state.pressed!==null)button.setAttribute('aria-pressed',state.pressed);
    });
  };
  if (!laptop) {
    const header = create('header', 'web-header', '<a class="web-brand" href="#inicio" aria-label="Volver al inicio"><span class="web-brand-icon" aria-hidden="true">▣</span><span>Ensamblaje<span class="web-brand-sub">Laboratorio virtual</span></span></a><div class="web-header-divider"></div><span class="web-course">Aprende. Explora. Construye.</span><div class="web-header-nav"></div><button class="web-drawer-toggle" type="button" aria-expanded="false" aria-label="Abrir pasos y controles">☰ <span>Pasos</span></button>');
    const nav = document.getElementById('sim-nav');
    header.querySelector('.web-header-nav').append(nav);
    const logo = document.getElementById('logo-universidad');
    if (logo) {
      logo.classList.add('web-university');
      header.querySelector('.web-header-divider').after(logo);
    }
    document.body.append(header);
    header.querySelector('.web-brand').onclick = e => {e.preventDefault();window.SIM_ROUTER.go('inicio');};
    drawerButton = header.querySelector('.web-drawer-toggle');
    const frame = () => document.getElementById('laptop-view');
    drawerButton.onclick = () => {
      const open = drawerButton.getAttribute('aria-expanded') !== 'true';
      if (document.body.dataset.route === 'laptop') frame()?.contentWindow.postMessage({type:'sim:web:drawer', open}, '*');
      else drawer(open);
    };
    const globalLabels=()=>Object.fromEntries(globalIds.map(id=>{const b=document.getElementById(id);return [id,{label:b.textContent,pressed:b.getAttribute('aria-pressed')}]}));
    const syncGlobals=()=>{const controls=globalLabels();applyGlobalLabels(controls);frame()?.contentWindow.postMessage({type:'sim:web:global-state',controls},'*');};
    globalIds.forEach(id=>new MutationObserver(syncGlobals).observe(document.getElementById(id),{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-pressed']}));
    syncGlobals();
    window.addEventListener('message', e => {
      if (e.source !== frame()?.contentWindow) return;
      if(e.data?.type==='sim:web:drawer-state'){drawerButton.setAttribute('aria-expanded', String(e.data.open));if(!e.data.open)drawerButton.focus();}
      if(e.data?.type==='sim:web:global-control'&&globalIds.includes(e.data.id))document.getElementById(e.data.id)?.click();
      if(e.data?.type==='sim:web:request-controls')syncGlobals();
    });
    new MutationObserver(() => {drawer(false);}).observe(document.body, {attributes:true, attributeFilter:['data-route']});
    const intro = document.getElementById('intro');
    intro.classList.add('eligiendo');
    document.getElementById('intro-elegir').classList.add('visible');
    intro.querySelector('h1').innerHTML = 'Construye tu equipo.<br><span>Descubre cómo funciona.</span>';
    intro.querySelector('.intro-sub').textContent = 'Una experiencia 3D para aprender, explorar y ensamblar a tu ritmo.';
    intro.querySelector('.intro-pregunta').textContent = 'Elige tu experiencia';
    for (const [id, text] of [['intro-pc','Explorar PC →'],['intro-laptop','Explorar laptop →']]) {
      document.getElementById(id).append(create('span', 'web-choice-action', text));
    }
  } else {
    window.addEventListener('message', e => {
      if(e.source!==parent)return;
      if(e.data?.type==='sim:web:drawer'&&typeof e.data.open==='boolean')drawer(e.data.open);
      if(e.data?.type==='sim:web:global-state')applyGlobalLabels(e.data.controls);
    });
  }
  if(laptop)parent.postMessage({type:'sim:web:request-controls'},'*');
  document.addEventListener('keydown', e => {
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)&&e.target.closest('#panel, #detalle-pieza, #info, .web-header'))e.stopPropagation();
    if(e.key==='Tab'&&document.body.classList.contains('web-drawer-open')){
      const controls=[...assembly.querySelectorAll('button:not(:disabled), input, summary, [tabindex="0"]')].filter(node=>node.getClientRects().length);
      const first=controls[0],last=controls[controls.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
    }
    if (e.key === 'Escape' && document.body.classList.contains('web-drawer-open')) drawer(false);
  });
  assembly.addEventListener('click', e => {
    if (matchMedia('(max-width: 900px)').matches && e.target.closest('.paso, #panel-toggle')) drawer(false);
  });
  let lastActive=null;
  const dockFill = document.getElementById('dock-progress-fill');
  const sync = () => {
    const width = dockFill.style.width || '0%';
    const fraction=Math.max(0,Math.min(1,(parseFloat(width)||0)/100));
    meter.querySelector('.web-meter-track').setAttribute('aria-valuenow',String(Math.round(fraction*100)));
    const transform='scaleX('+fraction+')';
    if(meter.querySelector('i').style.transform!==transform)meter.querySelector('i').style.transform=transform;
    const percent = Math.round(parseFloat(width) || 0) + '%';
    if (meter.querySelector('strong').textContent !== percent) meter.querySelector('strong').textContent = percent;
    const active = list.querySelector('.paso.act');
    if(active!==lastActive){
      if(active&&list.clientHeight)active.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
      lastActive=active;
    }
    steps.forEach(step => {
      if (step === active) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    const gallery = laptop ? document.getElementById('gallery-panel') : document.querySelector('[data-web-panel="gallery"]');
    const inGallery = gallery && (laptop ? !gallery.hidden : gallery.style.display !== 'none');
    document.body.classList.toggle('web-gallery', !!inGallery);
    const title = inGallery ? 'Explora cada componente' : laptop ? 'Tu laptop, pieza a pieza' : 'Tu PC, pieza a pieza';
    if (stage.querySelector('h2').textContent !== title) stage.querySelector('h2').textContent = title;
  };
  new MutationObserver(sync).observe(dockFill, {attributes:true, attributeFilter:['style']});
  // Do not observe aria-current: it is a presentation attribute written by sync.
  new MutationObserver(sync).observe(list, {subtree:true, attributes:true, attributeFilter:['class']});
  const gallery = laptop ? document.getElementById('gallery-panel') : document.querySelector('[data-web-panel="gallery"]');
  if (gallery) new MutationObserver(sync).observe(gallery, {attributes:true, attributeFilter:['hidden','style']});
  sync();
})();
