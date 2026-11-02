# Bootcamp workshop — API and data integration track

**Status:** Draft
**Type:** notes
**Created:** 2026-11-01   **Last reviewed:** TBD
**Contributor:** shahndaa (attended)
**Source:** one teammate's attendance notes from the NASA Space Apps Cairo 2026 bootcamp,
Slot 1, 2026-10-30 (venue printed on the slides: Nile University). Presenter: Ahmed Khaled
Moghazy, credited on the slides as "Ahmed Moghazy". Written in the contributor's own words
from the presenter's slide deck; slide wording and images are not reproduced and the deck is
not committed. Rate limits, endpoint behaviour and dataset links were re-checked against the
official pages on 2026-11-01 and take precedence over slide figures where the two disagree.
**Related:** `docs/workshops/2026-10-31-bootcamp-web-development.md`,
`docs/research/source-register.md`, `docs/technical/architecture.md`,
`docs/technical/decisions.md`

## Purpose
Record the API and data-integration track of the bootcamp so the team can reuse it once a
challenge is selected. **Nothing here is a team decision, an approved architecture or an
official competition rule.** The presenter's advice, the 2025 case-study observations and the
verified-against-source facts are labelled separately throughout, because the workshop mixed
all three.

## Content

### Session at a glance
Two-hour session: welcome (0 min), building blocks (5), winners' case studies (30), "join and
fail" (40), code-along (50), hands-on build (75), plan and close (110).

Stated learning goals — by the end a participant can explain the request/response cycle with a
NASA example, pick a source using its docs and limits, build a clean table plus a saved file
plus one working feature, and recover from 403, 429, empty results and missing values. The
stated target was that every pair left with a working call, a saved data file and one feature
on screen.

### Why real NASA data first — as stated in the workshop, rules not verified
- Judges are said to want NASA data at the core of a project, not bolted on.
- It was stated that only projects using NASA data or resources can win a Global Award.
- Suggested time budget: get the first real API call working and saved within 2–3 hours, then
  build one feature, then tell the story.

The two award statements were asserted in the session; neither is cited here and neither has
been checked against the official 2026 rules. Treat them as leads, not rules.

### API fundamentals
- An API is a web address that returns raw data (usually JSON) instead of a web page — a
  contract between two systems.
- Three parts of a request: **endpoint** (where), **parameters** (which data), **key** (who is
  asking). Shape: base URL + path + query string carrying dates and `api_key`.
- Cycle: client (browser, notebook or app) sends an HTTP request → the NASA server checks key
  and limits → fetches → replies with JSON → the app turns it into a list, card or map. Every
  API in the session followed this same cycle.
- Why NASA exposes an API instead of its database: the database is too complex (the API is a
  curated menu of endpoints), security (raw tables stay private), standardisation (one JSON
  shape for everyone), scalability (one front door that can be cached and rate-limited), and
  access control (keys identify callers).
- HTTP methods: GET reads, POST creates, PUT updates, DELETE removes. NASA data APIs are
  almost always GET, because we only read.
- A request has method, endpoint, parameters (with the key) and headers. A response has a
  status code, headers and a JSON body.
- Framing used in the session: data and APIs are the "resources" the challenges hand you — a
  link, a key and an API.

### Rate limits — official numbers, checked 2026-11-01
Source: <https://api.nasa.gov/assets/html/authentication.html>

- Registered free `api.nasa.gov` key: **1,000 requests per hour**, applied across *all*
  `api.nasa.gov` APIs, on a rolling window.
- Exceeding it **temporarily blocks the key**; the block lifts automatically after an hour.
- `DEMO_KEY`: **30 requests per IP per hour** and **50 requests per IP per day**.
- Usage is visible in the `X-RateLimit-Limit` and `X-RateLimit-Remaining` response headers.

Two practical consequences noted in the session: `DEMO_KEY` is shared by everyone on the same
network, so it is exhausted quickly in a workshop room; and limits change, so re-check the
official page before the hackathon.

**Discrepancy to keep visible:** the slides quoted 10,000 requests/hour for a personal key and
10 requests/hour for `DEMO_KEY`. The official page says 1,000 and 30/50. This page uses the
official figures. The slide numbers are recorded here only so the contradiction is not lost.

