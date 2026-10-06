// Pixel art defined as strings and baked into offscreen canvases once.
import { PAL } from './engine.js';

const C = {
  W: PAL.bone, w: PAL.grey, g: PAL.stone, G: PAL.slate, K: PAL.ink,
  P: PAL.purple, p: PAL.plum, O: PAL.orange, o: PAL.rust, Y: PAL.gold,
  R: PAL.red, r: PAL.blood, S: PAL.skin, B: PAL.wood, b: PAL.bark,
  N: PAL.navy, L: PAL.ghoul, T: PAL.teal, E: PAL.green, Q: PAL.pink
};

export function bake(rows) {
  const h = rows.length, w = rows[0].length;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const c = cv.getContext('2d');
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ch = rows[y][x];
    if (ch === '.' || ch === ' ' || !C[ch]) continue;
    c.fillStyle = C[ch]; c.fillRect(x, y, 1, 1);
  }
  return cv;
}

// ---- player (12 wide) ----
const P_TOP = [
  '....BBBB....',
  '...BBBBBB...',
  '...BSSSSB...',
  '...BSKSKS...',
  '...SSSSSS...',
  '....SSSS....',
  '...PPPPPP...',
  '..PPPPPPPP..',
  '.PP.PPPP.PP.',
  '.PP.PPPP.PP.',
  '.SS.PPPP.SS.',
  '....PPPP....',
  '....pppp....'
];
const P_TOP_ARMS_UP = [
  '....BBBB....',
  '...BBBBBB...',
  '...BSSSSB...',
  '...BSKSKS...',
  '...SSSSSS...',
  '.SS.SSSS.SS.',
  '.PP.PPPP.PP.',
  '.PPPPPPPPPP.',
  '..PPPPPPPP..',
  '...PPPPPP...',
  '...PPPPPP...',
  '....PPPP....',
  '....pppp....'
];
const LEGS_STAND = [
  '....pppp....',
  '....pp.pp...',
  '....pp.pp...',
  '....pp.pp...',
  '....pp.pp...',
  '...KKK.KKK..',
  '...KKK.KKK..'
];
const LEGS_RUN1 = [
  '....pppp....',
  '...pp..pp...',
  '..pp....pp..',
  '..pp....pp..',
  '.pp......pp.',
  'KKK......KKK',
  'KKK......KKK'
];
const LEGS_RUN2 = [
  '....pppp....',
  '....pppp....',
  '....pppp....',
  '....pp.pp...',
  '....pp.pp...',
  '...KKK.KKK..',
  '...KKK.KKK..'
];
const LEGS_JUMP = [
  '....pppp....',
  '...pp..pp...',
  '..pp....pp..',
  '.KKK....KKK.'
];
const P_DUCK = [
  '....BBBB....',
  '...BBBBBB...',
  '...BSSSSB...',
  '...BSKSKS...',
  '...SSSSSS...',
  '..PPPPPPPP..',
  '.PPPPPPPPPP.',
  '.SSPPPPPPSS.',
  '..pppppppp..',
  '..pp....pp..',
  '.KKK....KKK.'
];

// ---- skeleton (12x18) ----
const SK_HEAD = [
  '....WWWW....',
  '...WWWWWW...',
  '...WKWWKW...',
  '...WWWWWW...',
  '....WKKW....'
];
const SK_A = SK_HEAD.concat([
  'W....WW....W',
  'W..WWWWWW..W',
  'W..W.WW.W..W',
  '.W.WWWWWW.W.',
  '.WWW.WW.WWW.',
  '...WWWWWW...',
  '....W..W....',
  '...W....W...',
  '...W....W...',
  '..W......W..',
  '..W......W..',
  '.WW......WW.',
  'WW........WW'
]);
const SK_B = SK_HEAD.concat([
  '....WWWW....',
  '...WWWWWW...',
  '..WW.WW.WW..',
  '.WW.WWWW.WW.',
  'WW..WWWW..WW',
  '....WWWW....',
  '....W..W....',
  '....W..W....',
  '....W..W....',
  '....W.W.....',
  '....W.W.....',
  '...WW.WW....',
  '..WW...WW...'
]);

// ---- pumpkin (12x12) ----
const PUMPKIN = [
  '.....EE.....',
  '....EEE.....',
  '..OOOOOOOO..',
  '.OOOOOOOOOO.',
  'OOOOOOOOOOOO',
  'OOYYOOOOYYOO',
  'OOYOOOOOOYOO',
  'OOOOOYYOOOOO',
  'OOYOOOOOOYOO',
  'OOOYYYYYYOOO',
  '.OOOOOOOOOO.',
  '..oooooooo..'
];

// ---- ghost (12x12) ----
const GH_TOP = [
  '....WWWW....',
  '..WWWWWWWW..',
  '.WWWWWWWWWW.',
  '.WWKWWWWKWW.',
  '.WWKWWWWKWW.',
  '.WWWWWWWWWW.',
  '.WWWWKKWWWW.',
  '.WWWWWWWWWW.',
  '.WWWWWWWWWW.',
  '.WWWWWWWWWW.'
];
const GH_A = GH_TOP.concat(['.WW.WWW.WWW.', '.W...W...W..']);
const GH_B = GH_TOP.concat(['.WWW.WWW.WW.', '..W...W...W.']);

