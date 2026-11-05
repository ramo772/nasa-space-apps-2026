# Game and simulation design workshop — from challenge to a playable spec

**Status:** Draft
**Type:** notes
**Created:** 2026-11-02   **Last reviewed:** TBD
**Contributor:** shahndaa (attended)
**Source:** one teammate's attendance notes from the NASA Space Apps Cairo 2026 bootcamp, Slot 2, 2026-10-30 (Nile University).
**Related:** `docs/workshops/2026-10-30-bootcamp-api-data-integration.md`, `docs/workshops/2026-10-31-critical-thinking-session.md`, `docs/product/challenge-and-mvp.md`, `docs/submission/checklist.md`

## Purpose
Record the game and simulation design workshop (Slot 2, 2026-10-30) so the team can reuse it
once a challenge is selected. The instructor was Marwan Ayyad. The notes combine the
contributor's handwritten notes with her own summary of the instructor's public slide deck;
slide wording and images are not reproduced. Every number in a demo is a teaching number unless
stated otherwise. Winner and award claims are as presented in the slides and are attributed to
them.

## Content

### Session at a glance
- Two-hour (120-minute) workshop, 2026-10-30, Slot 2, Nile University.
- Stated aim: every team leaves with a one-minute game spec ready to build.
- Agenda, in minutes: why games instead of dashboards (10), the core loop (20), how the winners
  did it (15), the 48-hour playbook (15), live demo (15), teams write a spec (35), rules and
  questions (10).
- The session included a live demo and closed with the instructor's own commercial game.

### Why a game instead of a dashboard
- Rule of thumb given: without a meaningful choice for the player, it is a chore rather than a
  game.
- The same Mars numbers (temperature, dust opacity, solar output, oxygen reserve) can be either
  a dashboard you only read or a three-sol storm simulation where you pick one move per sol —
  heat the habitat, run the oxygen plant, or power down. The slide labelled these as teaching
  numbers, not live data.
- A choice beats a chart for three reasons: feedback arrives within about a second; failure is
  safe, so players can crash, reset and try a smarter plan; people remember decisions they made.

### The core loop
Three parts; if one is missing, there is no game yet.
1. **Action** — a real dilemma. "Launch now in bad weather or wait and lose the orbital window"
   is a trade-off where both options cost something; "press launch to launch" is not a choice.
2. **Response** — rules anyone can read and check: one line of cause and effect each,
   deterministic (same choice, same result), with no dice and no black-box model. Example rule
   set, paraphrased: heaters draw power and add warmth; every storm sol drains warmth and
   oxygen; any meter reaching zero ends the mission.
3. **Feedback** — within a second, through colour (green safe, yellow warning, red trouble),
   sound (a beep per change, an alarm before failure) and numbers (the exact change, e.g.
   oxygen minus 20), so players learn the rules by playing.

Live demo: a capsule re-entry with one dial (entry angle) and a simplified safe corridor of
roughly -5.5 to -7.5 degrees; too shallow and the capsule skips back into space, too steep and
it burns up. Teaching numbers.

### Turning a challenge into variables
- Read the challenge text and pull out resources that run out, threats that push back, and the
  goal. Worked example: a lunar south-pole base with limited power through the long night,
  sharp cold and oxygen produced on site gives power and oxygen (resources), cold and the long
  night (threats), and survive until sunrise (goal).
- Keep 2 to 4 variables. One is a quiz; three is the sweet spot for real choices that can be
  finished in 48 hours; five or more is scope death.
- Constraint demo: a rocket launch where too little fuel falls back and too much leaves it
  stuck on the pad — real rules, teaching numbers.
- Fidelity ladder: raw science (true but not actionable), then full physics (the 48-hour trap),
  then game rules (the science simplified into safe, warning and critical states). Build at the
  game-rules level.

### How the winning projects used games — according to the instructor's slides
The facts below are as presented in the instructor's slides, which cite NASA's global winner
announcements and the teams' project pages. They are attributed to the instructor's slides, not
presented as independently confirmed NASA announcements.
- **Zumorroda-X, "Henry's Farm Adventures" (Egypt, 2025)** — mini games where the player is a
  farmer travelling the world and reacting to heat waves, flooding and other environmental
  events. Lesson: put the player in someone else's shoes and let data arrive as events. The
  slides label it a Global winner, Art & Technology Award, NASA Farm Navigators challenge.
