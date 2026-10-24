const fs=require('node:fs');
const sharp=require('sharp');
const out='qa/results';
async function panel(file,width,height){return sharp(file).extract({left:0,top:0,width:(await sharp(file).metadata()).width,height:Math.min((await sharp(file).metadata()).height,height)}).resize({width}).png().toBuffer();}
(async()=>{
 for(const lang of ['ar','en'])for(const theme of ['light','dark'])for(const [kind,width,height] of [['mobile',390,1200],['desktop',1440,1000]]){
  const target=kind==='desktop'?960:390;
  const before=await panel(`${out}/before/${lang}-${theme}-${width}.png`,target,height);
  const after=await panel(`${out}/after/${lang}-${theme}-${width}.png`,target,height);
  const h=Math.round(height*target/width),gap=20;
  const label=Buffer.from(`<svg width="${target*2+gap}" height="42"><rect width="100%" height="100%" fill="#edf5fc"/><g font-family="Arial" font-size="16" fill="#2f5278"><text x="12" y="27">Before · ${lang} · ${width}px</text><text x="${target+gap+12}" y="27">After · ${lang} · ${width}px</text></g></svg>`);
  await sharp({create:{width:target*2+gap,height:h+42,channels:3,background:'#d7e4f0'}}).composite([{input:label,top:0,left:0},{input:before,top:42,left:0},{input:after,top:42,left:target+gap}]).png().toFile(`${out}/comparison-${kind}-${lang}-${theme}.png`);
 }
 // Compact visual index: every requested width, both themes, both languages.
 for(const lang of ['ar','en']){
  const entries=[];let index=0;
  for(const theme of ['light','dark'])for(const width of [360,390,412,768,1024,1440]){
   const b=await panel(`${out}/after/${lang}-${theme}-${width}.png`,240,Math.round(width*1.65));
   const meta=await sharp(b).metadata();const top=Math.floor(index/6)*460,left=(index%6)*256;
   const label=Buffer.from(`<svg width="240" height="32"><rect width="100%" height="100%" fill="#edf5fc"/><text x="10" y="22" font-family="Arial" font-size="14" fill="#2f5278">${lang} · ${theme} · ${width}px</text></svg>`);
   entries.push({input:label,top,left},{input:b,top:top+32,left});index++;
  }
  await sharp({create:{width:1536,height:920,channels:3,background:'#d7e4f0'}}).composite(entries).png().toFile(`${out}/matrix-${lang}.png`);
 }
 // Secondary pages at mobile and desktop, to review the shared system beyond the homepage.
 for(const lang of ['ar','en'])for(const width of [390,1440]){
  const entries=[];let index=0;
  for(const theme of ['light','dark'])for(const name of ['products','catalog','product','services','about','contact']){
   const b=await panel(`${out}/after/${lang}-${theme}-${width}-${name}.png`,240,Math.round(width*1.5));
   const top=Math.floor(index/6)*440,left=(index%6)*256;
   const label=Buffer.from(`<svg width="240" height="32"><rect width="100%" height="100%" fill="#edf5fc"/><text x="8" y="22" font-family="Arial" font-size="14" fill="#2f5278">${name} · ${theme} · ${width}px</text></svg>`);
   entries.push({input:label,top,left},{input:b,top:top+32,left});index++;
  }
  await sharp({create:{width:1536,height:880,channels:3,background:'#d7e4f0'}}).composite(entries).png().toFile(`${out}/pages-${lang}-${width}.png`);
 }
 console.log('Prepared before/after comparisons and visual review sheets.');
})();
