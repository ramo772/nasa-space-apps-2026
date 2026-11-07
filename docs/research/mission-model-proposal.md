# Proposed scientific model — return from high elliptical orbit

**Status:** PROPOSED for review. Not approved. Nothing here authorizes implementation.

**Date:** 2026-11-07

**Supersession:** Official 2026 challenge resources take precedence over this proposal. They could not be opened from the AI session (see OPEN-07 in `docs/technical/decisions.md`).

## How to read the evidence

| Label | Meaning |
|---|---|
| **Verified live** | Taken from a raw NASA API response in this session. |
| **Lead** | AI summary of an original NASA page. Under the source register's rule this is not yet evidence: a person must check the original. |
| **Fiction** | Story input. Must be labelled fictional in the game. |
| **Pending** | No value or source yet. Do not fill in by guessing. |

This document proposes no thresholds, deltas or win conditions. Those belong in the paper rule table after review.

## Mission question

Starting from an unexpected high elliptical Earth orbit, can the player's design bring the workshop to a home orbit using the propellant, power and time it has?

The relationship to teach, in NASA's words (Lead, DATA-024): "A spacecraft's periapsis altitude can be lowered by decreasing the spacecraft's energy at apoapsis." The review should confirm this is the right lesson for lowering apogee, which needs the mirror case at perigee.

## Proposed variables

Δv is the requirement. The resources below are what the player spends to meet it. This keeps the model within the four-variable limit and does not add a new resource family: propellant is shown inside Mass.

| Variable | Unit | Role | Modes | Source | Status |
|---|---|---|---|---|---|
| Δv required | km/s | Requirement, derived from start and home orbits | All | Vis-viva (G1) with DATA-014 orbit values | Pending: citation |
| Mass (dry + propellant) | kg | Resource | All | Start mass is Fiction (G2). Propellant comes from R1 | Pending: value |
| Return time | h or days | Resource | All | R5, from thrust and propellant use | Pending: citation |
| Power | W | Resource | Standard, Systems | R3, R4 | Lead |
| Data | Mbps or Mbit, to be decided | Resource | Systems | R6, plus baseline link (G5) | Pending: value |

Guided exposes Mass and Return time. Standard adds Power. Systems adds Data. The rules stay identical across modes.

**Budget:** no NASA source was found for it, so this proposal leaves it out of the simulation. See decision S3.

## Relationships with a source

| ID | Relationship | Source | Status | Limitation to show the player |
|---|---|---|---|---|
| R1 | Δu = Isp · g0 · ln(MR); MR = e^(Δu / (Isp · g0)); MR = full mass / empty mass | DATA-017 | Lead | Ignores weight during the burn. The page also gives a form with gravity. |
| R2 | Orbit period, semi-major axis and GM agree: T = 2π√(a³/μ) reproduces the Horizons period to within 0.1 s | DATA-014, DATA-015 | Values verified live. Equation form still needs a citation | Two-body orbit. No Moon or Sun effects. |
| R3 | Electric thrust is generally below 75 mN per kW. NASA's example: 500 W gives no more than 38 mN | DATA-018 | Lead | Small-spacecraft survey. See G3. |
| R4 | Solar arrays cluster around 30 W/kg; the maximum in NASA's dataset is 200 W/kg | DATA-019 | Lead | Manufacturer or public figures, not independently verified by NASA. |
| R5 | Electric systems "may need to operate for hundreds or thousands of hours" for impulse that chemical systems deliver in seconds or minutes | DATA-018 | Lead | A quantitative burn-time formula is still needed. |
| R6 | Received signal energy falls as 1/R² ("space loss") | DATA-025 | Lead | Baseline data rate is missing (G5). |

## Propulsion classes (NASA survey, Table 4-1)

| Class | Thrust range | Specific impulse | Status |
|---|---|---|---|
| Cold gas | 10 μN – 3.6 N | 40 – 110 s | Lead |
| Hydrazine monopropellant | 0.25 – 28 N | 180 – 285 s | Lead |
| Alternative mono- and bipropellants | 50 mN – 22 N | 150 – 310 s | Lead |
| Hall-effect | 0.25 – 55 mN | 200 – 1,920 s | Lead |
| Gridded ion | 0.1 – 20 mN | 500 – 3,000 s | Lead |
| Electrospray | 20 μN – 20 mN | 225 – 3,000 s | Lead |

These ranges cover devices in NASA's small-spacecraft survey only.

## Proposed decision phases (no numbers yet)

| Decision | Options to review | Benefit | Cost | Relationships |
|---|---|---|---|---|
| Propulsion | Chemical or electric | Chemical: short burn. Electric: less propellant for the same Δv | Chemical: more propellant. Electric: more power and far more time | R1, R3, R5 |
| Power | Smaller or larger solar array | Larger: more power for thrust | Larger: more dry mass, so a worse mass ratio | R1, R3, R4 |
| Home orbit | Which orbit counts as home | To be reviewed: a higher target should cost less Δv | To be reviewed: story and service consequences | G1, G7 |
| Data (Systems only) | Link capacity or data sent | More data returned | More power and mass, to be sourced | R6, G5 |

