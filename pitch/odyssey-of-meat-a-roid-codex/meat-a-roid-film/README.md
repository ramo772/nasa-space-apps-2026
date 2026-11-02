# THE ODYSSEY OF MEAT-A-ROID

An exactly 85-second, 1920×1080 browser-film concept for a NASA Space Apps Cairo registration pitch.

## Run

Open index.html directly, or serve this folder locally:

    python -m http.server 4173

Then visit http://localhost:4173.

Controls: Start, Pause/Resume, Replay, Mute, Fullscreen, seek, and clean recording mode. Keyboard shortcuts: Space play/pause, F fullscreen, R recording mode, arrow keys seek ±2 seconds.

The optional narration file is assets/narration.mp3. Playback only begins after Start, so it complies with browser autoplay rules.

## Replace the six team members

1. Put six real portraits in assets/, ideally as square JPG or PNG files (at least 800×800).
2. Open index.html.
3. Find const TEAM near the end of the file.
4. Replace only the name, title, and photo values:

    {name:"REAL NAME", title:"REAL PROJECT / PROFESSIONAL TITLE", photo:"assets/team-01.jpg"}

Keep all six objects. Blank photo values intentionally show labeled placeholders. Portraits use object-fit: cover; faces are not altered by the page. The grid introduces all six members by 76 seconds and stays still through 85 seconds.

## Recording

1. Use Chrome or Edge at 1920×1080.
2. Click Start once to unlock optional audio.
3. Click Fullscreen, then enable REC MODE (or press R) to hide controls and the cursor.
4. Start the screen recording, then press Space or Replay.
5. Record through 01:25. Press R to leave recording mode.

For a clean take, close other tabs, disable notifications, and use a browser zoom of 100%.

## Required / replaceable assets

- assets/alien-world.png — included 16:9 alien landscape plate.
- assets/inventor-panic.png — included panic/reaction pose.
- assets/inventor-confident.png — included confident/plan pose.
- assets/visual-reference.png — supplied identity and palette reference; not stretched as animation.
- assets/narration.mp3 — optional user-supplied Egyptian Arabic narration.
- assets/team-01.jpg … assets/team-06.jpg — real portraits to be supplied.

The generated scene art is layered with HTML/CSS mission UI, particles, glows, camera motion, props, and captions. No remote API or external library is required during playback.

## Editorial timing

- 00:00–00:11 — The worst morning ever
- 00:11–00:20 — Operation Get Home
- 00:20–00:45 — Chaos becomes gameplay
- 00:45–00:57 — Why the game exists
- 00:57–01:13 — What we will build
- 01:13–01:25 — The crew behind the chaos

All project capabilities and learning outcomes are framed as proposed/planned. Public NASA resources are described only as intended research inputs. The concept simulation is explicitly labeled illustrative and not accurate orbital physics. No NASA logo or endorsement claim is used.

