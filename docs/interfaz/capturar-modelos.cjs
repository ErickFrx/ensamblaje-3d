const {chromium}=require('playwright');
const path=require('node:path');const fs=require('node:fs');
const output=path.join(__dirname,'assets');const base=process.env.SKY_BASE_URL||'http://127.0.0.1:8787';
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.SKY_CHROMIUM||undefined,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width:1920,height:1080}});
 await page.goto(base+'/#pc');
 await page.waitForFunction(()=>window.SKY&&!document.getElementById('carga'));
 await page.evaluate(()=>{
  modoManual=false;reset();for(let n=0;n<5;n++)paso(true);tw=[];
  window.SIM_ACTIVE=false;window.dispatchEvent(new CustomEvent('sim:visibility',{detail:false}));
  const style=document.createElement('style');style.textContent='body>*{visibility:hidden!important}#c{visibility:visible!important}body::before,body::after{display:none!important}';document.head.appendChild(style);
  S.children.forEach(o=>{if(o!==T&&!o.isLight)o.visible=false});
  S.fog=null;ctl.autoRotate=false;cam.position.set(-.8,8.5,19.5);ctl.target.set(-9,5,0);cam.fov=40;cam.updateProjectionMatrix();ctl.update();
  S.traverse(o=>{if(o.isLight){o.color.setHex(0xffffff);if(o.isHemisphereLight){o.groundColor.setHex(0x737578);o.intensity=1.5}if(o.isDirectionalLight)o.intensity=2.5;if(o.isPointLight)o.visible=false}});
  const studio=new THREE.Scene();studio.background=new THREE.Color(0xa0a0a0);
  for(const [x,y,z]of[[-10,8,5],[8,7,-4],[0,15,0]]){const m=new THREE.Mesh(new THREE.BoxGeometry(10,.5,10),new THREE.MeshBasicMaterial({color:new THREE.Color(3,3,3)}));m.position.set(x,y,z);studio.add(m)}
  const pm=new THREE.PMREMGenerator(R);S.environment=pm.fromScene(studio,.04).texture;studio.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose()}});pm.dispose();
  window.previewFloor=new THREE.Mesh(new THREE.PlaneGeometry(300,300),new THREE.MeshStandardMaterial({color:0xe1e4e8,roughness:1,metalness:0}));previewFloor.rotation.x=-Math.PI/2;previewFloor.position.y=-.05;S.add(previewFloor);
  agregarSombraContacto(-9,0,14,10,.6);
  ajustarCalidadRender(R,comp,innerWidth,innerHeight,false);comp.passes[1].enabled=false;
 });
 for(const [theme,background,floor]of[['claro',0xe5e8ec,0xc7ced7],['oscuro',0x353333,0x111110]]){
  await page.evaluate(({background,floor})=>{S.background=new THREE.Color(background);previewFloor.material.color.setHex(floor);comp.render()},{background,floor});
  await page.screenshot({path:output+'/estudio-'+theme+'.png'});
 }
 await page.evaluate(()=>{galeria(true);showPart('ram');gctl.autoRotate=false;GS.environment=S.environment;GS.traverse(o=>{if(o.isLight)o.color.setHex(0xffffff)});gctl.update()});
 for(const [theme,background]of[['claro',0xe5e8ec],['oscuro',0x353333]]){
  for(const exploded of [false,true]){
   await page.evaluate(({background,exploded})=>{GS.background=new THREE.Color(background);const parts=gobj.userData.partes.children;parts.forEach((p,i)=>{const axis=gobj.userData.ax||'z';p.position.copy(p.userData.p0);p.position[axis]+=(i-(parts.length-1)/2)*.7*(exploded?1:0)});comp.render()},{background,exploded});
   await page.screenshot({path:output+'/ram-'+theme+(exploded?'-despiece':'')+'.png'});
  }
 }
 await page.evaluate(()=>{SIM_ROUTER.go('laptop');const s=document.createElement('style');s.textContent='#laptop-view{visibility:visible!important}';document.head.appendChild(s)});
 await page.frameLocator('#laptop-view').locator('#sig').waitFor({state:'attached'});
 const frame=page.frames().find(f=>f.url().includes('laptop.html'));await frame.waitForFunction(()=>window.LAPTOP_READY===true);
 await frame.evaluate(()=>{
  ir(6);Object.values(P).forEach(g=>{g.userData.t=1;g.position.copy(g.userData.to)});trans=1;
  window.SIM_ACTIVE=false;window.dispatchEvent(new CustomEvent('sim:visibility',{detail:false}));
  const style=document.createElement('style');style.textContent='body>*{visibility:hidden!important}#c{visibility:visible!important}body::before,body::after{display:none!important}';document.head.appendChild(style);
  S.children.forEach(o=>{if(o!==L&&!o.isLight)o.visible=false});S.fog=null;cam.clearViewOffset();cam.position.set(11,15,18);ctl.target.set(0,0,0);cam.fov=40;cam.updateProjectionMatrix();ctl.update();
  S.traverse(o=>{if(o.isLight){o.color.setHex(0xffffff);o.intensity=o.isDirectionalLight?2:1.5}});
  window.previewFloor=new THREE.Mesh(new THREE.PlaneGeometry(300,300),new THREE.MeshStandardMaterial({color:0xc7ced7,roughness:1,metalness:0}));previewFloor.rotation.x=-Math.PI/2;previewFloor.position.y=-.2;S.add(previewFloor);
  ajustarCalidadRender(R,comp,innerWidth,innerHeight,false);comp.passes[1].enabled=false;
 });
 for(const [theme,background,floor]of[['claro',0xe5e8ec,0xc7ced7],['oscuro',0x353333,0x111110]]){
  await frame.evaluate(({background,floor})=>{S.background=new THREE.Color(background);previewFloor.material.color.setHex(floor);comp.render()},{background,floor});
  await page.screenshot({path:output+'/laptop-'+theme+'.png'});
 }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
