import type { Phase } from "../app/gameState";
import { useI18n } from "../i18n";
import type { TranslationKey } from "../i18n/en";

const STEPS: readonly TranslationKey[] = ["journey.destination", "journey.engine", "journey.array", "journey.fly"];

/** The logo's linked decision nodes, used as the mission's progress line. */
export function JourneyBar({ phase }: { phase: Phase }) {
  const { t } = useI18n();
  const current = phase.name === "decision" ? phase.index : phase.name === "simulation" ? 3 : -1;
  return (
    <ol className="journey" aria-label={t("journey.label")}>
      {STEPS.map((step, index) => {
        const state = index < current ? "done" : index === current ? "current" : "next";
        return (
          <li key={step} className={`journey-step ${state}`} aria-current={index === current ? "step" : undefined}>
            <span className="node" aria-hidden="true">
              {state === "done" && (
                <svg viewBox="0 0 16 16" width="12" height="12">
                  <path d="M3 8l3.5 3.5L13 5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="step-name">{t(step)}</span>
          </li>
        );
      })}
    </ol>
  );
}
