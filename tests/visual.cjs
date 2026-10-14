const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{let name=decodeURIComponent(req.url.split('?')[0]);if(name==='/test-media.html'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><body>Prueba local de medios</body></html>');return;}if(name.endsWith('/'))name+='index.html';const file=path.join(root,name);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}fs.readFile(file,(e,d)=>{if(e){res.writeHead(404).end();return}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.mp3':'audio/mpeg','.png':'image/png','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(d)})});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+server.address().port;
 const args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'];
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_CHROMIUM||undefined,args});

 const p=await browser.newPage({viewport:{width:1366,height:768}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 try {
 await p.goto(url+'/#laptop');await p.waitForFunction(()=>document.getElementById('laptop-view')?.contentWindow.SKY);const f=p.frames().find(f=>f.url().includes('laptop.html'));await f.waitForFunction(()=>typeof ir==='function');await f.evaluate(()=>{SKY.ocultar();document.getElementById('panel').classList.add('min')});
 for(let n=0;n<10;n++){await f.evaluate(n=>ir(n),n);await f.waitForFunction(()=>trans===1&&Object.values(P).every(g=>g.userData.t===1));await p.screenshot({path:path.join(process.env.SKY_SCREENSHOTS,'paso-'+n+'.png')});}
 await f.evaluate(()=>cambiarGaleria(true));
 for(const id of ['base','mobo','cpu','ram','ssd','cool','bat','deck','lid']){await f.evaluate(id=>{mostrarPiezaGaleria(id);galleryControls.autoRotate=false;},id);await f.waitForTimeout(150);await p.screenshot({path:path.join(process.env.SKY_SCREENSHOTS,'galeria-'+id+'.png')});}
 await p.waitForFunction(()=>window.SKY&&!document.getElementById('carga'));await p.evaluate(()=>SIM_ROUTER.go('pc'));console.log('NAV',await p.locator('#sim-nav button').evaluateAll(es=>es.map(e=>({text:e.textContent,current:e.getAttribute('aria-current'),bg:getComputedStyle(e).backgroundColor}))));
 assert.equal(await p.locator('#sim-nav [aria-current="page"]').getAttribute('data-route'),'pc');
 await p.evaluate(()=>{modoManual=false;reset();for(let i=0;i<PASOS.length;i++)paso(true);document.getElementById('panel').classList.add('min');SKY.detener();SKY.resetearPosicion();ctl.autoRotate=false});await p.waitForTimeout(1000);await p.screenshot({path:path.join(process.env.SKY_SCREENSHOTS,'pc-vista-completa.png')});
 await p.goto(url+'/#pc');await p.waitForFunction(()=>window.SKY&&!document.getElementById('carga'));assert.equal(await p.evaluate(()=>document.body.dataset.route),'pc');await p.locator('#sim-nav [data-route="inicio"]').click();assert.equal(await p.evaluate(()=>document.body.dataset.route),'inicio');
 console.log('VISUAL_COMPLETA',JSON.stringify({screenshots:20,directPC:true,errors}));assert.deepEqual(errors,[]);
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
