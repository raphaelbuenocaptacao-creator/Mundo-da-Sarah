(() => {
  'use strict';

  const viewport = document.getElementById('viewport');
  const avatar = document.getElementById('avatar');
  if (!viewport || !avatar || document.getElementById('sarahFriend')) return;

  const KEY = 'mundoSarahSocialV1';
  let social;
  try {
    social = JSON.parse(localStorage.getItem(KEY) || 'null') || {};
  } catch {
    social = {};
  }
  social.friendship = Math.max(0, Math.min(100, Number(social.friendship) || 10));
  social.chats = Math.max(0, Number(social.chats) || 0);
  social.lastGiftDay = Number(social.lastGiftDay) || 0;

  const save = () => localStorage.setItem(KEY, JSON.stringify(social));

  const style = document.createElement('style');
  style.textContent = `
    .friendNpc{position:absolute;z-index:19;left:66%;top:55%;width:48px;height:70px;transform:translate(-50%,-50%);pointer-events:none;transition:left .8s ease,top .8s ease;filter:drop-shadow(4px 7px 3px #0004)}
    .friendNpc .fhair{position:absolute;left:4px;top:2px;width:40px;height:44px;border-radius:50% 50% 55% 55%;background:#6f4b36}
    .friendNpc .fface{position:absolute;left:10px;top:8px;width:29px;height:29px;border-radius:50%;background:#efc5a5;border:2px solid #9a6f58;display:grid;place-items:center;font-size:12px}
    .friendNpc .fbody{position:absolute;left:8px;top:36px;width:33px;height:29px;border-radius:13px 13px 8px 8px;background:#55a9d8;border:2px solid #35799d}
    .friendNpc .fname{position:absolute;left:50%;top:-23px;transform:translateX(-50%);background:#fff;border-radius:999px;padding:3px 7px;font-size:10px;font-weight:900;white-space:nowrap;box-shadow:0 3px 8px #0002}
    .friendNpc.near{filter:drop-shadow(0 0 8px #fff) drop-shadow(4px 7px 3px #0004)}
    .friendNpc.near .fname{background:#fff5b8}
    .socialPanel{margin:0 10px 12px;background:#ffffffe8;border-radius:20px;padding:12px}
    .socialTop{display:flex;align-items:center;justify-content:space-between;gap:10px}.socialTop h3{margin:0}
    .heartbar{height:10px;background:#eadfea;border-radius:99px;overflow:hidden;margin:8px 0}.heartfill{height:100%;background:linear-gradient(90deg,#ef6cae,#ff9ebf);transition:.3s}
    .socialActions{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
    .socialBtn{border:0;border-radius:15px;background:#f6edf8;padding:10px 5px;font-weight:900;color:#5b477c;min-height:54px}
    .socialBtn:disabled{opacity:.45}
    .friendThought{position:absolute;left:50%;top:-48px;transform:translateX(-50%);background:white;border-radius:14px;padding:5px 8px;font-size:11px;font-weight:900;white-space:nowrap;box-shadow:0 4px 10px #0002;opacity:0;transition:.2s}
    .friendThought.show{opacity:1}
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
    <div class="socialTop"><h3>💗 Amizades</h3><b id="friendLevel">Amizade ${social.friendship}%</b></div>
    <div class="heartbar"><div class="heartfill" id="friendFill" style="width:${social.friendship}%"></div></div>
    <small id="friendHint">Chegue perto da Luna para conversar e brincar.</small>
    <div class="socialActions" style="margin-top:8px">
      <button class="socialBtn" id="chatFriend" type="button">💬 Conversar</button>
      <button class="socialBtn" id="playFriend" type="button">🧸 Brincar juntas</button>
      <button class="socialBtn" id="giftFriend" type="button">🎁 Dar presente</button>
    </div>
  `;
  const main = document.querySelector('main') || document.querySelector('.app');
  main.appendChild(panel);

  const fill = panel.querySelector('#friendFill');
  const level = panel.querySelector('#friendLevel');
  const hint = panel.querySelector('#friendHint');
  const buttons = [...panel.querySelectorAll('.socialBtn')];
  const thought = friend.querySelector('#friendThought');
  let near = false;
  let thoughtTimer = null;
  let wanderTimer = null;

  const showThought = (text) => {
    thought.textContent = text;
    thought.classList.add('show');
    clearTimeout(thoughtTimer);
    thoughtTimer = setTimeout(() => thought.classList.remove('show'), 1500);
  };

  const updatePanel = () => {
    fill.style.width = `${social.friendship}%`;
    level.textContent = social.friendship >= 80 ? 'Melhores amigas 💖' : `Amizade ${social.friendship}%`;
    hint.textContent = near ? 'Luna está pertinho! Escolha uma atividade.' : 'Chegue perto da Luna para conversar e brincar.';
    buttons.forEach(btn => btn.disabled = !near);
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
    const next = distance() < 105;
    if (next !== near) {
      near = next;
      if (near) showThought('Oi, Sarah! 💗');
      updatePanel();
    }
  };

  const addFriendship = (amount, message) => {
    social.friendship = Math.min(100, social.friendship + amount);
    social.chats += 1;
    showThought(message);
    updatePanel();
  };

  panel.querySelector('#chatFriend').addEventListener('click', () => {
    if (!near) return;
    addFriendship(4, 'Adorei conversar! 💬');
  });

  panel.querySelector('#playFriend').addEventListener('click', () => {
    if (!near) return;
    addFriendship(7, 'Vamos brincar! 🧸');
    if (typeof window.toast === 'function') window.toast('+ amizade');
  });

  panel.querySelector('#giftFriend').addEventListener('click', () => {
    if (!near) return;
    const dayEl = document.getElementById('day');
    const today = Math.max(1, Number(dayEl?.textContent) || 1);
    if (social.lastGiftDay === today) {
      showThought('Já ganhei um presente hoje! 💕');
      return;
    }
    social.lastGiftDay = today;
    addFriendship(12, 'Que presente lindo! 🎁');
  });

  const wander = () => {
    if (near) return;
    const x = 25 + Math.random() * 55;
    const y = 30 + Math.random() * 48;
    friend.style.left = `${x}%`;
    friend.style.top = `${y}%`;
    setTimeout(checkNear, 850);
  };

  const observer = new MutationObserver(checkNear);
  observer.observe(avatar, {attributes:true, attributeFilter:['style','class']});
  window.addEventListener('resize', checkNear, {passive:true});
  wanderTimer = setInterval(wander, 5200);

  friend.style.left = '66%';
  friend.style.top = '55%';
  updatePanel();
  setTimeout(checkNear, 300);

  window.addEventListener('pagehide', () => {
    clearInterval(wanderTimer);
    clearTimeout(thoughtTimer);
    observer.disconnect();
  }, {once:true});
})();
