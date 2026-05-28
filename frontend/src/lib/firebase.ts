/**
 * Firebase Client SDK — Social Login (Epic 10.3.3)
 *
 * Integração com Firebase Authentication para login social (Google, Facebook, Apple).
 *
 * Para ativar:
 *   1. Instale o pacote: pnpm --filter @mmn/frontend add firebase
 *   2. Configure as variáveis de ambiente no frontend (arquivo .env):
 *      VITE_FIREBASE_API_KEY=
 *      VITE_FIREBASE_AUTH_DOMAIN=
 *      VITE_FIREBASE_PROJECT_ID=
 *      VITE_FIREBASE_APP_ID=
 *   3. Ative os provedores no Firebase Console:
 *      Authentication → Sign-in methods → Google / Facebook / Apple
 */

export interface FirebaseUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  idToken: string;
  provider: "google" | "facebook" | "apple";
}

export interface FirebaseAuthError {
  code: string;
  message: string;
}

function getFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

function isFirebaseConfigured(): boolean {
  const cfg = getFirebaseConfig();
  return !!(cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId);
}

async function loadFirebase() {
  try {
    const firebaseAppModule = "firebase/app";
    const firebaseAuthModule = "firebase/auth";
    const [
      { initializeApp, getApps, getApp },
      { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider },
    ] = await Promise.all([
      import(/* @vite-ignore */ firebaseAppModule),
      import(/* @vite-ignore */ firebaseAuthModule),
    ]);

    const config = getFirebaseConfig();
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    const auth = getAuth(app);

    return { auth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider };
  } catch (err) {
    throw new Error(
      `Firebase não está instalado. Execute: pnpm --filter @mmn/frontend add firebase\n\nErro original: ${String(err)}`,
    );
  }
}

/**
 * Login com Google via popup.
 */
export async function signInWithGoogle(): Promise<FirebaseUserProfile> {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase não configurado. Defina VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID e VITE_FIREBASE_APP_ID no arquivo .env do frontend.",
    );
  }

  const { auth, signInWithPopup, GoogleAuthProvider } = await loadFirebase();
  const provider = new GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");

  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();

  return {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    photoURL: result.user.photoURL,
    idToken,
    provider: "google",
  };
}

/**
 * Login com Facebook via popup.
 */
export async function signInWithFacebook(): Promise<FirebaseUserProfile> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase não configurado. Veja instruções em frontend/src/lib/firebase.ts.");
  }

  const { auth, signInWithPopup, FacebookAuthProvider } = await loadFirebase();
  const provider = new FacebookAuthProvider();
  provider.addScope("email");
  provider.addScope("public_profile");

  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();

  return {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    photoURL: result.user.photoURL,
    idToken,
    provider: "facebook",
  };
}

/**
 * Login com Apple via popup.
 */
export async function signInWithApple(): Promise<FirebaseUserProfile> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase não configurado. Veja instruções em frontend/src/lib/firebase.ts.");
  }

  const { auth, signInWithPopup, OAuthProvider } = await loadFirebase();
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");

  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();

  return {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    photoURL: result.user.photoURL,
    idToken,
    provider: "apple",
  };
}

export { isFirebaseConfigured };
