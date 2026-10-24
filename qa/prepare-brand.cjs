// Deterministic asset preparation: retain the supplied mark's geometry; never redraw it.
const fs = require('node:fs');
const sharp = require('sharp');
(async()=>{
 const source=process.argv[2];
 if(!source) throw new Error('Pass the owner-supplied PNG path.');
 const {data,info}=await sharp(source).removeAlpha().raw().toBuffer({resolveWithObject:true});
 let left=info.width,top=info.height,right=0,bottom=0;
 for(let y=0;y<info.height;y++) for(let x=0;x<info.width;x++) {
  const i=(y*info.width+x)*3,r=data[i],g=data[i+1],b=data[i+2];
  if(Math.min(r,g,b)<170 && b-r>30){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
 }
 left-=12;top-=12;right+=12;bottom+=12;
 const width=right-left+1,height=bottom-top+1;
 const light=Buffer.alloc(width*height*4),dark=Buffer.alloc(width*height*4);
 for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
  const i=((top+y)*info.width+left+x)*3,j=(y*width+x)*4;
  const rgb=[data[i],data[i+1],data[i+2]],min=Math.min(...rgb);
  const emblem=x<width*.26;
  const alpha=Math.max(0,Math.min(1,(248-min)/(248-(emblem?0:25))));
  const a=alpha<.025?0:Math.round(alpha*255);
  for(let c=0;c<3;c++) {
   light[j+c]=a ? Math.round(Math.max(0,Math.min(255,(rgb[c]-255*(1-alpha))/alpha))) : 0;
   dark[j+c]=emblem?light[j+c]:[225,241,255][c];
  }
  light[j+3]=dark[j+3]=a;
 }
 fs.copyFileSync(source,'assets/logo.png');
 for(const [name,buffer] of [['logo-web.png',light],['logo-dark-web.png',dark]])
  await sharp(buffer,{raw:{width,height,channels:4}}).png().toFile('assets/'+name);
 const emblemWidth=Math.floor(width*.26);
 await sharp(light,{raw:{width,height,channels:4}}).extract({left:0,top:0,width:emblemWidth,height}).resize(256,256,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toFile('assets/favicon.png');
 console.log('Logo dimensions:',width,height);
})();
