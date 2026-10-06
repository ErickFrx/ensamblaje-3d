// ===== Detalle interno de las piezas (se ejecuta después de app.js) =====
const bx=(w,h,d,m,x=0,y=0,z=0)=>at(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m),x,y,z);
const cyl=(r,h,m,x,y,z,rot)=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,16),m);if(rot==='x')c.rotateZ(Math.PI/2);if(rot==='z')c.rotateX(Math.PI/2);return at(c,x,y,z)};
const inst=(geo,m,pts)=>{const im=new THREE.InstancedMesh(geo,m,pts.length),o=new THREE.Object3D();pts.forEach((p,i)=>{o.position.set(...p);o.updateMatrix();im.setMatrixAt(i,o.matrix)});return im};
const clr=g=>{while(g.children.length)g.remove(g.children[0])};
const gold=M(0xd8b04a,{metalness:1,roughness:.25}),nick=M(0xc9ced6,{metalness:1,roughness:.2}),blk=M(0x07080b,{roughness:.5,metalness:.3}),grn=M(0x14583a,{roughness:.55,metalness:.15}),cu=M(0xb87333,{metalness:1,roughness:.3}),sil=M(0xaab0ba,{metalness:1,roughness:.3});
const range=(n,f)=>Array.from({length:n},(_,i)=>f(i));

// ---- CPU: sustrato, tapa metálica en cruz, condensadores SMD, triángulo guía y pads LGA ----
clr(P.cpu);{const pads=[];for(let i=0;i<34;i++)for(let j=0;j<34;j++)if(!(i>11&&i<22&&j>11&&j<22))pads.push([-.4+i*.0242,-.4+j*.0242,-.036]);
 const smd=[];for(let i=0;i<9;i++)smd.push([-.4+i*.1,.455,.04],[-.4+i*.1,-.455,.04],[.455,-.4+i*.1,.04],[-.455,-.4+i*.1,.04]);
 P.cpu.add(bx(1,1,.06,grn),inst(new THREE.BoxGeometry(.016,.016,.01),gold,pads),inst(new THREE.BoxGeometry(.05,.025,.02),M(0x7a6a4a,{roughness:.5}),smd),
  at(new THREE.Mesh(new THREE.CircleGeometry(.045,3),gold),-.43,-.43,.032),at(rb(.64,.64,.07,.04,nick),0,0,.065),at(rb(.84,.46,.07,.03,nick),0,0,.065),at(rb(.46,.84,.07,.03,nick),0,0,.065),
  at(lab('UNDC|CORE i9|14900K',.5,.38,34,'#1b1f26'),0,0,.125))}
// ---- RAM: PCB, dedos dorados, chips, disipadores con etiqueta y barra RGB difusa ----
clr(P.ram);{const stick=o=>{const g=new THREE.Group(),sp=M(0x2b2f38,{roughness:.35,metalness:.9});
 g.add(bx(.07,2.9,.7,grn),inst(new THREE.BoxGeometry(.075,.026,.09),gold,range(68,i=>Math.abs(i-34)>1?[0,-1.35+i*.04,-.31]:[0,-9,0])));
 [-1,1].forEach(s=>{g.add(bx(.04,2.7,.55,sp,s*.065,0,.08),inst(new THREE.BoxGeometry(.045,.03,.5),M(0x15171c),range(16,i=>[s*.068,-1.2+i*.16,.08])));
  const l=lab('DDR5-6000  CL30',2.3,.4,40);l.rotation.set(0,s*Math.PI/2,Math.PI/2);l.position.set(s*.09,0,.1);g.add(l)});
 g.add(bx(.15,2.6,.15,new THREE.MeshPhysicalMaterial({color:0xffffff,transparent:true,opacity:.35,roughness:.2}),0,0,.42),bx(.1,2.5,.07,rgb(o),0,0,.42));return g};
 P.ram.add(at(stick(0),0,0,0),at(stick(.3),.45,0,0))}
