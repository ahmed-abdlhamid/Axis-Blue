"""Import public catalog facts and image references. No marketing prose or prices."""
import concurrent.futures, hashlib, html, json, pathlib, re, urllib.request
ROOT = pathlib.Path(__file__).parent
SLUGS = ['pumps','filters','filtration-systems','lighting-equipment','pool-ladders','pool-sanitization','cleaning-tools','heating-equipment','above-ground-pools','pool-accessories-fittings','pool-chemicals','upvc']
def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(request, timeout=45) as response: return response.read()
def plain(s): return re.sub(r'\s+', ' ',html.unescape(re.sub('<[^>]+>', ' ', s))).strip()
def load_category(task):
    lang, slug = task
    base = f'https://splash-egypt.com/{lang}/product-categories/{slug}'
    pending, visited, products = [base], set(), {}
    while pending:
        url = pending.pop(0)
        if url in visited: continue
        visited.add(url)
        content = fetch(url).decode('utf-8')
        for match in re.finditer(r'<a\b[^>]*class=[\'\"]inner[\'\"][^>]*href="([^"]+)"[^>]*>(.*?)</a>', content, re.S):
            link, body = match.groups()
            title = re.search(r'<h3[^>]*>(.*?)</h3>', body, re.S)
            image = re.search(r'<img[^>]*src="([^"]+)"', body)
            code = re.search(r'<span[^>]*>(.*?)</span>',body,re.S)
            if not title: continue
            key = link.split('/products/')[-1]
            products[key] = {'key':key,'name':plain(title[1]),'code':plain(code[1]) if code else '', 'imageSource':html.unescape(image[1]) if image else '', 'source':html.unescape(link),'category':slug}
        for link in re.findall(r'href="([^"]*page=\d+[^"]*)"',content):
            link = html.unescape(link)
            valid = link.startswith(base) or (lang == 'en' and link.startswith(f'https://splash-egypt.com/product-categories/{slug}?'))
            if valid and link not in visited and link not in pending: pending.append(link)
    return lang, slug, list(products.values()), len(visited)
if __name__ == '__main__':
    groups = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
        for lang, slug, products, pages in executor.map(load_category,[(lang,slug) for lang in ['ar','en'] for slug in SLUGS]):
            groups[(lang,slug)] = products
            print(lang,slug,len(products),'products;',pages,'pages',flush=True)
    merged=[]
    for slug in SLUGS:
        english={p['key']:p for p in groups[('en',slug)]}
        for p in groups[('ar',slug)]:
            en=english.get(p['key'])
            p['nameEn']=en['name'] if en else p['key'].replace('-',' ').title()
            p['id']=hashlib.sha1(p['key'].encode()).hexdigest()[:12]
            p['image']='assets/products/'+hashlib.sha1(p['imageSource'].encode()).hexdigest()[:16]+'.'+p['imageSource'].split('.')[-1].split('?')[0].lower()
            merged.append(p)
    (ROOT/'catalog.json').write_text(json.dumps(merged,ensure_ascii=False,indent=2),encoding='utf-8')
    images={p['imageSource']:p['image'] for p in merged if p['imageSource']}
    (ROOT/'assets/products').mkdir(exist_ok=True)
    def download(item):
        url, path = item
        target=ROOT/path
        if not target.exists(): target.write_bytes(fetch(url))
        return path
    errors=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        jobs={executor.submit(download,item):item for item in images.items()}
        for future in concurrent.futures.as_completed(jobs):
            try: future.result()
            except Exception as e: errors.append({'url':jobs[future][0],'error':str(e)})
    (ROOT/'reference/import-report.json').write_text(json.dumps({'products':len(merged),'uniqueImages':len(images),'errors':errors},indent=2),encoding='utf-8')
    print('DONE',len(merged),'products;',len(images),'images;',len(errors),'image errors',flush=True)
