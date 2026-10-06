import { W, H, input, text, panel, wrap, blink, clock, PAL } from '../engine.js';
import { CONFIG } from '../config.js';
import { SPR } from '../sprites.js';
import { sfx } from '../audio.js';

export class QuestionScene {
  constructor(game, qIndex, opts = {}) {
    this.game = game; this.qIndex = qIndex; this.q = CONFIG.questions[qIndex];
    this.isFinal = qIndex === CONFIG.questions.length - 1;
    this.retry = !!opts.retry;
  }
  enter() {
    const lead = this.retry && this.q.retryLines ? this.q.retryLines : (this.retry ? [] : (this.q.lines || []));
    this.lines = [...lead, this.q.prompt];
    this.lineIdx = 0; this.chars = 0; this.state = 'typing'; this.cursor = 0; this.timer = 0; this.result = null;
    this.game.bg.screamEnabled = false;
    sfx.bell();
  }
  exit() { this.game.bg.screamEnabled = true; }
  currentLine() { return this.lines[this.lineIdx]; }
  update(dt) {
    this.game.bg.update(dt);
    if (input.justPressed('back')) { this.game.go('menu'); return; }
    switch (this.state) {
      case 'typing': {
        const line = this.currentLine();
        if (this.chars < line.length) {
          const before = Math.floor(this.chars);
          this.chars = Math.min(line.length, this.chars + dt * 30);
          if (Math.floor(this.chars) !== before && Math.floor(this.chars) % 3 === 0) sfx.move();
          if (input.justPressed('confirm')) this.chars = line.length;
        } else if (input.justPressed('confirm')) {
          sfx.select();
          if (this.lineIdx < this.lines.length - 1) { this.lineIdx++; this.chars = 0; }
          else this.state = 'choose';
        }
        break;
      }
      case 'choose':
        if (input.justPressed('up')) { this.cursor = (this.cursor + this.q.options.length - 1) % this.q.options.length; sfx.move(); }
        if (input.justPressed('down')) { this.cursor = (this.cursor + 1) % this.q.options.length; sfx.move(); }
        if (input.justPressed('confirm')) this.answer();
        break;
      case 'result':
        this.timer += dt;
        if (this.timer > (this.result ? 2.4 : 3.0) || (this.timer > 1.2 && input.justPressed('confirm'))) this.next();
        break;
    }
  }
  answer() {
    this.result = this.cursor === this.q.answer;
    this.state = 'result'; this.timer = 0;
    if (this.result) sfx.correct(); else sfx.wrong();
  }
  next() {
    if (this.isFinal) this.game.go('ending', this.result);
    else if (this.result) this.game.go('question', this.qIndex + 1);
    else this.game.go('question', this.qIndex, { retry: true });   // ask again, no level replay
  }
  draw(c) {
    const bg = this.game.bg;
    bg.drawSky(c, 0); bg.drawHills(c, 0, 0); bg.drawMenuDecor(c); bg.drawFog(c, 0, 0.6);
    c.fillStyle = 'rgba(5,4,16,0.5)'; c.fillRect(0, 0, W, H);

    // cutscene board
    panel(c, 8, 10, W - 16, 160, { fill: '#100d20' });
    // portrait
    panel(c, 16, 18, 44, 44, { fill: '#1a1430', edge: PAL.orange, inner: PAL.rust });
    c.save(); c.translate(20, 22); c.scale(3, 3); c.drawImage(SPR.pumpkin, 0, 0); c.restore();
    text(c, 'THE', 38, 66, { align: 'center', color: PAL.orange });
    text(c, 'KEEPER', 38, 76, { align: 'center', color: PAL.orange });

    // dialogue text
    const line = this.currentLine();
    const shown = this.state === 'typing' ? line.slice(0, Math.floor(this.chars)) : line;
    const rows = wrap(shown, 29);
    for (let i = 0; i < rows.length; i++) text(c, rows[i], 68, 22 + i * 12, { color: PAL.bone });
    if (this.state === 'typing' && this.chars >= line.length && blink(0.8)) {
      text(c, 'ENTER', W - 20, 72, { align: 'right', color: PAL.grey });
    }

    // options
    if (this.state !== 'typing') {
      for (let i = 0; i < this.q.options.length; i++) {
        const y = 90 + i * 18;
        const sel = i === this.cursor;
        let color = sel ? PAL.gold : PAL.grey;
        if (this.state === 'result') {
          if (i === this.q.answer) color = PAL.ghoul;
          else if (sel) color = PAL.red;
        }
        panel(c, 64, y - 5, 200, 16, { fill: sel ? '#241a44' : '#15122a', edge: sel ? PAL.gold : PAL.plum, inner: '#15122a' });
        text(c, this.q.options[i], 76, y, { color });
        if (sel && this.state === 'choose') {
          const bob = Math.round(Math.sin(clock.t * 6) * 1.5);
          c.drawImage(SPR.heart, 64 - 10 + bob, y);
        }
      }
    }

    if (this.state === 'result') {
      const flash = this.timer < 0.3 ? 0.4 * (1 - this.timer / 0.3) : 0;
      if (flash > 0) { c.fillStyle = this.result ? `rgba(142,224,160,${flash})` : `rgba(198,47,47,${flash})`; c.fillRect(0, 0, W, H); }
      const msg = this.result ? (this.q.correct || 'CORRECT!') : (this.q.wrong || 'WRONG!');
      const rows = wrap(msg, 34);
      panel(c, 16, 144, W - 32, 10 + rows.length * 11, { fill: this.result ? '#10261a' : '#2a0e0e', edge: this.result ? PAL.ghoul : PAL.red });
      for (let i = 0; i < rows.length; i++) text(c, rows[i], W / 2, 149 + i * 11, { align: 'center', color: this.result ? PAL.ghoul : PAL.pink });
    } else if (this.state === 'choose') {
      text(c, 'CHOOSE WISELY, ' + this.game.name, W / 2, 152, { align: 'center', color: PAL.purple });
    }
  }
}
