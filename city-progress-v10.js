(()=>{
  'use strict';

  const SAVE='mundoSarahLife6';
  const PLACES={
    park:{level:1,label:'Parque Encantado',icon:'🌳'},
    bakery:{level:1,label:'Padaria Doce',icon:'🧁'},
    school:{level:2,label:'Escola Criativa',icon:'🏫'},
    boutique:{level:2,label:'Boutique Real',icon:'👗'},
    petshop:{level:2,label:'Casa dos Pets',icon:'🐾'},
    castle:{level:3,label:'Castelo das Estrelas',icon:'🏰'}
  };

  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const read=()=>{try{return JSON.parse(localStorage.getItem(SAVE)||'null')}catch{return null}};
  const write=s=>{try{localStorage.setItem(SAVE,JSON.stringify(s))}catch{}};
  const levelOf=s=>1+Math.floor((Number(s?.xp)||0)/25);

  function toast(text){
    const base=document.getElementById('toast');
    if(base){
      base.textContent=text;
      base.classList.add('show');
      clearTimeout(base.__cityTimer);
      base.__cityTimer=setTimeout(()=>base.classList.remove('show'),1600);
      return;
    }
    const el=document.createElement('div');
    el.textContent=text;
    el.style.cssText='position:fixed;z-index:300;left:50%;bottom:28px;transform:translateX(-50%);background:#47345f;color:#fff;padding:11px 15px;border-radius:999px;font:900 12px system-ui;max-width:88vw;text-align:center;box-shadow:0 8px 22px #0004';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),1600);
  }

  function ensureStyles(){
    if(document.getElementById('cityProgressV10Styles')) return;
    const style=document.createElement('style');
    style.id='cityProgressV10Styles';
    style.textContent=`
      .place.cityLocked{filter:saturate(.35);opacity:.72}
      .place.cityLocked:after{content:"🔒";position:absolute;inset:0;display:grid;place-items:center;background:#30284b66;font-size:34px;backdrop-filter:blur(1px)}
      .cityLockBadge{position:absolute;left:10px;bottom:10px;z-index:3;background:#2f275ddd;color:#fff;border:1px solid #ffffff77;border-radius:999px;padding:5px 8px;font:900 10px system-ui}
      .cityUnlockBanner{max-width:900px;margin:12px auto 0;padding:0 14px}
      .cityUnlockInner{background:#ffffffea;border-radius:18px;padding:11px 12px;color:#56446f;box-shadow:0 8px 22px #3453}
      .cityUnlockTop{display:flex;justify-content:space-between;gap:10px;align-items:center;font:900 12px system-ui}
      .cityUnlockBar{height:8px;margin-top:7px;border-radius:99px;background:#e6def1;overflow:hidden}
      .cityUnlockFill{height:100%;background:linear-gradient(90deg,#6f64d7,#e56eb6);transition:width .35s ease}
      .cityUnlockNext{display:block;margin-top:6px;font:800 10px system-ui;color:#78678f}
      @media(max-width:560px){.cityUnlockInner{padding:10px}.cityLockBadge{font-size:9px}.place.cityLocked:after{font-size:30px}}
    `;
    document.head.appendChild(style);
  }

  function ensureBanner(){
    const city=document.getElementById('city');
    const map=city?.querySelector('.map');
    if(!city||!map) return null;
    let wrap=document.getElementById('cityUnlockBanner');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.id='cityUnlockBanner';
      wrap.className='cityUnlockBanner';
      wrap.innerHTML='<div class="cityUnlockInner"><div class="cityUnlockTop"><span id="cityUnlockTitle">🗺️ Bairro da Sarah</span><span id="cityUnlockCount">0/6 locais</span></div><div class="cityUnlockBar"><div class="cityUnlockFill" id="cityUnlockFill"></div></div><small class="cityUnlockNext" id="cityUnlockNext"></small></div>';
      city.insertBefore(wrap,map);
    }
    return wrap;
  }

  function celebrateUnlocks(s,lvl){
    if(!Array.isArray(s.cityUnlockCelebrated)) s.cityUnlockCelebrated=[];
    const available=Object.entries(PLACES).filter(([,p])=>lvl>=p.level).map(([key])=>key);
    const newly=available.filter(key=>!s.cityUnlockCelebrated.includes(key));
    if(!newly.length) return;
    s.cityUnlockCelebrated.push(...newly);
    if(s.cityUnlockInitialized){
      const last=newly[newly.length-1];
      const p=PLACES[last];
      s.coins=(Number(s.coins)||0)+3;
      toast(`${p.icon} ${p.label} foi liberado! +3 ⭐`);
    }else{
      s.cityUnlockInitialized=true;
    }
    write(s);
  }

  function render(){
    ensureStyles();
    ensureBanner();
    const s=read();
    if(!s) return;
    const lvl=levelOf(s);
    celebrateUnlocks(s,lvl);

    let unlocked=0;
    document.querySelectorAll('[data-place]').forEach(btn=>{
      const meta=PLACES[btn.dataset.place];
      if(!meta) return;
      const locked=lvl<meta.level;
      if(!locked) unlocked++;
      btn.classList.toggle('cityLocked',locked);
      btn.setAttribute('aria-disabled',locked?'true':'false');
      btn.dataset.requiredLevel=String(meta.level);

      let badge=btn.querySelector('.cityLockBadge');
      if(locked){
        if(!badge){
          badge=document.createElement('span');
          badge.className='cityLockBadge';
          btn.appendChild(badge);
        }
        badge.textContent=`Nível ${meta.level}`;
      }else if(badge){
        badge.remove();
      }
    });

    const count=document.getElementById('cityUnlockCount');
    const fill=document.getElementById('cityUnlockFill');
    const next=document.getElementById('cityUnlockNext');
    if(count) count.textContent=`${unlocked}/${Object.keys(PLACES).length} locais`;
    if(fill) fill.style.width=`${(unlocked/Object.keys(PLACES).length)*100}%`;

    const nextEntry=Object.values(PLACES).filter(p=>p.level>lvl).sort((a,b)=>a.level-b.level)[0];
    if(next){
      if(nextEntry){
        const xp=Number(s.xp)||0;
        const needed=nextEntry.level*25-25;
        next.textContent=`Próximo: ${nextEntry.icon} ${nextEntry.label} no nível ${nextEntry.level} • faltam ${Math.max(0,needed-xp)} XP`;
      }else{
        next.textContent='✨ Todos os bairros principais estão liberados.';
      }
    }
  }

  function guardLockedPlace(e){
    const btn=e.target.closest?.('[data-place]');
    if(!btn) return;
    const meta=PLACES[btn.dataset.place];
    if(!meta) return;
    const s=read();
    const lvl=levelOf(s||{});
    if(lvl>=meta.level) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    toast(`🔒 ${meta.label} libera no nível ${meta.level}. Continue cuidando da Sarah e fazendo atividades!`);
  }

  function start(){
    ensureStyles();
    ensureBanner();
    render();
    document.addEventListener('click',guardLockedPlace,true);

    const levelNode=document.getElementById('level');
    if(levelNode && 'MutationObserver' in window){
      new MutationObserver(render).observe(levelNode,{childList:true,subtree:true,characterData:true});
    }
    const city=document.getElementById('city');
    if(city && 'MutationObserver' in window){
      new MutationObserver(()=>{if(city.classList.contains('open')) render()}).observe(city,{attributes:true,attributeFilter:['class']});
    }
    window.addEventListener('storage',e=>{if(e.key===SAVE) render()});
    setInterval(()=>{if(document.getElementById('city')?.classList.contains('open')) render()},2000);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();