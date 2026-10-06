// Shared graveyard backdrop: sky, stars, moon, clouds, hills, ground, rolling fog, and the sky-scream.
import { W, H, GROUND_Y, PAL, rng, lerp, clamp, text } from './engine.js';
import { CONFIG } from './config.js';
import { drawMoon, drawSun, drawTombstone, drawTree, drawFence } from './sprites.js';

const NIGHT = { top: [11, 10, 26], mid: [29, 27, 58], bot: [58, 36, 90] };
const DAWN = { top: [78, 92, 160], mid: [224, 137, 160], bot: [255, 190, 90] };
const mix = (a, b, t) => `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;

export class Graveyard {
  constructor(seed = 3) {
    const r = rng(seed);
    this.t = 0;
    this.stars = Array.from({ length: 70 }, () => ({ x: r() * W, y: r() * 95, p: r() * 6.28, s: r() < 0.15 ? 2 : 1 }));
    this.clouds = Array.from({ length: 4 }, (_, i) => ({ x: r() * W, y: 14 + r() * 40, w: 40 + r() * 50, v: 3 + r() * 4, a: 0.12 + r() * 0.12 }));
    this.fog = [
      { y: GROUND_Y - 6, h: 22, v: 11, a: 0.22, f1: 0.045, f2: 0.11, amp: 5, off: 0 },
      { y: GROUND_Y - 2, h: 18, v: -7, a: 0.17, f1: 0.03, f2: 0.09, amp: 7, off: 100 },
      { y: GROUND_Y + 4, h: 16, v: 16, a: 0.24, f1: 0.06, f2: 0.14, amp: 4, off: 50 }
    ];
    this.scream = { timer: CONFIG.screamInterval * 0.5, active: false, elapsed: 0, text: '', seed: 1, idx: 0 };
    this.screamEnabled = true;
    this.screamY = 26;
    this.onScream = null;
    // menu decor
    this.decor = [
      { k: 'tree', x: 48 }, { k: 'stone', x: 22, t: 0 }, { k: 'stone', x: 78, t: 1 }, { k: 'stone', x: 112, t: 2 },
      { k: 'fence', x: 130, w: 50 }, { k: 'stone', x: 196, t: 0 }, { k: 'stone', x: 230, t: 3 }, { k: 'stone', x: 258, t: 2 },
      { k: 'tree', x: 292, s: 0.8 }, { k: 'stone', x: 306, t: 1 }
    ];
  }

  update(dt) {
    this.t += dt;
    for (const f of this.fog) f.off += f.v * dt;
    for (const cl of this.clouds) { cl.x += cl.v * dt; if (cl.x - cl.w > W) cl.x = -cl.w; }
    const s = this.scream;
    if (!this.screamEnabled) return;
    if (s.active) {
      s.elapsed += dt;
      if (s.elapsed > s.text.length * 0.07 + 2.6) { s.active = false; s.timer = CONFIG.screamInterval; }
    } else {
      s.timer -= dt;
      if (s.timer <= 0) this.triggerScream();
    }
  }

  triggerScream() {
    const s = this.scream;
    s.active = true; s.elapsed = 0;
    s.text = CONFIG.screams[s.idx % CONFIG.screams.length]; s.idx++;
    s.seed = Math.floor(Math.random() * 1e6) + 1;
    if (this.onScream) this.onScream();
  }

  // dawn: 0 = night, 1 = full sunrise
  drawSky(c, dawn = 0) {
    const g = c.createLinearGradient(0, 0, 0, GROUND_Y + 10);
    g.addColorStop(0, mix(NIGHT.top, DAWN.top, dawn));
    g.addColorStop(0.55, mix(NIGHT.mid, DAWN.mid, dawn));
    g.addColorStop(1, mix(NIGHT.bot, DAWN.bot, dawn));
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // stars
    const sa = 1 - clamp(dawn * 1.6, 0, 1);
    if (sa > 0) {
      for (const st of this.stars) {
        const tw = 0.55 + 0.45 * Math.sin(this.t * 2 + st.p);
        c.fillStyle = `rgba(244,241,232,${(tw * sa).toFixed(2)})`;
        c.fillRect(Math.round(st.x), Math.round(st.y), st.s, st.s);
      }
    }
    // moon drifts down and sun rises as dawn comes
    if (dawn < 1) drawMoon(c, 286, 30 + dawn * 60, 15, dawn);
    if (dawn > 0) drawSun(c, 36, GROUND_Y - 10 - dawn * 70, 14);
    // clouds
    for (const cl of this.clouds) {
      c.fillStyle = `rgba(120,110,170,${cl.a + dawn * 0.3})`;
      c.fillRect(Math.round(cl.x), Math.round(cl.y), Math.round(cl.w), 4);
      c.fillRect(Math.round(cl.x + 8), Math.round(cl.y - 3), Math.round(cl.w * 0.6), 3);
      c.fillRect(Math.round(cl.x + 4), Math.round(cl.y + 4), Math.round(cl.w * 0.8), 2);
    }
  }

  // Far hills with parallax. camX in world px.
  drawHills(c, camX = 0, dawn = 0) {
    const px = camX * 0.3;
    c.fillStyle = dawn > 0 ? mix([22, 16, 44], [90, 60, 110], dawn) : '#16103a';
    for (let i = -1; i < 7; i++) {
      const bx = i * 70 - (px % 70);
      c.beginPath(); c.arc(bx + 35, GROUND_Y + 10, 42, Math.PI, 0); c.fill();
    }
    c.fillStyle = dawn > 0 ? mix([15, 11, 30], [70, 50, 90], dawn) : '#0f0b22';
    const px2 = camX * 0.55;
    for (let i = -1; i < 6; i++) {
      const bx = i * 95 - (px2 % 95);
      c.beginPath(); c.arc(bx + 50, GROUND_Y + 18, 50, Math.PI, 0); c.fill();
    }
    // ground
    c.fillStyle = dawn > 0 ? mix([13, 10, 26], [50, 60, 40], dawn) : '#0d0a1a';
    c.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    c.fillStyle = dawn > 0 ? mix([36, 26, 61], [80, 110, 60], dawn) : '#241a3d';
    c.fillRect(0, GROUND_Y, W, 2);
    // grass tufts (world-locked)
    c.fillStyle = dawn > 0 ? mix([42, 32, 72], [96, 130, 70], dawn) : '#2a2048';
    for (let gx = -(camX % 17); gx < W; gx += 17) { c.fillRect(gx, GROUND_Y - 2, 1, 2); c.fillRect(gx + 6, GROUND_Y - 1, 1, 1); }
  }

  drawMenuDecor(c) {
    for (const d of this.decor) {
      if (d.k === 'tree') drawTree(c, d.x, GROUND_Y, d.s || 1);
      else if (d.k === 'stone') drawTombstone(c, d.x, GROUND_Y, d.t);
      else if (d.k === 'fence') drawFence(c, d.x, GROUND_Y, d.w);
    }
  }

  drawFog(c, camX = 0, intensity = 1) {
    for (const f of this.fog) {
      const a = f.a * intensity;
      if (a <= 0) continue;
      const shift = f.off - camX * 1.15;
      for (let pass = 0; pass < 2; pass++) {
        c.fillStyle = `rgba(190,180,220,${(pass === 0 ? a : a * 0.5).toFixed(3)})`;
        const extra = pass === 0 ? 0 : 5;
        for (let x = 0; x < W; x += 2) {
          const wx = x + shift;
          const hgt = f.amp * Math.sin(wx * f.f1) + (f.amp * 0.6) * Math.sin(wx * f.f2 + 1.7) + extra;
          const top = Math.round(f.y - hgt);
          c.fillRect(x, top, 2, f.h + Math.round(hgt));
        }
      }
    }
  }

  drawScream(c) {
    const s = this.scream;
    if (!s.active) return;
    const r = rng(s.seed);
    const n = s.text.length, size = 16, step = 15;
    const totalW = n * step;
    const x0 = Math.round((W - totalW) / 2) + 2;
    const baseY = this.screamY + r() * 12;
    const appearEnd = n * 0.07, hold = 1.6;
    const jit = Math.floor(s.elapsed * 12);
    for (let i = 0; i < n; i++) {
      const dy = (r() - 0.5) * 18, rot = (r() - 0.5) * 0.5, shear = (r() - 0.5) * 0.5;
      if (s.elapsed < i * 0.07) break;
      let alpha = 1;
      if (s.elapsed > appearEnd + hold) alpha = clamp(1 - (s.elapsed - appearEnd - hold) / 1.0, 0, 1);
      const jr = rng(s.seed + jit * 31 + i);
      const jx = Math.round((jr() - 0.5) * 2), jy = Math.round((jr() - 0.5) * 2);
      c.save();
      c.globalAlpha = alpha;
      c.translate(x0 + i * step + 8 + jx, baseY + dy + 8 + jy);
      c.rotate(rot);
      c.transform(1, 0, shear, 1, 0, 0);
      c.font = size + 'px "Press Start 2P", monospace';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = PAL.blood; c.fillText(s.text[i], 2, 2);
      c.fillStyle = PAL.red; c.fillText(s.text[i], 1, 1);
      c.fillStyle = PAL.bone; c.fillText(s.text[i], 0, 0);
      c.restore();
    }
  }

  // Convenience: the full menu backdrop
  drawMenuScene(c, opts = {}) {
    this.drawSky(c, 0);
    this.drawHills(c, 0, 0);
    this.drawMenuDecor(c);
    this.drawFog(c, 0, 1);
    if (opts.scream !== false) this.drawScream(c);
  }
}
