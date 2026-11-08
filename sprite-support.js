/* PixelForge: almacenamiento compacto e importación de spritesheets, sin BD. */
(function(){
 'use strict';
 const LIMIT=4194304, MAX=512;
 function check(project){
  if(!project||!Number.isInteger(project.width)||!Number.isInteger(project.height)||
    project.width<8||project.height<8||project.width>MAX||project.height>MAX||
    !Array.isArray(project.layers)||!project.layers.length||project.layers.length>24||
    !Array.isArray(project.layers[0].cels)||!project.layers[0].cels.length||project.layers[0].cels.length>72||
    project.width*project.height*project.layers.length*project.layers[0].cels.length>LIMIT)
    throw Error('El proyecto excede los límites de PixelForge.');
 }
 function pack(project){
  check(project);
  const palette=[null],lookup=new Map();
  for(const layer of project.layers)for(const cel of layer.cels)for(const color of cel){
   if(color===null)continue;
   if(!lookup.has(color)){
    if(palette.length>=65536)throw Error('Demasiados colores distintos.');
    lookup.set(color,palette.length);palette.push(color);
   }
  }
  const depth=palette.length<=256?1:2;
  function encode(cel){
   const bytes=new Uint8Array(cel.length*depth);
   for(let i=0;i<cel.length;i++){
    const id=cel[i]===null?0:lookup.get(cel[i]);
    bytes[i*depth]=id&255;
    if(depth===2)bytes[i*depth+1]=id>>8;
   }
   let raw='';
   for(let j=0;j<bytes.length;j+=8192)raw+=String.fromCharCode(...bytes.subarray(j,j+8192));
   return btoa(raw);
  }
  return{format:'pf-palette-v1',width:project.width,height:project.height,fps:project.fps,
   frame:project.frame,selected:project.selected,palette,depth,
   layers:project.layers.map(l=>({id:l.id,name:l.name,visible:l.visible,cels:l.cels.map(encode)}))};
 }
 function unpack(item){
  if(item?.format!=='pf-palette-v1')return item;
  if(![1,2].includes(item.depth)||!Array.isArray(item.palette)||item.palette[0]!==null||
    item.palette.length>65536)throw Error('Paleta inválida.');
  check({...item,layers:item.layers.map(l=>({...l,cels:l.cels.map(()=>[])}))});
  const size=item.width*item.height,depth=item.depth,palette=item.palette;
  function decode(b64){
   if(typeof b64!=='string')throw Error('Datos inválidos.');
   const raw=atob(b64);
   if(raw.length!==size*depth)throw Error('Longitud de fotograma inválida.');
   const cel=Array(size);
   for(let i=0;i<size;i++){
    const index=raw.charCodeAt(i*depth)+(depth===2?raw.charCodeAt(i*depth+1)*256:0);
    if(index>=palette.length)throw Error('Índice fuera de la paleta.');
    cel[i]=palette[index];
   }
   return cel;
  }
  return{width:item.width,height:item.height,fps:item.fps,frame:item.frame,
   selected:item.selected,layers:item.layers.map(l=>({...l,cels:l.cels.map(decode)}))};
 }
 async function fromSheet(bitmap){
  if(bitmap.width<4||bitmap.height<2||Math.abs(bitmap.width/bitmap.height-2)>.08)
   throw Error('Usa una hoja de 4 columnas × 2 filas (proporción 2:1).');
  const width=256,height=256;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=true;
  const cels=[];
  for(let f=0;f<8;f++){
   const col=f%4,row=(f/4)|0;
   ctx.clearRect(0,0,width,height);
   ctx.drawImage(bitmap,col*bitmap.width/4,row*bitmap.height/2,bitmap.width/4,bitmap.height/2,0,0,width,height);
   const rgba=ctx.getImageData(0,0,width,height).data,cel=new Array(width*height);
   const map=new Map();
   for(let i=0;i<cel.length;i++){
    const j=i*4;
    if(rgba[j+3]<8){cel[i]=null;continue;}
    const id=(rgba[j]<<16)|(rgba[j+1]<<8)|rgba[j+2];
    let color=map.get(id);
    if(!color){color='#'+id.toString(16).padStart(6,'0').toUpperCase();map.set(id,color);}
    cel[i]=color;
   }
   cels.push(cel);
  }
  return{width,height,fps:12,frame:0,selected:1,
   layers:[{id:1,name:'Orbe mágico · 8 poses',visible:true,cels}]};
 }
 window.pfPackProject=pack;window.pfUnpackProject=unpack;
 window.pfProjectFromSheet=fromSheet;
 document.getElementById('importSheet')?.addEventListener('click',()=>document.getElementById('sheetFile').click());
 document.getElementById('sheetFile')?.addEventListener('change',async event=>{
  const input=event.currentTarget,file=input.files?.[0],status=document.getElementById('importStatus');
  input.value='';
  if(!file)return;
  if(file.size>20*1024*1024){status.textContent='El archivo supera 20 MB.';return;}
  status.textContent='Importando 8 fotogramas…';
  let image;
  try{
   image=await createImageBitmap(file);
   const project=await fromSheet(image);
   const text=JSON.stringify(pack(project));
   localStorage.setItem('pixelforge-orb-scene-v1',text);
   status.textContent='Animación guardada. Abriendo la escena…';
   const url=new URL(location.href);url.searchParams.set('scene','orb');location.assign(url.toString());
  }catch(error){status.textContent='Error: '+error.message;}
  finally{if(image)image.close();}
 });
})();