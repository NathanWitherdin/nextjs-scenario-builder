"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NavMemory() {
  const router = useRouter();

  useEffect(() => {
    try {
      // Only act on the very first load, and only if we started on "/"
      if (typeof window === "undefined") return;
      if (window.location.pathname !== "/") return;

      // cookie → localStorage fallback
      let saved: string | null = null;
      const m = document.cookie.match(/(?:^|;\s*)lastPage=([^;]+)/);
      if (m) saved = decodeURIComponent(m[1]);
      if (!saved) saved = localStorage.getItem("lastPage");

      // If we have a saved non-home page, go there
      if (saved && saved !== "/") {
        router.replace(saved);
      }
    } catch {
      /* no-op */
    }
    // Run only once on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
