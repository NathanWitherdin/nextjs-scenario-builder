"use client";

export default function Footer() {
  const today = new Date().toLocaleDateString();

  return (
    <footer
      role="contentinfo"
      aria-label="Site footer"
      style={{
        marginTop: 32,
        padding: 16,
        borderTop: "1px solid var(--muted)",
        background: "var(--bg)",
        color: "inherit",
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        justifyContent: "space-between",
      }}
    >
      <div>
        © {new Date().getFullYear()} Nathan Witherdin {" • "}Student Number:
        20960713
      </div>
      <div>{today}</div>
    </footer>
  );
}
