// app/components/CourtroomPreview.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Scenario, Message } from "@/lib/types";

type Props = { config: Scenario; startKey: number };

type Stage = "initial" | "urgent";
type DockItem = {
  id: string;
  key: string;
  msg: Message;
  isOpen: boolean;
  stage: Stage;
  stageDeadlineAt: number | null;
};
type TaskItem = { id: string; msg: Message; draft: string };

const ICONS = {
  interruption:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' fill='#9ca3af'/><path d='M7 12h10' stroke='#fff' stroke-width='2' stroke-linecap='round'/></svg>`
    ),
  criticalInitial:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' fill='#f59e0b'/><path d='M12 7v6' stroke='#fff' stroke-width='2' stroke-linecap='round'/><circle cx='12' cy='16' r='1.4' fill='#fff'/></svg>`
    ),
  criticalUrgent:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' fill='#ef4444'/><path d='M12 7v6' stroke='#fff' stroke-width='2' stroke-linecap='round'/><circle cx='12' cy='16' r='1.4' fill='#fff'/></svg>`
    ),
};

const NEXT_ITEM_INTERVAL_MS = 30_000;
const STAGE_MS = 120_000;
const CRIT_MIN_NONCRIT_GAP = 2;
const CRIT_MIN_TIME_GAP_MS = 90_000;

