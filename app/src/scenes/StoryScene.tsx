import { useEffect, type Dispatch } from "react";
import type { GameAction, GameState } from "../app/gameState";
import { hasSeenReveal, markRevealSeen } from "../app/settings";
import { Dialogue, useAutoFocus } from "../components/common";
import { INCIDENT, OPENING } from "../content/script";
import { useI18n } from "../i18n";

export function StoryScene({
  kind,
  beat,
  state,
  dispatch,
}: {
  kind: "opening" | "incident";
  beat: number;
  state: GameState;
  dispatch: Dispatch<GameAction>;
}) {
  const { t } = useI18n();
  const lines = kind === "opening" ? OPENING : INCIDENT;
  const line = lines[beat];
  const next = useAutoFocus<HTMLButtonElement>(`${kind}-${beat}`);
  const last = beat + 1 >= lines.length;
  const revealFinished = kind === "incident" && last;
  useEffect(() => {
    if (revealFinished) markRevealSeen();
  }, [revealFinished]);

  if (!line) return null;
  // RIVO addresses the player by callsign, filled in here on the device.
  const callsign = state.mode === "solo" ? state.crew[0]?.callsign.trim() : "";
  const designer = callsign || t(state.mode === "crew" ? "story.crewDefault" : "story.designerDefault");
  // The first viewing plays in full, one step at a time. After that, it can be skipped.
  const canSkip = !last && (kind === "opening" || hasSeenReveal());

  return (
    <section className="dock story-dock">
      {revealFinished && (
        <div className="title-card" data-testid="title-card">
          <p className="title-card-name" dir="ltr">THE ODYSSEY OF A <span>MEAT-A-ROID</span></p>
          <p className="title-card-objective">{t("story.objective")}</p>
        </div>
      )}
      <Dialogue line={{ ...line, params: { designer } }} />
      <div className="dock-actions">
        <button ref={next} type="button" className="primary-button" onClick={() => dispatch({ type: "next-beat", total: lines.length })}>
          {!last ? t("ui.next") : kind === "opening" ? t("story.toIncident") : t("story.toProblem")}
        </button>
        {canSkip && (
          <button type="button" className="ghost-button" onClick={() => dispatch({ type: "skip-opening" })}>{t("ui.skip")}</button>
        )}
      </div>
    </section>
  );
}
