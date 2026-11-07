/**
 * DISPOSABLE SPIKE VALUES. Copied from docs/research/rule-table-draft.md, which is not approved.
 * Do not import this file into app/.
 */
const SPECIFIC_POWER_W_PER_KG = 30;
const LIFE_SUPPORT_KW = 5;

export const ARRAY_OPTIONS = [10, 40] as const;
export type ArrayKw = (typeof ARRAY_OPTIONS)[number];

export const MAX_ENGINE_KW = Math.max(...ARRAY_OPTIONS) - LIFE_SUPPORT_KW;

/** Each array wing has four panels, so panel area matches the 1:4 power ratio. */
export const openPanels = (arrayKw: ArrayKw) => arrayKw / 10;

export const consequence = (arrayKw: ArrayKw) => ({
  lifeSupportKw: LIFE_SUPPORT_KW,
  engineKw: arrayKw - LIFE_SUPPORT_KW,
  arrayMassKg: Math.round((arrayKw * 1000) / SPECIFIC_POWER_W_PER_KG),
});
