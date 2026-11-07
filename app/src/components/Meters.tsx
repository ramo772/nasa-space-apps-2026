import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Difficulty } from "../app/gameState";
import { SCENARIO } from "../content/scenario";
import { valueOf, type Snapshot } from "../domain/rules";
import { useI18n } from "../i18n";
import { ProvenanceChip } from "./common";

/** Counts once to the exact value, then stays. With reduced motion it simply shows the value. */
function useCount(target: number | null, reducedMotion: boolean) {
  const [shown, setShown] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (target === null || from.current === null || reducedMotion) {
      from.current = target;
      setShown(target);
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let frame = 0;
    const tick = (now: number) => {
      const amount = Math.min(1, (now - start) / 360);
      const eased = 1 - (1 - amount) ** 3;
      setShown(amount === 1 ? target : origin + (target - origin) * eased);
      if (amount < 1) frame = requestAnimationFrame(tick);
      else from.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      from.current = target;
    };
  }, [target, reducedMotion]);
  return shown;
}

const ICONS: Record<string, ReactNode> = {
  propellant: <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" fill="currentColor" />,
  time: <><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" /><path d="M12 7v5l3 3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></>,
  power: <path d="M14 2L5 14h6l-1 8 9-12h-6z" fill="currentColor" />,
  mass: <><circle cx="12" cy="6" r="3" fill="none" stroke="currentColor" strokeWidth="2.5" /><path d="M6 9h12l3 12H3z" fill="currentColor" /></>,
};

type State = "pending" | "ok" | "warning";

function Meter({
  id,
  label,
  value,
  format,
  state,
  status,
  fill,
  delta,
  reducedMotion,
}: {
  id: string;
  label: string;
  value: number | null;
  format: (value: number) => string;
  state: State;
  status: string;
  fill: number;
  delta: string | null;
  reducedMotion: boolean;
}) {
  const { t } = useI18n();
  const shown = useCount(value, reducedMotion);
  return (
    <div className={`meter meter-${state}`} data-testid={`meter-${id}`}>
      <div className="meter-head">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">{ICONS[id]}</svg>
        <span className="meter-label">{label}</span>
        {delta && <span className="meter-delta" key={delta} dir="ltr">{delta}</span>}
      </div>
      {/* The final value is announced once. The counting number is hidden from screen readers. */}
      <p className="meter-value" aria-hidden="true">{shown === null ? t("meters.notKnown") : format(shown)}</p>
      <p className="sr-only" data-testid={`value-${id}`}>{value === null ? t("meters.notKnown") : format(value)}</p>
      <div className="meter-track" aria-hidden="true">
        <div className="meter-fill" style={{ transform: `scaleX(${Math.max(0, Math.min(1, fill))})` }} />
      </div>
      <p className="meter-status">
        {state === "warning" && (
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M12 3l10 18H2zM12 10v5M12 18v.01" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {state === "ok" && (
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M5 12l5 5 9-10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {status}
      </p>
    </div>
  );
}

const VISIBLE: Record<Difficulty, readonly string[]> = {
  guided: ["propellant", "time"],
  standard: ["propellant", "time", "power"],
  systems: ["propellant", "time", "power", "mass"],
};

const deltaOf = (now: number | null, before: number | null | undefined, format: (value: number) => string) =>
  now !== null && before !== null && before !== undefined && Math.abs(now - before) > 0.05
    ? `${now - before >= 0 ? "+" : "−"}${format(Math.abs(now - before))}`
    : null;

export function Meters({
  now,
  before,
  difficulty,
  reducedMotion,
  load,
}: {
  now: Snapshot;
  before?: Snapshot | null;
  difficulty: Difficulty;
  reducedMotion: boolean;
  load: number | null;
}) {
  const { t, n } = useI18n();
  const supplies = valueOf(SCENARIO, "supplies-limit");
  const visible = VISIBLE[difficulty];
  const left = now.propellantLeftKg;
  const time = now.days;
  const leftFormat = (value: number) => (value < 0 ? t("meters.short", { amount: n.kg(value) }) : n.kg(value));

  return (
    <section className="meters" aria-label={t("meters.title")}>
      <div className="meters-title">
        <h2>{t("meters.title")}</h2>
        <ProvenanceChip kind="player-result" />
      </div>
      <Meter
        id="propellant"
        label={t("meters.propellant")}
        value={left}
        format={leftFormat}
        state={left === null ? "pending" : left < 0 ? "warning" : "ok"}
        status={left === null ? t("meters.propPending") : left < 0 ? t("meters.propBad") : t("meters.propGood")}
        fill={left === null || !load ? 0 : left / load}
        delta={deltaOf(left, before?.propellantLeftKg, n.kg)}
        reducedMotion={reducedMotion}
      />
      <Meter
        id="time"
        label={t("meters.time")}
        value={time}
        format={n.days}
        state={time === null ? "pending" : time > supplies ? "warning" : "ok"}
        status={t(time === null ? "meters.timePending" : time > supplies ? "meters.timeBad" : "meters.timeGood", { days: supplies })}
        fill={time === null ? 0 : time / supplies}
        delta={deltaOf(time, before?.days, n.days)}
        reducedMotion={reducedMotion}
      />
      {visible.includes("power") && (
        <Meter
          id="power"
          label={t("meters.power")}
          value={now.powerKw}
          format={n.kw}
          state="ok"
          status={t("meters.powerNote")}
          fill={now.powerKw / 35}
          delta={deltaOf(now.powerKw, before?.powerKw, n.kw)}
          reducedMotion={reducedMotion}
        />
      )}
      {visible.includes("mass") && (
        <Meter
          id="mass"
          label={t("meters.mass")}
          value={now.massKg}
          format={n.kg}
          state={now.massKg === null ? "pending" : "ok"}
          status={now.massKg === null ? t("meters.massPending") : t("meters.massNote")}
          fill={now.massKg === null ? 0 : now.massKg / 34000}
          delta={deltaOf(now.massKg, before?.massKg, n.kg)}
          reducedMotion={reducedMotion}
        />
      )}
    </section>
  );
}
