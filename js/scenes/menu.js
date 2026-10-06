import { W, input, text, panel, sprite, clock, PAL } from '../engine.js';
import { SPR } from '../sprites.js';
import { sfx } from '../audio.js';

const ITEMS = ['PLAY', 'HOW TO PLAY'];

export class MenuScene {
  constructor(game) { this.game = game; this.cursor = 0; }
  enter() { this.game.bg.screamEnabled = true; this.game.bg.screamY = 46; }
  update(dt) {
    this.game.bg.update(dt);
    if (input.justPressed('up')) { this.cursor = (this.cursor + ITEMS.length - 1) % ITEMS.length; sfx.move(); }
    if (input.justPressed('down')) { this.cursor = (this.cursor + 1) % ITEMS.length; sfx.move(); }
    if (input.justPressed('confirm')) {
      sfx.select();
      if (this.cursor === 0) this.game.go('name');
      else this.game.go('instructions', { next: 'menu' });
    }
  }
  draw(c) {
    const bg = this.game.bg;
    bg.drawMenuScene(c, { scream: false });

    text(c, 'NIGHTMARE ON', W / 2, 6, { align: 'center', color: PAL.purple, shadow: PAL.ink });
    text(c, 'VISTA AVENUE', W / 2, 18, { align: 'center', size: 16, color: PAL.red, shadow: PAL.blood });

    const pw = 150, ph = 50, px = (W - pw) / 2, py = 78;
    panel(c, px, py, pw, ph);
    for (let i = 0; i < ITEMS.length; i++) {
      const y = py + 10 + i * 20;
      const sel = i === this.cursor;
      text(c, ITEMS[i], W / 2 + 6, y, { align: 'center', color: sel ? PAL.gold : PAL.grey, shadow: PAL.ink });
      if (sel) {
        const bob = Math.round(Math.sin(clock.t * 6) * 1.5);
        sprite(c, SPR.pumpkin, px + 10 + bob, y - 3);
      }
    }
    if (this.game.name) {
      text(c, 'WELCOME BACK, ' + this.game.name, W / 2, 136, { align: 'center', color: PAL.teal, shadow: PAL.ink });
    } else {
      text(c, 'ARROWS TO MOVE  ENTER TO SELECT', W / 2, 136, { align: 'center', color: PAL.grey, shadow: PAL.ink, alpha: 0.8 });
    }
    bg.drawScream(c);
  }
}
