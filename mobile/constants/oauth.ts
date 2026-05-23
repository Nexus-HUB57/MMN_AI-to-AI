const FALLBACK_API_URL = "http://localhost:3000";

export const SESSION_TOKEN_KEY = "mmn.sessionToken";
export const USER_INFO_KEY = "mmn.userInfo";

function normalizeBaseUrl(value?: string | null): string {
  if (!value) return "";
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getApiBaseUrl(): string {
  const envUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_TRPC_URL?.replace(/\/api\/trpc$/, "") ||
    process.env.EXPO_PUBLIC_BACKEND_URL;

  const normalizedEnv = normalizeBaseUrl(envUrl);
  if (normalizedEnv) return normalizedEnv;

  if (typeof window !== "undefined" && window.location?.origin) {
    return normalizeBaseUrl(window.location.origin);
  }

  return FALLBACK_API_URL;
}
