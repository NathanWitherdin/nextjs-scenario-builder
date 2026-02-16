// lib/types.ts

// Categories of items shown during gameplay
export type MessageCategory = "interruption" | "task" | "critical";

// Severity applies only to 'critical' items
export type Severity = "major" | "minor";

// Per-critical court outcome (used only when category === 'critical')
export interface CourtOutcome {
  punishment: string; // e.g., "3 months suspension"
  reason: string; // e.g., "Breach of Privacy Act"
  canReturn: boolean; // whether the player can resume after court
  backgroundUrl?: string; // optional courtroom background override
}

// A single item that can appear in the notification dock / bubble
export interface Message {
  id?: string;
  category: MessageCategory;
  severity?: Severity | null; // required only for 'critical'
  text: string;
  answer?: string;

  // Per-critical outcome
  courtOutcome?: CourtOutcome;
}

// Builder-configurable rules
export interface Rules {
  majorLimit: number;
  minorLimit: number;
  allowSkipNormals: boolean;
  allowExitCriticals: boolean;
}

// Complete scenario configuration
export interface Scenario {
  id?: string;
  timerMinutes: number;
  backgroundUrl: string;
  punishmentText: string; // global fallback if a critical has no courtOutcome
  rules: Rules;
  messages: Message[];
}

// ----- Defaults & helpers -----

export const DEFAULT_RULES: Rules = {
  majorLimit: 2,
  minorLimit: 3,
  allowSkipNormals: true,
  allowExitCriticals: true,
};

export const createEmptyScenario = (): Scenario => ({
  timerMinutes: 5,
  backgroundUrl: "/backgrounds/workdesk-bg.png",
  punishmentText: "Case lost in court.",
  rules: { ...DEFAULT_RULES },
  messages: [],
});

// Guards used by the Builder
export const needsAnswer = (m: Message): boolean =>
  m.category === "task" || m.category === "critical";

export const requiresSeverity = (m: Message): boolean =>
  m.category === "critical";

export const isValidMessage = (m: Message): boolean => {
  if (!m || !m.text?.trim()) return false;
  if (m.category === "interruption") return true;
  if (m.category === "task") return !!m.answer?.trim();
  if (m.category === "critical") {
    return (
      !!m.answer?.trim() &&
      !!m.severity &&
      !!m.courtOutcome?.punishment?.trim() &&
      !!m.courtOutcome?.reason?.trim()
      // backgroundUrl is optional; canReturn is required but boolean defaults can be set in UI
    );
  }
  return false;
};

export const isValidScenario = (s: Scenario): boolean => {
  if (!s) return false;
  if (s.timerMinutes <= 0) return false;
  if (!s.backgroundUrl?.trim()) return false;
  if (!s.punishmentText?.trim()) return false;
  if (s.rules.majorLimit <= 0 || s.rules.minorLimit <= 0) return false;
  if (!Array.isArray(s.messages)) return false;
  return s.messages.every(isValidMessage);
};
