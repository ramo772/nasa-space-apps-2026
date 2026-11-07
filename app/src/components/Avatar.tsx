import type { Accent } from "../app/gameState";
import tokens from "../../../design/tokens.json";

export const AVATAR_COUNT = 6;
export const ACCENTS: readonly Accent[] = ["cyan", "orange", "green", "coral", "cream"];

const C = tokens.color;
export const ACCENT_COLOR: Record<Accent, string> = {
  cyan: C.primary,
  orange: C.accent,
  green: C.success,
  coral: C.danger,
  cream: C.text,
};

const SKIN = ["#8D5A3C", "#C68A5E", "#5A3825", "#E3B48F", "#7A4A2E", "#A9704A"];
const HAIR = "#1E1A22";

const EYES = "#1B1420";

/** Eyes and a small smile, so every crew member has a face. */
const faceMarkup = (y: number) =>
  `<circle cx="27.5" cy="${y}" r="1.5" fill="${EYES}"/><circle cx="36.5" cy="${y}" r="1.5" fill="${EYES}"/><path d="M28 ${y + 6}q4 3 8 0" fill="none" stroke="${EYES}" stroke-width="1.4" stroke-linecap="round"/>`;

/** Original crew heads on a 64-unit grid: a mix of hair, a head scarf and a full helmet, with no gender to choose. */
function headMarkup(id: number) {
  const skin = SKIN[id % SKIN.length];
  switch (id % AVATAR_COUNT) {
    case 0:
      return `<circle cx="32" cy="27" r="13" fill="${skin}"/><path d="M18 26c-2-12 8-17 14-17s16 5 14 17c-3-6-7-8-14-8s-11 2-14 8z" fill="${HAIR}"/><circle cx="20" cy="17" r="4" fill="${HAIR}"/><circle cx="28" cy="11" r="4" fill="${HAIR}"/><circle cx="37" cy="11" r="4" fill="${HAIR}"/><circle cx="44" cy="17" r="4" fill="${HAIR}"/>${faceMarkup(27)}`;
    case 1:
      return `<path d="M15 28c0-12 7-20 17-20s17 8 17 20c0 10-4 16-6 20H21c-2-4-6-10-6-20z" fill="${C.surfaceRaised}"/><ellipse cx="32" cy="29" rx="10.5" ry="12" fill="${skin}"/>${faceMarkup(28)}`;
    case 2:
      return `<circle cx="32" cy="27" r="13" fill="${skin}"/><path d="M19 24c1-9 7-13 13-13s12 4 13 13c-4-4-8-5-13-5s-9 1-13 5z" fill="${HAIR}"/>${faceMarkup(28)}<circle cx="27.5" cy="28" r="3.6" fill="none" stroke="${C.text}" stroke-width="1.6"/><circle cx="36.5" cy="28" r="3.6" fill="none" stroke="${C.text}" stroke-width="1.6"/><path d="M31.1 28h1.8" stroke="${C.text}" stroke-width="1.6"/>`;
    case 3:
      return `<path d="M16 46V27c0-11 7-18 16-18s16 7 16 18v19z" fill="${HAIR}"/><circle cx="32" cy="28" r="12" fill="${skin}"/><path d="M20 26c2-7 7-10 12-10s10 3 12 10c-5-3-8-4-12-4s-7 1-12 4z" fill="${HAIR}"/>${faceMarkup(28)}`;
    case 4:
      return `<circle cx="32" cy="26" r="13" fill="${skin}"/><path d="M19 28c0 9 6 14 13 14s13-5 13-14c-2 3-5 4-7 3-2-1-4-1-6-1s-4 0-6 1c-2 1-5 0-7-3z" fill="${HAIR}"/><path d="M19 23c1-8 7-11 13-11s12 3 13 11c-5-3-8-4-13-4s-8 1-13 4z" fill="${HAIR}"/><circle cx="27.5" cy="25" r="1.5" fill="${EYES}"/><circle cx="36.5" cy="25" r="1.5" fill="${EYES}"/><path d="M29 33q3 2 6 0" fill="none" stroke="${C.text}" stroke-width="1.4" stroke-linecap="round"/>`;
    default:
      return `<circle cx="32" cy="27" r="16" fill="${C.text}"/><path d="M20 26c0-6 5-10 12-10s12 4 12 10-5 11-12 11-12-5-12-11z" fill="${C.background}"/><path d="M24 24c2-3 5-4 8-4" fill="none" stroke="${C.primary}" stroke-width="2" stroke-linecap="round"/>`;
  }
}

/** A full-body crew figure, used for the player's character in the 3D room. */
export function figureSvg(id: number, accent: Accent) {
  const suit = ACCENT_COLOR[accent];
  const skin = SKIN[id % SKIN.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="940" viewBox="0 0 200 470">
    <path d="M58 190c0-28 18-44 42-44s42 16 42 44v86H58z" fill="${C.background}"/>
    <path d="M58 190c0-22 10-36 24-41l6 127H58zM142 190c0-22-10-36-24-41l-6 127h30z" fill="${suit}"/>
    <rect x="89" y="118" width="22" height="36" fill="${id % AVATAR_COUNT === 5 ? C.mutedText : skin}"/>
    <path d="M86 150h28l-4 30H90z" fill="${C.text}"/>
    <path d="M60 180c-12 10-20 40-22 86l16 4c2-30 6-50 14-66z" fill="${suit}"/>
    <path d="M140 180c12 10 20 40 22 86l-16 4c-2-30-6-50-14-66z" fill="${suit}"/>
    <ellipse cx="44" cy="274" rx="10" ry="12" fill="${C.background}"/><ellipse cx="156" cy="274" rx="10" ry="12" fill="${C.background}"/>
    <rect x="58" y="262" width="84" height="16" rx="4" fill="${C.surfaceRaised}"/>
    <path d="M60 278h38l-4 152H68zM102 278h38l-8 152h-26z" fill="${C.background}"/>
    <path d="M70 330h20v8H70zM110 330h20v8h-20z" fill="${suit}"/>
    <path d="M60 428h40v22H52c0-12 2-18 8-22zM102 428h38c6 4 8 10 8 22h-46z" fill="${C.text}"/>
    <path d="M52 448h48v10H52zM102 448h46v10h-46z" fill="${C.primary}"/>
    <g transform="translate(46 72) scale(1.7)">${headMarkup(id)}</g>
  </svg>`;
}

export function Avatar({ id, accent, size = 64 }: { id: number; accent: Accent; size?: number }) {
  return (
    <svg className="avatar" viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill={C.surface} />
      <path d="M8 64c0-14 10-22 24-22s24 8 24 22z" fill={C.background} />
      <path d="M8 64c0-9 4-15 11-19l3 19zM56 64c0-9-4-15-11-19l-3 19z" fill={ACCENT_COLOR[accent]} />
      <path d="M26 42h12l-2 6h-8z" fill={C.text} />
      <g dangerouslySetInnerHTML={{ __html: headMarkup(id) }} />
    </svg>
  );
}
