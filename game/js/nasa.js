// Turns a JPL Close Approach Data API payload into the one shape the game uses.
// A later official resource list can replace the server URL and still return these fields.

export function parseCad(payload) {
  const fields = payload?.fields;
  const rows = payload?.data;
  if (!Array.isArray(fields) || !Array.isArray(rows)) {
    throw new Error("Close-approach payload is missing fields or data.");
  }
  const index = Object.fromEntries(fields.map((name, position) => [name, position]));
  for (const name of ["des", "cd", "dist", "v_rel", "fullname", "diameter"]) {
    if (index[name] == null) throw new Error(`Close-approach payload has no ${name} field.`);
  }

  return rows.flatMap((row) => {
    const distAu = Number(row[index.dist]);
    const vRelKmS = Number(row[index.v_rel]);
    if (!Number.isFinite(distAu) || !Number.isFinite(vRelKmS)) return [];
    const rawDiameter = row[index.diameter];
    const diameterKm = rawDiameter == null || rawDiameter === "" ? null : Number(rawDiameter);
    const id = String(row[index.des]).trim();
    const name = String(row[index.fullname] || "").trim() || id;
    return [{
      id,
      name,
      when: String(row[index.cd] || "").trim(),
      distAu,
      vRelKmS,
      diameterKm: Number.isFinite(diameterKm) ? diameterKm : null,
    }];
  });
}

export function sortByDistance(targets) {
  return [...targets].sort((a, b) => a.distAu - b.distAu || a.vRelKmS - b.vRelKmS);
}
