import type { Dispatch } from "react";
import { DECISION_ORDER, leadFor, type DecisionId, type DecisionStage, type Difficulty, type GameAction, type GameState } from "../app/gameState";
import { Avatar } from "../components/Avatar";
import { Dialogue, playerName, ProvenanceChip, useAutoFocus } from "../components/common";
import { Meters } from "../components/Meters";
import type { DrawerRequest } from "../components/SourceDrawer";
import { consequenceText, nadirReaction } from "../content/script";
import { SCENARIO } from "../content/scenario";
import { calculationLines } from "../domain/explain";
import { arrayMassKg, propellantLoadKg, snapshot, valueOf, type Choices, type Snapshot } from "../domain/rules";
import { useI18n, type I18n } from "../i18n";
import type { TranslationKey } from "../i18n/en";

export const DECISION_SOURCES: Record<DecisionId, readonly string[]> = {
  destination: ["start-apogee", "start-perigee", "low-altitude", "geo-altitude", "earth-gm", "earth-radius"],
  engine: ["chemical-isp", "electric-isp", "standard-gravity", "chemical-load", "electric-load", "thrust-per-kw", "dry-mass", "supplies-limit"],
  array: ["array-small", "array-large", "array-specific-power", "life-support", "thrust-per-kw", "dry-mass"],
};

const SECTOR_KEY: Record<DecisionId, TranslationKey> = { destination: "sector.table", engine: "sector.propulsion", array: "sector.spine" };

/** Guided shows exact results, Standard shows direction only, and Systems shows no preview. */
function Preview({ difficulty, current, option }: { difficulty: Difficulty; current: Snapshot; option: Snapshot }) {
  const { t, n } = useI18n();
  if (difficulty === "systems") return null;
  const rows: [keyof Snapshot, TranslationKey, (value: number) => string, Difficulty[]][] = [
    ["propellantLeftKg", "preview.propellant", (value) => (value < 0 ? t("preview.short", { amount: n.kg(value) }) : n.kg(value)), ["guided", "standard"]],
    ["days", "preview.time", n.days, ["guided", "standard"]],
    ["powerKw", "preview.power", n.kw, ["standard"]],
    ["deltaV", "preview.deltaV", n.kms, ["guided", "standard"]],
  ];
  const lines = rows.flatMap(([key, label, format, modes]) => {
    const after = option[key];
    const before = current[key];
    if (!modes.includes(difficulty) || after === null || after === before) return [];
    if (difficulty === "guided") return [t(label, { value: format(after) })];
    if (before === null) return [];
    return [t(label, { value: t(after > before ? "preview.up" : "preview.down") })];
  });
  if (lines.length === 0) return null;
  return (
    <ul className="preview" data-testid="preview">
      {lines.map((line) => <li key={line}>{line}</li>)}
    </ul>
  );
}

const optionTitle = (id: string, { t }: I18n) => t(`option.${id}.title` as TranslationKey);

