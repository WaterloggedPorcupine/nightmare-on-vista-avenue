// After the birthday question.
// Wrong answer: ghost swarm, tombstone, "didn't make it" text, then Resurrect or Rest in peace.
// Right answer: ghost swarm, sunrise scares them away, "you made it", then on to the RSVP.
import { W, GROUND_Y, input, text, panel, wrap, sprite, clamp, blink, clock, hitIndex, PAL } from '../engine.js';
import { CONFIG } from '../config.js';
import { SPR, drawTombstone, drawTree, drawDoor } from '../sprites.js';
import { sfx } from '../audio.js';

const LOSE_OPTIONS = ['RESURRECT', 'REST IN PEACE'];

export class EndingScene {
  constructor(game, won) { this.game = game; this.won = !!won; }
  enter() {
    this.game.bg.screamEnabled = false;
    this.state = 'swarm'; this.timer = 0; this.dawn = 0; this.t = 0; this.cursor = 0;
    this.px = 150; this.py = GROUND_Y - 20;
    this.cx = this.px + 6; this.cy = GROUND_Y - 12;
    this.ghosts = Array.from({ length: 26 }, (_, i) => {
      const a = (i / 26) * Math.PI * 2 + Math.random() * 0.3;
      return { a, r: 190 + Math.random() * 60, spin: 1.6 + Math.random() * 1.4, alpha: 0, vx: 0, vy: 0, x: 0, y: 0, frame: Math.random() * 2 };
    });
    sfx.swarm();
  }
  exit() { this.game.bg.screamEnabled = true; }

  loseRects() {
    const widths = [104, 128], gap = 12;
    let x = Math.round((W - widths[0] - widths[1] - gap) / 2);
    return widths.map((w) => { const r = { x, y: 153, w, h: 17 }; x += w + gap; return r; });
  }
  chooseLose(i) {
    sfx.select();
    if (i === 0) { this.state = 'rise'; this.timer = 0; sfx.sunrise(); }
    else this.game.go('title');
  }
  tap(x, y) {
    if (this.state === 'dead') {
      if (this.timer < 0.6) return true;
      const i = hitIndex(this.loseRects(), x, y);
      if (i >= 0) { this.cursor = i; this.chooseLose(i); }
      return true;
    }
    return this.state !== 'won';   // on the win screen a tap acts like OK
  }

  scatter(g, speed = 1) {
    if (!g.vx && !g.vy) { g.vx = Math.cos(g.a) * (90 + Math.random() * 80) * speed; g.vy = (-60 - Math.random() * 90) * speed; }
  }

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
        if (this.timer > 2.6) { this.state = 'dead'; this.timer = 0; }
        break;

      case 'dead':
        for (const g of this.ghosts) {
          g.a += g.spin * 0.6 * dt; g.x = this.cx + Math.cos(g.a) * 52 - 6; g.y = this.cy - 44 + Math.sin(g.a) * 6;
          g.alpha = Math.max(g.alpha, 0.55);
        }
        if (this.timer < 0.6) break;   // don't let a held Enter skip the death screen
        if (input.justPressed('up') || input.justPressed('left')) { this.cursor = 0; sfx.move(); }
        if (input.justPressed('down') || input.justPressed('right')) { this.cursor = 1; sfx.move(); }
        if (input.justPressed('confirm')) this.chooseLose(this.cursor);
        break;

      case 'rise':
        // the tombstone cracks, the ghosts scatter, and the player climbs back out
        for (const g of this.ghosts) {
          if (this.timer > 0.5) { this.scatter(g, 1.3); g.x += g.vx * dt; g.y += g.vy * dt; g.alpha = clamp(g.alpha - dt * 0.9, 0, 1); }
        }
        if (this.timer > 2.0) this.game.go('question', CONFIG.questions.length - 1, { retry: true });
        break;

      case 'sunrise':
        this.dawn = clamp(this.timer / 3.6, 0, 1);
        for (const g of this.ghosts) {
          if (this.timer < 0.8) { g.a += g.spin * dt; g.r = 18; g.x = this.cx + Math.cos(g.a) * g.r - 6; g.y = this.cy + Math.sin(g.a) * g.r * 0.5 - 6; }
          else { this.scatter(g); g.x += g.vx * dt; g.y += g.vy * dt; g.alpha = clamp(g.alpha - dt * 0.6, 0, 1); }
        }
        if (this.timer > 4.4) { this.state = 'won'; this.timer = 0; }
        break;