// ---- SSD M.2: PCB con dedos, chips NAND y controlador, pad térmico, disipador con aletas ----
clr(P.ssd);{const chip=(x,w)=>G(bx(w,.42,.025,blk,x,0,.04),at(new THREE.Mesh(new THREE.CircleGeometry(.02,10),M(0xdddddd)),x-w/2+.06,.15,.054));
 P.ssd.add(bx(2.1,.6,.04,grn),inst(new THREE.BoxGeometry(.1,.026,.01),gold,range(14,i=>[.99,-.28+i*.043,-.025])),chip(-.65,.5),chip(-.05,.5),chip(.6,.36),
  bx(1.8,.5,.02,M(0x9aa3ad,{roughness:.9,metalness:0}),0,0,.075),at(rb(1.9,.56,.08,.05,M(0x2a2f3a,{roughness:.3})),0,0,.12),inst(new THREE.BoxGeometry(.035,.5,.01),M(0x14161c),range(20,i=>[-.85+i*.09,0,.17])),
  cyl(.06,.1,gold,-1.0,0,.1,'z'),at(lab('UNDC NVMe 2TB|PCIe Gen4',1.5,.3,38),.1,.12,.18),bx(1.5,.04,.03,rgb(.7),.1,-.2,.18))}
// ---- GPU: tubos de calor, conector PCIe, puertos, conector de 8 pines ----
[-.5,-.2,.1,.4].forEach(z=>P.gpu.add(cyl(.07,5.4,cu,0,-.87,z,'x')));
P.gpu.add(inst(new THREE.BoxGeometry(.045,.3,.02),gold,range(60,i=>[-2.4+i*.075,-.3,-.77])),...range(3,i=>bx(.04,.28,.5,blk,-3.12,.45,-.4+i*.4)),bx(.04,.3,.5,blk,-3.12,-.2,0),
 inst(new THREE.BoxGeometry(.06,.06,.12),M(0xd8b04a,{metalness:1}),range(8,i=>[1.35+(i%4)*.14,.98+(i>3?.0:.0),.2-(i>3?.1:.0)])),bx(2.6,.04,1.3,M(0x1c2029,{metalness:.9,roughness:.3}),0,.87,0),
 inst(new THREE.BoxGeometry(.04,.12,1.2),M(0x2a2f3a,{metalness:1}),range(40,i=>[-2.4+i*.12,.93,0])));
// ---- Fuente: zócalos modulares, entrada AC con interruptor, tornillos ----
P.psu.add(inst(new THREE.BoxGeometry(.7,.38,.06),blk,range(5,i=>[-2.5+i*1,0,-1.93])),inst(new THREE.BoxGeometry(.06,.06,.08),gold,range(30,i=>[-2.78+(i%6)*.11+Math.floor(i/6)*1,(i%2?.1:-.1),-1.95])),
 bx(.06,.62,.9,blk,3.22,.1,0),...range(3,i=>bx(.08,.14,.04,gold,3.27,.1,-.25+i*.25)),bx(.1,.3,.2,M(0xcc2222),3.25,-.5,.4),
 ...[[-3,.6],[3,.6],[-3,-.6],[3,-.6]].map(([x,y])=>cyl(.07,.06,sil,x,y,1.92,'z')));
// ---- Placa madre: zócalo CPU, puertos traseros, SATA, pines frontales, batería, M.2 ----
P.mobo.add(bx(1.4,1.4,.05,M(0x050608),-.6,.95,.09),bx(1.3,.1,.1,sil,-.6,1.72,.14),bx(.1,1.3,.1,sil,.12,.95,.14),
 bx(.25,3.5,.9,M(0x15171c),-3.25,.3,.4),...range(4,i=>bx(.12,.2,.28,M(0x1b6bff),-3.38,1.55-i*.3,.4)),bx(.12,.55,.5,sil,-3.38,-.2,.4),...range(3,i=>cyl(.08,.1,M(i?0x2ea84a:0xe03c8a),-3.38,-.8-i*.22,.4,'x')),
 ...range(4,i=>bx(.5,.28,.2,blk,2.4,-3.0+i*.001-(i%2)*0,-.0+.2)).map((m,i)=>{m.position.set(2.35,-2.7-i*.0+(i-1.5)*-.0,.2);m.position.y=-2.1-i*.0;m.position.x=2.4;m.position.y=-3.15+(i%2)*0;m.position.x=1.5+i*.55;return m}),
 inst(new THREE.BoxGeometry(.04,.04,.2),gold,range(20,i=>[-1.2+(i%10)*.1,-3.25+Math.floor(i/10)*.1,.2])),cyl(.26,.1,sil,.3,-1.3,.14,'z'),bx(.4,.1,.12,blk,-.6,-.85,.12),cyl(.05,.08,gold,.55,-.85,.12,'z'));
