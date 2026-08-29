(()=>{
  const ROOT_KEY='mundoSarahLife6';
  const TICK_MS=8000;
  const MINUTES_PER_TICK=20;
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
    if(!hud||!viewport||document.getElementById('lifeClock'))return;

    const card=document.createElement('div');
    card.id='lifeClock';
    card.setAttribute('aria-live','polite');
    card.style.cssText='display:flex;align-items:center;gap:8px;background:#ffffff24;border:1px solid #ffffff55;border-radius:14px;padding:6px 9px;font-weight:900;font-size:11px;white-space:nowrap';
    card.innerHTML='<span id="moodIcon" style="font-size:22px">😊</span><span><b id="clockText">07:00</b><br><small id="moodText">Feliz</small></span>';
    const cash=hud.querySelector('.cash');
    hud.insertBefore(card,cash||null);

    const shade=document.createElement('div');
    shade.id='dayShade';
    shade.style.cssText='position:absolute;inset:0;z-index:40;pointer-events:none;transition:background 1.2s ease;border-radius:20px';
    viewport.appendChild(shade);

    const chip=document.createElement('div');
    chip.id='phaseChip';
    chip.style.cssText='position:absolute;right:10px;top:10px;z-index:41;background:#ffffffdd;color:#4d4165;border-radius:999px;padding:5px 9px;font:900 10px system-ui;pointer-events:none';
    viewport.appendChild(chip);
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
      setTimeout(refresh,80);
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