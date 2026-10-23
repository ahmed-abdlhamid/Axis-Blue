"""Import selected factual attributes, excluding vendor warranties and sales claims."""
import concurrent.futures, html, json, pathlib, re, urllib.request, time
ROOT=pathlib.Path(__file__).parent
LABELS={'type':'Type','model':'Model','material':'Material','pool-type':'Pool type','rotational-speed':'Rotational speed','pre-filter':'Pre-filter','capacity':'Capacity','diameter':'Diameter','installation':'Installation','spare-parts':'Spare parts','filter-type':'Filter type','color':'Color','power':'Power','voltage':'Voltage','length':'Length','size':'Size','weight':'Weight','brand':'Brand','volume':'Volume','connection':'Connection'}
def plain(value): return re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]+>',' ',value))).strip()
def inspect(product):
    if 'specs' in product: return product
    for attempt in range(3):
        try:
            request=urllib.request.Request(product['source'],headers={'User-Agent':'Mozilla/5.0'})
            with urllib.request.urlopen(request,timeout=40) as response: content=response.read().decode('utf-8')
            break
        except Exception:
            if attempt==2: raise
            time.sleep(1)
    specs=[]
    for label,body in re.findall(r'<label class="attribute-name[^\"]*">(.*?)</label>(.*?)</ul>',content,re.S):
        value=re.search(r'<li\b[^>]*data-slug="([^"]+)"[^>]*>.*?<input\b([^>]*\bchecked[^>]*)>\s*<span>(.*?)</span>',body,re.S)
        if not value: continue
        key=re.search(r'name=[\'\"]?attribute_([a-z-]+)_',value[2])
        key=key[1] if key else ''
        if key=='warranty' or 'ضمان' in label: continue
        specs.append({'label':plain(label),'labelEn':LABELS.get(key,key.replace('-',' ').capitalize() or 'Specification'),'value':plain(value[3]),'valueEn':value[1].replace('-',' ')})
    product['specs']=specs
    return product
products=json.loads((ROOT/'catalog.json').read_text(encoding='utf-8'))
results={}
failures=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
    jobs={executor.submit(inspect,p):p for p in products}
    for n,future in enumerate(concurrent.futures.as_completed(jobs),1):
        p=jobs[future]
        try: results[p['id']]=future.result()
        except Exception as error: failures.append({'id':p['id'],'error':str(error)})
        if n%50==0: print('Reviewed',n,'/',len(products),flush=True)
products=[results.get(p['id'],p) for p in products]
(ROOT/'catalog.json').write_text(json.dumps(products,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'reference/specification-report.json').write_text(json.dumps({'products':len(products),'withSpecs':sum(bool(p.get('specs')) for p in products),'failures':failures},indent=2),encoding='utf-8')
print('DONE',len(products),'products;',len(failures),'failures',flush=True)
