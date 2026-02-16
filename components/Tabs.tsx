"use client";
import { useState, useMemo, useEffect } from "react";

type Tab = { title: string; content: string };

const DEFAULT_TABS: Tab[] = [
  { title: "Tab 1", content: "Put content here..." },
  { title: "Tab 2", content: "Put content here..." },
  { title: "Tab 3", content: "Put content here..." },
];

const TABS_KEY = "tabsData";
const ACTIVE_KEY = "lastActiveTab";

export default function Tabs() {
  const [tabs, setTabs] = useState<Tab[]>(DEFAULT_TABS);
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  // restore
  useEffect(() => {
    try {
      const savedTabs = localStorage.getItem(TABS_KEY);
      if (savedTabs) {
        const parsed = JSON.parse(savedTabs) as Tab[];
        if (Array.isArray(parsed) && parsed.length > 0)
          setTabs(parsed.slice(0, 5));
      }
      const savedActive = localStorage.getItem(ACTIVE_KEY);
      if (savedActive !== null) {
        const idx = Number(savedActive);
        if (!Number.isNaN(idx)) setActive(idx);
      }
    } catch {}
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
      showToast("✅ Tabs saved");
    } catch {}
  }, [tabs]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_KEY, String(active));
    } catch {}
  }, [active]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  };

  const htmlOutput = useMemo(() => generateStandaloneHTML(tabs), [tabs]);

  const addTab = () => {
    if (tabs.length >= 5) return;
    setTabs([...tabs, { title: `Tab ${tabs.length + 1}`, content: "" }]);
    setActive(tabs.length);
  };

  const removeLast = () => {
    if (tabs.length <= 1) return;
    const next = tabs.slice(0, -1);
    setTabs(next);
    setActive((i) => Math.min(i, next.length - 1));
  };

  const resetTabs = () => {
    setTabs(DEFAULT_TABS);
    setActive(0);
    try {
      localStorage.setItem(TABS_KEY, JSON.stringify(DEFAULT_TABS));
      localStorage.setItem(ACTIVE_KEY, "0");
    } catch {}
    showToast("🔄 Tabs reset");
  };

  const updateTitle = (i: number, v: string) =>
    setTabs((t) =>
      t.map((tab, idx) => (idx === i ? { ...tab, title: v } : tab))
    );

  const updateContent = (i: number, v: string) =>
    setTabs((t) =>
      t.map((tab, idx) => (idx === i ? { ...tab, content: v } : tab))
    );

  const copyHtml = async (html: string) => {
    try {
      await navigator.clipboard.writeText(html);
      showToast("📋 HTML copied");
    } catch {
      alert("Copy failed. Select text and press Ctrl/Cmd+C.");
    }
  };

  const downloadHtml = (html: string) => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Hello.html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("💾 Download started");
  };

  return (
    <section style={{ position: "relative" }}>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            background: "#333",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 6,
            fontSize: "0.9rem",
            opacity: 0.9,
            zIndex: 1000,
          }}
        >
          {toast}
        </div>
      )}

      <div
        style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}
      >
        <button onClick={addTab} disabled={tabs.length >= 5} style={btn}>
          + Add tab
        </button>
        <button onClick={removeLast} disabled={tabs.length <= 1} style={btn}>
          – Remove last
        </button>
        <button
          onClick={resetTabs}
          style={btnWarn}
          title="Reset tabs to default 3"
        >
          Reset to defaults
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Editable tabs"
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        {tabs.map((t, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={active === i}
            aria-controls={`p-${i}`}
            id={`t-${i}`}
            onClick={() => setActive(i)}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--muted)",
              borderRadius: 8,
              background: active === i ? "var(--card)" : "transparent",
              cursor: "pointer",
            }}
          >
            {t.title || `Tab ${i + 1}`}
          </button>
        ))}
      </div>

      {tabs.map((t, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`p-${i}`}
          aria-labelledby={`t-${i}`}
          hidden={active !== i}
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid var(--muted)",
            borderRadius: 8,
          }}
        >
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Tab title
          </label>
          <input
            value={t.title}
            onChange={(e) => updateTitle(i, e.target.value)}
            maxLength={40}
            placeholder={`Tab ${i + 1}`}
            style={input}
          />

          <label
            style={{ display: "block", fontWeight: 600, margin: "12px 0 6px" }}
          >
            Tab content (plain text or HTML; raw code allowed inside
            &lt;pre&gt;&lt;code&gt;)
          </label>
          <textarea
            value={t.content}
            onChange={(e) => updateContent(i, e.target.value)}
            placeholder="Write the content for this tab…"
            rows={6}
            style={textarea}
          />
        </div>
      ))}

      <hr
        style={{
          margin: "16px 0",
          border: 0,
          borderTop: "1px solid var(--muted)",
        }}
      />
      <h3 style={{ marginBottom: 8 }}>Generated HTML</h3>
      <textarea
        readOnly
        value={htmlOutput}
        style={{
          width: "100%",
          minHeight: 280,
          padding: "10px 12px",
          border: "1px solid var(--muted)",
          borderRadius: 8,
          background: "var(--card)",
          color: "var(--fg)",
          whiteSpace: "pre",
          overflow: "auto",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace",
          fontSize: "0.9rem",
        }}
      />

      <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => copyHtml(htmlOutput)} style={btn}>
          Copy generated HTML
        </button>
        <button onClick={() => downloadHtml(htmlOutput)} style={btn}>
          Download HTML
        </button>
      </div>
    </section>
  );
}

const btn: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid var(--muted)",
  borderRadius: 8,
  background: "var(--card)",
  cursor: "pointer",
};

