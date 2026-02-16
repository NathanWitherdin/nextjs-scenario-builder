// app/components/CodeOutput.tsx
"use client";

import React, { useMemo, useRef, useState } from "react";

type Props = {
  code: string; // your generated single-file HTML
  filename?: string;
};

export default function CodeOutput({
  code,
  filename = "courtroom.html",
}: Props) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const blobUrl = useMemo(() => {
    try {
      if (!code) return "";
      const blob = new Blob([code], { type: "text/html;charset=utf-8" });
      return URL.createObjectURL(blob);
    } catch {
      return "";
    }
  }, [code]);

  const onCopy = async () => {
    try {
      if (code && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        return;
      }
    } catch {}
    if (taRef.current) {
      taRef.current.select();
      // eslint-disable-next-line deprecation/deprecation
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const onDownload = () => {
    try {
      const blob = new Blob([code], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.endsWith(".html") ? filename : `${filename}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch {}
  };

  const onOpenPreview = () => {
    if (!blobUrl) return;
    window.open(blobUrl, "_blank", "noopener,noreferrer");
  };

  // Send generated HTML to Lambda via *server proxy* to avoid CORS
  const onSendToLambda = async () => {
    if (!code) {
      alert("No generated HTML yet. Click Generate first.");
      return;
    }
    setSending(true);
    try {
      const payload = {
        title: "Courtroom – Generated Page",
        heading: "Courtroom Scenario (Lambda)",
        theme: "dark", // or "light"
        bodyHtml: code, // your generated HTML
      };

      // call our Next.js API route (same origin) -> it talks to Lambda
      const res = await fetch("/api/lambda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Proxy/Lambda error ${res.status}: ${t}`);
      }

      const html = await res.text();

      // download the HTML returned by Lambda
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `courtroom-lambda-${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(a.href);
      a.remove();
    } catch (e: any) {
      alert(e?.message || "Failed sending to Lambda");
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      aria-label="Generated Code"
      style={{
        background: "var(--card)",
        border: "1px solid var(--muted)",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        marginBottom: 16,
        color: "var(--fg)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <h3 style={{ margin: 0 }}>Generated HTML (copy-paste / download)</h3>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onOpenPreview}
            style={{
              border: 0,
              borderRadius: 8,
              padding: "8px 12px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              background: "#64748b",
              color: "#fff",
            }}
            disabled={!code}
            title="Open preview in a new tab"
          >
            Preview
          </button>

          <button
            onClick={onDownload}
            style={{
              border: 0,
              borderRadius: 8,
              padding: "8px 12px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              background: "#10b981",
              color: "#fff",
            }}
            disabled={!code}
            title="Download as .html"
          >
            Download
          </button>

          <button
            onClick={onCopy}
            style={{
              border: 0,
              borderRadius: 8,
              padding: "8px 12px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              background: copied ? "#16a34a" : "#0ea5e9",
              color: "#fff",
            }}
            disabled={!code}
            title="Copy to clipboard"
          >
            {copied ? "Copied" : "Copy"}
          </button>

          <button
            onClick={onSendToLambda}
            style={{
              border: 0,
              borderRadius: 8,
              padding: "8px 12px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              background: sending ? "#6b7280" : "#111827",
              color: "#fff",
            }}
            disabled={!code || sending}
            title="Send to Lambda & download rendered page"
          >
            {sending ? "Sending…" : "Send to Lambda & Download"}
          </button>
        </div>
      </div>

      <textarea
        ref={taRef}
        value={code}
        readOnly
        spellCheck={false}
        style={{
          width: "100%",
          minHeight: 320,
          boxSizing: "border-box",
          borderRadius: 8,
          border: "1px solid var(--muted)",
          padding: 12,
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          fontSize: 12,
          lineHeight: 1.4,
          background: "var(--bg)",
          color: "var(--fg)",
          whiteSpace: "pre",
          overflow: "auto",
        }}
        aria-label="Generated single-file HTML code"
      />
    </section>
  );
}
