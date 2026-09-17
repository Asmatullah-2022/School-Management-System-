"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sms-theme";

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Reads the persisted/system theme after mount (browser-only APIs) and
    // syncs it into state — a legitimate "synchronize with an external
    // system" effect, not derivable during the initial SSR-safe render.
    let initialDark = false;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      initialDark = stored === "dark" || (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    } catch {
      // localStorage/matchMedia unavailable; default to light.
    }
    document.documentElement.classList.toggle("dark", initialDark);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(initialDark);
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      } catch {
        // localStorage unavailable (private mode); theme just won't persist.
      }
      return next;
    });
  }, []);

  return { isDark, toggle };
}
