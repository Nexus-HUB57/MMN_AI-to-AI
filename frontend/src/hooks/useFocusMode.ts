// D13 FOCUS_MODE — atalho F para esconder sidebar
import { useEffect, useState } from "react";

export function useFocusMode() {
  const [focus, setFocus] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("ux-focus") === "1";
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // só ativa F se não estiver digitando em input/textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (e.key === "f" || e.key === "F") {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          setFocus((f) => {
            const next = !f;
            localStorage.setItem("ux-focus", next ? "1" : "0");
            document.documentElement.classList.toggle("ux-focus-mode", next);
            return next;
          });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.classList.toggle("ux-focus-mode", focus);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus]);

  return focus;
}
