const CACHE_PREFIX='mundo-sarah-';
const CACHE_NAME=`${CACHE_PREFIX}v24-safe-shell`;
const APP_SHELL=['./','./index.html','./amizades.html','./life-social-v8.js','./sim-life.js','./city-progress-v10.js','./routine-v11.js','./pet-care-v12.js','./home-care-v13.js','./room-explore-v14.js','./city-journal-v15.js','./home-objects-v16.js','./decor-studio-v17.js','./needs-guide-v18.js','./manifest.webmanifest','./icon-192.svg','./icon-512.svg','./icon-512-maskable.svg'];
const PRIVATE_PATHS=['/api/','/auth','/login','/logout','/admin','/session','/token','/password','/account','/profile'];
const SENSITIVE_QUERY_KEYS=['token','access_token','refresh_token','password','secret','session','auth','authorization','api_key','apikey','key','code','credential'];
const SHELL_PATHS=new Set(APP_SHELL.map(path=>new URL(path,self.registration.scope).pathname));

function hasSensitiveQuery(url){
  for(const key of url.searchParams.keys()){
    if(SENSITIVE_QUERY_KEYS.includes(key.toLowerCase())) return true;
  }
  return false;
}

function isSafeCacheResponse(response){
  if(!response||!response.ok||response.status===206||response.type==='opaque') return false;
  const cacheControl=(response.headers.get('cache-control')||'').toLowerCase();
  if(cacheControl.includes('no-store')||cacheControl.includes('private')) return false;
  if(response.headers.has('set-cookie')) return false;
  return true;
}

async function precacheShell(){
  const cache=await caches.open(CACHE_NAME);
  await Promise.all(APP_SHELL.map(async path=>{
    try{
      const request=new Request(path,{credentials:'omit',cache:'reload'});
      const response=await fetch(request);
      if(isSafeCacheResponse(response)) await cache.put(request,response.clone());
    }catch(error){
      console.warn('[Mundo da Sarah PWA] precache skipped:',path,error);
    }
  }));
}

self.addEventListener('install',event=>{
  event.waitUntil(precacheShell());
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys
      .filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME)
      .map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

async function injectLifeCycle(response){
  if(!response||!response.ok) return response;
  const type=response.headers.get('content-type')||'';
  if(!type.includes('text/html')) return response;
  const text=await response.text();
  let enhanced=text;
  if(!enhanced.includes('sim-life.js')) enhanced=enhanced.replace('</body>','<script src="./sim-life.js"></script></body>');
  if(!enhanced.includes('city-progress-v10.js')) enhanced=enhanced.replace('</body>','<script src="./city-progress-v10.js"></script></body>');
  if(!enhanced.includes('routine-v11.js')) enhanced=enhanced.replace('</body>','<script src="./routine-v11.js"></script></body>');
  if(!enhanced.includes('pet-care-v12.js')) enhanced=enhanced.replace('</body>','<script src="./pet-care-v12.js"></script></body>');
  if(!enhanced.includes('home-care-v13.js')) enhanced=enhanced.replace('</body>','<script src="./home-care-v13.js"></script></body>');
  if(!enhanced.includes('room-explore-v14.js')) enhanced=enhanced.replace('</body>','<script src="./room-explore-v14.js"></script></body>');
  if(!enhanced.includes('city-journal-v15.js')) enhanced=enhanced.replace('</body>','<script src="./city-journal-v15.js"></script></body>');
  if(!enhanced.includes('home-objects-v16.js')) enhanced=enhanced.replace('</body>','<script src="./home-objects-v16.js"></script></body>');
  if(!enhanced.includes('decor-studio-v17.js')) enhanced=enhanced.replace('</body>','<script src="./decor-studio-v17.js"></script></body>');
  if(!enhanced.includes('needs-guide-v18.js')) enhanced=enhanced.replace('</body>','<script src="./needs-guide-v18.js"></script></body>');
  return new Response(enhanced,{status:response.status,statusText:response.statusText,headers:response.headers});
}

async function matchOwnCache(request){
  const cache=await caches.open(CACHE_NAME);
  return cache.match(request,{ignoreSearch:true});
}

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  if(PRIVATE_PATHS.some(path=>url.pathname.toLowerCase().includes(path))) return;
  if(req.headers.has('authorization')||req.headers.has('cookie')) return;
  if(hasSensitiveQuery(url)) return;

  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      const isFriends=url.pathname.endsWith('amizades.html');
      try{
        const fresh=await fetch(req,{cache:'no-store'});
        return isFriends?fresh:injectLifeCycle(fresh);
      }catch{
        const fallbackRequest=new Request(isFriends?'./amizades.html':'./index.html',{credentials:'omit'});
        const cached=await matchOwnCache(fallbackRequest);
        if(cached) return isFriends?cached:injectLifeCycle(cached);
        return new Response('Sem conexão. Reconecte-se para continuar.',{
          status:503,
          headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}
        });
      }
    })());
    return;
  }

  if(url.search) return;
  if(!SHELL_PATHS.has(url.pathname)) return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    const cached=await cache.match(req,{ignoreSearch:true});
    if(cached) return cached;
    const safeRequest=new Request(req,{credentials:'omit'});
    const response=await fetch(safeRequest);
    if(isSafeCacheResponse(response)) await cache.put(safeRequest,response.clone());
    return response;
  })());
});