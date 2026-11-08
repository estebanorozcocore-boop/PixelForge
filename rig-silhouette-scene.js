/* PixelForge · silueta maestra articulada — mismo modelo, 32 poses interpoladas. */
(function () {
  'use strict';
  const W=192, H=128, GROUND=113, N=32, BLACK='#08090D';
  const KEYS=[
    {f:0,  name:'Guardia',         hx:77, hy:81, torso:-0.07, gx:104, gy:72, a:25,   cape:0.02, spark:0},
    {f:4,  name:'Preparación',    hx:75, hy:84, torso:-0.18, gx:100, gy:59, a:-30,  cape:0.15, spark:0},
    {f:9,  name:'Elevación',      hx:74, hy:85, torso:-0.24, gx:102, gy:22, a:-166, cape:0.38, spark:0},
    {f:12, name:'Tensión',        hx:74, hy:87, torso:-0.28, gx:103, gy:20, a:-168, cape:0.48, spark:0},
    {f:15, name:'Descenso',       hx:82, hy:82, torso: 0.10, gx:111, gy:47, a:-64,  cape:1.0,  spark:0},
    {f:17, name:'Impacto',        hx:84, hy:87, torso: 0.35, gx:112, gy:79, a:22,   cape:1.2,  spark:1},
    {f:19, name:'Retención',     hx:84, hy:87, torso: 0.35, gx:112, gy:79, a:22,   cape:1.05, spark:0.6},
    {f:22, name:'Arrastre',      hx:82, hy:87, torso: 0.24, gx:109, gy:79, a:27,   cape:0.65, spark:0.25},
    {f:26, name:'Tirón pesado',  hx:80, hy:83, torso: 0.07, gx:105, gy:72, a:28,   cape:0.26, spark:0},
    {f:31, name:'Guardia',       hx:77, hy:81, torso:-0.07, gx:104, gy:72, a:25,   cape:0.02, spark:0}
  ];
  const rad=d=>d*Math.PI/180;
  const lerp=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>t*t*(3-2*t);
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const mk=(x,y)=>({x,y});
  function poseAt(frame) {
    const f=clamp(frame|0,0,N-1);
    let i=0;while(i<KEYS.length-2&&f>KEYS[i+1].f)i++;
    const left=KEYS[i],right=KEYS[i+1];
    let t=(f-left.f)/(right.f-left.f);
    if(left.f===12)t=t*t;
    else if(left.f===15)t=t*t*(2-t);
    else if(left.f===19||left.f===22)t=1-Math.pow(1-t,2.4);
    else t=smooth(t);
    const out={f, phase:left.name};
    for(const key of ['hx','hy','torso','gx','gy','a','cape','spark'])out[key]=lerp(left[key],right[key],t);
    return out;
  }
  function twoBone(a,b,l1,l2,side){
    let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;
    const limited=Math.min(d,l1+l2-0.02),unitX=dx/d,unitY=dy/d;
    const h=clamp((l1*l1-l2*l2+limited*limited)/(2*limited),-l1,l1);
    const p=Math.sqrt(Math.max(0,l1*l1-h*h));
    return mk(a.x+unitX*h-side*unitY*p,a.y+unitY*h+side*unitX*p);
  }
  function rigAt(f){
    const p=poseAt(f), tilt=p.torso;
    const hip=mk(p.hx,p.hy),shoulder=mk(p.hx+Math.sin(tilt)*28+5,p.hy-Math.cos(tilt)*28);
    const neck=mk(shoulder.x+1,shoulder.y-7);
    const head=mk(neck.x+2+Math.sin(tilt)*8,neck.y-9);
    const rearFoot=mk(47,GROUND-4), frontFoot=mk(111,GROUND-4);
    const rearKnee=twoBone(hip,rearFoot,25,30,-1),frontKnee=twoBone(hip,frontFoot,25,29,1);
    const grip=mk(p.gx,p.gy),dir=mk(Math.cos(rad(p.a)),Math.sin(rad(p.a)));
    const farShoulder=mk(shoulder.x-6,shoulder.y+3),nearShoulder=mk(shoulder.x+6,shoulder.y+3);
    const farWrist=mk(grip.x-9*dir.x,grip.y-9*dir.y),nearWrist=mk(grip.x,grip.y);
    const farElbow=twoBone(farShoulder,farWrist,18,19,-1),nearElbow=twoBone(nearShoulder,nearWrist,19,20,1);
    return {...p,hip,shoulder,neck,head,rearFoot,frontFoot,rearKnee,frontKnee,grip,dir,farShoulder,nearShoulder,farWrist,nearWrist,farElbow,nearElbow};
  }
  function path(ctx,coords){ctx.beginPath();coords.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1]));ctx.closePath();ctx.fill();}
  function disk(ctx,x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.fill();}
  function limb(ctx,a,b,r1,r2){
    const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,nx=-dy/d,ny=dx/d;
    path(ctx,[[a.x+nx*r1,a.y+ny*r1],[b.x+nx*r2,b.y+ny*r2],[b.x-nx*r2,b.y-ny*r2],[a.x-nx*r1,a.y-ny*r1]]);
    disk(ctx,a.x,a.y,r1);disk(ctx,b.x,b.y,r2);
  }
  function drawCape(ctx,r){
    const x=r.shoulder.x-8,y=r.shoulder.y+2,s=r.cape;
    ctx.fillStyle=BLACK;
    const pts=[
      [[x,y],[x-12,y+6],[x-27,y+1+s*5],[x-42,y+9+s*8],[x-58,y+22+s*7],[x-47,y+20+s*11],[x-66,y+33+s*10],[x-37,y+33+s*5],[x-18,y+23]],
      [[x-1,y+4],[x-15,y+16],[x-34,y+17+s*3],[x-58,y+31+s*6],[x-48,y+35+s*6],[x-54,y+44+s*6],[x-32,y+35+s*3],[x-11,y+25]],
      [[x-4,y+15],[x-13,y+28],[x-28,y+35+s*3],[x-44,y+45+s*6],[x-32,y+46+s*4],[x-40,y+54+s*4],[x-18,y+43+s*3],[x-2,y+33]]
    ];
    pts.forEach(p=>path(ctx,p));
    path(ctx,[[x-4,y+1],[x+5,y+5],[x+2,y+31],[x-20,y+24]]);
  }
  function drawBody(ctx,r){
    ctx.fillStyle=BLACK;
    limb(ctx,r.hip,r.rearKnee,10,7);limb(ctx,r.rearKnee,r.rearFoot,7,6);
    limb(ctx,r.hip,r.frontKnee,10,7);limb(ctx,r.frontKnee,r.frontFoot,7,6);
    path(ctx,[[r.rearFoot.x-10,GROUND-2],[r.rearFoot.x+8,GROUND-2],[r.rearFoot.x+11,GROUND],[r.rearFoot.x-12,GROUND]]);
    path(ctx,[[r.frontFoot.x-7,GROUND-4],[r.frontFoot.x+12,GROUND-4],[r.frontFoot.x+16,GROUND],[r.frontFoot.x-8,GROUND]]);
    limb(ctx,r.hip,r.shoulder,14,17);
    const hip=r.hip;
    path(ctx,[[hip.x-16,hip.y-3],[hip.x+16,hip.y-5],[hip.x+19,hip.y+5],[hip.x-15,hip.y+10]]);
    path(ctx,[[hip.x-12,hip.y+4],[hip.x-18,hip.y+23],[hip.x-4,hip.y+13],[hip.x+2,hip.y+6]]);
    path(ctx,[[hip.x+5,hip.y+5],[hip.x+16,hip.y+19],[hip.x+19,hip.y+4]]);
    limb(ctx,r.farShoulder,r.farElbow,9,7);limb(ctx,r.farElbow,r.farWrist,7,5);
    const h=r.head;
    disk(ctx,h.x,h.y,9);
    path(ctx,[[h.x+4,h.y-5],[h.x+14,h.y-2],[h.x+12,h.y+4],[h.x+5,h.y+6]]);
    path(ctx,[[h.x-6,h.y-4],[h.x-18,h.y-15],[h.x-14,h.y-9],[h.x-26,h.y-10],[h.x-16,h.y-2],[h.x-23,h.y+3],[h.x-12,h.y+2],[h.x-16,h.y+9],[h.x-3,h.y+6]]);
    disk(ctx,r.nearShoulder.x,r.nearShoulder.y,10);
    limb(ctx,r.nearShoulder,r.nearElbow,10,8);
    limb(ctx,r.nearElbow,r.nearWrist,8,6);
    disk(ctx,r.nearWrist.x,r.nearWrist.y,6);
  }
  function drawSword(ctx,r){
    ctx.save();ctx.translate(r.grip.x,r.grip.y);ctx.rotate(rad(r.a));ctx.fillStyle=BLACK;
    path(ctx,[[-21,-3],[-12,-5],[-12,5],[-21,3]]);
    path(ctx,[[-15,-3],[12,-4],[12,4],[-15,3]]);
    path(ctx,[[9,-14],[14,-14],[18,-9],[18,9],[14,14],[9,14]]);
    path(ctx,[[17,-10],[30,-11],[35,-14],[42,-11],[50,-12],[59,-10],[71,-9],[77,-5],[86,0],[77,5],[71,9],[59,10],[50,12],[42,11],[35,14],[30,11],[17,10]]);
    path(ctx,[[45,-11],[52,-15],[54,-10]]);
    path(ctx,[[63,9],[68,14],[72,8]]);
    ctx.restore();
  }
  function drawImpact(ctx,r){
    if(r.spark<=.005)return;
    const t=r.f-17,opacity=clamp(r.spark,0,1),cx=177,cy=GROUND-2;
    ctx.fillStyle=BLACK;
    const spread=7+Math.min(12,Math.max(0,t))*2.1;
    for(let i=0;i<7;i++){
      const theta=rad(210+i*20),len=(8+(i%3)*4+spread)*(0.48+opacity*.65);
      const x=cx+(i-3)*2;
      path(ctx,[[x,cy],[x+Math.cos(theta)*len,cy+Math.sin(theta)*len],[x+((i-3)*2.5),cy-3]]);
    }
    for(let i=0;i<9;i++){
      const x=149+((i*19)%41)+(t*2)%17,y=GROUND-13-((i*13)%16)-Math.min(3,t);
      if(x>0&&x<W&&y>0)ctx.fillRect(x,y,1+(i%2),2+(i%3));
    }
    if(t>0)ctx.fillRect(141+Math.min(t*2,19),GROUND-2,36,1);
  }
  function capture(ctx){
    const rgba=ctx.getImageData(0,0,W,H).data,cel=new Array(W*H).fill(null);
    for(let i=0;i<cel.length;i++)if(rgba[i*4+3]>120)cel[i]=BLACK;
    ctx.clearRect(0,0,W,H);return cel;
  }
  function createRigSilhouetteScene(){
    const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    const cels=[[],[],[],[]];
    for(let f=0;f<N;f++){
      const r=rigAt(f);
      drawCape(ctx,r);cels[0].push(capture(ctx));
      drawBody(ctx,r);cels[1].push(capture(ctx));
      drawSword(ctx,r);cels[2].push(capture(ctx));
      drawImpact(ctx,r);cels[3].push(capture(ctx));
    }
    return {width:W,height:H,fps:24,frame:0,selected:2,layers:[
      {id:1,name:'01 · Capa y faldones',visible:true,cels:cels[0]},
      {id:2,name:'02 · Silueta articulada',visible:true,cels:cels[1]},
      {id:3,name:'03 · Espadón rígido',visible:true,cels:cels[2]},
      {id:4,name:'04 · Impacto y fragmentos',visible:true,cels:cels[3]}
    ]};
  }
  function drawRigGuides(ctx,frame){
    const r=rigAt(frame);ctx.clearRect(0,0,W,H);ctx.lineCap='round';ctx.lineWidth=1;
    const lines=[[r.hip,r.shoulder],[r.hip,r.rearKnee],[r.rearKnee,r.rearFoot],[r.hip,r.frontKnee],[r.frontKnee,r.frontFoot],
      [r.farShoulder,r.farElbow],[r.farElbow,r.farWrist],[r.nearShoulder,r.nearElbow],[r.nearElbow,r.nearWrist]];
    ctx.strokeStyle='#4de0ec';ctx.fillStyle='#f7a644';
    lines.forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();});
    [r.hip,r.shoulder,r.head,r.rearKnee,r.frontKnee,r.rearFoot,r.frontFoot,r.farShoulder,r.farElbow,r.farWrist,r.nearShoulder,r.nearElbow,r.nearWrist].forEach(p=>disk(ctx,p.x,p.y,1.5));
    ctx.strokeStyle='#f7a644';ctx.beginPath();ctx.moveTo(r.grip.x,r.grip.y);ctx.lineTo(r.grip.x+86*r.dir.x,r.grip.y+86*r.dir.y);ctx.stroke();
    disk(ctx,r.grip.x,r.grip.y,2);
  }
  window.createRigSilhouetteScene=createRigSilhouetteScene;
  window.pfRigPoseAt=poseAt;
  window.pfRigAt=rigAt;
  window.pfRigKeyframes=KEYS;
  window.pfRigDrawGuides=drawRigGuides;
})();