### Status codes and quiet failures
| Code | Meaning | Typical cause or action |
|---|---|---|
| 200 | It worked | Still check the body is not empty |
| 400 | Bad parameter | e.g. a NeoWs feed range longer than 7 days |
| 401 / 404 | Wrong address | NASA can return 401 for a wrong endpoint |
| 403 | Bad or missing key | Invalid-key message; check the key |
| 429 | Too many calls | Wait, cache, use your own key |
| 500 / 503 | Server-side problem | Wait, retry, use your saved copy |

"Quiet failure": HTTP 200 with an empty list is no error **and** no data. Check the length
before rendering anything.

### Keys and where they may live
- A free NASA key embedded in a web page is acceptable in the session's view — worst case,
  someone burns your quota.
- A paid key (for example an AI provider key) must never sit in a web page or a public repo.
- Saved response files can leak your key: NeoWs copies `api_key` into every link it returns
  (confirmed 2026-11-01 on a live `DEMO_KEY` call). Strip the key before saving or sharing.
- A browser-side call exposes the key to anyone who inspects the page; a server-side call
  avoids that.

### Reading API docs: seven things to find
1. Base URL (e.g. `api.nasa.gov`)
2. Endpoint (the path for one kind of data)
3. Parameters (what you can ask for, in which format)
4. Response example (the JSON shape)
5. Rate limits
6. Authentication (is a key needed, and where does it go)
7. Error codes

Practical tip from the session: test the URL in the browser first.

Worked example used — **NeoWs Feed**: `GET /neo/rest/v1/feed` on `api.nasa.gov`, with
`start_date` and `end_date` (`YYYY-MM-DD`; the end date defaults to start + 7 days) and
`api_key`. The response groups objects by date under `near_earth_objects`. A range longer than
7 days returns 400 (live check 2026-11-01: `"The Feed date limit is only 7 Days"`).
Authentication is the `api_key` query parameter.

### Working with JSON
- JSON is boxes inside boxes: dictionaries (look up by name) and lists (look up by position).
- Navigation shown for NeoWs: `near_earth_objects` → a date → an asteroid by index →
  `close_approach_data` → `miss_distance` → `kilometers`.
- Numbers often arrive as text (e.g. `"5041879.1"`); convert before sorting or comparing.
- Flattening recipe from the notebook walkthrough: loop dates, loop that day's asteroids, open
  the nested boxes (size is nested; speed and miss distance sit inside the first close
  approach), append one flat dictionary per asteroid, hand the list to pandas.
- The five fields kept in the exercise: name, size (metres), speed (km/s), miss distance (km),
  hazardous flag.

### Cleaning checklist
| Problem | Looks like | Fix |
|---|---|---|
| Numbers as text | `"5041879.1"` | `float()`/`astype` before sorting or comparing |
| Wrong units | km vs miles | Check the docs, convert once |
| Missing values | `-999` in POWER | Replace with NaN, then drop or fill |
| Odd times | USGS time in milliseconds | Convert to a real date (`to_datetime`) |
| Empty result | 200 OK and `[]` | Check length before rendering |

### The NASA data universe — as presented
- APOD — astronomy picture of the day (free key)
- NeoWs — near-Earth asteroids by date (free key)
- EPIC — whole-Earth photos from space (free key)
- DONKI — space-weather events such as flares and storms (free key)
- POWER — weather and solar history for any place (no key)
- JPL Small-Body Database — size and orbit of one asteroid or comet (no key)
- Exoplanet Archive — confirmed planets, queried like a table (no key)
- Earthdata — large satellite datasets, mostly file downloads (free login)

Rule stated: start from the need, then pick the source, and always check that source's docs and
limits. Three ways to get data: **API** (live, small, filtered — the focus of the session),
**file download** (bulk datasets such as Earthdata), and **ready tool** (explore first, e.g.
NASA Worldview).

Need-to-source guide with the traps the presenter highlighted:

