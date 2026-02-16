// src/lib/embedDataUris.ts
import { Scenario, Message } from "./types";

async function urlToDataUri(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error);
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(blob);
  });
}

export async function embedScenarioImages(s: Scenario): Promise<Scenario> {
  const out: Scenario = JSON.parse(JSON.stringify(s));

  // Background
  if (
    !("backgroundUrlDataUri" in out) ||
    (!out as any["backgroundUrlDataUri"])
  ) {
    if (out.backgroundUrl) {
      (out as any).backgroundUrlDataUri = await urlToDataUri(out.backgroundUrl);
    }
  }

  // Per-critical courtroom backgrounds
  out.messages = await Promise.all(
    (out.messages || []).map(async (m: Message) => {
      if (m.category === "critical" && (m as any).courtOutcome?.backgroundUrl) {
        const bgUrl = (m as any).courtOutcome.backgroundUrl;
        (m as any).courtOutcome.backgroundDataUri = await urlToDataUri(bgUrl);
      }
      return m;
    })
  );

  return out;
}
