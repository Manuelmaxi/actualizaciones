/* Benderrack Vendedores web – funciona sin internet. Versión 13.9-639a20fa16
   Primero guarda solo lo necesario para abrir la app (rápido); el resto (lector de PDF, OCR, mapa…) se guarda después
   en segundo plano o la primera vez que se usa. Los archivos que no cambiaron entre versiones no se vuelven a bajar. */
const CACHE='benderrack-13.9-639a20fa16',CORE=["index.html", "web.js", "manifest.webmanifest", "icon192.png", "icon512.png", "jspdf.umd.min.js", "jspdf.plugin.autotable.min.js", "logo_pdf.js", "logo_cot.js"],RESTO=["pdf.min.js", "pdf.worker.min.js", "leaflet.js", "leaflet.css", "ocr_core.js", "ocr_spa.js", "plantilla_fv.js", "plantilla_lev.js", "qrcode.js", "jsqr.js", "rack.html", "km_img.js"],HASH={"index.html": "d2c2ed5b48", "web.js": "bab9552359", "manifest.webmanifest": "de7b913dcb", "icon192.png": "a6c34f9398", "icon512.png": "966f8bf810", "jspdf.umd.min.js": "85ba2cc3ff", "jspdf.plugin.autotable.min.js": "2223830cf9", "logo_pdf.js": "0dcabc3340", "logo_cot.js": "228b1130a3", "pdf.min.js": "978fd1b2d1", "pdf.worker.min.js": "38cde53119", "leaflet.js": "db49d009c8", "leaflet.css": "a783710282", "ocr_core.js": "8f04aa0cc8", "ocr_spa.js": "7069eaa477", "plantilla_fv.js": "c46a6cb35a", "plantilla_lev.js": "615718e7f6", "qrcode.js": "bf2f2042f9", "jsqr.js": "c01061bd10", "rack.html": "0ea8e84a43", "km_img.js": "81417d233d"};
const clave=f=>new URL('./'+f+'?h='+HASH[f],self.registration.scope).href;
const nombre=u=>{const p=new URL(u).pathname,b=new URL(self.registration.scope).pathname;let f=p.startsWith(b)?p.slice(b.length):p.split('/').pop();return f===''?'index.html':f};
async function guardar(c,f){const k=clave(f);if(await c.match(k))return;const v=await caches.match(k);if(v){await c.put(k,v);return}
  const r=await fetch(new Request('./'+f,{cache:'reload'}));if(r.ok)await c.put(k,r)}
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(f=>guardar(c,f)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('benderrack-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
let bajando=null;
self.addEventListener('message',e=>{if(e.data&&e.data.tipo==='resto'&&!bajando){bajando=caches.open(CACHE).then(async c=>{for(const f of RESTO){try{await guardar(c,f)}catch(x){}}}).finally(()=>{bajando=null});e.waitUntil&&e.waitUntil(bajando)}});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;const f=nombre(r.url);
  if(HASH[f]){e.respondWith(caches.open(CACHE).then(async c=>{const k=clave(f);let m=await c.match(k)||await caches.match(k);if(m)return m;
    try{const res=await fetch(new Request('./'+f));if(res.ok&&res.type==='basic')c.put(k,res.clone());return res}catch(x){return(await c.match(clave('index.html')))||Response.error()}}));return}
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok&&res.type==='basic'){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(clave('index.html')))))});