| Need | Source | Key | Watch out |
|---|---|---|---|
| Asteroids passing Earth this week | NeoWs | free | 7 days max per call; numbers arriving as text |
| Whole-Earth photo for a date | EPIC | free | Empty list on dates with no photos |
| Weather history for a place | NASA POWER | none | `-999` means missing |
| Size and orbit of one asteroid | JPL Small-Body DB | none | Look up by name or ID |
| Earthquakes (partner data) | USGS | none | Time in ms; coordinates are `[lon, lat]` |
| Space picture of the day | APOD | free | Presenter reported placeholder data and a 500 for "today" during the workshop week (observed 2026-10-30; may have changed) |

### Dissecting a project — six questions
Ask any winning project: what is the problem, which data sources, where is the integration
point, what are the engineering risks, what are the fallbacks, and why does it stand out.

- **SkySense** ("Will It Rain On My Parade?", team Twisters, Mexico) — reported as a 2025
  Global Winner and Best Use of Technology. Combined NASA POWER history, a live forecast and
  Google/Gemini AI; the integration point was place (lat, lon) plus date. Strength: four sources
  collapsed into one weather-risk score a user can understand. The question to ask: what happens
  if one of four sources is slow or down? The presenter noted its live site is no longer online
  (domain expired).
- **Meteor Shield** (Meteor Madness, Team Polaris, Bangladesh) — reported as a 2025 Honorable
  Mention. Pattern: call, check, reshape, show, fall back. Merges per-date lists into one list,
  and every failure path returns built-in fallback data so the demo never shows a blank screen.
  The presenter also pointed out an API key sitting in page code: acceptable for a free NASA
  key, never for a paid one.
- **TechNova** (Meteor Madness, Morocco) — reported as a 2025 Global Finalist. One NeoWs feed
  for a date range became a Learn / Simulate / Mitigate app with a 3D view and a map. Lesson:
  the API supplies data, the idea supplies the feature. Discussion question: does the call run
  in the browser or on a server, and why does that matter for keys?

Three patterns worth copying: join on one shared field (SkySense), fail gracefully (Meteor
Shield), take the same data and add a new idea (TechNova). In all three, NASA data sits at the
core — which is what the relevance criterion is said to reward.

The team placements and award labels above come from the session and the slide deck; the two
`spaceappschallenge.org` team pages could not be opened during verification (see *Open
questions*), so no award claim here is independently confirmed.

### Audience challenge — meteor-risk platform
Pairs had 3 minutes to decide which NASA APIs to combine, where they connect (naming the shared
field) and what happens when one fails.

Worked answer shown:
- **NeoWs ("the traffic report")** — which asteroids passed near Earth this week, with size,
  speed, miss distance, a hazardous flag and an `is_sentry_object` field. Free key, 7-day max.
- **JPL Sentry ("the watch list")** — asteroids with any chance of hitting Earth in roughly the
  next 100 years, with impact probability, dates and a Torino score from 0 to 10.
  `ssd-api.jpl.nasa.gov/sentry.api`, with a `des=` parameter for one asteroid. No key.
- **Join on asteroid ID** — NeoWs says who is around, Sentry says how risky they are.

### Integration: joining on a shared field
- Integration means joining sources on a shared field. Vocabulary used: join, key, relationship,
  data fusion (many sources, one picture).
- Illustrative example: NeoWs asteroids joined with USGS earthquakes on date. Values on the
  slide were explicitly illustrative, not real data.
- pandas steps: make both dates the same type (USGS time is milliseconds since 1970, NeoWs date
  is text); reduce quakes to one row per day by grouping and keeping the strongest magnitude,
  otherwise rows multiply; merge on date with a **left** join so every asteroid survives even on
  days with no quake (missing quake values become NaN).
- Where joins go wrong: different formats on each side; time zones (UTC vs local can shift the
  day); GeoJSON coordinate order is `[lon, lat]`; one-to-many joins multiply rows unless you
  group first.

### Failure engineering
| Failure | Looks like | What to do |
|---|---|---|
| Timeout | NASA is slow | `timeout=10`, retry once, then fall back |
| 403 | Invalid or missing key | Show a clear message; check the key |
| 429 | Too many calls | Wait, cache results, use your own key |
| Missing field | A key absent from the JSON | Use `.get()` with a default |
| Wrong units | km vs miles | Check docs, convert once |
| Empty response | 200 OK with `[]` | Show a "no data" state, not a blank screen |

