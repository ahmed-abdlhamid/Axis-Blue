'use strict';

const root = document.documentElement;
const english = root.lang === 'en';
const text = (ar, en) => english ? en : ar;
const pageFile = name => `${english ? 'en-' : ''}${name}.html`;
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const savePreference = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Local files may restrict storage. */ } };

const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}
menu.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(expanded));
  navigation.classList.toggle('is-open', expanded);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header-inner')) closeMenu();
});
matchMedia('(min-width: 1001px)').addEventListener('change', closeMenu);

const themeSwitch = document.querySelector('.theme-toggle');
function reflectTheme() {
  const label = root.dataset.theme === 'dark' ? themeSwitch.dataset.lightLabel : themeSwitch.dataset.darkLabel;
  themeSwitch.setAttribute('aria-label', label);
  themeSwitch.title = label;
  document.querySelector('meta[name="theme-color"]').content = root.dataset.theme === 'dark' ? '#101d2d' : '#2F5278';
}
reflectTheme();
themeSwitch.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  savePreference('axis-theme', root.dataset.theme);
  reflectTheme();
});
document.querySelector('.language-toggle').addEventListener('click', event => {
  const target = event.currentTarget.dataset.alternate;
  savePreference('axis-language', english ? 'ar' : 'en');
  const alternate = new URL(target + location.search + location.hash, location.href);
  if (location.protocol === 'file:') alternate.searchParams.set('theme', root.dataset.theme);
  location.href = alternate.href;
});
// file:// storage can differ between documents; carry the theme through local page links.
document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link || location.protocol !== 'file:') return;
  const destination = new URL(link.href);
  if (destination.protocol === 'file:' && destination.pathname.endsWith('.html')) {
    destination.searchParams.set('theme', root.dataset.theme);
    link.href = destination.href;
  }
});
// The selected language is preserved by translated page links, including catalog queries.

const products = window.AXIS_CATALOG || [];
const categories = window.AXIS_CATEGORIES || [];
const params = new URLSearchParams(location.search);
const categoryName = category => category ? category[english ? 2 : 1] : text('جميع المنتجات', 'All products');
const productName = product => english ? product.nameEn : product.name;

if (document.querySelector('#catalog-results')) {
  const categoryId = params.get('category');
  if (categoryId) {
    document.querySelector('#category-overview').hidden = true;
    document.querySelector('.catalog-all').hidden = true;
    document.querySelector('#catalog-results').hidden = false;
    const categoryFilter = document.querySelector('#category-filter');
    const search = document.querySelector('#product-search');
    const grid = document.querySelector('#product-grid');
    const pagination = document.querySelector('#pagination');
    categoryFilter.value = categories.some(c => c[0] === categoryId) ? categoryId : 'all';
    search.value = params.get('q') || '';
    let currentPage = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
    const pageSize = 24;

    function renderCatalog() {
      const category = categories.find(c => c[0] === categoryFilter.value);
      const query = search.value.trim().toLocaleLowerCase();
      const filtered = products.filter(p => (!category || p.category === category[0]) && `${p.name} ${p.nameEn} ${p.code}`.toLocaleLowerCase().includes(query));
      const pageCount = Math.ceil(filtered.length / pageSize);
      currentPage = Math.min(currentPage, Math.max(1, pageCount));
      const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
      document.querySelector('#category-title').textContent = categoryName(category);
      document.querySelector('#result-count').textContent = text(`${filtered.length} منتج`, `${filtered.length} products`);
      document.querySelector('#empty-results').hidden = filtered.length !== 0;
      grid.innerHTML = visible.map(p => {
        const cat = categories.find(c => c[0] === p.category);
        return `<a class="product-card" href="${pageFile('product')}?product=${p.id}"><div class="product-image"><img src="${escapeHTML(p.image)}" alt="${escapeHTML(productName(p))}" width="400" height="400" loading="lazy"></div><div class="card-copy"><bdi class="product-code">${escapeHTML(p.code)}</bdi><h3>${escapeHTML(productName(p))}</h3><p>${escapeHTML(cat[english ? 4 : 3])}</p></div></a>`;
      }).join('');
      // Keep pagination compact even when browsing the whole catalog.
      const pageNumbers = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, pageCount])].filter(n => n > 0 && n <= pageCount).sort((a,b) => a-b);
      pagination.innerHTML = pageCount > 1 ? pageNumbers.map(n => `<button type="button" data-page="${n}" ${n === currentPage ? 'aria-current="page"' : ''} aria-label="${text('الصفحة', 'Page')} ${n}">${n}</button>`).join('') : '';
      const url = new URL(location.href);
      url.searchParams.set('category', categoryFilter.value);
      query ? url.searchParams.set('q', search.value) : url.searchParams.delete('q');
      currentPage > 1 ? url.searchParams.set('page', currentPage) : url.searchParams.delete('page');
      try { history.replaceState(null, '', url); } catch { /* file:// can restrict History API. */ }
    }
    categoryFilter.addEventListener('change', () => { currentPage = 1; renderCatalog(); });
    search.addEventListener('input', () => { currentPage = 1; renderCatalog(); });
    pagination.addEventListener('click', event => {
      const button = event.target.closest('button[data-page]');
      if (!button) return;
      currentPage = Number(button.dataset.page);
      renderCatalog();
      document.querySelector('#category-title').scrollIntoView({block:'start'});
      const activeButton = pagination.querySelector('[aria-current]');
      activeButton?.focus({preventScroll:true});
    });
    renderCatalog();
  }
}

