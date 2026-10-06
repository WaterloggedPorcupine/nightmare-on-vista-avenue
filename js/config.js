// Everything party-specific lives here. Edit freely.
export const CONFIG = {
  storageKey: 'nova.playerName',
  muteKey: 'nova.muted',
  screamInterval: 7,          // seconds between screams in the sky
  screams: ['AAAAHHHH!!', 'EEEEEEK!!', 'HELP ME!!', 'AAAAHHHH!!'],
  lives: 3,

  questions: [
    {
      lines: [],
      prompt: "What is Zhuri's favorite childhood Halloween movie?",
      options: ['Hocus Pocus', 'Twitches', 'Halloweentown'],
      answer: 2,
      correct: 'CORRECT! But the road ahead only gets darker...',
      wrong: 'WRONG! The ghosts drag you back to where you started...'
    },
    {
      lines: ["Zhuri's birthday falls in the spookiest month of the year..."],
      prompt: 'What day in October does her birthday fall on?',
      options: ['October 13th', 'October 29th', 'October 31st'],
      answer: 1
    }
  ],

  levels: [
    {
      name: 'VISTA AVENUE',
      length: 2200,
      seed: 7,
      clear: [64, 104],          // safe ground between hazard zones (px)
      speeds: { skeleton: 28, pumpkin: 70, ghost: 50, spider: 130 },
      ghostSweep: 44,
      ghostAmp: 3,
      pumpkinRoll: 110,
      spiderTrigger: 70,
      ghostPairs: false
    },
    {
      name: 'THE CRYPT ROAD',
      length: 3000,
      seed: 13,
      clear: [38, 62],
      speeds: { skeleton: 40, pumpkin: 110, ghost: 72, spider: 185 },
      ghostSweep: 56,
      ghostAmp: 5,
      pumpkinRoll: 150,
      spiderTrigger: 58,
      ghostPairs: true
    }
  ],

  player: { speed: 72, jump: 210, gravity: 520 }
};
