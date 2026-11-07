import { useState, type Dispatch, type ReactNode } from "react";
import { rolesFor, type Accent, type Difficulty, type GameAction, type GameState, type Profile } from "../app/gameState";
import { ACCENTS, Avatar, AVATAR_COUNT, figureSvg } from "../components/Avatar";
import { Dialogue, useAutoFocus } from "../components/common";
import { LANGUAGES } from "../components/SettingsDialog";
import { useI18n } from "../i18n";
import type { TranslationKey } from "../i18n/en";

const PROFILES: readonly Profile[] = ["explorer", "student", "specialist"];
const DIFFICULTIES: readonly Difficulty[] = ["guided", "standard", "systems"];
const ACCENT_NAMES: Record<Accent, TranslationKey> = {
  cyan: "setup.accentCyan",
  orange: "setup.accentOrange",
  green: "setup.accentGreen",
  coral: "setup.accentCoral",
  cream: "setup.accentCream",
};
const STEPS: readonly TranslationKey[] = ["setup.rivoLanguage", "setup.rivoMode", "setup.rivoProfile", "setup.rivoDifficulty", "setup.rivoAvatar", "setup.rivoCallsign"];
const CALLSIGN_LENGTH = 16;

function Pick({ name, checked, onChange, title, hint, children }: { name: string; checked: boolean; onChange: () => void; title: string; hint?: string; children?: ReactNode }) {
  return (
    <label className="pick">
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      {children}
      <span>
        <strong>{title}</strong>
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}

function AvatarPicker({ state, index, dispatch }: { state: GameState; index: number; dispatch: Dispatch<GameAction> }) {
  const { t } = useI18n();
  const member = state.crew[index];
  if (!member) return null;
  const roles = rolesFor(state.crew.length)[index] ?? [];
  return (
    <div className="member-setup">
      {state.mode === "solo" && (
        <img
          className="figure-preview"
          data-testid="figure-preview"
          src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(figureSvg(member.avatar, member.accent))}`}
          alt=""
          width="100"
          height="235"
        />
      )}
      {state.mode === "crew" && (
        <p className="member-title">
          <strong>{t("setup.player", { number: index + 1 })}</strong>
          <span className="role-badge">{roles.map((role) => t(`role.${role}` as TranslationKey)).join(" / ")}</span>
        </p>
      )}
      <fieldset className="plain-group">
        <legend>{t("setup.avatar")}</legend>
        <div className="avatar-grid">
          {Array.from({ length: AVATAR_COUNT }, (_, avatar) => (
            <label key={avatar} className={`avatar-pick ${member.avatar === avatar ? "selected" : ""}`}>
              <input
                className="sr-only"
                type="radio"
                name={`avatar-${index}`}
                checked={member.avatar === avatar}
                aria-label={t("setup.avatarOption", { number: avatar + 1 })}
                onChange={() => dispatch({ type: "update-member", index, change: { avatar } })}
              />
              <Avatar id={avatar} accent={member.accent} size={state.mode === "crew" ? 48 : 72} />
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="plain-group">
        <legend>{t("setup.accent")}</legend>
        <div className="accent-row">
          {ACCENTS.map((accent) => (
            <label key={accent} className={`accent-pick accent-${accent} ${member.accent === accent ? "selected" : ""}`}>
              <input className="sr-only" type="radio" name={`accent-${index}`} checked={member.accent === accent} onChange={() => dispatch({ type: "update-member", index, change: { accent } })} />
              <span className="accent-dot" aria-hidden="true" />
              <span>{t(ACCENT_NAMES[accent])}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export function OnboardingScene({ state, dispatch }: { state: GameState; dispatch: Dispatch<GameAction> }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const next = useAutoFocus<HTMLButtonElement>(`step-${step}`);
  const crew = state.mode === "crew";
  const last = step === STEPS.length - 1;
  const lineKey = step === 4 && crew ? "setup.rivoAvatarCrew" : STEPS[step]!;

  return (
    <section className="onboarding" aria-labelledby="setup-title">
      <div className="setup-head">
        <h1 id="setup-title">{t("setup.title")}</h1>
        <p className="setup-count">{t("setup.step", { step: step + 1, total: STEPS.length })}</p>
      </div>
      <Dialogue line={{ speaker: "rivo", face: "curious", key: lineKey }} />

      <form
        className="setup-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (last) dispatch({ type: "finish-onboarding" });
          else setStep(step + 1);
        }}
      >
        <div className="setup-body">
          {step === 0 && (
            <fieldset className="plain-group">
              <legend>{t("setup.language")}</legend>
              <div className="row-group">
                {LANGUAGES.map((option) => (
                  <Pick key={option.id} name="language" title={option.name} checked={state.lang === option.id} onChange={() => dispatch({ type: "set-language", lang: option.id })} />
                ))}
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <>
              <fieldset className="plain-group">
                <legend>{t("setup.mode")}</legend>
                <div className="row-group">
                  <Pick name="mode" title={t("setup.modeSolo")} hint={t("setup.modeSoloHint")} checked={!crew} onChange={() => dispatch({ type: "set-mode", mode: "solo" })} />
                  <Pick name="mode" title={t("setup.modeCrew")} hint={t("setup.modeCrewHint")} checked={crew} onChange={() => dispatch({ type: "set-mode", mode: "crew" })} />
                </div>
              </fieldset>
              {crew && (
                <fieldset className="plain-group">
                  <legend>{t("setup.crewSize")}</legend>
                  <div className="row-group">
                    {[2, 3, 4].map((size) => (
                      <Pick key={size} name="crew-size" title={t("setup.crewPeople", { count: size })} checked={state.crew.length === size} onChange={() => dispatch({ type: "set-crew-size", size })} />
                    ))}
                  </div>
                </fieldset>
              )}
            </>
          )}

          {step === 2 && (
            <fieldset className="plain-group">
              <legend>{t("setup.profile")}</legend>
              <div className="row-group">
                {PROFILES.map((profile) => (
                  <Pick key={profile} name="profile" title={t(`setup.${profile}` as TranslationKey)} hint={t(`setup.${profile}Hint` as TranslationKey)} checked={state.profile === profile} onChange={() => dispatch({ type: "set-profile", profile })} />
                ))}
              </div>
            </fieldset>
          )}

          {step === 3 && (
            <fieldset className="plain-group">
              <legend>{t("setup.difficulty")}</legend>
              <div className="row-group">
                {DIFFICULTIES.map((difficulty) => (
                  <Pick key={difficulty} name="difficulty" title={t(`setup.${difficulty}` as TranslationKey)} hint={t(`setup.${difficulty}Hint` as TranslationKey)} checked={state.difficulty === difficulty} onChange={() => dispatch({ type: "set-difficulty", difficulty })} />
                ))}
              </div>
            </fieldset>
          )}

          {step === 4 && (
            <div className={crew ? "crew-setup" : ""}>
              {state.crew.map((_, index) => <AvatarPicker key={index} state={state} index={index} dispatch={dispatch} />)}
            </div>
          )}

          {step === 5 && (
            <div className="callsigns">
              {state.crew.map((member, index) => (
                <label key={index} className="text-field">
                  <span>{crew ? t("setup.callsignPlayer", { number: index + 1 }) : t("setup.callsign")}</span>
                  <input
                    type="text"
                    maxLength={CALLSIGN_LENGTH}
                    autoComplete="off"
                    value={member.callsign}
                    onChange={(event) => dispatch({ type: "update-member", index, change: { callsign: event.target.value } })}
                  />
                </label>
              ))}
              <label className="text-field">
                <span>{t("setup.rivoName")}</span>
                <input type="text" maxLength={CALLSIGN_LENGTH} autoComplete="off" value={state.rivoCallsign} onChange={(event) => dispatch({ type: "set-rivo-callsign", callsign: event.target.value })} />
              </label>
              <p className="fine-print">{t("setup.privacy")}</p>
            </div>
          )}
        </div>

        <div className="dock-actions setup-actions">
          <button ref={next} type="submit" className="primary-button">{last ? t("setup.begin") : t("ui.next")}</button>
          {step > 0 && <button type="button" className="ghost-button" onClick={() => setStep(step - 1)}>{t("ui.back")}</button>}
        </div>
      </form>
    </section>
  );
}
