const CACHE_NAME='mundo-sarah-v23-safe-shell';
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
        const cached=await caches.match(isFriends?'./amizades.html':'./index.html');
        return isFriends?cached:injectLifeCycle(cached);
      }
    })());
    return;
  }

  if(url.search) return;
  if(!SHELL_PATHS.has(url.pathname)) return;
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{
    if(res&&res.ok){const copy=res.clone();caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));}
    return res;
  })));
});
