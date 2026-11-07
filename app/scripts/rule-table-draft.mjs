// Calculates every design in docs/research/rule-table-draft.md. DRAFT: not an approved model.
// Run: node scripts/rule-table-draft.mjs

const SECONDS_PER_DAY = 86400;

// NASA-sourced values. IDs refer to docs/research/source-register.md.
const MU = 398600.435507; // km^3/s^2, DATA-015
const G0 = 9.8; // m/s^2, DATA-026
const EARTH_RADIUS = 6378.137; // km, DATA-016
const START = { perigee: 123787.3326, apogee: 362530.5369 }; // km from Earth's center, DATA-014
const KM_PER_MILE = 1.609344; // exact definition, unit conversion only
const GEO_ALTITUDE = 22236 * KM_PER_MILE; // km, DATA-024
const LOW_ORBIT_ALTITUDE = 415; // km, midpoint of 370-460 km, DATA-028
const THRUST_PER_KW = 0.075; // N/kW, upper bound of "below 75 mN/kW", DATA-018
const ARRAY_SPECIFIC_POWER = 30; // W/kg, DATA-019
const ISP = { chemical: 235, electric: 1500 }; // s, DATA-018 (hydrazine text; Hall-effect range 200-1,920)

// FICTION: story inputs chosen to create a trade-off. No NASA source supplies these.
const DRY_MASS_WITHOUT_ARRAY = 6000; // kg
const PROPELLANT_LOAD = { chemical: 26000, electric: 3000 }; // kg
const LIFE_SUPPORT_POWER = 5000; // W
const SUPPLIES_DAYS = 180; // days

const speed = (radius, semiMajor) => Math.sqrt(MU * (2 / radius - 1 / semiMajor)); // km/s

/** Two burns: at apogee to lower perigee, then at the new perigee to circularize. Coplanar. */
export function transfer(targetRadius) {
  const startA = (START.perigee + START.apogee) / 2;
  const transferA = (START.apogee + targetRadius) / 2;
  const burn1 = speed(START.apogee, startA) - speed(START.apogee, transferA);
  const burn2 = speed(targetRadius, transferA) - speed(targetRadius, targetRadius);
  return {
    deltaV: burn1 + burn2, // km/s
    coastDays: (Math.PI * Math.sqrt(transferA ** 3 / MU)) / SECONDS_PER_DAY,
  };
}

const ORBITS = {
  low: EARTH_RADIUS + LOW_ORBIT_ALTITUDE,
  geosynchronous: EARTH_RADIUS + GEO_ALTITUDE,
};

export function evaluate(propulsion, arrayWatts, home) {
  const { deltaV, coastDays } = transfer(ORBITS[home]);
  const dryMass = DRY_MASS_WITHOUT_ARRAY + arrayWatts / ARRAY_SPECIFIC_POWER;
  const exhaust = ISP[propulsion] * G0; // m/s
  const massRatio = Math.exp((deltaV * 1000) / exhaust);
  const load = PROPELLANT_LOAD[propulsion];
  // The whole load is carried from the start, so unused propellant is part of the final mass.
  const propellantUsed = (dryMass + load) * (1 - 1 / massRatio);
  const spareWatts = arrayWatts - LIFE_SUPPORT_POWER;
  const thrust = (spareWatts / 1000) * THRUST_PER_KW; // N
  const days =
    propulsion === "chemical" ? coastDays : (propellantUsed * exhaust) / thrust / SECONDS_PER_DAY;
  const reachesOrbit = propellantUsed <= load && days <= SUPPLIES_DAYS;
  return {
    propulsion,
    arrayWatts,
    home,
    deltaV,
    dryMass,
    propellantNeeded: propellantUsed,
    propellantMargin: load - propellantUsed,
    spareWatts,
    days,
    result: !reachesOrbit ? "infeasible" : home === "low" ? "feasible" : "partial",
  };
}

export function allDesigns() {
  return ["chemical", "electric"].flatMap((propulsion) =>
    [10000, 40000].flatMap((arrayWatts) =>
      ["low", "geosynchronous"].map((home) => evaluate(propulsion, arrayWatts, home)),
    ),
  );
}

if (process.argv[1]?.endsWith("rule-table-draft.mjs")) {
  const rank = { infeasible: 0, partial: 1, feasible: 2 };
  const designs = allDesigns();

  console.log("orbits", Object.entries(ORBITS).map(([k, r]) => `${k}: r=${r.toFixed(1)} km, dv=${transfer(r).deltaV.toFixed(3)} km/s, coast=${transfer(r).coastDays.toFixed(2)} d`).join(" | "));
  console.table(
    designs.map((d) => ({
      propulsion: d.propulsion,
      array_kW: d.arrayWatts / 1000,
      home: d.home,
      dv_kms: +d.deltaV.toFixed(3),
      dry_kg: Math.round(d.dryMass),
      prop_used_kg: Math.round(d.propellantNeeded),
      prop_margin_kg: Math.round(d.propellantMargin),
      spare_kW: d.spareWatts / 1000,
      days: +d.days.toFixed(1),
      result: d.result,
    })),
  );

  // Dominance check: an option is dominant if it never scores worse than its alternative.
  const keys = { propulsion: ["chemical", "electric"], arrayWatts: [10000, 40000], home: ["low", "geosynchronous"] };
  for (const [key, [a, b]] of Object.entries(keys)) {
    let aBetter = 0;
    let bBetter = 0;
    for (const d of designs.filter((x) => x[key] === a)) {
      const other = designs.find((x) => x[key] === b && Object.keys(keys).every((k) => k === key || x[k] === d[k]));
      if (rank[d.result] > rank[other.result]) aBetter += 1;
      if (rank[other.result] > rank[d.result]) bBetter += 1;
    }
    console.log(`${key}: ${a} better in ${aBetter}, ${b} better in ${bBetter} -> ${aBetter && bBetter ? "no dominant option" : "DOMINANT OPTION OR NO EFFECT"}`);
  }
}
