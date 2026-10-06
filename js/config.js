// Everything party-specific lives here. Edit freely.
export const CONFIG = {
  storageKey: 'nova.playerName',
  muteKey: 'nova.muted',
  screamInterval: 7,          // seconds between screams in the sky
  screams: ['AAAAHHHH!!', 'EEEEEEK!!', 'HELP ME!!', 'AAAAHHHH!!'],
  lives: 3,

  invite: [
    "You've been invited to Zhuri's Halloween Birthday Party!",
    'But in order to make it there, you must face the scariest beings known...'
  ],

  // The Keeper's congratulations after the castle door, before the questions.
  // {name} is replaced with the player's name.
  keeperIntro: {
    title: 'CONGRATULATIONS, {name}!',
    paragraphs: [
      'You survived Vista Avenue and made it to the castle door!',
      'But to RSVP, you must answer these questions three.'
    ]
  },

  // Asked in order after the castle door. A wrong answer to any question but the
  // last just asks it again; a wrong answer to the last one is a death (with resurrection).
  questions: [
    {
      lines: [],
      prompt: "What is Zhuri's favorite childhood Halloween movie?",
      options: ['Hocus Pocus', 'Twitches', 'Halloweentown'],
      answer: 2,
      correct: 'CORRECT! But the Keeper has more questions...',
      wrong: 'WRONG! The Keeper gives you another chance...'
    },
    {
      lines: [],
      prompt: "What is Zhuri's favorite holiday?",
      options: ['Christmas', 'Halloween', 'Your mom', "New Year's Day"],
      answer: 0,
      correct: 'CORRECT! Ho ho ho... One last question...',
      wrong: 'WRONG! Think merrier... try again.',
      wrongFor: {
        'Halloween': "So close! She loves it, but it's not her favorite. Try again...",
        'Your mom': 'Nice try. The Keeper is not amused. Try again...'
      }
    },
    {
      lines: ["Zhuri's birthday falls in the spookiest month of the year..."],
      retryLines: ["Back from the dead? Let's try that again..."],
      prompt: 'What day in October does her birthday fall on?',
      options: ['October 26th', 'October 29th', 'October 31st'],
      answer: 1,
      correct: 'CORRECT! The party awaits...',
      wrong: 'WRONG! The ghosts are coming for you...'
    }
  ],

  // One level for the invitation.
  levels: [
    {
      name: 'VISTA AVENUE',
      length: 2400,
      seed: 7,
      clear: [64, 104],          // safe ground between hazard zones (px)
      speeds: { skeleton: 28, pumpkin: 70, ghost: 50, spider: 130 },
      ghostSweep: 44,            // a ghost flies from sx + sweep to sx - sweep
      ghostAmp: 3,
      ghostRest: [2.5, 3.5],     // seconds a ghost stays away between passes
      pumpkinRoll: 110,          // how far a pumpkin rolls before it resets
      pumpkinWindup: 0.7,        // seconds a pumpkin wobbles before it rolls
      pumpkinCooldown: 2.5,      // seconds before a reset pumpkin can roll again
      spiderTrigger: 70
    }
  ],

  // Where the camera keeps the player, in pixels from the left edge of the screen.
  cameraLead: 80,

  player: { speed: 72, jump: 210, gravity: 520 },

  lose: ["You didn't make it to Zhuri's birthday party.", 'Better luck next year.'],
  win: "You made it to Zhuri's birthday party!",

  // RSVP: answers are posted straight to Zhuri's Google Form.
  // To find new entry IDs if the form changes, see "RSVP form" in the README.
  rsvp: {
    formAction: 'https://docs.google.com/forms/d/e/1FAIpQLSe9Xgdu3rVIuN7EyHKCFxcjXT95LZqb-cBMslQogqmgbLTCMA/formResponse',
    nameField: 'entry.1818623611',      // "Name", short answer, required
    answerField: 'entry.1288523868',    // "Which activity will you be participating in?", multiple choice, required
    options: ['Trick or Treating', 'Dance Party', 'Both', "Can't Make It"],   // must match the form's options exactly
    question: 'Will you be coming trick or treating, to the dance party, or both?',
    thanks: 'Thank you, and see you soon!',
    thanksFor: { "Can't Make It": "Sorry you can't make it! Thanks for letting me know." },
    skipWarning: "If you don't tell me, Zhuri will be spooked to see you there!",
    skipped: 'No RSVP sent. Happy Halloween!',
    pendingKey: 'nova.pendingRsvp'
  }
};
