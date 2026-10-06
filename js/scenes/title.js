import { W, input, text, sprite, blink, clock, PAL } from '../engine.js';
import { SPR } from '../sprites.js';
import { sfx } from '../audio.js';

export class TitleScene {
  constructor(game) { this.game = game; this.t = 0; this.bats = []; }
  enter() {
    this.game.bg.screamEnabled = true; this.game.bg.screamY = 20;
    this.bats = Array.from({ length: 5 }, (_, i) => ({ x: -20 - i * 60, y: 20 + Math.random() * 50, v: 28 + Math.random() * 20, p: Math.random() * 6 }));
  }
  update(dt) {
    this.t += dt;
    this.game.bg.update(dt);
    for (const b of this.bats) { b.x += b.v * dt; b.y += Math.sin(this.t * 6 + b.p) * 12 * dt; if (b.x > W + 20) { b.x = -30; b.y = 15 + Math.random() * 60; } }
    if (input.anyPressed || input.justPressed('confirm')) { sfx.select(); this.game.go('menu'); }
  }
  draw(c) {
    const bg = this.game.bg;
    bg.drawSky(c, 0);
    for (const b of this.bats) sprite(c, SPR.bat, b.x, b.y);
    bg.drawHills(c, 0, 0);
    bg.drawMenuDecor(c);
    bg.drawFog(c, 0, 1);

    // Title block
    const ty = 58 + Math.round(Math.sin(this.t * 1.3) * 1.5);
    text(c, 'NIGHTMARE ON', W / 2, ty, { align: 'center', color: PAL.purple, shadow: PAL.ink });
    const title = 'VISTA AVENUE';
    text(c, title, W / 2, ty + 14, { align: 'center', size: 16, color: PAL.red, shadow: PAL.blood });
    // dripping letters
    const x0 = W / 2 - (title.length * 16) / 2;
    c.fillStyle = PAL.red;
    for (let i = 0; i < title.length; i++) {
      if (title[i] === ' ') continue;
      const len = Math.round((Math.sin(this.t * 0.9 + i * 1.7) * 0.5 + 0.5) * 7);
      const lx = x0 + i * 16 + 5 + (i % 3) * 3;
      c.fillRect(lx, ty + 29, 2, len);
      c.fillStyle = PAL.blood; c.fillRect(lx, ty + 29 + len, 2, 1); c.fillStyle = PAL.red;
    }
    if (blink(1.1)) text(c, 'PRESS ENTER TO BEGIN', W / 2, 112, { align: 'center', color: PAL.bone, shadow: PAL.ink });
    bg.drawScream(c);
  }
}
