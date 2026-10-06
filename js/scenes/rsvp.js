// The RSVP after a win: Trick or Treating / Dance Party / Both / Skip.
// Answers go to Zhuri's Google Form; Skip asks for confirmation first.
import { W, GROUND_Y, input, text, panel, wrap, sprite, blink, clock, PAL } from '../engine.js';
import { CONFIG } from '../config.js';
import { SPR, drawTombstone, drawTree, drawDoor } from '../sprites.js';
import { sfx } from '../audio.js';
import { submitRsvp } from '../rsvp.js';

const R = CONFIG.rsvp;
const ASK = [...R.options, 'Skip'];
const WARN = ['Go back', 'Skip anyway'];

export class RsvpScene {
  constructor(game) { this.game = game; }
  enter() {
    this.game.bg.screamEnabled = false;
    this.state = 'ask'; this.cursor = 0; this.timer = 0; this.submitted = false;
  }
  exit() { this.game.bg.screamEnabled = true; }

  options() { return this.state === 'warn' ? WARN : ASK; }

  update(dt) {
    this.timer += dt;
    this.game.bg.update(dt);
    const opts = this.options();
    if (this.state === 'ask' || this.state === 'warn') {
      if (input.justPressed('up') || input.justPressed('left')) { this.cursor = (this.cursor + opts.length - 1) % opts.length; sfx.move(); }
      if (input.justPressed('down') || input.justPressed('right')) { this.cursor = (this.cursor + 1) % opts.length; sfx.move(); }
      if (this.timer > 0.3 && input.justPressed('confirm')) this.choose();
    } else if (this.state === 'thanks' || this.state === 'skipped') {
      if (this.timer > 0.8 && input.justPressed('confirm')) { sfx.select(); this.game.go('title'); }
    }
  }

  choose() {
    sfx.select();
    if (this.state === 'warn') {
      if (this.cursor === 0) { this.state = 'ask'; this.cursor = ASK.length - 1; }
      else { this.state = 'skipped'; }
      this.timer = 0;
      return;
    }
    const pick = ASK[this.cursor];
    if (pick === 'Skip') { this.state = 'warn'; this.cursor = 0; this.timer = 0; return; }
    if (this.submitted) return;          // never send twice
    this.submitted = true;
    this.answer = pick;
    this.state = 'sending'; this.timer = 0;
    submitRsvp(this.game.name || 'Unknown guest', pick).then(() => {
      sfx.correct();
      this.state = 'thanks'; this.timer = 0;
    });
  }

  drawOptions(c, opts, y0, w = 176, step = 17) {
    const x = Math.round((W - w) / 2);
    opts.forEach((label, i) => {
      const y = y0 + i * step;
      const sel = i === this.cursor;
      panel(c, x, y - 4, w, 14, { fill: sel ? '#241a44' : '#15122a', edge: sel ? PAL.gold : PAL.plum, inner: '#15122a' });
      text(c, label, W / 2, y, { align: 'center', color: sel ? PAL.gold : PAL.grey });
      if (sel) c.drawImage(SPR.heart, x - 10 + Math.round(Math.sin(clock.t * 6) * 1.5), y);
    });
  }

  draw(c) {
    const bg = this.game.bg;
    bg.drawSky(c, 1); bg.drawHills(c, 0, 1);
    drawTree(c, 40, GROUND_Y, 1);
    drawTombstone(c, 86, GROUND_Y, 0); drawTombstone(c, 296, GROUND_Y, 3);
    drawDoor(c, 236, GROUND_Y, 1, 0.3);
    const hop = Math.abs(Math.round(Math.sin(clock.t * 8) * 3));
    sprite(c, SPR.player.cheer, 150, GROUND_Y - 20 - hop);

    if (this.state === 'ask') {
      panel(c, 12, 4, W - 24, 122);
      text(c, 'RSVP, ' + (this.game.name || 'FRIEND'), W / 2, 11, { align: 'center', color: PAL.gold });
      wrap(R.question, 34).forEach((row, i) => text(c, row, W / 2, 25 + i * 11, { align: 'center', color: PAL.bone }));
      this.drawOptions(c, ASK, 66, 176, 15);
    } else if (this.state === 'warn') {
      panel(c, 12, 30, W - 24, 112, { edge: PAL.red, inner: PAL.blood, fill: '#1e0c14' });
      text(c, 'WAIT!', W / 2, 38, { align: 'center', color: PAL.red });
      wrap(R.skipWarning, 32).forEach((row, i) => text(c, row, W / 2, 54 + i * 11, { align: 'center', color: PAL.bone }));
      this.drawOptions(c, WARN, 104, 150);
    } else if (this.state === 'sending') {
      panel(c, 40, 66, W - 80, 32);
      text(c, 'Sending your RSVP...', W / 2, 78, { align: 'center', color: PAL.bone });
    } else {
      const msg = this.state === 'thanks' ? R.thanks : R.skipped;
      panel(c, 24, 46, W - 48, 64);
      wrap(msg.toUpperCase(), 17).forEach((row, i) => text(c, row, W / 2, 58 + i * 18, { align: 'center', size: 16, color: PAL.gold, shadow: PAL.rust }));
      if (this.timer > 0.8 && blink()) text(c, 'PRESS ENTER TO PLAY AGAIN', W / 2, 162, { align: 'center', color: PAL.bone, shadow: PAL.ink });
    }
  }
}
