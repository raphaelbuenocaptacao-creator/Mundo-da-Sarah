(()=> {
  'use strict';
  const KEY='mundoSarahLife6';
  const ROOMS={
    bedroom:{label:'Quarto',icon:'🛏️',floor:'.bedroom',actions:['sleep','dress']},
    kitchen:{label:'Cozinha',icon:'🍳',floor:'.kitchen',actions:['eat','cook']},
    bathroom:{label:'Banheiro',icon:'🚿',floor:'.bathroom',actions:['shower']},
    playroom:{label:'Brinquedos',icon:'🧸',floor:'.playroom',actions:['play','dance']},
    garden:{label:'Jardim',icon:'🌷',floor:'.gardenRoom',actions:['garden','pet']}
  };
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
  const write=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}};
  const ensure=s=>{
    if(!s)return null;
    if(!s.homeCare||typeof s.homeCare!=='object')s.homeCare={rooms:{},tidiedToday:{},day:Number(s.day)||1};
    if(!s.homeCare.rooms||typeof s.homeCare.rooms!=='object')s.homeCare.rooms={};
    if(!s.homeCare.tidiedToday||typeof s.homeCare.tidiedToday!=='object')s.homeCare.tidiedToday={};
    for(const key of Object.keys(ROOMS)){
      if(!Number.isFinite(Number(s.homeCare.rooms[key])))s.homeCare.rooms[key]=82;
      s.homeCare.rooms[key]=clamp(Number(s.homeCare.rooms[key]),0,100);
    }
    const day=Number(s.day)||1;
    if(Number(s.homeCare.day)!==day){
      s.homeCare.day=day;
      s.homeCare.tidiedToday={};
      for(const key of Object.keys(ROOMS))s.homeCare.rooms[key]=clamp(s.homeCare.rooms[key]-8,0,100);
    }
    return s;
  };
  function toast(text){
    let el=document.getElementById('homeCareToast');
    if(!el){
      el=document.createElement('div');el.id='homeCareToast';
      el.style.cssText='position:fixed;z-index:280;left:50%;bottom:26px;transform:translateX(-50%);background:#49385f;color:#fff;padding:10px 14px;border-radius:999px;font:900 12px system-ui;box-shadow:0 8px 22px #0004;max-width:90vw;text-align:center;pointer-events:none';
      document.body.appendChild(el);
    }
    el.textContent=text;el.hidden=false;clearTimeout(el._t);el._t=setTimeout(()=>el.hidden=true,1900);
  }
  function status(v){
    if(v>=80)return{icon:'✨',label:'Arrumado',cls:'clean'};
    if(v>=50)return{icon:'🙂',label:'Usado',cls:'used'};
    return{icon:'🧹',label:'Precisa arrumar',cls:'messy'};
  }
  function mount(){
    if(document.getElementById('homeCarePanel'))return;
    const main=document.querySelector('main')||document.body;
    const panel=document.createElement('section');panel.id='homeCarePanel';panel.className='panel';
    panel.innerHTML='<div class="hcHead"><div><h3>🏡 Cuidados com a casa</h3><small>Os cômodos mudam conforme a Sarah vive neles</small></div><span id="hcAverage"></span></div><div id="hcRooms"></div>';
    const routine=document.getElementById('routinePanel');
    if(routine)routine.insertAdjacentElement('afterend',panel); else main.appendChild(panel);
    const st=document.createElement('style');st.id='homeCareStyles';
    st.textContent='#homeCarePanel{background:linear-gradient(135deg,#fffef8,#eef7ff)}.hcHead{display:flex;align-items:center;justify-content:space-between;gap:10px}.hcHead h3{margin:0}.hcHead small{font-weight:800;color:#7a6b88}.hcHead>span{font:900 11px system-ui;background:#fff;border-radius:999px;padding:7px 9px;white-space:nowrap}.hcRoom{display:grid;grid-template-columns:minmax(0,1fr) 92px;gap:8px;align-items:center;margin-top:8px;padding:9px;border-radius:15px;background:#f2f1f8}.hcRoom.messy{background:#fff0df}.hcInfo{min-width:0;font-size:12px;font-weight:900}.hcInfo small{display:block;color:#7c7088;margin-top:2px}.hcBar{height:6px;background:#ddd8e6;border-radius:99px;overflow:hidden;margin-top:5px}.hcFill{height:100%;background:linear-gradient(90deg,#71b8df,#7dd58d)}.hcTidy{border:0;border-radius:12px;background:#755dcc;color:#fff;padding:9px 8px;font-weight:900;font-size:11px}.hcTidy:disabled{opacity:.45}.floor.hc-messy{box-shadow:inset -12px -12px 0 #00000012,inset 0 0 0 999px #b47b3214}.floor .hcBadge{position:absolute;right:5px;top:5px;z-index:4;background:#ffffffd8;border-radius:999px;padding:2px 5px;font-size:9px;font-weight:900}@media(max-width:560px){.hcRoom{grid-template-columns:minmax(0,1fr) 84px}.hcTidy{min-height:42px}}';
    document.head.appendChild(st);
  }
  function render(){
    const s=ensure(read());if(!s)return;
    write(s);
    const box=document.getElementById('hcRooms');if(!box)return;
    const vals=Object.values(ROOMS).map((_,i)=>s.homeCare.rooms[Object.keys(ROOMS)[i]]);
    const avg=Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
    const avgEl=document.getElementById('hcAverage');if(avgEl)avgEl.textContent='Casa '+avg+'%';
    box.innerHTML=Object.entries(ROOMS).map(([key,r])=>{
      const v=Math.round(s.homeCare.rooms[key]),st=status(v),can=v<96;
      return '<div class="hcRoom '+st.cls+'"><div class="hcInfo">'+r.icon+' '+r.label+' • '+st.icon+' '+st.label+'<small>'+v+'% organizado</small><div class="hcBar"><div class="hcFill" style="width:'+v+'%"></div></div></div><button class="hcTidy" data-tidy="'+key+'" '+(can?'':'disabled')+'>🧺 Arrumar</button></div>';
    }).join('');
    for(const [key,r] of Object.entries(ROOMS)){
      const floor=document.querySelector(r.floor);if(!floor)continue;
      floor.classList.toggle('hc-messy',s.homeCare.rooms[key]<50);
      let badge=floor.querySelector('.hcBadge');
      if(!badge){badge=document.createElement('span');badge.className='hcBadge';floor.appendChild(badge)}
      badge.textContent=status(s.homeCare.rooms[key]).icon+' '+Math.round(s.homeCare.rooms[key])+'%';
    }
  }
  function degradeByAction(action){
    const found=Object.entries(ROOMS).find(([,r])=>r.actions.includes(action));if(!found)return;
    const [key]=found,s=ensure(read());if(!s)return;
    const loss=action==='play'||action==='cook'?7:4;
    s.homeCare.rooms[key]=clamp(s.homeCare.rooms[key]-loss,0,100);
    write(s);render();
  }
  function tidy(key){
    if(!ROOMS[key])return;
    const s=ensure(read());if(!s)return;
    const before=s.homeCare.rooms[key];
    if(before>=96)return;
    if((Number(s.energy)||0)<5){toast('⚡ Sarah está cansada para arrumar agora.');return}
    s.energy=clamp((Number(s.energy)||0)-4,0,100);
    s.homeCare.rooms[key]=clamp(before+32,0,100);
    s.xp=(Number(s.xp)||0)+3;
    const first=!s.homeCare.tidiedToday[key];
    if(first&&before<55){
      s.homeCare.tidiedToday[key]=true;
      s.coins=(Number(s.coins)||0)+2;
      toast('✨ '+ROOMS[key].label+' arrumado! +2 ⭐ +3 XP');
    }else toast('🧺 '+ROOMS[key].label+' ficou mais organizado. +3 XP');
    write(s);render();
    window.dispatchEvent(new CustomEvent('mundoSarah:stateChanged'));
  }
  function wire(){
    document.addEventListener('click',e=>{
      const tidyBtn=e.target.closest('[data-tidy]');
      if(tidyBtn){tidy(tidyBtn.dataset.tidy);return}
      const obj=e.target.closest('[data-kind]');
      if(obj&&obj.dataset.kind)setTimeout(()=>degradeByAction(obj.dataset.kind),350);
    },true);
    window.addEventListener('mundoSarah:stateChanged',()=>setTimeout(render,80));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
    setInterval(render,7000);
  }
  function start(){mount();render();wire()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();