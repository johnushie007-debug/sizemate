/**
 * =========================================================================
 *  SIZEMATE — sharing and chat backend (Google Apps Script)
 *  Built by Urbanpack
 *
 *  The app converts sizes and saves them on the phone with no server at
 *  all. This script only powers the two things that need one: sharing a
 *  size with another user, and chatting.
 *
 *  SETUP (once, about 10 minutes)
 *   1. Create a Google Sheet named "SizeMate".
 *   2. Extensions → Apps Script. Delete the sample, paste this whole file.
 *   3. Project Settings (gear) → Time zone → Lagos.
 *   4. Run "setup" once and approve the permissions.
 *   5. Deploy → New deployment → Web app.
 *        Execute as:     Me
 *        Who has access: Anyone
 *      Copy the Web app URL (ends in /exec).
 *   6. Paste that URL into SM.endpoint at the top of app.js.
 *
 *  AFTER EDITING THIS FILE: Deploy → Manage deployments → pencil →
 *  Version: New version → Deploy. Otherwise the old code keeps running.
 *
 *  WHAT IS STORED
 *   Users: a display name, country, a join code and a secret token.
 *   Messages: who sent what to whom, and when. Nothing else.
 *   There are no passwords: the token saved on the phone is the key, so
 *   a user who clears their phone starts fresh with a new code. That is
 *   a deliberate trade for a simple app; tell us if you want proper
 *   accounts with sign-in and recovery.
 * =========================================================================
 */

const USERS_SHEET = 'Users';
const MSG_SHEET = 'Messages';
const USER_HEADERS = ['Joined', 'User ID', 'Name', 'Country', 'Code', 'Token', 'Last Seen'];
const MSG_HEADERS = ['Sent At', 'From', 'To', 'Kind', 'Message'];
const MAX_MESSAGE = 1000;
const RATE_PER_MINUTE = 30;

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  [[USERS_SHEET, USER_HEADERS], [MSG_SHEET, MSG_HEADERS]].forEach(function (pair) {
    let sh = ss.getSheetByName(pair[0]);
    if (!sh) sh = ss.insertSheet(pair[0]);
    if (sh.getLastRow() === 0) sh.appendRow(pair[1]);
    sh.getRange(1, 1, 1, pair[1].length)
      .setFontWeight('bold').setBackground('#0b2a5b').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  });
  Logger.log('SizeMate is ready. Deploy as a web app and paste the URL into app.js.');
}

function doGet() {
  return ContentService.createTextOutput('SizeMate backend is live.');
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); }
  catch (err) { return json_({ ok: false, error: 'Bad request.' }); }

  try {
    if (!rateOk_(d)) throw new Error('Too many requests. Please slow down.');
    switch (d.action) {
      case 'register':      return register_(d);
      case 'addFriend':     return addFriend_(d);
      case 'message':       return message_(d);
      case 'inbox':         return inbox_(d);
      case 'updateProfile': return updateProfile_(d);
      default: throw new Error('Unknown action.');
    }
  } catch (err) {
    return json_({ ok: false, error: err.message || String(err) });
  }
}

/* ------------------------------------------------------------------ */
function register_(d) {
  const name = clean_(d.name, 40);
  if (name.length < 2) throw new Error('Please give a name.');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet_(USERS_SHEET, USER_HEADERS);
    let code, tries = 0;
    do { code = makeCode_(); tries++; } while (findByCode_(sh, code) && tries < 20);
    const id = Utilities.getUuid();
    const token = Utilities.getUuid().replace(/-/g, '');
    sh.appendRow([new Date(), id, name, clean_(d.country, 40), code, token, new Date()]);
    return json_({ ok: true, id: id, token: token, code: code });
  } finally { lock.releaseLock(); }
}

function addFriend_(d) {
  const me = auth_(d);
  const code = clean_(d.code, 8).toUpperCase();
  const sh = sheet_(USERS_SHEET, USER_HEADERS);
  const row = findByCode_(sh, code);
  if (!row) throw new Error('No one has that code. Check it and try again.');
  if (row.id === me.id) throw new Error("That's your own code.");
  return json_({ ok: true, friend: { id: row.id, name: row.name, country: row.country } });
}

function message_(d) {
  const me = auth_(d);
  const text = clean_(d.text, MAX_MESSAGE);
  if (!text) throw new Error('Nothing to send.');
  const to = clean_(d.to, 60);
  if (!userById_(to)) throw new Error('That person is no longer on SizeMate.');
  sheet_(MSG_SHEET, MSG_HEADERS)
    .appendRow([new Date(), me.id, to, d.kind === 'size' ? 'size' : 'text', text]);
  return json_({ ok: true });
}