// ---- Periféricos ----
P.mon.add(bx(.05,.05,.02,rgb(.5),4.8,-3.0,.16),bx(1.6,.5,.06,blk,0,-1,-.14),...range(3,i=>bx(.3,.14,.05,M(0x222831),-.4+i*.4,-1,-.18)));
P.kb.add(cyl(.18,.12,rgb(.4),3.2,.3,-.85,'z'));

// ===== Textos: instrucciones de instalación claras =====
const INST={
 psu:'Coloque la fuente en la parte inferior del case con el ventilador hacia la rejilla. Alinee sus 4 agujeros con los del chasis y fíjela con 4 tornillos.',
 mobo:'Instale primero los separadores en el case, baje la placa alineando sus agujeros con ellos y atorníllela. Compruebe que el panel de puertos encaje en la abertura trasera.',
 cpu:'Abra la palanca del zócalo, alinee el triángulo dorado del procesador con la marca del zócalo y déjelo caer sin presionar. Cierre la placa de carga y asegure la palanca.',
 aio:'Aplique pasta térmica sobre el procesador, coloque la bomba y ajuste sus 4 tornillos en cruz. Fije el radiador con sus ventiladores al frente del case y conecte los cables de la bomba y los ventiladores.',
 ram:'Abra las pestañas laterales de la ranura, alinee la muesca del módulo y presione por ambos extremos hasta oír un clic. Repita con el segundo módulo.',
 ssd:'Retire el disipador de la ranura M.2, inserte el SSD inclinado alineando la muesca, presiónelo hasta dejarlo plano y fíjelo con su tornillo. Vuelva a colocar el disipador.',
 gpu:'Retire las tapas traseras del case, alinee la tarjeta con la ranura PCIe x16 y presione hasta que la traba haga clic. Fíjela al case con tornillos y conecte el cable de energía de 8 pines.',
 glass:'Apoye el panel en las guías del case, deslícelo hasta cerrarlo y asegúrelo con los tornillos de mariposa traseros.',
 kb:'Conecte el cable USB del teclado a un puerto USB del panel frontal o trasero de la torre.',
 mouse:'Conecte el cable USB del mouse a un puerto USB de la torre. El sistema instala el controlador automáticamente.',
 mon:'Conecte el cable DisplayPort o HDMI a la tarjeta de video (no a la placa madre), enchufe el cable de alimentación del monitor y enciéndalo.'};
PASOS.forEach(p=>{if(INST[p.p[0]])p.t=INST[p.p[0]]});PASOS[PASOS.length-1].t='<b>¡Ensamblaje completo!</b> Pulse el botón de encendido de la torre y verifique que el monitor muestre imagen y que la iluminación RGB funcione.';
Object.assign(FICHA,{
 glass:['Panel lateral de vidrio templado del case.',['Vidrio templado de 4 mm','Bordes biselados','Permite ver los componentes y la iluminación RGB','Fijación con tornillos de mariposa']],
 kb:['Teclado mecánico con retroiluminación RGB.',['Formato 75% (sin teclado numérico)','Iluminación RGB por tecla','Base de aluminio','USB-A con cable trenzado']],
 mouse:['Mouse gamer RGB del modelo reemplazado.',['Cuerpo ergonómico con iluminación RGB','Botones principales y rueda de desplazamiento','Base inferior con sensor óptico','Conexión USB por cable']],
 mon:['Monitor de 27 pulgadas con luz ambiental trasera.',['Resolución QHD 2560×1440 a 165 Hz','Panel IPS con bordes mínimos','Luz RGB trasera (ambilight)','Entradas DisplayPort y HDMI']],
 cpu:['Procesador: ejecuta las instrucciones de todos los programas.',['Tapa metálica (IHS) que reparte el calor','Sustrato con condensadores SMD','Pads dorados LGA en la cara inferior','24 núcleos · hasta 6 GHz']]});
