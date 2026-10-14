const fs=require('node:fs');
const {chromium}=require('playwright');
const out=__dirname;
const base=process.env.SKY_BASE_URL||'http://127.0.0.1:8787';
async function inventory(ctx){return ctx.evaluate(()=>{
 const material=m=>({uuid:m.uuid,name:m.name,type:m.type,color:m.color?.getHexString(),emissive:m.emissive?.getHexString(),emissiveIntensity:m.emissiveIntensity,roughness:m.roughness,metalness:m.metalness,opacity:m.opacity,transparent:m.transparent,transmission:m.transmission,depthWrite:m.depthWrite,toneMapped:m.toneMapped,maps:Object.fromEntries(['map','emissiveMap','normalMap','roughnessMap','metalnessMap','aoMap'].filter(k=>m[k]).map(k=>[k,{encoding:m[k].encoding,width:m[k].image?.width,height:m[k].image?.height}]))});
 const collect=root=>{let meshes=0,vertices=0,triangles=0;const mats=new Map(),geos=new Map();root.traverse(o=>{if(!o.isMesh)return;meshes++;const g=o.geometry,n=g.attributes.position?.count||0;vertices+=n;triangles+=(g.index?.count||n)/3;geos.set(g.uuid,{type:g.type,vertices:n,triangles:(g.index?.count||n)/3});[].concat(o.material).forEach(m=>mats.set(m.uuid,material(m)))});return {meshes,vertices,triangles,materials:[...mats.values()],geometries:[...geos.values()]}};
 const gl=R.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');
 return {revision:THREE.REVISION,gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unavailable',renderer:{pixelRatio:R.getPixelRatio(),outputEncoding:R.outputEncoding,toneMapping:R.toneMapping,exposure:R.toneMappingExposure,shadows:R.shadowMap.enabled,physicallyCorrectLights:R.physicallyCorrectLights},passes:comp.passes.map(p=>({type:p.constructor.name,enabled:p.enabled,strength:p.strength,threshold:p.threshold,radius:p.radius})),pieces:Object.fromEntries(Object.entries(P).map(([id,g])=>[id,collect(g)])),scene:collect(S),lights:(()=>{const a=[];S.traverse(o=>{if(o.isLight)a.push({type:o.type,color:o.color.getHexString(),intensity:o.intensity,castShadow:o.castShadow})});return a})()};
})}
async function measure(ctx){return ctx.evaluate(()=>{const old=R.info.autoReset;R.info.autoReset=false;R.info.reset();comp.render();const stats={callsTotalFrame:R.info.render.calls,trianglesTotalFrame:R.info.render.triangles,memory:{...R.info.memory},composerPixelRatio:comp._pixelRatio,rendererPixelRatio:R.getPixelRatio(),samples:comp.renderTarget1.samples,hdr:comp.renderTarget1.texture.type===THREE.HalfFloatType,exposure:comp.outputPass.uniforms.toneMappingExposure.value};R.info.autoReset=old;return stats})}
(async()=>{
 fs.mkdirSync(out+'/capturas',{recursive:true});
 const b=await chromium.launch({executablePath:process.env.SKY_CHROMIUM||undefined,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const p=await b.newPage({viewport:{width:1920,height:1080}}),errors=[],warnings=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(['error','warning'].includes(m.type()))warnings.push({type:m.type(),text:m.text()})});p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 const start=Date.now();await p.goto(base+'/#pc');await p.waitForFunction(()=>window.SKY&&!document.getElementById('carga'));
 const data={date:new Date().toISOString(),viewport:{width:1920,height:1080},loadMs:Date.now()-start,method:'Chromium headless + SwiftShader; contadores del frame completo con autoReset=false; DPR 1. Posiciones estabilizadas; no se mide FPS ni representa Intel UHD.',views:{}};
 await p.evaluate(()=>{modoManual=false;ctl.autoRotate=false;SKY.detener()});
 for(const [name,step]of [['01-inicial',-1],['02-torre-sin-panel',6],['03-placa-cpu-ram',4],['04-torre-rgb',7],['05-escritorio-completo',12]]){
 await p.evaluate(n=>{reset();if(n>=0)goTo(n);for(const a of tw)a.fn(1);tw=[];ctl.autoRotate=false;ctl.update()},step);await p.screenshot({path:out+'/capturas/'+name+'.png'});data.views[name]=await measure(p);
 }
 await p.waitForFunction(()=>window.GLB?.kb&&P.kb.userData.modeloDetallado);data.pc=await inventory(p);
 data.ui=await p.evaluate(()=>[...document.querySelectorAll('button,[role=button]')].filter(e=>e.getBoundingClientRect().width&&getComputedStyle(e).visibility!=='hidden').map(e=>({id:e.id,text:(e.textContent||'').trim(),label:e.getAttribute('aria-label')})));
 await p.evaluate(()=>SIM_ROUTER.go('laptop'));await p.frameLocator('#laptop-view').locator('#sig').waitFor({state:'attached'});const f=p.frames().find(f=>f.url().includes('laptop.html'));await f.waitForFunction(()=>window.LAPTOP_READY===true);
 await f.evaluate(()=>{ir(6);SKY.detener();Object.values(P).forEach(g=>{g.userData.t=1;g.position.copy(g.userData.to)});trans=1;cam.position.copy(c1.p);ctl.target.copy(c1.t);ctl.update()});await p.screenshot({path:out+'/capturas/06-laptop-abierta.png'});data.views['06-laptop-abierta']=await measure(f);data.laptop=await inventory(f);
 data.resources=await p.evaluate(()=>performance.getEntriesByType('resource').map(e=>({name:new URL(e.name).pathname,transferSize:e.transferSize,decodedBodySize:e.decodedBodySize,duration:e.duration})));
 data.errors=errors;data.warnings=warnings;fs.writeFileSync(out+'/mediciones.json',JSON.stringify(data,null,2));console.log(JSON.stringify({loadMs:data.loadMs,views:data.views,errors,warningsCount:warnings.length}));
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});
