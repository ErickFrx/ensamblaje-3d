const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
test('los once GLB incluidos cumplen el contrato del cargador local',()=>{
 const ctx={};ctx.window=ctx;vm.createContext(ctx);
 for(const file of fs.readdirSync(path.join(root,'models')).filter(f=>f.endsWith('.js')))vm.runInContext(fs.readFileSync(path.join(root,'models',file),'utf8'),ctx);
 assert.equal(Object.keys(ctx.GLB).length,11);
 for(const [id,b64]of Object.entries(ctx.GLB)){
  const u=Buffer.from(b64,'base64');assert.equal(u.readUInt32LE(0),0x46546c67,id);assert.equal(u.readUInt32LE(4),2,id);assert.equal(u.readUInt32LE(8),u.length,id);
  const jl=u.readUInt32LE(12),bo=28+jl,J=JSON.parse(u.subarray(20,20+jl));assert.equal(u.readUInt32LE(24+jl),0x004e4942,id);assert(!J.extensionsRequired?.length,id);
  assert(J.nodes.every(n=>n.mesh!=null&&!n.children?.length),id);
  for(const mesh of J.meshes){assert.equal(mesh.primitives.length,1,id);const p=mesh.primitives[0];
   for(const [key,type,c]of [[p.attributes.POSITION,5126,3],[p.attributes.NORMAL,5126,3],[p.attributes.TEXCOORD_0,5126,2],[p.indices,5125,1]]){
    const a=J.accessors[key],v=J.bufferViews[a.bufferView];assert(!a.sparse,id);assert.equal(v.buffer,0,id);assert.equal(a.componentType,type,id);assert.equal(a.type,({1:'SCALAR',2:'VEC2',3:'VEC3'})[c],id);assert(!v.byteStride||v.byteStride===c*4,id);assert((a.byteOffset||0)+a.count*c*4<=v.byteLength,id);assert(bo+(v.byteOffset||0)+v.byteLength<=u.length,id);
   }
  }
 }
});
test('los HTML no dependen de recursos locales ausentes',()=>{
 for(const file of ['index.html','ensamblaje3d_con_laptop/ensamblaje3d/laptop.html']){
  const html=fs.readFileSync(path.join(root,file),'utf8');for(const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)){
   const ref=match[1];if(/^(?:https?:|data:|blob:|#|mailto:|javascript:)/.test(ref))continue;
   assert(fs.existsSync(path.resolve(root,path.dirname(file),ref.split(/[?#]/)[0])),file+' → '+ref);
  }
 }
});
test('cada etapa declara su guía y la cobertura de audio real',()=>{
 const m=JSON.parse(fs.readFileSync(path.join(root,'audio/sky/manifiesto.json')));assert.equal(m.clips.length,10);assert.equal(m.pc.length,13);assert.equal(m.laptop.length,10);
 for(const clip of m.clips){assert(clip.texto.length>0);assert(fs.statSync(path.join(root,'audio/sky',clip.archivo)).size>1000)}
 for(const step of [...m.pc,...m.laptop]){assert(step.id&&step.titulo&&step.guia);if(step.clip!==null)assert.equal(step.texto_audible,m.clips[step.clip].texto);else assert.equal(step.texto_audible,null)}
});
