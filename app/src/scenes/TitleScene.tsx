import markUrl from "../../../assets/identity/odyssey-orbital-mark.svg";
import { useAutoFocus } from "../components/common";
import { useI18n } from "../i18n";

export function TitleScene({ onStart, onSettings }: { onStart: () => void; onSettings: () => void }) {
  const { t } = useI18n();
  const start = useAutoFocus<HTMLButtonElement>("title");
  return (
    <section className="title-scene">
      <div className="title-lockup">
        <img src={markUrl} alt="" width="84" height="84" />
        <h1>
          <span className="title-small">{t("title.small")}</span>
          <span className="title-big" dir="ltr">{t("title.big1")}<span>{t("title.big2")}</span></span>
        </h1>
      </div>
      <p className="tagline">{t("title.tagline")}</p>
      <p className="premise">{t("title.premise")}</p>
      <div className="title-actions">
        <button ref={start} type="button" className="primary-button" onClick={onStart}>{t("title.start")}</button>
        <button type="button" className="ghost-button" onClick={onSettings}>{t("ui.settings")}</button>
      </div>
      <p className="fine-print">{t("title.disclaimer")}</p>
    </section>
  );
}