Flow given: call the API; on 200, save a copy and show the feature; otherwise show a clear
message and fall back to the saved copy. Real systems survive because they plan for failure.

Fallback pattern built in the notebook session: (1) call with a timeout, check the status code,
check the answer is not empty; (2) save every good answer to a backup file with the key removed;
(3) wrap the call in try/except and print one message a teammate can read; (4) fall back in
order — live call, then saved copy, then clearly labelled sample data. Planned failure exercise:
the notebook switches on a wrong key and the function has to survive and still show a result.

### Optional: adding an AI model
- Same idea as any API: one POST, one key, one JSON answer. Keys belong in Colab Secrets, never
  in code.
- Free providers named: Google Gemini (AI Studio key, free tier on Flash models; free prompts
  may be used by Google, so no private data), Groq (very fast; a free plan with per-organisation
  limits that change — check the dashboard), OpenRouter (one key, many `:free` models; a paid
  model in the list costs money).
- All three accept the same chat-completions style request: POST to a `chat/completions`
  endpoint with an `Authorization: Bearer` header.
- Read three fields from the answer: `choices[0].message.content` (the text), `finish_reason`
  (`stop`, or `length` meaning it was cut off) and `usage.total_tokens` (cost). Plain text may
  be empty or truncated; JSON mode is only a hint, so strip code fences, parse, validate keys
  and retry once. Streaming lines start with `data:` and end with `[DONE]`.
- Error handling: retry once on 429, 5xx or timeout; skip the provider on 400, 401, 403, 404;
  never loop forever on a bad key.
- Fallback chain: cache, then providers 1 → 2 → 3, then your own template. The screen should
  say who wrote the text ("AI-written by <provider>" or "Basic version (no AI)"). Good answers
  go into the cache.
- Facts come from your code; the model only phrases them. Check its numbers before showing them.
  Workshop example: an AI assistant invented `danger_level` and `diameter_km` fields that do not
  exist in the real response.
- The presenter's repository includes an LLM cheat sheet with more detail (not reviewed here).

### Architecture advice and the 48-hour plan
- Good order: NASA API → save data → clean data → feature → and only then a second source.
  Bad: ten APIs at once and chaos.
- Common mistakes named: many APIs at once, building your own backend or database, huge
  downloads, chasing a "perfect" data pipeline.
- Plan: hours 0–3 get one real call working and the response saved; next build the feature on
  the saved copy; later go live and join a second source by date or place.
- AI assistants are useful for explaining docs and drafting parsing code, but check every field
  against the real response and never paste a paid key into code you share.

### Hands-on materials
- Code-along sequence: need → find the API → read the docs → test the URL in the browser → code
  the call → inspect the JSON → pick fields → clean → save a backup → build the feature →
  handle errors (including a deliberate wrong key). Suggested checkpoints: ~minute 85 a 200 OK,
  ~minute 95 a clean table, ~minute 108 a feature plus a saved file.
- Participants opened the presenter's Colab notebook (File → Save a copy in Drive) from
  <https://github.com/moghazy17/nsac-2026-api-workshop>. The repository is public and contains
  `notebook/`, `handouts/`, `slides/` and `data/` at the top level (checked 2026-11-01); its
  contents were not reviewed line by line.
- API cards used to split pairs: EPIC (easy, free key, trap: empty list on dates without
  photos), NeoWs (medium, free key, twist: only hazardous / the biggest / per day; traps:
  numbers as text, 7-day limit), POWER (harder, no key, task: share of days above 35 °C in
  20 years of Cairo data; trap: `-999` means missing).

### Five takeaways — closing slide, paraphrased
1. Test the API URL in the browser first.
2. Get your own free key; a paid key never goes public.
3. Save a copy the moment your call works.
4. Take only the fields you need; check units and `-999`.
5. Plan for failure: a clear message plus your saved data.

## Possible follow-ups, not decisions
Recorded candidates for later discussion; **none is approved, scheduled or owned.**

