/* PixelForge: secuencia de efecto de impacto original a 24 fps; editables por píxel y capa. */
function createExplosionScene(){
 const width=96,height=64,fps=24,frames=24;
 const colors={night:'#101521',sky:'#192232',sky2:'#202A3B',ground:'#161924',ground2:'#29202B',blood:'#531D29',red:'#E2393D',verm:'#FF4D39',pink:'#FF5B83',orange:'#FF753F',gold:'#FFB247',yellow:'#FFD45D',cream:'#FFECA8',white:'#FFF7DC',silver:'#BCC7D4',dark:'#0A0D16',iron:'#252631',iron2:'#42404D',smoke:'#3A323E',smoke2:'#604351',smoke3:'#87505A',light:'#FF9D74'};
 const layers=[
  {id:1,name:'01 · Fondo nocturno',visible:true,cels:[]},
  {id:2,name:'02 · Guerrero',visible:true,cels:[]},
  {id:3,name:'03 · Energía y explosión',visible:true,cels:[]},
  {id:4,name:'04 · Chispas, anillos y humo',visible:true,cels:[]}
 ];
 const make=()=>{
  const cel=Array(width*height).fill(null);
  const dot=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&x<width&&y>=0&&y<height)cel[y*width+x]=c;};
  const rect=(x,y,w,h,c)=>{for(let yy=Math.max(0,Math.floor(y));yy<Math.min(height,Math.ceil(y+h));yy++)for(let xx=Math.max(0,Math.floor(x));xx<Math.min(width,Math.ceil(x+w));xx++)dot(xx,yy,c);};
  const ellipse=(cx,cy,rx,ry,c)=>{if(rx<=0||ry<=0)return;const x0=Math.max(0,Math.floor(cx-rx)),x1=Math.min(width-1,Math.ceil(cx+rx));for(let y=Math.max(0,Math.floor(cy-ry));y<=Math.min(height-1,Math.ceil(cy+ry));y++)for(let x=x0;x<=x1;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)dot(x,y,c);};
  const stroke=(x0,y0,x1,y1,c,w=1)=>{const steps=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)*2));for(let i=0;i<=steps;i++){const t=i/steps;ellipse(x0+(x1-x0)*t,y0+(y1-y0)*t,Math.max(.5,w/2),Math.max(.5,w/2),c);}};
  const poly=(points,c)=>{const ymin=Math.max(0,Math.floor(Math.min(...points.map(p=>p[1])))),ymax=Math.min(height-1,Math.ceil(Math.max(...points.map(p=>p[1]))));for(let y=ymin;y<=ymax;y++){const xs=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if((a[1]<=y+.5&&b[1]>y+.5)||(b[1]<=y+.5&&a[1]>y+.5))xs.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]));}xs.sort((a,b)=>a-b);for(let j=0;j+1<xs.length;j+=2)for(let x=Math.ceil(xs[j]);x<=Math.floor(xs[j+1]);x++)dot(x,y,c);}};
  const arc=(cx,cy,rx,ry,a0,a1,c,w=1)=>{const count=Math.ceil(Math.max(rx,ry)*Math.abs(a1-a0)*3);for(let j=0;j<=count;j++){const a=a0+(a1-a0)*j/Math.max(1,count);ellipse(cx+Math.cos(a)*rx,cy+Math.sin(a)*ry,Math.max(.5,w/2),Math.max(.5,w/2),c);}};
  return{cel,dot,rect,ellipse,stroke,poly,arc};
 };
 let rndSeed=137;
 const random=()=>{rndSeed=(rndSeed*1664525+1013904223)>>>0;return rndSeed/4294967296;};
 for(let f=0;f<frames;f++){
  rndSeed=137+f*337;
  // Fondo cinematográfico no plano: piso, horizonte y débil reverberación roja.
  const bg=make();bg.rect(0,0,width,20,colors.night);bg.rect(0,20,width,28,colors.sky);bg.rect(0,48,width,6,colors.sky2);bg.rect(0,54,width,10,colors.ground);
  bg.rect(0,52,width,1,colors.iron);bg.rect(0,53,width,2,colors.dark);
  for(let x=0;x<width;x+=1){if((x*11+7)%17<3)bg.dot(x,52,colors.ground2);if((x*5+9)%23===0)bg.dot(x,56,colors.iron2);}
  if(f>=7){const rx=f>=14?Math.max(2,25-(f-14)*1.2):12;bg.ellipse(f>=14?74:32,55,rx,1.7,colors.blood);}
  if(f>=14&&f<=22){bg.ellipse(74,55,Math.max(2,33-(f-14)*2),1.2,colors.verm);bg.ellipse(74,55,Math.max(1,20-(f-14)*1.1),.7,colors.orange);}
  layers[0].cels.push(bg.cel);
  // Silueta de samurái demoníaco: capa, armadura y mano extendida hacia el haz.
  const hero=make();let sway=Math.sin(f*.43)*1.1;
  hero.poly([[13,27],[10,33],[7-sway,47],[4,52],[14,49],[18,41]],colors.dark);
  hero.poly([[12,33],[8,42],[5,49],[10,46],[14,39]],colors.iron);
  hero.stroke(16,40,13,51,colors.dark,4);hero.stroke(18,40,21,51,colors.dark,4);
  hero.stroke(13,51,10,52,colors.iron2,3);hero.stroke(20,51,24,52,colors.iron2,3);
  hero.poly([[13,29],[21,27],[22,41],[14,42]],colors.dark);
  hero.poly([[13,31],[19,29],[20,37],[14,38]],colors.iron2);
  hero.stroke(14,36,22,36,colors.red,1);
  hero.ellipse(17,23,4,5,colors.dark);hero.ellipse(17,23,3,4,colors.iron);
  hero.dot(18,23,colors.red);hero.dot(19,23,colors.verm);
  hero.poly([[14,20],[12,13],[17,18]],colors.red);hero.poly([[19,19],[23,12],[21,21]],colors.red);
  hero.stroke(20,30,25,30,colors.dark,3);hero.stroke(25,30,29,32,colors.iron2,2);hero.dot(29,32,colors.red);
  hero.poly([[15,30],[11,29],[10,34],[13,37]],colors.iron2);hero.stroke(13,30,11,37,colors.red,1);
  hero.stroke(12,40,15,44,colors.blood,2);hero.stroke(18,39,21,45,colors.red,1);
  layers[1].cels.push(hero.cel);
  // Núcleo: carga -> disparo -> explosión -> disipación.
  const energy=make();
  if(f<7){const r=1.8+f*.68;energy.ellipse(31,31,r+1,r+1,colors.blood);energy.ellipse(31,31,r,r,colors.verm);energy.ellipse(31,31,r*.64,r*.64,colors.gold);energy.ellipse(31,31,r*.32,r*.32,colors.white);}
  if(f>=7&&f<14){
   const progress=(f-7)/6,head=Math.min(76,36+progress*42),amp=2.1+Math.sin(f*.7)*1.2;
   energy.poly([[30,32],[head-9,32-amp],[head,32],[head-9,32+amp+1],[30,35]],colors.blood);
   energy.poly([[29,31],[head-6,31-amp],[head,32],[head-7,33+amp],[29,34]],colors.verm);
   energy.poly([[29,32],[head-3,31],[head+1,32],[head-3,33],[29,33]],colors.gold);
   energy.stroke(29,32,head-3,32,colors.white,1.2);
   energy.poly([[head-3,28],[head+6,32],[head-3,36],[head-1,32]],colors.verm);
   for(let j=0;j<3;j++){const x=35+random()*(head-35),y=32+Math.sin(x*.17+f*.9)*(5+j*1.5);energy.stroke(x-8,y+2,x+2,y,colors.blood,1.1);}
  }
  if(f>=14){
   const time=f-14;
   const growth=Math.min(1,(time+1)/5),fall=Math.max(.10,1-Math.max(0,time-5)*.21);
   const rx=30*growth,ry=29*growth;
   if(time<=8){
    // Cúpula de fuego con núcleo brillante y capas de borde.
    energy.ellipse(74,52,rx+2,Math.max(1,ry*.73),colors.blood);
    energy.ellipse(74,51,rx,Math.max(1,ry*.72),colors.red);
    energy.ellipse(74,51,rx*.89,Math.max(1,ry*.67),colors.verm);
    if(time<=6){
     energy.ellipse(74,51,rx*.78,Math.max(1,ry*.60),colors.orange);
     energy.ellipse(74,51,rx*.6,Math.max(1,ry*.51),colors.yellow);
     energy.ellipse(74,51,rx*.38,Math.max(1,ry*.4),colors.white);
    }
    // Recortar cúpula a nivel del suelo; la base impacta y se extiende.
    energy.poly([[74-rx,54],[74,54+1.6],[74+rx,54],[74+rx*.78,56],[74-rx*.8,56]],colors.orange);
    if(time>5){
     energy.ellipse(74,51,rx*.88,Math.max(1,ry*.59),colors.blood);
     energy.poly([[72,54],[74-rx*.45,47],[69,40],[82,47],[74+rx*.3,46],[77,55]],colors.verm);
    }
   }else{
    energy.ellipse(74,53,27*fall,2*fall,colors.verm);
    energy.ellipse(74,53,16*fall,1,colors.gold);
   }
  }
  layers[2].cels.push(energy.cel);
  // Efectos separados: anillos de energía, trazos de alto contraste y partículas.
  const fx=make();
  if(f<8){const radius=4+f*.93;fx.arc(31,31,radius,radius*.82,-2.9,1.15,colors.red,1);
   fx.arc(31,31,radius+2,radius,-.4,2.25,colors.pink,1);
   if(f>2){fx.stroke(31-radius-3,31,31-radius+1,31,colors.orange,1);fx.stroke(31+radius,28,31+radius+2,24,colors.yellow,1);}
  }
  if(f>=7&&f<14){const head=36+(f-7)/6*42;for(let i=0;i<4;i++){const x=35+i*(head-35)/4;const radius=4.4+i%2*1.4;
   fx.arc(x,32,radius*.55,radius,-Math.PI/2,Math.PI/2, i===2?colors.white:colors.verm,1);
  }
  for(let i=0;i<23;i++){
    const x=27+random()*(head-25),y=32+(random()-.5)*13,headroom=4+random()*10;
    if(random()>.55)fx.stroke(x-headroom,y+1,x,y,random()>.6?colors.red:colors.orange,1);
  }}
  if(f>=14){
    const time=f-14;const radius=Math.min(31,6+(time)*4);const decay=Math.max(.08,1-(time-5)*.25);
    if(time<9){
     fx.arc(74,52,radius,Math.max(2,radius*.74),3.2,6.2,colors.pink,time<5?1.8:1);
     fx.arc(74,52,radius*.87,Math.max(2,radius*.64),-.5,2.7,colors.red,2);
     fx.arc(74,52,radius*.9,Math.max(2,radius*.33),-.8,2.9,colors.orange,1);
     fx.arc(74,54,Math.min(45,radius*1.25),3,Math.PI*.93,Math.PI*2,colors.verm,1);
    }
    const count=Math.max(1,Math.round(38*decay));
    for(let j=0;j<count;j++){
     const angle=random()*Math.PI*2,distance=radius*(.55+random()*.9),x=74+Math.cos(angle)*distance,y=49+Math.sin(angle)*distance*.73;
     const c=[colors.verm,colors.red,colors.orange,colors.gold,colors.pink,colors.white][Math.floor(random()*6)];
     if(random()>.7)fx.stroke(x-2*Math.cos(angle),y-2*Math.sin(angle),x,y,c,1);else fx.dot(x,y,c);
    }
    if(time>=4){const mass=Math.min(1,(time-3)/6);
     for(let i=0;i<9;i++){const x=53+i*5+Math.sin(time*.7+i)*2;
      fx.ellipse(x,52+random()*2-mass*random()*14,3+random()*5,2+random()*3,[colors.smoke,colors.smoke2,colors.smoke3][i%3]);
     }
    }
  }
  layers[3].cels.push(fx.cel);
 }
 return{width,height,fps,frame:0,selected:3,layers};
}