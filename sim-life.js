(()=>{
  const ROOT_KEY='mundoSarahLife6';
  const TICK_MS=8000;
  const MINUTES_PER_TICK=20;
  const SKILL_MAX=5;
  const SKILL_ACTIONS={
    cook:{key:'cooking',label:'Cozinha',icon:'🍳'},
    eat:{key:'cooking',label:'Cozinha',icon:'🍳'},
    play:{key:'creativity',label:'Criatividade',icon:'🎨'},
    dance:{key:'creativity',label:'Criatividade',icon:'🎨'},
    pet:{key:'care',label:'Cuidado',icon:'💗'},
    garden:{key:'garden',label:'Jardinagem',icon:'🌱'},
    dress:{key:'style',label:'Estilo',icon:'👗'}
  };
  let lifeTimer=null;

  function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
  function readState(){
    try{return JSON.parse(localStorage.getItem(ROOT_KEY)||'null');}catch{return null;}
  }
  function writeState(s){try{localStorage.setItem(ROOT_KEY,JSON.stringify(s));}catch{}}
  function ensureState(){
    const s=readState();
    if(!s)return null;
    if(!Number.isFinite(s.clockMinutes))s.clockMinutes=7*60;
    if(!Number.isFinite(s.moodScore))s.moodScore=80;
    if(!s.skills||typeof s.skills!=='object')s.skills={};
    for(const key of ['cooking','creativity','care','garden','style']){
      const current=s.skills[key];
      if(!current||typeof current!=='object')s.skills[key]={xp:0,level:1};
      s.skills[key].xp=Math.max(0,Number(s.skills[key].xp)||0);
      s.skills[key].level=clamp(Number(s.skills[key].level)||1,1,SKILL_MAX);
    }
    return s;
  }
  function formatTime(total){
    total=((Math.round(total)%1440)+1440)%1440;
    const h=Math.floor(total/60),m=total%60;
    return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
  }
  function moodFrom(s){
    const vals=['hunger','energy','fun','hygiene'].map(k=>clamp(Number(s[k])||0,0,100));
    const avg=vals.reduce((a,b)=>a+b,0)/vals.length;
    const min=Math.min(...vals);
    if(min<18)return{icon:'😣',label:'Precisando de cuidados',score:Math.round(avg)};
    if(avg<42)return{icon:'😕',label:'Desanimada',score:Math.round(avg)};
    if(avg<68)return{icon:'🙂',label:'Bem',score:Math.round(avg)};
    if(avg<88)return{icon:'😊',label:'Feliz',score:Math.round(avg)};
    return{icon:'🤩',label:'Radiante',score:Math.round(avg)};
  }
  function phase(min){
    const h=min/60;
    if(h>=5&&h<8)return{label:'Amanhecer',shade:'rgba(255,193,119,.10)'};
    if(h>=8&&h<17)return{label:'Dia',shade:'rgba(255,255,255,0)'};
    if(h>=17&&h<20)return{label:'Entardecer',shade:'rgba(255,143,89,.13)'};
    return{label:'Noite',shade:'rgba(35,42,95,.28)'};
  }
  function mount(){
    const hud=document.querySelector('.hudtop');
    const viewport=document.getElementById('viewport');
    if(!hud||!viewport)return;

    if(!document.getElementById('lifeClock')){
      const card=document.createElement('div');
      card.id='lifeClock';
      card.setAttribute('aria-live','polite');
      card.style.cssText='display:flex;align-items:center;gap:8px;background:#ffffff24;border:1px solid #ffffff55;border-radius:14px;padding:6px 9px;font-weight:900;font-size:11px;white-space:nowrap';
      card.innerHTML='<span id="moodIcon" style="font-size:22px">😊</span><span><b id="clockText">07:00</b><br><small id="moodText">Feliz</small></span>';
      const cash=hud.querySelector('.cash');
      hud.insertBefore(card,cash||null);
    }

    if(!document.getElementById('dayShade')){
      const shade=document.createElement('div');
      shade.id='dayShade';
      shade.style.cssText='position:absolute;inset:0;z-index:40;pointer-events:none;transition:background 1.2s ease;border-radius:20px';
      viewport.appendChild(shade);
    }

    if(!document.getElementById('phaseChip')){
      const chip=document.createElement('div');
      chip.id='phaseChip';
      chip.style.cssText='position:absolute;right:10px;top:10px;z-index:41;background:#ffffffdd;color:#4d4165;border-radius:999px;padding:5px 9px;font:900 10px system-ui;pointer-events:none';
      viewport.appendChild(chip);
    }

    if(!document.getElementById('skillPanel')){
      const panel=document.createElement('section');
      panel.id='skillPanel';
      panel.className='panel';
      panel.style.cssText='margin:0 10px 12px;background:#fffffff0;border-radius:20px;padding:12px';
      panel.innerHTML='<div style="display:flex;align-items:end;justify-content:space-between;gap:8px"><h3 style="margin:0">🌟 Habilidades da Sarah</h3><small style="font-weight:800;color:#78678f">use objetos para evoluir</small></div><div id="skillGrid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:9px"></div>';
      const main=document.querySelector('main')||document.querySelector('.app');
      if(main)main.appendChild(panel);
      const style=document.createElement('style');
      style.textContent='#skillGrid .skillCard{background:#f3effb;border-radius:14px;padding:8px 6px;text-align:center;color:#5b477c;font-weight:900;font-size:11px}#skillGrid .skillIcon{display:block;font-size:23px}#skillGrid .skillBar{height:6px;background:#ded5ee;border-radius:99px;overflow:hidden;margin-top:5px}#skillGrid .skillFill{height:100%;background:linear-gradient(90deg,#7a67d8,#e26ab5)}@media(max-width:560px){#skillGrid{grid-template-columns:repeat(2,1fr)!important}}';
      document.head.appendChild(style);
    }
  }
  function skillMeta(){
    return [
      {key:'cooking',label:'Cozinha',icon:'🍳'},
      {key:'creativity',label:'Criatividade',icon:'🎨'},
      {key:'care',label:'Cuidado',icon:'💗'},
      {key:'garden',label:'Jardinagem',icon:'🌱'},
      {key:'style',label:'Estilo',icon:'👗'}
    ];
  }
  function skillThreshold(level){return level*4;}
  function renderSkills(s){
    const grid=document.getElementById('skillGrid');
    if(!grid)return;
    grid.innerHTML=skillMeta().map(meta=>{
      const skill=s.skills[meta.key];
      const maxed=skill.level>=SKILL_MAX;
      const threshold=skillThreshold(skill.level);
      const pct=maxed?100:clamp((skill.xp/threshold)*100,0,100);
      return '<div class="skillCard"><span class="skillIcon">'+meta.icon+'</span>'+meta.label+'<br><small>Nível '+skill.level+(maxed?' • MAX':'')+'</small><div class="skillBar"><div class="skillFill" style="width:'+pct+'%"></div></div></div>';
    }).join('');
  }
  function notify(text){
    const existing=document.getElementById('skillToast');
    if(existing)existing.remove();
    const el=document.createElement('div');
    el.id='skillToast';
    el.textContent=text;
    el.style.cssText='position:fixed;z-index:250;left:50%;bottom:88px;transform:translateX(-50%);background:#4b3b68;color:#fff;padding:10px 14px;border-radius:999px;font:900 12px system-ui;box-shadow:0 8px 22px #0004;max-width:88vw;text-align:center';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),1800);
  }
  function gainSkill(kind){
    const meta=SKILL_ACTIONS[kind];
    if(!meta)return;
    const s=ensureState();
    if(!s)return;
    const skill=s.skills[meta.key];
    if(skill.level>=SKILL_MAX)return;
    skill.xp+=1;
    const threshold=skillThreshold(skill.level);
    if(skill.xp>=threshold){
      skill.xp-=threshold;
      skill.level+=1;
      const reward=skill.level*4;
      s.coins=(Number(s.coins)||0)+reward;
      s.xp=(Number(s.xp)||0)+20;
      notify(meta.icon+' '+meta.label+' chegou ao nível '+skill.level+'! +'+reward+' ⭐');
    }
    writeState(s);
    renderSkills(s);
  }
  function refresh(){
    const s=ensureState();
    if(!s)return;
    const mood=moodFrom(s),p=phase(s.clockMinutes);
    s.moodScore=mood.score;
    writeState(s);
    const clock=document.getElementById('clockText'),icon=document.getElementById('moodIcon'),text=document.getElementById('moodText'),shade=document.getElementById('dayShade'),chip=document.getElementById('phaseChip');
    if(clock)clock.textContent=formatTime(s.clockMinutes);
    if(icon)icon.textContent=mood.icon;
    if(text)text.textContent=mood.label;
    if(shade)shade.style.background=p.shade;
    if(chip)chip.textContent=p.label;
    renderSkills(s);
  }
  function tick(){
    const s=ensureState();
    if(!s)return;
    const before=s.clockMinutes;
    s.clockMinutes=(s.clockMinutes+MINUTES_PER_TICK)%1440;
    if(before>s.clockMinutes){
      s.day=(Number(s.day)||1)+1;
      s.questDay=s.day;
      s.quests={eat:0,play:0,pet:0,rewarded:false};
    }
    const h=s.clockMinutes/60;
    if(h>=22||h<6)s.energy=clamp((Number(s.energy)||0)-0.35,0,100);
    if(h>=12&&h<14)s.hunger=clamp((Number(s.hunger)||0)-0.22,0,100);
    writeState(s);
    refresh();
  }
  function watchActions(){
    document.addEventListener('click',e=>{
      const btn=e.target.closest('[data-kind],[data-go],[data-place],.look');
      if(!btn)return;
      const kind=btn.dataset.kind||btn.dataset.go||'';
      setTimeout(()=>{
        if(kind)gainSkill(kind);
        refresh();
      },120);
    });
  }
  function start(){
    mount();
    refresh();
    watchActions();
    if(lifeTimer)clearInterval(lifeTimer);
    lifeTimer=setInterval(tick,TICK_MS);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();