// The party invitation, shown between the menu and the name entry.
import { W, input, text, panel, wrap, blink, PAL } from '../engine.js';
import { CONFIG } from '../config.js';
import { sfx } from '../audio.js';

const COLS = 32;

export class InviteScene {
  constructor(game) { this.game = game; }
  enter() {
    this.game.bg.screamEnabled = true;
    this.game.bg.screamY = 12;
    // Each paragraph becomes wrapped rows; a blank row separates paragraphs.
    this.rows = [];
    CONFIG.invite.forEach((para, i) => {
      if (i > 0) this.rows.push('');
      this.rows.push(...wrap(para, COLS));
    });
    this.total = this.rows.reduce((n, r) => n + r.length, 0);
    this.chars = 0;
  }
  done() { return this.chars >= this.total; }
  update(dt) {
    this.game.bg.update(dt);
    if (input.justPressed('back')) { this.game.go('menu'); return; }
    if (!this.done()) {
      const before = Math.floor(this.chars);
      this.chars = Math.min(this.total, this.chars + dt * 32);
      if (Math.floor(this.chars) !== before && Math.floor(this.chars) % 3 === 0) sfx.move();
      if (input.justPressed('confirm')) this.chars = this.total;
    } else if (input.justPressed('confirm')) {
      sfx.select();
      this.game.go('name');
    }
  }
  draw(c) {
    const bg = this.game.bg;
    bg.drawMenuScene(c, { scream: false });
    const px = 22, py = 50, pw = W - 44, ph = 106;
    panel(c, px, py, pw, ph);
    text(c, "YOU'RE INVITED!", W / 2, py + 9, { align: 'center', color: PAL.gold, shadow: PAL.ink });
    let left = Math.floor(this.chars), y = py + 26;
    for (const row of this.rows) {
      if (left <= 0 && row) break;
      const shown = row.slice(0, Math.max(0, left));
      left -= row.length;
      if (shown) text(c, shown, W / 2, y, { align: 'center', color: PAL.bone });
      y += row ? 11 : 7;
    }
    if (this.done() && blink()) text(c, 'PRESS ENTER', W / 2, py + ph - 14, { align: 'center', color: PAL.purple });
    bg.drawScream(c);
  }
}
