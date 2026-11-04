# The Odyssey of Meat-a-Roid

An 85-second browser film for the NASA Space Apps Cairo registration pitch. Open `index.html` in Chrome or Edge.

The film is a proposed game concept. It does not use a NASA logo, and it does not claim a partnership, a dataset, or a measured learning result. Console numbers are illustrative game units.

## Play

From this folder:

```
python -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

Controls:

- Start begins the film. The score is generated in the page and starts when he wakes. Mute silences the score and the optional narration.
- Pause / resume, Replay, and the seek bar. Seeking does not replay effects that were skipped.
- Fullscreen.
- Rec mode hides the controls and the cursor.
- If `assets/narration.mp3` is missing, the picture and the score still play.
- If `assets/clips/wake.mp4`, `plan.mp4`, or `launch.mp4` is missing, that scene keeps its still plates. The plates are not a character performance. See `ASSETS.md`.

Keyboard: Space play/pause, F fullscreen, R rec mode, M mute, Left/Right seek by 2 seconds.

A link can open a paused frame: `index.html#t=42&rec`.

## Replace the six team members

1. The current portraits are `assets/team-01.jpg` through `assets/team-06.jpg`. To replace one, use the same path. Square photos, at least 800×800, work best.
2. Open `index.html` and find `const TEAM`.
3. Set each person’s real name, real title, and photo path:

```
{ name: "Real Name", title: "Real project title", photo: "assets/team-01.jpg" }
```

Leave all six objects. An empty `photo` shows a labeled placeholder. The page crops with `object-fit: cover` and does not filter or redraw faces. All six are on screen by 1:16 and the slide holds through 1:25.

## Record

1. Use Chrome or Edge at 1920×1080 and 100% zoom.
2. Click Start once, so the score and any narration file are allowed to play.
3. Enter fullscreen, then Rec mode (or press R).
4. Start the screen recording, then press Replay.
5. Record through 01:25. Press R to show the controls again.

Turn off notifications. The optional voice-over script is `NARRATION.md`.

## Score

After Start, the page synthesizes the score. It begins when his eye opens: wood creaks, the pitch rises, and a string plucks an open fifth. From the wide shot, a light pizzicato, mallet, and bass bed carries the film, with effects on the reveal, the miss, the rewind, the four player slots, and the launch. The bed drops out for the reaction and fades before the crew hold. Mute covers this score and `assets/narration.mp3`. The music is original. Do not replace it with a recording from another film.

## What the cut covers

- 00:00–00:11 The worst morning ever
- 00:11–00:20 Operation Get Home
- 00:20–00:45 Concept simulation, including solo and a crew of up to four
- 00:45–00:57 Why the game exists
- 00:57–01:13 What we will build
- 01:13–01:25 The real crew

Solo is a complete mission. Co-op is a proposed mode for two to four players on that same mission. The six credit slots are the project team, not the four player seats.
