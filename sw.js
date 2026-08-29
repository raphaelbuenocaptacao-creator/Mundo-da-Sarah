const CACHE_NAME='mundo-sarah-v11-life-cycle';
const APP_SHELL=['./','./index.html','./amizades.html','./life-social-v8.js','./sim-life.js','./manifest.webmanifest','./icon-192.svg','./icon-512.svg','./icon-512-maskable.svg'];
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

async function injectLifeCycle(response){
  if(!response||!response.ok) return response;
  const type=response.headers.get('content-type')||'';
  if(!type.includes('text/html')) return response;
  const text=await response.text();
  if(text.includes('sim-life.js')) return new Response(text,{status:response.status,statusText:response.statusText,headers:response.headers});
  const enhanced=text.replace('</body>','<script src="./sim-life.js"></script></body>');
  return new Response(enhanced,{status:response.status,statusText:response.statusText,headers:response.headers});
}

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  if(PRIVATE_PATHS.some(path=>url.pathname.toLowerCase().includes(path))) return;
  if(req.headers.has('authorization')||req.headers.has('cookie')) return;

  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      const isFriends=url.pathname.endsWith('amizades.html');
      try{
        const fresh=await fetch(req);
        return isFriends?fresh:injectLifeCycle(fresh);
      }catch{
        const cached=await caches.match(isFriends?'./amizades.html':'./index.html');
        return isFriends?cached:injectLifeCycle(cached);
      }
    })());
    return;
  }

  if(!SHELL_PATHS.has(url.pathname)) return;
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{
    if(res&&res.ok){const copy=res.clone();caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));}
    return res;
  })));
});