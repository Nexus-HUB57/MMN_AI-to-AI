import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Appearance,
  Platform,
  useColorScheme as useSystemColorScheme,
} from "react-native";
import { colorScheme as nativewindColorScheme } from "nativewind";

import { SchemeColors, type ColorScheme } from "@/lib/_core/theme";

// Safe wrapper for document access (SSR compatible)
const isClient = typeof window !== "undefined" && typeof document !== "undefined";

function syncDocumentTheme(scheme: ColorScheme) {
  // Only run on client-side
  if (!isClient) return;

  try {
    const root = document.documentElement;
    if (!root) return;

    root.dataset.theme = scheme;
    root.classList.toggle("dark", scheme === "dark");

    const palette = SchemeColors[scheme];
    if (palette && typeof palette === 'object') {
      Object.entries(palette).forEach(([token, value]) => {
        if (typeof token === 'string' && typeof value === 'string') {
          root.style.setProperty(`--color-${token}`, value);
        }
      });
    }
  } catch (error) {
    // Silently handle errors in non-browser environments
    console.warn('[ThemeProvider] Failed to sync document theme:', error);
  }
}

type ThemeContextValue = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  isHydrated: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("light");
  const [isHydrated, setIsHydrated] = useState(false);

  const applyScheme = useCallback((scheme: ColorScheme) => {
    try {
      nativewindColorScheme.set(scheme);

      if (Platform.OS !== "web") {
        Appearance.setColorScheme?.(scheme);
      }

      syncDocumentTheme(scheme);
    } catch (error) {
      console.warn('[ThemeProvider] Failed to apply scheme:', error);
    }
  }, []);

  const setColorScheme = useCallback(
    (scheme: ColorScheme) => {
      setColorSchemeState(scheme);
      applyScheme(scheme);
    },
    [applyScheme],
  );

  // Handle hydration properly
  useEffect(() => {
    // Initialize with system scheme on client
    const initialScheme = systemScheme;
    setColorSchemeState(initialScheme);
    applyScheme(initialScheme);
    setIsHydrated(true);
  }, [applyScheme, systemScheme]);

  const value = useMemo(
    () => ({
      colorScheme,
      setColorScheme,
      isHydrated,
    }),
    [colorScheme, setColorScheme, isHydrated],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }

  return context;
}

// Utility hook for components that need to handle hydration
export function useHydratedTheme() {
  const { colorScheme, isHydrated } = useThemeContext();

  // Return a safe default during SSR/hydration
  if (!isHydrated) {
    return {
      colorScheme: "light" as ColorScheme,
      isHydrated: false,
    };
  }

  return { colorScheme, isHydrated };
}