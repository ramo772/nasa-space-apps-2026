# Draft rule table: return from high elliptical orbit

**Status:** Approved by Omar Khaled for use in the game on 2026-11-07 (DEC-009). Mentor review requested, with no reply seen yet. In use at `app/src/content/scenarios/return-home-v1.json`.

**Date:** 2026-11-07

**Calculator:** `app/scripts/rule-table-draft.mjs` reproduces every result below.

**May change:** official challenge resources arrive 2026-11-13 and take precedence.

## Mission

The workshop starts at the top of an unexpected high elliptical Earth orbit. The player chooses an engine, a solar array and a destination, then finds out whether the workshop gets there before propellant or supplies run out.

**Lesson:** a part that helps one system can hurt another. A bigger array makes an electric engine faster, but its mass makes the chemical route run out of propellant.

## Values

| Value | Amount | Unit | Label | Source | Transformation | Limitation shown to player |
|---|---:|---|---|---|---|---|
| Earth GM (μ) | 398,600.435507 | km³/s² | NASA source | DATA-015 | None | Two-body model: no Moon or Sun |
| Standard gravity (g₀) | 9.8 | m/s² | NASA source | DATA-026 | None | Rounded by the source |
| Earth radius | 6,378.137 | km | NASA source | DATA-016 | None | Equatorial radius |
| Start perigee | 123,787.3 | km | NASA source | DATA-014 | None; distance from Earth's center | TESS on 2026-10-01; the workshop is not TESS |
| Start apogee | 362,530.5 | km | NASA source | DATA-014 | None; distance from Earth's center | Same; the real orbit changes daily |
| Geosynchronous altitude | 35,785.4 | km | NASA source | DATA-024 | 22,236 mi × 1.609344 | Rounded by the source |
| Low-orbit altitude | 415 | km | Simplified game rule | DATA-028 | Midpoint of NASA's 370–460 km | ISS band used as an example |
| Chemical Isp | 235 | s | NASA source | DATA-018 | Top of hydrazine's typical 200–235 s | Small-spacecraft survey |
| Electric Isp | 1,500 | s | Simplified game rule | DATA-018 | Chosen inside the Hall-effect range, 200–1,920 s | Small-spacecraft survey |
| Electric thrust per power | 75 | mN/kW | Simplified game rule | DATA-018 | Upper bound of "below 75 mN/kW" | Optimistic by construction |
| Array specific power | 30 | W/kg | NASA source | DATA-019 | Where NASA's dataset clusters | Figures not independently verified by NASA |
| Workshop dry mass, no array | 6,000 | kg | **Fiction** | Team | Chosen for the trade-off | Invented vehicle |
| Chemical propellant load | 26,000 | kg | **Fiction** | Team | Chosen for the trade-off | Invented vehicle |
| Electric propellant load | 3,000 | kg | **Fiction** | Team | Chosen for the trade-off | Invented vehicle |
| Life-support power | 5,000 | W | **Fiction** | Team | Chosen for the trade-off | Invented vehicle |
| Solar array output, small and large | 10 and 40 | kW | **Fiction** | Team | Chosen for the trade-off | Invented vehicle |
| Supplies limit | 180 | days | **Fiction** | Team | Chosen for the trade-off | Invented vehicle |

## Decisions

| Decision | Option | Benefit | Cost |
|---|---|---|---|
| Engine | Chemical | Arrives in days | Uses over ten times the propellant |
| Engine | Electric | Uses little propellant | Takes months and depends on power |
| Solar array | 10 kW (333 kg) | Lighter, so propellant goes further | Little power left for an electric engine |
| Solar array | 40 kW (1,333 kg) | Much faster electric thrust | Added mass costs propellant |
| Destination | Low orbit | Home: a full success | Needs 3.62 km/s |
| Destination | Geosynchronous | Needs only 1.31 km/s | Safe, but not home: a partial result |

## Rules

| ID | Rule | Source | Status |
|---|---|---|---|
| R1 | Orbit speed: v = √(μ(2/r − 1/a)) | DATA-029, tested against DATA-014 | Matches JPL's TESS speed to within 10⁻¹³ km/s |
| R2 | Two burns, in one plane: at apogee to lower perigee, then at the new perigee to circularize. Required Δv is their sum | DATA-024 | Source states the first burn; the second is the mirror case |
| R3 | Coast time: half of T = 2π√(a³/μ) | DATA-014, DATA-015 | Matches JPL's period to the millisecond; no printed citation yet |
| R4 | Mass ratio: MR = e^(Δv / (Isp · g₀)), with MR = full mass / empty mass | DATA-017 | Ignores gravity during the burn |
| R5 | Dry mass = 6,000 kg + array power / 30 W/kg | DATA-019, Fiction | |
| R6 | Propellant used = (dry mass + load) × (1 − 1/MR) | DATA-017 | |
| R7 | Electric thrust = (array power − life support) × 75 mN/kW | DATA-018, Fiction | |
| R8 | Electric time = propellant used × Isp × g₀ / thrust | DATA-026 | Replaces coast time |
| R9 | Chemical time = coast time | DATA-018 | Burns treated as instant; see limitation 2 |

