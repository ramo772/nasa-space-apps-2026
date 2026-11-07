// Picture coordinates for the voyage canvas.
// x grows to the right. This is an illustration, not an orbit frame.
// progress 0 is Earth. progress 1 is the visitor.

export function voyageX(progress, width) {
  const start = width * 0.2;
  const end = width * 0.78;
  const clamped = Math.max(0, Math.min(1, progress));
  return start + (end - start) * clamped;
}

// World z of the ship. Three.js camera looks down -z, so a larger
// progress is a smaller z: the ship flies toward the asteroid.
export function shipZ(progress) {
  const clamped = Math.max(0, Math.min(1, progress));
  return 4 + ( -8 - 4 ) * clamped;
}
