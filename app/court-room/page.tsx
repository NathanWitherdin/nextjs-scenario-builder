// app/court-room/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import CourtroomBuilderForm from "@/components/CourtroomBuilderForm";
import CourtroomPreview from "@/components/CourtroomPreview";
import CodeOutput from "@/components/CodeOutput";
import { Scenario, createEmptyScenario } from "@/lib/types";
import { generateCourtroomHTML } from "@/lib/codeGenerator";
import { embedScenarioImages } from "@/lib/embedDataUris";

export default function CourtRoomPage() {
  // ✅ instrumentation hook must be inside the component
  useEffect(() => {
    console.log(
      "[Instrumentation] Courtroom page loaded at",
      new Date().toLocaleTimeString()
    );
  }, []);

  const [scenario, setScenario] = useState<Scenario>(() =>
    createEmptyScenario()
  );
  const [startKey, setStartKey] = useState<number>(0);
  const [code, setCode] = useState<string>("");
  const [currentId, setCurrentId] = useState<string>("");

  const handlePreview = () => setStartKey((k) => k + 1);

  const handleGenerate = async () => {
    try {
      const cfgWithDataUris = await embedScenarioImages(scenario);
      const html = generateCourtroomHTML(cfgWithDataUris);
      setCode(html);
    } catch (e) {
      console.error("Generate failed:", e);
      setCode("<!-- Generation failed: see console -->");
    }
  };

  // ---- API actions ----

  const handleSave = async () => {
    try {
      const resp = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scenario),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        alert("Save failed: " + (err.error || resp.statusText));
        return;
      }
      const { id } = await resp.json();
      setCurrentId(id);
      alert("Scenario saved with ID: " + id);
    } catch (e: any) {
      alert("Save failed: " + (e?.message ?? "Unknown error"));
    }
  };

  const handleLoad = async () => {
    const id = prompt("Enter Scenario ID to load:", currentId || "");
    if (!id) return;

    try {
      const resp = await fetch(`/api/scenarios/${id}`);
      if (!resp.ok) {
        alert("Load failed: " + resp.statusText);
        return;
      }
      const data = await resp.json();
      setScenario(data);
      setCurrentId(id);
      alert("Scenario loaded.");
    } catch (e: any) {
      alert("Load failed: " + (e?.message ?? "Unknown error"));
    }
  };

  const handleUpdate = async () => {
    if (!currentId) {
      alert("No scenario ID available. Save or Load first.");
      return;
    }
    try {
      const resp = await fetch(`/api/scenarios/${currentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scenario),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        alert("Update failed: " + (err.error || resp.statusText));
        return;
      }
      alert("Scenario updated.");
    } catch (e: any) {
      alert("Update failed: " + (e?.message ?? "Unknown error"));
    }
  };

  const handleDelete = async () => {
    if (!currentId) {
      alert("No scenario ID available to delete.");
      return;
    }
    if (!confirm("Are you sure you want to delete this scenario?")) return;

    try {
      const resp = await fetch(`/api/scenarios/${currentId}`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        alert("Delete failed: " + resp.statusText);
        return;
      }
      setScenario(createEmptyScenario());
      setCurrentId("");
      alert("Scenario deleted.");
    } catch (e: any) {
      alert("Delete failed: " + (e?.message ?? "Unknown error"));
    }
  };

  return (
    <main style={{ padding: 16, display: "grid", gap: 16 }}>
      {/* Builder */}
      <CourtroomBuilderForm
        value={scenario}
        onChange={setScenario}
        onPreview={handlePreview}
        onGenerate={handleGenerate}
      />

      {/* CRUD Buttons */}
      <section
        style={{
          display: "flex",
          gap: 8,
          background: "var(--card)",
          border: "1px solid var(--muted)",
          borderRadius: 12,
          padding: 12,
        }}
      >
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-2 rounded bg-blue-600 text-white"
        >
          Save
        </button>
        <button
          type="button"
          onClick={handleLoad}
          className="px-3 py-2 rounded bg-gray-600 text-white"
        >
          Load by ID
        </button>
        <button
          type="button"
          onClick={handleUpdate}
          className="px-3 py-2 rounded bg-green-600 text-white"
        >
          Update
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="px-3 py-2 rounded bg-red-600 text-white"
        >
          Delete
        </button>
      </section>

      {/* Preview (gameplay) */}
      <section
        aria-label="Preview"
        style={{
          background: "var(--card)",
          border: "1px solid var(--muted)",
          borderRadius: 12,
          padding: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          color: "var(--fg)",
        }}
      >
        <div style={{ fontWeight: 800, margin: "0 0 8px 4px" }}>Preview</div>
        <CourtroomPreview config={scenario} startKey={startKey} />
      </section>

      {/* Generated code */}
      <CodeOutput code={code} filename="courtroom.html" />
    </main>
  );
}