**Result:** infeasible if propellant used exceeds the load or time exceeds 180 days. Otherwise low orbit is feasible and geosynchronous orbit is partial.

## Every design

| Engine | Array | Destination | Propellant used (kg) | Left over (kg) | Time (days) | Result |
|---|---:|---|---:|---:|---:|---|
| Chemical | 10 kW | Low orbit | 25,619 | 381 | 4.6 | **Feasible** |
| Chemical | 10 kW | Geosynchronous | 14,029 | 11,971 | 5.2 | Partial |
| Chemical | 40 kW | Low orbit | 26,411 | −411 | 4.6 | Infeasible: out of propellant |
| Chemical | 40 kW | Geosynchronous | 14,463 | 11,537 | 5.2 | Partial |
| Electric | 10 kW | Low orbit | 2,037 | 963 | 924.3 | Infeasible: out of supplies |
| Electric | 10 kW | Geosynchronous | 796 | 2,204 | 361.1 | Infeasible: out of supplies |
| Electric | 40 kW | Low orbit | 2,255 | 745 | 146.2 | **Feasible** |
| Electric | 40 kW | Geosynchronous | 881 | 2,119 | 57.1 | Partial |

**Dominance check:** each option gets a better result than its alternative in at least one design, so no option is always best. There are two different routes home.

**Not done:** plan §8.1 requires two people to play this on paper. This check was calculated, not played.

## Known limitations, most serious first

1. **Vehicle scale.** The propulsion survey covers spacecraft up to 180 kg wet mass. This workshop is crewed and weighs about 9 to 32 tonnes.
2. **Engine count.** Hall-effect thrusters in the survey top out at 55 mN, and 40 kW needs 2.6 N, so at least 48 thrusters. Hydrazine tops out at 28 N, so one thruster would need about 24 days for the chemical low-orbit route, not "seconds or minutes". Instant burns need many engines.
3. **Electric route is optimistic.** It uses the two-burn Δv, but a real low-thrust spiral needs more, and it spends longer in the radiation belts. Its 146 days is a lower bound.
4. **No plane change.** The transfer costs nothing to change orbital plane. TESS's 38.09° is measured against the ecliptic and the ISS's 51.6° against the equator, so the real cost is unknown here.
5. **Tuned fiction.** The fictional values were chosen to create this trade-off. The 381 kg chemical margin is thin on purpose, and small changes flip results.
6. **Excluded:** eclipses, radiation exposure, arrival timing, and the wait to reach apogee.
7. **Challenge fit.** There are no instrument, launch-vehicle, Budget or Communications decisions. The statement makes these optional but asks for "a complete space mission".

## Decisions for the science reviewer

| ID | Question | This draft assumes |
|---|---|---|
| S1 | Accept Δv as the requirement? | Yes |
| S2 | Use TESS as the example start orbit? | Yes |
| S3 | Drop Budget? | Yes, no NASA source |
| S4 | Accept the vehicle-scale mismatch? | **Accepted by Omar Khaled, 2026-11-07:** shown to the player. Mentor review of the table is pending |
| S5 | Drop Data for the first version? | Yes |
| S6 | Is a 146-day electric lower bound honest enough? | Yes, shown to the player |

## Status of proposal gaps

| Gap | Status |
|---|---|
| G1 vis-viva citation | Closed subject to review: NTRS-hosted thesis, numeric test against JPL |
| G2 fictional values | Proposed above |
| G3 scale mismatch | Accepted as a visible limitation (S4) |
| G4 g₀ | Closed: 9.8 m/s² (DATA-026) |
| G5 baseline data link | Avoided by dropping Data |
| G6 time limit | Proposed as Fiction |
| G7 home orbit | Proposed above |
| G8 burn time | Closed: from Isp = F / (ṁ · g₀) (DATA-026) |
| G9 radiation and eclipse | Excluded, see limitation 6 |
| G10 licences | Working read in the source register; a person must confirm |
