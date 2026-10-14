/* Native UI integration: both engines, settings, gallery and responsive layout. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{let name=decodeURIComponent(req.url.split('?')[0]);if(name.endsWith('/'))name+='index.html';const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,d)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');res.end(d);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.SKY_CHROMIUM||undefined,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const out=process.env.SKY_SCREENSHOTS;
 const capture=async name=>{if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,name+'.png')});}};
 try{
  await page.goto('http://127.0.0.1:'+server.address().port+'/#pc');
  await page.waitForFunction(()=>window.SIM_UI&&!document.getElementById('carga'));
  assert.equal(await page.locator('#ui-segments button').count(),13);
  await page.locator('#sig').click();await page.waitForFunction(()=>SIM_UI.getState().index===0);
  await page.locator('#ui-segments button').nth(1).click();await page.waitForFunction(()=>SIM_UI.getState().index===1);
  await page.locator('#prev').click();await page.waitForFunction(()=>SIM_UI.getState().index===0);
  await page.locator('#ui-details > summary').click();assert.equal(await page.locator('#info').isVisible(),true);await page.locator('#ui-details > summary').click();
  await page.locator('#ui-menu').click();assert.equal(await page.locator('#ui-options').evaluate(n=>n.open),true);
  await page.locator('#rgb-color').fill('#22aa77');assert.equal(await page.evaluate(()=>getComputedStyle(document.body).getPropertyValue('--ui-accent').trim()),'#a64b43');
  const light=await page.evaluate(()=>SIM_LIGHT);await page.locator('#sim-quality').click();assert.equal(await page.evaluate(()=>SIM_LIGHT),!light);await page.locator('#sim-quality').click();
  const aula=await page.evaluate(()=>SIM_AULA);await page.locator('#sim-aula').click();assert.equal(await page.evaluate(()=>SIM_AULA),!aula);await page.locator('#sim-aula').click();
  await capture('opciones-1366');await page.keyboard.press('Escape');assert.equal(await page.locator('#ui-options').evaluate(n=>n.open),false);
  await page.locator('#ui-menu').click();await page.locator('#gbtn').click();await page.waitForFunction(()=>SIM_UI.getState().gallery);
  assert.equal(await page.locator('#gallery-panel').isVisible(),true);assert.equal(await page.locator('#ui-options').evaluate(n=>n.open),false);
  await page.locator('#gl [data-id=ram]').click();await page.locator('#ge').click();assert.equal(await page.evaluate(()=>gexpT),1);await capture('galeria-pc-1366');await page.locator('#gv').click();
  await page.locator('#ui-menu').click();await page.locator('#modo').click();assert.equal(await page.evaluate(()=>modoManual),true);
  await page.locator('#sig').click();await page.waitForFunction(()=>!!man?.act);assert.equal(await page.locator('#mano').isVisible(),true);assert.equal(await page.locator('#ui-details').evaluate(n=>n.open),true);
  await page.locator('#ui-menu').click();await page.locator('#modo').click();assert.equal(await page.evaluate(()=>modoManual),false);
  await page.evaluate(()=>{SKY.ocultar();SIM_UI.jump(1)});await page.waitForTimeout(1600);assert.equal(await page.locator('#ui-details').evaluate(n=>n.open),false);await capture('pc-1366');
  await page.locator('#ui-menu').click();await page.locator('#sim-nav [data-route=laptop]').click();await page.locator('#ui-close-options').click();
  const f=page.frameLocator('#laptop-view');await f.locator('#ui-step-card').waitFor();await page.waitForFunction(()=>document.querySelector('#ui-segments').children.length===10);
  const child=page.frames().find(f=>f.url().includes('laptop.html'));await child.waitForFunction(()=>window.LAPTOP_READY);
  await f.locator('#sig').click();await child.waitForFunction(()=>paso===0);
  await page.locator('#ui-segments button').nth(3).click();await child.waitForFunction(()=>paso===3);
  await page.locator('#ui-menu').click();await page.locator('#ui-laptop-gbtn').click();await child.waitForFunction(()=>galeriaActiva);
  await f.locator('#gallery-list [data-id=ram]').click();await f.locator('#gallery-explode').click();assert.equal(await child.evaluate(()=>galleryExploded),true);
  await f.locator('#gallery-close').click();await child.evaluate(()=>SKY.ocultar());await page.waitForTimeout(1200);await capture('laptop-1366');
  await page.locator('#ui-menu').click();await page.locator('#ui-laptop-rst').click();await child.waitForFunction(()=>paso===-1);
  await page.locator('#ui-menu').click();await page.locator('#sim-nav [data-route=pc]').click();await page.locator('#ui-close-options').click();
  await page.setViewportSize({width:390,height:844});await capture('pc-movil');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
  for(const id of ['sig','prev','ui-step-help','ui-menu']){const box=await page.locator('#'+id).boundingBox();assert(box.height>=44&&box.width>=44,id+' target');}
  await page.locator('#ui-menu').click();await capture('opciones-movil');await page.keyboard.press('Escape');
  await page.locator('#ui-home').click();await capture('inicio-movil');assert.equal(await page.locator('#intro-pc').isVisible(),true);assert.equal(await page.locator('#intro-laptop').isVisible(),true);
  assert.deepEqual(errors,[]);console.log('PASS: PC/laptop steps, details, RGB independence, quality/aula, manual, galleries, menu keyboard, mobile targets and no runtime errors.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1);});
