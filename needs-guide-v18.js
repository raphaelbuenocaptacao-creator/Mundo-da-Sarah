(()=>{
  'use strict';
  const KEY='mundoSarahLife6';
  const NEEDS={
    hunger:{label:'Fome',icon:'🍎',action:'eat',tip:'A Sarah está com fome. Leve-a até a cozinha para comer.'},
    energy:{label:'Energia',icon:'⚡',action:'sleep',tip:'A Sarah está cansada. Leve-a até a cama para descansar.'},
    fun:{label:'Diversão',icon:'🎈',action:'play',tip:'A Sarah precisa brincar um pouco.'},
    hygiene:{label:'Higiene',icon:'🫧',action:'shower',tip:'A Sarah precisa de um banho.'}
  };
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
  const clamp=n=>Math.max(0,Math.min(100,Number(n)||0));

  function mount(){
    if(document.getElementById('needsGuide'))return;
    const hud=document.querySelector('.hud');
    if(!hud)return;
    const guide=document.createElement('div');
    guide.id='needsGuide';
    guide.hidden=true;
    guide.innerHTML='<div class="ng-copy"><b id="ngTitle"></b><small id="ngTip"></small></div><button id="ngCare" type="button">Cuidar agora</button>';
    hud.insertAdjacentElement('afterend',guide);

    const style=document.createElement('style');
    style.id='needsGuideStyles';
    style.textContent=`
      #needsGuide{position:sticky;top:78px;z-index:48;margin:7px 10px 0;padding:9px 10px;border-radius:16px;background:#fff9df;border:2px solid #f0cc70;box-shadow:0 7px 18px #4b3b681f;display:flex;align-items:center;gap:9px;color:#56446f}
      #needsGuide[hidden]{display:none}
      #needsGuide .ng-copy{min-width:0;flex:1}
      #needsGuide b{display:block;font-size:12px}
      #needsGuide small{display:block;font-size:10px;font-weight:800;line-height:1.25;margin-top:2px}
      #ngCare{border:0;border-radius:12px;background:#725bd0;color:#fff;padding:9px 10px;font:900 11px system-ui;white-space:nowrap}
      .need.ng-low .bar{outline:2px solid #ffd15c;outline-offset:1px}
      .need.ng-critical{animation:ngPulse .8s ease-in-out infinite alternate}
      .need.ng-critical .bar{outline:2px solid #ef6b7b;outline-offset:1px}
      @keyframes ngPulse{to{transform:translateY(-1px);filter:brightness(1.12)}}
      @media(max-width:560px){#needsGuide{top:80px}#needsGuide small{max-width:58vw}#ngCare{padding:9px 8px}}
    `;
    document.head.appendChild(style);
    document.getElementById('ngCare').addEventListener('click',careNow);
  }

  function needElements(){
    return [...document.querySelectorAll('.need')];
  }

  function chooseNeed(state){
    return Object.entries(NEEDS)
      .map(([key,meta])=>({key,meta,value:clamp(state[key])}))
      .filter(n=>n.value<48)
      .sort((a,b)=>a.value-b.value)[0]||null;
  }

  function careNow(){
    const state=read();
    if(!state)return;
    const chosen=chooseNeed(state);
    if(!chosen)return;
    const selector=chosen.meta.action==='shower'
      ? '.obj[data-kind="shower"]'
      : `[data-go="${chosen.meta.action}"],.obj[data-kind="${chosen.meta.action}"]`;
    const target=document.querySelector(selector);
    if(target){
      target.click();
      const btn=document.getElementById('ngCare');
      if(btn){btn.disabled=true;btn.textContent='Indo…';setTimeout(()=>{btn.disabled=false;btn.textContent='Cuidar agora'},1200)}
    }
  }

  function render(){
    mount();
    const state=read();
    if(!state)return;
    needElements().forEach(el=>el.classList.remove('ng-low','ng-critical'));
    const ids=['hunger','energy','fun','hygiene'];
    ids.forEach(key=>{
      const fill=document.getElementById(key);
      const need=fill&&fill.closest('.need');
      if(!need)return;
      const value=clamp(state[key]);
      if(value<48)need.classList.add('ng-low');
      if(value<24)need.classList.add('ng-critical');
    });
    const guide=document.getElementById('needsGuide');
    const chosen=chooseNeed(state);
    if(!guide)return;
    guide.hidden=!chosen;
    if(!chosen)return;
    const critical=chosen.value<24;
    document.getElementById('ngTitle').textContent=`${chosen.meta.icon} ${chosen.meta.label}: ${Math.round(chosen.value)}%${critical?' • precisa de atenção':''}`;
    document.getElementById('ngTip').textContent=chosen.meta.tip;
  }

  function start(){
    mount();render();
    setInterval(render,2200);
    window.addEventListener('storage',render);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