// ---- spider (10x8) ----
const SPIDER = [
  '..g....g..',
  '.g.gggg.g.',
  'g..gRRg..g',
  'g.gGGGGg.g',
  '.gGGGGGGg.',
  'g.gGGGGg.g',
  '.g.gggg.g.',
  '..g....g..'
];

const HEART = [
  '.RR.RR.',
  'RRRRRRR',
  'RRRRRRR',
  '.RRRRR.',
  '..RRR..',
  '...R...'
];
const HEART_EMPTY = [
  '.GG.GG.',
  'G..G..G',
  'G.....G',
  '.G...G.',
  '..G.G..',
  '...G...'
];

const BAT = [
  'K.......K',
  'KK.....KK',
  'KKK.K.KKK',
  'KKKKKKKKK',
  '.KK.K.KK.',
  '..K...K..'
];

export const SPR = {};
export function bakeAll() {
  SPR.player = {
    idle: bake(P_TOP.concat(LEGS_STAND)),
    run: [bake(P_TOP.concat(LEGS_RUN1)), bake(P_TOP.concat(LEGS_RUN2))],
    jump: bake(P_TOP_ARMS_UP.concat(LEGS_JUMP)),
    duck: bake(P_DUCK),
    cheer: bake(P_TOP_ARMS_UP.concat(LEGS_STAND))
  };
  SPR.skeleton = [bake(SK_A), bake(SK_B)];
  SPR.pumpkin = bake(PUMPKIN);
  SPR.ghost = [bake(GH_A), bake(GH_B)];
  SPR.spider = bake(SPIDER);
  SPR.heart = bake(HEART);
  SPR.heartEmpty = bake(HEART_EMPTY);
  SPR.bat = bake(BAT);
}

// ---- procedural props (drawn straight to the low-res canvas) ----

export function drawTombstone(c, x, groundY, type = 0) {
  c.fillStyle = PAL.slate;
  if (type === 0) {            // rounded
    c.fillRect(x, groundY - 10, 10, 10);
    c.fillRect(x + 1, groundY - 12, 8, 2);
    c.fillRect(x + 2, groundY - 13, 6, 1);
    c.fillStyle = PAL.stone;
    c.fillRect(x + 1, groundY - 11, 1, 10); c.fillRect(x + 2, groundY - 12, 2, 1);
    c.fillStyle = PAL.ink;
    c.fillRect(x + 3, groundY - 8, 1, 1); c.fillRect(x + 5, groundY - 8, 1, 1); c.fillRect(x + 7, groundY - 8, 1, 1);
    c.fillRect(x + 3, groundY - 6, 5, 1);
  } else if (type === 1) {     // cross
    c.fillRect(x + 3, groundY - 14, 3, 14);
    c.fillRect(x, groundY - 11, 9, 3);
    c.fillStyle = PAL.stone;
    c.fillRect(x + 3, groundY - 14, 1, 14); c.fillRect(x, groundY - 11, 9, 1);
  } else if (type === 2) {     // tall slab
    c.fillRect(x, groundY - 16, 8, 16);
    c.fillRect(x + 1, groundY - 17, 6, 1);
    c.fillStyle = PAL.stone;
    c.fillRect(x + 1, groundY - 16, 1, 15);
    c.fillStyle = PAL.ink;
    c.fillRect(x + 2, groundY - 13, 4, 1); c.fillRect(x + 2, groundY - 11, 4, 1); c.fillRect(x + 2, groundY - 9, 3, 1);
  } else {                     // broken stump
    c.fillRect(x, groundY - 6, 9, 6);
    c.fillRect(x + 1, groundY - 8, 3, 2); c.fillRect(x + 6, groundY - 7, 2, 1);
    c.fillStyle = PAL.stone; c.fillRect(x + 1, groundY - 6, 1, 5);
  }
  // dirt mound
  c.fillStyle = '#1b1430';
  c.fillRect(x - 2, groundY - 1, 14, 1);
}

export function drawTree(c, x, groundY, scale = 1) {
  c.fillStyle = '#0a0812';
  const s = scale;
  // trunk
  c.fillRect(x - 2 * s, groundY - 34 * s, 5 * s, 34 * s);
  c.fillRect(x - 4 * s, groundY - 4 * s, 9 * s, 4 * s);
  // branches
  const br = (x0, y0, dx, dy, len, w) => {
    for (let i = 0; i < len; i++) c.fillRect(Math.round(x0 + dx * i), Math.round(y0 + dy * i), w, w);
  };
  br(x, groundY - 30 * s, -1.4, -1, 12 * s, 2 * s);
  br(x - 16 * s, groundY - 42 * s, -1, -1.3, 6 * s, 1 * s);
  br(x - 12 * s, groundY - 40 * s, 0.4, -1.5, 5 * s, 1 * s);
  br(x + 2 * s, groundY - 26 * s, 1.5, -0.9, 11 * s, 2 * s);
  br(x + 18 * s, groundY - 36 * s, 1, -1.2, 6 * s, 1 * s);
  br(x + 14 * s, groundY - 34 * s, -0.3, -1.6, 5 * s, 1 * s);
  br(x + 1 * s, groundY - 34 * s, 0.2, -1.5, 9 * s, 2 * s);
  br(x + 2 * s, groundY - 46 * s, 1, -1, 5 * s, 1 * s);
}

