/* Benderrack Vendedores – versión web (PWA)
   - Guarda los datos en IndexedDB (mucho más espacio que localStorage) con una copia en memoria.
   - "Android" de la web: compartir/descargar archivos con las funciones del navegador.
   - Arranca la app cuando los datos ya están cargados. */
(function(){
  'use strict';
  /* ---------- almacenamiento ---------- */
  const DBN='benderrack_web',ST='kv',SA='arch';const ARCH=new Map();let idb=null;const pend=new Map();let tFlush=null;
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
  function abrir(){return new Promise(ok=>{if(!window.indexedDB)return ok(null);let r;try{r=indexedDB.open(DBN,2)}catch(e){return ok(null)}
    r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(ST))d.createObjectStore(ST);if(!d.objectStoreNames.contains(SA))d.createObjectStore(SA)};r.onsuccess=()=>ok(r.result);r.onerror=()=>ok(null);r.onblocked=()=>ok(null)})}
  function leerTodo(db){return new Promise(ok=>{const out={};const tx=db.transaction(ST,'readonly'),os=tx.objectStore(ST);const c=os.openCursor();
    c.onsuccess=()=>{const cur=c.result;if(cur){out[cur.key]=cur.value;cur.continue()}else ok(out)};c.onerror=()=>ok(out)})}
  /* archivos adjuntos (PDF, planos, documentos): guardados en el navegador, se quedan aunque recargues */
  function leerArch(db){return new Promise(ok=>{try{const tx=db.transaction(SA,'readonly'),c=tx.objectStore(SA).openCursor();c.onsuccess=()=>{const cur=c.result;if(cur){ARCH.set(String(cur.key),String(cur.value));cur.continue()}else ok()};c.onerror=()=>ok()}catch(e){ok()}})}
  function archPut(fid,b64){ARCH.set(fid,b64);if(!idb)return;try{idb.transaction(SA,'readwrite').objectStore(SA).put(b64,fid)}catch(e){}}
  function archDel(fid){ARCH.delete(fid);if(!idb)return;try{idb.transaction(SA,'readwrite').objectStore(SA).delete(fid)}catch(e){}}
  const fidOk=f=>String(f||'').replace(/[^A-Za-z0-9]/g,'');
  async function cargar(){idb=await abrir();let datos={};
    if(idb){datos=await leerTodo(idb);await leerArch(idb)}
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
    guardarDocB64:b64=>{const fid='pd'+Date.now().toString(36)+Math.floor(Math.random()*1e6).toString(36);archPut(fid,String(b64).replace(/\s/g,''));return fid},
    guardarDocConId:(fid,b64)=>{fid=fidOk(fid);if(!fid)return false;archPut(fid,String(b64).replace(/\s/g,''));return true},
    leerArchivoPlanoB64:fid=>{const b=ARCH.get(fidOk(fid));return b&&b.length<=5400000?b:null},
    tamArchivoPlano:fid=>{const b=ARCH.get(fidOk(fid));return b?Math.floor(b.length*3/4)-(b.endsWith('==')?2:b.endsWith('=')?1:0):-1},
    borrarArchivoPlano:fid=>archDel(fidOk(fid)),
    abrirArchivoPlano:(fid,nombre,mime,modo,tel)=>{const b=ARCH.get(fidOk(fid));if(!b)return aviso('Ese archivo no está guardado en este navegador');
      if(modo==='compartir'||modo==='whatsapp')return compartir(nombre,mime,b,'',modo==='whatsapp'?tel:'');
      const blob=b64aBlob(b,mime);if(modo==='guardar'||!/^(application\/pdf|image\/|text\/)/.test(mime||''))return descargar(nombre,blob);const u=URL.createObjectURL(blob),w=window.open(u,'_blank');if(!w)descargar(nombre,blob);setTimeout(()=>URL.revokeObjectURL(u),60000)},
    _archivos:()=>ARCH.size,
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

  /* ---------- pantalla completa (computadora y Android): botón en el encabezado ---------- */
  const SVGF=(d)=>'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="'+d+'"/></svg>';
  const enPantalla=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
  window.__pantallaCompleta=()=>{const d=document.documentElement;try{if(enPantalla())(document.exitFullscreen||document.webkitExitFullscreen).call(document);else{const r=(d.requestFullscreen||d.webkitRequestFullscreen).call(d);if(r&&r.catch)r.catch(()=>aviso('Tu navegador no permitió la pantalla completa (prueba con F11)'))}}catch(e){aviso('Usa F11 para pantalla completa')}};
  function botonPantalla(){const h=document.querySelector('header'),d=document.documentElement;if(!h||document.getElementById('wfull')||!(d.requestFullscreen||d.webkitRequestFullscreen))return;
    const b=document.createElement('button');b.id='wfull';b.type='button';
    const pinta=()=>{const on=enPantalla();b.innerHTML=SVGF(on?'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5':'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5');b.title=on?'Salir de pantalla completa':'Pantalla completa';b.setAttribute('aria-label',b.title)};
    b.onclick=()=>window.__pantallaCompleta();document.addEventListener('fullscreenchange',pinta);document.addEventListener('webkitfullscreenchange',pinta);pinta();
    const bell=document.getElementById('nbell');if(bell&&bell.parentNode===h)h.insertBefore(b,bell);else h.appendChild(b)}

  /* ---------- arranque ---------- */
  function iniciar(){cargar().then(()=>{const src=document.getElementById('appsrc');const s=document.createElement('script');s.textContent=src.textContent;src.remove();document.body.appendChild(s);setTimeout(botonPantalla,200)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);else iniciar();
})();
