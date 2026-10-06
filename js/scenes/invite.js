// Story slides: a gold title and paragraphs that type themselves out in a pixel
// panel over the graveyard. Used for the party invitation (menu -> name entry)
// and for the Keeper's congratulations (castle door -> first question).
import { W, input, text, panel, wrap, blink, PAL } from '../engine.js';
import { CONFIG } from '../config.js';
import { sfx } from '../audio.js';

const COLS = 32;

export class InviteScene {
  // opts: { title, paragraphs, next, nextArgs, scream }
  constructor(game, opts = {}) {
    this.game = game;
    this.title = opts.title || "YOU'RE INVITED!";
    this.paragraphs = opts.paragraphs || CONFIG.invite;
    this.next = opts.next || 'name';
    this.nextArgs = opts.nextArgs || [];
    this.scream = opts.scream !== false;
  }
  enter() {
    this.game.bg.screamEnabled = this.scream;
    this.game.bg.screamY = 12;
    // Each paragraph becomes wrapped rows; a blank row separates paragraphs.
    this.rows = [];
    this.paragraphs.forEach((para, i) => {
      if (i > 0) this.rows.push('');
      this.rows.push(...wrap(para, COLS));
    });
    this.total = this.rows.reduce((n, r) => n + r.length, 0);
    this.chars = 0;
  }
  exit() { this.game.bg.screamEnabled = true; }
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
      this.game.go(this.next, ...this.nextArgs);
    }
  }
  draw(c) {
    const bg = this.game.bg;
    bg.drawMenuScene(c, { scream: false });
    const px = 22, py = 50, pw = W - 44, ph = 106;
    panel(c, px, py, pw, ph);
    text(c, this.title, W / 2, py + 9, { align: 'center', color: PAL.gold, shadow: PAL.ink });
    let left = Math.floor(this.chars), y = py + 26;
    for (const row of this.rows) {
      if (left <= 0 && row) break;
      const shown = row.slice(0, Math.max(0, left));
      left -= row.length;
      if (shown) text(c, shown, W / 2, y, { align: 'center', color: PAL.bone });
      y += row ? 11 : 7;
    }
    if (this.done() && blink()) text(c, 'PRESS ENTER', W / 2, py + ph - 14, { align: 'center', color: PAL.purple });
    if (this.scream) bg.drawScream(c);
  }
}
