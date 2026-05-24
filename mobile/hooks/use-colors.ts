import {
  Colors,
  type ColorScheme,
  type ThemeColorPalette,
} from "@/lib/_core/theme";
import { useColorScheme } from "./use-color-scheme";

/**
 * Returns the current theme's color palette.
 * Usage: const colors = useColors(); then colors.text, colors.background, etc.
 *
 * Handles hydration properly to prevent "Objects are not valid as React child" errors.
 */
export function useColors(
  colorSchemeOverride?: ColorScheme,
): ThemeColorPalette {
  const colorSchema = useColorScheme();
  const scheme = (colorSchemeOverride ?? colorSchema ?? "light") as ColorScheme;

  // Validate that Colors[scheme] is a valid object before returning
  if (!Colors || !Colors[scheme] || typeof Colors[scheme] !== 'object') {
    // Return safe default during initialization
    return Colors?.light ?? {
      text: "#11181c",
      background: "#ffffff",
      tint: "#0a7ea4",
      icon: "#687076",
      tabIconDefault: "#687076",
      tabIconSelected: "#0a7ea4",
      border: "#e5e7eb",
    };
  }

  return Colors[scheme];
}