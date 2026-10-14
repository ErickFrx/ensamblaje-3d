/* Adaptation of the user-supplied CC-BY-4.0 Gaming Laptop - Computer. */
window.cargarLaptopExterior=function(P,scr){
 const T=THREE,b64=window.LAPTOP_EXTERIOR_DATA,raw=atob(b64),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
 delete window.LAPTOP_EXTERIOR_DATA;
 return new Promise((resolve,reject)=>new T.GLTFLoader().parse(bytes.buffer,'',gltf=>{
  try{
   gltf.scene.updateMatrixWorld(true);
   const output={base:new T.Group(),deck:new T.Group(),lid:new T.Group()};for(const [id,g]of Object.entries(output))g.name='Exterior importado · '+id;
   const transform=new T.Matrix4().makeScale(15.6/.3432,15.6/.3432,15.6/.3432);transform.setPosition(0,-.048,-.118);
   function clipBody(g,below){
    const names=['position','normal','uv'],arrays={position:[],normal:[],uv:[]},sizes={position:3,normal:3,uv:2};
    function vertex(i){const v={};for(const name of names){const a=g.attributes[name];v[name]=Array.from({length:sizes[name]},(_,c)=>a?a.array[i*a.itemSize+c]:0)}return v}
    function lerp(a,b,t){const v={};for(const name of names)v[name]=a[name].map((x,i)=>x+(b[name][i]-x)*t);return v}
    const inside=v=>below?v.position[1]<=.82:v.position[1]>=.82;
    for(let i=0;i<g.attributes.position.count;i+=3){const polygon=[vertex(i),vertex(i+1),vertex(i+2)],out=[];const a=new T.Vector3(...polygon[0].position),b=new T.Vector3(...polygon[1].position),c=new T.Vector3(...polygon[2].position);const flat=(a.y+b.y+c.y)/3>.22&&Math.abs(b.sub(a).cross(c.sub(a)).normalize().y)>.6;if(flat){if(!below)for(const v of polygon)for(const name of names)arrays[name].push(...v[name]);continue;}for(let k=0;k<3;k++){const a=polygon[k],b=polygon[(k+1)%3],ia=inside(a),ib=inside(b);if(ia)out.push(a);if(ia!==ib)out.push(lerp(a,b,(.82-a.position[1])/(b.position[1]-a.position[1])))}
     for(let k=1;k<out.length-1;k++)for(const v of [out[0],out[k],out[k+1]])for(const name of names)arrays[name].push(...v[name]);
    }
    const result=new T.BufferGeometry();for(const name of names)result.setAttribute(name,new T.BufferAttribute(new Float32Array(arrays[name]),sizes[name]));return result;
   }
   gltf.scene.traverse(mesh=>{
    if(!mesh.isMesh)return;const name=mesh.parent.name,material=mesh.material.name==='Cristal'?scr:mesh.material;
    if(material!==scr&&material.color.r+material.color.g+material.color.b<.025){material.color.setHex(0x151b24);material.metalness=Math.min(material.metalness,.3);material.roughness=Math.max(material.roughness,.55)}
    let g=mesh.geometry.clone();if(g.index){const next=g.toNonIndexed();g.dispose();g=next}
    const matrix=new T.Matrix4().multiplyMatrices(transform,mesh.matrixWorld);g.applyMatrix4(matrix);
    if(matrix.determinant()<0)for(const a of Object.values(g.attributes))for(let i=0;i<a.count;i+=3)for(let k=0;k<a.itemSize;k++){const x=a.array[(i+1)*a.itemSize+k];a.array[(i+1)*a.itemSize+k]=a.array[(i+2)*a.itemSize+k];a.array[(i+2)*a.itemSize+k]=x}
    if(material===scr){const pos=g.attributes.position,bounds=new T.Box3().setFromBufferAttribute(pos),uv=new Float32Array(pos.count*2);for(let i=0;i<pos.count;i++){uv[i*2]=(pos.getX(i)-bounds.min.x)/(bounds.max.x-bounds.min.x);uv[i*2+1]=(pos.getY(i)-bounds.min.y)/(bounds.max.y-bounds.min.y)}g.setAttribute('uv',new T.BufferAttribute(uv,2));}
    if(/^Cuerpo[ _]Bajo/.test(name)){
     for(const [id,below]of [['base',true],['deck',false]]){const part=clipBody(g,below);if(part.attributes.position.count){const m=new T.Mesh(part,material);m.name=name;output[id].add(m)}else part.dispose()}g.dispose();return;
    }
    const bounds=new T.Box3().setFromBufferAttribute(g.attributes.position),center=bounds.getCenter(new T.Vector3());
    const id=center.y>3.5||/^(Pantalla_|WebCam_|Soportes[ _]Pantalla_|Gomas1_|LuzWeb_)/.test(name)?'lid':/^(USB|HDMI|LAN|Audio|Luz[123]_)/.test(name)?'base':'deck';
    const m=new T.Mesh(g,material);m.name=name;output[id].add(m);
   });
   for(const [id,group]of Object.entries(output)){
    if(!group.children.length)throw new Error('No se pudo separar '+id+' del modelo.');
    // Merge static surfaces sharing a material. Preserve UVs for the source textures.
    const buckets=new Map();for(const mesh of group.children){const key=mesh.material;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(mesh.geometry)}group.clear();
    for(const [material,geos]of buckets){const merged=new T.BufferGeometry();for(const [name,size]of [['position',3],['normal',3],['uv',2]]){let count=0;for(const g of geos)count+=g.attributes.position.count;const data=new Float32Array(count*size);let at=0;for(const g of geos){const a=g.attributes[name];if(a)data.set(a.array,at);at+=g.attributes.position.count*size}merged.setAttribute(name,new T.BufferAttribute(data,size))}geos.forEach(g=>g.dispose());group.add(new T.Mesh(merged,material));}
   }
   // Release obsolete unique resources while preserving shared materials and the screen.
   const usedGeo=new Set(),usedMat=new Set(),usedTex=new Set();
   for(const [id,part]of Object.entries(P))if(!['base','deck','lid'].includes(id))part.traverse(o=>{if(o.isMesh){usedGeo.add(o.geometry);for(const m of [].concat(o.material)){usedMat.add(m);for(const x of Object.values(m))if(x?.isTexture)usedTex.add(x)}}});usedMat.add(scr);if(scr.map)usedTex.add(scr.map);
   const oldGeo=new Set(),oldMat=new Set();for(const id of ['base','deck','lid']){P[id].traverse(o=>{if(o.isMesh){oldGeo.add(o.geometry);for(const m of [].concat(o.material))oldMat.add(m)}});P[id].clear();P[id].add(output[id]);P[id].userData.exteriorImportado=true;}
   oldGeo.forEach(g=>{if(!usedGeo.has(g))g.dispose()});oldMat.forEach(m=>{if(!usedMat.has(m)){for(const x of Object.values(m))if(x?.isTexture&&!usedTex.has(x))x.dispose();m.dispose()}});
   const sourceGeo=new Set();gltf.scene.traverse(o=>{if(o.isMesh)sourceGeo.add(o.geometry)});sourceGeo.forEach(g=>g.dispose());
   window.LAPTOP_EXTERIOR_CARGADO=true;resolve(output);
  }catch(e){reject(e)}
 },reject));
};
