import { useI18n } from "../i18n";
import type { TranslationKey } from "../i18n/en";
import type { StageState } from "./stageState";

const asset = (name: string) => `${import.meta.env.BASE_URL}characters/${name}.webp`;

/**
 * The flat workshop. It shows while the 3D scene loads, and takes over when WebGL or the download fails.
 * The same choices stay visible: the array's panels, the engine's name and the power conduit.
 */
export function WorkshopStage({ stage }: { stage: StageState }) {
  const { t } = useI18n();
  const panels = stage.array === "large" ? 4 : 1;
  return (
    <div className="flat-stage" data-testid="flat-stage">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect className="f-surface" x="-1000" width="3600" height="560" />
        <rect className="f-floor" x="-1000" y="560" width="3600" height="400" />
        <path className="f-bg" d="M470 420V190q0-90 90-90h480q90 0 90 90v230z" />
        {stage.earth === "home" && <circle className="f-earth" cx="800" cy="900" r="620" />}
        {stage.earth === "geo" && <circle className="f-earth" cx="800" cy="440" r="130" />}
        {stage.earth === "far" && <circle className="f-earth" cx="1000" cy="230" r="34" />}
        <path className="f-surface-cover" d="M-1000 420h1470V190q0-90 90-90h480q90 0 90 90v230h1470V-20H-1000z" />
        <path className="s-frame" d="M470 420V190q0-90 90-90h480q90 0 90 90v230z" />

        <g data-testid="flat-array">
          {Array.from({ length: panels }, (_, index) => (
            <g key={index}>
              <rect className="f-panel" x={848 + index * 66} y={200} width={60} height={120} rx={6} />
              <rect className="f-panel" x={692 - index * 66} y={200} width={60} height={120} rx={6} />
            </g>
          ))}
          <rect className="f-text" x="770" y="170" width="60" height="180" rx="10" />
        </g>

        <path className="s-conduit" d="M820 420Q900 640 1140 640" />

        <ellipse className="f-text" cx="800" cy="680" rx="330" ry="100" />
        <ellipse className="f-bg" cx="800" cy="650" rx="290" ry="66" />
        <ellipse className="s-primary" cx="800" cy="650" rx="260" ry="52" />

        <rect className="f-text" x="1110" y="520" width="280" height="170" rx="26" />
        <rect className={stage.engine === "chemical" ? "f-accent" : "f-primary"} x="1110" y="580" width="280" height="30" />
        <text className="flat-label" x="1250" y="660" textAnchor="middle">
          {t(`flat.${stage.engine ?? "none"}` as TranslationKey)}
        </text>

        {stage.orbit && (
          <g data-testid="flat-orbit">
            <ellipse className="s-orbit" cx="800" cy="520" rx="240" ry="66" />
            <circle className="f-primary" cx="880" cy="515" r="16" />
            <circle className="f-accent" cx="566" cy="530" r="13" />
          </g>
        )}

        <g data-testid="flat-capsule">
          <path className="f-text" d="M1420 700V470a90 90 0 0 1 180 0v230z" />
          <rect className="f-accent" x="1420" y="610" width="180" height="26" />
          <rect className="f-bg" x="1450" y="480" width="120" height="70" rx="10" />
        </g>

        <g data-testid="flat-rivo">
          <circle className="f-text" cx="1010" cy="400" r="88" />
          <image href={asset(`rivo-${stage.rivoFace}`)} x="942" y="358" width="136" height="93" />
          <rect className="f-accent" x="914" y="382" width="16" height="44" rx="6" />
          <rect className="f-accent" x="1090" y="382" width="16" height="44" rx="6" />
        </g>

        <image href={asset("nadir-pose")} x="180" y="280" width="290" height="580" />
      </svg>
    </div>
  );
}
