import { useEffect, useRef, type ReactNode } from "react";
import type { GameState } from "../app/gameState";
import { rolesFor } from "../app/gameState";
import type { Line } from "../content/script";
import { useI18n, type I18n } from "../i18n";
import type { TranslationKey } from "../i18n/en";
import { Avatar } from "./Avatar";

/** Moves keyboard focus to the main control whenever a screen or step changes. */
export function useAutoFocus<T extends HTMLElement>(key: unknown) {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, [key]);
  return ref;
}

export type ProvenanceKind = "nasa-source" | "game-rule" | "fiction" | "player-result";

const PROVENANCE_ICON: Record<ProvenanceKind, ReactNode> = {
  "nasa-source": <path d="M5 3h10l4 4v14H5zM8 11h8M8 15h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />,
  "game-rule": <path d="M4 9h16v8a3 3 0 0 1-5 2l-2-2h-2l-2 2a3 3 0 0 1-5-2zM8 11v4M6 13h4M16 12h.01M18 14h.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  fiction: <path d="M12 3l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" fill="currentColor" />,
  "player-result": <><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="3" fill="currentColor" /></>,
};

export function ProvenanceChip({ kind }: { kind: ProvenanceKind }) {
  const { t } = useI18n();
  return (
    <span className={`chip chip-${kind}`}>
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">{PROVENANCE_ICON[kind]}</svg>
      {t(`provenance.${kind}` as TranslationKey)}
    </span>
  );
}

const portrait = (line: Line) => `${import.meta.env.BASE_URL}characters/${line.speaker}-${line.face}.webp`;

export const lineText = (line: Line, { t, tp }: I18n) =>
  line.text ?? (line.profileKey ? tp(line.profileKey, line.params) : line.key ? t(line.key, line.params) : "");

export function Dialogue({ line, children }: { line: Line; children?: ReactNode }) {
  const i18n = useI18n();
  return (
    <div className={`dialogue speaker-${line.speaker}`} data-testid="dialogue">
      <img className="portrait" src={portrait(line)} alt="" width="104" height="104" />
      <div className="dialogue-body" aria-live="polite">
        <p className="speaker">{line.speaker === "nadir" ? i18n.t("ui.dialogNadir") : i18n.rivoName}</p>
        <p className="line">{lineText(line, i18n)}</p>
        {line.sound && <p className="sound-caption">{i18n.t(line.sound)}</p>}
        {children}
      </div>
    </div>
  );
}

/** The name shown for a player. A callsign if they chose one, otherwise "Player 1". */
export const playerName = (state: GameState, index: number, { t }: I18n) =>
  state.crew[index]?.callsign.trim() || t("crew.playerName", { number: index + 1 });

export function CrewRail({ state }: { state: GameState }) {
  const i18n = useI18n();
  const roles = rolesFor(state.crew.length);
  return (
    <aside className="crew-rail" aria-label={i18n.t("crew.rail")} data-testid="crew-rail">
      {state.crew.map((member, index) => (
        <div key={index} className="crew-member">
          <Avatar id={member.avatar} accent={member.accent} size={40} />
          <div>
            {state.mode === "crew" ? (
              <>
                <strong>{playerName(state, index, i18n)}</strong>
                <small>{(roles[index] ?? []).map((role) => i18n.t(`role.${role}` as TranslationKey)).join(" / ")}</small>
              </>
            ) : (
              <>
                <strong>{member.callsign.trim() || i18n.t("role.designer")}</strong>
                {member.callsign.trim() && <small>{i18n.t("role.designer")}</small>}
              </>
            )}
          </div>
        </div>
      ))}
      {state.rivoCallsign.trim() && <p className="rivo-callsign">{i18n.t("ui.rivoCallsign", { callsign: state.rivoCallsign.trim() })}</p>}
    </aside>
  );
}
