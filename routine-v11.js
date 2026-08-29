(()=>{
  'use strict';
  const KEY='mundoSarahLife6';
  const VERSION='v11';
  const PERIODS=[
    {key:'morning',label:'Manhã',icon:'🌤️',start:6,end:12,tasks:[['eat','🥣','Tomar café'],['shower','🫧','Se arrumar'],['dress','👗','Escolher roupa']]},
    {key:'afternoon',label:'Tarde',icon:'☀️',start:12,end:18,tasks:[['school','🏫','Aprender na escola'],['play','🧸','Brincar']]},
    {key:'evening',label:'Noite',icon:'🌙',start:18,end:22,tasks:[['eat','🍲','Jantar'],['pet','🐾','Cuidar do pet']]},
    {key:'bedtime',label:'Hora de dormir',icon:'✨',start:22,end:30,tasks:[['sleep','🛏️','Dormir']]}
  ];
  const safeParse=v=>{try{return JSON.parse(v||'null')}catch{return null}};
  const read=()=>safeParse(localStorage.getItem(KEY));
  const write=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}};
  const nowMinutes=s=>Number.isFinite(Number(s&&s.clockMinutes))?Number(s.clockMinutes):7*60;
  const periodFor=min=>{const h=min/60;return PERIODS.find(p=>p.key==='bedtime'?(h>=22||h<6):(h>=p.start&&h<p.end))||PERIODS[0]};
  const dayId=s=>String(Number(s&&s.day)||1);
  function ensure(s){
    if(!s)return null;
    if(!s.dailyRoutine||typeof s.dailyRoutine!=='object')s.dailyRoutine={};
    const id=dayId(s);
    if(!s.dailyRoutine[id])s.dailyRoutine[id]={done:{},rewarded:{}};
    const days=Object.keys(s.dailyRoutine).sort((a,b)=>Number(b)-Number(a));
    days.slice(7).forEach(k=>delete s.dailyRoutine[k]);
    return s;
  }
  function toast(text){
    let el=document.getElementById('routineToast');
    if(!el){el=document.createElement('div');el.id='routineToast';el.style.cssText='position:fixed;z-index:260;left:50%;bottom:28px;transform:translateX(-50%);background:#49385f;color:white;padding:10px 14px;border-radius:999px;font:900 12px system-ui;box-shadow:0 8px 22px #0004;max-width:90vw;text-align:center;pointer-events:none';document.body.appendChild(el)}
    el.textContent=text;el.hidden=false;clearTimeout(el._t);el._t=setTimeout(()=>el.hidden=true,1800);
  }
  function mount(){
    if(document.getElementById('routinePanel'))return;
    const quick=document.querySelector('.taskgrid')?.closest('.panel');
    const panel=document.createElement('section');panel.id='routinePanel';panel.className='panel';panel.setAttribute('aria-label','Rotina da Sarah');
    panel.innerHTML='<div class="routineHead"><div><h3>🗓️ Rotina da Sarah</h3><small id="routineHint">Cuide dela ao longo do dia</small></div><span id="routinePeriod"></span></div><div id="routineTasks"></div><div class="routineFooter"><span id="routineProgress"></span><span>+6 ⭐ +8 XP</span></div>';
    if(quick)quick.insertAdjacentElement('afterend',panel);else(document.querySelector('main')||document.body).appendChild(panel);
    if(!document.getElementById('routineStyles')){const st=document.createElement('style');st.id='routineStyles';st.textContent='#routinePanel{background:linear-gradient(135deg,#fffdf4,#f2ebff)}.routineHead{display:flex;justify-content:space-between;gap:10px;align-items:center}.routineHead h3{margin:0}.routineHead small{font-weight:800;color:#7b6a8e}.routineHead>span{background:#705ec7;color:#fff;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:900;white-space:nowrap}.routineTask{display:flex;align-items:center;gap:9px;padding:9px;margin-top:7px;border-radius:14px;background:#f2eef9;font-size:12px;font-weight:900}.routineTask.done{background:#e5f8e7}.routineTask .ico{font-size:23px}.routineTask .check{margin-left:auto}.routineFooter{display:flex;justify-content:space-between;gap:8px;margin-top:9px;font-size:10px;font-weight:900;color:#77658a}@media(max-width:560px){.routineHead{align-items:flex-start}.routineTask{min-height:46px}}';document.head.appendChild(st)}
  }
  function render(){
    const s=ensure(read());if(!s)return;
    const p=periodFor(nowMinutes(s)),rec=s.dailyRoutine[dayId(s)],tasks=p.tasks,done=tasks.filter(t=>rec.done[p.key+':'+t[0]]).length;
    const period=document.getElementById('routinePeriod'),box=document.getElementById('routineTasks'),progress=document.getElementById('routineProgress'),hint=document.getElementById('routineHint');if(!box)return;
    if(period)period.textContent=p.icon+' '+p.label;
    if(hint)hint.textContent=rec.rewarded[p.key]?'Período completo!':'Complete a rotina deste período';
    box.innerHTML=tasks.map(([key,icon,label])=>{const ok=!!rec.done[p.key+':'+key];return '<div class="routineTask '+(ok?'done':'')+'"><span class="ico">'+icon+'</span><span>'+label+'</span><span class="check">'+(ok?'✅':'○')+'</span></div>'}).join('');
    if(progress)progress.textContent=done+'/'+tasks.length+' concluídas';
  }
  function mark(action){
    const s=ensure(read());if(!s)return;
    const p=periodFor(nowMinutes(s)),rec=s.dailyRoutine[dayId(s)],valid=p.tasks.some(t=>t[0]===action);if(!valid)return;
    const k=p.key+':'+action;if(rec.done[k])return;
    rec.done[k]=true;
    const complete=p.tasks.every(t=>rec.done[p.key+':'+t[0]]);
    if(complete&&!rec.rewarded[p.key]){rec.rewarded[p.key]=true;s.coins=(Number(s.coins)||0)+6;s.xp=(Number(s.xp)||0)+8;toast(p.icon+' Rotina da '+p.label.toLowerCase()+' completa! +6 ⭐ +8 XP')}
    write(s);render();
    window.dispatchEvent(new CustomEvent('mundoSarah:stateChanged'));
  }
  function wire(){
    document.addEventListener('click',e=>{
      const el=e.target.closest('[data-kind],[data-go],[data-place]');if(!el)return;
      const action=el.dataset.kind||el.dataset.go||el.dataset.place;if(!action)return;
      setTimeout(()=>mark(action),450);
    },true);
    window.addEventListener('mundoSarah:stateChanged',()=>setTimeout(render,60));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
    setInterval(render,5000);
  }
  function start(){mount();render();wire();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
