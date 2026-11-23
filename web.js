/* Benderrack Vendedores – versión web (PWA)
   - Guarda los datos en IndexedDB (mucho más espacio que localStorage) con una copia en memoria.
   - "Android" de la web: compartir/descargar archivos con las funciones del navegador.
   - Arranca la app cuando los datos ya están cargados. */
(function(){
  'use strict';
  /* ---------- almacenamiento ---------- */
  const DBN='benderrack_web',ST='kv';let idb=null;const pend=new Map();let tFlush=null;
  class WebStore{
    getItem(k){return Object.prototype.hasOwnProperty.call(this,k)?this[k]:null}
    setItem(k,v){v=String(v);this[k]=v;pend.set(k,v);prog()}
    removeItem(k){delete this[k];pend.set(k,null);prog()}
    key(i){return Object.keys(this)[i]||null}
    get length(){return Object.keys(this).length}
    clear(){Object.keys(this).forEach(k=>this.removeItem(k))}
  }
  const LSX=new WebStore();Object.defineProperty(window,'LSX',{value:LSX});
  function prog(){clearTimeout(tFlush);tFlush=setTimeout(flush,250)}
  function flush(){clearTimeout(tFlush);if(!pend.size)return;
    if(!idb){try{pend.forEach((v,k)=>{v==null?localStorage.removeItem('bw_'+k):localStorage.setItem('bw_'+k,v)})}catch(e){}pend.clear();return}
    const tx=idb.transaction(ST,'readwrite'),os=tx.objectStore(ST);pend.forEach((v,k)=>{v==null?os.delete(k):os.put(v,k)});pend.clear()}
  window.__webFlush=flush;
  addEventListener('pagehide',flush);document.addEventListener('visibilitychange',()=>{if(document.hidden)flush()});
  function abrir(){return new Promise(ok=>{if(!window.indexedDB)return ok(null);let r;try{r=indexedDB.open(DBN,1)}catch(e){return ok(null)}
    r.onupgradeneeded=()=>r.result.createObjectStore(ST);r.onsuccess=()=>ok(r.result);r.onerror=()=>ok(null);r.onblocked=()=>ok(null)})}
  function leerTodo(db){return new Promise(ok=>{const out={};const tx=db.transaction(ST,'readonly'),os=tx.objectStore(ST);const c=os.openCursor();
    c.onsuccess=()=>{const cur=c.result;if(cur){out[cur.key]=cur.value;cur.continue()}else ok(out)};c.onerror=()=>ok(out)})}
  async function cargar(){idb=await abrir();let datos={};
    if(idb)datos=await leerTodo(idb);
    else{try{Object.keys(localStorage).filter(k=>k.startsWith('bw_')).forEach(k=>datos[k.slice(3)]=localStorage.getItem(k))}catch(e){}}
    /* primera vez: trae lo que hubiera en localStorage (versiones anteriores de la página) */
    if(!Object.keys(datos).length){try{Object.keys(localStorage).forEach(k=>{if(!k.startsWith('bw_'))datos[k]=localStorage.getItem(k)})}catch(e){}
      Object.keys(datos).forEach(k=>pend.set(k,datos[k]))}
    Object.keys(datos).forEach(k=>{LSX[k]=datos[k]});flush();
    try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}}

  /* ---------- archivos: compartir o descargar ---------- */
  const b64aBlob=(b64,mime)=>{const s=atob(b64),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return new Blob([u],{type:mime||'application/octet-stream'})};
  function descargar(nombre,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=nombre;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000)}
  const aviso=m=>{try{toast(m)}catch(e){}};
  async function compartir(nombre,mime,b64,texto,tel){const blob=b64aBlob(b64,mime),f=new File([blob],nombre,{type:mime});
    if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:nombre,text:texto||''});return}catch(e){if(e&&e.name==='AbortError')return}}
    descargar(nombre,blob);
    if(tel){const t=String(tel).replace(/\D/g,'');aviso('PDF descargado: adjúntalo en el chat de WhatsApp');setTimeout(()=>window.open('https://wa.me/'+t+(texto?'?text='+encodeURIComponent(texto):''),'_blank'),600)}
    else aviso('Archivo descargado: '+nombre)}
  const urlApp=()=>{try{const u=typeof urlApkClientes==='function'&&urlApkClientes();return u||new URL('Benderrack.apk',location.href).href}catch(e){return new URL('Benderrack.apk',location.href).href}};
  const MSG='Le comparto la app Benderrack: ahí puede ver nuestro catálogo, ofertas y precios, y enviarnos sus pedidos. Descárguela aquí: ';
  const fotos=new Map();
  window.Android={web:true,
    load:()=>LSX.getItem('mispedidos_db'),save:s=>LSX.setItem('mispedidos_db',s),
    sharePdfWa:(n,b64,tel,txt)=>compartir(n,'application/pdf',b64,txt,tel),
    sharePdfB64:(n,b64,subj)=>compartir(n,'application/pdf',b64,subj),
    shareFileB64:(n,mime,b64,subj)=>compartir(n,mime,b64,subj),
    saveFileB64:(n,mime,b64)=>{descargar(n,b64aBlob(b64,mime));aviso('Descargado: '+n)},
    shareAssetApk:()=>{const u=urlApp();if(navigator.share)navigator.share({title:'App Benderrack',text:MSG,url:u}).catch(()=>{});else{try{navigator.clipboard.writeText(MSG+u)}catch(e){}aviso('Enlace copiado: pégalo en WhatsApp')}},
    shareAssetApkWa:(n,tel,msg)=>{window.open('https://wa.me/'+String(tel).replace(/\D/g,'')+'?text='+encodeURIComponent((msg||MSG)+' '+urlApp()),'_blank')},
    leerFotoSoporte:id=>fotos.get(id)||LSX.getItem('sopfull_'+id)||'',
    borrarFotoSoporte:id=>{fotos.delete(id);LSX.removeItem('sopfull_'+id)},
    _guardarFotoWeb:(id,dataUrl)=>{fotos.set(id,dataUrl);LSX.setItem('sopfull_'+id,dataUrl)},
    _descargar:descargar,
    loginMicrosoft:(url)=>{try{sessionStorage.setItem('br_pkce',JSON.stringify(window.__pkceWeb()||null))}catch(e){}location.href=url}
  };

  /* ---------- instalar como app ---------- */
  let promptInst=null;
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptInst=e;mostrarInstalar()});
  window.__instalarWeb=async()=>{if(!promptInst)return aviso('Para instalarla: menú del navegador → "Agregar a la pantalla de inicio" o "Instalar aplicación"');promptInst.prompt();try{await promptInst.userChoice}catch(e){}promptInst=null;const b=document.getElementById('webinst');if(b)b.remove()};
  function mostrarInstalar(){if(document.getElementById('webinst')||matchMedia('(display-mode: standalone)').matches)return;const b=document.createElement('button');b.id='webinst';b.textContent='📲 Instalar Benderrack';
    b.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:84px;z-index:50;border:0;border-radius:22px;padding:10px 18px;background:#1e8e3e;color:#fff;font:600 14px system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.25)';
    b.onclick=()=>window.__instalarWeb();document.body.appendChild(b);setTimeout(()=>{if(b.parentNode)b.remove()},20000)}

  /* ---------- service worker (funciona sin internet y se actualiza sola) ---------- */
  if('serviceWorker' in navigator&&/^https?:/.test(location.protocol)){
    navigator.serviceWorker.register('sw.js').then(r=>{r.addEventListener('updatefound',()=>{const w=r.installing;if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)avisarNueva()})})}).catch(()=>{})}
  function avisarNueva(){const d=document.createElement('div');d.style.cssText='position:fixed;left:12px;right:12px;bottom:84px;z-index:60;background:#16233f;color:#fff;border-radius:14px;padding:12px 14px;font:14px system-ui,sans-serif;display:flex;gap:10px;align-items:center;box-shadow:0 6px 18px rgba(0,0,0,.3)';
    d.innerHTML='<span style="flex:1">🔄 Hay una versión nueva de Benderrack.</span><button style="border:0;border-radius:10px;padding:8px 12px;background:#1e8e3e;color:#fff;font-weight:700">Actualizar</button>';
    d.querySelector('button').onclick=()=>{flush();location.reload()};document.body.appendChild(d)}

  /* ---------- arranque ---------- */
  function iniciar(){cargar().then(()=>{const src=document.getElementById('appsrc');const s=document.createElement('script');s.textContent=src.textContent;src.remove();document.body.appendChild(s)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);else iniciar();
})();