Propulsion and Power interact, so neither is decided alone. The paper test must confirm that no option is always best.

## Reference orbit (Verified live)

JPL Horizons API v1.2, target TESS (-95), center Earth (`500@399`), epoch 2026-10-01 00:00 TDB, frame Ecliptic of J2000.0.

| Field | Value | Unit |
|---|---|---|
| EC, eccentricity | 0.4909 | none |
| QR, perigee distance from Earth's center | 123,787 | km |
| AD, apogee distance from Earth's center | 362,531 | km |
| A, semi-major axis | 243,159 | km |
| PR, period | 1,193,291 (13.81 days) | s |
| IN, inclination to the ecliptic | 38.09 | deg |
| Keplerian GM | 398,600.4355 | km³/s² |
| Earth equatorial radius | 6,378.137 | km |

Query:

    https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND='-95'&OBJ_DATA='YES'&MAKE_EPHEM='YES'&EPHEM_TYPE='ELEMENTS'&CENTER='500@399'&START_TIME='2026-10-01'&STOP_TIME='2026-10-02'&STEP_SIZE='1 d'&OUT_UNITS='KM-S'&CSV_FORMAT='NO'

Proposed use: a real, publicly documented example of this orbit type, used to set the scale of the fictional starting orbit. The workshop is not TESS, and the game must say so. These values differ from NASA's nominal TESS figures (17.0 and 58.7 Earth radii, 13.7 days; Lead, DATA-024), so any display must name its epoch. Whether this orbit is a good starting point is for the science reviewer.

## NASA API assessment

The api.nasa.gov catalogue did not render for the AI session, so this covers the APIs in the source register plus Horizons and SSC, not the whole catalogue.

| API | Tested 2026-11-07 | Proposed role |
|---|---|---|
| JPL Horizons | Works, no key | **Core:** reference orbit and GM, saved as a snapshot |
| NASA SSC (Satellite Situation Center) | Works. Lists `mms1`; no `tess` ID found | Possible cross-check. Not needed for the first model |
| DONKI (space weather) | Failed: api.nasa.gov 503 three times, CCMC host timed out | **Unverified.** Possible Systems-mode event only if a sourced effect exists |
| NeoWs, SBDB, Close Approach, Sentry | Not retested | Not proposed: asteroid data has no causal link to this return mission. The plan rejects real fields used for unrelated relationships |
| NASA POWER | Not retested | Not proposed: register describes weather and solar data by latitude and longitude, not an orbit |
| APOD, EPIC, Earthdata, Worldview, Exoplanet Archive, USGS | Not retested | Not proposed for rules |

The game stays deterministic and offline-capable by using a reviewed snapshot, not a live call.

## Gaps to close

| ID | Gap | Why it matters | Proposed next step |
|---|---|---|---|
| G1 | No readable citation for vis-viva (v² = μ(2/r − 1/a)) | Δv depends on it. Search points to a JPL chapter (HTTP 403 from this session) and an NTRS thesis (PDF unread) | Reviewer opens either source and confirms the printed form |
| G2 | Workshop mass and any fictional capacity values | No NASA source can supply a fictional vehicle | Agree them as labelled Fiction, within a reviewed scale |
| G3 | The propulsion, power and communications surveys cover small spacecraft, but the workshop is crewed | Real risk of a scale mismatch | Reviewer accepts with a visible limitation, shrinks the vehicle, or finds a larger-vehicle source |
| G4 | Numeric source for g0 | R1 needs it. The Glenn page defines the symbol | Cite a standard reference |
| G5 | Baseline link rate and capacity at a known range | R6 scales a baseline, and none is chosen | Review SoA Chapter 9 and DSN documents, or cut Data |
| G6 | Crew time limit or consumables | Without a limit, electric propulsion has no time penalty | Find a source, or label as Fiction with a limitation |
| G7 | Definition of "home" orbit | Sets the Δv requirement | Science lead decides; values need a source |
| G8 | Thrust and burn-time equation | Needed for Return time | Confirm on the Glenn pages |
| G9 | Radiation-belt exposure and eclipse effects | Possible extra costs. Leads exist in DATA-019 and DATA-024 | Include only if they stay within the variable limit |
| G10 | Licence and attribution for every source | Required before a snapshot ships | Check per source |

## Decisions needed from the science reviewer

- **S1:** Accept Δv as the requirement, with Mass, Return time, Power and Data as the resources?
- **S2:** Use a real reference orbit, with TESS as the example, for the fictional start?
- **S3:** Remove Budget from the simulation, or keep it as a labelled game rule?
- **S4:** Resolve the scale mismatch (G3). This is the largest credibility risk.
- **S5:** Keep or cut Data for the first version?

## Before any rule table is approved

1. Read the official challenge resources and reconcile them with this proposal.
2. A named person checks each Lead against the original source.
3. Close G1, G2, G3, G4, G7 and G8.
4. Write the one-page table required by plan §8.1 and play it on paper with two people.
