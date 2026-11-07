import type { Evaluation } from "../domain/rules";
import { useI18n } from "../i18n";
import type { TranslationKey } from "../i18n/en";

interface Node {
  id: string;
  x: number;
  y: number;
  text: string;
  sub: string;
  kind: "choice" | "rule" | "bad" | "good";
}

const NODE_WIDTH = 214;
const NODE_HEIGHT = 58;

/** The causal chain from choices to result. Below 900 px wide, the ordered list is shown on its own. */
export function CausalGraph({ outcome }: { outcome: Evaluation }) {
  const { t, n, lang } = useI18n();
  const { design } = outcome;
  const option = (id: string) => t(`option.${id}.title` as TranslationKey);
  const bad = (id: string) => (id === "propellant" && outcome.failure === "propellant") || (id === "time" && outcome.failure === "supplies");
  const electric = design.engine === "electric";
  const rtl = lang === "ar";
  const short = outcome.propellantLeft < 0;
  const arrayName = t(design.array === "large" ? "review.arrayLarge" : "review.arraySmall");

  const nodes: Node[] = [
    { id: "destination", x: 0, y: 8, text: option(design.destination), sub: t("graph.choice"), kind: "choice" },
    { id: "engine", x: 0, y: 118, text: option(design.engine), sub: t("graph.choice"), kind: "choice" },
    { id: "array", x: 0, y: 228, text: arrayName, sub: t("graph.choice"), kind: "choice" },
    { id: "dv", x: 278, y: 8, text: t("graph.speed"), sub: n.kms(outcome.deltaV), kind: "rule" },
    { id: "mass", x: 278, y: 118, text: t("graph.mass"), sub: n.kg(outcome.startMass), kind: "rule" },
    { id: "power", x: 278, y: 228, text: t("graph.power"), sub: n.kw(outcome.enginePowerKw), kind: "rule" },
    { id: "propellant", x: 556, y: 60, text: t("meters.propellant"), sub: short ? t("meters.short", { amount: n.kg(outcome.propellantLeft) }) : n.kg(outcome.propellantLeft), kind: bad("propellant") ? "bad" : "rule" },
    { id: "time", x: 556, y: 176, text: t("meters.time"), sub: n.days(outcome.days), kind: bad("time") ? "bad" : "rule" },
    { id: "result", x: 834, y: 118, text: t(`word.${outcome.result}` as TranslationKey), sub: t("provenance.player-result"), kind: outcome.result === "infeasible" ? "bad" : "good" },
  ];
  const edges: [string, string][] = [
    ["destination", "dv"],
    ["engine", "mass"],
    ["array", "mass"],
    ["array", "power"],
    ["dv", "propellant"],
    ["mass", "propellant"],
    electric ? ["power", "time"] : ["dv", "time"],
    ["propellant", "result"],
    ["time", "result"],
  ];
  const at = (id: string) => nodes.find((node) => node.id === id)!;
  const textAt = rtl ? NODE_WIDTH - 14 : 14;

  return (
    <div className="causal">
      <svg className="causal-svg" viewBox="0 0 1050 296" aria-hidden="true" style={{ direction: "ltr" }}>
        {edges.map(([from, to]) => {
          const a = at(from);
          const b = at(to);
          const x1 = a.x + NODE_WIDTH;
          const y1 = a.y + NODE_HEIGHT / 2;
          const x2 = b.x;
          const y2 = b.y + NODE_HEIGHT / 2;
          return <path key={`${from}-${to}`} className={bad(to) ? "edge edge-bad" : "edge"} d={`M${x1} ${y1}C${x1 + 36} ${y1} ${x2 - 36} ${y2} ${x2} ${y2}`} />;
        })}
        {nodes.map((node) => (
          <g key={node.id} transform={`translate(${node.x} ${node.y})`} className={`cg cg-${node.kind}`}>
            <rect width={NODE_WIDTH} height={NODE_HEIGHT} rx="12" />
            <text x={textAt} y="25" className="cg-title" textAnchor={rtl ? "end" : "start"}>{node.text}</text>
            <text x={textAt} y="46" className="cg-sub" textAnchor={rtl ? "end" : "start"}>{node.sub}</text>
          </g>
        ))}
      </svg>
      <ol className="causal-list" data-testid="causal-list">
        <li>{t("graph.list1", { destination: option(design.destination), dv: n.kms(outcome.deltaV) })}</li>
        <li>{t("graph.list2", { engine: option(design.engine), array: arrayName, mass: n.kg(outcome.startMass) })}</li>
        <li>{t(short ? "graph.list3short" : "graph.list3", { used: n.kg(outcome.propellantUsed), load: n.kg(outcome.load), left: n.kg(outcome.propellantLeft) })}</li>
        <li>{t(electric ? "graph.list4elec" : "graph.list4chem", { power: n.kw(outcome.enginePowerKw), time: n.days(outcome.days), supplies: outcome.suppliesDays })}</li>
        <li>{t("graph.list5", { result: t(`outcome.${outcome.result}.title` as TranslationKey) })}</li>
      </ol>
    </div>
  );
}
