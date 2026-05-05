export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
// Optionally preserve the original route to redirect after successful authentication
export const getLoginUrl = (returnPath?: string) => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;

  // Encode both the redirect URI and the return path in the state
  const stateData = {
    redirectUri,
    returnPath: returnPath || "/",
  };
  const state = btoa(JSON.stringify(stateData));

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

// Decode the state from OAuth callback to retrieve return path
export const decodeOAuthState = (state: string): { redirectUri: string; returnPath: string } => {
  try {
    const decoded = JSON.parse(atob(state));
    return {
      redirectUri: decoded.redirectUri || "/",
      returnPath: decoded.returnPath || "/",
    };
  } catch {
    return {
      redirectUri: window.location.origin,
      returnPath: "/",
    };
  }
};
