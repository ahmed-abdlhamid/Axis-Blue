"""Use the English reference's exact technical values, preserving decimal units."""
import concurrent.futures, html, json, pathlib, re, urllib.request, time
ROOT=pathlib.Path(__file__).parent
def plain(value): return re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]+>',' ',value))).strip()
def inspect(product):
    if product.get('englishSpecsVerified'): return product
    for attempt in range(3):
        try:
            request=urllib.request.Request(product['source'].replace('/ar/','/'),headers={'User-Agent':'Mozilla/5.0'})
            with urllib.request.urlopen(request,timeout=40) as response: content=response.read().decode('utf-8')
            break
        except Exception:
            if attempt==2: raise
            time.sleep(1)
    selected=[]
    for label,body in re.findall(r'<label class="attribute-name[^\"]*">(.*?)</label>(.*?)</ul>',content,re.S):
        value=re.search(r'<li\b[^>]*data-slug="([^"]+)"[^>]*>.*?<input\b([^>]*\bchecked[^>]*)>\s*<span>(.*?)</span>',body,re.S)
        if not value or 'warranty' in value[2].lower() or 'warranty' in label.lower(): continue
        selected.append({'label':plain(label),'value':plain(value[3])})
    if len(selected)!=len(product.get('specs',[])):
        raise ValueError('English/Arabic selected specification count differs')
    for ar,en in zip(product.get('specs',[]),selected):
        ar['labelEn']=en['label']
        ar['valueEn']=en['value']
    product['englishSpecsVerified']=True
    return product
products=json.loads((ROOT/'catalog.json').read_text(encoding='utf-8'))
results={}; failures=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
    jobs={executor.submit(inspect,p):p for p in products}
    for n,future in enumerate(concurrent.futures.as_completed(jobs),1):
        p=jobs[future]
        try: results[p['id']]=future.result()
        except Exception as error: failures.append({'id':p['id'],'error':str(error)})
        if n%100==0: print('English specifications',n,'/',len(products),flush=True)
products=[results.get(p['id'],p) for p in products]
(ROOT/'catalog.json').write_text(json.dumps(products,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'reference/english-specification-report.json').write_text(json.dumps({'verified':len(results),'failures':failures},indent=2),encoding='utf-8')
print('DONE',len(results),'verified;',len(failures),'failures',flush=True)
