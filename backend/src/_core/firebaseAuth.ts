/**
 * Firebase Auth Integration
 *
 * Implementa autenticação Firebase com JWT refresh tokens e login social.
 */

import { TRPCError } from '@trpc/server';
import * as firebaseAdmin from 'firebase-admin';

// Tipos para autenticação
export interface FirebaseUser {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  providerData: ProviderData[];
  metadata: UserMetadata;
}

export interface ProviderData {
  providerId: string;
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
}

export interface UserMetadata {
  creationTime: string;
  lastSignInTime: string;
  lastRefreshTime?: string;
}

export interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  localId: string;
}

export interface LoginResult {
  user: FirebaseUser;
  tokens: AuthTokens;
  isNewUser: boolean;
}

export interface SocialProvider {
  google?: {
    clientId: string;
    clientSecret: string;
  };
  facebook?: {
    appId: string;
    appSecret: string;
  };
  apple?: {
    clientId: string;
    teamId: string;
    keyId: string;
    privateKey: string;
  };
}

// ============================================
// FIREBASE ADMIN SDK
// ============================================

let firebaseApp: firebaseAdmin.app.App | null = null;

/**
 * Inicializa Firebase Admin SDK
 */
export function initializeFirebase(): firebaseAdmin.app.App {
  if (firebaseApp) {
    return firebaseApp;
  }

  // Configuração via ambiente
  const serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  };

  // Verificar configuração
  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    console.warn('[Firebase] Credenciais não configuradas. Usando modo demo.');
    return null as any;
  }

  firebaseApp = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount as any),
    projectId: serviceAccount.project_id
  });

  console.log('[Firebase] Inicializado com sucesso');
  return firebaseApp;
}

/**
 * Obtém instância Firebase
 */
export function getFirebaseApp(): firebaseAdmin.app.App {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
}

// ============================================
// AUTH SERVICE
// ============================================

export class FirebaseAuthService {
  /**
   * Verifica token JWT do Firebase
   */
  static async verifyToken(idToken: string): Promise<FirebaseUser | null> {
    try {
      const app = getFirebaseApp();
      if (!app) return null;

      const decodedToken = await app.auth().verifyIdToken(idToken);
      const userRecord = await app.auth().getUser(decodedToken.uid);

      return this.mapUserRecord(userRecord);
    } catch (error) {
      console.error('[Firebase] Erro ao verificar token:', error);
      return null;
    }
  }

  /**
   * Obtém usuário por UID
   */
  static async getUserByUid(uid: string): Promise<FirebaseUser | null> {
    try {
      const app = getFirebaseApp();
      if (!app) return null;

      const userRecord = await app.auth().getUser(uid);
      return this.mapUserRecord(userRecord);
    } catch (error) {
      console.error('[Firebase] Erro ao obter usuário:', error);
      return null;
    }
  }

  /**
   * Obtém usuário por email
   */
  static async getUserByEmail(email: string): Promise<FirebaseUser | null> {
    try {
      const app = getFirebaseApp();
      if (!app) return null;

      const userRecord = await app.auth().getUserByEmail(email);
      return this.mapUserRecord(userRecord);
    } catch (error) {
      console.error('[Firebase] Erro ao buscar usuário por email:', error);
      return null;
    }
  }

