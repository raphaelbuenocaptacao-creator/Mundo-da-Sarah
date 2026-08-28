const CACHE_NAME='mundo-sarah-v1';
const APP_SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.svg','./icon-512.svg'];
const PRIVATE_PATHS=['/api/','/auth','/login','/admin','/session','/token','/logout'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  if(PRIVATE_PATHS.some(path=>url.pathname.includes(path))) return;
  if(req.headers.has('authorization')) return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(res=>res).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{
    if(res && res.status===200 && res.type==='basic'){
      const copy=res.clone();caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));
    }
    return res;
  })));
});
