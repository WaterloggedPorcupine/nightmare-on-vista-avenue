import { W, H, GROUND_Y, input, text, sprite, aabb, clamp, rng, panel, blink, clock, PAL } from '../engine.js';
import { CONFIG } from '../config.js';
import { SPR, drawTombstone, drawTree, drawFence, drawDoor } from '../sprites.js';
import { sfx } from '../audio.js';

const TYPES = ['skeleton', 'pumpkin', 'ghost', 'spider'];

export class LevelScene {
  constructor(game, idx) {
    this.game = game; this.idx = idx; this.cfg = CONFIG.levels[idx];
  }
  enter() {
    this.lives = CONFIG.lives;
    this.game.bg.screamEnabled = true;
    this.restart();
  }
  restart() {
    this.build();
    this.p = { x: 16, y: GROUND_Y - 20, vx: 0, vy: 0, onGround: true, ducking: false, facing: 1, anim: 0, inv: 0, alpha: 1 };
    this.camX = 0; this.state = 'intro'; this.timer = 0; this.shake = 0;
    this.door.open = 0;
  }
  build() {
    const L = this.cfg; const r = rng(L.seed);
    this.length = L.length;
    this.door = { x: L.length - 70, open: 0 };
    this.decor = [];
    let x = 30;
    while (x < L.length - 110) {
      const k = r();
      if (k < 0.62) this.decor.push({ k: 'stone', x, t: Math.floor(r() * 4) });
      else if (k < 0.82) this.decor.push({ k: 'tree', x, s: 0.7 + r() * 0.5 });
      else this.decor.push({ k: 'fence', x, w: 30 + Math.floor(r() * 30) });
      x += 40 + r() * 70;
    }
    // Each hazard owns a zone of ground it can move through. Zones never overlap,
    // and a clear gap between them guarantees a safe spot to land, duck or wait.
    this.hazards = [];
    let cursor = 240, last = -1;
    for (;;) {
      let ti = Math.floor(r() * 4); if (ti === last) ti = (ti + 1) % 4; last = ti;
      const type = TYPES[ti];
      const z = this.zone(type);
      const sx = cursor + z.left;
      if (sx + z.right > L.length - 170) break;
      this.hazards.push(this.makeHazard(type, sx, r));
      cursor = sx + z.right + L.clear[0] + r() * (L.clear[1] - L.clear[0]);
    }
  }
  // How far a hazard can travel left / right of its spawn point.
  zone(type) {
    const L = this.cfg;
    switch (type) {
      case 'skeleton': return { left: 34, right: 34 + 12 };
      case 'ghost': return { left: L.ghostSweep, right: L.ghostSweep + 12 };
      case 'pumpkin': return { left: L.pumpkinRoll, right: 12 };
      default: return { left: 4, right: 14 };
    }
  }
  makeHazard(type, x, r) {
    const sp = this.cfg.speeds;
    switch (type) {
      case 'skeleton': return { type, x, sx: x, y: GROUND_Y - 18, w: 12, h: 18, dir: r() < 0.5 ? -1 : 1, speed: sp.skeleton, range: 34, anim: r() * 3 };
      case 'pumpkin': return { type, x, sx: x, y: GROUND_Y - 12, w: 12, h: 12, state: 'idle', speed: sp.pumpkin, rot: 0, timer: 0, bob: r() * 6, alpha: 1, active: true };
      case 'ghost': {
        // Ghosts start partway through a rest so they don't all fly in sync.
        const g = { type, x: x + this.cfg.ghostSweep, sx: x, y: GROUND_Y - 25, w: 12, h: 12, phase: r() * 6.28, sweep: this.cfg.ghostSweep, speed: sp.ghost, amp: this.cfg.ghostAmp, alpha: 0, active: false, state: 'rest', timer: r() * this.restTime(r), rand: r };
        return g;
      }
      default: return { type, x, sx: x, y: 8, w: 10, h: 8, state: 'wait', speed: sp.spider, timer: 0 };
    }
  }

  restTime(r = Math.random) {
    const [a, b] = this.cfg.ghostRest;
    return a + r() * (b - a);
  }

