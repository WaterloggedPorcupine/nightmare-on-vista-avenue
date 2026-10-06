import { W, input, text, panel, blink, PAL } from '../engine.js';
import { sfx } from '../audio.js';

export class NameScene {
  constructor(game) { this.game = game; this.el = game.nameInput; }
  enter() {
    this.game.bg.screamY = 20;
    this.el.value = this.game.name || '';
    this.el.classList.remove('hidden');
    input.locked = true;
    this.onKey = (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') { e.preventDefault(); this.submit(); }
      else if (e.key === 'Escape') { e.preventDefault(); this.game.go('menu'); }
    };
    this.el.addEventListener('keydown', this.onKey);
    // any keypress while this screen is up goes to the name field
    this.onWinKey = () => { if (document.activeElement !== this.el) this.el.focus(); };
    window.addEventListener('keydown', this.onWinKey, true);
    setTimeout(() => this.el.focus(), 30);
  }
  exit() {
    this.el.classList.add('hidden');
    this.el.removeEventListener('keydown', this.onKey);
    window.removeEventListener('keydown', this.onWinKey, true);
    this.el.blur();
    // the phone keyboard can leave the page scrolled; put it back
    setTimeout(() => window.scrollTo(0, 0), 60);
    input.locked = false;
    input.down.clear();
  }
  submit() {
    const n = this.el.value.trim().toUpperCase().slice(0, 12);
    if (!n) { this.shake = 0.4; sfx.wrong(); return; }
    this.game.setName(n);
    sfx.select();
    this.game.go('instructions', { next: 'level' });
  }
  update(dt) {
    this.game.bg.update(dt);
    if (this.shake > 0) this.shake -= dt;
    if (input.justPressed('confirm')) this.submit();
    if (input.justPressed('back')) this.game.go('menu');
  }
  draw(c) {
    const bg = this.game.bg;
    bg.drawMenuScene(c);
    const sx = this.shake > 0 ? Math.round(Math.sin(this.shake * 60) * 2) : 0;
    panel(c, 30 + sx, 58, W - 60, 64);
    text(c, 'WHO DARES ENTER', W / 2 + sx, 64, { align: 'center', color: PAL.purple, shadow: PAL.ink });
    text(c, 'VISTA AVENUE?', W / 2 + sx, 74, { align: 'center', color: PAL.red, shadow: PAL.blood });
    // the DOM input sits over y 86..108
    if (blink()) text(c, 'TYPE YOUR NAME, PRESS ENTER', W / 2, 111, { align: 'center', color: PAL.grey, size: 8, alpha: 0.9 });
  }
}