if (document.querySelector('#product-detail')) {
  const detail = document.querySelector('#product-detail');
  const product = products.find(p => p.id === params.get('product'));
  if (!product) {
    detail.innerHTML = `<h1>${text('المنتج غير موجود','Product not found')}</h1><p>${text('اختر منتجًا من الكتالوج لعرض تفاصيله.','Choose a product from the catalog to see its details.')}</p><a class="button primary" href="${pageFile('products')}">${text('تصفح المنتجات','Browse products')}</a>`;
  } else {
    const category = categories.find(c => c[0] === product.category);
    const name = productName(product);
    const description = category[english ? 4 : 3];
    const message = text(`مرحباً AXIS Blue، أود معرفة تفاصيل ${product.name} (الكود: ${product.code}).`,`Hello AXIS Blue, I would like details about ${product.nameEn} (code: ${product.code}).`);
    const whatsapp = 'https://wa.me/201034031505?text=' + encodeURIComponent(message);
    const waIcon = document.querySelector('.floating-wa svg').outerHTML;
    detail.innerHTML = `<p class="breadcrumb detail-breadcrumb"><a href="${pageFile('products')}">${text('المنتجات','Products')}</a> / <a href="${pageFile('products')}?category=${product.category}">${escapeHTML(categoryName(category))}</a></p><div class="detail-layout"><figure class="detail-image"><img src="${escapeHTML(product.image)}" alt="${escapeHTML(name)}" width="400" height="400"></figure><div class="detail-copy"><p class="intro-label">${escapeHTML(categoryName(category))}</p><h1>${escapeHTML(name)}</h1><p>${escapeHTML(description)}</p><dl><div><dt>${text('كود المنتج','Product code')}</dt><dd><bdi>${escapeHTML(product.code || '—')}</bdi></dd></div><div><dt>${text('الفئة','Category')}</dt><dd>${escapeHTML(categoryName(category))}</dd></div></dl><p>${text('المواصفات المذكورة في اسم المنتج تخص هذا الموديل. تواصل معنا لمراجعة ملاءمته لاحتياجات المسبح وتأكيد التفاصيل.','Specifications stated in the product name refer to this model. Contact us to review its suitability for your pool and confirm the details.')}</p><p class="catalog-note">${text('عرض المنتج لا يؤكد توافره لدى المحل. يُرجى التواصل قبل الاتفاق.','This listing does not confirm availability at the shop. Please contact us before making arrangements.')}</p><a class="button primary whatsapp" href="${whatsapp}" target="_blank" rel="noopener noreferrer">${waIcon}${text('تواصل بخصوص المنتج','Contact us about this product')}</a></div></div>`;
    const specificationRows = (product.specs || []).map(spec => `<div><dt>${escapeHTML(english ? spec.labelEn : spec.label)}</dt><dd>${escapeHTML(english ? spec.valueEn : spec.value)}</dd></div>`).join('');
    detail.querySelector('dl').insertAdjacentHTML('beforeend', specificationRows);
    document.title = name + ' | AXIS Blue';
    const metadata = [['meta[name="description"]',`${name}. ${description}`],['meta[property="og:title"]',`${name} | AXIS Blue`],['meta[property="og:description"]',description],['meta[property="og:image"]',product.image]];
    for (const [selector, content] of metadata) document.querySelector(selector).content = content;
    document.querySelector('.floating-wa').href = whatsapp;
  }
}