  /**
   * Cria usuário
   */
  static async createUser(data: {
    email: string;
    password?: string;
    displayName?: string;
    phoneNumber?: string;
  }): Promise<FirebaseUser> {
    const app = getFirebaseApp();
    if (!app) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Firebase não configurado'
      });
    }

    const userRecord = await app.auth().createUser({
      email: data.email,
      password: data.password,
      displayName: data.displayName,
      phoneNumber: data.phoneNumber
    });

    return this.mapUserRecord(userRecord);
  }

  /**
   * Atualiza usuário
   */
  static async updateUser(uid: string, data: {
    email?: string;
    password?: string;
    displayName?: string;
    photoURL?: string;
    phoneNumber?: string;
    emailVerified?: boolean;
    disabled?: boolean;
  }): Promise<FirebaseUser> {
    const app = getFirebaseApp();
    if (!app) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Firebase não configurado'
      });
    }

    const userRecord = await app.auth().updateUser(uid, data);
    return this.mapUserRecord(userRecord);
  }

  /**
   * Deleta usuário
   */
  static async deleteUser(uid: string): Promise<void> {
    const app = getFirebaseApp();
    if (!app) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Firebase não configurado'
      });
    }

    await app.auth().deleteUser(uid);
  }

  /**
   * Gera link de redefinição de senha
   */
  static async generatePasswordResetLink(email: string): Promise<string> {
    const app = getFirebaseApp();
    if (!app) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Firebase não configurado'
      });
    }

    return app.auth().generatePasswordResetLink(email);
  }

  /**
   * Gera link de verificação de email
   */
  static async generateEmailVerificationLink(email: string): Promise<string> {
    const app = getFirebaseApp();
    if (!app) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Firebase não configurado'
      });
    }

    return app.auth().generateEmailVerificationLink(email);
  }

  /**
   * Gera link de verificação de email custom action
   */
  static async generateSignInWithEmailLink(
    email: string,
    continueUrl: string
  ): Promise<string> {
    const app = getFirebaseApp();
    if (!app) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Firebase não configurado'
      });
    }

    return app.auth().generateSignInWithEmailLink(email, {
      url: continueUrl,
      handleCodeInApp: true
    });
  }

  /**
   * Define custom claims (roles, etc)
   */
  static async setCustomUserClaims(
    uid: string,
    claims: Record<string, any>
  ): Promise<void> {
    const app = getFirebaseApp();
    if (!app) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Firebase não configurado'
      });
    }

    await app.auth().setCustomUserClaims(uid, claims);
  }

  /**
   * Lista usuários (com paginação)
   */
  static async listUsers(maxResults: number = 100, pageToken?: string): Promise<{
    users: FirebaseUser[];
    nextPageToken?: string;
  }> {
    const app = getFirebaseApp();
    if (!app) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Firebase não configurado'
      });
    }

    const result = await app.auth().listUsers(maxResults, pageToken);
    return {
      users: result.users.map(u => this.mapUserRecord(u)),
      nextPageToken: result.pageToken
    };
  }

  /**
   * Vincula provedor de identidade (Google, etc)
   */
  static async linkWithPopup(
    uid: string,
    provider: 'google.com' | 'facebook.com' | 'apple.com'
  ): Promise<string> {
    const app = getFirebaseApp();
    if (!app) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Firebase não configurado'
      });
    }

    // Retorna URL de OAuth para link manual
    const continueUrl = `${process.env.APP_URL}/auth/link-callback`;

    switch (provider) {
      case 'google.com':
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${continueUrl}&response_type=code&scope=email%20profile`;
      case 'facebook.com':
        return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${continueUrl}&scope=email`;
      default:
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Provedor ${provider} não suportado`
        });
    }
  }

  /**
   * Mapeia UserRecord para FirebaseUser
   */
  private static mapUserRecord(record: firebaseAdmin.auth.UserRecord): FirebaseUser {
    return {
      uid: record.uid,
      email: record.email || undefined,
      displayName: record.displayName || undefined,
      photoURL: record.photoURL || undefined,
      phoneNumber: record.phoneNumber || undefined,
      emailVerified: record.emailVerified,
      providerData: record.providerData.map(p => ({
        providerId: p.providerId,
        uid: p.uid,
        email: p.email || undefined,
        displayName: p.displayName || undefined,
        photoURL: p.photoURL || undefined
      })),
      metadata: {
        creationTime: record.metadata.creationTime,
        lastSignInTime: record.metadata.lastSignInTime,
        lastRefreshTime: record.metadata.lastRefreshTime || undefined
      }
    };
  }
}

// ============================================
// SESSION MANAGEMENT
// ============================================

export interface Session {
  id: string;
  userId: string;
  refreshToken: string;
  deviceInfo: {
    userAgent: string;
    ipAddress: string;
    deviceType?: string;
  };
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export class SessionService {
  private sessions: Map<string, Session> = new Map();

  /**
   * Cria nova sessão
   */
  static createSession(userId: string, refreshToken: string): Session {
    const session: Session = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      refreshToken,
      deviceInfo: {
        userAgent: '',
        ipAddress: ''
      },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      isActive: true
    };

    return session;
  }

  /**
   * Renova sessão
   */
  static refreshSession(session: Session): Session {
    return {
      ...session,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
  }

  /**
   * Invalida sessão
   */
  static invalidateSession(session: Session): Session {
    return {
      ...session,
      isActive: false
    };
  }

  /**
   * Verifica se sessão expirou
   */
  static isSessionExpired(session: Session): boolean {
    return new Date() > session.expiresAt || !session.isActive;
  }
}

export default {
  initializeFirebase,
  getFirebaseApp,
  FirebaseAuthService,
  SessionService
};