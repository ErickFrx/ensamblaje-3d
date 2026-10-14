/* Original educational geometry, created for this project. Units are illustrative. */
window.crearLaptopEducativa=function(T,pieza,M){
 const fans=[],teclas=[];const cache=new Map();const built=[];const assemblies={};const addPiece=pieza;pieza=(id,children)=>{assemblies[id]=children;children.forEach(g=>built.push(g));return addPiece(id,children)};
 const mat={shell:M(0x343d49,{roughness:.38,metalness:.78}),edge:M(0x89919e,{roughness:.36,metalness:.8}),black:M(0x10151c,{roughness:.72,metalness:.1}),board:M(0x09251f,{roughness:.9,metalness:0}),chip:M(0x252b31,{roughness:.68,metalness:.2}),gold:M(0xcda552,{roughness:.4,metalness:.7}),silver:M(0xb9c0c8,{roughness:.35,metalness:.8}),copper:M(0xb77843,{roughness:.45,metalness:.75})};
 function geo(k,fn){if(!cache.has(k))cache.set(k,fn());return cache.get(k)}
 function box(w,h,d,m,x=0,y=0,z=0){const b=new T.Mesh(geo(`b${w},${h},${d}`,()=>new T.BoxGeometry(w,h,d)),m);b.position.set(x,y,z);return b}
 function cylinder(r,h,m,x,y,z,n=20){const b=new T.Mesh(geo(`c${r},${h},${n}`,()=>new T.CylinderGeometry(r,r,h,n)),m);b.position.set(x,y,z);return b}
 function group(name,...children){const g=new T.Group();g.name=name;g.add(...children);return g}
 function screw(x,y,z){const g=group('Tornillo de fijación',cylinder(.09,.045,mat.silver,x,y,z));g.add(box(.105,.005,.019,mat.black,x,y+.025,z),box(.019,.005,.105,mat.black,x,y+.026,z));return g}
 function shape(points,depth,m,y=0,holes=[]){const s=new T.Shape();points.forEach(([x,z],i)=>i?s.lineTo(x,z):s.moveTo(x,z));s.closePath();holes.forEach(([x,z,r])=>{const h=new T.Path();h.absarc(x,z,r,0,Math.PI*2,true);s.holes.push(h)});const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:12});g.rotateX(Math.PI/2);g.translate(0,depth,0);const b=new T.Mesh(g,m);b.position.y=y;return b}
 function label(text,w,d,x,y,z,dark=false){const c=document.createElement('canvas');c.width=512;c.height=128;const a=c.getContext('2d');a.fillStyle=dark?'#15292d':'#dce1dd';a.fillRect(0,0,512,128);a.fillStyle=dark?'#d7f4ee':'#243335';a.font='600 29px sans-serif';a.textAlign='center';a.fillText(text,256,50);a.font='16px monospace';a.fillText('UNDC • ENSAMBLAJE EDUCATIVO',256,82);for(let i=0;i<60;i++)if(i%3)a.fillRect(90+i*5,96,i%2?2:3,19);const t=new T.CanvasTexture(c);const p=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshBasicMaterial({map:t}));p.rotation.x=-Math.PI/2;p.position.set(x,y,z);return p}
 function wire(points,r=.035,m=mat.black){return new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),24,r,7,false),m)}
 // Lower tub. Side ports are framed openings, not blocks floating on the wall.
 const lower=group('Carcasa inferior',shape([[-7.7,-5.35],[7.7,-5.35],[7.85,-5.1],[7.85,5.1],[7.6,5.35],[-7.6,5.35],[-7.85,5.1],[-7.85,-5.1]],.12,mat.shell,.06));
 lower.add(box(15.5,.78,.14,mat.shell,0,.48,-5.27),box(15.5,.78,.14,mat.shell,0,.48,5.27));
 for(const side of [-1,1]){
   const x=side*7.77;lower.add(box(.14,.12,10.5,mat.shell,x,.21,0),box(.14,.27,10.5,mat.shell,x,.745,0));
   let prev=-5.2;for(const [z,d] of [[-3.4,.82],[-1.8,.82],[-.3,1.05],[1.5,.5]]){const start=z-d/2;if(start>prev)lower.add(box(.14,.38,start-prev,mat.shell,x,.455,(start+prev)/2));prev=z+d/2;
     lower.add(box(.16,.24,d,mat.black,x-side*.04,.445,z));lower.add(box(.18,.035,d*.75,mat.silver,x,.40,z));if(d>.7)lower.add(box(.19,.045,d*.7,mat.board,x,.46,z));}
   lower.add(box(.14,.38,5.2-prev,mat.shell,x,.455,(5.2+prev)/2));
 }
 for(const x of [-7.2,0,7.2])for(const z of [-4.8,4.8])lower.add(cylinder(.17,.18,mat.edge,x,.24,z),screw(x,.35,z));
 for(const x of [-5.3,4.8])for(let i=0;i<13;i++)lower.add(box(.085,.01,1.45,mat.black,x+(i-6)*.17,.187,-3.0));
 for(const x of [-5,5])for(const z of [-4.7,4.7])lower.add(box(1,.06,.35,mat.black,x,.015,z));
 pieza('base',[lower]);
 // Original gaming layout: keep a free corridor next to the imported side ports.
 const layout={limits:{x:6.75,zMin:-4.9,zMax:4.95,yMax:.80},zones:{ram:[2.1,5.2,-.70,2.18],ssd:[-6.45,-2.8,0,1.03],battery:[-6.35,6.35,2.55,4.92],fans:[[-4.95,-2.8],[4.95,-2.8]]}};
 window.LAPTOP_LAYOUT=layout;
 const board=group('Placa gaming original',shape([[-6.65,-4.80],[-5.8,-4.8],[-5.8,-4.45],[-3.6,-4.45],[-3.6,-4.8],[3.6,-4.8],[3.6,-4.45],[5.8,-4.45],[5.8,-4.8],[6.65,-4.8],[6.65,1.70],[5.55,1.70],[5.55,2.35],[-1.6,2.35],[-1.6,1.60],[-6.65,1.60]],.065,mat.board,.245,[[-4.95,-2.8,1.20],[4.95,-2.8,1.20],[-6.3,1.3,.09],[6.3,1.3,.09],[0,-4.5,.09]]));
 for(const [x,z]of[[-6.3,1.3],[6.3,1.3],[0,-4.5]])board.add(cylinder(.16,.012,mat.gold,x,.315,z),screw(x,.345,z));
 const traces=group('Circuitos y soldaduras');
 for(let i=0;i<44;i++){const x=-2.6+(i%16)*.33,z=-4.2+Math.floor(i/16)*.14;traces.add(box(.008,.003,.22+(i%5)*.06,mat.gold,x,.313,z),box(.22,.003,.008,mat.gold,x+.1,.313,z+.1));}
 for(let i=0;i<22;i++){const x=-1.9+(i%8)*.43,z=-.75+Math.floor(i/8)*.62;traces.add(box(.009,.003,.38,mat.gold,x,.313,z),box(.23,.003,.009,mat.gold,x+.11,.313,z+.19));}
 board.add(traces);
 for(let i=0;i<26;i++){const x=-2.65+(i%13)*.42,z=-4.12+Math.floor(i/13)*.46;board.add(box(.22,.10,.23,mat.chip,x,.365,z),box(.22,.012,.035,mat.silver,x,.324,z-.13),box(.22,.012,.035,mat.silver,x,.324,z+.13));}
 for(let i=0;i<20;i++){const x=-2.2+(i%7)*.51,z=-.48+Math.floor(i/7)*.56;board.add(box(.10,.055,.19,mat.chip,x,.34,z),box(.15,.014,.055,mat.silver,x,.32,z-.08),box(.15,.014,.055,mat.silver,x,.32,z+.08));}
 for(const [x,z,w]of[[-6.3,1.3,.55],[-.8,1.95,.9],[6.2,.9,.55]]){board.add(box(w,.09,.22,mat.black,x,.36,z),box(w,.025,.06,mat.edge,x,.415,z-.06));for(let i=0;i<12;i++)board.add(box(w/25,.01,.08,mat.gold,x-w/2+(i+.5)*w/12,.315,z+.13));}
 board.add(label('MAINBOARD · GAMING',2.05,.34,-.25,.325,1.45,true));
 const cpu=group('CPU BGA soldada',box(1.55,.045,1.40,mat.board,-1.2,.337,-2.7),box(1.03,.045,.92,mat.silver,-1.2,.382,-2.7));cpu.add(label('CPU · BGA',.83,.30,-1.2,.407,-2.7,true));
 const gpu=group('GPU y VRAM',box(1.65,.045,1.40,mat.board,1.1,.337,-2.7),box(1.05,.045,.90,mat.silver,1.1,.382,-2.7));for(const x of[.03,2.17])for(const z of[-3.15,-2.35])gpu.add(box(.31,.055,.39,mat.chip,x,.34,z));board.add(gpu);
 // SO-DIMM contacts terminate in the sockets rather than floating above the card.
 for(const z of[.0,1.5]){board.add(box(3.18,.14,.18,mat.black,3.65,.36,z-.75));for(let i=0;i<24;i++)board.add(box(.05,.016,.12,mat.gold,2.2+i*.125,.43,z-.73));for(const x of[2.03,5.27])board.add(box(.10,.14,.18,mat.edge,x,.43,z+.20));}
 board.add(box(.18,.12,1.05,mat.black,-2.7,.37,.51),cylinder(.12,.10,mat.gold,-6.33,.36,.51));
 pieza('mobo',[board]);pieza('cpu',[cpu]);
 const ramParts=[];for(const z of[.0,1.5]){const card=group('SO-DIMM · módulo independiente',shape([[2.1,z-.68],[3.30,z-.68],[3.30,z-.52],[3.41,z-.52],[3.41,z-.68],[5.2,z-.68],[5.2,z+.68],[2.1,z+.68]],.045,mat.board,.395));for(let i=0;i<42;i++){const x=2.14+i*.072;if(x>3.25&&x<3.45)continue;card.add(box(.04,.009,.20,mat.gold,x,.445,z-.55));}for(let row=0;row<2;row++)for(let i=0;i<4;i++)card.add(box(.54,.060,.38,mat.chip,2.5+i*.76,.470,z-.17+row*.47));card.add(label('SO-DIMM',1.75,.20,3.65,.505,z+.44));ramParts.push(card)}pieza('ram',ramParts);
 const ssd=group('SSD NVMe M.2 2280',shape([[-6.45,0],[-2.8,0],[-2.8,1.01],[-6.45,1.01]],.045,mat.black,.39,[[-6.33,.505,.065]]));
 for(let i=0;i<16;i++){const z=.04+i*.06;if(z>.32&&z<.40)continue;ssd.add(box(.20,.009,.035,mat.gold,-2.9,.439,z));}for(const x of[-3.65,-4.60,-5.55])ssd.add(box(.63,.055,.64,mat.chip,x,.46,.50));ssd.add(label('NVMe · 2280',2.15,.40,-4.77,.493,.50),screw(-6.33,.46,.505));pieza('ssd',[ssd]);
 // Open centrifugal fan rings leave the animated blades visible.
 const cooling=group('Refrigeración · doble ventilador');
 for(const x of[-1.2,1.1]){cooling.add(box(1.45,.06,1.2,mat.copper,x,.465,-2.7));for(const dx of[-.78,.78])cooling.add(box(.23,.026,.22,mat.silver,x+dx,.43,-2.7),screw(x+dx,.47,-2.7));}
 for(const x of[-4.95,4.95]){const outline=Array.from({length:40},(_,i)=>[x+Math.cos(i*Math.PI/20)*1.22,-2.8+Math.sin(i*Math.PI/20)*1.22]);const housing=group('Voluta con abertura',shape(outline,.28,mat.black,.25,[[x,-2.8,1.07]]),cylinder(1.16,.035,mat.black,x,.265,-2.8,40));const rotor=group('Rotor visible');rotor.position.set(x,.47,-2.8);for(let i=0;i<19;i++){const blade=shape([[.26,-.055],[.85,-.14],[1.02,-.025],[.52,.105]],.026,mat.edge,0);const pivot=group('Aspa curva',blade);pivot.rotation.y=i*Math.PI*2/19;rotor.add(pivot)}rotor.add(cylinder(.28,.075,mat.black,0,.018,0));fans.push(rotor);housing.add(rotor);cooling.add(housing);for(let i=0;i<24;i++)cooling.add(box(.041,.25,.64,mat.silver,x-1.07+i*.093,.425,-4.46));cooling.add(box(2.3,.025,.65,mat.copper,x,.29,-4.46));}
 for(const y of[.62,.73])cooling.add(wire([[-4.95,y,-4.15],[-3.5,y,-4.1],[-2.3,y,-3.8],[-1.2,y,-2.7],[1.1,y,-2.7],[2.6,y,-3.8],[4.95,y,-4.15]],.055,mat.copper));
 for(const side of[-1,1])cooling.add(wire([[side*3.85,.40,-2.7],[side*3.4,.36,-1.45],[side*2.8,.37,-1.0]],.016));pieza('cool',[cooling]);
 const battery=group('Batería · cuatro celdas y arnés',shape([[-6.35,2.62],[-5.7,2.62],[-5.7,2.55],[5.7,2.55],[5.7,2.62],[6.35,2.62],[6.35,4.80],[5.7,4.92],[-5.7,4.92],[-6.35,4.80]],.28,mat.black,.22));
 const cellMat=M(0x303743,{roughness:.76});for(let i=0;i<4;i++){const x=-4.65+i*3.1;battery.add(box(2.94,.045,2.05,cellMat,x,.52,3.73));for(const dz of[-1.02,1.02])battery.add(box(2.94,.009,.032,mat.edge,x,.55,3.73+dz));}battery.add(label('Li-ion · NO PERFORAR',4.9,.63,0,.553,3.68));for(const x of[-6.48,6.48])battery.add(box(.30,.045,.50,mat.black,x,.28,3.8),screw(x,.33,3.8));for(let i=0;i<5;i++)battery.add(wire([[-5.78+i*.055,.50,2.62],[-6.10+i*.055,.39,2.23],[-6.17+i*.055,.39,1.48]],.017,i<2?M(0x9b2637):mat.black));battery.add(box(.43,.09,.23,mat.black,-6.06,.37,1.37));pieza('bat',[battery]);
 // Palmrest as a single frame with a physical keyboard opening.
 const topShape=new T.Shape();topShape.moveTo(-7.8,-5.3);topShape.lineTo(7.8,-5.3);topShape.lineTo(7.8,5.3);topShape.lineTo(-7.8,5.3);topShape.closePath();const cut=new T.Path();cut.moveTo(-6.7,-4.25);cut.lineTo(-6.7,1.10);cut.lineTo(6.7,1.10);cut.lineTo(6.7,-4.25);cut.closePath();topShape.holes.push(cut);
 const topGeo=new T.ExtrudeGeometry(topShape,{depth:.15,bevelEnabled:true,bevelSize:.06,bevelThickness:.035,bevelSegments:2});topGeo.rotateX(Math.PI/2);topGeo.translate(0,.15,0);const palm=new T.Mesh(topGeo,mat.shell);palm.position.y=.87;
 const deck=group('Palmrest, teclado y touchpad',palm,box(13.5,.06,5.5,mat.black,0,.87,-1.55));
 const keyMat=M(0x222b37,{roughness:.7,metalness:.12,emissive:0x142a38,emissiveIntensity:0});teclas.push(keyMat);
 const alphabet=['1234567890⌫','QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];
 for(let row=0;row<5;row++){for(let col=0;col<14;col++){const x=-6.12+col*.94,z=-3.72+row*.94;deck.add(box(.83,.10,.75,keyMat,x,.98,z));if(row<4&&col<alphabet[row].length){const c=document.createElement('canvas');c.width=64;c.height=64;const a=c.getContext('2d');a.fillStyle='#dde4eb';a.font='30px sans-serif';a.textAlign='center';a.fillText(alphabet[row][col],32,41);const m=new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false});const letter=new T.Mesh(new T.PlaneGeometry(.39,.39),m);letter.rotation.x=-Math.PI/2;letter.position.set(x,1.039,z);deck.add(letter)}}}
 deck.add(box(4.5,.09,.7,keyMat,-.35,.99,.95),box(4.7,.025,2.55,mat.edge,0,1.055,3.15),box(4.60,.032,2.45,mat.black,0,1.06,3.15));
 for(const side of[-1,1])for(let i=0;i<22;i++)deck.add(box(.28,.01,.032,mat.black,side*7.1,1.04,-3.5+i*.20));deck.add(cylinder(.20,.035,mat.black,7,1.07,3.8),label('UNDC',1.15,.38,-5.6,1.041,3.1,true));pieza('deck',[deck]);
 // Lid pivots at its hinge, includes bezel, webcam, eDP cable and lit display.
 const texOn=crearPantallaUNDC(T);
 const offCanvas=document.createElement('canvas');offCanvas.width=1280;offCanvas.height=720;const offCtx=offCanvas.getContext('2d');offCtx.fillStyle='#06090e';offCtx.fillRect(0,0,1280,720);
 const texOff=new T.CanvasTexture(offCanvas),scr=new T.MeshBasicMaterial({map:texOff});
 const lid=group('Pantalla y bisagras',box(15.7,9.85,.20,mat.shell,0,4.95,0),box(15.35,9.45,.055,mat.black,0,4.95,.13));const display=new T.Mesh(new T.PlaneGeometry(14.65,8.79),scr);display.position.set(0,4.95,.166);lid.add(display);
 const webcam=new T.Mesh(new T.SphereGeometry(.055,12,8),mat.black);webcam.position.set(0,9.60,.18);lid.add(webcam);for(const x of[-6.2,6.2]){const h=cylinder(.18,.8,mat.edge,x,0,0);h.rotation.z=Math.PI/2;lid.add(h)}lid.add(wire([[-5.7,.1,.1],[-5.7,.3,.1],[-5.2,.4,.2]],.07));lid.position.set(0,1.0,-5.2);lid.rotation.x=-.24;
 // pieza() sets group origin; preserve the articulated lid as its child.
 pieza('lid',[lid]);
 // Merge static meshes by material inside each named assembly. Animated rotors stay separate.
 function merge(root){
  root.updateMatrixWorld(true);const inv=new T.Matrix4().copy(root.matrixWorld).invert(),buckets=new Map(),remove=[];
  root.traverse(o=>{if(!o.isMesh)return;let p=o.parent;while(p&&p!==root){if(fans.includes(p))return;p=p.parent}if(Array.isArray(o.material))return;
   let g=o.geometry.clone();g.applyMatrix4(new T.Matrix4().multiplyMatrices(inv,o.matrixWorld));if(g.index){const n=g.toNonIndexed();g.dispose();g=n}if(!g.attributes.normal)g.computeVertexNormals();if(!g.attributes.uv)g.setAttribute('uv',new T.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
   if(!buckets.has(o.material))buckets.set(o.material,[]);buckets.get(o.material).push(g);remove.push(o);
  });
  remove.forEach(o=>o.parent.remove(o));
  for(const [m,geos]of buckets){const g=new T.BufferGeometry();for(const [name,size]of [['position',3],['normal',3],['uv',2]]){let length=0;geos.forEach(x=>length+=x.attributes[name].array.length);const out=new Float32Array(length);let at=0;geos.forEach(x=>{out.set(x.attributes[name].array,at);at+=x.attributes[name].array.length});g.setAttribute(name,new T.BufferAttribute(out,size))}geos.forEach(x=>x.dispose());root.add(new T.Mesh(g,m));}
 }
 window.LAPTOP_MESH_BOUNDS={};for(const [id,roots]of Object.entries(assemblies)){const boxes=[];for(const root of roots){root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh){const b=new T.Box3().setFromObject(o);boxes.push({min:b.min.toArray(),max:b.max.toArray()})}})}window.LAPTOP_MESH_BOUNDS[id]=boxes;}
 built.forEach(merge);fans.forEach(merge);
 return {fans,teclas,scr,texOn,texOff};
};
