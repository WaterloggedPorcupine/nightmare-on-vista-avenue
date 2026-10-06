// Tiny Web Audio synth. No files, just oscillators and noise.
import { CONFIG } from './config.js';

let ac = null;
let muted = false;
try { muted = localStorage.getItem(CONFIG.muteKey) === '1'; } catch (e) { /* ignore */ }

// "Playback" mode lets sound play even when an iPhone's ring/silent switch is
// on silent. It is only switched on when the player explicitly asks for sound.
let wantPlayback = false;
let playbackReady = false;
let silentEl = null;

function silentWavUrl() {
  // 0.5 s of 8-bit mono silence at 8 kHz
  const n = 4000, buf = new ArrayBuffer(44 + n), v = new DataView(buf);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + n, true); str(8, 'WAVE'); str(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  str(36, 'data'); v.setUint32(40, n, true);
  for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}

function applyPlayback() {
  if (!wantPlayback || playbackReady) return;
  try {
    // iOS 17+ and other browsers that support the Audio Session API
    if (navigator.audioSession) { navigator.audioSession.type = 'playback'; playbackReady = true; return; }
  } catch (e) { /* fall through */ }
  // Older iOS: a playing <audio> element switches the page into playback mode.
  try {
    if (!silentEl) { silentEl = new Audio(silentWavUrl()); silentEl.loop = true; silentEl.setAttribute('playsinline', ''); }
    const p = silentEl.play();
    if (p && p.then) p.then(() => { playbackReady = true; }).catch(() => {});
    else playbackReady = true;
  } catch (e) { /* try again on the next gesture */ }
}

// Browsers only let sound start from a real user gesture. On phones the touch
// counts when the finger lifts, so callers keep calling this on every tap and
// key press until isRunning() is true. A one-sample silent buffer is played as
// well, which some iOS versions need before they will output anything.
export function unlock() {
  applyPlayback();
  try {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state !== 'running') {
      const p = ac.resume();
      if (p && p.catch) p.catch(() => {});
      const src = ac.createBufferSource();
      src.buffer = ac.createBuffer(1, 1, 22050);
      src.connect(ac.destination);
      src.start(0);
    }
  } catch (e) { /* try again on the next gesture */ }
}
export function isRunning() { return !!ac && ac.state === 'running'; }
// True while sound still needs a user gesture to finish starting.
export function needsGesture() { return !isRunning() || (wantPlayback && !playbackReady); }
export function isMuted() { return muted; }
export function setMuted(m, persist = true) {
  muted = !!m;
  if (muted) {
    wantPlayback = false;
    if (silentEl) { try { silentEl.pause(); } catch (e) { /* ignore */ } playbackReady = false; }
  }
  if (persist) { try { localStorage.setItem(CONFIG.muteKey, muted ? '1' : '0'); } catch (e) { /* ignore */ } }
}
export function toggleMute() { setMuted(!muted); return muted; }
// The player asked for sound: unmute and play even if the phone is on silent.
export function enableSound(persist = true) {
  wantPlayback = true;
  setMuted(false, persist);
  unlock();
}

function tone(freq, dur, type = 'square', vol = 0.12, slideTo = null, delay = 0) {
  if (!ac || muted) return;
  const t0 = ac.currentTime + delay;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g).connect(ac.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}

function noise(dur, vol = 0.1, delay = 0, lowpass = 1200) {
  if (!ac || muted) return;
  const t0 = ac.currentTime + delay;
  const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(); src.buffer = buf;
  const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lowpass;
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  src.connect(f).connect(g).connect(ac.destination);
  src.start(t0);
}

export const sfx = {
  move() { tone(520, 0.05, 'square', 0.06); },
  select() { tone(660, 0.08, 'square', 0.08); tone(990, 0.12, 'square', 0.08, null, 0.08); },
  jump() { tone(300, 0.18, 'square', 0.08, 700); },
  hit() { tone(220, 0.25, 'sawtooth', 0.12, 60); noise(0.2, 0.08); },
  die() { tone(400, 0.6, 'sawtooth', 0.1, 50); tone(300, 0.8, 'square', 0.06, 40, 0.2); },
  door() { noise(0.9, 0.06, 0, 400); tone(90, 0.9, 'sawtooth', 0.05, 60); },
  scream() { tone(880, 0.9, 'sawtooth', 0.07, 240); tone(1320, 0.7, 'square', 0.03, 300, 0.05); noise(0.5, 0.03, 0, 3000); },
  correct() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, 'square', 0.08, null, i * 0.09)); },
  wrong() { tone(200, 0.3, 'square', 0.1, 120); tone(150, 0.5, 'square', 0.1, 70, 0.25); },
  swarm() { for (let i = 0; i < 6; i++) tone(500 + i * 90, 0.5, 'sine', 0.03, 200 + i * 40, i * 0.12); },
  sunrise() { [392, 494, 587, 784, 988].forEach((f, i) => tone(f, 1.2, 'triangle', 0.07, null, i * 0.25)); },
  bell() { tone(1200, 0.4, 'sine', 0.05, 900); }
};
