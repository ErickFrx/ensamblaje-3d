const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
const output=__dirname+'/capturas';
const baseURL=process.env.SKY_BASE_URL||'http://127.0.0.1:8787';
async function area(page){return page.evaluate(()=>{
 const rects=[...document.querySelectorAll('[data-ui]')].filter(e=>e.getBoundingClientRect().width&&getComputedStyle(e).visibility!=='hidden').map(e=>{const b=e.getBoundingClientRect();return {id:e.id,x1:Math.max(0,b.left),x2:Math.min(innerWidth,b.right),y1:Math.max(0,b.top),y2:Math.min(innerHeight,b.bottom)}});
 const xs=[...new Set(rects.flatMap(r=>[r.x1,r.x2]))].sort((a,b)=>a-b);let union=0;
 for(let i=1;i<xs.length;i++){const intervals=rects.filter(r=>r.x1<xs[i]&&r.x2>xs[i-1]).map(r=>[r.y1,r.y2]).sort((a,b)=>a[0]-b[0]);let height=0,end=-Infinity;for(const [start,stop]of intervals){if(stop>end){height+=stop-Math.max(start,end);end=stop}}union+=(xs[i]-xs[i-1])*height}
 const smallTargets=[...document.querySelectorAll('button,summary,select,label.setting,label.choice')].filter(e=>{const b=e.getBoundingClientRect();return b.width&&b.height&&getComputedStyle(e).visibility!=='hidden'&&(b.width<43.9||b.height<43.9)}).map(e=>({id:e.id,text:e.textContent.trim(),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}));
 return {rects,areaPercent:100*union/(innerWidth*innerHeight),smallTargets,overflow:document.documentElement.scrollWidth>innerWidth};
})}
async function shot(page,name){await page.evaluate(()=>document.dispatchEvent(new Event('pointermove')));await page.screenshot({path:output+'/'+name+'.png',fullPage:true})}
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.SKY_CHROMIUM||undefined,args:['--no-sandbox']});const results={themes:{},errors:[]};
 try{
 for(const [name,file]of[['a','manual-de-taller'],['b','banco-de-trabajo']]){
  const page=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
  page.on('pageerror',e=>results.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)results.errors.push(r.status()+' '+r.url())});
  const base=baseURL+'/docs/interfaz/'+file+'.html';results.themes[name]={};
  await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.locator('#scene-image').evaluate(e=>e.decode());await shot(page,name+'-paso-1920');
  results.themes[name].desktop1920=await area(page);
  await page.goto(base+'?pantalla=inicio');await page.evaluate(()=>document.fonts.ready);await shot(page,name+'-inicio-1920');
  await page.locator('[data-equipment=laptop]').click();assert.equal(await page.locator('#equipment').textContent(),'Ensamblaje laptop');await page.locator('#scene-image').evaluate(e=>e.decode());assert((await page.locator('#scene-image').getAttribute('src')).includes('laptop'));
  await page.goto(base+'?pantalla=galeria');await page.locator('#scene-image').evaluate(e=>e.decode());await shot(page,name+'-galeria-1920');await page.locator('#explode').click();assert(!(await page.locator('#scene-image').getAttribute('src')).includes('despiece'));await page.locator('[data-action=mounting]').click();assert.equal(await page.locator('#step-card').isVisible(),true);
  await page.goto(base+'?pantalla=final');await shot(page,name+'-final-1920');await page.locator('[data-action=restart]').click();assert.equal(await page.locator('#step-number').textContent(),'Paso 1 de 13');
  await page.setViewportSize({width:1366,height:768});await page.goto(base);await page.locator('#scene-image').evaluate(e=>e.decode());await shot(page,name+'-paso-1366');results.themes[name].desktop1366=await area(page);
  await page.keyboard.press('/');assert.equal(await page.locator('#menu-dialog').isVisible(),true);await shot(page,name+'-menu-1366');await page.keyboard.press('Escape');assert.equal(await page.locator('#menu-dialog').isVisible(),false);
  await page.locator('#hotspot').click();assert.equal(await page.locator('#piece-tip').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#piece-tip').isVisible(),false);
  await page.locator('[data-action=menu]').click();await page.locator('#menu-dialog [data-action=pasos]').click();await page.locator('#steps-list [data-step="12"]').click();await page.locator('#next').click();assert.equal(await page.locator('#finished').isVisible(),true);
  await page.goto(base);await page.locator('[data-action=menu]').click();await page.locator('[data-action=presentation]').click();await page.locator('body').click({position:{x:20,y:300}});await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#step-number').textContent(),'Paso 6 de 13');await page.keyboard.press('Escape');assert.equal(await page.locator('#chrome').isVisible(),true);
  await page.goto(base);await page.mouse.move(800,450);await page.waitForTimeout(3300);assert.equal(await page.locator('body').getAttribute('data-idle'),'true');await page.keyboard.press('Tab');await page.waitForTimeout(3300);assert.equal(await page.locator('body').getAttribute('data-idle'),'false');
  await page.setViewportSize({width:1024,height:768});await page.goto(base);await shot(page,name+'-paso-tablet');results.themes[name].tablet=await area(page);
  await page.setViewportSize({width:390,height:844});await page.goto(base);await shot(page,name+'-paso-movil');results.themes[name].mobile=await area(page);
  await page.locator('[data-action=menu]').click();await shot(page,name+'-menu-movil');const menu=await page.locator('#menu-dialog').boundingBox();assert(menu.x>=0&&menu.x+menu.width<=390&&menu.y+menu.height<=844.1);
  await page.locator('#menu-dialog [data-action=inicio]').click();assert.equal(await page.locator('#menu-dialog').isVisible(),false);await shot(page,name+'-inicio-movil');
  await page.close();
 }
 assert.deepEqual(results.errors,[]);fs.writeFileSync(__dirname+'/validacion.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
