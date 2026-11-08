/* PixelForge: Proyectil Espectral, 24 fotogramas a 24 FPS, 4 capas editables.
   Seis fases: ignición, formación, entrelazado, aceleración, descarga y disipación. */
function createGreenProjectileScene(){
 'use strict';
 const width=224,height=112,frames=24,fps=24,background='#262B27';
 const layers=[
  {id:1,name:'01 · Fondo carbón',visible:true,cels:[]},
  {id:2,name:'02 · Bruma y estela profunda',visible:true,cels:[]},
  {id:3,name:'03 · Cintas de energía',visible:true,cels:[]},
  {id:4,name:'04 · Núcleo y partículas',visible:true,cels:[]}
 ];
 const palette=[];
 function addRamp(a,b,n){
  const rgb=s=>[1,3,5].map(j=>parseInt(s.slice(j,j+2),16));
  const aa=rgb(a),bb=rgb(b);
  for(let j=0;j<n;j++){const t=j/(n-1);palette.push(aa.map((v,k)=>Math.round(v*(1-t)+bb[k]*t)));}
 }
 addRamp('#161F1C','#41463B',34);
 addRamp('#1A2A24','#42664A',32);
 addRamp('#244536','#689A5B',32);
 addRamp('#456F4C','#98CE78',32);
 addRamp('#75A965','#CAED9A',32);
 addRamp('#A6D881','#F4FFE2',32);
 addRamp('#C9ECA0','#FFFFFF',24);
 const hex=palette.map(c=>'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase());
 const cache=new Map(),PI2=Math.PI*2;
 function nearest(r,g,b){
  const key=((r>>3)<<10)|((g>>3)<<5)|(b>>3);
  if(cache.has(key))return cache.get(key);
  let best=0,dmin=Infinity;
  for(let i=0;i<palette.length;i++){const c=palette[i],dr=r-c[0],dg=g-c[1],db=b-c[2],d=dr*dr*.82+dg*dg+db*db*.68;if(d<dmin){best=i;dmin=d;}}
  cache.set(key,best);return best;
 }
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 if(!ctx)throw Error('Lienzo 2D no disponible.');
 const sat=t=>Math.max(0,Math.min(1,t)),ease=t=>{t=sat(t);return t*t*(3-2*t);};
 const makePoints=(x0,x1,fn,n=64)=>Array.from({length:n+1},(_,i)=>{const t=i/n;return[x0+(x1-x0)*t,fn(t)]});
 function stroke(points,w,from,to,a,blur=0){
  const grad=ctx.createLinearGradient(...points[0],...points.at(-1));
  grad.addColorStop(0,from);grad.addColorStop(1,to);
  ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);
  const prev=ctx.globalAlpha;ctx.globalAlpha*=a;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=grad;
  if(blur){ctx.shadowColor=to;ctx.shadowBlur=blur;}
  ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=prev;
 }
 function ribbon(xs,ys,thick,opacity,from,to){
  const n=56;ctx.beginPath();
  for(let i=0;i<=n;i++){const t=i/n,x=xs(t),y=ys(t)-thick(t)*.5;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
  for(let i=n;i>=0;i--){const t=i/n;ctx.lineTo(xs(t),ys(t)+thick(t)*.5);}ctx.closePath();
  const grad=ctx.createLinearGradient(xs(.1),0,xs(1),0);
  grad.addColorStop(0,from);grad.addColorStop(.7,to);grad.addColorStop(1,to);
  const prev=ctx.globalAlpha;ctx.globalAlpha*=opacity;ctx.fillStyle=grad;ctx.fill();ctx.globalAlpha=prev;
 }
 function spark(x,y,size,col,opacity){
  ctx.save();ctx.translate(x,y);ctx.globalAlpha*=opacity;ctx.fillStyle=col;
  ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(size*.24,-size*.22);ctx.lineTo(size,0);
  ctx.lineTo(size*.24,size*.21);ctx.lineTo(0,size);ctx.lineTo(-size*.24,size*.21);
  ctx.lineTo(-size,0);ctx.lineTo(-size*.24,-size*.22);ctx.closePath();ctx.fill();ctx.restore();
 }
 function paint(frame,part){
  const t=frame/23,pulse=frame*.43;
  const born=ease(t*4.3),stream=ease((t-.11)*6.4),charge=ease((t-.46)*6.2);
  const release=ease((t-.71)*9.2),fade=ease((t-.83)*6.0),opacity=1-.92*fade;
  const lead=125+66*ease(t*1.65)+30*release,cy=56+1.8*Math.sin(pulse*.88)-4*release;
  const tail=lead-(60+125*stream),L=s=>lead-s;
  ctx.clearRect(0,0,width,height);
  if(part===0){
   ctx.fillStyle=background;ctx.fillRect(0,0,width,height);
   const g=ctx.createRadialGradient(lead-30,cy,10,lead-32,cy,165);
   g.addColorStop(0,'#343E31');g.addColorStop(.35,'#2B332A');g.addColorStop(1,background);
   ctx.fillStyle=g;ctx.fillRect(0,0,width,height);
   for(let j=0;j<125;j++){const x=(j*173+19)%width,y=(j*83+31)%height;
    ctx.fillStyle=j%4===0?'rgba(106,125,98,0.065)':'rgba(11,20,14,0.045)';ctx.fillRect(x,y,1,1);}
  }else if(part===1){
   ctx.save();ctx.globalAlpha=opacity;
   const x=lead-14,g=ctx.createRadialGradient(x,cy,2,x,cy,28+12*charge);
   g.addColorStop(0,'rgba(184,244,122,.64)');g.addColorStop(.25,'rgba(108,183,94,.24)');
   g.addColorStop(.65,'rgba(75,143,73,.09)');g.addColorStop(1,'rgba(58,119,67,0)');
   ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,cy,32+12*charge,27+8*charge,0,0,PI2);ctx.fill();
   for(let j=0;j<4;j++){
    const x0=tail-11+j*5,x1=lead-6,amp=13+8*(j%2);
    stroke(makePoints(x0,x1,u=>cy+(j-1.45)*7*Math.sin(Math.PI*u)+amp*Math.sin(Math.PI*(1.45*u+.21*j)+pulse*.24)*(1-u)*u),
     8+3*j,'rgba(46,96,67,.10)','rgba(138,215,105,.36)',(.43+.1*j)*born,8);
   }ctx.restore();
  }else if(part===2){
   if(born<.01)return;
   ctx.save();ctx.globalAlpha=opacity;
   const configs=[
    [-1.8,21,2.1,12.5,.56,'rgba(42,93,56,.05)','rgba(129,214,94,.88)',0],
    [1.6,18,2.6,9.2,.67,'rgba(35,82,50,.05)','rgba(190,248,126,.92)',2.3],
    [-1.4,25,2.0,8.7,.62,'rgba(31,76,47,.03)','rgba(92,180,96,.9)',3.7],
    [.5,12,3.2,5.5,.60,'rgba(39,88,55,.08)','rgba(212,250,155,.94)',5.2]
   ];
   configs.forEach((p,j)=>{
    const [shift,amp,period,w,a,from,to,ph]=p,x0=tail+j*8-8,x1=lead-5+j*1.5;
    const xs=u=>x0+(x1-x0)*u;
    const ys=u=>cy+shift*5+Math.sin((u*period*Math.PI)+pulse*.30+ph)*amp*(1-u)*Math.sin(Math.PI*u*.9);
    const thick=u=>Math.max(.15,w*Math.pow(Math.sin(Math.PI*u),.82)*(.45+.8*u))*(.6+.4*born);
    ribbon(xs,ys,thick,a*born,from,to);
    if(j<3){
     stroke(makePoints(x0+16,x1-5,u=>ys(.15+.8*u)-thick(.15+.8*u)*.13),1.35,
      'rgba(106,178,90,0)','rgba(219,255,149,.85)',.3*stream,2);
    }
   });
   const x=lead-24,y=cy;ctx.fillStyle='rgba(164,237,115,.60)';ctx.beginPath();
   ctx.moveTo(x-24,y-14);ctx.quadraticCurveTo(x+2,y-29,x+15,y-15);
   ctx.lineTo(x+6,y-1);ctx.quadraticCurveTo(x-11,y-12,x-24,y-14);ctx.fill();
   ctx.restore();
  }else if(part===3){
   if(born<.01)return;
   ctx.save();ctx.globalAlpha=opacity;
   const hx=lead+4,hy=cy,bloom=ctx.createRadialGradient(hx-12,hy,0,hx-10,hy,27);
   bloom.addColorStop(0,'rgba(225,255,172,.82)');bloom.addColorStop(.35,'rgba(169,246,119,.31)');
   bloom.addColorStop(1,'rgba(96,180,105,0)');
   ctx.fillStyle=bloom;ctx.beginPath();ctx.ellipse(hx-10,hy,31,23,0,0,PI2);ctx.fill();
   ctx.fillStyle='#91D579';ctx.beginPath();ctx.moveTo(L(40),cy+3);ctx.lineTo(L(12),cy-15);
   ctx.lineTo(L(18),cy-30-9*charge);ctx.quadraticCurveTo(L(4),cy-13,L(0),cy-9);
   ctx.lineTo(lead+14,cy-2);ctx.lineTo(L(3),cy+10);
   ctx.lineTo(L(8),cy+22+7*charge);ctx.lineTo(L(19),cy+7);ctx.closePath();ctx.fill();
   ctx.fillStyle='#D6FCA2';ctx.beginPath();ctx.moveTo(L(24),cy+5);
   ctx.quadraticCurveTo(L(7),cy-7,lead+7,cy-9);
   ctx.lineTo(lead+18,cy-1);ctx.lineTo(lead+3,cy+5);ctx.lineTo(L(12),cy+13);ctx.closePath();ctx.fill();
   ctx.fillStyle='#F3FFE0';ctx.beginPath();ctx.moveTo(L(9),cy-4);ctx.lineTo(lead+17,cy-1);
   ctx.lineTo(L(2),cy+4);ctx.closePath();ctx.fill();
   for(let j=0;j<12;j++){
    const angle=j*2.39996+frame*.31,dist=17+(j*17)%70;
    const x=hx-dist-(frame%3),y=cy+Math.sin(angle)*((j*7)%24),sz=(j%4===0?2.8:1.2)+charge*.6;
    spark(x,y,sz,j%3?'#B9EC84':'#EFFFC2',born*(.32+.17*Math.sin(j+frame*.3)**2));
   }ctx.restore();
  }
 }
 const composed=new Uint8Array(width*height*3);
 for(let f=0;f<frames;f++){
  composed.fill(0);
  for(let z=0;z<4;z++){
   paint(f,z);
   const data=ctx.getImageData(0,0,width,height).data,cel=Array(width*height);
   for(let i=0;i<cel.length;i++){
    const k=i*4,a=data[k+3]/255;
    if(z!==0&&a<.045){cel[i]=null;continue;}
    let r=data[k],g=data[k+1],b=data[k+2];
    if(z>0){r=r*a+composed[i*3]*(1-a);g=g*a+composed[i*3+1]*(1-a);b=b*a+composed[i*3+2]*(1-a);}
    const id=nearest(r,g,b);cel[i]=hex[id];
    composed[i*3]=palette[id][0];composed[i*3+1]=palette[id][1];composed[i*3+2]=palette[id][2];
   }
   layers[z].cels.push(cel);
  }
 }
 return{width,height,fps,frame:0,selected:4,layers};
}
