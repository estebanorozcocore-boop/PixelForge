/* PixelForge · Caballero de Luz: espadón, golpe contra el piso y explosión.
   12 dibujos originales dispuestos en 24 fotogramas a 24 FPS (animación 'on twos').
   Los destellos adicionales quedan editables en su propia capa. Sin dependencias ni BD. */
(function(){
'use strict';
const W=256,H=256,N=24;
const assets=['./sword-impact-atlas-1.png','./sword-impact-atlas-2.png','./sword-impact-atlas-3.png'];
const P={gold:'#F1B85D',orange:'#FF853A',red:'#DA512F',soft:'#EEC790',light:'#FFE7B5',white:'#FFF9E6',smoke:'#63515E',darkSmoke:'#433B47',amber:'#B56B36'};
function makeEffect(frame){
  const cel=Array(W*H).fill(null);
  let seed=0x9E3779B9^(frame*786433);
  const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
  function pixel(x,y,c){x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<W&&y<H)cel[y*W+x]=c;}
  function disk(cx,cy,rx,ry,c){
    const x0=Math.max(0,Math.floor(cx-rx)),x1=Math.min(W-1,Math.ceil(cx+rx));
    for(let y=Math.max(0,Math.floor(cy-ry));y<Math.min(H,Math.ceil(cy+ry+1));y++){
      for(let x=x0;x<=x1;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)pixel(x,y,c);
    }
  }
  function line(x1,y1,x2,y2,c,w=1){
    let steps=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)*1.7));
    for(let i=0;i<=steps;i++){
      const t=i/steps,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;
      if(w<=1)pixel(x,y,c);else disk(x,y,w*.47,w*.47,c);
    }
  }
  function shockwave(cx,cy,rx,ry,c,segments=132){
    let px=null,py=null;
    for(let i=0;i<=segments;i++){
      const a=-Math.PI + i*2*Math.PI/segments;
      const x=cx+rx*Math.cos(a),y=cy+ry*Math.sin(a);
      if(px!==null)line(px,py,x,y,c,1);
      px=x;py=y;
    }
  }
  const X=210,Y=226;
  // Inicio del golpe: fragmentos precoces y grietas junto a la punta del espadón.
  if(frame>=10&&frame<=15){
    const phase=frame-10;
    disk(X,Y,Math.max(1,5+phase*1.15),Math.max(1,1.5+phase*.9),phase<4?P.light:P.gold);
    disk(X,Y,Math.max(1,2+phase*.35),Math.max(1,1+phase*.2),P.white);
    for(let i=0;i<7+phase*2;i++){
      const a=(i/(7+phase*2))*Math.PI*1.6-Math.PI*.8;
      const r=5+phase*(2.2+rnd()*1.4),sx=X+Math.cos(a)*r,sy=Y-Math.abs(Math.sin(a))*r*.85;
      line(X,Y-2,sx,sy, i%3===0?P.orange:i%2?P.gold:P.light, i%5===0?2:1);
    }
  }
  // Anillo de onda: crece horizontalmente siguiendo el suelo 2D.
  if(frame>=12&&frame<=20){
    const t=frame-12,wide=8+t*13;
    const c=t<3?P.white:t<6?P.gold:P.amber;
    shockwave(X,Y+1,wide,Math.max(2,wide*.10),c);
    if(t<4)shockwave(X,Y+1,wide*.65,Math.max(1,wide*.065),P.orange);
  }
  // Chispas y escombros siguiendo arcos balísticos simplificados.
  if(frame>=12&&frame<=23){
    const age=frame-12,decay=Math.max(0,1-age/12);
    const count=Math.round(22*decay);
    for(let i=0;i<count;i++){
      const sp=.7+rnd()*1.8,dir=rnd()<.5?-1:1;
      const x=X+dir*(8+rnd()*130)*Math.min(1,(age+1)/6)*sp*.65;
      const jump=8+rnd()*48;
      const y=Y-jump*Math.sin(Math.min(Math.PI,(age+1)/13*Math.PI)) +rnd()*8;
      const col=i%7===0?P.white:i%3===0?P.orange:P.gold;
      line(x,y,x+dir*(1+rnd()*3),y-2-rnd()*4,col,1);
    }
  }
  // Estelas residuales que se apagan después del colapso del humo.
  if(frame>=15&&frame<=22){
    const fade=(frame-15)/8, count=Math.round((1-fade)*12);
    for(let i=0;i<count;i++){
      const side=i%2?-1:1;
      const xx=X+side*(15+rnd()*75), yy=Y-12-rnd()*50;
      pixel(xx,yy,i%3===0?P.gold:P.amber);
    }
  }
  return cel;
}
async function loadAtlas(uri){
  const img=new Image();img.decoding='async';img.src=uri;await img.decode();
  if(img.naturalWidth!==W*4||img.naturalHeight!==H)throw Error('Atlas de fotogramas incompatible.');
  return img;
}
async function createSwordImpactScene(){
  const bitmaps=await Promise.all(assets.map(loadAtlas));
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;
  const source=[];
  for(let frame=0;frame<12;frame++){
    ctx.clearRect(0,0,W,H);
    ctx.drawImage(bitmaps[(frame/4)|0],(frame%4)*W,0,W,H,0,0,W,H);
    const data=ctx.getImageData(0,0,W,H).data;
    const cel=new Array(W*H),palette=new Map();
    for(let i=0;i<cel.length;i++){
      let k=i*4;
      if(data[k+3]<8){cel[i]=null;continue;}
      let rgb=data[k]*65536+data[k+1]*256+data[k+2];
      if(!palette.has(rgb))palette.set(rgb,'#'+rgb.toString(16).padStart(6,'0').toUpperCase());
      cel[i]=palette.get(rgb);
    }
    source.push(cel);
  }
  const frames=Array.from({length:N},(_,f)=>source[Math.floor(f/2)].slice());
  const vfx=Array.from({length:N},(_,f)=>makeEffect(f));
  const project={width:W,height:H,fps:24,frame:0,selected:2,layers:[
    {id:1,name:'01 · Caballero, espada e impacto',visible:true,cels:frames},
    {id:2,name:'02 · Destellos y onda expansiva',visible:true,cels:vfx}
  ]};
  if(project.width*project.height*N*project.layers.length>4194304)throw Error('Escena demasiado grande.');
  return project;
}
window.pfCreateSwordImpactScene=createSwordImpactScene;
})();