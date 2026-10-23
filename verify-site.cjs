// Dependency-free checks. Run after node build-pages.cjs.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const catalog = JSON.parse(fs.readFileSync('catalog.json','utf8'));
const categories = require('./site-content.cjs');
const pages = ['index','services','products','about','contact','product'];
let checkedLinks = 0;
for (const prefix of ['', 'en-']) {
  for (const name of pages) {
    const path = `${prefix}${name}.html`;
    const html = fs.readFileSync(path,'utf8');
    assert(html.includes(`lang="${prefix ? 'en' : 'ar'}" dir="${prefix ? 'ltr' : 'rtl'}"`), `${path}: language and direction`);
    for (const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|tel:|#)/.test(url)) continue;
      assert(fs.existsSync(url.split('?')[0].split('#')[0]),`${path}: missing ${url}`);
      checkedLinks++;
    }
    assert(html.includes('assets/logo-web.png') && html.includes('assets/favicon.png'),`${path}: brand assets`);
    assert(html.includes('og:description') && html.includes('name="description"'),`${path}: SEO metadata`);
    assert(!/[←↗↖↙→]/.test(html),`${path}: unwanted arrows`);
    assert(!html.includes('اسأل عن هذا المنتج'),`${path}: old product CTA`);
    assert(html.includes('https://web.facebook.com/profile.php?id=61584932767330'),`${path}: Facebook`);
    for(const [,phone] of html.matchAll(/href="tel:([^"]+)"/g)) assert.equal(phone,'+201034031505');
    for(const [,wa] of html.matchAll(/href="(https:\/\/wa.me\/[^\"]+)"/g)) assert(wa.startsWith('https://wa.me/201034031505?text='));
  }
}
assert.equal(new Set(catalog.map(p=>p.id)).size,catalog.length,'unique IDs');
for (const category of categories) assert(catalog.some(p=>p.category===category[0]),`${category[0]}: no products`);
for (const product of catalog) {
  assert(product.name && product.nameEn,`${product.id}: missing translation`);
  assert(fs.existsSync(product.image),`${product.id}: missing image`);
  assert(!Object.hasOwn(product,'price') && !Object.hasOwn(product,'stock'),`${product.id}: prohibited commerce fields`);
  for (const spec of product.specs || []) assert(!/ضمان|warranty/i.test(spec.label+' '+spec.labelEn));
}
console.log(`PASS: 12 pages, ${checkedLinks} local asset/link targets, ${catalog.length} unique products, ${categories.length} categories, contact URLs and bilingual metadata.`);
