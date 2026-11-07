import { useEffect, useRef } from "react";
import { SCENARIO, SOURCES } from "../content/scenario";
import { useI18n } from "../i18n";
import { ProvenanceChip } from "./common";

export interface DrawerRequest {
  title: string;
  valueIds: readonly string[];
  /** Shows the mission's overall limitations too. */
  limitations?: boolean;
}

/** A native dialog: it traps focus, closes on Escape and returns focus to the button that opened it. */
export function SourceDrawer({ request, onClose }: { request: DrawerRequest | null; onClose: () => void }) {
  const { t, n, science } = useI18n();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (request && !element.open) element.showModal();
    if (!request && element.open) element.close();
  }, [request]);

  const values = (request?.valueIds ?? []).flatMap((id) => SCENARIO.values.filter((value) => value.id === id));
  const sourceIds = [...new Set(values.flatMap((value) => value.sourceIds))];
  const sources = SOURCES.filter((source) => sourceIds.includes(source.id));

  return (
    <dialog ref={dialog} className="drawer" onClose={onClose} aria-labelledby="drawer-title">
      <div className="drawer-head">
        <h2 id="drawer-title">{request?.title ?? ""}</h2>
        <button type="button" className="ghost-button" onClick={onClose}>{t("ui.close")}</button>
      </div>

      <section>
        <h3>{t("drawer.values")}</h3>
        <ul className="value-list">
          {values.map((value) => (
            <li key={value.id}>
              <div className="value-row">
                <span>{science(value.label)}</span>
                <strong dir="ltr">{n.plain(value.amount)} {value.unit}</strong>
              </div>
              <ProvenanceChip kind={value.provenance} />
              <p>{science(value.transformation)} {science(value.limitation)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>{t("drawer.origin")}</h3>
        <ul className="source-list">
          {sources.map((source) =>
            source.kind === "nasa" ? (
              <li key={source.id}>
                <a href={source.url} target="_blank" rel="noreferrer" dir="ltr">{source.title}</a>
                <p>{t("drawer.used", { provider: source.provider, fields: source.fieldsUsed.join("; "), units: source.originalUnits.join(", "), date: source.accessedOn })}</p>
                <p>{source.transformation} {source.limitations}</p>
              </li>
            ) : (
              <li key={source.id}>
                <strong>{source.title}</strong>
                <p>{source.rationale} {source.limitations}</p>
              </li>
            ),
          )}
        </ul>
      </section>

      {request?.limitations && (
        <section>
          <h3>{t("drawer.leftOut")}</h3>
          <ul className="limit-list">
            {SCENARIO.limitations.map((limitation) => <li key={limitation}>{science(limitation)}</li>)}
            <li>{t("drawer.scale")}</li>
          </ul>
          <p className="fine-print">{science(SCENARIO.fictionalFraming)}</p>
        </section>
      )}
    </dialog>
  );
}
