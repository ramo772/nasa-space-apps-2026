import type { Dispatch } from "react";
import type { GameAction, GameState } from "../app/gameState";
import { Dialogue, ProvenanceChip, useAutoFocus } from "../components/common";
import { Meters } from "../components/Meters";
import type { DrawerRequest } from "../components/SourceDrawer";
import { SCENARIO } from "../content/scenario";
import { snapshot, valueOf } from "../domain/rules";
import { useI18n } from "../i18n";

export function DiagnosisScene({
  state,
  dispatch,
  onSources,
}: {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  onSources: (request: DrawerRequest) => void;
}) {
  const { t, n } = useI18n();
  const go = useAutoFocus<HTMLButtonElement>("diagnosis");
  return (
    <>
      <Meters now={snapshot(SCENARIO, {})} difficulty={state.difficulty} reducedMotion load={null} />
      <section className="dock">
        <Dialogue line={{ speaker: "rivo", face: "curious", profileKey: "diagnosis.line" }} />
        <div className="facts">
          <div className="fact">
            <h2>{t("diagnosis.where")}</h2>
            <p>{t("diagnosis.whereText", { perigee: n.km(valueOf(SCENARIO, "start-perigee")), apogee: n.km(valueOf(SCENARIO, "start-apogee")) })}</p>
            <ProvenanceChip kind="nasa-source" />
          </div>
          <div className="fact">
            <h2>{t("diagnosis.have")}</h2>
            <p>{t("diagnosis.haveText", { supplies: valueOf(SCENARIO, "supplies-limit"), power: valueOf(SCENARIO, "life-support") })}</p>
            <ProvenanceChip kind="fiction" />
          </div>
          <div className="fact">
            <h2>{t("diagnosis.workshop")}</h2>
            <p>{t("diagnosis.workshopText")}</p>
            <ProvenanceChip kind="fiction" />
          </div>
        </div>
        <div className="dock-actions">
          <button ref={go} type="button" className="primary-button" onClick={() => dispatch({ type: "finish-diagnosis" })}>{t("diagnosis.start")}</button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => onSources({ title: t("diagnosis.sources"), valueIds: ["start-perigee", "start-apogee", "earth-gm", "earth-radius", "supplies-limit", "life-support"], limitations: true })}
          >
            {t("ui.sources")}
          </button>
        </div>
      </section>
    </>
  );
}
