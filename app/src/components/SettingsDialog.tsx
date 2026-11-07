import { useEffect, useRef } from "react";
import type { Settings } from "../app/settings";
import { audio, type Channel } from "../audio/audioManager";
import { useI18n, type Lang } from "../i18n";
import type { TranslationKey } from "../i18n/en";

const CHANNELS: readonly { id: Channel; name: TranslationKey }[] = [
  { id: "music", name: "ui.music" },
  { id: "tones", name: "ui.tones" },
  { id: "effects", name: "ui.effects" },
];

/** Each language's name is written in that language, so a player can always find their own. */
export const LANGUAGES: readonly { id: Lang; name: string }[] = [
  { id: "en", name: "English" },
  { id: "ar", name: "مصري" },
];

export function SettingsDialog({
  open,
  settings,
  update,
  lang,
  onLanguage,
  onClose,
  onQuit,
}: {
  open: boolean;
  settings: Settings;
  update: (change: Partial<Settings>) => void;
  lang: Lang;
  onLanguage: (lang: Lang) => void;
  onClose: () => void;
  onQuit?: () => void;
}) {
  const { t } = useI18n();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog ref={dialog} className="settings" onClose={onClose} aria-labelledby="settings-title">
      <div className="drawer-head">
        <h2 id="settings-title">{t("ui.settings")}</h2>
        <button type="button" className="ghost-button" onClick={onClose}>{t("ui.close")}</button>
      </div>

      <fieldset className="plain-group">
        <legend>{t("ui.language")}</legend>
        <div className="row-group">
          {LANGUAGES.map((option) => (
            <label key={option.id} className="pick">
              <input type="radio" name="settings-language" checked={lang === option.id} onChange={() => onLanguage(option.id)} />
              <span><strong>{option.name}</strong></span>
            </label>
          ))}
        </div>
      </fieldset>

      {CHANNELS.map(({ id, name }) => (
        <label key={id} className="slider">
          <span>{t(name)}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.levels[id]}
            onChange={(event) => {
              audio.unlock();
              update({ levels: { ...settings.levels, [id]: Number(event.target.value) } });
            }}
          />
        </label>
      ))}
      <label className="check">
        <input type="checkbox" checked={settings.reducedMotion} onChange={(event) => update({ reducedMotion: event.target.checked })} />
        <span>{t("ui.reduceMotion")}</span>
      </label>
      <p className="fine-print">{t("ui.captionsNote")}</p>
      {onQuit && <button type="button" className="ghost-button" onClick={onQuit}>{t("ui.leave")}</button>}
    </dialog>
  );
}