  // ----- update -----
  update(dt) {
    this.game.bg.update(dt);
    if (this.shake > 0) this.shake -= dt;
    const p = this.p;
    switch (this.state) {
      case 'intro':
        this.timer += dt;
        if (this.timer > 1.8 || input.justPressed('confirm')) { this.state = 'play'; this.timer = 0; }
        break;
      case 'play': this.updatePlay(dt); break;
      case 'dying':
        this.timer += dt;
        p.vy += CONFIG.player.gravity * dt; p.y += p.vy * dt; p.x += p.vx * dt;
        if (this.timer > 1.3) { this.state = 'dead'; this.timer = 0; }
        break;
      case 'dead':
        this.timer += dt;
        if (this.timer > 2.6 || (this.timer > 0.7 && input.justPressed('confirm'))) { this.lives = CONFIG.lives; this.restart(); }
        break;
      case 'door':
        this.timer += dt;
        this.door.open = clamp(this.timer / 1.0, 0, 1);
        if (this.timer > 0.9) {
          p.x += 28 * dt; p.anim += dt * 10; p.facing = 1;
          p.alpha = clamp(1 - (this.timer - 1.0) / 0.8, 0, 1);
        }
        if (this.timer > 2.1) {
          const K = CONFIG.keeperIntro, name = this.game.name || 'TRAVELER';
          this.game.go('invite', { title: K.title.replace('{name}', name), paragraphs: K.paragraphs, next: 'question', nextArgs: [0], scream: false });
        }
        break;
    }
    if (input.justPressed('back')) this.game.go('menu');
  }

  updatePlay(dt) {
    const P = CONFIG.player, p = this.p;
    p.ducking = p.onGround && input.isDown('down');
    let move = 0;
    if (!p.ducking) { if (input.isDown('right')) move = 1; if (input.isDown('left')) move = -1; }
    p.vx = move * P.speed;
    if (move) p.facing = move;
    if (input.justPressed('up') && p.onGround && !p.ducking) { p.vy = -P.jump; p.onGround = false; sfx.jump(); }
    p.vy += P.gravity * dt;
    p.y += p.vy * dt; p.x += p.vx * dt;
    if (p.y + 20 >= GROUND_Y) { p.y = GROUND_Y - 20; p.vy = 0; p.onGround = true; } else p.onGround = false;
    p.x = clamp(p.x, 0, this.length - 12);
    p.anim += dt * (move ? 9 : 0);
    if (p.inv > 0) p.inv -= dt;
    this.camX = clamp(p.x - CONFIG.cameraLead, 0, this.length - W);

    for (const h of this.hazards) this.updateHazard(h, dt);

    if (p.inv <= 0) {
      const box = this.playerBox();
      for (const h of this.hazards) {
        if (h.active === false) continue;
        if (aabb(box, { x: h.x + 1, y: h.y + 1, w: h.w - 2, h: h.h - 2 })) { this.hit(); break; }
      }
    }
    if (p.x + 8 >= this.door.x + 10) { this.state = 'door'; this.timer = 0; p.vx = 0; sfx.door(); }
  }

  playerBox() {
    const p = this.p;
    return p.ducking ? { x: p.x + 2, y: p.y + 12, w: 8, h: 8 } : { x: p.x + 2, y: p.y, w: 8, h: 20 };
  }

