import { W, H, input, text, panel, sprite, clock, hitIndex, PAL } from '../engine.js';
import { SPR } from '../sprites.js';
import { sfx } from '../audio.js';

const ITEMS = ['PLAY', 'HOW TO PLAY'];
const SOUND = ['SOUND ON', 'NO SOUND'];

export class MenuScene {
  constructor(game) { this.game = game; this.cursor = 0; this.soundCursor = 0; }
  enter() { this.game.bg.screamEnabled = true; this.game.bg.screamY = 46; }

  // ---- layout (shared by draw and tap) ----
  itemRects() {
    const pw = 150, px = (W - pw) / 2, py = 78;
    return ITEMS.map((_, i) => ({ x: px + 4, y: py + 4 + i * 20, w: pw - 8, h: 20 }));
  }
  soundRects() {
    return SOUND.map((_, i) => ({ x: 52 + i * 112, y: 112, w: 104, h: 18 }));
  }

  choose(i) {
    sfx.select();
    if (i === 0) this.game.go('invite');
    else this.game.go('instructions', { next: 'menu' });
  }
  chooseSound(i) {
    this.game.setSound(i === 0);
    if (i === 0) setTimeout(() => sfx.select(), 60);
  }

  tap(x, y) {
    if (this.game.askSound) {
      const i = hitIndex(this.soundRects(), x, y);
      if (i >= 0) { this.soundCursor = i; this.chooseSound(i); }
      return true;
    }
    const i = hitIndex(this.itemRects(), x, y);
    if (i >= 0) { this.cursor = i; this.choose(i); }
    return true;   // taps elsewhere on the menu do nothing
  }

  update(dt) {
    this.game.bg.update(dt);
    if (this.game.askSound) {
      if (input.justPressed('left') || input.justPressed('up')) { this.soundCursor = 0; sfx.move(); }
      if (input.justPressed('right') || input.justPressed('down')) { this.soundCursor = 1; sfx.move(); }
      if (input.justPressed('confirm')) this.chooseSound(this.soundCursor);
      return;
    }
    if (input.justPressed('up')) { this.cursor = (this.cursor + ITEMS.length - 1) % ITEMS.length; sfx.move(); }
    if (input.justPressed('down')) { this.cursor = (this.cursor + 1) % ITEMS.length; sfx.move(); }
    if (input.justPressed('confirm')) this.choose(this.cursor);
  }

  draw(c) {
    const bg = this.game.bg;
    bg.drawMenuScene(c, { scream: false });

    text(c, 'NIGHTMARE ON', W / 2, 6, { align: 'center', color: PAL.purple, shadow: PAL.ink });
    text(c, 'VISTA AVENUE', W / 2, 18, { align: 'center', size: 16, color: PAL.red, shadow: PAL.blood });

    const pw = 150, ph = 50, px = (W - pw) / 2, py = 78;
    panel(c, px, py, pw, ph);
    ITEMS.forEach((label, i) => {
      const y = py + 10 + i * 20;
      const sel = i === this.cursor;
      text(c, label, W / 2 + 6, y, { align: 'center', color: sel ? PAL.gold : PAL.grey, shadow: PAL.ink });
      if (sel) sprite(c, SPR.pumpkin, px + 10 + Math.round(Math.sin(clock.t * 6) * 1.5), y - 3);
    });
    if (this.game.name) {
      text(c, 'WELCOME BACK, ' + this.game.name, W / 2, 136, { align: 'center', color: PAL.teal, shadow: PAL.ink });
    } else {
      text(c, 'ARROWS TO MOVE  ENTER TO SELECT', W / 2, 136, { align: 'center', color: PAL.grey, shadow: PAL.ink, alpha: 0.8 });
    }
    bg.drawScream(c);

    if (this.game.askSound) this.drawSoundPrompt(c);
  }

  drawSoundPrompt(c) {
    c.fillStyle = 'rgba(5,4,16,0.6)'; c.fillRect(0, 0, W, H);
    panel(c, 36, 54, W - 72, 86);
    text(c, 'PLAY WITH SOUND?', W / 2, 64, { align: 'center', color: PAL.gold });
    text(c, 'Sound plays even if your', W / 2, 82, { align: 'center', color: PAL.bone });
    text(c, 'phone is on silent.', W / 2, 93, { align: 'center', color: PAL.bone });
    this.soundRects().forEach((r, i) => {
      const sel = i === this.soundCursor;
      panel(c, r.x, r.y, r.w, r.h, { fill: sel ? '#241a44' : '#15122a', edge: sel ? PAL.gold : PAL.plum, inner: '#15122a' });
      text(c, SOUND[i], r.x + r.w / 2, r.y + 5, { align: 'center', color: sel ? PAL.gold : PAL.grey });
    });
  }
}
