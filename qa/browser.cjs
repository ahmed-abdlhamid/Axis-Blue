const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ttf':'font/ttf','.woff2':'font/woff2','.svg':'image/svg+xml'};
async function start() {
  const server = http.createServer((req,res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) {res.writeHead(403).end(); return;}
    fs.readFile(file,(err,data) => {res.writeHead(err ? 404 : 200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream'});res.end(err ? 'Not found' : data);});
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({headless:true,channel:'chrome'});
  return {browser,base,close:async()=>{await browser.close(); await new Promise(resolve=>server.close(resolve));}};
}
module.exports = {start,root};
