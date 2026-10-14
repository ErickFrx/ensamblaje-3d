const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{let name=decodeURIComponent(req.url.split('?')[0]);if(name==='/test-media.html'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><body>Prueba local de medios</body></html>');return;}if(name.endsWith('/'))name+='index.html';const file=path.join(root,name);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}fs.readFile(file,(e,d)=>{if(e){res.writeHead(404).end();return}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.mp3':'audio/mpeg','.png':'image/png','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(d)})});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+server.address().port;
 const args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'];
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_CHROMIUM||undefined,args});


 const p=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 try{
 await p.goto(process.env.SKY_FILE_MODE?'file://'+path.join(root,'index.html')+'#laptop':url+'/#laptop');await p.frameLocator('#laptop-view').locator('#modelo-laptop-status').waitFor({state:'attached'});const f=p.frames().find(f=>f.url().includes('laptop.html'));await f.waitForFunction(()=>window.LAPTOP_EXTERIOR_CARGADO===true,{},{timeout:60000});
 const stats=await f.evaluate(()=>{const r={};for(const id of ['base','deck','lid']){const bb=new THREE.Box3().setFromObject(P[id]);let triangles=0;P[id].traverse(o=>{if(o.isMesh)triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3});r[id]={size:bb.getSize(new THREE.Vector3()).toArray(),min:bb.min.toArray(),max:bb.max.toArray(),triangles}}return r});console.log('EXTERIOR',JSON.stringify(stats));assert(Object.values(stats).every(s=>s.triangles>0&&s.size.every(Number.isFinite)));assert(stats.base.size[0]>15&&stats.base.size[0]<16);
 const ids=['base','mobo','cpu','ram','ssd','cool','bat','deck','lid'];
 for(let n=0;n<10;n++){await f.evaluate(n=>ir(n),n);assert.equal(await f.evaluate(()=>paso),n)}
 await f.evaluate(()=>{ir(6);Object.values(P).forEach(g=>{g.userData.t=1;g.position.copy(g.userData.to)});trans=1;cam.position.copy(c1.p);ctl.target.copy(c1.t);SKY.ocultar()});await f.waitForTimeout(500);if(process.env.SKY_SCREENSHOTS)await p.screenshot({path:path.join(process.env.SKY_SCREENSHOTS,'exterior-internos.png')});
 assert.equal(await f.evaluate(()=>P.ram.visible&&P.mobo.visible),true);
 await f.evaluate(()=>{ir(9);Object.values(P).forEach(g=>{g.userData.t=1;g.position.copy(g.userData.to)});trans=1;cam.position.copy(c1.p);ctl.target.copy(c1.t)});await f.waitForTimeout(500);assert.equal(await f.evaluate(()=>scr.map===texOn),true);assert.equal(await f.evaluate(()=>P.deck.visible&&P.lid.visible),true);assert.equal(await f.evaluate(()=>P.mobo.visible),false);
 if(process.env.SKY_SCREENSHOTS)await p.screenshot({path:path.join(process.env.SKY_SCREENSHOTS,'exterior-final.png')});
 await f.evaluate(()=>cambiarGaleria(true));for(const id of ids){await f.evaluate(id=>mostrarPiezaGaleria(id),id)}await f.evaluate(()=>{mostrarPiezaGaleria('deck');galleryControls.autoRotate=false});await f.waitForTimeout(500);if(process.env.SKY_SCREENSHOTS)await p.screenshot({path:path.join(process.env.SKY_SCREENSHOTS,'exterior-teclado.png')});
 await f.evaluate(()=>{cambiarGaleria(false);ir(-1)});assert.equal(await f.evaluate(()=>Object.values(P).every(g=>!g.visible)),true);
 assert.deepEqual(errors,[]);console.log('PASS: exterior cargado, diez etapas, nueve piezas de galería, pantalla UNDC y reinicio');
 }catch(e){console.error('ERRORS',errors);throw e}finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