- A per-team `api_key` in Colab Secrets or an environment variable instead of `DEMO_KEY`, if we
  run NASA calls during the hackathon.
- A demo fallback chain (live call → saved copy → clearly labelled sample), which would touch
  `docs/technical/architecture.md` §API/data contracts — that section is still TBD.
- A key-stripping step before any response JSON is saved or committed.
- Keeping an AI-drafted explanation labelled by provider on screen, if AI is ever used.

Adopting any of these requires a real issue and, where it affects architecture, a decision-log
entry. `docs/technical/architecture.md` is unchanged by this page.

## Open questions / uncertainty
- **Rate limits.** The slides and the official page disagree (10,000 vs 1,000 per hour;
  10 vs 30/hour for `DEMO_KEY`). This page uses the official figure from 2026-11-01; re-check
  before the hackathon.
- **APOD behaviour.** The placeholder data and 500 for "today" were observed during the
  workshop week. Whether it still happens is unknown.
- **Case-study links.** The two 2025 team pages (`/2025/find-a-team/twisters`,
  `/2025/find-a-team/technova3`) could not be opened on 2026-11-01 — DNS resolves but the TLS
  chain was untrusted from the reviewer's machine, and the site did not respond. They are
  therefore named in prose and not linked, and the award labels remain the presenter's claims.
- **Award rules.** The relevance criterion and the Global Award condition were asserted in the
  session and are not checked against the official 2026 rules.
- **Presenter's repository.** Confirmed public and its top-level layout confirmed; the notebook,
  API cards and LLM cheat sheet were not read, so nothing here is attributed to their contents.
- **Session facts.** Event, date, venue and presenter come from the contributor and the slides,
  not from an organizer page.

## Sources and attribution
All links below returned HTTP 200 on 2026-11-01 unless marked. Dataset URLs are also recorded in
`docs/research/source-register.md`; that register, not this page, is the place where coverage,
units, licences and freshness get filled in.

Verified NASA / partner sources
- api.nasa.gov portal (key signup; APOD, NeoWs, EPIC and DONKI are documented here) —
  <https://api.nasa.gov>
- Authentication and rate limits — <https://api.nasa.gov/assets/html/authentication.html>
- APOD — <https://apod.nasa.gov/apod/astropix.html> (redirects to `science.nasa.gov/apod`)
- NeoWs — documented on the portal above; behaviour re-checked live on 2026-11-01
- EPIC — <https://epic.gsfc.nasa.gov>
- DONKI — <https://ccmc.gsfc.nasa.gov/tools/DONKI/>
- NASA POWER API docs — <https://power.larc.nasa.gov/docs/services/api/>
- NASA POWER parameter dictionary — <https://power.larc.nasa.gov/docs/tutorials/parameters/>
- JPL Sentry API — <https://ssd-api.jpl.nasa.gov/doc/sentry.html>
- JPL Small-Body Database lookup — <https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html>
- JPL SBDB API — <https://ssd-api.jpl.nasa.gov/doc/sbdb.html>
- NASA Exoplanet Archive — <https://exoplanetarchive.ipac.caltech.edu>
- NASA Earthdata — <https://www.earthdata.nasa.gov>
- NASA Worldview — <https://worldview.earthdata.nasa.gov>
- USGS earthquake API — <https://earthquake.usgs.gov/fdsnws/event/1/>

Codes, handouts and tools (not data sources, so not registered)
- Presenter's workshop repository — <https://github.com/moghazy17/nsac-2026-api-workshop>
  (public; top-level layout checked 2026-11-01; contents not reviewed)
- AI providers named but not evaluated or chosen by this team: Google Gemini, Groq, OpenRouter.
  No paid service may be adopted without TL consent (`docs/team/working-agreement.md`).

Not linked — could not be verified on 2026-11-01
- 2025 case study "Will It Rain On My Parade?" / team Twisters
- 2025 case study TechNova / team technova3
- Meteor Shield / Team Polaris has no URL in the notes at all.

- No slide text, slide image or PDF is reproduced in this page.
- No NASA dataset is used by any team feature yet; this is a reference page only.