- **TerraTales (Cairo, 2024)** — an interactive eco-choices game that shows the climate outcome
  of acting or not acting. Lesson: each choice shows its consequence. The slides label it a
  Global winner, Best Storytelling Award.
- **Eco-Metropolis, team Innovisionaries (Sharjah, 2024)** — city-building with urban planning
  and resource decisions. Lesson: scarce resources force trade-offs. The slides label it a
  Global winner, Most Inspirational Award.
- **PureFlow (Brazil, 2025)** — design a space habitat in 3D and stress-test it against
  space-weather threats such as solar storms. Lesson: a simulation can be a test bench. The
  slides label it a Global winner, Best Mission Concept Award.
- Slide figures: two of the 20 global winners in 2024 and 2025 were Egyptian game teams, and
  2025's ten winners were chosen from 18,860 teams (cited to NASA).
- What the winners share: the player makes a decision, NASA data lives inside the rules, and one
  complete loop is finished.

### Design checklist from the instructor
- Three must-haves: real choices, a challenge (never quite enough to go around) and feedback.
  Then pick **one** extra only: story, characters, mystery or puzzle. Fun is an outcome of those
  parts, not an ingredient you add.
- Four ideas that can kill a 48-hour project: open worlds, multiplayer, a custom 3D pipeline, a
  realistic physics engine. Instead: one screen, one loop, one finished level.
- Tools listed, none chosen by this team: browser with HTML and canvas (judges click a link and
  play); Godot (light, free, fast 2D); Three.js (3D in the browser); Unity only if the team
  already knows it. Keep every number and rule in one shared document the whole team can edit.
- Five golden rules, paraphrased: design the decisions first; put the science inside the rules;
  give feedback within a second; simplify the science openly; ship one complete loop.

### Using AI in game prototyping
- Good uses: writing state and rule code, balancing numbers, and placeholder art and sound.
  Never for inventing science or numbers that cannot be traced to a NASA source; check every
  number it produces.
- Agents named on the slides — Claude Code, Cursor, Antigravity, Codex — can open the project,
  run the game, read the error and fix it, but a human reviews every change.
- Prototype loop: paste the spec after the prompt; save the reply as game.html and open it; play
  for a minute and ask whether the choice matters; request one change at a time and paste errors
  exactly; keep every version that works.
- The prompt's requirements, summarised rather than copied: one self-contained offline HTML
  file; use exactly the spec's goal, variables, decisions and rules; ask before inventing any
  number; show variables as green/yellow/red meters; one button per decision; show each change
  in numbers; win and lose screens with Restart; check the spec first for a dominant button or a
  decision that never matters; short commented code; then list the built rules in plain English
  for checking.
- Safety: never paste passwords, keys or personal details; follow the event's AI rules and state
  what AI made.

### The one-minute spec
Five parts: (1) goal in one sentence; (2) three variables with start value and change per turn;
(3) two decisions with what each adds and costs in numbers; (4) an IF/THEN rule table; (5) win
and lose end states.

Worked lunar-night example (teaching numbers): keep a crew alive through a 14-day night with one
action per day. Battery starts at 100 kWh and drops 2 per day; heat starts at +10 C and drops
6 per day (safe above -10); oxygen starts at 80 percent and drops 10 points per day. Run
heaters: heat +12, battery -8. Run the oxygen recycler: oxygen +15, battery -8. Battery at 0
turns the machines off and heat then falls 10 per day; heat below -20 for three days, or oxygen
at 0, loses the mission; surviving day 14 wins.

Second demo: a Mars rover that must get three rocks home before the storm, with battery, dust on
the panels and samples, and the decisions drive, sample or clean panels, over 12 sols. Teaching
numbers again.

### Hands-on activity
Pick any NASA challenge; 20 minutes to design the spec, 10 minutes to swap specs with another
team who play your rules on paper, 5 minutes to revise the one confusing rule. Done means one
level that plays; graphics come last. The instructor noted that AI can turn the spec into a
playable draft afterwards.

### Contributor's own notes
The contributor's handwritten notes record the session title, the "playable spec" aim, the
instructor and the 120-minute length, plus choice, scenario and feedback as the three building
blocks of a game. Her reading of her Arabic notes, paraphrased in English:
- A game starts from a long description (the scenario or facts); the variables are pulled out
  of it.