  updateHazard(h, dt) {
    const p = this.p;
    switch (h.type) {
      case 'skeleton':
        h.x += h.dir * h.speed * dt; h.anim += dt;
        if (h.x > h.sx + h.range) h.dir = -1;
        if (h.x < h.sx - h.range) h.dir = 1;
        break;
      case 'pumpkin': {
        // idle -> windup (visible wobble) -> roll -> gone (invisible cooldown) -> idle
        const L = this.cfg;
        const fullyOnScreen = h.sx + h.w <= this.camX + W && h.sx >= this.camX;
        const inRollZone = p.x + 12 > h.sx - L.pumpkinRoll - 4 && p.x < h.sx + h.w;
        if (h.state === 'idle') {
          h.bob += dt;
          if (fullyOnScreen && p.x + 12 < h.sx && !inRollZone) { h.state = 'windup'; h.timer = L.pumpkinWindup; }
        } else if (h.state === 'windup') {
          h.timer -= dt;
          if (h.timer <= 0) h.state = 'roll';
        } else if (h.state === 'roll') {
          h.x -= h.speed * dt; h.rot -= (h.speed / 6) * dt;
          // rolls to the edge of its zone, then vanishes and later reappears on its patch
          if (h.x < h.sx - L.pumpkinRoll) { h.state = 'gone'; h.timer = L.pumpkinCooldown; h.active = false; h.alpha = 0; }
        } else if (h.state === 'gone') {
          h.timer -= dt;
          // never reappear on top of the player
          if (h.timer <= 0 && Math.abs((p.x + 6) - (h.sx + 6)) > 28) {
            h.state = 'idle'; h.x = h.sx; h.rot = 0; h.alpha = 0; h.active = true;
          }
        }
        if (h.state !== 'gone' && h.alpha < 1) h.alpha = Math.min(1, h.alpha + dt * 4);
        break;
      }
      case 'ghost': {
        // rest (invisible, harmless) -> pass (fades in, flies left, fades out) -> rest
        if (h.state === 'rest') {
          h.timer -= dt; h.alpha = 0; h.active = false;
          if (h.timer <= 0) { h.state = 'pass'; h.x = h.sx + h.sweep; }
        } else {
          h.x -= h.speed * dt;
          const u = clamp((h.sx + h.sweep - h.x) / (h.sweep * 2), 0, 1);
          h.alpha = clamp(Math.min(u, 1 - u) * 6, 0, 1);
          h.active = h.alpha > 0.6;
          if (u >= 1) { h.state = 'rest'; h.timer = this.restTime(); h.alpha = 0; h.active = false; }
        }
        h.y = GROUND_Y - 25 + Math.sin(clock.t * 3 + h.phase) * h.amp;
        break;
      }
      case 'spider':
        if (h.state === 'wait') {
          if (h.timer > 0) h.timer -= dt;
          else if (Math.abs((p.x + 6) - (h.x + 5)) < this.cfg.spiderTrigger) h.state = 'drop';
        } else if (h.state === 'drop') {
          h.y += h.speed * dt;
          if (h.y >= GROUND_Y - 8) { h.y = GROUND_Y - 8; h.state = 'hold'; h.timer = 0.5; }
        } else if (h.state === 'hold') {
          h.timer -= dt; if (h.timer <= 0) h.state = 'climb';
        } else {
          h.y -= h.speed * 0.5 * dt;
          if (h.y <= 8) { h.y = 8; h.state = 'wait'; h.timer = 1.0; }
        }
        break;
    }
  }

  hit() {
    const p = this.p;
    this.lives--;
    this.shake = 0.3;
    if (this.lives <= 0) {
      this.state = 'dying'; this.timer = 0;
      p.vy = -160; p.vx = -p.facing * 40; p.inv = 0;
      sfx.die();
      return;
    }
    sfx.hit();
    p.inv = 1.6; p.vy = -130; p.onGround = false; p.x -= p.facing * 6;
  }