export function DecisionScene({
  state,
  index,
  stageName,
  dispatch,
  onSources,
  reducedMotion,
}: {
  state: GameState;
  index: number;
  stageName: DecisionStage;
  dispatch: Dispatch<GameAction>;
  onSources: (request: DrawerRequest) => void;
  reducedMotion: boolean;
}) {
  const i18n = useI18n();
  const { t, tp } = i18n;
  const id = DECISION_ORDER[index] as DecisionId;
  const scenario = SCENARIO.decisions.find((decision) => decision.id === id)!;
  const crew = state.mode === "crew";
  const lead = leadFor(id, state.crew.length);
  // The first player always holds the Mission Director role.
  const director = 0;
  const firstOption = useAutoFocus<HTMLInputElement>(`${id}-${stageName === "choosing"}`);
  const nextButton = useAutoFocus<HTMLButtonElement>(`${id}-${stageName}`);

  // Exact results before applying: Guided mode always, and the crew's proposal step in every mode.
  const showPending = Boolean(state.pending) && (stageName === "proposed" || (stageName === "choosing" && state.difficulty === "guided"));
  const beforeChoices: Choices = { ...state.choices };
  delete beforeChoices[id];
  const before = snapshot(SCENARIO, beforeChoices);
  const now = snapshot(SCENARIO, state.choices);
  const predicted = showPending ? snapshot(SCENARIO, { ...state.choices, [id]: state.pending as string }) : now;
  const engineForLoad = state.choices.engine ?? (showPending && id === "engine" ? (state.pending as "chemical" | "electric") : null);
  const load = engineForLoad ? propellantLoadKg(SCENARIO, engineForLoad) : null;
  const tab = t(`decision.${id}.tab` as TranslationKey);
  const sources = () => onSources({ title: t("sources.decision", { step: tab }), valueIds: DECISION_SOURCES[id], limitations: true });
  const leadName = playerName(state, lead.player, i18n);
  const prompt = `decision.${id}.prompt`;

  return (
    <>
      <Meters now={predicted} before={stageName === "consequence" ? before : null} difficulty={state.difficulty} reducedMotion={reducedMotion} load={load} />

      {stageName === "choosing" && (
        <section className="dock decision-dock" aria-label={tab}>
          <div className="dock-stack">
            {crew && (
              <p className="turn-banner" data-testid="turn-banner">
                <Avatar id={state.crew[lead.player]!.avatar} accent={state.crew[lead.player]!.accent} size={36} />
                <span>{t("crew.turn", { role: t(`role.${lead.role}` as TranslationKey), name: leadName })} {t("crew.investigate")}</span>
              </p>
            )}
            <p className="sector-chip" data-testid="sector">{t(SECTOR_KEY[id])}</p>
            <Dialogue line={{ speaker: "rivo", face: "curious", profileKey: prompt }} />
          </div>
          <form
            className="choice-form"
            onSubmit={(event) => {
              event.preventDefault();
              dispatch({ type: crew ? "propose" : "confirm" });
            }}
          >
            <fieldset className="choices">
              <legend className="sr-only">{tp(prompt)}</legend>
              {scenario.options.map((option, optionIndex) => (
                <label key={option.id} className={`choice ${state.pending === option.id ? "selected" : ""}`}>
                  <input
                    ref={optionIndex === 0 ? firstOption : undefined}
                    type="radio"
                    name={id}
                    checked={state.pending === option.id}
                    onChange={() => dispatch({ type: "highlight", option: option.id })}
                  />
                  <span className="choice-body">
                    <span className="choice-title">
                      <strong>{optionTitle(option.id, i18n)}</strong>
                      {state.previous?.[id] === option.id && <span className="last-time">{t("choose.lastTime")}</span>}
                    </span>
                    <span className="choice-text">{tp(`option.${option.id}.text`)}</span>
                    <span className="trade trade-up">{t(`option.${option.id}.benefit` as TranslationKey)}</span>
                    <span className="trade trade-down">{t(`option.${option.id}.cost` as TranslationKey)}</span>
                    <Preview difficulty={state.difficulty} current={now} option={snapshot(SCENARIO, { ...state.choices, [id]: option.id })} />
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="dock-actions">
              <button type="submit" className="primary-button" disabled={!state.pending}>
                {!state.pending ? t("choose.prompt") : t(crew ? "crew.propose" : "choose.confirm", { option: optionTitle(state.pending, i18n) })}
              </button>
              <button type="button" className="ghost-button" onClick={sources}>{t("ui.sources")}</button>
            </div>
          </form>
        </section>
      )}

      {stageName === "proposed" && state.pending && (
        <section className="dock proposal-dock" aria-label={tab} data-testid="proposal">
          <div className="proposal">
            <h2>{t("crew.proposed", { name: leadName, option: optionTitle(state.pending, i18n) })}</h2>
            <p>{t("crew.predicted")}</p>
            <Preview difficulty="guided" current={now} option={predicted} />
            <p className="discuss">{t("crew.discuss")}</p>
          </div>
          <div className="dock-actions">
            <button ref={nextButton} type="button" className="primary-button" onClick={() => dispatch({ type: "approve" })}>
              {t("crew.approve", { name: playerName(state, director, i18n) })}
            </button>
            <button type="button" className="ghost-button" onClick={() => dispatch({ type: "revise" })}>{t("crew.revise")}</button>
            <button type="button" className="ghost-button" onClick={sources}>{t("ui.sources")}</button>
          </div>
        </section>
      )}

      {stageName === "consequence" && (
        <section className="dock consequence-dock" aria-label={tab}>
          <Dialogue
            line={{
              speaker: "rivo",
              face: "pride",
              text: consequenceText(
                id,
                state.choices,
                now,
                id === "array" && state.choices.array === "large" ? arrayMassKg(SCENARIO, "large") - arrayMassKg(SCENARIO, "small") : arrayMassKg(SCENARIO, state.choices.array ?? "small"),
                i18n,
              ),
            }}
          >
            <div className="chip-row">
              <ProvenanceChip kind="player-result" />
              <ProvenanceChip kind="game-rule" />
            </div>
          </Dialogue>
          <Dialogue line={nadirReaction(id, now, valueOf(SCENARIO, "supplies-limit"))} />
          {(state.difficulty === "systems" || state.profile === "specialist") && (
            <ul className="calculations" data-testid="calculations" aria-label={t("calc.label")} dir="ltr">
              {calculationLines(SCENARIO, id, state.choices).map((line) => <li key={line}>{line}</li>)}
            </ul>
          )}
          <div className="dock-actions">
            <button ref={nextButton} type="button" className="primary-button" onClick={() => dispatch({ type: "continue" })}>
              {index + 1 < DECISION_ORDER.length ? t("choose.nextStep", { step: t(`decision.${DECISION_ORDER[index + 1] as DecisionId}.tab` as TranslationKey) }) : t("choose.fly")}
            </button>
            <button type="button" className="ghost-button" onClick={sources}>{t("ui.sources")}</button>
          </div>
        </section>
      )}
    </>
  );
}
