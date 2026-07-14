// D13 FOCUS_MODE — legado neutralizado para manter o menu lateral como protocolo fixo
import { useEffect } from "react";

export function useFocusMode() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const clearLegacyFocusMode = () => {
      try {
        window.localStorage.removeItem("ux-focus");
      } catch {
        // noop
      }
      document.documentElement.classList.remove("ux-focus-mode");
    };

    clearLegacyFocusMode();

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      if ((e.key === "f" || e.key === "F") && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        clearLegacyFocusMode();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return false;
}
