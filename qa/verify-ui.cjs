const fs = require('node:fs');
const assert = require('node:assert/strict');
const {start} = require('./browser.cjs');
const catalog = require('../catalog.json');
const widths = [360,390,412,768,1024,1440];
const journeysOnly = process.argv.includes('--journeys-only');
const report = journeysOnly ? JSON.parse(fs.readFileSync('qa/results/verification.json','utf8')) : {widths,views:[],checks:[],errors:[]};
if(journeysOnly){report.checks=[];report.errors=[];delete report.failure;}
const pages = ['index','products','services','about','contact','product','catalog'];
const screenshotDir='qa/results/content-update';
function check(condition,message) {if(!condition) throw new Error(message);}
async function settle(page) {await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);await page.locator('img[loading=lazy]').evaluateAll(es=>es.forEach(e=>e.loading='eager'));await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));}
async function audit(page,width) {
 return page.evaluate(width=>{
  const visible=e=>!!e.getClientRects().length && getComputedStyle(e).visibility!=='hidden';
  const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
  const overflow=[...document.querySelectorAll('body *')].filter(e=>visible(e)&&!e.closest('svg')&&!e.matches('.skip-link')&&!e.closest('.water-reflection')).filter(e=>{const r=rect(e);return r.left < -1 || r.right > width+1;}).map(e=>e.tagName+'.'+e.className).slice(0,8);
  const clipped=[...document.querySelectorAll('h1,h2,h3,.button,.preference-button')].filter(e=>{const s=getComputedStyle(e);return visible(e)&&((['hidden','clip'].includes(s.overflowX)&&e.scrollWidth>e.clientWidth+2)||(['hidden','clip'].includes(s.overflowY)&&e.scrollHeight>e.clientHeight+2));}).map(e=>e.className||e.tagName);
  const controls=[...document.querySelectorAll('.brand,.header-tools,.menu-toggle,#navigation')].filter(visible).map(rect);
  const collisions=[];
  for(let i=0;i<controls.length;i++)for(let j=i+1;j<controls.length;j++){const a=controls[i],b=controls[j];if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)collisions.push([i,j]);}
  const luminance=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
  const parse=c=>c.match(/[\d.]+/g)?.map(Number);
  const contrast=[];
  for(const el of document.querySelectorAll('.intro-label,.hero h1,.hero-copy>p,.button,.text-link,.card-copy p,.card-copy h3,.product-code,.site-footer p,.header-inner nav>a,.preference-button,.catalog-note')){
   if(!visible(el))continue;const style=getComputedStyle(el);let parent=el,bg;
   while(parent){const c=parse(getComputedStyle(parent).backgroundColor);if(c&&c.length>=3&&(c.length===3||c[3]===1)){bg=c.slice(0,3);break;}parent=parent.parentElement;}
   if(!bg)continue;const fg=parse(style.color).slice(0,3);const a=luminance(fg),b=luminance(bg);const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
   const large=parseFloat(style.fontSize)>=24 || (parseFloat(style.fontSize)>=18.667 && parseInt(style.fontWeight)>=700);
   if(ratio<(large?3:4.5)-.02)contrast.push({element:el.className||el.tagName,ratio:Math.round(ratio*100)/100});
  }
  return {scrollWidth:document.documentElement.scrollWidth,overflow,clipped,collisions,contrast,headerHeight:rect(document.querySelector('.site-header')).height,logoWidth:rect(document.querySelector('.brand')).width,heroSize:document.querySelector('.hero h1')?parseFloat(getComputedStyle(document.querySelector('.hero h1')).fontSize):null};
 },width);
}
(async()=>{
 const app=await start();fs.mkdirSync(screenshotDir,{recursive:true});
 try {
  if(!journeysOnly)for(const lang of ['ar','en'])for(const theme of ['light','dark'])for(const width of widths){
   const context=await app.browser.newContext({viewport:{width,height:width<600?844:1000},colorScheme:theme});
   const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
   page.on('response',res=>{if(res.status()>=400)report.errors.push(`${res.status()} ${res.url()}`);});
   for(const name of pages){
    const route=(lang==='en'?'en-':'')+(name==='catalog'?'products':name)+'.html'+(name==='product'?`?product=${catalog[0].id}`:name==='catalog'?'?category=all':'');
    await page.goto(app.base+'/'+route);await settle(page);
    check(await page.locator('html').getAttribute('data-theme')===theme,`Initial theme ${route}`);
    const view=await audit(page,width);report.views.push({lang,theme,width,name,...view});
    check(view.scrollWidth<=width && !view.overflow.length,`Overflow ${lang}/${theme}/${width}/${name}: ${JSON.stringify(view.overflow)}`);
    check(!view.collisions.length,`Header overlap ${lang}/${width}`);
    check(!view.clipped.length,`Clipping ${lang}/${width}/${name}: ${view.clipped}`);
    check(await page.locator('.floating-wa').count()===0,'No floating bubble');
    if(lang==='ar')check(!/مسبح/.test(await page.locator('body').innerText()),'Approved Arabic terminology');
    check(!view.contrast.length,`Text contrast ${lang}/${theme}/${name}: ${JSON.stringify(view.contrast)}`);
    check(view.headerHeight<=(width>1000?88:78),`Header height ${view.headerHeight}`);
    check(await page.locator('.theme-toggle svg:visible').count()===1,'Single next-action theme icon');
    check((await page.locator('.language-toggle').innerText()).trim()===(lang==='ar'?'EN':'ع'),'Language label');
    for(const selector of ['.theme-toggle','.language-toggle']){const box=await page.locator(selector).boundingBox();check(box.width>=44&&box.height>=44,'44px touch target');}
    if(name==='index'){
     check(await page.locator('main>section').evaluateAll(es=>es.map(e=>e.id).join(','))==='home,services,products,about,contact','Homepage section order');
     check(await page.locator('.service-grid article').count()===3,'Three service cards');
     check(await page.locator('.hero .button').count()===1,'One hero CTA');
     await page.screenshot({path:`${screenshotDir}/${lang}-${theme}-${width}.png`,fullPage:true});
     const image=page.locator('.hero-image img');check(await image.getAttribute('fetchpriority')==='high'&&await image.getAttribute('loading')!=='lazy','Hero load priority');
     check(await image.evaluate(e=>e.complete&&e.naturalWidth>0),'Hero loaded');
    }else if([390,1440].includes(width))await page.screenshot({path:`${screenshotDir}/${lang}-${theme}-${width}-${name}.png`,fullPage:name==='product'});
   }
   // Test mobile menu for every narrow width, in both languages and themes.
   if(width<=1000){
    await page.locator('.menu-toggle').click();check(await page.locator('#navigation').isVisible(),'Menu opens');
    check(await page.locator('.nav-contact a[href^="tel:"]').isVisible(),'Mobile call shortcut');
    check(await page.locator('.nav-contact a.whatsapp').isVisible(),'Mobile WhatsApp shortcut');
    if(width===390)await page.screenshot({path:`${screenshotDir}/${lang}-${theme}-menu.png`});
    const openAudit=await audit(page,width);check(!openAudit.overflow.length&&!openAudit.collisions.length,'Expanded menu geometry');
    await page.keyboard.press('Escape');check(!await page.locator('#navigation').isVisible(),'Escape closes menu');
    check(await page.locator('.menu-toggle').evaluate(e=>e===document.activeElement),'Escape restores focus');
   }
   // Theme survives reload, page navigation and language changes with catalog context.
   await page.locator('.theme-toggle').click();const next=theme==='light'?'dark':'light';
   check(await page.locator('html').getAttribute('data-theme')===next,'Theme toggles');
   const label=await page.locator('.theme-toggle').getAttribute('aria-label');check(label.includes(next==='dark'?(lang==='ar'?'الفاتح':'light'):(lang==='ar'?'الداكن':'dark')),'Next action accessible name');
   await page.reload();await settle(page);check(await page.locator('html').getAttribute('data-theme')===next,'Theme persists after reload');
   await page.locator('.language-toggle').click();await settle(page);
   check(await page.locator('html').getAttribute('lang')===(lang==='ar'?'en':'ar'),'Equivalent language page');
   check(new URL(page.url()).searchParams.get('category')==='all','Category preserved');
   check(await page.locator('html').getAttribute('data-theme')===next,'Theme persists across language change');
   await context.close();console.log(`PASS ${lang} ${theme} ${width}: 7 page views, menu, theme and language`);
  }
  // Full catalog journey, pagination, searching and product context in both directions.
  for(const lang of ['ar','en']){
   const page=await app.browser.newPage({viewport:{width:390,height:844}});const prefix=lang==='en'?'en-':'';
   await page.goto(`${app.base}/${prefix}products.html?category=all`);await settle(page);
   await page.locator('#pagination [data-page="2"]').click();check(new URL(page.url()).searchParams.get('page')==='2','Pagination query');
   await page.locator('.language-toggle').click();await settle(page);check(new URL(page.url()).searchParams.get('page')==='2','Pagination survives language');
   await page.locator('#product-search').fill(catalog[0].code);check(await page.locator('.product-card').count()>0,'Search by code');
   await page.locator('.language-toggle').click();await settle(page);check(await page.locator('#product-search').inputValue()===catalog[0].code,'Search preserved');
   await page.locator('#product-search').fill('AXIS-NO-MATCH-987');check(await page.locator('#empty-results').isVisible(),'Empty search');
   await page.locator('#product-search').fill('');await page.locator('#category-filter').selectOption(catalog[0].category);check(new URL(page.url()).searchParams.get('category')===catalog[0].category,'Category changes');
   await page.locator('.product-card').first().click();await settle(page);const id=new URL(page.url()).searchParams.get('product');check(id&&await page.locator('.detail-copy h1').count()===1,'Product details open');
   await page.locator('.language-toggle').click();await settle(page);check(new URL(page.url()).searchParams.get('product')===id,'Product ID preserved');
   check(await page.locator('.contact-band a.whatsapp').getAttribute('href').then(v=>v.includes('201034031505')),'Product WhatsApp');
   await page.locator('.menu-toggle').click();await page.locator('#navigation>a[href$="services.html"]').click();await settle(page);check(await page.locator('.service-details article').count()===3,'Menu navigation');
   await page.setViewportSize({width:1440,height:1000});await page.setViewportSize({width:390,height:844});check(!await page.locator('#navigation').isVisible(),'Menu resets on resize');
   await page.goto(app.base+'/'+prefix+'contact.html');await settle(page);await page.locator('.contact-details .whatsapp').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
   await page.waitForFunction(()=>getComputedStyle(document.querySelector('.contact-details .whatsapp')).backgroundColor==='rgb(37, 211, 102)');
   const focus=await page.locator('.contact-details .whatsapp').evaluate(e=>({visible:e.matches(':focus-visible'),outline:getComputedStyle(e).outlineStyle,background:getComputedStyle(e).backgroundColor}));
   check(focus.visible&&focus.outline==='solid'&&focus.background==='rgb(37, 211, 102)','Keyboard focus and WhatsApp green: '+JSON.stringify(focus));
   check(await page.locator('.floating-wa').count()===0,'No floating WhatsApp');
   await page.close();report.checks.push(`Full catalog, keyboard and contact journey: ${lang}`);
  }
  // The saved theme is already applied before the first visible content frame.
  const context=await app.browser.newContext({colorScheme:'light'});
  await context.addInitScript(()=>{localStorage.setItem('axis-theme','dark');const first=()=>{if(document.body)window.firstContentTheme=document.documentElement.dataset.theme;else requestAnimationFrame(first);};requestAnimationFrame(first);});
  const page=await context.newPage();await page.goto(app.base+'/index.html');await settle(page);check(await page.evaluate(()=>window.firstContentTheme)==='dark','Saved theme before first content frame');await context.close();
  for(const lang of ['ar','en']){
   const page=await app.browser.newPage();await page.goto(app.base+'/'+(lang==='en'?'en-':'')+'index.html');await settle(page);const sizes=[];
   for(const width of [399,400,401,699,700,701]){await page.setViewportSize({width,height:900});sizes.push(parseFloat(await page.locator('.hero h1').evaluate(e=>getComputedStyle(e).fontSize)));}
   check(Math.abs(sizes[2]-sizes[0])<.1&&Math.abs(sizes[5]-sizes[3])<.1,'Continuous hero type at old 400/700px boundaries');await page.close();
  }
  check(!report.errors.length,'Browser console/network errors: '+report.errors.join('\n'));
  report.checks.push('Saved theme before first content frame','Continuous hero type around 400px and 700px','No console/page/network errors','Sampled text contrast meets WCAG AA','Single content WhatsApp CTA and no floating bubble');
  report.passed=true;
 }catch(error){report.passed=false;report.failure=error.stack;throw error;}
 finally{fs.writeFileSync('qa/results/verification.json',JSON.stringify(report,null,2));await app.close();}
 console.log(`PASS: ${report.views.length} rendered page views, ${widths.length} widths, Arabic/English, light/dark, functional journeys.`);
})();
