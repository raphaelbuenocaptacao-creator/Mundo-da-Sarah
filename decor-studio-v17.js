(()=>{'use strict';
const SAVE='mundoSarahLife6';
const ITEMS=[
 {id:'rug',icon:'🟣',name:'Tapete fofo',room:'Quarto',cost:8,level:1,x:24,y:37},
 {id:'lamp',icon:'💡',name:'Luminária estrela',room:'Quarto',cost:10,level:1,x:39,y:18},
 {id:'plant',icon:'🪴',name:'Vasinho alegre',room:'Cozinha',cost:12,level:2,x:69,y:18},
 {id:'books',icon:'📚',name:'Cantinho de livros',room:'Brinquedoteca',cost:14,level:2,x:55,y:70},
 {id:'bathmat',icon:'🟦',name:'Tapete de banho',room:'Banheiro',cost:12,level:2,x:21,y:82},
 {id:'birdhouse',icon:'🏡',name:'Casinha de passarinho',room:'Jardim',cost:18,level:3,x:84,y:67}
];
const $=id=>document.getElementById(id);
const safe=()=>{try{return JSON.parse(localStorage.getItem(SAVE)||'null')}catch{return null}};
const save=s=>{try{localStorage.setItem(SAVE,JSON.stringify(s))}catch{}};
const lvl=s=>1+Math.floor((Number(s.xp)||0)/25);
function ensure(s){if(!s)return null;if(!s.homeDecor||typeof s.homeDecor!=='object')s.homeDecor={owned:[],placed:[]};if(!Array.isArray(s.homeDecor.owned))s.homeDecor.owned=[];if(!Array.isArray(s.homeDecor.placed))s.homeDecor.placed=[];return s}
function toast(t){const existing=$('toast');if(existing){existing.textContent=t;existing.classList.add('show');setTimeout(()=>existing.classList.remove('show'),1500);return} alert(t)}
function mount(){
 if($('decorPanel'))return;
 const wardrobe=$('wardrobe')?.closest('.panel');
 const section=document.createElement('section');section.className='panel';section.id='decorPanel';
 section.innerHTML='<div class="decorHead"><div><h3>🏡 Meu cantinho</h3><small>Decore a casa e deixe cada cômodo com a cara da Sarah.</small></div><span id="decorCount"></span></div><div class="decorGrid" id="decorGrid"></div>';
 if(wardrobe)wardrobe.insertAdjacentElement('afterend',section);else(document.querySelector('main')||document.body).appendChild(section);
 const st=document.createElement('style');st.id='decorStyles';st.textContent=
 '.decorHead{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.decorHead h3{margin:0 0 3px}.decorHead small{display:block;color:#77658a;font-weight:800;line-height:1.25}.decorHead>span{background:#f0e9ff;border-radius:999px;padding:6px 9px;font-size:10px;font-weight:900;white-space:nowrap}.decorGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:9px}.decorCard{border:2px solid transparent;border-radius:16px;background:#f3effb;padding:8px 5px;color:#5b477c;font:900 11px system-ui;min-height:82px}.decorCard .decorIcon{display:block;font-size:26px;margin-bottom:4px}.decorCard small{display:block;font-size:9px;margin-top:3px}.decorCard.placed{border-color:#78b983;background:#e9f8eb}.decorCard.locked{opacity:.58}.placedDecor{position:absolute;z-index:7;border:0;background:transparent;font-size:26px;filter:drop-shadow(3px 5px 2px #0003);transform:translate(-50%,-50%);pointer-events:none}@media(max-width:560px){.decorGrid{grid-template-columns:repeat(2,1fr)}.decorCard{min-height:76px}.placedDecor{font-size:24px}}';
 document.head.appendChild(st);
}
function renderScene(s){
 const v=$('viewport');if(!v)return;
 v.querySelectorAll('.placedDecor').forEach(n=>n.remove());
 ITEMS.filter(i=>s.homeDecor.placed.includes(i.id)).forEach(i=>{const d=document.createElement('div');d.className='placedDecor';d.dataset.decor=i.id;d.textContent=i.icon;d.style.left=i.x+'%';d.style.top=i.y+'%';d.title=i.name;v.appendChild(d)});
}
function render(){
 const s=ensure(safe());if(!s)return;mount();
 const box=$('decorGrid');if(!box)return;
 const level=lvl(s);
 box.innerHTML=ITEMS.map(i=>{const owned=s.homeDecor.owned.includes(i.id),placed=s.homeDecor.placed.includes(i.id),locked=level<i.level;
   const state=locked?'🔒 Nível '+i.level:owned?(placed?'✓ Na casa':'Colocar'):i.cost+' ⭐';
   return `<button class="decorCard ${locked?'locked':''} ${placed?'placed':''}" data-decor="${i.id}"><span class="decorIcon">${i.icon}</span>${i.name}<small>${i.room} • ${state}</small></button>`;
 }).join('');
 $('decorCount').textContent=s.homeDecor.placed.length+'/'+ITEMS.length+' colocados';
 box.querySelectorAll('[data-decor]').forEach(b=>b.onclick=()=>toggle(b.dataset.decor));
 renderScene(s);
}
function toggle(id){
 const s=ensure(safe()),i=ITEMS.find(x=>x.id===id);if(!s||!i)return;
 if(lvl(s)<i.level){toast('Esse item libera no nível '+i.level);return}
 if(!s.homeDecor.owned.includes(id)){
   if((Number(s.coins)||0)<i.cost){toast('Faltam estrelas para '+i.name);return}
   s.coins-=i.cost;s.homeDecor.owned.push(id);s.homeDecor.placed.push(id);s.xp=(Number(s.xp)||0)+2;
   save(s);toast(i.icon+' '+i.name+' comprado! +2 XP');
 }else{
   const pos=s.homeDecor.placed.indexOf(id);
   if(pos>=0){s.homeDecor.placed.splice(pos,1);toast(i.name+' guardado no inventário')}
   else{s.homeDecor.placed.push(id);toast(i.name+' colocado em '+i.room)}
   save(s);
 }
 window.dispatchEvent(new CustomEvent('mundoSarah:stateChanged'));render();
}
function start(){mount();render();window.addEventListener('mundoSarah:stateChanged',render);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});setInterval(render,6000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();