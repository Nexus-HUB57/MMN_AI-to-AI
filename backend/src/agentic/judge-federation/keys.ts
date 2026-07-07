/**
 * Nexus Affil'IA'te · Judge Federation · Chaves ed25519
 *
 * Cada nó Judge tem um par de chaves ed25519 para assinar votos.
 * Em produção: chaves armazenadas em KMS (AWS KMS, GCP KMS ou HashiCorp Vault).
 * MVP: geração in-memory por boot, persistência opcional em arquivo.
 *
 * @module agentic/judge-federation/keys
 * @author Niko Nexus · CEO/AI
 */
import crypto from "node:crypto";
import { promises as fs } from "fs";
import path from "path";

const KEYS_DIR = path.resolve(process.cwd(), "data", "judge-keys");

export interface JudgeKeyPair {
  nodeId: string;
  publicKeyPem: string;
  privateKeyPem: string;
  algorithm: "ed25519";
  createdAt: string;
}

/**
 * Gera um novo par de chaves ed25519 para um nó Judge.
 */
export function generateJudgeKeys(nodeId: string): JudgeKeyPair {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  return {
    nodeId,
    publicKeyPem: publicKey.export({ type: "spki", format: "pem" }).toString(),
    privateKeyPem: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
    algorithm: "ed25519",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Carrega chaves persistidas para um nó Judge, ou gera novas se não existirem.
 */
export async function loadOrCreateJudgeKeys(nodeId: string): Promise<JudgeKeyPair> {
  await fs.mkdir(KEYS_DIR, { recursive: true });
  const filePath = path.join(KEYS_DIR, `${nodeId}.json`);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as JudgeKeyPair;
  } catch {
    const keys = generateJudgeKeys(nodeId);
    await fs.writeFile(filePath, JSON.stringify(keys, null, 2), "utf8");
    return keys;
  }
}

/**
 * Assina um payload com a chave privada do nó Judge.
 * Retorna assinatura em base64.
 */
export function signWithJudgeKey(
  payload: string | Buffer,
  privateKeyPem: string,
): string {
  const data = typeof payload === "string" ? Buffer.from(payload) : payload;
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const signature = crypto.sign(null, data, privateKey);
  return signature.toString("base64");
}

/**
 * Verifica uma assinatura ed25519 de um nó Judge.
 */
export function verifyJudgeSignature(
  payload: string | Buffer,
  signatureBase64: string,
  publicKeyPem: string,
): boolean {
  try {
    const data = typeof payload === "string" ? Buffer.from(payload) : payload;
    const publicKey = crypto.createPublicKey(publicKeyPem);
    const sig = Buffer.from(signatureBase64, "base64");
    return crypto.verify(null, data, publicKey, sig);
  } catch {
    return false;
  }
}
