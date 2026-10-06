// Core: canvas, fixed-step loop, input, scene manager, text + panel helpers.
export const W = 320;
export const H = 180;
export const GROUND_Y = 150;

export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

export const PAL = {
  bone: '#f4f1e8', grey: '#c9c4b8', stone: '#6e6a78', slate: '#3b3747', ink: '#14121c',
  purple: '#9D89E0', plum: '#5b4a9a', orange: '#f08a2a', rust: '#b85a16', gold: '#ffd75e',
  red: '#c62f2f', blood: '#7a1a1a', skin: '#d9a066', wood: '#6b3f2a', bark: '#3f2418',
  navy: '#1d1b3a', ghoul: '#8ee0a0', teal: '#89E0C9', pink: '#E089A0', green: '#4f8a3a'
};

// ---------- input ----------
const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up', Space: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  Enter: 'confirm', NumpadEnter: 'confirm', KeyZ: 'confirm', KeyX: 'confirm',
  Escape: 'back', KeyM: 'mute'
};

class Input {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();
    this.anyPressed = false;
    this.locked = false; // true while a DOM input owns the keyboard
    window.addEventListener('keydown', (e) => {
      if (this.locked) return;
      const k = KEYMAP[e.code];
      if (k) e.preventDefault();
      if (e.repeat) return;
      this.anyPressed = true;
      if (!k) return;
      this.down.add(k); this.pressed.add(k);
    });
    window.addEventListener('keyup', (e) => {
      const k = KEYMAP[e.code];
      if (k) this.down.delete(k);
    });
    window.addEventListener('blur', () => this.down.clear());
  }
  press(k) { this.down.add(k); this.pressed.add(k); this.anyPressed = true; }
  release(k) { this.down.delete(k); }
  isDown(k) { return this.down.has(k); }
  justPressed(k) { return this.pressed.has(k); }
  endFrame() { this.pressed.clear(); this.anyPressed = false; }
}
export const input = new Input();

// ---------- scene manager + loop ----------
let current = null;
export function setScene(scene) {
  if (current && current.exit) current.exit();
  current = scene;
  if (scene.enter) scene.enter();
}

export function currentScene() { return current; }

export const clock = { t: 0 };
const STEP = 1 / 60;
let last = 0, acc = 0;
function frame(now) {
  if (!last) last = now;
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now; acc += dt;
  while (acc >= STEP) {
    clock.t += STEP;
    if (current) current.update(STEP);
    input.endFrame();
    acc -= STEP;
  }
  if (current) current.draw(ctx);
  requestAnimationFrame(frame);
}
export function start() { requestAnimationFrame(frame); }

// Advance the simulation by n fixed steps and draw once (used for scripted testing).
export function step(n = 1, draw = true) {
  for (let i = 0; i < n; i++) { clock.t += STEP; if (current) current.update(STEP); input.endFrame(); }
  if (draw && current) current.draw(ctx);
}

// ---------- helpers ----------
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;

export function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export function text(c, str, x, y, o = {}) {
  const size = o.size || 8;
  c.font = size + 'px "Press Start 2P", monospace';
  c.textAlign = o.align || 'left';
  c.textBaseline = 'top';
  if (o.alpha != null) c.globalAlpha = o.alpha;
  const off = Math.max(1, Math.round(size / 8));
  if (o.shadow) { c.fillStyle = o.shadow; c.fillText(str, x + off, y + off); }
  c.fillStyle = o.color || PAL.bone;
  c.fillText(str, x, y);
  if (o.alpha != null) c.globalAlpha = 1;
}

export function wrap(str, maxChars) {
  const words = str.split(' '); const lines = []; let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxChars) { lines.push(line.trim()); line = w; }
    else line = line + ' ' + w;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

// Pixel-art board / dialog panel
export function panel(c, x, y, w, h, o = {}) {
  const fill = o.fill || '#15122a', edge = o.edge || PAL.purple, inner = o.inner || PAL.plum;
  c.fillStyle = edge; c.fillRect(x + 1, y, w - 2, h); c.fillRect(x, y + 1, w, h - 2);
  c.fillStyle = inner; c.fillRect(x + 2, y + 2, w - 4, h - 4);
  c.fillStyle = fill; c.fillRect(x + 3, y + 3, w - 6, h - 6);
  c.fillStyle = PAL.bone;
  c.fillRect(x + 2, y + 2, 1, 1); c.fillRect(x + w - 3, y + 2, 1, 1);
  c.fillRect(x + 2, y + h - 3, 1, 1); c.fillRect(x + w - 3, y + h - 3, 1, 1);
}

export function blink(period = 0.9) { return (clock.t % period) < period * 0.6; }

// Draw a baked sprite, optionally flipped horizontally
export function sprite(c, img, x, y, flip = false, alpha = 1) {
  if (alpha !== 1) c.globalAlpha = alpha;
  if (flip) {
    c.save(); c.translate(Math.round(x) + img.width, Math.round(y)); c.scale(-1, 1);
    c.drawImage(img, 0, 0); c.restore();
  } else {
    c.drawImage(img, Math.round(x), Math.round(y));
  }
  if (alpha !== 1) c.globalAlpha = 1;
}

export function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Index of the rectangle {x, y, w, h} containing the point, or -1.
export function hitIndex(rects, x, y) {
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (r && x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return i;
  }
  return -1;
}