export function drawFence(c, x, groundY, w) {
  c.fillStyle = PAL.ink;
  c.fillRect(x, groundY - 11, w, 1); c.fillRect(x, groundY - 5, w, 1);
  for (let i = 0; i <= w; i += 5) {
    c.fillRect(x + i, groundY - 14, 1, 14);
    c.fillRect(x + i - 1, groundY - 15, 3, 1);
  }
}

// Dracula-castle door: 32 wide, 48 tall, base at groundY. open: 0..1
export function drawDoor(c, x, groundY, open = 0, glow = 0) {
  const top = groundY - 48;
  // stone surround
  c.fillStyle = PAL.slate;
  c.fillRect(x - 4, top + 10, 40, 38);
  c.beginPath(); c.arc(x + 16, top + 14, 20, Math.PI, 0); c.fill();
  c.fillStyle = PAL.stone;
  for (let i = 0; i < 4; i++) { c.fillRect(x - 4, top + 14 + i * 9, 3, 1); c.fillRect(x + 33, top + 18 + i * 9, 3, 1); }
  c.fillRect(x + 2, top + 1, 2, 2); c.fillRect(x + 28, top + 1, 2, 2); c.fillRect(x + 15, top - 5, 2, 2);
  // opening (dark or glowing interior)
  const gi = Math.max(0, Math.min(1, glow));
  const grad = c.createLinearGradient(0, top + 4, 0, groundY);
  grad.addColorStop(0, gi > 0 ? `rgba(255,215,94,${0.9 * gi})` : '#05040a');
  grad.addColorStop(1, gi > 0 ? `rgba(240,138,42,${0.9 * gi})` : '#05040a');
  c.fillStyle = '#05040a';
  c.fillRect(x, top + 14, 32, 34);
  c.beginPath(); c.arc(x + 16, top + 14, 16, Math.PI, 0); c.fill();
  if (gi > 0) {
    c.fillStyle = grad;
    c.fillRect(x, top + 14, 32, 34);
    c.beginPath(); c.arc(x + 16, top + 14, 16, Math.PI, 0); c.fill();
  }
  // two wooden doors swinging inward: width shrinks with open
  const half = Math.round(16 * (1 - open));
  if (half > 0) {
    for (const side of [0, 1]) {
      const dx = side === 0 ? x : x + 32 - half;
      c.fillStyle = PAL.bark;
      c.fillRect(dx, top + 14, half, 34);
      c.save(); c.beginPath(); c.rect(dx, top - 4, half, 60); c.clip();
      c.beginPath(); c.arc(x + 16, top + 14, 16, Math.PI, 0); c.fill();
      c.restore();
      // planks
      c.fillStyle = PAL.wood;
      for (let px = 1; px < half; px += 5) c.fillRect(dx + px, top + 2, 1, 46);
      // iron bars across
      c.fillStyle = PAL.stone;
      c.fillRect(dx, top + 20, half, 2); c.fillRect(dx, top + 32, half, 2); c.fillRect(dx, top + 42, half, 2);
      c.fillStyle = PAL.grey;
      for (let px = 2; px < half; px += 6) { c.fillRect(dx + px, top + 20, 1, 1); c.fillRect(dx + px, top + 32, 1, 1); c.fillRect(dx + px, top + 42, 1, 1); }
    }
    // ring handles
    c.fillStyle = PAL.gold;
    if (half > 4) { c.fillRect(x + half - 4, top + 27, 2, 2); c.fillRect(x + 32 - half + 2, top + 27, 2, 2); }
  }
  // step
  c.fillStyle = PAL.stone; c.fillRect(x - 6, groundY - 1, 44, 1);
}

export function drawMoon(c, x, y, r, dawn = 0) {
  c.fillStyle = `rgba(244,241,232,${1 - dawn * 0.8})`;
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = `rgba(201,196,184,${1 - dawn * 0.8})`;
  c.beginPath(); c.arc(x - r * 0.3, y - r * 0.2, r * 0.22, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(x + r * 0.35, y + r * 0.3, r * 0.16, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(x + r * 0.1, y + r * 0.55, r * 0.1, 0, Math.PI * 2); c.fill();
}

export function drawSun(c, x, y, r) {
  c.fillStyle = PAL.gold;
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#fff2b0';
  c.beginPath(); c.arc(x - r * 0.2, y - r * 0.2, r * 0.6, 0, Math.PI * 2); c.fill();
}
