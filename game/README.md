# The Odyssey of a Meat-a-roid

A three-stop mission-design game for the 2026 NASA Space Apps challenge **Space Mission Design Game**.

You walk a base and build a ship whose job is to get home. A real asteroid is on the way. Each bench spends a limited mass, power, and budget. The words change for a kid, a student, or a crew planner. The score does not.

Click the ground, or use WASD. E fits the part on the bench in front of you. Shift runs.

## Run

From this folder:

```powershell
python server.py
```

Open http://127.0.0.1:4173

The page needs the server. Opening `index.html` as a file cannot reach NASA or the story-maker.

Copy `.env.example` to `.env` and set `XAI_API_KEY` if you want Grok to retell the challenges. Without that key, the built-in voice still plays the whole voyage. The key stays in the server.

## What is real

- Visitor name, date, miss distance, speed, and diameter come from the [NASA/JPL SBDB Close Approach Data API](https://ssd-api.jpl.nasa.gov/doc/cad.html).
- If that call fails, the game uses `data/fallback-approaches.json`, a response saved on 2026-11-05, and says so.
- Moon-distances are a conversion: 149,597,870.7 km per au, and 384,400 km per Moon-distance.
- Mass, power, budget, and science notes are **game rules**. They are not a NASA prediction and not a flight result.
- The base, the hangar, and the rocket are an illustration. They are not an orbit plot.
- When Grok writes the card, the screen says so. If the reply adds a number that is not in the packet, the game throws the reply away and keeps its own words.

## Why the same buttons are not the same game every time

The link costs more power when the published miss distance is larger. A stored dump loses notes when the published speed is at least 10 km/s. An unpublished diameter adds a survey camera to the lab. Another visitor, or a harder visitor, loads a different NASA row into those rules.

The story can be asked to get weirder, or to include one thing you type. That request changes the words. It does not change the buttons.

## Amend this when the official resources arrive

Official challenge resources were announced for 13 November 2026. Keep this shape and swap the source:

1. Teach `server.py` to fetch the new resource.
2. Map it into `{ id, name, when, distAu, vRelKmS, diameterKm }`.
3. Leave `js/rules.js` alone unless a new fact should change a cost. If it should, change `pressureFrom()` only, then rerun `node --test`.

## Checks

```powershell
node --test
```

The checks cover the rule table, the saved NASA file, the number guard on the story, and walking through the hangar door to the benches.
