import { W, GROUND_Y, input, text, panel, sprite, blink, clock, PAL } from '../engine.js';
import { SPR, drawDoor } from '../sprites.js';
import { sfx } from '../audio.js';

export class InstructionsScene {
  constructor(game, opts = {}) { this.game = game; this.next = opts.next || 'menu'; }
  enter() { this.game.bg.screamEnabled = true; }
  update(dt) {
    this.game.bg.update(dt);
    if (input.justPressed('confirm')) {
      sfx.select();
      if (this.next === 'level') this.game.go('level', 0);
      else this.game.go('menu');
    }
    if (input.justPressed('back')) this.game.go('menu');
  }
  keycap(c, x, y, glyph) {
    c.fillStyle = PAL.slate; c.fillRect(x, y, 14, 14);
    c.fillStyle = PAL.stone; c.fillRect(x + 1, y + 1, 12, 11);
    c.fillStyle = PAL.ink;
    const g = glyph;
    if (g === 'up') { c.fillRect(x + 6, y + 3, 2, 7); c.fillRect(x + 4, y + 5, 2, 2); c.fillRect(x + 8, y + 5, 2, 2); c.fillRect(x + 3, y + 6, 1, 1); c.fillRect(x + 10, y + 6, 1, 1); }
    if (g === 'down') { c.fillRect(x + 6, y + 3, 2, 7); c.fillRect(x + 4, y + 7, 2, 2); c.fillRect(x + 8, y + 7, 2, 2); c.fillRect(x + 3, y + 6, 1, 1); c.fillRect(x + 10, y + 6, 1, 1); }
    if (g === 'left') { c.fillRect(x + 3, y + 6, 8, 2); c.fillRect(x + 5, y + 4, 2, 2); c.fillRect(x + 5, y + 8, 2, 2); c.fillRect(x + 6, y + 3, 1, 1); c.fillRect(x + 6, y + 10, 1, 1); }
    if (g === 'right') { c.fillRect(x + 3, y + 6, 8, 2); c.fillRect(x + 7, y + 4, 2, 2); c.fillRect(x + 7, y + 8, 2, 2); c.fillRect(x + 7, y + 3, 1, 1); c.fillRect(x + 7, y + 10, 1, 1); }
  }
  draw(c) {
    const bg = this.game.bg;
    bg.drawMenuScene(c, { scream: false });
    panel(c, 8, 6, W - 16, 112);
    text(c, 'HOW TO SURVIVE THE NIGHT', W / 2, 13, { align: 'center', color: PAL.gold, shadow: PAL.ink });

    // controls row
    const cols = [
      { k: 'up', label: 'JUMP', x: 40 },
      { k: 'down', label: 'DUCK', x: 112 },
      { k: 'left', label: 'BACK', x: 184 },
      { k: 'right', label: 'RUN', x: 256 }
    ];
    const t = clock.t;
    for (const col of cols) {
      this.keycap(c, col.x - 7, 26, col.k);
      text(c, col.label, col.x, 44, { align: 'center', color: PAL.grey });
      const by = 76; // feet line for demo figures
      if (col.k === 'up') {
        const ph = (t * 1.4) % 1; const h = ph < 0.5 ? Math.sin(ph * Math.PI * 2) * 14 : 0;
        sprite(c, h > 1 ? SPR.player.jump : SPR.player.idle, col.x - 6, by - (h > 1 ? 17 : 20) - Math.round(h));
      } else if (col.k === 'down') {
        const duck = (t % 1.6) < 0.8;
        sprite(c, duck ? SPR.player.duck : SPR.player.idle, col.x - 6, by - (duck ? 11 : 20));
      } else if (col.k === 'left') {
        sprite(c, SPR.player.run[Math.floor(t * 8) % 2], col.x - 6, by - 20, true);
      } else {
        sprite(c, SPR.player.run[Math.floor(t * 8) % 2], col.x - 6, by - 20);
      }
    }

    // hazards row
    text(c, 'AVOID', 18, 88, { color: PAL.red, shadow: PAL.ink });
    sprite(c, SPR.skeleton[Math.floor(t * 4) % 2], 66, 82);
    c.save(); c.translate(94, 94); c.rotate(t * 5); c.drawImage(SPR.pumpkin, -6, -6); c.restore();
    sprite(c, SPR.ghost[Math.floor(t * 4) % 2], 112, 84 + Math.round(Math.sin(t * 3) * 2));
    c.fillStyle = PAL.grey; c.fillRect(144, 78, 1, 8);
    sprite(c, SPR.spider, 140, 84 + Math.round(Math.sin(t * 2) * 2));
    text(c, 'REACH', 176, 88, { color: PAL.teal, shadow: PAL.ink });
    c.save(); c.translate(224, 102); c.scale(0.5, 0.5); drawDoor(c, 0, 0, 0, 0); c.restore();
    text(c, '3 LIVES', 256, 88, { color: PAL.pink, shadow: PAL.ink });
    for (let i = 0; i < 3; i++) sprite(c, SPR.heart, 258 + i * 9, 98);

    if (blink()) text(c, this.next === 'level' ? 'PRESS ENTER TO BEGIN' : 'PRESS ENTER TO GO BACK', W / 2, 122, { align: 'center', color: PAL.bone, shadow: PAL.ink });
  }
}
