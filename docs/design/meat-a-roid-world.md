# The Meat-a-roid

**Status:** Canonical story and world requirement from Omar Khaled, 2026-11-07 (DEC-011)

**Implemented in:** `app/src/visual/Depot.tsx`, `app/src/visual/Sectors.tsx`, `app/src/content/script.ts`

"Meat-a-roid" is a place in the game, not only the project title.

**Formal name:** M.E.A.T.-A.R.O.I.D., the Modular Experimental Assembly Testbed, Autonomous Repair and Orbital Integration Depot. Dr. Nadir calls it "the Meat-a-roid". RIVO uses the full designation, which is a recurring joke.

## What it is

A fictional, strange-looking orbital servicing depot in a high elliptical Earth orbit, built from purpose-built, certified compatible modules and inspired by broad NASA ISAM concepts.

It is not a real NASA facility, a natural asteroid, arbitrary space debris, a station built from unsafe salvage, shaped like food, or evidence that NASA operates such a workshop.

## Story

Dr. Nadir falls asleep testing an automated transfer aboard his small mobile workshop. The system runs the wrong saved route and docks with the depot. He wakes far from home.

The core exchange:

> **RIVO:** The transfer was successful.
>
> **Nadir:** This is not home.
>
> **RIVO:** You specified successful. You did not specify familiar.

## Reveal

Nadir wakes, the room seems normal, a tool floats past, RIVO reports with too much precision, the camera moves to the window, the depot and a distant Earth appear, the title appears, and the player gets the objective "Find a way home". It can be skipped after the first viewing.

## Sectors

Propulsion Bay, Power Spine, Communications Loft, Module Storage, Mission Table and Docking Ring. Each decision belongs to a sector, and that sector visibly responds.

| Sector | Decision | What changes |
|---|---|---|
| Mission Table | Destination | The target and route appear on the orbit hologram |
| Propulsion Bay | Engine | Electric lights a long cyan conduit. Chemical connects a large propellant tank |
| Power Spine | Solar array | The large array deploys more wings |

If the propellant load falls short, the tank reacts. When a design gets home, the integration lights come on in sequence.

## Science boundary

The depot's fictional details are never NASA evidence. The source drawer carries the required statement that the depot, Dr. Nadir, RIVO and their workshop are fictional, and that NASA does not operate or endorse the depot. The deterministic engine still models the journey through Earth orbit.

## Not built yet

Dynamic challenges, where the challenge composer changes which sectors and modules are available. These would add mission values, so they wait for the science review. Today, the Communications Loft, Module Storage and Docking Ring are scenery with no decisions attached.
