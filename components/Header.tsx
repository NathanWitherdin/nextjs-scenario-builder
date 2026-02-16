"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // Save last visited page (cookie + localStorage)
  const rememberPage = (href: string) => {
    try {
      if (typeof document !== "undefined") {
        document.cookie = `lastPage=${encodeURIComponent(
          href
        )}; path=/; max-age=31536000`;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("lastPage", href);
      }
    } catch {
      /* no-op */
    }
  };

  // Update stored page on route change
  useEffect(() => {
    rememberPage(path);
    // When route changes, close mobile menu
    setOpen(false);
  }, [path]);

  // Close menu if Esc is pressed (mobile)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // If user grows viewport to desktop, ensure menu isn't overlay-open
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setOpen(false);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange); // older Safari
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  // Nav link factory
  const item = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      onClick={() => {
        setOpen(false);
        rememberPage(href);
      }}
      aria-current={path === href ? "page" : undefined}
      style={{
        padding: "8px 10px",
        borderRadius: 0,
        textDecoration: "none",
        color: "inherit",
        background: path === href ? "var(--card)" : "transparent",
        border: "1px solid var(--muted)",
      }}
    >
      {label}
    </Link>
  );

  // Hamburger bar style
  const bar: React.CSSProperties = {
    position: "absolute",
    left: 8,
    right: 8,
    height: 2,
    background: "currentColor",
    transition: "transform .2s ease, opacity .15s ease, top .2s ease",
  };

  return (
    <header
      role="banner"
      style={{
        borderBottom: "1px solid var(--muted)",
        position: "sticky",
        top: 0,
        background: "var(--bg)",
        color: "inherit",
        zIndex: 10,
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: 12,
          flexWrap: "wrap",
        }}
      >
        {/* Student number (left) */}
        <div style={{ fontWeight: 600, whiteSpace: "nowrap" }}>20960713</div>

        {/* Title (center) */}
        <h1
          style={{
            margin: 0,
            flex: 1,
            textAlign: "center",
            fontWeight: 700,
            lineHeight: 1.25,
            fontSize: "clamp(1.1rem, 2.2vw + 0.4rem, 1.8rem)",
          }}
        >
          CSE3CWA Assessment 1 – Next.js Web App
        </h1>

        {/* Hamburger (right) */}
        <button
          type="button"
          id="menu-button"
          aria-label="Toggle navigation menu"
          title="Menu"
          aria-controls="primary-navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={{
            position: "relative",
            width: 40,
            height: 32,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "inherit",
            flexShrink: 0,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              ...bar,
              top: open ? 15 : 8,
              transform: open ? "rotate(45deg)" : "none",
            }}
          />
          <span
            aria-hidden="true"
            style={{ ...bar, top: 15, opacity: open ? 0 : 1 }}
          />
          <span
            aria-hidden="true"
            style={{
              ...bar,
              top: open ? 15 : 22,
              transform: open ? "rotate(-45deg)" : "none",
            }}
          />
        </button>
      </div>

      {/* Collapsible nav (mobile). On desktop your globals.css forces this to horizontal flex. */}
      <nav
        id="primary-navigation"
        aria-label="Main"
        style={{
          display: open ? "flex" : "none",
          flexDirection: "column",
          gap: 8,
          padding: "0 12px 12px",
        }}
      >
        {item("/", "Home")}
        {item("/about", "About")}
        {item("/escape-room", "Escape Room")}
        {item("/coding-races", "Coding Races")}
        {item("/court-room", "Court Room")}
      </nav>
    </header>
  );
}
