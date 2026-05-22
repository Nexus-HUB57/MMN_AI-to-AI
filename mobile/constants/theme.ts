export type ColorScheme = "light" | "dark";

export type ThemeColorPalette = {
  primary: string;
  tint: string;
  background: string;
  surface: string;
  foreground: string;
  text: string;
  muted: string;
  border: string;
  icon: string;
  success: string;
  warning: string;
  error: string;
};

export const SchemeColors: Record<ColorScheme, ThemeColorPalette> = {
  light: {
    primary: "#0a7ea4",
    tint: "#0a7ea4",
    background: "#ffffff",
    surface: "#f5f5f5",
    foreground: "#11181C",
    text: "#11181C",
    muted: "#687076",
    border: "#E5E7EB",
    icon: "#687076",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
  },
  dark: {
    primary: "#0a7ea4",
    tint: "#0a7ea4",
    background: "#151718",
    surface: "#1e2022",
    foreground: "#ECEDEE",
    text: "#ECEDEE",
    muted: "#9BA1A6",
    border: "#334155",
    icon: "#9BA1A6",
    success: "#4ADE80",
    warning: "#FBBF24",
    error: "#F87171",
  },
};

export const Colors = SchemeColors;
