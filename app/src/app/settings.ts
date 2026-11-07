import { useCallback, useEffect, useState } from "react";
import type { Levels } from "../audio/audioManager";
import type { Lang } from "../i18n";
import { initialState, type CrewMember, type Difficulty, type GameState, type PlayMode, type Profile } from "./gameState";

export interface Settings {
  levels: Levels;
  reducedMotion: boolean;
}

const SETTINGS_KEY = "odyssey-settings-v1";
const PROFILE_KEY = "odyssey-profile-v1";
const DEFAULTS: Settings = { levels: { music: 0.6, tones: 0.8, effects: 0.8 }, reducedMotion: false };

function load(): Settings {
  try {
    const saved = window.localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...DEFAULTS, ...(JSON.parse(saved) as Partial<Settings>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

/** Sound and motion preferences. */
export function useSettings() {
  const [settings, setSettings] = useState(load);
  const [systemReduced, setSystemReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const update = useCallback((change: Partial<Settings>) => {
    setSettings((current) => {
      const next = { ...current, ...change };
      try {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        // Storage can be blocked. The setting still applies for this session.
      }
      return next;
    });
  }, []);

  return { settings, update, reducedMotion: systemReduced || settings.reducedMotion };
}

interface SavedProfile {
  lang: Lang;
  profile: Profile;
  difficulty: Difficulty;
  mode: PlayMode;
  crew: CrewMember[];
  rivoCallsign: string;
}

/** Restores the player's profile. It stays on this device and is never sent anywhere. */
export function loadInitialState(): GameState {
  try {
    const saved = window.localStorage.getItem(PROFILE_KEY);
    return saved ? { ...initialState, ...(JSON.parse(saved) as Partial<SavedProfile>) } : initialState;
  } catch {
    return initialState;
  }
}

const REVEAL_KEY = "odyssey-seen-reveal";

export function hasSeenReveal() {
  try {
    return window.localStorage.getItem(REVEAL_KEY) === "1";
  } catch {
    return false;
  }
}

export function markRevealSeen() {
  try {
    window.localStorage.setItem(REVEAL_KEY, "1");
  } catch {
    // Storage can be blocked. The reveal simply plays in full again.
  }
}

export function saveProfile(saved: SavedProfile) {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(saved));
  } catch {
    // Storage can be blocked. The profile still applies for this session.
  }
}
