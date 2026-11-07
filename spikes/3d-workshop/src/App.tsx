import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ARRAY_OPTIONS, consequence, openPanels, type ArrayKw } from "./draft";

const Scene = lazy(() => import("./Scene"));

const canUseWebGL = () => {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function FlatWorkshop({ arrayKw }: { arrayKw: ArrayKw }) {
  const open = openPanels(arrayKw);
  return (
    <div className="flat-workshop" data-testid="flat-fallback">
      <p>The 3D view can't run here. Your choice and its values still work.</p>
      <div className="flat-array" aria-hidden="true">
        {[1, 2, 3, 4].map((panel) => (
          <span key={panel} className={panel <= open ? "panel open" : "panel"} />
        ))}
      </div>
    </div>
  );
}

const OPTION_TEXT: Record<ArrayKw, { name: string; hint: string }> = {
  10: { name: "Small solar array", hint: "Lighter, with little power to spare" },
  40: { name: "Large solar array", hint: "Much more power, and 1,000 kg more to carry" },
};

const EXPLANATION: Record<ArrayKw, string> = {
  10: "Life support takes most of this array, so only a little power reaches the engine.",
  40: "The engine gets seven times the power, but the extra mass makes every burn work harder.",
};

export function App() {
  const [arrayKw, setArrayKw] = useState<ArrayKw>(10);
  const [webglLost, setWebglLost] = useState(false);
  const [webgl] = useState(canUseWebGL);
  const reducedMotion = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const values = consequence(arrayKw);

  const onSettled = useCallback((settled: boolean) => {
    stage.current?.setAttribute("data-settled", String(settled));
  }, []);
  const onContextLost = useCallback(() => setWebglLost(true), []);

  const flat = <FlatWorkshop arrayKw={arrayKw} />;

  return (
    <main className="shell">
      <div
        ref={stage}
        className="stage"
        role="img"
        aria-label={`The Orbital Workshop. A ${arrayKw} kilowatt solar array outside the window feeds the engine through a glowing conduit.`}
      >
        {webgl && !webglLost ? (
          <SceneBoundary fallback={flat}>
            <Suspense fallback={<p className="loading" role="status">Loading the workshop…</p>}>
              <Scene
                arrayKw={arrayKw}
                reducedMotion={reducedMotion}
                onSettled={onSettled}
                onContextLost={onContextLost}
              />
            </Suspense>
          </SceneBoundary>
        ) : (
          flat
        )}
      </div>

      <section className="panel-ui" aria-labelledby="decision-title">
        <p className="draft-flag">Visual spike. Draft numbers, not reviewed science.</p>
        <form onSubmit={(event) => event.preventDefault()}>
          <fieldset>
            <legend id="decision-title">Choose a solar array</legend>
            {ARRAY_OPTIONS.map((option) => (
              <label key={option} className="option">
                <input
                  type="radio"
                  name="array"
                  checked={arrayKw === option}
                  onChange={() => setArrayKw(option)}
                />
                <span>
                  <strong>{OPTION_TEXT[option].name}: {option} kW</strong>
                  <small>{OPTION_TEXT[option].hint}</small>
                </span>
              </label>
            ))}
          </fieldset>
        </form>

        <dl className="readout" aria-live="polite">
          <div>
            <dt>Power for the engine</dt>
            <dd data-testid="engine-power">{values.engineKw} kW</dd>
          </div>
          <div>
            <dt>Life support <em>fiction</em></dt>
            <dd>{values.lifeSupportKw} kW</dd>
          </div>
          <div>
            <dt>Array mass <em>draft game rule</em></dt>
            <dd data-testid="array-mass">{values.arrayMassKg.toLocaleString("en-US")} kg</dd>
          </div>
        </dl>
        <p className="explain" data-testid="explanation">{EXPLANATION[arrayKw]}</p>
      </section>
    </main>
  );
}
