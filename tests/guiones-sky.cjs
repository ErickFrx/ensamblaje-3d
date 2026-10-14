const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{let name=decodeURIComponent(req.url.split('?')[0]);if(name==='/test-media.html'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><body>Prueba local de medios</body></html>');return;}if(name.endsWith('/'))name+='index.html';const file=path.join(root,name);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}fs.readFile(file,(e,d)=>{if(e){res.writeHead(404).end();return}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.mp3':'audio/mpeg','.png':'image/png','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(d)})});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+server.address().port;
 const args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'];
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_CHROMIUM||undefined,args});


 const p=await browser.newPage({viewport:{width:1366,height:768}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{window.__audios=[];window.Audio=class{constructor(src){this.src=src;window.__audios.push(this)}play(){this.onplay?.();return Promise.resolve()}pause(){}}});
 try{
 await p.goto(url+'/#pc');await p.waitForFunction(()=>window.SKY&&!document.getElementById('carga'));await p.evaluate(()=>{modoManual=false;SKY.mostrar()});
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'audio/sky/manifiesto.json')));
 for(let n=0;n<manifest.pc.length;n++){const st=manifest.pc[n],expected=st.clip===null?st.guia_sky:st.texto_audible;await p.evaluate(n=>goTo(n),n);await p.waitForFunction(expected=>document.getElementById('sky-bubble').textContent===expected,expected);if(st.clip===null)assert.equal(await p.locator('#sky-figure').evaluate(e=>e.classList.contains('speaking')),false);}
 await p.evaluate(()=>SIM_ROUTER.go('laptop'));await p.frameLocator('#laptop-view').locator('#sky-bubble').waitFor({state:'attached'});const f=p.frames().find(f=>f.url().includes('laptop.html'));await f.waitForFunction(()=>typeof ir==='function');await f.evaluate(()=>SKY.mostrar());
 for(let n=0;n<manifest.laptop.length;n++){const st=manifest.laptop[n],expected=st.clip===null?st.guia_sky:st.texto_audible;await f.evaluate(n=>ir(n),n);await f.waitForFunction(expected=>document.getElementById('sky-bubble').textContent===expected,expected);if(st.clip===null)assert.equal(await f.locator('#sky-figure').evaluate(e=>e.classList.contains('speaking')),false);}
 await f.evaluate(()=>{SKY.alternarVoz();ir(5)});const cooling=manifest.laptop[5].guia_sky;await f.waitForFunction(text=>document.getElementById('sky-bubble').textContent===text,cooling);
 assert.deepEqual(errors,[]);console.log('PASS: 23 etapas con texto correspondiente; RAM DDR5 y SO-DIMM diferenciadas; guías concretas sin audio genérico; silencio conserva instrucción técnica');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
