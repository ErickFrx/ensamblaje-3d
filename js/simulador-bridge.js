/* Explicit messages work for same-origin HTTP and isolated file:// frames. */
(function(){
  window.addEventListener('message',e=>{
    if(window.parent===window||e.source!==window.parent||e.data?.type!=='sim:controls')return;
    const d=e.data;
    if(typeof d.active==='boolean'){
      window.SIM_ACTIVE=d.active;window.dispatchEvent(new CustomEvent('sim:visibility',{detail:d.active}));
      if(window.SKY){if(d.active&&!window.SIM_GALLERY)SKY.reanudar();else SKY.suspender()}
    }
    if(typeof d.light==='boolean'){window.SIM_LIGHT=d.light;window.dispatchEvent(new CustomEvent('sim:quality',{detail:d.light}))}
    if(typeof d.classroom==='boolean'){window.SIM_AULA=d.classroom;window.dispatchEvent(new CustomEvent('sim:aula',{detail:d.classroom}))}
  });
})();
