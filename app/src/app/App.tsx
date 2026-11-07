import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { audio } from "../audio/audioManager";
import { CrewRail } from "../components/common";
import { JourneyBar } from "../components/JourneyBar";
import { SettingsDialog } from "../components/SettingsDialog";
import { SourceDrawer, type DrawerRequest } from "../components/SourceDrawer";
import { SCENARIO } from "../content/scenario";
import { evaluate, type Design } from "../domain/rules";
import { I18nProvider, makeI18n, useI18n } from "../i18n";
import { DecisionScene } from "../scenes/DecisionScene";
import { DiagnosisScene } from "../scenes/DiagnosisScene";
import { OnboardingScene } from "../scenes/OnboardingScene";
import { ReviewScene } from "../scenes/ReviewScene";
import { SimulationScene } from "../scenes/SimulationScene";
import { StoryScene } from "../scenes/StoryScene";
import { TitleScene } from "../scenes/TitleScene";
import { Stage } from "../visual/Stage";
import { stageFor } from "../visual/stageState";
import { gameReducer } from "./gameReducer";
import { DECISION_ORDER } from "./gameState";
import { loadInitialState, saveProfile, useSettings } from "./settings";

export function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadInitialState);
  const { settings, update, reducedMotion } = useSettings();
  const [drawer, setDrawer] = useState<DrawerRequest | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const stage = useMemo(() => stageFor(state), [state]);
  const { lang, profile, difficulty, mode, crew, rivoCallsign } = state;
  // The player's name, used by the characters and shown above their figure in the room.
  const base = makeI18n(lang, profile);
  const callsigns = crew.map((member) => member.callsign.trim());
  const player = mode === "solo" ? callsigns[0] : base.t("story.crewName");
  const names = crew.map((_, index) => callsigns[index] || (mode === "crew" ? base.t("crew.playerName", { number: index + 1 }) : base.t("role.designer")));

  useEffect(() => audio.setLevels(settings.levels), [settings.levels]);
  useEffect(() => saveProfile({ lang, profile, difficulty, mode, crew, rivoCallsign }), [lang, profile, difficulty, mode, crew, rivoCallsign]);

  // Right-to-left comes from the document direction, so components never need to be duplicated.
  useEffect(() => {
    document.documentElement.lang = lang === "ar" ? "ar-EG" : "en";
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = makeI18n(lang, profile).t("title.small") + " Meat-a-roid";
  }, [lang, profile]);

  // Sound follows game events. Every meaningful cue also has a caption or visible state.
  const { phase, pulse, pending } = state;
  const lastPhase = useRef(phase.name);
  const lastPulse = useRef(pulse);
  useEffect(() => {
    if (pending) audio.play("select");
  }, [pending]);
  useEffect(() => {
    if (pulse !== lastPulse.current) {
      lastPulse.current = pulse;
      if (phase.name === "decision") {
        audio.play("confirm");
        audio.play("connection");
      }
      if (phase.name === "simulation") audio.play("burn");
    }
  }, [pulse, phase.name]);
  useEffect(() => {
    if (phase.name === lastPhase.current) return;
    lastPhase.current = phase.name;
    if (phase.name === "incident") audio.play("reveal");
    if (phase.name === "diagnosis") audio.startMusic();
    if (phase.name === "review") {
      const result = evaluate(SCENARIO, state.choices as Design).result;
      audio.play(result === "feasible" ? "resolve" : "encourage");
    }
    if (phase.name === "title") audio.stopMusic();
  }, [phase.name, state.choices]);

  const openSources = (request: DrawerRequest) => {
    audio.play("source");
    setDrawer(request);
  };

  const inMission = phase.name === "diagnosis" || phase.name === "decision" || phase.name === "simulation";

  return (
    <I18nProvider lang={lang} profile={profile} player={player} rivoCallsign={rivoCallsign.trim()}>
      <main className={`game phase-${phase.name}`}>
        <Stage stage={stage} reducedMotion={reducedMotion} crew={crew} names={names} />

        <header className="topbar">
          {inMission ? <JourneyBar phase={phase} /> : <span />}
          {phase.name !== "title" && phase.name !== "onboarding" && <SettingsButton onClick={() => setSettingsOpen(true)} />}
        </header>

        {inMission && <CrewRail state={state} />}

        {phase.name === "title" && (
          <TitleScene
            onStart={() => {
              audio.unlock();
              audio.startMusic();
              dispatch({ type: "start" });
            }}
            onSettings={() => setSettingsOpen(true)}
          />
        )}
        {phase.name === "onboarding" && <OnboardingScene state={state} dispatch={dispatch} />}
        {phase.name === "opening" && <StoryScene kind="opening" beat={phase.beat} state={state} dispatch={dispatch} />}
        {phase.name === "incident" && <StoryScene kind="incident" beat={phase.beat} state={state} dispatch={dispatch} />}
        {phase.name === "diagnosis" && <DiagnosisScene state={state} dispatch={dispatch} onSources={openSources} />}
        {phase.name === "decision" && DECISION_ORDER[phase.index] && (
          <DecisionScene
            key={`${state.log.length}-${phase.index}`}
            state={state}
            index={phase.index}
            stageName={phase.stage}
            dispatch={dispatch}
            onSources={openSources}
            reducedMotion={reducedMotion}
          />
        )}
        {phase.name === "simulation" && (
          <SimulationScene state={state} checkpoint={phase.checkpoint} dispatch={dispatch} onSources={openSources} reducedMotion={reducedMotion} />
        )}
        {phase.name === "review" && <ReviewScene state={state} dispatch={dispatch} onSources={openSources} />}

        <SourceDrawer request={drawer} onClose={() => setDrawer(null)} />
        <SettingsDialog
          open={settingsOpen}
          settings={settings}
          update={update}
          lang={lang}
          onLanguage={(next) => dispatch({ type: "set-language", lang: next })}
          onClose={() => setSettingsOpen(false)}
          onQuit={
            phase.name === "title"
              ? undefined
              : () => {
                  setSettingsOpen(false);
                  dispatch({ type: "restart" });
                }
          }
        />
      </main>
    </I18nProvider>
  );
}

function SettingsButton({ onClick }: { onClick: () => void }) {
  const { t } = useI18n();
  return (
    <button type="button" className="ghost-button" onClick={onClick}>
      {t("ui.settings")}
    </button>
  );
}
