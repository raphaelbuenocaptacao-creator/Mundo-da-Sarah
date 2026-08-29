const CACHE_NAME='mundo-sarah-v7-life-sim';
const APP_SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.svg','./icon-512.svg','./icon-512-maskable.svg'];
const PRIVATE_PATHS=['/api/','/auth','/login','/logout','/admin','/session','/token','/password','/account','/profile'];
const SHELL_PATHS=new Set(APP_SHELL.map(path=>new URL(path,self.registration.scope).pathname));

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  if(PRIVATE_PATHS.some(path=>url.pathname.toLowerCase().includes(path))) return;
  if(req.headers.has('authorization')||req.headers.has('cookie')) return;

  if(req.mode==='navigate'){
    event.respondWith(fetch(req).catch(()=>caches.match('./index.html')));
    return;
  }

  if(!SHELL_PATHS.has(url.pathname)) return;
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req)));
});