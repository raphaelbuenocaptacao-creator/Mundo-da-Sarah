(()=>{
  'use strict';
  const SAVE='mundoSarahLife6';
  const PLACES={
    park:{label:'Parque Encantado',icon:'🌳'},school:{label:'Escola Criativa',icon:'🏫'},
    boutique:{label:'Boutique Real',icon:'👗'},bakery:{label:'Padaria Doce',icon:'🧁'},
    petshop:{label:'Casa dos Pets',icon:'🐾'},castle:{label:'Castelo das Estrelas',icon:'🏰'}
  };
  const MILESTONES=[1,3,6];
  const parse=v=>{try{return JSON.parse(v||'null')}catch{return null}};
  const read=()=>parse(localStorage.getItem(SAVE));
  const write=s=>{try{localStorage.setItem(SAVE,JSON.stringify(s))}catch{}};

  function ensure(s){
    if(!s)return null;
    if(!s.cityJournal||typeof s.cityJournal!=='object')s.cityJournal={claimed:{}};
    if(!s.cityJournal.claimed||typeof s.cityJournal.claimed!=='object')s.cityJournal.claimed={};
    if(!s.visits||typeof s.visits!=='object')s.visits={};
    return s;
  }

  function toast(text){
    const base=document.getElementById('toast');
    if(base){base.textContent=text;base.classList.add('show');clearTimeout(base.__journalTimer);base.__journalTimer=setTimeout(()=>base.classList.remove('show'),1800);return;}
    const el=document.createElement('div');el.textContent=text;el.style.cssText='position:fixed;z-index:320;left:50%;bottom:28px;transform:translateX(-50%);background:#49385f;color:#fff;padding:10px 14px;border-radius:999px;font:900 12px system-ui;max-width:90vw;text-align:center;box-shadow:0 8px 22px #0004';document.body.appendChild(el);setTimeout(()=>el.remove(),1800);
  }

  function mount(){
    const city=document.getElementById('city'),map=city?.querySelector('.map');
    if(!city||!map||document.getElementById('cityJournal'))return;
    const panel=document.createElement('section');panel.id='cityJournal';panel.className='progressCard';panel.innerHTML='<div class="journalHead"><div><b>📔 Álbum de Descobertas</b><small>Visite cada lugar para criar memórias</small></div><span id="journalTotal"></span></div><div id="journalGrid"></div>';
    city.insertBefore(panel,map.nextSibling);
    const style=document.createElement('style');style.id='cityJournalStyles';style.textContent=`
      .journalHead{display:flex;justify-content:space-between;gap:10px;align-items:center}.journalHead small{display:block;margin-top:3px;color:#7a6b8e;font:800 10px system-ui}.journalHead>span{background:#efe9ff;border-radius:999px;padding:6px 9px;font:900 10px system-ui;white-space:nowrap}
      #journalGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:10px}.journalPlace{background:#f4f0fb;border-radius:14px;padding:8px;min-width:0}.journalPlace strong{display:block;font:900 11px system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.journalPlace small{font:800 9px system-ui;color:#78698c}.journalStamps{display:flex;gap:3px;margin-top:5px}.journalStamp{filter:grayscale(1);opacity:.28;font-size:15px}.journalStamp.on{filter:none;opacity:1}
      @media(max-width:560px){#journalGrid{grid-template-columns:repeat(2,1fr)}.journalPlace{padding:7px}.journalHead{align-items:flex-start}}
    `;document.head.appendChild(style);
  }

  function milestoneFor(visits){return MILESTONES.filter(n=>visits>=n).length;}
  function render(){
    mount();const s=ensure(read());if(!s)return;
    const grid=document.getElementById('journalGrid'),total=document.getElementById('journalTotal');if(!grid)return;
    let earned=0;
    grid.innerHTML=Object.entries(PLACES).map(([key,p])=>{
      const visits=Number(s.visits[key])||0,stamps=milestoneFor(visits);earned+=stamps;
      const next=MILESTONES.find(n=>visits<n);
      return `<div class="journalPlace"><strong>${p.icon} ${p.label}</strong><small>${visits} visita${visits===1?'':'s'}${next?` • próxima memória em ${next}`:' • coleção completa'}</small><div class="journalStamps">${MILESTONES.map((_,i)=>`<span class="journalStamp ${i<stamps?'on':''}">⭐</span>`).join('')}</div></div>`;
    }).join('');
    if(total)total.textContent=`${earned}/${Object.keys(PLACES).length*MILESTONES.length} memórias`;
  }

  function checkReward(place){
    const s=ensure(read());if(!s||!PLACES[place])return;
    const visits=Number(s.visits[place])||0;
    const reached=MILESTONES.filter(n=>visits>=n);
    let rewarded=false;
    reached.forEach(n=>{
      const id=`${place}:${n}`;if(s.cityJournal.claimed[id])return;
      s.cityJournal.claimed[id]=true;
      const tier=MILESTONES.indexOf(n)+1;
      const stars=[2,4,6][tier-1],xp=[2,5,8][tier-1];
      s.coins=(Number(s.coins)||0)+stars;s.xp=(Number(s.xp)||0)+xp;rewarded=true;
      toast(`${PLACES[place].icon} Nova memória: ${PLACES[place].label}! +${stars} ⭐ +${xp} XP`);
    });
    if(rewarded){write(s);window.dispatchEvent(new CustomEvent('mundoSarah:stateChanged'));}
    render();
  }

  function start(){
    mount();render();
    document.addEventListener('click',e=>{const btn=e.target.closest?.('[data-place]');if(!btn||btn.getAttribute('aria-disabled')==='true')return;const place=btn.dataset.place;if(!PLACES[place])return;setTimeout(()=>checkReward(place),80);});
    window.addEventListener('mundoSarah:stateChanged',render);
    window.addEventListener('storage',e=>{if(e.key===SAVE)render()});
    const city=document.getElementById('city');if(city&&'MutationObserver'in window)new MutationObserver(()=>{if(city.classList.contains('open'))render()}).observe(city,{attributes:true,attributeFilter:['class']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
