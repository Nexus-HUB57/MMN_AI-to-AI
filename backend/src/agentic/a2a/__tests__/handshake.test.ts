/**
 * Smoke tests do handshake A2A.
 * Executável com `node --test backend/src/agentic/a2a/__tests__/handshake.test.ts`
 * após compilar TS.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  processHandshake,
  verifyHandshakeResponse,
  signHandshakePayload,
  verifyHandshakePayload,
} from "../handshake";
import { buildRootAgentCard, DEFAULT_ROOT_SKILLS } from "../agentCard";

const SECRET = "test-secret-nexus-a2a";
const card = buildRootAgentCard({
  publicKey: "test-public-key",
  baseUrl: "https://oneverso.com.br",
  skills: DEFAULT_ROOT_SKILLS,
  expiresInDays: 30,
});

describe("A2A handshake", () => {
  it("aceita request válido e retorna resposta assinada", () => {
    const nonce = "abcdef1234567890nonce";
    const resp = processHandshake(
      {
        specVersion: "1.0",
        callerAgentId: "test-caller",
        callerTenantId: "tenant-x",
        nonce,
        timestamp: new Date().toISOString(),
      },
      { agentCard: card, secret: SECRET },
    );
    assert.equal(resp.nonceEcho, nonce);
    assert.ok(resp.sessionId.length >= 8);
    const v = verifyHandshakeResponse(resp, nonce, SECRET);
    assert.deepEqual(v, { ok: true });
  });

  it("rejeita nonce divergente", () => {
    const resp = processHandshake(
      {
        specVersion: "1.0",
        callerAgentId: "x",
        nonce: "AAAAAAAAAAAAAAAA",
        timestamp: new Date().toISOString(),
      } as any,
      { agentCard: card, secret: SECRET },
    );
    const v = verifyHandshakeResponse(resp, "OUTRO_NONCE_QUALQUER", SECRET);
    assert.equal(v.ok, false);
  });

  it("filtra skills quando requestedSkills é informado", () => {
    const resp = processHandshake(
      {
        specVersion: "1.0",
        callerAgentId: "filter-test",
        nonce: "abcdef1234567890nonce",
        timestamp: new Date().toISOString(),
        requestedSkills: ["copywriter-persuasivo", "judge-revisor"],
      },
      { agentCard: card, secret: SECRET },
    );
    assert.equal(resp.agentCard.skills.length, 2);
    const slugs = resp.agentCard.skills.map((s) => s.slug);
    assert.ok(slugs.includes("copywriter-persuasivo"));
    assert.ok(slugs.includes("judge-revisor"));
  });

  it("JWS assina e verifica payload arbitrário", () => {
    const token = signHandshakePayload({ foo: "bar", n: 7 }, SECRET);
    const v = verifyHandshakePayload(token, SECRET);
    assert.equal(v.ok, true);
    if (v.ok) {
      assert.equal(v.payload.foo, "bar");
      assert.equal(v.payload.n, 7);
    }
  });

  it("JWS rejeita secret divergente", () => {
    const token = signHandshakePayload({ foo: "bar" }, SECRET);
    const v = verifyHandshakePayload(token, "outro-secret");
    assert.equal(v.ok, false);
  });
});