const btnWarn: React.CSSProperties = {
  ...btn,
  boxShadow: "inset 0 0 0 1px rgba(255,0,0,0.12)",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid var(--muted)",
  borderRadius: 8,
  background: "var(--bg)",
  color: "var(--fg)",
};

const textarea: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid var(--muted)",
  borderRadius: 8,
  background: "var(--bg)",
  color: "var(--fg)",
};

/* ---------- Generator: inline CSS + highlight.js (CDN) ---------- */
function generateStandaloneHTML(tabs: { title: string; content: string }[]) {
  const css = `
*{box-sizing:border-box}
body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;margin:0;padding:24px}
main{max-width:960px;margin:0 auto}
h1{margin:0 0 12px}
.tablist{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px}
[role=tab]{padding:8px 12px;border:1px solid #ccc;border-radius:8px;background:#f6f6f6;cursor:pointer}
[role=tab][aria-selected="true"]{background:#eaeaea;font-weight:600}
[role=tabpanel]{border:1px solid #ccc;border-radius:8px;padding:12px;background:#fff}
.plain{white-space:pre-wrap}
pre.codebox{background:#f7f7f9;border:1px solid #ddd;border-radius:6px;padding:10px;margin:0;overflow:auto}
code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Courier New",monospace}
`;

  const buttons = tabs
    .map((t, i) => {
      const selected = i === 0 ? "true" : "false";
      const title = escapeHtml(t.title || `Tab ${i + 1}`);
      return `<button role="tab" aria-selected="${selected}" aria-controls="p-${i}" id="t-${i}">${title}</button>`;
    })
    .join("");

  const panels = tabs
    .map((t, i) => {
      const hidden = i === 0 ? "" : " hidden";
      const body = renderPanelBody(t.content);
      return `<div role="tabpanel" id="p-${i}" aria-labelledby="t-${i}"${hidden}>${body}</div>`;
    })
    .join("");

  const js = `
(function(){
  // tabs
  const list = document.querySelector('[role="tablist"]');
  if(list){
    const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
    const panels = tabs.map((_, i) => document.getElementById('p-'+i));
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[role="tab"]');
      if(!btn) return;
      const idx = tabs.indexOf(btn);
      tabs.forEach((t, i) => {
        const on = i === idx;
        t.setAttribute('aria-selected', String(on));
        panels[i].hidden = !on;
      });
    });
  }
  // highlight
  if (window.hljs) {
    document.querySelectorAll('pre.codebox > code').forEach((el)=>window.hljs.highlightElement(el));
  }
})();`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tabs</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/stackoverflow-light.min.css"> 
<style>${css}</style>
</head>
<body>
<main>
  <h1>Tabs</h1>
  <div role="tablist" class="tablist">${buttons}</div>
  ${panels}
</main>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/xml.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/javascript.min.js"></script>
<script>${js}</script>
</body>
</html>`;
}

/* -------- content decisions -------- */
function renderPanelBody(raw: string) {
  const val = raw ?? "";

  // Normalize user-provided <pre><code>…</code></pre>: escape inner, add language, codebox class
  if (/<pre[\s\S]*><code[\s\S]*>[\s\S]*<\/code>\s*<\/pre>/i.test(val)) {
    return normalizeUserCodeBlocks(val);
  }

  // If it looks like code, wrap and escape so it’s always highlighted
  if (looksLikeCode(val)) {
    const cleaned = trimOuterBlankLines(val);
    const lang = guessLang(cleaned);
    return `<pre class="codebox"><code class="language-${lang}">${escapeHtml(
      cleaned
    )}</code></pre>`;
  }

  // Otherwise plain text box preserving newlines
  return `<div class="plain">${escapeHtml(val)}</div>`;
}

function normalizeUserCodeBlocks(html: string) {
  return html.replace(
    /<pre([^>]*)>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (_m, preAttrs, codeAttrs, inner) => {
      const trimmed = trimOuterBlankLines(inner);
      const lang = /class=(["'])(.*?)\1/i.test(codeAttrs)
        ? ""
        : ` class="language-${guessLang(trimmed)}"`;
      const codeWithClass = codeAttrs.replace(/\s+$/, "");
      const preClass = /class=/i.test(preAttrs)
        ? preAttrs.replace(
            /class=(["'])(.*?)\1/i,
            (_m2: string, q: string, v: string) => `class=${q}${v} codebox${q}`
          )
        : `${preAttrs} class="codebox"`;
      return `<pre${preClass}><code${codeWithClass}${lang}>${escapeHtml(
        trimmed
      )}</code></pre>`;
    }
  );
}

/* heuristics */
function looksLikeCode(s: string) {
  const t = s.trim();
  return (
    /^<!doctype/i.test(t) ||
    /^<\s*html\b/i.test(t) ||
    /<\/?[a-z][\s\S]*>/i.test(t) ||
    /[{}`;]/.test(t) ||
    /(^|\n)\s*(npm|yarn|pnpm|sudo|dnf|systemctl|firewall-cmd)\b/i.test(t)
  );
}
function guessLang(s: string) {
  const t = s.trim();
  if (/^<!doctype/i.test(t) || /<\/?[a-z][\s\S]*>/i.test(t)) return "html";
  if (
    /^\s*(npm|yarn|pnpm|sudo|dnf|systemctl|firewall-cmd|cd|ls|cat)\b/im.test(t)
  )
    return "bash";
  if (/\b(function|const|let|var|import|export|return|class)\b/.test(t))
    return "javascript";
  return "plaintext";
}
function trimOuterBlankLines(s: string) {
  return s.replace(/^(?:\s*\r?\n)+/, "").replace(/(?:\r?\n\s*)+$/, "");
}
function escapeHtml(s: string) {
  return (s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
