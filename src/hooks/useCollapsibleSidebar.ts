import { useState, useEffect, useRef, useCallback } from "react";
import { useMediaQuery } from "./useMediaQuery";

export interface UseCollapsibleSidebarOptions {
  storageKey: string;
  breakpoint?: string;
}

/**
 * Custom hook to manage responsive sidebar collapse state with listener and session persistence.
 * - Automatically collapses when screen size is below the breakpoint (default: < 1200px).
 * - Allows the user to manually toggle, remembering their preference for the current session.
 */
export function useCollapsibleSidebar(
  storageKey: string,
  breakpoint = "(max-width: 1200px)",
) {
  const isBelowBreakpoint = useMediaQuery(breakpoint);

  // Initialize state based on session preference, screen width, or local storage
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const sessionPref = sessionStorage.getItem(`${storageKey}_collapsed`);
      if (sessionPref !== null) {
        return sessionPref === "true";
      }

      if (
        typeof window !== "undefined" &&
        window.matchMedia(breakpoint).matches
      ) {
        return true;
      }

      const localPref = localStorage.getItem(`${storageKey}_collapsed`);
      if (localPref !== null) {
        return localPref === "true";
      }

      return false;
    } catch {
      return false;
    }
  });

  const prevBelowRef = useRef(isBelowBreakpoint);

  // Auto-collapse when resizing from desktop down to < 1200px, or expand when resizing back up
  useEffect(() => {
    if (isBelowBreakpoint && !prevBelowRef.current) {
      setIsCollapsed(true);
      try {
        sessionStorage.setItem(`${storageKey}_collapsed`, "true");
      } catch {
        // ignore
      }
    } else if (!isBelowBreakpoint && prevBelowRef.current) {
      setIsCollapsed(false);
      try {
        sessionStorage.setItem(`${storageKey}_collapsed`, "false");
      } catch {
        // ignore
      }
    }
    prevBelowRef.current = isBelowBreakpoint;
  }, [isBelowBreakpoint, storageKey]);

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem(`${storageKey}_collapsed`, String(next));
        localStorage.setItem(`${storageKey}_collapsed`, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, [storageKey]);

  return { isCollapsed, toggle, setIsCollapsed, isBelowBreakpoint };
}
