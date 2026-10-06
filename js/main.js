import { W, H, canvas, input, setScene, start, currentScene, step } from './engine.js';
import { CONFIG } from './config.js';
import { bakeAll } from './sprites.js';
import { Graveyard } from './background.js';
import { sfx, unlock, needsGesture, isMuted, setMuted, enableSound } from './audio.js';
import { TitleScene } from './scenes/title.js';
import { MenuScene } from './scenes/menu.js';
import { NameScene } from './scenes/name.js';
import { InstructionsScene } from './scenes/instructions.js';
import { LevelScene } from './scenes/level.js';
import { QuestionScene } from './scenes/question.js';
import { EndingScene } from './scenes/ending.js';
import { InviteScene } from './scenes/invite.js';
import { RsvpScene } from './scenes/rsvp.js';
import { flushPendingRsvp } from './rsvp.js';

const SCENES = {
  title: TitleScene, menu: MenuScene, name: NameScene, instructions: InstructionsScene,
  invite: InviteScene, level: LevelScene, question: QuestionScene, ending: EndingScene, rsvp: RsvpScene
};

bakeAll();
const bg = new Graveyard(3);
bg.onScream = () => sfx.scream();

function loadName() { try { return localStorage.getItem(CONFIG.storageKey) || ''; } catch (e) { return ''; } }

const game = {
  bg,
  nameInput: document.getElementById('name-input'),
  name: loadName(),
  setName(n) { this.name = n; try { localStorage.setItem(CONFIG.storageKey, n); } catch (e) { /* ignore */ } },
  go(key, ...args) { setScene(new SCENES[key](this, ...args)); }
};

// ---- scaling ----
function resize() {
  const sw = window.innerWidth, sh = window.innerHeight;
  let s = Math.min(sw / W, sh / H);
  if (s >= 2) s = Math.floor(s);
  canvas.style.width = Math.floor(W * s) + 'px';
  canvas.style.height = Math.floor(H * s) + 'px';
  document.documentElement.style.setProperty('--scale', s);
}
window.addEventListener('resize', resize);
resize();

// ---- embedded in another page (e.g. the zhurisolan.com project page) ----
if (window.self !== window.top) document.body.classList.add('embedded');

// ---- touch controls ----
if (window.matchMedia('(pointer: coarse)').matches) document.body.classList.add('is-touch');
for (const btn of document.querySelectorAll('.touch button')) {
  const k = btn.dataset.key;
  const down = (e) => { e.preventDefault(); btn.classList.add('held'); input.press(k); };
  const up = (e) => { e.preventDefault(); btn.classList.remove('held'); input.release(k); };
  btn.addEventListener('pointerdown', down);
  btn.addEventListener('pointerup', up);
  btn.addEventListener('pointercancel', up);
  btn.addEventListener('pointerleave', up);
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
}
// A tap on the game goes to the option under the finger when the scene has
// tappable options; otherwise it acts like pressing OK.
canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  const r = canvas.getBoundingClientRect();
  const gx = (e.clientX - r.left) * W / r.width, gy = (e.clientY - r.top) * H / r.height;
  const scene = currentScene();
  if (scene && scene.tap && scene.tap(gx, gy)) return;
  input.press('confirm');
});
canvas.addEventListener('pointerup', () => input.release('confirm'));
canvas.addEventListener('pointercancel', () => input.release('confirm'));

// ---- audio unlock + mute ----
// Keep trying to start sound on every gesture until it is actually running.
// On touch screens only the finger lifting (pointerup / touchend / click) counts.
const UNLOCK_EVENTS = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];
function tryUnlock() {
  unlock();
  setTimeout(() => { if (!needsGesture()) UNLOCK_EVENTS.forEach((ev) => window.removeEventListener(ev, tryUnlock, true)); }, 0);
}
function listenForUnlock() { UNLOCK_EVENTS.forEach((ev) => window.addEventListener(ev, tryUnlock, { capture: true, passive: true })); }
listenForUnlock();
// Phones suspend audio when the tab goes to the background; start listening again on return.
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && needsGesture()) listenForUnlock(); });

// Phones start muted and ask once (on the menu) whether to play with sound.
// "Sound on" also plays through the iPhone silent switch, since the player asked for it.
const isTouch = document.body.classList.contains('is-touch');
const SOUND_KEY = 'nova.soundChoice';
function readSoundChoice() { try { return localStorage.getItem(SOUND_KEY); } catch (e) { return null; } }
function saveSoundChoice(v) { try { localStorage.setItem(SOUND_KEY, v); } catch (e) { /* ignore */ } }
game.askSound = false;
if (isTouch) {
  const choice = readSoundChoice();
  if (choice === 'on') enableSound(false);
  else { setMuted(true, false); game.askSound = choice !== 'off'; }
}
game.setSound = (on) => {
  if (on) { enableSound(!isTouch); listenForUnlock(); } else setMuted(true, !isTouch);
  if (isTouch) saveSoundChoice(on ? 'on' : 'off');
  game.askSound = false;
  renderMute();
};

const muteBtn = document.getElementById('mute');
function renderMute() { muteBtn.textContent = isMuted() ? '\u{1F507}' : '\u{1F50A}'; muteBtn.classList.toggle('off', isMuted()); }
muteBtn.addEventListener('click', (e) => { e.stopPropagation(); game.setSound(isMuted()); });
window.addEventListener('keydown', (e) => { if (e.code === 'KeyM' && !input.locked) game.setSound(isMuted()); });
renderMute();

// ---- boot once the pixel font is ready (or after a short timeout) ----
const fontReady = Promise.race([
  Promise.all([document.fonts.load('8px "Press Start 2P"'), document.fonts.load('16px "Press Start 2P"')]),
  new Promise((res) => setTimeout(res, 2500))
]).catch(() => {});
fontReady.then(() => { game.go('title'); start(); });

// resend an RSVP that couldn't go out last time (e.g. the player was offline)
flushPendingRsvp();

// handy for debugging from the console
window.NOVA = { game, scene: currentScene, input, step };
