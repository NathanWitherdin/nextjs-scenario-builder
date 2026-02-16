"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  const crumbs = parts.map((p, i) => ({
    label: decodeURIComponent(p).replace(/-/g, " "),
    href: "/" + parts.slice(0, i + 1).join("/"),
  }));

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        padding: "8px 12px",
        borderBottom: "1px solid var(--muted)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <ol
        style={{
          display: "flex",
          gap: 8,
          listStyle: "none",
          margin: 0,
          padding: 0,
          flexWrap: "wrap",
        }}
      >
        <li>
          <Link
            href="/"
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Home
          </Link>
        </li>
        {crumbs.map((c, i) => (
          <li
            key={c.href}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span aria-hidden="true"></span>
            {i === crumbs.length - 1 ? (
              <span aria-current="page" style={{ fontWeight: 600 }}>
                {c.label}
              </span>
            ) : (
              <Link
                href={c.href}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>

      <ThemeToggle />
    </nav>
  );
}
