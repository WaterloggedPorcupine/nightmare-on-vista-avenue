// Tiny Web Audio synth. No files, just oscillators and noise.
import { CONFIG } from './config.js';

let ac = null;
let muted = false;
try { muted = localStorage.getItem(CONFIG.muteKey) === '1'; } catch (e) { /* ignore */ }

export function unlock() {
  try {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
  } catch (e) { ac = null; }
}
export function isMuted() { return muted; }
export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem(CONFIG.muteKey, muted ? '1' : '0'); } catch (e) { /* ignore */ }
  return muted;
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
