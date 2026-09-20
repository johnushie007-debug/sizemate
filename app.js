/* =====================================================================
   SizeMate — app logic
   =====================================================================
   Conversions and saved sizes work entirely on the phone, with no server.
   Sharing and chat need the small Google Apps Script backend: paste its
   Web app URL below and both switch themselves on.
   ===================================================================== */

const SM = {
  endpoint: 'PASTE_YOUR_WEB_APP_URL_HERE',   // ends in /exec
  version: 'SizeMate 1.0 · by Urbanpack',
  pollMs: 6000
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.prototype.slice.call(document.querySelectorAll(s));
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('sm.' + k)) ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('sm.' + k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem('sm.' + k); } catch (e) {} }
};
const online = () => SM.endpoint.indexOf('PASTE_') !== 0;

let me = store.get('me', null);            // {name, country, gender, id, token, code}
let saved = store.get('saved', []);        // saved sizes
let friends = store.get('friends', []);    // [{id, name, country, code}]
let chats = store.get('chats', {});        // {friendId: [{from,text,ts,kind}]}
let current = { cat: null, sys: null, val: null };
let chatWith = null, poller = null;

const ICONS = {
  dress: '<path d="M9 3h6l-1 4 4 5-2 11H8L6 12l4-5-1-4z"/>',
  trousers: '<path d="M7 3h10l1 18h-5l-1-9-1 9H6L7 3z"/>',
  shirt: '<path d="M9 3l3 2 3-2 5 3-2 4-1-1v12H7V9L6 10 4 6l5-3z"/>',
  jacket: '<path d="M8 3l4 3 4-3 4 3v15H4V6l4-3z"/><path d="M12 6v15"/>',
  shoe: '<path d="M2 16h13l3-3 4 3v3H2v-3z"/><path d="M6 16v-4l3 1"/>'
};

/* ---------------------------------------------------------------- utils */
function toast(text) {
  const t = $('#toast');
  t.textContent = text; t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, 2600);
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function initials(name) {
  return String(name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
function when(ts) {
  const d = new Date(ts), now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay ? d.toTimeString().slice(0, 5)
                 : d.toDateString().slice(4, 10) + ' ' + d.toTimeString().slice(0, 5);
}
async function api(action, body) {
  const res = await fetch(SM.endpoint, {
    method: 'POST',
    body: JSON.stringify(Object.assign({ action, userId: me && me.id, token: me && me.token }, body))
  });
  const out = await res.json();
  if (!out.ok) throw new Error(out.error || 'Something went wrong.');
  return out;
}

/* ------------------------------------------------------------ first run */
function fillCountries(sel, chosen) {
  sel.innerHTML = COUNTRIES.map(c =>
    `<option value="${esc(c.name)}"${c.name === chosen ? ' selected' : ''}>${esc(c.name)}</option>`).join('');
}
function systemFor(country) {
  const c = COUNTRIES.find(x => x.name === country);
  return c ? c.system : 'us';
}

function boot() {
  fillCountries($('#wCountry'), 'Nigeria');
  fillCountries($('#pCountry'), me && me.country);
  $('#version').textContent = SM.version + (online() ? '' : ' · offline mode');
  if (!me) { $('#scWelcome').hidden = false; return; }
  startApp();
}

$('#wStart').addEventListener('click', async () => {
  const name = $('#wName').value.trim();
  if (name.length < 2) return toast('Please enter your name.');
  me = {
    name, country: $('#wCountry').value, gender: $('#wGender').value,
    id: null, token: null, code: null
  };
  store.set('me', me);
  $('#scWelcome').hidden = true;
  startApp();
  register();
});

/* Registers this phone with the backend so others can share with it. */
async function register() {
  if (!online() || (me && me.id)) return;
  try {
    const out = await api('register', { name: me.name, country: me.country });
    me.id = out.id; me.token = out.token; me.code = out.code;
    store.set('me', me);
    paintPeople();
  } catch (e) { /* stays offline-only; conversions still work */ }
}

function startApp() {
  $('#app').hidden = false;
  $('#whoChip').textContent = me.name + ' · ' + me.country;
  $('#pName').value = me.name;
  $('#pGender').value = me.gender || 'female';
  fillCountries($('#pCountry'), me.country);
  paintCats(); paintHistory(); paintPeople();
  if (online() && !me.id) register();
  if (online()) startPolling();
}

/* ----------------------------------------------------------- navigation */
function go(where) {
  ['convert', 'history', 'people', 'profile', 'chat'].forEach(k => {
    const el = $('#sc' + k[0].toUpperCase() + k.slice(1));
    if (el) el.hidden = (k !== where);
  });
  $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.go === where));
  if (where !== 'chat') { chatWith = null; }
  window.scrollTo(0, 0);
}
$$('#tabs button, [data-go]').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
$('#whoChip').addEventListener('click', () => go('profile'));

