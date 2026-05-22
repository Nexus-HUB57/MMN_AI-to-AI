import { Platform } from "react-native";

export const SESSION_TOKEN_KEY = "mmn.mobile.session-token";
export const USER_INFO_KEY = "mmn.mobile.user-info";

function normalizeBaseUrl(rawUrl?: string | null) {
  const fallback = "http://localhost:3000";
  const value = rawUrl?.trim() || fallback;

  if (Platform.OS === "android" && value.includes("localhost")) {
    return value.replace("localhost", "10.0.2.2");
  }

  return value;
}

export function getApiBaseUrl() {
  return normalizeBaseUrl(
    process.env.EXPO_PUBLIC_API_URL ||
      process.env.API_URL ||
      process.env.BACKEND_URL ||
      null,
  );
}