      case 'won':
        this.dawn = clamp(this.dawn + dt * 0.2, 0, 1);
        for (const g of this.ghosts) { g.x += g.vx * dt; g.y += g.vy * dt; g.alpha = clamp(g.alpha - dt * 0.6, 0, 1); }
        if (this.timer > 0.6 && input.justPressed('confirm')) { sfx.select(); this.game.go('rsvp'); }
        break;
    }
  }

  drawGrave(c, x, name, crack = 0, alpha = 1) {
    const w = Math.max(44, name.length * 8 + 12), h = 34;
    const gx = Math.round(x - w / 2 + 6), gy = GROUND_Y - h;
    c.save(); c.globalAlpha = alpha;
    c.fillStyle = PAL.slate; c.fillRect(gx, gy + 6, w, h - 6);
    c.beginPath(); c.arc(gx + w / 2, gy + 6, w / 2, Math.PI, 0); c.fill();
    c.fillStyle = PAL.stone; c.fillRect(gx + 2, gy + 8, 1, h - 10);
    text(c, 'RIP', gx + w / 2, gy + 6, { align: 'center', color: PAL.ink });
    text(c, name, gx + w / 2, gy + 18, { align: 'center', color: PAL.ink });
    if (crack > 0) {
      // a zig-zag crack that grows down the stone
      c.fillStyle = PAL.ink;
      const steps = Math.floor(crack * 14);
      let cxp = gx + w / 2;
      for (let i = 0; i < steps; i++) { cxp += (i % 2 ? 2 : -2); c.fillRect(cxp, gy - 14 + i * 3, 2, 3); }
    }
    c.restore();
    c.fillStyle = '#1b1430'; c.fillRect(gx - 4, GROUND_Y - 1, w + 8, 1);
  }

  drawBigLines(c, str, y, color, shadow) {
    const rows = wrap(str.toUpperCase(), 18);
    rows.forEach((row, i) => text(c, row, W / 2, y + i * 18, { align: 'center', size: 16, color, shadow }));
    return y + rows.length * 18;
  }

  draw(c) {
    const bg = this.game.bg, dawn = this.dawn, name = this.game.name || 'YOU';
    bg.drawSky(c, dawn); bg.drawHills(c, 0, dawn);
    drawTree(c, 40, GROUND_Y, 1);
    drawTombstone(c, 86, GROUND_Y, 0); drawTombstone(c, 112, GROUND_Y, 2); drawTombstone(c, 200, GROUND_Y, 1); drawTombstone(c, 296, GROUND_Y, 3);
    drawDoor(c, 236, GROUND_Y, 1, 1 - dawn * 0.7);

    // player, tombstone, or the player rising out of it
    const graveUp = !this.won && ((this.state === 'death' && this.timer > 1.2) || this.state === 'dead');
    if (graveUp) {
      this.drawGrave(c, this.px, name);
    } else if (this.state === 'rise') {
      const crack = clamp(this.timer / 0.5, 0, 1);
      const fade = clamp(1 - (this.timer - 0.6) / 0.5, 0, 1);
      if (fade > 0) this.drawGrave(c, this.px, name, crack, fade);
      if (this.timer > 0.6) {
        const k = clamp((this.timer - 0.6) / 0.9, 0, 1);
        c.save(); c.beginPath(); c.rect(0, 0, W, GROUND_Y); c.clip();
        sprite(c, k >= 1 ? SPR.player.cheer : SPR.player.idle, this.px, this.py + Math.round((1 - k) * 20));
        c.restore();
      }
    } else {
      const flick = !this.won && this.state === 'death' && Math.floor(clock.t * 16) % 2 === 0;
      if (!flick) {
        const cheer = this.won && dawn > 0.45;
        const hop = cheer ? Math.abs(Math.round(Math.sin(this.t * 8) * 4)) : 0;
        sprite(c, cheer ? SPR.player.cheer : SPR.player.idle, this.px, this.py - hop);
      }
    }
    for (const g of this.ghosts) {
      if (g.alpha <= 0) continue;
      sprite(c, SPR.ghost[Math.floor((clock.t + g.frame) * 4) % 2], g.x, g.y, false, g.alpha);
    }
    bg.drawFog(c, 0, clamp(1 - dawn * 1.4, 0, 1));

    if (!this.won && (this.state === 'dead' || (this.state === 'death' && this.timer > 1.8))) {
      const after = this.drawBigLines(c, CONFIG.lose[0], 8, PAL.red, PAL.blood);
      text(c, CONFIG.lose[1].toUpperCase(), W / 2, after + 6, { align: 'center', color: PAL.grey, shadow: PAL.ink });
      if (this.state === 'dead' && this.timer > 0.6) this.drawLoseOptions(c);
    }
    if (this.won && (this.state === 'won' || (this.state === 'sunrise' && this.timer > 2.6))) {
      this.drawBigLines(c, CONFIG.win, 10, PAL.gold, PAL.rust);
      if (this.state === 'won' && this.timer > 0.6 && blink()) text(c, 'PRESS ENTER TO RSVP', W / 2, 162, { align: 'center', color: PAL.bone, shadow: PAL.ink });
    }
  }

  drawLoseOptions(c) {
    this.loseRects().forEach((r, i) => {
      const sel = i === this.cursor, y = r.y + 5;
      panel(c, r.x, r.y, r.w, r.h, { fill: sel ? '#241a44' : '#15122a', edge: sel ? PAL.gold : PAL.plum, inner: '#15122a' });
      text(c, LOSE_OPTIONS[i], r.x + r.w / 2, y, { align: 'center', color: sel ? PAL.gold : PAL.grey });
      if (sel) c.drawImage(SPR.heart, r.x - 9 + Math.round(Math.sin(clock.t * 6) * 1.5), y);
    });
  }
}
