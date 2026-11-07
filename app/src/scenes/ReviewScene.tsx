import type { Dispatch } from "react";
import type { DecisionId, GameAction, GameState } from "../app/gameState";
import { CausalGraph } from "../components/CausalGraph";
import { CrewRail, Dialogue, ProvenanceChip, useAutoFocus } from "../components/common";
import type { DrawerRequest } from "../components/SourceDrawer";
import type { Line } from "../content/script";
import { SCENARIO } from "../content/scenario";
import { review, type Counterfactual } from "../domain/explain";
import { ALL_DESIGNS, evaluate, simulate, type Design } from "../domain/rules";
import { useI18n, type I18n } from "../i18n";
import type { TranslationKey } from "../i18n/en";
import { DECISION_SOURCES } from "./DecisionScene";

const title = (key: DecisionId, design: Design, { t }: I18n) => t(`option.${design[key]}.title` as TranslationKey);

const CLOSING: Record<string, Line[]> = {
  feasible: [
    { speaker: "nadir", face: "delighted", key: "close.feasible1" },
    { speaker: "rivo", face: "deadpan", key: "close.feasible2" },
  ],
  partial: [
    { speaker: "nadir", face: "confident", key: "close.partial1" },
    { speaker: "rivo", face: "neutral", key: "close.partial2" },
  ],
  infeasible: [
    { speaker: "nadir", face: "groan", key: "close.infeasible1", sound: "close.infeasible1.sound" },
    { speaker: "rivo", face: "neutral", key: "close.infeasible2" },
  ],
};

function changeLine(change: Counterfactual, current: Design, i18n: I18n) {
  return i18n.t("review.change", {
    was: title(change.key, current, i18n),
    becomes: title(change.key, change.design, i18n),
    result: i18n.t(`word.${change.evaluation.result}` as TranslationKey),
  });
}

export function ReviewScene({
  state,
  dispatch,
  onSources,
}: {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  onSources: (request: DrawerRequest) => void;
}) {
  const i18n = useI18n();
  const { t, n } = i18n;
  const design = state.choices as Design;
  const outcome = review(SCENARIO, design);
  const { evaluation } = outcome;
  const points = simulate(SCENARIO, design);
  const retry = useAutoFocus<HTMLButtonElement>("review");
  const lines = CLOSING[evaluation.result]!;
  const tried = new Set(state.log.map((item) => JSON.stringify(item)));
  const homeFound = ALL_DESIGNS.filter((item) => tried.has(JSON.stringify(item)) && evaluate(SCENARIO, item).result === "feasible").length;
  const checkpointName = { departure: "review.first", crossing: "review.down", arrival: "review.last" } as const;

  return (
    <section className={`review result-${evaluation.result}`} aria-labelledby="review-title">
      <header className="result-banner">
        <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">
          {evaluation.result === "infeasible" ? (
            <path d="M12 3l10 18H2zM12 10v5M12 18v.01" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          ) : evaluation.result === "partial" ? (
            <><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" /></>
          ) : (
            <path d="M4 12l5 6L20 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
        <div>
          <h1 id="review-title" data-testid="result-title">{t(`outcome.${evaluation.result}.title` as TranslationKey)}</h1>
          <p>{t(evaluation.failure ? (`failure.${evaluation.failure}` as TranslationKey) : (`outcome.${evaluation.result}.body` as TranslationKey))}</p>
        </div>
      </header>

      <div className="review-dialogue">
        {lines.map((line, index) => <Dialogue key={index} line={line} />)}
      </div>

      <section className="review-section" aria-labelledby="why-title">
        <div className="section-head">
          <h2 id="why-title">{t("review.why")}</h2>
          <ProvenanceChip kind="player-result" />
        </div>
        <CausalGraph outcome={evaluation} />
      </section>

      <div className="review-columns">
        <section className="review-section" aria-labelledby="mattered-title">
          <h2 id="mattered-title">{t("review.mattered")}</h2>
          {outcome.strongest && <p><strong>{t("review.key")}</strong> {title(outcome.strongest.key, design, i18n)}. {changeLine(outcome.strongest, design, i18n)}</p>}
          {outcome.improvement ? (
            <p data-testid="improvement"><strong>{t("review.reconsider")}</strong> {changeLine(outcome.improvement, design, i18n)}</p>
          ) : (
            <p data-testid="improvement">
              <strong>{t("review.tradeoff")}</strong>{" "}
              {design.engine === "chemical"
                ? t("review.tradeChem", { left: n.kg(evaluation.propellantLeft) })
                : t("review.tradeElec", { time: n.days(evaluation.days), supplies: evaluation.suppliesDays })}
            </p>
          )}
          {evaluation.result === "feasible" && homeFound < 2 && <p className="route-hint">{t("review.hint")}</p>}
          {evaluation.result === "feasible" && homeFound >= 2 && <p className="route-hint">{t("review.bothFound")}</p>}
        </section>

        <section className="review-section" aria-labelledby="flight-title">
          <h2 id="flight-title">{t("review.flight")}</h2>
          <table className="history">
            <thead>
              <tr><th scope="col">{t("review.checkpoint")}</th><th scope="col">{t("meters.propellant")}</th><th scope="col">{t("meters.time")}</th></tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.id}>
                  <th scope="row">{t(checkpointName[point.id])}</th>
                  <td>{point.propellantLeftKg < 0 ? t("meters.short", { amount: n.kg(point.propellantLeftKg) }) : n.kg(point.propellantLeftKg)}</td>
                  <td>{n.days(point.days)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="review-section" aria-labelledby="log-title">
        <h2 id="log-title">{t("review.log", { count: tried.size, total: ALL_DESIGNS.length })}</h2>
        <ul className="route-log">
          {[...tried].map((item) => {
            const flown = JSON.parse(item) as Design;
            const result = evaluate(SCENARIO, flown).result;
            return (
              <li key={item} className={`logged logged-${result}`}>
                <strong>{t(`word.${result}` as TranslationKey)}</strong>
                <span>{t("review.logItem", { engine: title("engine", flown, i18n), array: t(flown.array === "large" ? "review.arrayLarge" : "review.arraySmall"), destination: title("destination", flown, i18n) })}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="review-section evidence" aria-labelledby="evidence-title">
        <h2 id="evidence-title">{t("review.real")}</h2>
        <div className="chip-row">
          <ProvenanceChip kind="nasa-source" />
          <ProvenanceChip kind="game-rule" />
          <ProvenanceChip kind="fiction" />
          <ProvenanceChip kind="player-result" />
        </div>
        <p>{t("review.realText")}</p>
        <button
          type="button"
          className="ghost-button"
          onClick={() => onSources({ title: t("review.allValues"), valueIds: [...new Set(Object.values(DECISION_SOURCES).flat())], limitations: true })}
        >
          {t("review.sources")}
        </button>
      </section>

      <CrewRail state={state} />

      <div className="review-actions">
        <button ref={retry} type="button" className="primary-button" onClick={() => dispatch({ type: "retry" })}>{t("review.retry")}</button>
        <button type="button" className="ghost-button" onClick={() => dispatch({ type: "restart" })}>{t("review.toTitle")}</button>
      </div>
    </section>
  );
}