/* Everything addressed to this user since the timestamp they last saw. */
function inbox_(d) {
  const me = auth_(d);
  const since = Number(d.since || 0);
  const sh = sheet_(MSG_SHEET, MSG_HEADERS);
  const last = sh.getLastRow();
  const out = [];
  let newest = since;
  if (last > 1) {
    const rows = sh.getRange(2, 1, last - 1, MSG_HEADERS.length).getValues();
    const names = {};
    for (let i = rows.length - 1; i >= 0 && out.length < 200; i--) {
      const ts = new Date(rows[i][0]).getTime();
      if (ts <= since) break;                    // rows are in time order
      if (rows[i][2] !== me.id) continue;        // not addressed to me
      const from = rows[i][1];
      if (!names[from]) {
        const u = userById_(from);
        names[from] = u ? { name: u.name, country: u.country } : { name: 'SizeMate user', country: '' };
      }
      out.push({ from: from, fromName: names[from].name, fromCountry: names[from].country,
                 kind: rows[i][3], text: rows[i][4], ts: ts });
      if (ts > newest) newest = ts;
    }
  }
  touch_(me.rowIndex);
  return json_({ ok: true, messages: out.reverse(), since: newest });
}

function updateProfile_(d) {
  const me = auth_(d);
  const sh = sheet_(USERS_SHEET, USER_HEADERS);
  if (d.name) sh.getRange(me.rowIndex, 3).setValue(clean_(d.name, 40));
  if (d.country) sh.getRange(me.rowIndex, 4).setValue(clean_(d.country, 40));
  return json_({ ok: true });
}

/* ---------------------------------------------------------- helpers */
function sheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(headers);
  return sh;
}

function auth_(d) {
  const id = clean_(d.userId, 60), token = clean_(d.token, 60);
  if (!id || !token) throw new Error('Please set up your profile again.');
  const u = userById_(id);
  if (!u || u.token !== token) throw new Error('This device is not recognised.');
  return u;
}

function userById_(id) {
  const sh = sheet_(USERS_SHEET, USER_HEADERS);
  const last = sh.getLastRow();
  if (last < 2 || !id) return null;
  const rows = sh.getRange(2, 1, last - 1, USER_HEADERS.length).getValues();
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][1] === id) {
      return { id: rows[i][1], name: rows[i][2], country: rows[i][3],
               code: rows[i][4], token: rows[i][5], rowIndex: i + 2 };
    }
  }
  return null;
}

function findByCode_(sh, code) {
  const last = sh.getLastRow();
  if (last < 2) return null;
  const rows = sh.getRange(2, 1, last - 1, USER_HEADERS.length).getValues();
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][4]).toUpperCase() === String(code).toUpperCase()) {
      return { id: rows[i][1], name: rows[i][2], country: rows[i][3],
               code: rows[i][4], token: rows[i][5], rowIndex: i + 2 };
    }
  }
  return null;
}

function touch_(rowIndex) {
  try { sheet_(USERS_SHEET, USER_HEADERS).getRange(rowIndex, 7).setValue(new Date()); } catch (e) {}
}

/* Codes people read aloud: no O/0, I/1, or similar look-alikes. */
function makeCode_() {
  const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  return out;
}

function clean_(v, max) {
  return String(v == null ? '' : v).trim().slice(0, max || 200);
}

function rateOk_(d) {
  const key = 'rate_' + clean_(d.userId, 60) + '_' + Math.floor(Date.now() / 60000);
  const cache = CacheService.getScriptCache();
  const n = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(n), 120);
  return n <= RATE_PER_MINUTE;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

/* Optional housekeeping: delete messages older than 60 days.
   Add a time-driven trigger (Triggers → Add trigger → monthly). */
function purgeOldMessages() {
  const sh = sheet_(MSG_SHEET, MSG_HEADERS);
  const last = sh.getLastRow();
  if (last < 2) return;
  const cutoff = Date.now() - 60 * 24 * 60 * 60 * 1000;
  const rows = sh.getRange(2, 1, last - 1, 1).getValues();
  let deleteTo = 0;
  for (let i = 0; i < rows.length; i++) {
    if (new Date(rows[i][0]).getTime() < cutoff) deleteTo = i + 2; else break;
  }
  if (deleteTo > 1) sh.deleteRows(2, deleteTo - 1);
}