/* -------------------------------------------------------- the converter */
function paintCats() {
  const g = me.gender || 'both';
  const cats = SIZE_DATA.filter(c => g === 'both' || c.gender === g);
  $('#cats').innerHTML = cats.map(c => `
    <button class="cat" data-cat="${c.id}">
      <span class="cat__ico"><svg viewBox="0 0 24 24">${ICONS[c.icon] || ''}</svg></span>
      <span class="cat__for">${c.gender === 'female' ? "Women's" : "Men's"}</span>
      <span class="cat__label">${esc(c.label)}</span>
    </button>`).join('');
  $$('#cats .cat').forEach(b => b.addEventListener('click', () => openCat(b.dataset.cat)));
}

function openCat(id, preset) {
  const cat = SIZE_DATA.find(c => c.id === id);
  if (!cat) return;
  current.cat = cat;
  $$('#cats .cat').forEach(b => b.classList.toggle('on', b.dataset.cat === id));
  $('#converter').hidden = false;
  $('#catTitle').textContent = cat.label;
  $('#catHint').textContent = cat.hint;
  $('#sysSel').innerHTML = cat.systems.map(s =>
    `<option value="${s.key}">${esc(s.label)}</option>`).join('');
  const mine = systemFor(me.country);
  $('#sysSel').value = cat.systems.some(s => s.key === mine) ? mine : cat.systems[0].key;
  if (preset && preset.sys) $('#sysSel').value = preset.sys;
  fillValues(preset && preset.val);
  $('#converter').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function fillValues(preset) {
  const cat = current.cat, sys = $('#sysSel').value;
  $('#valSel').innerHTML = '<option value="">Select your size</option>' +
    cat.rows.map(r => `<option value="${esc(r[sys])}">${esc(r[sys])}</option>`).join('');
  if (preset) $('#valSel').value = preset;
  convert();
}

function convert() {
  const cat = current.cat, sys = $('#sysSel').value, val = $('#valSel').value;
  current.sys = sys; current.val = val;
  const row = cat.rows.find(r => String(r[sys]) === String(val));
  $('#result').hidden = !row;
  if (!row) return;

  $('#resultGrid').innerHTML = cat.systems.map(s => `
    <div class="tile${s.key === sys ? ' is-you' : ''}">
      <div class="tile__sys">${esc(s.label)}</div>
      <div class="tile__val">${esc(row[s.key])}</div>
      <div class="tile__tag">${s.key === sys ? 'the size you gave' : ''}</div>
    </div>`).join('');

  const body = cat.body.filter(b => row[b.key]);
  $('#bodyCard').hidden = !body.length;
  $('#bodyRows').innerHTML = body.map(b =>
    `<div><span>${esc(b.label)}</span><b>${esc(row[b.key])}</b></div>`).join('');
}
$('#sysSel').addEventListener('change', () => fillValues());
$('#valSel').addEventListener('change', convert);
$('#changeCat').addEventListener('click', () => {
  $('#converter').hidden = true;
  $$('#cats .cat').forEach(b => b.classList.remove('on'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* --------------------------------------------------------- saved sizes */
function summary(cat, row, sys) {
  return cat.systems.map(s => s.label.replace(/ \(.*/, '') + ' ' + row[s.key]).join(' · ');
}
$('#saveBtn').addEventListener('click', () => {
  const cat = current.cat;
  const row = cat.rows.find(r => String(r[current.sys]) === String(current.val));
  if (!row) return;
  const label = prompt('Name this size (e.g. "My jeans", "Papa\'s shoes")',
                       me.name + ' — ' + cat.label) || cat.label;
  saved.unshift({
    id: 'sz' + Date.now(), label: label.slice(0, 60), catId: cat.id, sys: current.sys,
    val: current.val, summary: summary(cat, row, current.sys), ts: Date.now()
  });
  store.set('saved', saved);
  paintHistory();
  toast('Saved to My sizes');
});

function paintHistory() {
  $('#historyEmpty').hidden = saved.length > 0;
  $('#historyList').innerHTML = saved.map(s => `
    <div class="item" data-id="${s.id}">
      <div class="item__main" data-open="${s.id}">
        <div class="item__t">${esc(s.label)}</div>
        <div class="item__s">${esc(s.summary)}</div>
      </div>
      <button class="btn btn--ghost btn--sm" data-share="${s.id}">Share</button>
      <button class="item__x" data-del="${s.id}" aria-label="Delete">×</button>
    </div>`).join('');
  $$('#historyList [data-open]').forEach(el => el.addEventListener('click', () => {
    const s = saved.find(x => x.id === el.dataset.open);
    go('convert'); openCat(s.catId, { sys: s.sys, val: s.val });
  }));
  $$('#historyList [data-del]').forEach(el => el.addEventListener('click', () => {
    saved = saved.filter(x => x.id !== el.dataset.del);
    store.set('saved', saved); paintHistory(); toast('Deleted');
  }));
  $$('#historyList [data-share]').forEach(el => el.addEventListener('click', () => {
    const s = saved.find(x => x.id === el.dataset.share);
    openShare(s.label + ' — ' + s.summary);
  }));
}

/* -------------------------------------------------------------- sharing */
$('#shareBtn').addEventListener('click', () => {
  const cat = current.cat;
  const row = cat.rows.find(r => String(r[current.sys]) === String(current.val));
  if (!row) return;
  openShare(me.name + ' — ' + cat.label + ': ' + summary(cat, row, current.sys));
});

function openShare(text) {
  const body = $('#sheetBody');
  const list = friends.length ? friends.map(f => `
    <button class="pick" data-send="${f.id}">
      <span class="avatar">${esc(initials(f.name))}</span>
      <span>Send to <b>${esc(f.name)}</b><br><span class="fine">${esc(f.country || '')}</span></span>
    </button>`).join('') : '';
  body.innerHTML = `
    <p class="fine">${esc(text)}</p>
    ${list}
    <button class="pick" data-copy="1"><span class="avatar">↗</span>
      <span>Share outside SizeMate<br><span class="fine">WhatsApp, SMS or copy</span></span></button>`;
  $('#sheet').hidden = false;

  $$('#sheetBody [data-send]').forEach(b => b.addEventListener('click', async () => {
    try {
      await api('message', { to: b.dataset.send, text, kind: 'size' });
      pushLocal(b.dataset.send, { from: me.id, text, ts: Date.now(), kind: 'size' });
      $('#sheet').hidden = true;
      toast('Sent');
    } catch (e) { toast(e.message); }
  }));
  $('#sheetBody [data-copy]').addEventListener('click', async () => {
    const payload = text + '\n\n— sent from SizeMate';
    if (navigator.share) {
      try { await navigator.share({ title: 'My size', text: payload }); $('#sheet').hidden = true; return; }
      catch (e) { /* user cancelled */ }
    }
    try { await navigator.clipboard.writeText(payload); toast('Copied'); } catch (e) { toast('Copy failed'); }
    $('#sheet').hidden = true;
  });
}
$('#sheetClose').addEventListener('click', () => { $('#sheet').hidden = true; });

/* -------------------------------------------------------------- people */
function paintPeople() {
  $('#myCode').textContent = (me && me.code) ? me.code : '— — — —';
  $('#linkCard').hidden = !online();
  $('#offlineNote').hidden = online();
  $('#friendList').innerHTML = friends.map(f => {
    const log = chats[f.id] || [];
    const unread = log.filter(m => m.from === f.id && !m.seen).length;
    const last = log.length ? log[log.length - 1].text : 'Say hello';
    return `
      <div class="item" data-chat="${f.id}">
        <span class="avatar">${esc(initials(f.name))}</span>
        <div class="item__main">
          <div class="item__t">${esc(f.name)}</div>
          <div class="item__s">${esc(last).slice(0, 60)}</div>
        </div>
        ${unread ? `<span class="badge">${unread}</span>` : ''}
      </div>`;
  }).join('');
  $$('#friendList [data-chat]').forEach(el =>
    el.addEventListener('click', () => openChat(el.dataset.chat)));
  const unreadTotal = Object.keys(chats).reduce((n, k) =>
    n + (chats[k] || []).filter(m => m.from !== me.id && !m.seen).length, 0);
  const tab = $('#tabs button[data-go="people"]');
  const old = tab.querySelector('.badge'); if (old) old.remove();
  if (unreadTotal) {
    const b = document.createElement('span');
    b.className = 'badge'; b.textContent = unreadTotal; tab.appendChild(b);
  }
}

$('#copyCode').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(me.code || ''); toast('Code copied'); }
  catch (e) { toast('Copy failed'); }
});

$('#addBtn').addEventListener('click', async () => {
  const code = $('#addCode').value.trim().toUpperCase();
  const msg = $('#peopleMsg');
  msg.hidden = true;
  if (code.length < 4) { msg.textContent = 'Enter their code.'; msg.className = 'msg err'; msg.hidden = false; return; }
  if (me.code && code === me.code) { msg.textContent = "That's your own code."; msg.className = 'msg err'; msg.hidden = false; return; }
  try {
    const out = await api('addFriend', { code });
    if (!friends.some(f => f.id === out.friend.id)) friends.push(out.friend);
    store.set('friends', friends);
    $('#addCode').value = '';
    msg.textContent = out.friend.name + ' added. You can now share sizes and chat.';
    msg.className = 'msg ok'; msg.hidden = false;
    paintPeople();
  } catch (e) {
    msg.textContent = e.message; msg.className = 'msg err'; msg.hidden = false;
  }
});

/* ---------------------------------------------------------------- chat */
function pushLocal(friendId, m) {
  chats[friendId] = chats[friendId] || [];
  chats[friendId].push(m);
  store.set('chats', chats);
  if (chatWith === friendId) paintChat();
  paintPeople();
}

function openChat(friendId) {
  const f = friends.find(x => x.id === friendId);
  if (!f) return;
  chatWith = friendId;
  (chats[friendId] || []).forEach(m => { m.seen = true; });
  store.set('chats', chats);
  go('chat');
  $('#chatWho').textContent = f.name;
  $('#chatSub').textContent = f.country || '';
  paintChat();
  paintPeople();
}
$('#chatBack').addEventListener('click', () => go('people'));

function paintChat() {
  const log = chats[chatWith] || [];
  $('#chatLog').innerHTML = log.map(m => `
    <div class="bubble ${m.from === me.id ? 'me' : ''} ${m.kind === 'size' ? 'bubble--size' : ''}">
      ${esc(m.text)}<time>${when(m.ts)}</time>
    </div>`).join('') || '<p class="fine">No messages yet.</p>';
  const log_el = $('#chatLog');
  log_el.scrollTop = log_el.scrollHeight;
}

async function sendChat() {
  const input = $('#chatText');
  const text = input.value.trim();
  if (!text || !chatWith) return;
  input.value = '';
  try {
    await api('message', { to: chatWith, text, kind: 'text' });
    pushLocal(chatWith, { from: me.id, text, ts: Date.now(), kind: 'text', seen: true });
  } catch (e) { toast(e.message); input.value = text; }
}
$('#chatSend').addEventListener('click', sendChat);
$('#chatText').addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });

/* Fetches anything sent to this phone since the last check. */
async function poll() {
  if (!online() || !me || !me.id || document.hidden) return;
  try {
    const out = await api('inbox', { since: store.get('since', 0) });
    if (out.since) store.set('since', out.since);
    (out.messages || []).forEach(m => {
      if (!friends.some(f => f.id === m.from)) {
        friends.push({ id: m.from, name: m.fromName, country: m.fromCountry || '' });
        store.set('friends', friends);
      }
      pushLocal(m.from, { from: m.from, text: m.text, ts: m.ts, kind: m.kind, seen: chatWith === m.from });
    });
    if ((out.messages || []).length && chatWith) paintChat();
  } catch (e) { /* offline for now; try again next tick */ }
}
function startPolling() {
  clearInterval(poller);
  poll();
  poller = setInterval(poll, SM.pollMs);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
}

/* ------------------------------------------------------------- profile */
$('#pSave').addEventListener('click', async () => {
  me.name = $('#pName').value.trim() || me.name;
  me.country = $('#pCountry').value;
  me.gender = $('#pGender').value;
  store.set('me', me);
  $('#whoChip').textContent = me.name + ' · ' + me.country;
  paintCats();
  const msg = $('#profileMsg');
  msg.textContent = 'Profile saved.'; msg.className = 'msg ok'; msg.hidden = false;
  if (online() && me.id) { try { await api('updateProfile', { name: me.name, country: me.country }); } catch (e) {} }
});

$('#wipeBtn').addEventListener('click', () => {
  if (!confirm('Delete your profile, saved sizes and messages from this phone?')) return;
  ['me', 'saved', 'friends', 'chats', 'since'].forEach(store.del);
  location.reload();
});

/* --------------------------------------------------------- service worker */
if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

boot();
