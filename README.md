# Nightmare on Vista Avenue

A pixel-art graveyard side-scroller built for my Halloween themed birthday party. It doubles as the party invitation. Dodge dancing skeletons, spinning pumpkins, flying ghosts and dropping spiders, make it through the castle door, and answer the Keeper's questions. Make it to the party and you can RSVP right from the game.

**Play it:** https://nightmare.zhurisolan.com

![Title screen: a moonlit graveyard with rolling fog and a scream scrawled across the sky](assets/preview.gif)

## How it works

- Title screen, then a graveyard menu with rolling fog and a scream that writes itself across the sky every seven seconds.
- An invitation screen: you've been invited to Zhuri's Halloween birthday party, but to get there you must face the scariest beings known.
- Players type their name once; the game remembers it between visits.
- Controls: **Up** jumps, **Right** runs forward, **Left** runs back, **Down** ducks. Phones get on-screen buttons, and answers and menu options can be tapped directly.
- Phones start muted and ask once whether to play with sound. Choosing sound plays it even when the phone is on silent; the speaker icon in the corner changes it later.
- One level, Vista Avenue, ending at a Dracula-castle door. Pumpkins wobble before they roll, and ghosts rest between passes, so every hazard gives fair warning.
- Through the door, a slide congratulates the player for making it that far: to RSVP, they must answer these questions three.
- The Keeper then asks three multiple-choice questions in a pixel cutscene board: Zhuri's favorite childhood Halloween movie, her favorite holiday, and her birthday. A wrong answer to either of the first two just gets asked again, without giving the answer away.
- A wrong birthday answer brings the ghost swarm and a tombstone: "You didn't make it to Zhuri's birthday party. Better luck next year." Players can resurrect and try the question again as many times as it takes.
- A right answer brings the sunrise that scares the ghosts away, then an RSVP: Trick or Treating, Dance Party, Both, or Skip. Skipping asks for confirmation first.

## Tech

Vanilla HTML, CSS and JavaScript on a 320x180 canvas scaled up with `image-rendering: pixelated`. No framework, no build step, no image files: every sprite is a small string grid in `js/sprites.js` baked to an offscreen canvas at load, and the larger props (door, moon, tombstones, trees) are drawn with canvas primitives. Sound is a tiny Web Audio synth in `js/audio.js`.

```
index.html          page shell, touch controls, name input
css/style.css
js/config.js        questions, answers, level tuning, lives
js/engine.js        canvas, fixed-step loop, input, scene manager, text/panel helpers
js/sprites.js       pixel art + procedural props
js/background.js    sky, moon, stars, hills, fog, the sky-scream
js/audio.js         synth sound effects
js/rsvp.js          sends RSVP answers to the Google Form
js/scenes/          title, menu, invite, name, instructions, level, question, ending, rsvp
```

## Run locally

Any static server works. For example:

```
python -m http.server 8080
```

then open http://localhost:8080.

## Customize

Everything party-specific (invitation text, questions, correct answers, hazard speeds and timing, number of lives, ending text, RSVP settings) lives in `js/config.js`.

For testing from the browser console, `window.NOVA` exposes `game`, `scene()`, `input` and `step(n, draw)`. For example, `NOVA.game.go('level', 0)` jumps to the level and `NOVA.step(600, false)` runs ten seconds of game time without drawing.

## RSVP form

RSVP answers are posted straight to Zhuri's Google Form from the browser, since the site has no server. The settings are in the `rsvp` section of `js/config.js`:

- `formAction`: the form's address, ending in `/formResponse` instead of `/viewform`.
- `nameField` and `answerField`: the form's `entry.NNNNNN` field IDs.
- `options`: the answer choices. They must match the form's multiple-choice options exactly, or Google rejects the response.

If the form changes, find the new field IDs like this: open the form, choose "Get pre-filled link" from its menu, fill in sample answers, click "Get link", and copy the `entry.NNNNNN` numbers out of that link.

Google's response can't be read from another site, so the game treats a completed request as sent. If the player is offline, the game retries once, then saves the answer and sends it the next time the game loads. Please don't send test responses to the live form; to test, replace `window.fetch` with a stub from the console first.

## Hosting

Served by GitHub Pages from the root of the `main` branch at the custom domain `nightmare.zhurisolan.com` (see `CNAME`). DNS has a `CNAME` record from `nightmare` to `waterloggedporcupine.github.io`, and the old github.io address redirects to the custom domain. The project page on [zhurisolan.com](https://zhurisolan.com) embeds it.

## License

MIT
