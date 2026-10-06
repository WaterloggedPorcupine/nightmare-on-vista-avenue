import { W, H, GROUND_Y, input, text, sprite, clamp, blink, clock, PAL } from '../engine.js';
import { SPR, drawTombstone, drawTree, drawDoor } from '../sprites.js';
import { sfx } from '../audio.js';

export class EndingScene {
  constructor(game, won) { this.game = game; this.won = !!won; }
  enter() {
    this.game.bg.screamEnabled = false;
    this.state = 'swarm'; this.timer = 0; this.dawn = 0; this.t = 0;
    this.px = 150; this.py = GROUND_Y - 20;
    this.cx = this.px + 6; this.cy = GROUND_Y - 12;
    this.ghosts = Array.from({ length: 26 }, (_, i) => {
      const a = (i / 26) * Math.PI * 2 + Math.random() * 0.3;
      return { a, r: 190 + Math.random() * 60, spin: 1.6 + Math.random() * 1.4, alpha: 0, vx: 0, vy: 0, x: 0, y: 0, frame: Math.random() * 2 };
    });
    sfx.swarm();
  }
  exit() { this.game.bg.screamEnabled = true; }
  update(dt) {
    this.t += dt; this.timer += dt;
    this.game.bg.update(dt);
    if (input.justPressed('back')) { this.game.go('menu'); return; }
    switch (this.state) {
      case 'swarm':
        for (const g of this.ghosts) {
          g.r = Math.max(16, g.r - 95 * dt); g.a += g.spin * dt; g.alpha = clamp(g.alpha + dt * 1.5, 0, 0.95);
          g.x = this.cx + Math.cos(g.a) * g.r - 6; g.y = this.cy + Math.sin(g.a) * g.r * 0.5 - 6;
        }
        if (this.timer > 2.8) {
          this.timer = 0;
          if (this.won) { this.state = 'sunrise'; sfx.sunrise(); }
          else { this.state = 'death'; sfx.die(); }
        }
        break;
      case 'death':
        for (const g of this.ghosts) {
          g.a += g.spin * 1.6 * dt; g.r = 14 + Math.sin(this.t * 4 + g.a) * 4;
          g.x = this.cx + Math.cos(g.a) * g.r - 6; g.y = this.cy + Math.sin(g.a) * g.r * 0.5 - 6;
          if (this.timer > 1.6) g.alpha = clamp(g.alpha - dt * 0.4, 0.25, 1);
        }
        if (this.timer > 3.2 && this.state === 'death') this.state = 'end';
        break;
      case 'sunrise':
        this.dawn = clamp(this.timer / 3.6, 0, 1);
        for (const g of this.ghosts) {
          if (this.timer < 0.8) { g.a += g.spin * dt; g.r = 18; g.x = this.cx + Math.cos(g.a) * g.r - 6; g.y = this.cy + Math.sin(g.a) * g.r * 0.5 - 6; }
          else {
            if (!g.vx && !g.vy) { g.vx = Math.cos(g.a) * (90 + Math.random() * 80); g.vy = -60 - Math.random() * 90; }
            g.x += g.vx * dt; g.y += g.vy * dt; g.alpha = clamp(g.alpha - dt * 0.6, 0, 1);
          }
        }
        if (this.timer > 4.4) this.state = 'end';
        break;
      case 'end':
        if (this.won) this.dawn = clamp(this.dawn + dt * 0.2, 0, 1);
        for (const g of this.ghosts) {
          if (this.won) { g.x += g.vx * dt; g.y += g.vy * dt; g.alpha = clamp(g.alpha - dt * 0.6, 0, 1); }
          else { g.a += g.spin * 0.6 * dt; g.x = this.cx + Math.cos(g.a) * 52 - 6; g.y = this.cy - 44 + Math.sin(g.a) * 6; g.alpha = Math.max(g.alpha, 0.55); }
        }
        if (input.justPressed('confirm')) { sfx.select(); this.game.go('title'); }
        break;
    }
  }
  drawGrave(c, x, name) {
    const w = Math.max(44, name.length * 8 + 12), h = 34;
    const gx = Math.round(x - w / 2 + 6), gy = GROUND_Y - h;
    c.fillStyle = PAL.slate; c.fillRect(gx, gy + 6, w, h - 6);
    c.beginPath(); c.arc(gx + w / 2, gy + 6, w / 2, Math.PI, 0); c.fill();
    c.fillStyle = PAL.stone; c.fillRect(gx + 2, gy + 8, 1, h - 10);
    text(c, 'RIP', gx + w / 2, gy + 6, { align: 'center', color: PAL.ink });
    text(c, name, gx + w / 2, gy + 18, { align: 'center', color: PAL.ink });
    c.fillStyle = '#1b1430'; c.fillRect(gx - 4, GROUND_Y - 1, w + 8, 1);
  }
  draw(c) {
    const bg = this.game.bg, dawn = this.dawn;
    bg.drawSky(c, dawn); bg.drawHills(c, 0, dawn);
    drawTree(c, 40, GROUND_Y, 1);
    drawTombstone(c, 86, GROUND_Y, 0); drawTombstone(c, 112, GROUND_Y, 2); drawTombstone(c, 200, GROUND_Y, 1); drawTombstone(c, 296, GROUND_Y, 3);
    drawDoor(c, 236, GROUND_Y, 1, 1 - dawn * 0.7);

    // player
    const dead = !this.won && (this.state === 'death' && this.timer > 1.2 || this.state === 'end');
    if (dead) {
      this.drawGrave(c, this.px, this.game.name || 'YOU');
    } else {
      const flick = !this.won && this.state === 'death' && Math.floor(clock.t * 16) % 2 === 0;
      if (!flick) {
        const cheer = this.won && dawn > 0.45;
        const hop = cheer ? Math.abs(Math.round(Math.sin(this.t * 8) * 4)) : 0;
        sprite(c, cheer ? SPR.player.cheer : SPR.player.idle, this.px, this.py - hop);
      }
    }
    // ghosts
    for (const g of this.ghosts) {
      if (g.alpha <= 0) continue;
      sprite(c, SPR.ghost[Math.floor((clock.t + g.frame) * 4) % 2], g.x, g.y, false, g.alpha);
    }
    bg.drawFog(c, 0, clamp(1 - dawn * 1.4, 0, 1));

    if (this.state === 'end' || (this.won && this.state === 'sunrise' && this.timer > 2.6) || (!this.won && this.state === 'death' && this.timer > 2.0)) {
      const name = this.game.name || 'YOU';
      if (this.won) {
        text(c, name, W / 2, 12, { align: 'center', size: 16, color: PAL.bone, shadow: PAL.rust });
        text(c, 'SURVIVED UNTIL', W / 2, 32, { align: 'center', size: 16, color: PAL.gold, shadow: PAL.rust });
        text(c, 'MORNING!', W / 2, 52, { align: 'center', size: 16, color: PAL.gold, shadow: PAL.rust });
        text(c, 'HAPPY HALLOWEEN', W / 2, 76, { align: 'center', color: PAL.ink, shadow: PAL.bone });
      } else {
        text(c, name, W / 2, 12, { align: 'center', size: 16, color: PAL.bone, shadow: PAL.ink });
        text(c, 'NEVER SAW', W / 2, 32, { align: 'center', size: 16, color: PAL.red, shadow: PAL.blood });
        text(c, 'THE MORNING', W / 2, 52, { align: 'center', size: 16, color: PAL.red, shadow: PAL.blood });
        text(c, 'REST IN PIECES', W / 2, 76, { align: 'center', color: PAL.grey, shadow: PAL.ink });
      }
      if (this.state === 'end' && blink()) text(c, 'PRESS ENTER TO PLAY AGAIN', W / 2, 162, { align: 'center', color: PAL.bone, shadow: PAL.ink });
    }
  }
}