export default function CourtroomPreview({ config, startKey }: Props) {
  const totalSeconds = Math.max(1, Math.round((config.timerMinutes || 5) * 60));
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const tickRef = useRef<number | null>(null);

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [poolNormals, setPoolNormals] = useState<DockItem[]>([]);
  const [poolCriticals, setPoolCriticals] = useState<DockItem[]>([]);
  const [dock, setDock] = useState<DockItem[]>([]);
  const [delayed, setDelayed] = useState<
    Map<string, { kind: "urgent"; at: number; msg: Message }>
  >(new Map());

  const [lastSlotAt, setLastSlotAt] = useState<number>(Date.now());
  const [lastCritAt, setLastCritAt] = useState(0);
  const [nonCritGapCount, setNonCritGapCount] = useState(0);

  const [court, setCourt] = useState<{ open: boolean; msg: Message | null }>({
    open: false,
    msg: null,
  });
  const [endOpen, setEndOpen] = useState(false);

  const [critModal, setCritModal] = useState<{
    open: boolean;
    key: string | null;
    msg: Message | null;
    draft: string;
  }>({ open: false, key: null, msg: null, draft: "" });

  const [stats, setStats] = useState({
    taskAttempted: 0,
    taskCompleted: 0,
    criticalNotified: 0,
    criticalCompleted: 0,
    criticalFailed: 0,
    minorFails: 0,
    majorFails: 0,
  });

  useEffect(() => {
    setSecondsLeft(totalSeconds);
    setRunning(false);
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }

    const t: TaskItem[] = (config.messages || [])
      .filter((m) => m.category === "task")
      .map((m) => ({ id: uid(), msg: m, draft: "" }));
    const normals: DockItem[] = (config.messages || [])
      .filter((m) => m.category !== "task" && m.category !== "critical")
      .map((m) => ({
        id: uid(),
        key: keyFor(m),
        msg: m,
        isOpen: false,
        stage: "initial",
        stageDeadlineAt: null,
      }));
    const criticals: DockItem[] = (config.messages || [])
      .filter((m) => m.category === "critical")
      .map((m) => ({
        id: uid(),
        key: keyFor(m),
        msg: m,
        isOpen: false,
        stage: "initial",
        stageDeadlineAt: null,
      }));

    setTasks(t);
    setPoolNormals(normals);
    setPoolCriticals(criticals);
    setDock([]);
    setDelayed(new Map());
    setLastSlotAt(Date.now());
    setLastCritAt(0);
    setNonCritGapCount(0);
    setCourt({ open: false, msg: null });
    setEndOpen(false);
    setCritModal({ open: false, key: null, msg: null, draft: "" });
    setStats({
      taskAttempted: 0,
      taskCompleted: 0,
      criticalNotified: 0,
      criticalCompleted: 0,
      criticalFailed: 0,
      minorFails: 0,
      majorFails: 0,
    });
  }, [startKey, totalSeconds, config]);

  useEffect(() => {
    if (running && !tickRef.current) {
      tickRef.current = window.setInterval(() => {
        setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
    }
    if (!running && tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    return () => {
      if (tickRef.current) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [running]);

  useEffect(() => {
    const int = window.setInterval(() => {
      const t = Date.now();

      setDock((prev) => {
        const next = prev.map((d) => ({ ...d }));
        for (const it of next) {
          if (critModal.open) break;
          if (
            it.msg.category === "critical" &&
            it.stageDeadlineAt &&
            t >= it.stageDeadlineAt
          ) {
            if (it.stage === "initial") {
              it.stage = "urgent";
              it.stageDeadlineAt = t + STAGE_MS;
            } else if (it.stage === "urgent") {
              openCourt(it.msg);
            }
          }
        }
        return next;
      });

      if (delayed.size) {
        const remove: string[] = [];
        delayed.forEach((v, k) => {
          if (t >= v.at) {
            setDock((prev) => {
              const present = prev.some(
                (x) => x.key === keyFor(v.msg) && x.stage === "urgent"
              );
              if (present) return prev;
              const ins: DockItem = {
                id: uid(),
                key: keyFor(v.msg),
                msg: v.msg,
                isOpen: false,
                stage: "urgent",
                stageDeadlineAt: t + STAGE_MS,
              };
              setStats((s) => ({
                ...s,
                criticalNotified: s.criticalNotified + 1,
              }));
              return [...prev, ins];
            });
            remove.push(k);
          }
        });
        if (remove.length) {
          const m = new Map(delayed);
          remove.forEach((k) => m.delete(k));
          setDelayed(m);
        }
      }

      if (
        running &&
        !critModal.open &&
        !court.open &&
        !endOpen &&
        t - lastSlotAt >= NEXT_ITEM_INTERVAL_MS
      ) {
        scheduleNextSlot(t);
        setLastSlotAt(t);
      }
    }, 400);
    return () => window.clearInterval(int);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    running,
    delayed,
    dock,
    lastSlotAt,
    poolCriticals,
    poolNormals,
    critModal.open,
    court.open,
    endOpen,
  ]);

  function scheduleNextSlot(nowMs: number) {
    const critFlowActive = dock.some((d) => d.msg.category === "critical");
    const timeGapOk = nowMs - lastCritAt >= CRIT_MIN_TIME_GAP_MS;
    const gapOk = nonCritGapCount >= CRIT_MIN_NONCRIT_GAP;
    const canCrit =
      !critFlowActive && (gapOk || timeGapOk) && poolCriticals.length > 0;

    if (canCrit) {
      const [c, ...rest] = poolCriticals;
      c.stage = "initial";
      c.stageDeadlineAt = nowMs + STAGE_MS;
      setPoolCriticals(rest);
      setDock((d) => [...d, c]);
      setStats((s) => ({ ...s, criticalNotified: s.criticalNotified + 1 }));
      setLastCritAt(nowMs);
      setNonCritGapCount(0);
      return;
    }

    if (poolNormals.length > 0) {
      const [n, ...rest] = poolNormals;
      setPoolNormals(rest);
      setDock((d) => [...d, n]);
      setNonCritGapCount((c) => c + 1);
    }
  }

  const start = () => {
    setLastSlotAt(Date.now());
    setRunning(true);
  };
  const stop = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setSecondsLeft(totalSeconds);
    setLastSlotAt(Date.now());
  };

  const dismissNormal = (id: string) =>
    setDock((prev) => prev.filter((x) => x.id !== id));

  const dismissCritical = (it: DockItem) => {
    setDock((prev) => prev.filter((x) => x.id !== it.id));
    if (it.stage === "initial") {
      const keyU = it.key + "|urgent";
      if (!delayed.has(keyU)) {
        const m = new Map(delayed);
        m.set(keyU, { kind: "urgent", at: Date.now() + STAGE_MS, msg: it.msg });
        setDelayed(m);
      }
    } else {
      openCourt(it.msg);
    }
  };

  const openCritModal = (it: DockItem) => {
    setRunning(false);
    setCritModal({ open: true, key: it.key, msg: it.msg, draft: "" });
  };

  const completeCrit = () => {
    const k = critModal.key;
    if (!k || !critModal.msg) return;
    const expected = normalize(critModal.msg.answer || "");
    if (expected && normalize(critModal.draft) === expected) {
      setDock((prev) => prev.filter((x) => x.key !== k));
      setDelayed((prev) => {
        const m = new Map(prev);
        m.delete(k + "|urgent");
        return m;
      });
      setStats((s) => ({ ...s, criticalCompleted: s.criticalCompleted + 1 }));
      setCritModal({ open: false, key: null, msg: null, draft: "" });
    }
  };

  const exitCrit = () => {
    if (critModal.msg) openCourt(critModal.msg);
  };

  function openCourt(msg: Message) {
    setStats((s) => ({
      ...s,
      criticalFailed: s.criticalFailed + 1,
      minorFails: s.minorFails + (msg.severity === "major" ? 0 : 1),
      majorFails: s.majorFails + (msg.severity === "major" ? 1 : 0),
    }));
    setRunning(false);
    setCritModal({ open: false, key: null, msg: null, draft: "" });
    setDock((d) => d.filter((x) => x.msg !== msg));
    setCourt({ open: true, msg });
  }

  const onReturnFromCourt = () => setCourt({ open: false, msg: null });
  const onEndFromCourt = () => {
    setCourt({ open: false, msg: null });
    setEndOpen(true);
  };

  const restartSession = () => {
    setSecondsLeft(totalSeconds);
    setRunning(false);
    setEndOpen(false);
    setCourt({ open: false, msg: null });
    setCritModal({ open: false, key: null, msg: null, draft: "" });
    setDock([]);
    setDelayed(new Map());
    setLastSlotAt(Date.now());
    setLastCritAt(0);
    setNonCritGapCount(0);

    const t: TaskItem[] = (config.messages || [])
      .filter((m) => m.category === "task")
      .map((m) => ({ id: uid(), msg: m, draft: "" }));
    const normals: DockItem[] = (config.messages || [])
      .filter((m) => m.category !== "task" && m.category !== "critical")
      .map((m) => ({
        id: uid(),
        key: keyFor(m),
        msg: m,
        isOpen: false,
        stage: "initial",
        stageDeadlineAt: null,
      }));
    const criticals: DockItem[] = (config.messages || [])
      .filter((m) => m.category === "critical")
      .map((m) => ({
        id: uid(),
        key: keyFor(m),
        msg: m,
        isOpen: false,
        stage: "initial",
        stageDeadlineAt: null,
      }));

    setTasks(t);
    setPoolNormals(normals);
    setPoolCriticals(criticals);
    setStats({
      taskAttempted: 0,
      taskCompleted: 0,
      criticalNotified: 0,
      criticalCompleted: 0,
      criticalFailed: 0,
      minorFails: 0,
      majorFails: 0,
    });
  };

  // Allow preview to use an embedded data URI if present on the scenario
  const bgStyle = useMemo(() => {
    const bg =
      (config as any).backgroundUrlDataUri ||
      config.backgroundUrl ||
      "/backgrounds/workdesk-bg.png";
    return { backgroundImage: `url("${bg.replace(/"/g, '\\"')}")` } as const;
  }, [config]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  // Helper to extract the effective court outcome for a given message
  const getCourtOutcome = (m: Message | null | undefined) => {
    const co = m?.courtOutcome;
    return {
      punishment:
        co?.punishment || config.punishmentText || "Case lost in court.",
      reason: co?.reason || "",
      canReturn: typeof co?.canReturn === "boolean" ? co.canReturn : true,
      backgroundUrl: co?.backgroundUrl || "/backgrounds/courtroom-bg.png",
    };
  };

  const currentOutcome = getCourtOutcome(court.msg || undefined);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 920,
        aspectRatio: "16/9",
        borderRadius: 12,
        overflow: "hidden",
        background: "#111",
        boxShadow: "0 8px 28px rgba(0,0,0,.25)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundSize: "cover",
          backgroundPosition: "center",
          ...bgStyle,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,.2), rgba(0,0,0,.35))",
        }}
      />

      {/* timer */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(0,0,0,.55)",
          border: "1px solid rgba(255,255,255,.15)",
          padding: "8px 12px",
          borderRadius: 12,
          color: "#fff",
          zIndex: 4,
        }}
      >
        <div
          style={{
            fontFamily:
              'ui-monospace, Menlo, Monaco, Consolas, "Courier New", monospace',
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 1,
            background: "#000",
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,.15)",
          }}
        >
          {mm}:{ss}
        </div>
        <button className="tbtn p" onClick={start}>
          Start
        </button>
        <button className="tbtn w" onClick={stop}>
          Stop
        </button>
        <button className="tbtn d" onClick={reset}>
          Reset
        </button>
      </div>

      {/* centered panel — 420 × 350, a bit lower */}
      <div
        style={{
          position: "absolute",
          top: "60%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 420,
          height: 350,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          background: "rgba(255,255,255,.92)",
          border: "1px solid rgba(0,0,0,.06)",
          borderRadius: 12,
          padding: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,.18)",
          zIndex: 3,
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 4, color: "#111" }}>
          Tasks
        </div>
        <div style={{ overflow: "auto" }}>
          {tasks.map((t) => (
            <div
              key={t.id}
              style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,.06)",
                borderLeft: "4px solid #22c55e",
                borderRadius: 10,
                padding: 10,
                marginBottom: 10,
              }}
            >
              <div style={{ color: "#111", fontWeight: 600, marginBottom: 6 }}>
                {t.msg.text}
              </div>
              <textarea
                rows={4}
                value={t.draft}
                onChange={(e) =>
                  setTasks((arr) =>
                    arr.map((x) =>
                      x.id === t.id ? { ...x, draft: e.target.value } : x
                    )
                  )
                }
                placeholder="Type your answer…"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  padding: "8px 10px",
                  resize: "vertical",
                }}
              />
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                  marginTop: 8,
                }}
              >
                {config.rules?.allowSkipNormals !== false && (
                  <button
                    className="btn"
                    onClick={() =>
                      setTasks((arr) => {
                        const idx = arr.findIndex((x) => x.id === t.id);
                        if (idx < 0) return arr;
                        const copy = [...arr];
                        copy.splice(idx, 1);
                        return copy;
                      })
                    }
                  >
                    Skip
                  </button>
                )}
                <button
                  className="btn resolveBtn"
                  onClick={() => {
                    const exp = normalize(t.msg.answer || "");
                    setStats((s) => ({
                      ...s,
                      taskAttempted: s.taskAttempted + 1,
                    }));
                    if (exp && normalize(t.draft) === exp) {
                      setTasks((arr) => arr.filter((x) => x.id !== t.id));
                      setStats((s) => ({
                        ...s,
                        taskCompleted: s.taskCompleted + 1,
                      }));
                    }
                  }}
                >
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* dock */}
      <div
        style={{
          position: "absolute",
          right: 16,
          bottom: 16,
          display: "flex",
          flexDirection: "column-reverse",
          gap: 10,
        }}
      >
        {dock.map((d) => (
          <div key={d.id} style={{ position: "relative" }}>
            <button
              onClick={() =>
                setDock((arr) =>
                  arr.map((x) =>
                    x.id === d.id ? { ...x, isOpen: !x.isOpen } : x
                  )
                )
              }
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                border: 0,
                background: "rgba(255,255,255,.92)",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 6px 18px rgba(0,0,0,.25)",
                cursor: "pointer",
              }}
              aria-label="Open notification"
            >
              <img
                alt=""
                style={{ width: 30, height: 30 }}
                src={
                  d.msg.category === "critical"
                    ? d.stage === "urgent"
                      ? ICONS.criticalUrgent
                      : ICONS.criticalInitial
                    : ICONS.interruption
                }
              />
            </button>

            {d.isOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 64,
                  width: 320,
                  background: "#fff",
                  color: "#111",
                  borderRadius: 12,
                  padding: 12,
                  boxShadow: "0 14px 40px rgba(0,0,0,.28)",
                  border: "1px solid rgba(0,0,0,.06)",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  {d.msg.category === "critical"
                    ? `Critical (${d.msg.severity || ""})`
                    : "Interruption"}
                </div>
                <div style={{ marginBottom: 10 }}>{d.msg.text}</div>
                {d.msg.category === "critical" && d.stageDeadlineAt && (
                  <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>
                    T-
                    {Math.max(
                      0,
                      Math.ceil((d.stageDeadlineAt - Date.now()) / 1000)
                    )}
                    s {d.stage === "initial" ? "to urgent" : "to court"}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                  }}
                >
                  {d.msg.category === "critical" ? (
                    <>
                      <button
                        className="btn resolve"
                        onClick={() => openCritModal(d)}
                      >
                        Resolve
                      </button>
                      <button
                        className="btn dismiss"
                        onClick={() => dismissCritical(d)}
                      >
                        Dismiss
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn dismiss"
                      onClick={() => dismissNormal(d.id)}
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Court */}
      {court.open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            zIndex: 5,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(.65)",
              backgroundImage: `url("${currentOutcome.backgroundUrl}")`,
            }}
          />
          <div
            style={{
              position: "relative",
              maxWidth: 760,
              background: "rgba(0,0,0,.5)",
              border: "1px solid rgba(255,255,255,.2)",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 18px 60px rgba(0,0,0,.45)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 10 }}>⚖️</div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              Courtroom Verdict
            </div>
            <div style={{ opacity: 0.95, marginBottom: 6 }}>
              <b>Punishment:</b> {currentOutcome.punishment}
            </div>
            {currentOutcome.reason && (
              <div style={{ opacity: 0.95, marginBottom: 12 }}>
                <b>Reason:</b> {currentOutcome.reason}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {currentOutcome.canReturn ? (
                <button className="btn resolveBtn" onClick={onReturnFromCourt}>
                  Return to game
                </button>
              ) : (
                <button className="btn" onClick={onEndFromCourt}>
                  End
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* End screen */}
      {endOpen && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,.86)",
            color: "#fff",
            zIndex: 6,
            padding: 20,
          }}
        >
          <div
            style={{
              width: "min(820px, 96vw)",
              background: "rgba(0,0,0,.35)",
              border: "1px solid rgba(255,255,255,.2)",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
              Session Summary
            </div>
            <div style={{ lineHeight: 1.8, marginBottom: 16 }}>
              <div>
                Tasks — Attempted: {stats.taskAttempted}, Completed:{" "}
                {stats.taskCompleted}
              </div>
              <div>
                Criticals — Notified: {stats.criticalNotified}, Completed:{" "}
                {stats.criticalCompleted}, Failed: {stats.criticalFailed}
              </div>
              <div>
                Fails — Minor: {stats.minorFails}, Major: {stats.majorFails}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn resolveBtn" onClick={restartSession}>
                Restart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Critical modal overlay — match panel size */}
      {critModal.open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "absolute",
            top: "60%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 420,
            height: 350,
            zIndex: 7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,.35)",
              borderRadius: 12,
              padding: 12,
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                background: "#fff",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,.06)",
                padding: 14,
                boxShadow: "0 16px 40px rgba(0,0,0,.3)",
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 8, color: "#111" }}>
                Critical Task{" "}
                {critModal.msg?.severity ? `(${critModal.msg?.severity})` : ""}
              </div>
              <div style={{ marginBottom: 10, color: "#111" }}>
                {critModal.msg?.text}
              </div>
              <textarea
                rows={5}
                placeholder="Type your answer…"
                value={critModal.draft}
                onChange={(e) =>
                  setCritModal((c) => ({ ...c, draft: e.target.value }))
                }
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  padding: "8px 10px",
                  resize: "vertical",
                  marginBottom: 10,
                }}
              />
              <div
                style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
              >
                <button className="btn resolveBtn" onClick={completeCrit}>
                  Complete
                </button>
                <button className="btn" onClick={exitCrit}>
                  Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function normalize(s: string) {
  return String(s || "")
    .trim()
    .toLowerCase();
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function keyFor(m: Message) {
  return (m.id || m.text) + "|" + (m.severity || "");
}
