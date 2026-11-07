import { Component, lazy, Suspense, useMemo, useState, type ReactNode } from "react";
import type { CrewMember } from "../app/gameState";
import { useI18n, type I18n } from "../i18n";
import type { TranslationKey } from "../i18n/en";
import type { StageState } from "./stageState";
import { WorkshopStage } from "./WorkshopStage";

const Stage3D = lazy(() => import("./Stage3D"));

const canUseWebGL = () => {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
};

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const describe = (stage: StageState, { t }: I18n) =>
  [
    t("stage.workshop"),
    t(`stage.${stage.earth}` as TranslationKey),
    t(`stage.${stage.array}` as TranslationKey),
    t(`stage.${stage.engine ?? "none"}` as TranslationKey),
    t(`stage.nadir.${stage.nadirFace}` as TranslationKey),
  ].join(" ");

/** The stage never blocks play: if 3D is unavailable, the flat workshop takes over. */
export function Stage({ stage, reducedMotion, crew, names }: { stage: StageState; reducedMotion: boolean; crew: readonly CrewMember[]; names: readonly string[] }) {
  const i18n = useI18n();
  const [webgl] = useState(canUseWebGL);
  const [lost, setLost] = useState(false);
  const [ready, setReady] = useState(false);
  const flat = <WorkshopStage stage={stage} />;
  const { t } = i18n;
  const labels = useMemo(
    () => ({
      table: t("sector.table"),
      propulsion: t("sector.propulsion"),
      spine: t("sector.spine"),
      comms: t("sector.comms"),
      storage: t("sector.storage"),
      docking: t("sector.docking"),
    }),
    [t],
  );

  return (
    <div className="stage" role="img" aria-label={describe(stage, i18n)} data-ready={ready}>
      {webgl && !lost ? (
        <SceneBoundary fallback={flat}>
          <Suspense fallback={flat}>
            <Stage3D stage={stage} reducedMotion={reducedMotion} crew={crew} names={names} labels={labels} onReady={() => setReady(true)} onContextLost={() => setLost(true)} />
          </Suspense>
        </SceneBoundary>
      ) : (
        flat
      )}
    </div>
  );
}
