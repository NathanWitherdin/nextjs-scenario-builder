// components/CourtroomBuilderForm.tsx
"use client";

import React, { useMemo, useState } from "react";
import {
  Message,
  MessageCategory,
  Scenario,
  Severity,
  CourtOutcome,
  isValidMessage,
  isValidScenario,
} from "@/lib/types";

type Props = {
  value: Scenario;
  onChange: (next: Scenario) => void;
  onPreview: () => void;
  onGenerate: () => void;
};

const categories: MessageCategory[] = ["interruption", "task", "critical"];
const severities: Severity[] = ["major", "minor"];

function ensureOutcome(o?: CourtOutcome | null): CourtOutcome {
  return {
    punishment: o?.punishment ?? "",
    reason: o?.reason ?? "",
    canReturn: typeof o?.canReturn === "boolean" ? o!.canReturn : true,
    backgroundUrl: o?.backgroundUrl ?? "",
  };
}

export default function CourtroomBuilderForm({
  value,
  onChange,
  onPreview,
  onGenerate,
}: Props) {
  const [draft, setDraft] = useState<Message>({
    category: "interruption",
    text: "",
  });
  const validScenario = useMemo(() => isValidScenario(value), [value]);

  const updateScenario = (patch: Partial<Scenario>) => {
    onChange({ ...value, ...patch });
  };

  const setRule = (k: keyof Scenario["rules"], v: number | boolean) => {
    onChange({ ...value, rules: { ...value.rules, [k]: v } });
  };

  const setDraftField = (patch: Partial<Message>) => {
    setDraft((d) => ({ ...d, ...patch }));
  };

  const setDraftOutcomeField = <K extends keyof CourtOutcome>(
    key: K,
    v: CourtOutcome[K]
  ) => {
    setDraft((d) => {
      const co = ensureOutcome(d.courtOutcome);
      return { ...d, courtOutcome: { ...co, [key]: v } };
    });
  };

  const addDraft = () => {
    const cleaned: Message = {
      category: draft.category,
      severity:
        draft.category === "critical"
          ? (draft.severity as Severity)
          : undefined,
      text: (draft.text || "").trim(),
      answer:
        draft.category === "interruption"
          ? undefined
          : (draft.answer || "").trim(),
      courtOutcome:
        draft.category === "critical"
          ? ensureOutcome(draft.courtOutcome)
          : undefined,
    };

    if (!isValidMessage(cleaned)) {
      alert(
        "Please complete the message:\n- Interruption: text only\n- Task: text + answer\n- Critical: text + severity + answer + punishment + reason"
      );
      return;
    }

    onChange({ ...value, messages: [...value.messages, cleaned] });

    setDraft({
      category: draft.category,
      text: "",
      severity: draft.category === "critical" ? draft.severity : undefined,
      answer:
        draft.category === "interruption" ? undefined : draft.answer ?? "",
      courtOutcome:
        draft.category === "critical"
          ? { punishment: "", reason: "", canReturn: true, backgroundUrl: "" }
          : undefined,
    });
  };

  const removeAt = (idx: number) => {
    const next = value.messages.slice();
    next.splice(idx, 1);
    onChange({ ...value, messages: next });
  };

  const updateMessageAt = (idx: number, patch: Partial<Message>) => {
    const next = value.messages.slice();
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...value, messages: next });
  };

  const updateMessageOutcomeField = <K extends keyof CourtOutcome>(
    idx: number,
    key: K,
    v: CourtOutcome[K]
  ) => {
    const current = value.messages[idx];
    const co = ensureOutcome(current.courtOutcome);
    updateMessageAt(idx, { courtOutcome: { ...co, [key]: v } });
  };

  return (
    <section
      aria-label="Courtroom Builder"
      style={{
        background: "var(--card)",
        border: "1px solid var(--muted)",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        color: "var(--fg)",
        marginBottom: 16,
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "160px 1fr 1fr",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div>
          <label style={labelStyle}>Timer (minutes)</label>
          <input
            data-testid="timerMinutes"
            type="number"
            min={1}
            value={value.timerMinutes}
            onChange={(e) =>
              updateScenario({ timerMinutes: Number(e.target.value || 0) })
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Background URL / data URI</label>
          <input
            data-testid="backgroundUrl"
            type="text"
            placeholder="/backgrounds/workdesk-bg.png"
            value={value.backgroundUrl}
            onChange={(e) => updateScenario({ backgroundUrl: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Global Punishment Text (fallback)</label>
          <input
            data-testid="punishmentText"
            type="text"
            placeholder="e.g., Generic court loss text"
            value={value.punishmentText}
            onChange={(e) => updateScenario({ punishmentText: e.target.value })}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Rules */}
      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>Rules</legend>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}
        >
          <div>
            <label style={labelStyle}>Major strike limit</label>
            <input
              data-testid="majorLimit"
              type="number"
              min={1}
              value={value.rules.majorLimit}
              onChange={(e) =>
                setRule("majorLimit", Number(e.target.value || 0))
              }
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Minor strike limit</label>
            <input
              data-testid="minorLimit"
              type="number"
              min={1}
              value={value.rules.minorLimit}
              onChange={(e) =>
                setRule("minorLimit", Number(e.target.value || 0))
              }
              style={inputStyle}
            />
          </div>
          <div style={switchStyle}>
            <input
              id="allowSkipNormals"
              type="checkbox"
              checked={value.rules.allowSkipNormals}
              onChange={(e) => setRule("allowSkipNormals", e.target.checked)}
            />
            <label htmlFor="allowSkipNormals">Allow skip normal tasks</label>
          </div>
          <div style={switchStyle}>
            <input
              id="allowExitCriticals"
              type="checkbox"
              checked={value.rules.allowExitCriticals}
              onChange={(e) => setRule("allowExitCriticals", e.target.checked)}
            />
            <label htmlFor="allowExitCriticals">
              Allow exit critical tasks
            </label>
          </div>
        </div>
      </fieldset>

      {/* Add Message */}
      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>Add Message</legend>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "160px 1fr 1fr 140px",
            gap: 12,
            alignItems: "end",
          }}
        >
          <div>
            <label style={labelStyle}>Category</label>
            <select
              data-testid="msgCategory"
              value={draft.category}
              onChange={(e) =>
                setDraftField({
                  category: e.target.value as MessageCategory,
                  severity:
                    e.target.value === "critical"
                      ? (draft.severity as Severity) || "major"
                      : undefined,
                  answer:
                    e.target.value === "interruption"
                      ? undefined
                      : draft.answer || "",
                  courtOutcome:
                    e.target.value === "critical"
                      ? ensureOutcome(draft.courtOutcome)
                      : undefined,
                })
              }
              style={inputStyle}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {draft.category === "critical" ? (
            <div>
              <label style={labelStyle}>Severity</label>
              <select
                data-testid="msgSeverity"
                value={draft.severity || "major"}
                onChange={(e) =>
                  setDraftField({ severity: e.target.value as Severity })
                }
                style={inputStyle}
              >
                {severities.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          ) : (
            <div />
          )}

          <div>
            <label style={labelStyle}>Text</label>
            <input
              data-testid="msgText"
              type="text"
              value={draft.text}
              onChange={(e) => setDraftField({ text: e.target.value })}
              style={inputStyle}
            />
          </div>

          {draft.category !== "interruption" && (
            <div>
              <label style={labelStyle}>Answer</label>
              <input
                data-testid="msgAnswer"
                type="text"
                value={draft.answer || ""}
                onChange={(e) => setDraftField({ answer: e.target.value })}
                style={inputStyle}
              />
            </div>
          )}
        </div>

        {draft.category === "critical" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 12,
              marginTop: 10,
            }}
          >
            <div>
              <label style={labelStyle}>Punishment</label>
              <input
                type="text"
                value={ensureOutcome(draft.courtOutcome).punishment}
                onChange={(e) =>
                  setDraftOutcomeField("punishment", e.target.value)
                }
                placeholder="e.g., 3 months suspension"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Reason (law broken)</label>
              <input
                type="text"
                value={ensureOutcome(draft.courtOutcome).reason}
                onChange={(e) => setDraftOutcomeField("reason", e.target.value)}
                placeholder="e.g., Breach of Privacy Act"
                style={inputStyle}
              />
            </div>
            <div style={switchStyle}>
              <input
                id="canReturn"
                type="checkbox"
                checked={ensureOutcome(draft.courtOutcome).canReturn}
                onChange={(e) =>
                  setDraftOutcomeField("canReturn", e.target.checked)
                }
              />
              <label htmlFor="canReturn">Can return</label>
            </div>
            <div>
              <label style={labelStyle}>Court BG URL</label>
              <input
                type="text"
                value={ensureOutcome(draft.courtOutcome).backgroundUrl}
                onChange={(e) =>
                  setDraftOutcomeField("backgroundUrl", e.target.value)
                }
                placeholder="/backgrounds/courtroom-bg.png"
                style={inputStyle}
              />
            </div>
          </div>
        )}

        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}
        >
          <button
            data-testid="addMessage"
            onClick={addDraft}
            style={primaryBtnStyle}
          >
            + Add Message
          </button>
        </div>
      </fieldset>

      {/* Messages List */}
      <div style={fieldsetStyle}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Messages</div>
        {value.messages.length === 0 ? (
          <div style={{ color: "rgba(127,127,127,.9)", fontSize: 14 }}>
            No messages yet.
          </div>
        ) : (
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
          >
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Cat</th>
                <th style={thStyle}>Sev</th>
                <th style={thStyle}>Text</th>
                <th style={thStyle}>Answer</th>
                <th style={thStyle}>Punishment</th>
                <th style={thStyle}>Reason</th>
                <th style={thStyle}>CanReturn</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {value.messages.map((m, i) => {
                const co =
                  m.category === "critical"
                    ? ensureOutcome(m.courtOutcome)
                    : undefined;
                return (
                  <tr key={i}>
                    <td style={tdStyle}>{i + 1}</td>
                    <td style={tdStyle}>
                      <select
                        value={m.category}
                        onChange={(e) =>
                          updateMessageAt(i, {
                            category: e.target.value as MessageCategory,
                          })
                        }
                        style={miniSelect}
                      >
                        {categories.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </td>
                    <td style={tdStyle}>
                      {m.category === "critical" ? (
                        <select
                          value={m.severity || "major"}
                          onChange={(e) =>
                            updateMessageAt(i, {
                              severity: e.target.value as Severity,
                            })
                          }
                          style={miniSelect}
                        >
                          {severities.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ opacity: 0.6 }}>—</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <input
                        value={m.text}
                        onChange={(e) =>
                          updateMessageAt(i, { text: e.target.value })
                        }
                        style={miniInput}
                      />
                    </td>
                    <td style={tdStyle}>
                      {m.category === "interruption" ? (
                        <span style={{ opacity: 0.6 }}>—</span>
                      ) : (
                        <input
                          value={m.answer || ""}
                          onChange={(e) =>
                            updateMessageAt(i, { answer: e.target.value })
                          }
                          style={miniInput}
                        />
                      )}
                    </td>

                    {m.category === "critical" ? (
                      <>
                        <td style={tdStyle}>
                          <input
                            value={co!.punishment}
                            onChange={(e) =>
                              updateMessageOutcomeField(
                                i,
                                "punishment",
                                e.target.value
                              )
                            }
                            style={miniInput}
                          />
                        </td>
                        <td style={tdStyle}>
                          <input
                            value={co!.reason}
                            onChange={(e) =>
                              updateMessageOutcomeField(
                                i,
                                "reason",
                                e.target.value
                              )
                            }
                            style={miniInput}
                          />
                        </td>
                        <td style={tdStyle}>
                          <input
                            type="checkbox"
                            checked={co!.canReturn}
                            onChange={(e) =>
                              updateMessageOutcomeField(
                                i,
                                "canReturn",
                                e.target.checked
                              )
                            }
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={tdStyle} colSpan={3}>
                          <span style={{ opacity: 0.6 }}>—</span>
                        </td>
                      </>
                    )}

                    <td style={tdStyle}>
                      <button
                        onClick={() => removeAt(i)}
                        style={{
                          ...smallBtn,
                          background: "#ef4444",
                          color: "#fff",
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          data-testid="previewBtn"
          onClick={onPreview}
          style={secondaryBtnStyle}
        >
          Preview
        </button>
        <button
          data-testid="generateBtn"
          onClick={() => {
            if (!validScenario) {
              alert("Please complete the scenario before generating.");
              return;
            }
            onGenerate();
          }}
          style={primaryBtnStyle}
        >
          Generate Code
        </button>
      </div>
    </section>
  );
}

// ---- Styles (theme-aware) ----
const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 8,
  border: "1px solid var(--muted)",
  padding: "8px 10px",
  fontSize: 14,
  background: "var(--bg)",
  color: "var(--fg)",
};
const labelStyle: React.CSSProperties = {
  fontWeight: 700,
  display: "block",
  marginBottom: 6,
};
const legendStyle: React.CSSProperties = { fontWeight: 800, padding: "0 6px" };
const fieldsetStyle: React.CSSProperties = {
  border: "1px solid var(--muted)",
  borderRadius: 10,
  padding: 12,
  marginBottom: 16,
  background: "var(--card)",
  color: "var(--fg)",
};
const switchStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  paddingTop: 22,
};
const thStyle: React.CSSProperties = {
  borderBottom: "1px solid var(--muted)",
  padding: "8px 6px",
  textAlign: "left",
};
const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid var(--muted)",
  padding: "6px 6px",
  verticalAlign: "middle",
};
const miniInput: React.CSSProperties = {
  ...inputStyle,
  padding: "6px 8px",
  fontSize: 13,
};
const miniSelect: React.CSSProperties = {
  ...inputStyle,
  padding: "6px 8px",
  fontSize: 13,
};
const smallBtn: React.CSSProperties = {
  border: 0,
  borderRadius: 8,
  padding: "6px 10px",
  fontWeight: 700,
  cursor: "pointer",
};
const primaryBtnStyle: React.CSSProperties = {
  ...smallBtn,
  background: "#0ea5e9",
  color: "#fff",
};
const secondaryBtnStyle: React.CSSProperties = {
  ...smallBtn,
  background: "#64748b",
  color: "#fff",
};
