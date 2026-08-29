(()=>{
  'use strict';
  const KEY='mundoSarahLife6';
  const clamp=n=>Math.max(0,Math.min(100,Number(n)||0));
  const parse=v=>{try{return JSON.parse(v||'null')}catch{return null}};
  const read=()=>parse(localStorage.getItem(KEY));
  const write=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}}

  const OBJECTS=[
    {id:'desk',icon:'🎨',label:'Mesa criativa',left:26,top:33,action:'Desenhar',hint:'Criatividade + XP'},
    {id:'sink',icon:'🧼',label:'Pia',left:8,top:80,action:'Lavar as mãos',hint:'Melhora a higiene'},
    {id:'sofa',icon:'🛋️',label:'Sofá',left:55,top:63,action:'Descansar',hint:'Recupera energia'},
    {id:'petbowl',icon:'🥕',label:'Pote do pet',left:86,top:88,action:'Alimentar pet',hint:'Cuida do companheiro'}
  ];

  function ensure(s){
    if(!s)return null;
    if(!s.homeObjects||typeof s.homeObjects!=='object')s.homeObjects={uses:{},mastered:[]};
    if(!s.homeObjects.uses)s.homeObjects.uses={};
    if(!Array.isArray(s.homeObjects.mastered))s.homeObjects.mastered=[];
    return s;
  }

  function toast(text){
    let el=document.getElementById('homeObjectsToast');
    if(!el){
      el=document.createElement('div');el.id='homeObjectsToast';
      el.style.cssText='position:fixed;z-index:300;left:50%;bottom:28px;transform:translateX(-50%);background:#49385f;color:#fff;padding:10px 14px;border-radius:999px;font:900 12px system-ui;box-shadow:0 8px 22px #0004;max-width:90vw;text-align:center;pointer-events:none';
      document.body.appendChild(el);
    }
    el.textContent=text;el.hidden=false;clearTimeout(el._t);el._t=setTimeout(()=>el.hidden=true,1700);
  }

  function mount(){
    const viewport=document.getElementById('viewport');
    if(viewport&&!document.getElementById('homeObject-desk')){
      OBJECTS.forEach(o=>{
        const b=document.createElement('button');
        b.id='homeObject-'+o.id;b.className='homeSimObject';b.dataset.homeObject=o.id;b.title=o.label;
        b.setAttribute('aria-label',o.label+': '+o.action);
        b.style.left=o.left+'%';b.style.top=o.top+'%';b.textContent=o.icon;
        viewport.appendChild(b);
      });
    }
    if(!document.getElementById('homeObjectsPanel')){
      const panel=document.createElement('section');panel.id='homeObjectsPanel';panel.className='panel';panel.setAttribute('aria-label','Objetos da casa');
      panel.innerHTML='<div class="homeObjHead"><div><h3>🏡 Casa viva</h3><small>Toque nos objetos da casa para cuidar da rotina</small></div><b id="homeObjMastery">0/4</b></div><div class="homeObjGrid" id="homeObjGrid"></div>';
      const anchor=document.querySelector('.panel');
      if(anchor)anchor.insertAdjacentElement('beforebegin',panel);else(document.querySelector('main')||document.body).appendChild(panel);
    }
    if(!document.getElementById('homeObjectsStyles')){
      const st=document.createElement('style');st.id='homeObjectsStyles';
      st.textContent='.homeSimObject{position:absolute;z-index:7;border:0;background:transparent;font-size:30px;padding:4px;filter:drop-shadow(4px 6px 2px #0003);transform:translate(-50%,-50%);touch-action:manipulation}.homeSimObject:active{transform:translate(-50%,-50%) scale(.88)}#homeObjectsPanel{background:linear-gradient(135deg,#fffdf6,#edf8ff)}.homeObjHead{display:flex;align-items:center;justify-content:space-between;gap:10px}.homeObjHead h3{margin:0}.homeObjHead small{font-weight:800;color:#78678f}.homeObjHead>b{background:#fff;border-radius:999px;padding:7px 10px;font-size:11px}.homeObjGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:9px}.homeObjCard{border:0;border-radius:14px;background:#fff;padding:8px 4px;color:#5b477c;font-weight:900;min-height:66px}.homeObjCard span{display:block;font-size:23px}.homeObjCard small{display:block;font-size:8px;margin-top:2px;color:#7d6d92}.homeObjCard.mastered{background:#e8f8e9}@media(max-width:560px){.homeObjGrid{grid-template-columns:repeat(2,1fr)}.homeSimObject{font-size:26px}}';
      document.head.appendChild(st);
    }
  }

  function render(){
    const s=ensure(read());if(!s)return;
    const grid=document.getElementById('homeObjGrid'),count=document.getElementById('homeObjMastery');
    if(count)count.textContent=s.homeObjects.mastered.length+'/'+OBJECTS.length;
    if(grid)grid.innerHTML=OBJECTS.map(o=>{
      const uses=Number(s.homeObjects.uses[o.id])||0,master=s.homeObjects.mastered.includes(o.id);
      return '<button class="homeObjCard '+(master?'mastered':'')+'" data-home-card="'+o.id+'"><span>'+o.icon+'</span>'+o.action+'<small>'+uses+'/5 usos'+(master?' • domínio ✓':'')+'</small></button>';
    }).join('');
  }

  function rewardMastery(s,id){
    const uses=Number(s.homeObjects.uses[id])||0;
    if(uses>=5&&!s.homeObjects.mastered.includes(id)){
      s.homeObjects.mastered.push(id);s.coins=(Number(s.coins)||0)+5;s.xp=(Number(s.xp)||0)+8;
      toast('✨ Objeto dominado! +5 ⭐ +8 XP');
    }
  }

  function act(id){
    const s=ensure(read());if(!s)return;
    s.homeObjects.uses[id]=(Number(s.homeObjects.uses[id])||0)+1;
    if(id==='desk'){
      if(clamp(s.energy)<8){toast('😴 Sarah precisa descansar antes de desenhar.');return}
      s.fun=clamp((Number(s.fun)||0)+14);s.energy=clamp((Number(s.energy)||0)-3);s.xp=(Number(s.xp)||0)+3;toast('🎨 Sarah criou um desenho! +3 XP');
    }else if(id==='sink'){
      s.hygiene=clamp((Number(s.hygiene)||0)+22);s.xp=(Number(s.xp)||0)+1;toast('🧼 Mãos limpinhas! +1 XP');
    }else if(id==='sofa'){
      s.energy=clamp((Number(s.energy)||0)+18);s.fun=clamp((Number(s.fun)||0)+5);toast('🛋️ Sarah descansou um pouquinho.');
    }else if(id==='petbowl'){
      if(!s.petLife||typeof s.petLife!=='object')s.petLife={hunger:82,energy:88,happiness:90,bond:0,lastTick:Date.now(),rewardedLevel:1};
      s.petLife.hunger=clamp((Number(s.petLife.hunger)||0)+28);s.petLife.happiness=clamp((Number(s.petLife.happiness)||0)+5);s.petLife.bond=clamp((Number(s.petLife.bond)||0)+3);s.petLife.lastTick=Date.now();toast('🥕 O pet comeu e ficou feliz!');
    }
    rewardMastery(s,id);write(s);render();window.dispatchEvent(new CustomEvent('mundoSarah:stateChanged'));
  }

  function wire(){
    document.addEventListener('click',e=>{
      const target=e.target.closest('[data-home-object],[data-home-card]');if(!target)return;
      act(target.dataset.homeObject||target.dataset.homeCard);
    });
    window.addEventListener('mundoSarah:stateChanged',render);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
  }

  function start(){mount();render();wire()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
