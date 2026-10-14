const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{let name=decodeURIComponent(req.url.split('?')[0]);if(name==='/test-media.html'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><body>Prueba local de medios</body></html>');return;}if(name.endsWith('/'))name+='index.html';const file=path.join(root,name);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}fs.readFile(file,(e,d)=>{if(e){res.writeHead(404).end();return}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.mp3':'audio/mpeg','.png':'image/png','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(d)})});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+server.address().port;
 const args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'];
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_CHROMIUM||undefined,args});


const p=await browser.newPage({viewport:{width:1366,height:768}});const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
await p.addInitScript(()=>{window.Audio=class{play(){return Promise.reject(new Error('Silencio de prueba'))}pause(){}}});
try{
 await p.goto(url+'/#pc');await p.waitForFunction(()=>window.SKY&&window.exportarPiezaGLB&&!document.getElementById('carga'));
 await p.locator('#ui-menu').click();await p.locator('#giro-auto').click();assert.equal(await p.evaluate(()=>ctl.autoRotate),true);assert.equal(await p.locator('#giro-auto').textContent(),'Pausar giro');await p.locator('#giro-auto').click();assert.equal(await p.evaluate(()=>ctl.autoRotate),false);
 await p.evaluate(()=>{modoManual=false;for(let i=0;i<PASOS.length;i++)paso(true)});assert.equal(await p.evaluate(()=>ctl.autoRotate),false);await p.locator('#giro-auto').click();assert.equal(await p.evaluate(()=>ctl.autoRotate),true);await p.locator('#giro-auto').click();
 await p.locator('#ui-close-options').click();
 await p.evaluate(()=>{reset();modoManual=true;actualizarModo();goTo(0);SKY.ocultar()});await p.waitForFunction(()=>man?.act==='psu');assert.equal(await p.evaluate(()=>piezaActivaHelper),null);
 await p.waitForFunction(()=>tw.length===0);
 // Use an interior mesh patch: residual orbit damping can move an edge pixel between events.
 const picks=await p.evaluate(()=>{const box=new THREE.Box3().setFromObject(P.psu).expandByScalar(.35);let empty=null,real=null;
  for(let y=90;y<550;y+=8)for(let x=365;x<1160;x+=8){if(document.elementFromPoint(x,y)!==cv)continue;const e={clientX:x,clientY:y};const hit=interseccionPieza(e,'psu');const inBox=rayo(e).intersectBox(box,new THREE.Vector3());if(inBox&&!hit&&!empty)empty={x,y};if(hit&&!real&&[-3,0,3].every(dx=>[-3,0,3].every(dy=>interseccionPieza({clientX:x+dx,clientY:y+dy},'psu'))))real={x,y};if(empty&&real)return {empty,real}}return {empty,real}});
 assert(picks.empty&&picks.real,'Need real mesh and empty old hitbox samples');await p.mouse.move(picks.empty.x,picks.empty.y);await p.mouse.down();assert.equal(await p.evaluate(()=>drag),null);await p.mouse.up();await p.mouse.move(picks.real.x,picks.real.y);await p.mouse.down();assert.equal(await p.evaluate(()=>drag?.id),'psu');await p.mouse.up();
 await p.evaluate(()=>{modoManual=false;reset();galeria(true)});
 const loader=process.env.SKY_GLTF_LOADER;if(loader)await p.addScriptTag({content:fs.readFileSync(loader,'utf8')});
 const exported=[];
 for(const id of await p.evaluate(()=>Object.keys(FICHA))){
  await p.evaluate(id=>showPart(id),id);
  const [download]=await Promise.all([p.waitForEvent('download'),p.locator('#gdownload').click()]);assert.equal(download.suggestedFilename(),'PC_'+id+'.glb');const bytes=fs.readFileSync(await download.path());
  assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(4),2);assert.equal(bytes.readUInt32LE(8),bytes.length);
  const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));assert(json.meshes.length>0);assert(!json.nodes.some(n=>(n.name||'').includes('holograma')));assert((json.images||[]).every(i=>i.bufferView!==undefined));
  if(loader){const stat=await p.evaluate(async bytes=>{const data=new Uint8Array(bytes).buffer;const gltf=await new Promise((resolve,reject)=>new THREE.GLTFLoader().parse(data,'',resolve,reject));const bounds=new THREE.Box3().setFromObject(gltf.scene);let meshes=0;gltf.scene.traverse(o=>{if(o.isMesh)meshes++});return {meshes,size:bounds.getSize(new THREE.Vector3()).toArray()}},Array.from(bytes));assert(stat.meshes>0&&stat.size.every(Number.isFinite)&&stat.size.some(x=>x>0));}
  exported.push({id,bytes:bytes.length,meshes:json.meshes.length});
 }
 assert.equal(exported.length,12);assert.deepEqual(errors,[]);console.log('PASS controles de giro; selección exacta y arrastre; 12 descargas GLB'+(loader?' y reimportación':''),JSON.stringify(exported));
 if(process.env.SKY_SCREENSHOTS)await p.screenshot({path:path.join(process.env.SKY_SCREENSHOTS,'descargas-pc.png')});
}catch(e){console.error('PAGE_ERRORS',errors);throw e}finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
