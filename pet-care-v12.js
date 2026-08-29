(()=>{
  'use strict';
  const KEY='mundoSarahLife6';
  const MAX=100;
  const DECAY_MS=60000;
  const clamp=n=>Math.max(0,Math.min(MAX,Number(n)||0));
  const parse=v=>{try{return JSON.parse(v||'null')}catch{return null}};
  const read=()=>parse(localStorage.getItem(KEY));
  const write=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}}
  const bondLevel=b=>Math.max(1,Math.min(5,Math.floor((Number(b)||0)/20)+1));
  function ensure(s){
    if(!s)return null;
    if(!s.petLife||typeof s.petLife!=='object')s.petLife={hunger:82,energy:88,happiness:90,bond:0,lastTick:Date.now(),rewardedLevel:1};
    const p=s.petLife;
    p.hunger=clamp(p.hunger);p.energy=clamp(p.energy);p.happiness=clamp(p.happiness);p.bond=clamp(p.bond);
    if(!Number.isFinite(Number(p.lastTick)))p.lastTick=Date.now();
    if(!Number.isFinite(Number(p.rewardedLevel)))p.rewardedLevel=1;
    return s;
  }
  function decay(s){
    const p=s.petLife,now=Date.now(),steps=Math.min(360,Math.floor((now-p.lastTick)/DECAY_MS));
    if(steps<=0)return false;
    p.hunger=clamp(p.hunger-steps*.07);p.energy=clamp(p.energy-steps*.035);p.happiness=clamp(p.happiness-steps*.045);p.lastTick=now;return true;
  }
  function mood(p){const avg=(p.hunger+p.energy+p.happiness)/3;if(Math.min(p.hunger,p.energy,p.happiness)<20)return['😟','Precisa de cuidado'];if(avg<50)return['🙂','Quer atenção'];if(avg<78)return['😊','Contente'];return['🥰','Muito feliz'];}
  function toast(text){let el=document.getElementById('petCareToast');if(!el){el=document.createElement('div');el.id='petCareToast';el.style.cssText='position:fixed;z-index:270;left:50%;bottom:28px;transform:translateX(-50%);background:#49385f;color:#fff;padding:10px 14px;border-radius:999px;font:900 12px system-ui;box-shadow:0 8px 22px #0004;max-width:90vw;text-align:center;pointer-events:none';document.body.appendChild(el)}el.textContent=text;el.hidden=false;clearTimeout(el._t);el._t=setTimeout(()=>el.hidden=true,1800)}
  function mount(){
    if(document.getElementById('petCarePanel'))return;
    const anchor=document.querySelector('.panel');
    const panel=document.createElement('section');panel.id='petCarePanel';panel.className='panel';panel.setAttribute('aria-label','Cuidados do pet');
    panel.innerHTML='<div class="petCareHead"><div><h3>🐾 Meu Pet</h3><small id="petMoodText">Muito feliz</small></div><div class="petBond"><span id="petMoodIcon">🥰</span><b>Vínculo <span id="petBondLevel">1</span>/5</b></div></div><div class="petMeters"><div>🥕 Fome<div class="petBar"><i id="petHunger"></i></div></div><div>⚡ Energia<div class="petBar"><i id="petEnergy"></i></div></div><div>💗 Alegria<div class="petBar"><i id="petHappy"></i></div></div></div><div class="petActions"><button data-pet-action="feed">🥕<b>Alimentar</b></button><button data-pet-action="play">🪄<b>Brincar</b></button><button data-pet-action="cuddle">🤗<b>Carinho</b></button><button data-pet-action="rest">🧺<b>Descansar</b></button></div><div class="petBondBar"><i id="petBondFill"></i></div><small class="petTip">Cuidar bem aumenta o vínculo e libera recompensas.</small>';
    if(anchor)anchor.insertAdjacentElement('afterend',panel);else(document.querySelector('main')||document.body).appendChild(panel);
    if(!document.getElementById('petCareStyles')){const st=document.createElement('style');st.id='petCareStyles';st.textContent='#petCarePanel{background:linear-gradient(135deg,#fff7fb,#eef8ff)}.petCareHead{display:flex;justify-content:space-between;align-items:center;gap:10px}.petCareHead h3{margin:0}.petCareHead small,.petTip{font-weight:800;color:#78678f}.petBond{display:flex;align-items:center;gap:6px;background:#fff;border-radius:999px;padding:6px 9px;font-size:11px}.petBond>span{font-size:20px}.petMeters{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:10px;font-size:10px;font-weight:900}.petBar,.petBondBar{height:7px;background:#ded5ee;border-radius:99px;overflow:hidden;margin-top:4px}.petBar i,.petBondBar i{display:block;height:100%;background:linear-gradient(90deg,#6f64d7,#e56eb6);transition:width .25s}.petActions{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px}.petActions button{border:0;border-radius:14px;background:#fff;padding:9px 4px;color:#5b477c;font-size:21px;box-shadow:0 3px 9px #0001}.petActions b{display:block;font-size:9px;margin-top:2px}.petBondBar{margin-top:9px;height:8px}.petTip{display:block;margin-top:6px;font-size:9px}@media(max-width:560px){.petActions{grid-template-columns:repeat(2,1fr)}.petActions button{min-height:54px}.petMeters{gap:5px}}';document.head.appendChild(st)}
  }
  function render(){
    const s=ensure(read());if(!s)return;if(decay(s))write(s);const p=s.petLife,[icon,label]=mood(p),lvl=bondLevel(p.bond);
    const map={petHunger:p.hunger,petEnergy:p.energy,petHappy:p.happiness,petBondFill:p.bond};Object.entries(map).forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.style.width=clamp(v)+'%'});
    const t=document.getElementById('petMoodText'),i=document.getElementById('petMoodIcon'),l=document.getElementById('petBondLevel');if(t)t.textContent=label;if(i)i.textContent=icon;if(l)l.textContent=lvl;
  }
  function rewardLevel(s){const p=s.petLife,lvl=bondLevel(p.bond);if(lvl>p.rewardedLevel){p.rewardedLevel=lvl;const reward=lvl*4;s.coins=(Number(s.coins)||0)+reward;s.xp=(Number(s.xp)||0)+15;toast('🐾 Vínculo nível '+lvl+'! +'+reward+' ⭐ +15 XP')}}
  function act(kind){
    const s=ensure(read());if(!s)return;decay(s);const p=s.petLife;
    if(kind==='feed'){p.hunger=clamp(p.hunger+26);p.happiness=clamp(p.happiness+4);p.bond=clamp(p.bond+3);toast('🥕 Pet alimentado!')}
    else if(kind==='play'){if(p.energy<15){toast('😴 O pet está cansado para brincar.');render();return}p.energy=clamp(p.energy-10);p.happiness=clamp(p.happiness+24);p.hunger=clamp(p.hunger-5);p.bond=clamp(p.bond+5);toast('🪄 Vocês brincaram juntos!')}
    else if(kind==='cuddle'){p.happiness=clamp(p.happiness+14);p.bond=clamp(p.bond+4);toast('🤗 O vínculo ficou mais forte!')}
    else if(kind==='rest'){p.energy=clamp(p.energy+30);p.hunger=clamp(p.hunger-3);p.bond=clamp(p.bond+2);toast('🧺 O pet descansou.')}
    p.lastTick=Date.now();rewardLevel(s);write(s);render();window.dispatchEvent(new CustomEvent('mundoSarah:stateChanged'));
  }
  function wire(){
    document.addEventListener('click',e=>{const b=e.target.closest('[data-pet-action]');if(b){act(b.dataset.petAction);return}const pet=e.target.closest('[data-kind="pet"]');if(pet)setTimeout(()=>act('cuddle'),200)},true);
    window.addEventListener('mundoSarah:stateChanged',render);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});setInterval(render,15000);
  }
  function start(){mount();render();wire()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