/* Persistencia RLE: escenas articuladas con píxeles editables y espacio reducido. */
(function(){
'use strict';
function packRig(project){
 const palette=[null],lookup=new Map([[null,0]]);
 for(const l of project.layers)for(const cel of l.cels)for(const color of cel){
  if(!lookup.has(color)){
   if(palette.length>=65536)throw Error('La paleta supera 65535 colores.');
   lookup.set(color,palette.length);palette.push(color);
  }
 }
 const depth=palette.length<=256?1:2;
 function encode(cel){
  let bytes=[],i=0;
  while(i<cel.length){
   const val=cel[i];let j=i+1;while(j<cel.length&&j-i<255&&cel[j]===val)j++;
   const idx=lookup.get(val);bytes.push(j-i,idx&255);
   if(depth===2)bytes.push(idx>>8);
   i=j;
  }
  let raw='';for(let k=0;k<bytes.length;k+=8192)raw+=String.fromCharCode(...bytes.slice(k,k+8192));
  return btoa(raw);
 }
 return{format:'pf-rle-v1',width:project.width,height:project.height,fps:project.fps,frame:project.frame,selected:project.selected,
  palette,depth,layers:project.layers.map(l=>({id:l.id,name:l.name,visible:l.visible,cels:l.cels.map(encode)}))};
}
function unpackRig(item){
 if(item?.format!=='pf-rle-v1')throw Error('Formato de silueta inválido.');
 const{width,height,depth,palette,layers}=item;
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<8||height<8||width>512||height>512||
   ![1,2].includes(depth)||!Array.isArray(palette)||palette[0]!==null||palette.length>65536||
   !Array.isArray(layers)||!layers.length||layers.length>24||!Array.isArray(layers[0].cels)||!layers[0].cels.length||layers[0].cels.length>72||
   width*height*layers.length*layers[0].cels.length>4194304||layers.some(l=>l.cels.length!==layers[0].cels.length))
   throw Error('Proyecto de silueta inválido o excesivo.');
 function decode(b64){
  if(typeof b64!=='string')throw Error('Fotograma inválido.');
  const raw=atob(b64),chunk=1+depth;
  if(raw.length%chunk)throw Error('Longitud RLE inválida.');
  const cel=new Array(width*height);let pos=0;
  for(let k=0;k<raw.length;k+=chunk){
   const run=raw.charCodeAt(k),idx=raw.charCodeAt(k+1)+(depth===2?256*raw.charCodeAt(k+2):0);
   if(!run||idx>=palette.length||pos+run>cel.length)throw Error('Secuencia RLE corrupta.');
   cel.fill(palette[idx],pos,pos+run);pos+=run;
  }
  if(pos!==cel.length)throw Error('Faltan píxeles RLE.');
  return cel;
 }
 return{width,height,fps:item.fps,frame:item.frame,selected:item.selected,
  layers:layers.map(l=>({id:l.id,name:l.name,visible:l.visible,cels:l.cels.map(decode)}))};
}
window.pfRigPack=packRig;window.pfRigUnpack=unpackRig;
})();
