const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{let name=decodeURIComponent(req.url.split('?')[0]);if(name==='/test-media.html'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><body>Prueba local de medios</body></html>');return;}if(name.endsWith('/'))name+='index.html';const file=path.join(root,name);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}fs.readFile(file,(e,d)=>{if(e){res.writeHead(404).end();return}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.mp3':'audio/mpeg','.png':'image/png','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(d)})});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+server.address().port;
 const args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'];
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_CHROMIUM||undefined,args});


 const checks=[],errors=[];
 for(const mode of ['http','file']){
  const p=await browser.newPage({viewport:{width:1366,height:768}});p.on('pageerror',e=>errors.push(mode+': '+e.message));
  if(mode==='http')p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
  await p.addInitScript(()=>{window.Audio=class{play(){return Promise.reject(new Error('silencio de prueba'))}pause(){}}});
  try{
   await p.goto(mode==='http'?url+'/#laptop':'file://'+path.join(root,'index.html')+'#laptop');
   await p.frameLocator('#laptop-view').locator('#laboratorio-toggle').waitFor();
   const f=p.frames().find(f=>f.url().includes('laptop.html'));await f.waitForFunction(()=>window.setLaboratorioVisible&&typeof texOn!=='undefined');
   await p.waitForFunction(()=>window.SKY&&!document.getElementById('carga'));
   assert.equal(await p.locator('#sim-aula').textContent(),'Aula: NO');await f.waitForFunction(()=>window.SIM_AULA===false);
   const table=await f.evaluate(()=>{const g=S.getObjectByName('Mesa principal de laptop'),top=S.getObjectByName('Mesa principal · tablero'),legs=S.getObjectByName('Mesa principal · patas y estructura');return {visible:g.visible,thickness:top.geometry.parameters.height,parts:legs.children.length}});assert(table.visible&&table.thickness===.4&&table.parts===12);checks.push(mode+': mesa con espesor, 4 patas, apoyos y travesaños');
   await p.locator('#sim-aula').click();await f.waitForFunction(()=>window.SIM_AULA===true);assert.equal(await p.locator('#sim-aula').textContent(),'Aula: SÍ');assert.equal(await f.locator('#laboratorio-toggle').textContent(),'Aula 3D: SÍ');
   await p.locator('#sim-quality').click();await f.waitForFunction(()=>window.SIM_LIGHT===false);assert.equal(await f.evaluate(()=>window.SIM_AULA),true);assert.equal(await f.evaluate(()=>comp.passes[1].enabled),true);assert.equal(await p.locator('#sim-quality').textContent(),'Modo: completo');
   await p.locator('#sim-quality').click();await f.waitForFunction(()=>window.SIM_LIGHT===true);assert.equal(await f.evaluate(()=>window.SIM_AULA),true);assert.equal(await f.evaluate(()=>comp.passes[1].enabled),false);checks.push(mode+': modo ligero independiente del aula');
   await f.locator('#laboratorio-toggle').click();await p.waitForFunction(()=>document.getElementById('sim-aula').textContent==='Aula: NO');assert.equal(await p.evaluate(()=>window.SIM_AULA),false);
   await p.locator('#sim-aula').click();await f.waitForFunction(()=>window.SIM_AULA===true);checks.push(mode+': botón superior y botón de laptop sincronizados');
   await p.waitForFunction(()=>scrM.map.userData.fondoListo===true);await f.waitForFunction(()=>texOn.userData.fondoListo===true);
   const hash=texture=>{const data=texture.image.getContext('2d').getImageData(0,0,1280,720).data;let h=2166136261;for(const x of data)h=Math.imul(h^x,16777619);return h>>>0};
   const pcHash=await p.evaluate('('+hash.toString()+')(scrM.map)'),laptopHash=await f.evaluate('('+hash.toString()+')(texOn)');assert.equal(pcHash,laptopHash);await f.evaluate(()=>ir(9));assert.equal(await f.evaluate(()=>scr.map===texOn),true);await f.evaluate(()=>ir(8));assert.equal(await f.evaluate(()=>scr.map===texOff),true);await f.evaluate(()=>ir(9));checks.push(mode+': pantalla comparte exactamente el fondo de PC; apagada antes de encender');
   if(process.env.SKY_SCREENSHOTS&&mode==='http'){
    await f.evaluate(()=>{Object.values(P).forEach(g=>{g.userData.t=1;g.position.copy(g.userData.to)});trans=1;cam.position.copy(c1.p);ctl.target.copy(c1.t);SKY.ocultar()});await f.waitForTimeout(1000);await p.screenshot({path:path.join(process.env.SKY_SCREENSHOTS,'laptop-aula-mesa.png')});
    await p.setViewportSize({width:390,height:844});const bounds=await p.locator('#sim-nav').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=390);await p.screenshot({path:path.join(process.env.SKY_SCREENSHOTS,'aula-movil.png')});await p.setViewportSize({width:1366,height:768});
   }
   await p.locator('#sim-nav [data-route="pc"]').click();await f.waitForFunction(()=>window.SIM_ACTIVE===false);await p.locator('#laboratorio-toggle').first().click();await p.waitForFunction(()=>document.getElementById('sim-aula').textContent==='Aula: NO');await f.waitForFunction(()=>window.SIM_AULA===false);checks.push(mode+': vista inactiva pausada y control de PC sincronizado');
  }finally{await p.close()}
 }
 assert.deepEqual(errors,[]);console.log('PASS',JSON.stringify(checks));await browser.close();server.close();
})().catch(e=>{console.error(e);process.exit(1)});