  // ----- draw -----
  draw(c) {
    const bg = this.game.bg, p = this.p, cam = Math.round(this.camX);
    const sx = this.shake > 0 ? Math.round((Math.random() - 0.5) * 4) : 0;
    bg.drawSky(c, 0);
    bg.drawHills(c, this.camX, 0);
    c.save(); c.translate(-cam + sx, 0);

    for (const d of this.decor) {
      if (d.x + 60 < cam || d.x > cam + W + 10) continue;
      if (d.k === 'stone') drawTombstone(c, d.x, GROUND_Y, d.t);
      else if (d.k === 'tree') drawTree(c, d.x, GROUND_Y, d.s);
      else drawFence(c, d.x, GROUND_Y, d.w);
    }
    drawDoor(c, this.door.x, GROUND_Y, this.door.open, this.door.open);

    for (const h of this.hazards) {
      if (h.x + 20 < cam || h.x > cam + W + 10) continue;
      switch (h.type) {
        case 'skeleton': sprite(c, SPR.skeleton[Math.floor(h.anim * 4) % 2], h.x, h.y, h.dir < 0); break;
        case 'pumpkin':
          if (h.state === 'gone') break;
          if (h.state === 'roll' || h.state === 'windup') {
            const rot = h.state === 'roll' ? h.rot : Math.sin(clock.t * 28) * 0.3;
            const hop = h.state === 'windup' ? -Math.abs(Math.round(Math.sin(clock.t * 14) * 1.5)) : 0;
            c.save(); c.globalAlpha = h.alpha; c.translate(Math.round(h.x) + 6, Math.round(h.y) + 6 + hop); c.rotate(rot); c.drawImage(SPR.pumpkin, -6, -6); c.restore();
          } else sprite(c, SPR.pumpkin, h.x, h.y + Math.round(Math.sin(h.bob * 4) * 0.5), false, h.alpha);
          break;
        case 'ghost': if (h.alpha > 0) sprite(c, SPR.ghost[Math.floor(clock.t * 4) % 2], h.x, h.y, false, h.alpha * 0.95); break;
        case 'spider':
          c.fillStyle = 'rgba(201,196,184,0.7)'; c.fillRect(Math.round(h.x) + 4, 0, 1, Math.round(h.y) + 2);
          sprite(c, SPR.spider, h.x, h.y);
          break;
      }
    }

    // player
    const flicker = p.inv > 0 && Math.floor(clock.t * 20) % 2 === 0;
    if (!flicker && this.state !== 'dead') {
      let img, dy = 0;
      if (this.state === 'dying') { img = SPR.player.jump; dy = 3; }
      else if (!p.onGround) { img = SPR.player.jump; dy = 3; }
      else if (p.ducking) { img = SPR.player.duck; dy = 9; }
      else if (Math.abs(p.vx) > 0 || this.state === 'door') img = SPR.player.run[Math.floor(p.anim) % 2];
      else img = SPR.player.idle;
      if (this.state === 'dying') {
        c.save(); c.translate(Math.round(p.x) + 6, Math.round(p.y) + 10); c.rotate(Math.min(Math.PI, this.timer * 4)); c.globalAlpha = clamp(1.6 - this.timer, 0, 1);
        c.drawImage(img, -6, -10); c.restore();
      } else {
        sprite(c, img, p.x, p.y + dy, p.facing < 0, p.alpha);
      }
    }
    c.restore();

    bg.drawFog(c, this.camX, 0.85);
    this.drawHUD(c);
    bg.drawScream(c);

    if (this.state === 'intro') {
      const a = this.timer < 1.3 ? 1 : clamp(1 - (this.timer - 1.3) / 0.5, 0, 1);
      c.globalAlpha = a;
      panel(c, 50, 58, 220, 48);
      text(c, this.cfg.name, W / 2, 68, { align: 'center', size: 16, color: PAL.red, shadow: PAL.blood });
      text(c, 'REACH THE CASTLE DOOR', W / 2, 90, { align: 'center', color: PAL.gold, shadow: PAL.ink });
      c.globalAlpha = 1;
    }
    if (this.state === 'dead') {
      c.fillStyle = 'rgba(5,4,16,0.65)'; c.fillRect(0, 0, W, H);
      text(c, 'YOU DIED', W / 2, 56, { align: 'center', size: 16, color: PAL.red, shadow: PAL.blood });
      text(c, 'THE GRAVEYARD CLAIMS ' + this.game.name, W / 2, 86, { align: 'center', color: PAL.grey, shadow: PAL.ink });
      if (this.timer > 0.7 && blink()) text(c, 'PRESS ENTER TO TRY AGAIN', W / 2, 110, { align: 'center', color: PAL.bone, shadow: PAL.ink });
    }
  }

  drawHUD(c) {
    for (let i = 0; i < CONFIG.lives; i++) sprite(c, i < this.lives ? SPR.heart : SPR.heartEmpty, 5 + i * 9, 5);
    text(c, this.cfg.name, W - 4, 5, { align: 'right', color: PAL.grey, shadow: PAL.ink });
    if (this.game.name) text(c, this.game.name, W / 2, 5, { align: 'center', color: PAL.teal, shadow: PAL.ink });
    // progress bar
    const prog = clamp(this.p.x / this.door.x, 0, 1);
    c.fillStyle = PAL.slate; c.fillRect(W / 2 - 40, 15, 80, 2);
    c.fillStyle = PAL.purple; c.fillRect(W / 2 - 40, 15, Math.round(80 * prog), 2);
  }
}
