const fs = require('node:fs');
const {start} = require('./browser.cjs');
(async()=>{
 const app=await start();
 fs.mkdirSync('qa/results/before',{recursive:true});
 try {
  for(const lang of ['ar','en']) for(const theme of ['light','dark']) for(const width of [390,1440]) {
   const context=await app.browser.newContext({viewport:{width,height:width===390?844:1000},colorScheme:theme});
   const page=await context.newPage();
   await page.goto(app.base+'/'+(lang==='en'?'en-':'')+'index.html');
   await page.waitForLoadState('networkidle'); await page.evaluate(()=>document.fonts.ready);
   await page.screenshot({path:`qa/results/before/${lang}-${theme}-${width}.png`,fullPage:true});
   console.log(lang,theme,width,await page.locator('.site-header').evaluate(e=>e.getBoundingClientRect().height));
   await context.close();
  }
  const page=await app.browser.newPage({viewport:{width:1440,height:1000}});
  try {await page.goto('https://axisblue.vercel.app/index.html',{waitUntil:'networkidle',timeout:30000});await page.screenshot({path:'qa/results/before/deployed-1440.png',fullPage:true}); console.log('Deployed site captured');} catch(error){console.log('Deployed capture unavailable:',error.message);}
 } finally {await app.close();}
})();
