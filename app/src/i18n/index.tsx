import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Profile } from "../app/gameState";
import { ar, arScience } from "./ar";
import { en, type TranslationKey } from "./en";

export type Lang = "en" | "ar";
export type Params = Record<string, string | number>;

/** Keys that fell back to English in this session, so a missing translation can be reported. */
export const missingKeys = new Set<string>();

export function translate(lang: Lang, key: TranslationKey, params?: Params): string {
  let text: string | undefined = lang === "ar" ? ar[key] : en[key];
  if (text === undefined) {
    if (lang !== "en" && !missingKeys.has(key)) {
      missingKeys.add(key);
      console.warn(`Missing ${lang} translation: ${key}`);
    }
    text = en[key];
  }
  return params ? text.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`)) : text;
}

const LOCALES: Record<Lang, string> = { en: "en-US", ar: "ar-EG-u-nu-latn" };

/** Formats numbers for display only. Latin digits are kept in Arabic, so values match the sources exactly. */
export function numbers(lang: Lang) {
  // A left-to-right isolate keeps "3.62 km/s" in that order inside an Arabic sentence.
  const isolate = (text: string) => (lang === "ar" ? `\u2066${text}\u2069` : text);
  const format = (value: number, digits: number) =>
    new Intl.NumberFormat(LOCALES[lang], { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
  return {
    plain: (value: number, maximum = 3) => new Intl.NumberFormat(LOCALES[lang], { maximumFractionDigits: maximum }).format(value),
    kg: (value: number) => isolate(`${format(Math.abs(Math.round(value)), 0)} kg`),
    days: (value: number) => translate(lang, "unit.days", { value: format(value, 1) }),
    kms: (value: number) => isolate(`${format(value, 2)} km/s`),
    kw: (value: number) => isolate(`${format(Math.round(value), 0)} kW`),
    km: (value: number) => isolate(`${format(Math.round(value), 0)} km`),
  };
}

export type Numbers = ReturnType<typeof numbers>;

export interface Names {
  /** The player's callsign, or a friendly default. */
  player?: string;
  /** RIVO's optional unit callsign. */
  rivoCallsign?: string;
}

export interface I18n {
  lang: Lang;
  profile: Profile;
  rivoName: string;
  t: (key: TranslationKey, params?: Params) => string;
  /** The wording for the current learning profile. */
  tp: (key: string, params?: Params) => string;
  n: Numbers;
  /** Translates science text from the scenario pack, and keeps English where no translation exists. */
  science: (text: string) => string;
}

export function makeI18n(lang: Lang, profile: Profile, names: Names = {}): I18n {
  const player = names.player || translate(lang, "story.rookie");
  const withPlayer = (params?: Params): Params => ({ player, ...params });
  const rivo = translate(lang, "ui.dialogRivo");
  return {
    lang,
    profile,
    rivoName: names.rivoCallsign ? `${rivo} (${names.rivoCallsign})` : rivo,
    t: (key, params) => translate(lang, key, withPlayer(params)),
    tp: (key, params) => translate(lang, `${key}.${profile}` as TranslationKey, withPlayer(params)),
    n: numbers(lang),
    science: (text) => (lang === "ar" ? (arScience[text] ?? text) : text),
  };
}

const I18nContext = createContext<I18n>(makeI18n("en", "student"));

export function I18nProvider({ lang, profile, player, rivoCallsign, children }: { lang: Lang; profile: Profile; children: ReactNode } & Names) {
  const value = useMemo(() => makeI18n(lang, profile, { player, rivoCallsign }), [lang, profile, player, rivoCallsign]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
