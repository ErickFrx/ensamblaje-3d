/* Export the current PC component with embedded geometry, materials and textures. */
(function(){
  'use strict';
  async function waitForKeyboard(){
    if(P.kb.userData.modeloDetallado)return;
    window.cargarModeloTeclado();
    await new Promise((resolve,reject)=>{
      const started=Date.now();const timer=setInterval(()=>{
        if(P.kb.userData.modeloDetallado){clearInterval(timer);resolve()}
        else if(Date.now()-started>12000){clearInterval(timer);reject(new Error('No se ha cargado el teclado detallado.'))}
      },50);
    });
  }
  window.exportarPiezaGLB=async function(id){
    if(!P[id])throw new Error('Componente desconocido.');
    if(!THREE.GLTFExporter)throw new Error('No se ha cargado el exportador local.');
    if(id==='kb')await waitForKeyboard();
    const source=P[id].clone(true),ownedMaterials=[];
    function clean(node){
      node.visible=true;node.userData={};
      for(const child of [...node.children]){
        if(child.userData.hologramaManos||child.isLine||child.isPoints){node.remove(child);continue}
        if(child.isInstancedMesh){
          const group=new THREE.Group();group.name=child.name;group.position.copy(child.position);group.quaternion.copy(child.quaternion);group.scale.copy(child.scale);
          const matrix=new THREE.Matrix4();
          for(let i=0;i<child.count;i++){
            let material=child.material;
            if(child.instanceColor){material=child.material.clone();const color=new THREE.Color();child.getColorAt(i,color);material.color.multiply(color);ownedMaterials.push(material)}
            const mesh=new THREE.Mesh(child.geometry,material);child.getMatrixAt(i,matrix);mesh.applyMatrix4(matrix);group.add(mesh);
          }
          node.remove(child);node.add(group);clean(group);
        }else clean(child);
      }
    }
    clean(source);source.position.set(0,0,0);source.quaternion.identity();
    source.name='PC_'+id;source.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(source);if(bounds.isEmpty())throw new Error('La pieza no contiene geometría exportable.');
    source.position.sub(bounds.getCenter(new THREE.Vector3()));source.updateMatrixWorld(true);
    const pending=new Set();source.traverse(o=>{if(!o.isMesh)return;for(const m of [].concat(o.material))for(const value of Object.values(m)){const image=value?.isTexture?value.image:null;if(image instanceof HTMLImageElement&&!image.complete)pending.add(image.decode())}});
    try{
      await Promise.all(pending);
      return await new Promise((resolve,reject)=>new THREE.GLTFExporter().parse(source,resolve,reject,{binary:true,onlyVisible:true,maxTextureSize:2048}));
    }finally{ownedMaterials.forEach(m=>m.dispose())}
  };
})();
