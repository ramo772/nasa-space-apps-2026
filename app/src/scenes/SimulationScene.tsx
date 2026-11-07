import type { Dispatch } from "react";
import type { GameAction, GameState } from "../app/gameState";
import { Dialogue, useAutoFocus } from "../components/common";
import { Meters } from "../components/Meters";
import type { DrawerRequest } from "../components/SourceDrawer";
import type { Line } from "../content/script";
import { SCENARIO } from "../content/scenario";
import { evaluate, simulate, snapshot, transfer, type Checkpoint, type Design } from "../domain/rules";
import { useI18n, type I18n } from "../i18n";
import type { TranslationKey } from "../i18n/en";

function narration(point: Checkpoint, design: Design, { n }: I18n): Line {
  const path = transfer(SCENARIO, design.destination);
  if (point.failure) {
    return { speaker: "rivo", face: "warning", key: `failure.${point.failure}` as TranslationKey, sound: "sim.warning.sound" };
  }
  const params = {
    dv: n.kms(point.id === "departure" ? path.burn1 : path.burn2),
    left: n.kg(point.propellantLeftKg),
    time: n.days(point.days),
  };
  const key = point.id === "crossing" ? (design.engine === "electric" ? "sim.crossingElec" : "sim.crossingChem") : `sim.${point.id}`;
  return { speaker: "rivo", face: "curious", profileKey: key, params };
}

export function SimulationScene({
  state,
  checkpoint,
  dispatch,
  onSources,
  reducedMotion,
}: {
  state: GameState;
  checkpoint: number;
  dispatch: Dispatch<GameAction>;
  onSources: (request: DrawerRequest) => void;
  reducedMotion: boolean;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const design = state.choices as Design;
  const points = simulate(SCENARIO, design);
  const point = points[checkpoint]!;
  const before = checkpoint > 0 ? points[checkpoint - 1] : null;
  const failed = Boolean(point.failure);
  const last = checkpoint === points.length - 1 || failed;
  const next = useAutoFocus<HTMLButtonElement>(`checkpoint-${checkpoint}`);
  const full = evaluate(SCENARIO, design);
  const base = snapshot(SCENARIO, design);

  return (
    <>
      <Meters
        now={{ ...base, propellantLeftKg: point.propellantLeftKg, days: point.days }}
        before={before ? { ...base, propellantLeftKg: before.propellantLeftKg, days: before.days } : { ...base, propellantLeftKg: full.load, days: 0 }}
        difficulty={state.difficulty}
        reducedMotion={reducedMotion}
        load={full.load}
      />
      <section className="dock">
        <div className="checkpoint-stack">
          <div className="checkpoint-head">
            <p className="checkpoint-count">{t("sim.count", { current: checkpoint + 1, total: points.length })}</p>
            <h2>{t(`sim.${point.id}` as TranslationKey)}</h2>
          </div>
          <Dialogue line={narration(point, design, i18n)} />
        </div>
        <div className="dock-actions">
          <button ref={next} type="button" className="primary-button" onClick={() => dispatch(failed ? { type: "finish-simulation" } : { type: "next-checkpoint" })}>
            {last ? t("sim.finish") : t("sim.continue")}
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => onSources({ title: t("sim.sources"), valueIds: ["earth-gm", "standard-gravity", "start-apogee", "chemical-isp", "electric-isp", "thrust-per-kw"], limitations: true })}
          >
            {t("ui.sources")}
          </button>
        </div>
      </section>
    </>
  );
}
