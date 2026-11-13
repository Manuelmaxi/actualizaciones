/* Benderrack Vendedores web – funciona sin internet. Versión 8.2-4c31e00d8e */
const CACHE='benderrack-8.2-4c31e00d8e',ARCH=["./", "index.html", "web.js", "manifest.webmanifest", "icon192.png", "icon512.png", "jspdf.umd.min.js", "jspdf.plugin.autotable.min.js", "logo_pdf.js", "logo_cot.js", "pdf.min.js", "pdf.worker.min.js", "leaflet.js", "leaflet.css", "ocr_core.js", "ocr_spa.js", "plantilla_fv.js"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARCH)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('benderrack-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  e.respondWith(caches.match(r,{ignoreSearch:u.pathname.endsWith('/')||u.pathname.endsWith('index.html')}).then(m=>m||fetch(r).then(res=>{if(res.ok&&res.type==='basic'){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match('./'))))});
