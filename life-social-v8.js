(() => {
  'use strict';

  const viewport = document.getElementById('viewport');
  const avatar = document.getElementById('avatar');
  if (!viewport || !avatar || document.getElementById('sarahFriend')) return;

  const KEY = 'mundoSarahSocialV2';
  let social;
  try {
    social = JSON.parse(localStorage.getItem(KEY) || localStorage.getItem('mundoSarahSocialV1') || 'null') || {};
  } catch {
    social = {};
  }

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  social.friendship = clamp(Number(social.friendship) || 10, 0, 100);
  social.chats = Math.max(0, Number(social.chats) || 0);
  social.playTogether = Math.max(0, Number(social.playTogether) || 0);
  social.lastGiftDay = Math.max(0, Number(social.lastGiftDay) || 0);
  social.memories = Array.isArray(social.memories) ? social.memories.slice(-8) : [];

  const save = () => localStorage.setItem(KEY, JSON.stringify(social));
  const dayNow = () => Math.max(1, Number(document.getElementById('day')?.textContent) || 1);

  const relationshipStage = () => {
    if (social.friendship >= 80) return {label: 'Melhores amigas 💖', bonus: 3};
    if (social.friendship >= 55) return {label: 'Grandes amigas 💗', bonus: 2};
    if (social.friendship >= 30) return {label: 'Amigas 🌸', bonus: 1};
    return {label: 'Conhecidas 🙂', bonus: 0};
  };

  const style = document.createElement('style');
  style.textContent = `
    .friendNpc{position:absolute;z-index:19;left:66%;top:55%;width:48px;height:70px;transform:translate(-50%,-50%);pointer-events:none;transition:left .8s ease,top .8s ease;filter:drop-shadow(4px 7px 3px #0004)}
    .friendNpc .fhair{position:absolute;left:4px;top:2px;width:40px;height:44px;border-radius:50% 50% 55% 55%;background:#6f4b36}
    .friendNpc .fface{position:absolute;left:10px;top:8px;width:29px;height:29px;border-radius:50%;background:#efc5a5;border:2px solid #9a6f58;display:grid;place-items:center;font-size:12px}
    .friendNpc .fbody{position:absolute;left:8px;top:36px;width:33px;height:29px;border-radius:13px 13px 8px 8px;background:#55a9d8;border:2px solid #35799d}
    .friendNpc .fname{position:absolute;left:50%;top:-23px;transform:translateX(-50%);background:#fff;border-radius:999px;padding:3px 7px;font-size:10px;font-weight:900;white-space:nowrap;box-shadow:0 3px 8px #0002}
    .friendNpc.near{filter:drop-shadow(0 0 8px #fff) drop-shadow(4px 7px 3px #0004)}
    .friendNpc.near .fname{background:#fff5b8}
    .friendNpc.celebrate .fbody{animation:friendDance .35s ease-in-out 4 alternate}
    @keyframes friendDance{to{transform:translateY(-8px) rotate(5deg)}}
    .socialPanel{margin:0 10px 12px;background:#ffffffe8;border-radius:20px;padding:12px}
    .socialTop{display:flex;align-items:center;justify-content:space-between;gap:10px}.socialTop h3{margin:0}
    .heartbar{height:10px;background:#eadfea;border-radius:99px;overflow:hidden;margin:8px 0}.heartfill{height:100%;background:linear-gradient(90deg,#ef6cae,#ff9ebf);transition:.3s}
    .socialActions{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
    .socialBtn{border:0;border-radius:15px;background:#f6edf8;padding:10px 5px;font-weight:900;color:#5b477c;min-height:54px}
    .socialBtn:disabled{opacity:.45}
    .friendThought{position:absolute;left:50%;top:-48px;transform:translateX(-50%);background:white;border-radius:14px;padding:5px 8px;font-size:11px;font-weight:900;white-space:nowrap;box-shadow:0 4px 10px #0002;opacity:0;transition:.2s}
    .friendThought.show{opacity:1}
    .socialMeta{display:flex;gap:8px;flex-wrap:wrap;margin-top:7px}.socialChip{background:#f3effb;border-radius:999px;padding:5px 8px;font-size:11px;font-weight:900}
    .memoryBox{margin-top:9px;background:#f8f4fc;border-radius:14px;padding:8px 10px;font-size:11px;font-weight:800;color:#675778}
    @media(max-width:560px){.socialActions{grid-template-columns:1fr 1fr}.friendNpc{width:44px}.socialBtn{min-height:50px}}
  `;
  document.head.appendChild(style);

  const friend = document.createElement('div');
  friend.id = 'sarahFriend';
  friend.className = 'friendNpc';
  friend.setAttribute('aria-label', 'Luna, amiga da Sarah');
  friend.innerHTML = '<div class="fname">💗 Luna</div><div class="friendThought" id="friendThought">Oi, Sarah!</div><div class="fhair"></div><div class="fface">•ᴗ•</div><div class="fbody"></div>';
  viewport.appendChild(friend);

  const panel = document.createElement('section');
  panel.className = 'socialPanel';
  panel.innerHTML = `
    <div class="socialTop"><h3>💗 Vida social</h3><b id="friendLevel"></b></div>
    <div class="heartbar"><div class="heartfill" id="friendFill" style="width:${social.friendship}%"></div></div>
    <small id="friendHint">Chegue perto da Luna para interagir.</small>
    <div class="socialMeta">
      <span class="socialChip" id="chatCount">💬 0 conversas</span>
      <span class="socialChip" id="playCount">🧸 0 brincadeiras</span>
    </div>
    <div class="socialActions" style="margin-top:8px">
      <button class="socialBtn" id="callFriend" type="button">👋 Chamar</button>
      <button class="socialBtn" id="chatFriend" type="button">💬 Conversar</button>
      <button class="socialBtn" id="playFriend" type="button">🧸 Brincar juntas</button>
      <button class="socialBtn" id="giftFriend" type="button">🎁 Dar presente</button>
    </div>
    <div class="memoryBox" id="memoryBox">📔 Novas lembranças aparecem quando Sarah e Luna fazem coisas juntas.</div>
  `;
  const main = document.querySelector('main') || document.querySelector('.app');
  main.appendChild(panel);

  const fill = panel.querySelector('#friendFill');
  const level = panel.querySelector('#friendLevel');
  const hint = panel.querySelector('#friendHint');
  const chatCount = panel.querySelector('#chatCount');
  const playCount = panel.querySelector('#playCount');
  const memoryBox = panel.querySelector('#memoryBox');
  const chatBtn = panel.querySelector('#chatFriend');
  const playBtn = panel.querySelector('#playFriend');
  const giftBtn = panel.querySelector('#giftFriend');
  const callBtn = panel.querySelector('#callFriend');
  const thought = friend.querySelector('#friendThought');

  let near = false;
  let thoughtTimer = null;
  let wanderTimer = null;
  let ambientTimer = null;

  const showThought = (text) => {
    thought.textContent = text;
    thought.classList.add('show');
    clearTimeout(thoughtTimer);
    thoughtTimer = setTimeout(() => thought.classList.remove('show'), 1650);
  };

  const celebrate = () => {
    friend.classList.add('celebrate');
    setTimeout(() => friend.classList.remove('celebrate'), 1600);
  };

  const remember = (text) => {
    social.memories.push(`Dia ${dayNow()}: ${text}`);
    social.memories = social.memories.slice(-8);
  };

  const updatePanel = () => {
    const stage = relationshipStage();
    fill.style.width = `${social.friendship}%`;
    level.textContent = stage.label;
    hint.textContent = near
      ? 'Luna está pertinho! Escolha algo para fazerem juntas.'
      : 'Toque em “Chamar” ou chegue perto da Luna.';
    chatBtn.disabled = !near;
    playBtn.disabled = !near;
    giftBtn.disabled = !near;
    chatCount.textContent = `💬 ${social.chats} conversa${social.chats === 1 ? '' : 's'}`;
    playCount.textContent = `🧸 ${social.playTogether} brincadeira${social.playTogether === 1 ? '' : 's'}`;
    const last = social.memories[social.memories.length - 1];
    memoryBox.textContent = last ? `📔 ${last}` : '📔 Novas lembranças aparecem quando Sarah e Luna fazem coisas juntas.';
    friend.classList.toggle('near', near);
    save();
  };

  const distance = () => {
    const a = avatar.getBoundingClientRect();
    const f = friend.getBoundingClientRect();
    return Math.hypot(
      (a.left + a.width / 2) - (f.left + f.width / 2),
      (a.top + a.height / 2) - (f.top + f.height / 2)
    );
  };

  const checkNear = () => {
    const next = distance() < 108;
    if (next !== near) {
      near = next;
      if (near) showThought('Oi, Sarah! 💗');
      updatePanel();
    }
  };

  const rewardMainGame = (coins = 0) => {
    const coinEl = document.getElementById('coins');
    if (!coinEl || coins <= 0) return;
    const current = Math.max(0, Number(coinEl.textContent) || 0);
    coinEl.textContent = String(current + coins);
  };

  const addFriendship = (amount, message, memory) => {
    const before = relationshipStage().label;
    social.friendship = clamp(social.friendship + amount, 0, 100);
    const after = relationshipStage().label;
    showThought(message);
    if (memory) remember(memory);
    if (before !== after) {
      celebrate();
      rewardMainGame(3);
      if (typeof window.toast === 'function') window.toast('Nova fase de amizade! +3 ⭐');
    }
    updatePanel();
  };

  callBtn.addEventListener('click', () => {
    const a = avatar.getBoundingClientRect();
    const v = viewport.getBoundingClientRect();
    const x = clamp(((a.left + a.width / 2 - v.left) / v.width) * 100 + 9, 12, 88);
    const y = clamp(((a.top + a.height / 2 - v.top) / v.height) * 100 + 2, 16, 88);
    friend.style.left = `${x}%`;
    friend.style.top = `${y}%`;
    showThought('Já vou! 👋');
    setTimeout(checkNear, 900);
  });

  chatBtn.addEventListener('click', () => {
    if (!near) return;
    social.chats += 1;
    const bonus = relationshipStage().bonus;
    const lines = ['Qual é sua brincadeira favorita? 💬','Vamos inventar uma história! 📚','Seu look está lindo! 🌸','Depois vamos ao parque? 🌳'];
    addFriendship(4 + bonus, lines[social.chats % lines.length], 'Sarah e Luna tiveram uma conversa divertida.');
  });

  playBtn.addEventListener('click', () => {
    if (!near) return;
    social.playTogether += 1;
    const bonus = relationshipStage().bonus;
    addFriendship(7 + bonus, 'Vamos brincar! 🧸', 'As duas brincaram juntas e deram muitas risadas.');
    rewardMainGame(1);
    celebrate();
    if (typeof window.toast === 'function') window.toast('+ amizade • +1 ⭐');
  });

  giftBtn.addEventListener('click', () => {
    if (!near) return;
    const today = dayNow();
    if (social.lastGiftDay === today) {
      showThought('Já ganhei um presente hoje! 💕');
      return;
    }
    social.lastGiftDay = today;
    addFriendship(12, 'Que presente lindo! 🎁', 'Sarah deu um presente carinhoso para Luna.');
    celebrate();
  });

  const wander = () => {
    if (near) return;
    friend.style.left = `${25 + Math.random() * 55}%`;
    friend.style.top = `${30 + Math.random() * 48}%`;
    setTimeout(checkNear, 850);
  };

  const ambient = () => {
    if (!near) return;
    const thoughts = ['Que dia bonito! ☀️','Vamos brincar? 🌸','Adoro seu unicórnio! 🦄','A cidade está divertida hoje! 🏙️'];
    showThought(thoughts[Math.floor(Math.random() * thoughts.length)]);
  };

  const observer = new MutationObserver(checkNear);
  observer.observe(avatar, {attributes:true, attributeFilter:['style','class']});
  window.addEventListener('resize', checkNear, {passive:true});
  wanderTimer = setInterval(wander, 5600);
  ambientTimer = setInterval(ambient, 8500);

  friend.style.left = '66%';
  friend.style.top = '55%';
  updatePanel();
  setTimeout(checkNear, 300);

  window.addEventListener('pagehide', () => {
    clearInterval(wanderTimer);
    clearInterval(ambientTimer);
    clearTimeout(thoughtTimer);
    observer.disconnect();
  }, {once:true});
})();