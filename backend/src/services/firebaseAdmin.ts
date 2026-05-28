/**
 * Firebase Admin SDK — Epic 10.3
 *
 * Inicialização lazy do Firebase Admin SDK.
 * Suporta autenticação via conta de serviço (JSON) ou variáveis de ambiente
 * individuais. Sem credenciais configuradas, retorna null com aviso.
 *
 * Instale a dependência quando for ativar: pnpm --workspace backend add firebase-admin
 */

export interface FirebaseAdminConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

export interface FirebaseUserRecord {
  uid: string;
  email: string | undefined;
  displayName: string | undefined;
  emailVerified: boolean;
  disabled: boolean;
  customClaims?: Record<string, unknown>;
  createdAt: string;
}

let adminApp: any = null;
let adminInitialized = false;
let adminUnavailableLogged = false;

function getConfig(): FirebaseAdminConfig | null {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return { projectId, clientEmail, privateKey };
}

export async function getFirebaseAdmin(): Promise<any | null> {
  if (adminInitialized) return adminApp;
  adminInitialized = true;

  const config = getConfig();
  if (!config) {
    if (!adminUnavailableLogged) {
      adminUnavailableLogged = true;
      console.warn(
        "[FirebaseAdmin] Credenciais não configuradas. " +
          "Defina FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY.",
      );
    }
    return null;
  }

  try {
    const admin = await import("firebase-admin");
    if (!admin.default.apps.length) {
      adminApp = admin.default.initializeApp({
        credential: admin.default.credential.cert({
          projectId: config.projectId,
          clientEmail: config.clientEmail,
          privateKey: config.privateKey,
        }),
      });
    } else {
      adminApp = admin.default.apps[0];
    }
    console.log(
      JSON.stringify({
        level: "info",
        tag: "firebase-admin",
        message: "Firebase Admin SDK inicializado",
        projectId: config.projectId,
      }),
    );
    return adminApp;
  } catch (err) {
    if (!adminUnavailableLogged) {
      adminUnavailableLogged = true;
      console.warn(
        "[FirebaseAdmin] Falha ao inicializar SDK. " +
          "Instale: pnpm --workspace backend add firebase-admin",
        err,
      );
    }
    return null;
  }
}

/**
 * Verifica um ID token Firebase e retorna o payload decodificado.
 */
export async function verifyFirebaseIdToken(
  idToken: string,
): Promise<{ uid: string; email?: string; name?: string; claims: Record<string, unknown> } | null> {
  const app = await getFirebaseAdmin();
  if (!app) return null;

  try {
    const { default: admin } = await import("firebase-admin");
    const decoded = await admin.auth().verifyIdToken(idToken, true);
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      claims: decoded as Record<string, unknown>,
    };
  } catch (err) {
    console.warn("[FirebaseAdmin] Falha ao verificar token:", err);
    return null;
  }
}

/**
 * Define custom claims para um usuário (usado em RBAC).
 */
export async function setCustomClaims(
  uid: string,
  claims: Record<string, unknown>,
): Promise<boolean> {
  const app = await getFirebaseAdmin();
  if (!app) return false;

  try {
    const { default: admin } = await import("firebase-admin");
    await admin.auth().setCustomUserClaims(uid, claims);
    return true;
  } catch (err) {
    console.warn("[FirebaseAdmin] Falha ao definir custom claims:", err);
    return false;
  }
}

/**
 * Busca dados de um usuário pelo UID.
 */
export async function getFirebaseUser(uid: string): Promise<FirebaseUserRecord | null> {
  const app = await getFirebaseAdmin();
  if (!app) return null;

  try {
    const { default: admin } = await import("firebase-admin");
    const record = await admin.auth().getUser(uid);
    return {
      uid: record.uid,
      email: record.email,
      displayName: record.displayName,
      emailVerified: record.emailVerified,
      disabled: record.disabled,
      customClaims: record.customClaims as Record<string, unknown> | undefined,
      createdAt: record.metadata.creationTime,
    };
  } catch (err) {
    console.warn("[FirebaseAdmin] Falha ao buscar usuário:", err);
    return null;
  }
}

/**
 * Revoga todos os tokens de refresh de um usuário (logout forçado).
 */
export async function revokeUserTokens(uid: string): Promise<boolean> {
  const app = await getFirebaseAdmin();
  if (!app) return false;

  try {
    const { default: admin } = await import("firebase-admin");
    await admin.auth().revokeRefreshTokens(uid);
    return true;
  } catch (err) {
    console.warn("[FirebaseAdmin] Falha ao revogar tokens:", err);
    return false;
  }
}

/**
 * Verifica se o Firebase Admin está disponível (credenciais configuradas e SDK carregado).
 */
export async function isFirebaseAdminAvailable(): Promise<boolean> {
  const app = await getFirebaseAdmin();
  return app !== null;
}

export default {
  getFirebaseAdmin,
  verifyFirebaseIdToken,
  setCustomClaims,
  getFirebaseUser,
  revokeUserTokens,
  isFirebaseAdminAvailable,
};