- Some values or angles the player moves along matter a lot, so be careful with the numbers —
  this matches the capsule entry-angle demo, where only a narrow corridor works.
- Every input the player enters produces a specific output through the rules.
- Of all the possible combinations of inputs and rules, only one outcome is correct in the end.
- Because every number added creates more outputs and conditions, keep the number of variables
  small.

### Instructor's own game
"Blood Tax" by Mera Mera Games, built solo in Unity and aiming for a Steam Next Fest demo: a
mosquito against humans — follow heat, bite, carry blood to a jar while humans swat, spray, clap
and listen for the buzz. He asked the audience to watch it and name one thing they would change.

## Possible follow-ups
Recorded candidates for later discussion.
- Once a challenge is chosen, run the 20-minute spec exercise before any app code. The resulting
  spec would be a proposal, not authorization to build.
- Decide the game tool only after the challenge and the team's skills are known; the slides list
  options and choose none.
- If a game direction is taken, keep all numbers and rules in one shared, editable document.
- Any real dataset used inside game rules must be registered in
  `docs/research/source-register.md`; every demo here is teaching numbers.
- If AI helps build a prototype, keep a human review step and disclose AI use in the submission.

Adopting any of these requires a real issue and, where relevant, a decision-log entry.

## Open questions / uncertainty
- **Winner and award claims.** The winner, award and team-count figures come from the
  instructor's slides. They are attributed to the slides throughout.
- **Teaching numbers.** None of the demo numbers (Mars, lunar night, rover, re-entry corridor)
  is mission data. No dataset has been adopted.
- **Tool choice.** Which game tool the team will use is not decided; the slides only list options.
- **Session facts.** The venue (Nile University) is taken from the agreed source line; the notes
  did not record an exact room, start time or end time beyond the two-hour slot.
- **Two project links.** The TerraTales and Innovisionaries `spaceappschallenge.org` pages could
  not be opened from the reviewer's machine on 2026-11-02 (untrusted TLS chain, the same issue
  recorded in the API workshop page). The contributor reports they load. Both are linked, and
  the award labels remain the slides' claims.
- **Team-count figure.** The 18,860-team figure is stated for 2025 in the instructor's slides.
- **Tools and AI agents.** The named tools and agents were not evaluated by this team. No paid
  service may be adopted without TL consent (`docs/team/working-agreement.md`).
- **Discord invite.** It is a community invite, not an official event channel, and may expire.

## Sources and attribution
All links below returned HTTP 200 when checked from this machine on 2026-11-02, except the two
`spaceappschallenge.org` team pages noted above. The contributor reported on 2026-11-02 that all
of them load for her.

Workshop material (tools and references, not data sources, so not registered):
- Instructor's slide deck — <https://marwan0.github.io/space-apps-game-design/>
- Instructor's AI prompt page (spec in, playable draft out) —
  <https://marwan0.github.io/space-apps-game-design/prompt.html>
- Instructor's example game built from that prompt —
  <https://marwan0.github.io/space-apps-game-design/examples/lunar-night.html>
- Instructor's public site listing his projects and links — <https://marwan0.github.io/>

Examples shown on the slides (project pages, not data sources):
- Zumorroda-X, "Henry's Farm Adventures" (Egypt, 2025) —
  <https://henrysfarmadventures.vercel.app/>
- TerraTales project page (Cairo, 2024) —
  <https://www.spaceappschallenge.org/nasa-space-apps-2024/find-a-team/terratales/?tab=project>
- Eco-Metropolis, team Innovisionaries (Sharjah, 2024) —
  <https://www.spaceappschallenge.org/nasa-space-apps-2024/find-a-team/innovisionaries/?tab=project>
- PureFlow (Brazil, 2025) —
  <https://larasdiniz.github.io/PureFlow-2025/src/public/html/home/home.html>
- "Blood Tax" demo video — <https://www.youtube.com/watch?v=z-Hb8zyVJ3k>

Community:
- Workshop Discord invite — <https://discord.gg/fycj8nKgKE>. Listed as a community link; no
  personal contact details are reproduced.

- No slide text at length, slide image, QR code, saved HTML or zip is reproduced in this page,
  and none is committed.
- No row was added to `docs/research/source-register.md`: this page cites no NASA dataset and
  asserts no scientific figure. If a game later consumes real data, that dataset belongs in the
  register first.
