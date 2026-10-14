const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{let n=decodeURIComponent(req.url.split('?')[0]);if(n.endsWith('/'))n+='index.html';fs.readFile(path.join(root,n),(e,b)=>{if(e){res.writeHead(404).end();return}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png'})[path.extname(n)]||'application/octet-stream');res.end(b)})});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:process.env.SKY_CHROMIUM,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
 await p.route('**/js/laptop-exterior.js',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(root,'js/laptop-exterior.js'),'utf8')+'\n{const original=cargarLaptopExterior;window.cargarLaptopExterior=(...args)=>original(...args).then(value=>new Promise(resolve=>setTimeout(()=>resolve(value),2000)));}'}));
 await p.goto('http://127.0.0.1:'+server.address().port+'/#laptop');await p.frameLocator('#laptop-view').locator('#sig').waitFor();const f=p.frames().find(f=>f.url().includes('laptop.html'));await f.waitForFunction(()=>typeof P!=='undefined'&&typeof ir==='function');
 assert(await f.evaluate(()=>!window.LAPTOP_READY&&Object.values(P).every(g=>!g.visible)),'Exterior oculto mientras prepara');assert(await f.locator('#sig').isDisabled());await f.evaluate(()=>ir(0));assert(await f.evaluate(()=>paso===-1),'No se coloca antes de cargar');await f.waitForFunction(()=>window.LAPTOP_READY===true);
 assert(await f.evaluate(()=>Object.values(P).every(g=>!g.visible)),'Inicio con mesa vacía');
 assert(await f.evaluate(()=>{ir(0);return P.base.visible&&P.base.userData.t===0}),'Chasis entra al colocar');
 const metrics=await f.evaluate(()=>{ir(6);Object.values(P).forEach(g=>{g.position.copy(g.userData.to);g.userData.t=1});const out={};for(const id of ['mobo','cpu','ram','ssd','cool','bat']){const b=new THREE.Box3().setFromObject(P[id]);let t=0;P[id].traverse(o=>{if(o.isMesh)t+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3});out[id]={min:b.min.toArray(),max:b.max.toArray(),triangles:t}}return out});
 for(const [id,b]of Object.entries(metrics)){assert(b.min.every(Number.isFinite)&&b.max.every(Number.isFinite));assert(b.min[0]>-6.75&&b.max[0]<6.75,id+' corredor de puertos');assert(b.min[2]>-4.9&&b.max[2]<4.95,id+' límites de base');assert(b.min[1]>=.20&&b.max[1]<.82,id+' altura bajo cubierta')}
 function separate(a,b){return [0,1,2].some(k=>a.max[k]<=b.min[k]||b.max[k]<=a.min[k])}
 const subBounds=await f.evaluate(()=>window.LAPTOP_MESH_BOUNDS);
 for(const [a,b]of [['ram','ssd'],['ram','bat'],['ssd','bat'],['cool','ram'],['cool','ssd'],['cool','bat']])assert(subBounds[a].every(x=>subBounds[b].every(y=>separate(x,y))),a+'/'+b+' sin solape entre submallas');
 assert(await f.evaluate(()=>fans.length===2&&fans.every(g=>g.children.length>0)));
 await f.addScriptTag({path:path.join(root,'js/GLTFExporter.js')});fs.mkdirSync(path.join(root,'models/laptop/internos'),{recursive:true});
 for(const id of Object.keys(metrics)){
 const data=await f.evaluate(async id=>{const g=P[id].clone(true);g.position.set(0,0,0);g.traverse(o=>{o.visible=true;o.userData={}});const data=await new THREE.GLTFExporter().parseAsync(g,{binary:true,onlyVisible:false});return Array.from(new Uint8Array(data))},id);fs.writeFileSync(path.join(root,'models/laptop/internos',id+'.glb'),Buffer.from(data));}
 fs.writeFileSync(path.join(root,'models/laptop/internos/medidas.json'),JSON.stringify(metrics,null,2));
 await f.evaluate(()=>{trans=1;cam.position.set(0,16,10);ctl.target.set(0,0,0);SKY.ocultar()});await f.waitForTimeout(500);if(process.env.SKY_SCREENSHOTS)await p.screenshot({path:path.join(process.env.SKY_SCREENSHOTS,'internos-originales.png')});
 await f.evaluate(()=>ir(-1));assert(await f.evaluate(()=>Object.values(P).every(g=>!g.visible)),'Reinicio vacío');
 for(let i=0;i<10;i++)await f.evaluate(i=>ir(i),i);assert(await f.evaluate(()=>encendido&&P.deck.visible&&P.lid.visible&&!P.mobo.visible));
 assert.deepEqual(errors,[]);console.log('PASS inicio, chasis, 6 envolventes, 6 separaciones, 2 ventiladores, 6 exportaciones GLB, reinicio y 10 etapas',metrics);
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
