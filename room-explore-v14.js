(()=>{
  'use strict';
  const KEY='mundoSarahLife6';
  const ROOMS=[
    {key:'bedroom',label:'Quarto',icon:'🛏️',selector:'.bedroom'},
    {key:'kitchen',label:'Cozinha',icon:'🍳',selector:'.kitchen'},
    {key:'bathroom',label:'Banheiro',icon:'🚿',selector:'.bathroom'},
    {key:'playroom',label:'Brinquedos',icon:'🧸',selector:'.playroom'},
    {key:'garden',label:'Jardim',icon:'🌷',selector:'.gardenRoom'}
  ];
  let currentRoom='';
  let timer=null;
  const parse=v=>{try{return JSON.parse(v||'null')}catch{return null}};
  const read=()=>parse(localStorage.getItem(KEY));
  const write=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}}
  const inside=(x,y,r)=>x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;

  function ensure(s){
    if(!s)return null;
    if(!s.roomExplore||typeof s.roomExplore!=='object')s.roomExplore={};
    const day=String(Number(s.day)||1);
    if(!s.roomExplore[day])s.roomExplore[day]={visited:[],rewarded:false};
    if(!Array.isArray(s.roomExplore[day].visited))s.roomExplore[day].visited=[];
    Object.keys(s.roomExplore).sort((a,b)=>Number(b)-Number(a)).slice(7).forEach(k=>delete s.roomExplore[k]);
    return s;
  }

  function mount(){
    if(document.getElementById('roomExploreHud'))return;
    const viewport=document.getElementById('viewport');
    if(!viewport)return;
    const hud=document.createElement('div');
    hud.id='roomExploreHud';
    hud.innerHTML='<div id="roomExplorePlace">🏡 Casa</div><div id="roomExploreDots" aria-label="Cômodos explorados"></div>';
    viewport.appendChild(hud);
    const style=document.createElement('style');
    style.id='roomExploreStyles';
    style.textContent=`
      #roomExploreHud{position:absolute;z-index:42;left:10px;top:10px;display:flex;flex-direction:column;gap:6px;pointer-events:none}
      #roomExplorePlace{width:max-content;max-width:72vw;background:#fffef2e8;color:#4c4164;border:1px solid #fff;border-radius:999px;padding:6px 10px;font:900 11px system-ui;box-shadow:0 4px 12px #0002}
      #roomExploreDots{display:flex;gap:4px;background:#ffffffbd;border-radius:999px;padding:4px 6px;width:max-content;box-shadow:0 4px 12px #0001}
      .roomDot{font-size:13px;filter:grayscale(1);opacity:.42;transition:.2s}.roomDot.done{filter:none;opacity:1;transform:scale(1.08)}
      .floor.roomActive{outline:4px solid #fff7b9;outline-offset:-5px;filter:brightness(1.08);transition:filter .2s,outline-color .2s}
      @media(max-width:560px){#roomExploreHud{top:44px}#roomExplorePlace{font-size:10px;padding:5px 8px}.roomDot{font-size:12px}}
    `;
    document.head.appendChild(style);
  }

  function toast(text){
    let el=document.getElementById('roomExploreToast');
    if(!el){
      el=document.createElement('div');el.id='roomExploreToast';
      el.style.cssText='position:fixed;z-index:270;left:50%;bottom:32px;transform:translateX(-50%);background:#4d3b69;color:white;padding:10px 14px;border-radius:999px;font:900 12px system-ui;box-shadow:0 8px 24px #0004;max-width:90vw;text-align:center;pointer-events:none';
      document.body.appendChild(el);
    }
    el.textContent=text;el.hidden=false;clearTimeout(el._t);el._t=setTimeout(()=>el.hidden=true,1700);
  }

  function render(s,room){
    const day=String(Number(s.day)||1),rec=s.roomExplore[day],place=document.getElementById('roomExplorePlace'),dots=document.getElementById('roomExploreDots');
    if(place)place.textContent=room?room.icon+' '+room.label:'🏡 Área externa';
    if(dots)dots.innerHTML=ROOMS.map(r=>'<span class="roomDot '+(rec.visited.includes(r.key)?'done':'')+'" title="'+r.label+'">'+r.icon+'</span>').join('');
    ROOMS.forEach(r=>{const el=document.querySelector(r.selector);if(el)el.classList.toggle('roomActive',!!room&&room.key===r.key);});
  }

  function detectRoom(){
    const avatar=document.getElementById('avatar');
    if(!avatar)return null;
    const a=avatar.getBoundingClientRect(),x=a.left+a.width/2,y=a.top+a.height*.72;
    for(const room of ROOMS){const el=document.querySelector(room.selector);if(el&&inside(x,y,el.getBoundingClientRect()))return room;}
    return null;
  }

  function update(){
    const s=ensure(read());if(!s)return;
    const room=detectRoom(),key=room?room.key:'';
    if(key!==currentRoom){
      currentRoom=key;
      if(room){
        const day=String(Number(s.day)||1),rec=s.roomExplore[day];
        if(!rec.visited.includes(room.key)){
          rec.visited.push(room.key);
          if(rec.visited.length===ROOMS.length&&!rec.rewarded){
            rec.rewarded=true;s.coins=(Number(s.coins)||0)+8;s.xp=(Number(s.xp)||0)+12;
            toast('🏡 Casa toda explorada hoje! +8 ⭐ +12 XP');
          }else{
            toast(room.icon+' '+room.label+' descoberto • '+rec.visited.length+'/'+ROOMS.length);
          }
          write(s);
          window.dispatchEvent(new CustomEvent('mundoSarah:stateChanged'));
        }
      }
    }
    render(s,room);
  }

  function start(){
    mount();update();
    clearInterval(timer);timer=setInterval(update,350);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)update()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
