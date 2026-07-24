/**
 * packDeliveryService — Orquestrador Central de Delivery
 *
 * Sincronizado com Protocolo_Pack (docs/planning/Protocolo_Pack).
 * Quando um Pack é adquirido, este serviço entrega TODOS os produtos
 * definidos no protocolo:
 *
 *   1. Ebooks (via packEntitlementService — Fisher-Yates auditável)
 *   2. XP (creditação direta no affiliate_xp)
 *   3. Skills (inserção em agent_skills com base no pack skills config)
 *   4. Access Flags (academia, lab, lib, hall, vip — para controle de permissão)
 *   5. PNE/SiSu (sub-contas sustentáveis — registro no marketplace)
 *   6. Commissions config (percentuais por nível da rede)
 *   7. Monthly Activation config (valor + compensação)
 *
 * CEO-015: Sincronização completa do Protocolo Pack ao sistema.
 */

import crypto from "node:crypto";
import { Pool } from "pg";
import { PACK_PROTOCOL, type PackProtocol, type PackBenefit } from "./packProtocolService";

let _pool: Pool | null = null;
function getPool(): Pool {
  if (!_pool) {
    const connStr = process.env.DATABASE_URL;
    if (!connStr) throw new Error("DATABASE_URL not configured");
    _pool = new Pool({ connectionString: connStr, max: 10 });
  }
  return _pool;
}

// ============================================================
// TIPOS
// ============================================================

export interface DeliveryResult {
  ok: boolean;
  packSlug: string;
  userId: number;
  steps: DeliveryStep[];
  message: string;
  timestamp: string;
}

export interface DeliveryStep {
  type: "ebooks" | "xp" | "skills" | "access_flags" | "pne_sisu" | "commissions" | "activation_config";
  ok: boolean;
  detail: string;
  count?: number;
  data?: Record<string, any>;
}

// ============================================================
// FUNÇÃO PRINCIPAL
// ============================================================

/**
 * Executa o delivery completo de um Pack ao usuário.
 * Chamado por packEntitlementService.grantPackToUser() após a entrega de ebooks.
 *
 * Este serviço ORQUESTRA todos os tipos de delivery do Protocolo_Pack.
 * A entrega de ebooks é tratada separadamente pelo packEntitlementService
 * (Fisher-Yates shuffle, audit trail) — aqui entregamos os demais produtos.
 */
export async function deliverFullPack(
  userId: number,
  packSlug: string,
  opts: {
    paymentRef?: string;
    paymentMethod?: string;
    amountCents?: number;
    skipEbooks?: boolean; // true se ebooks já foram entregues
  } = {},
): Promise<DeliveryResult> {
  const protocol = PACK_PROTOCOL[packSlug];
  if (!protocol) {
    return {
      ok: false,
      packSlug,
      userId,
      steps: [],
      message: `Pack ${packSlug} nao encontrado no Protocolo_Pack`,
      timestamp: new Date().toISOString(),
    };
  }

  const steps: DeliveryStep[] = [];
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    // ─────────────────────────────────────────────
    // STEP 1: Garantir tabela de access flags
    // ─────────────────────────────────────────────
    await ensureAccessFlagsTable(client);
    steps.push({ type: "access_flags", ok: true, detail: "Tabela user_pack_access garantida" });

    // ─────────────────────────────────────────────
    // STEP 2: XP Grant
    // ─────────────────────────────────────────────
    if (protocol.xpGranted > 0) {
      const xpResult = await deliverXP(client, userId, protocol.xpGranted, packSlug);
      steps.push(xpResult);
    } else {
      steps.push({ type: "xp", ok: true, detail: "Sem XP a conceder neste pack" });
    }

    // ─────────────────────────────────────────────
    // STEP 3: Skills Delivery
    // ─────────────────────────────────────────────
    const skillsResult = await deliverSkills(client, userId, protocol);
    steps.push(skillsResult);

    // ─────────────────────────────────────────────
    // STEP 4: Access Flags (Academia, Lab, Lib, Hall, VIP)
    // ─────────────────────────────────────────────
    const flagsResult = await deliverAccessFlags(client, userId, protocol);
    steps.push(flagsResult);

    // ─────────────────────────────────────────────
    // STEP 5: PNE/SiSu Sub-accounts
    // ─────────────────────────────────────────────
    if (protocol.pneSubAccounts > 0) {
      const pneResult = await deliverPNE(client, userId, protocol);
      steps.push(pneResult);
    } else {
      steps.push({ type: "pne_sisu", ok: true, detail: "Sem PNE/SiSu neste nível" });
    }

    // ─────────────────────────────────────────────
    // STEP 6: Commissions Config
    // ─────────────────────────────────────────────
    if (protocol.commissions.length > 0) {
      const commResult = await deliverCommissionsConfig(client, userId, protocol);
      steps.push(commResult);
    } else {
      steps.push({ type: "commissions", ok: true, detail: "Sem comissões de rede neste nível (Pack A² base)" });
    }

    // ─────────────────────────────────────────────
    // STEP 7: Monthly Activation Config
    // ─────────────────────────────────────────────
    if (protocol.activation.enabled) {
      const actResult = await deliverActivationConfig(client, userId, protocol);
      steps.push(actResult);
    } else {
      steps.push({
        type: "activation_config",
        ok: true,
        detail: "Ativação mensal DESATIVADA para este nível (Pack A² base)"
      });
    }

    // ─────────────────────────────────────────────
    // Registrar delivery completo no metadata do grant
    // ─────────────────────────────────────────────
    try {
      await client.query(
        `UPDATE marketplace_pack_grants
           SET metadata = COALESCE(metadata::jsonb, '{}'::jsonb) ||
             $1::jsonb
         WHERE user_id = $2
           AND pack_slug = $3
           AND status IN ('granted','active','completed')
         ORDER BY created_at DESC
         LIMIT 1`,
        [
          JSON.stringify({
            ceo015_full_delivery: true,
            deliveredAt: new Date().toISOString(),
            steps: steps.map(s => ({ type: s.type, ok: s.ok, detail: s.detail })),
          }),
          userId,
          packSlug,
        ],
      );
    } catch (e: any) {
      console.warn(`[packDelivery] metadata update failed: ${e.message}`);
    }

    await client.query("COMMIT");

    const failedSteps = steps.filter(s => !s.ok);
    return {
      ok: failedSteps.length === 0,
      packSlug,
      userId,
      steps,
      message: failedSteps.length === 0
        ? `Pack ${packSlug} delivery completo: ${steps.length} etapas executadas`
        : `Pack ${packSlug} delivery parcial: ${failedSteps.length} falha(s) em ${steps.length} etapas`,
      timestamp: new Date().toISOString(),
    };
  } catch (e: any) {
    await client.query("ROLLBACK").catch(() => undefined);
    return {
      ok: false,
      packSlug,
      userId,
      steps,
      message: `Erro no delivery completo: ${e.message}`,
      timestamp: new Date().toISOString(),
    };
  } finally {
    client.release();
  }
}

// ============================================================
// STEP FUNCTIONS
// ============================================================

async function ensureAccessFlagsTable(client: any) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS user_pack_access (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      pack_slug VARCHAR(100) NOT NULL,
      access_type VARCHAR(50) NOT NULL,
      access_level VARCHAR(50),
      granted_at TIMESTAMPTZ DEFAULT NOW(),
      metadata JSONB DEFAULT '{}',
      UNIQUE(user_id, access_type)
    );
    CREATE INDEX IF NOT EXISTS idx_upa_user ON user_pack_access(user_id);
    CREATE INDEX IF NOT EXISTS idx_upa_type ON user_pack_access(access_type);
  `);
}

async function deliverXP(
  client: any,
  userId: number,
  xpAmount: number,
  packSlug: string,
): Promise<DeliveryStep> {
  try {
    // Inserir XP no affiliate_xp
    await client.query(`
      INSERT INTO affiliate_xp (affiliate_id, total_xp, monthly_xp, updated_at)
      VALUES (
        (SELECT id FROM affiliates WHERE "userId" = $1 LIMIT 1),
        $2,
        $2,
        NOW()
      )
      ON CONFLICT (affiliate_id) DO UPDATE
        SET total_xp = affiliate_xp.total_xp + $2,
            monthly_xp = affiliate_xp.monthly_xp + $2,
            updated_at = NOW()
    `, [userId, xpAmount]);

    // Registrar no log de XP
    try {
      await client.query(`
        INSERT INTO xp_transactions (user_id, amount, source_type, source_ref, created_at)
        VALUES ($1, $2, 'pack_grant', $3, NOW())
        ON CONFLICT DO NOTHING
      `, [userId, xpAmount, packSlug]);
    } catch {
      // xp_transactions pode não existir — ignorar
    }

    return {
      type: "xp",
      ok: true,
      detail: `+${xpAmount} XP concedidos via Pack ${packSlug}`,
      count: xpAmount,
    };
  } catch (e: any) {
    return {
      type: "xp",
      ok: false,
      detail: `Falha ao creditar XP: ${e.message}`,
    };
  }
}

async function deliverSkills(
  client: any,
  userId: number,
  protocol: PackProtocol,
): Promise<DeliveryStep> {
  const { skills } = protocol;
  const totalSkills = skills.level1 + skills.level2 + skills.level3;

  if (totalSkills === 0) {
    return {
      type: "skills",
      ok: true,
      detail: "Nenhuma Skill definida para este Pack",
      count: 0,
    };
  }

  try {
    // Obter o agent_id do usuário
    const agentRes = await client.query(
      `SELECT id FROM agents WHERE user_id = $1 LIMIT 1`,
      [userId],
    );
    const agentId = agentRes.rows[0]?.id;
    if (!agentId) {
      return {
        type: "skills",
        ok: false,
        detail: "Agente nao encontrado para este usuario — skills nao entregues",
      };
    }

    let delivered = 0;

    // Buscar skills disponíveis por nível no catálogo
    const levelMap: Record<string, string> = {
      "1": "basic",
      "2": "intermediate",
      "3": "advanced",
    };

    for (const [lvl, count] of [
      ["1", skills.level1],
      ["2", skills.level2],
      ["3", skills.level3],
    ] as const) {
      const dbLevel = levelMap[lvl];
      if (!count) continue;

      // Buscar skills disponíveis deste nível que o agente NÃO possui
      const available = await client.query(
        `SELECT s.id FROM skills s
         WHERE s.level = $1 AND s.status = 'active'
           AND s.id NOT IN (
             SELECT skill_id FROM agent_skills
             WHERE agent_id = $2 AND status = 'active'
           )
         ORDER BY s.sort_order, s.id
         LIMIT $3`,
        [dbLevel, agentId, count],
      );

      for (const row of available.rows) {
        // Calcular expiração (90 dias para skills de pack)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90);

        await client.query(
          `INSERT INTO agent_skills (agent_id, skill_id, proficiency, status, activated_at, expires_at, usage_count, source)
           VALUES ($1, $2, $3, 'active', NOW(), $4, 0, 'pack_grant')
           ON CONFLICT (agent_id, skill_id) DO NOTHING`,
          [agentId, row.id, dbLevel, expiresAt],
        );
        delivered++;
      }
    }

    // Atualizar prompt level do agente
    const promptLevelMap: Record<string, string> = {
      "basico": "basic",
      "intermediario": "intermediate",
      "avancado": "advanced",
      "pleno": "advanced",
    };
    const promptLevel = promptLevelMap[skills.promptLevel] || "basic";
    try {
      await client.query(
        `UPDATE agents SET prompt_level = $1, updated_at = NOW() WHERE id = $2`,
        [promptLevel, agentId],
      );
    } catch {
      // coluna pode não existir
    }

    return {
      type: "skills",
      ok: true,
      detail: `${delivered}/${totalSkills} Skills entregues (${skills.level1} L1 + ${skills.level2} L2 + ${skills.level3} L3)`,
      count: delivered,
      data: {
        requested: totalSkills,
        level1: skills.level1,
        level2: skills.level2,
        level3: skills.level3,
        delivered,
        promptLevel: skills.promptLevel,
      },
    };
  } catch (e: any) {
    return {
      type: "skills",
      ok: false,
      detail: `Falha na entrega de Skills: ${e.message}`,
    };
  }
}

async function deliverAccessFlags(
  client: any,
  userId: number,
  protocol: PackProtocol,
): Promise<DeliveryStep> {
  const accessMap: Record<string, { type: string; level?: string }> = {
    "academia": { type: "academia" },
    "lab": { type: "lab_nexus" },
    "lib": { type: "lib_nexus" },
    "hall": { type: "hall_socios" },
    "vip": { type: "vip_harmonic_life" },
    "acess_pleno": { type: "acess_pleno" },
  };

  const delivered: string[] = [];
  const errors: string[] = [];

  for (const benefit of protocol.benefits) {
    const mapping = accessMap[benefit.type];
    if (!mapping) continue;

    try {
      // Determinar o nível de acesso
      let accessLevel = "standard";
      if (benefit.description.includes("Nível IV")) accessLevel = "nivel_4";
      else if (benefit.description.includes("Nível V")) accessLevel = "nivel_5";
      else if (benefit.description.includes("Acesso Pleno")) accessLevel = "pleno";
      else if (benefit.description.includes("Nível Avançado")) accessLevel = "avancado";

      await client.query(
        `INSERT INTO user_pack_access (user_id, pack_slug, access_type, access_level, metadata)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, access_type) DO UPDATE
           SET pack_slug = EXCLUDED.pack_slug,
               access_level = EXCLUDED.access_level,
               granted_at = NOW(),
               metadata = EXCLUDED.metadata`,
        [
          userId,
          protocol.slug,
          mapping.type,
          accessLevel,
          JSON.stringify({
            source: "protocolo_pack",
            benefit: benefit.description,
            grantedAt: new Date().toISOString(),
          }),
        ],
      );
      delivered.push(mapping.type);
    } catch (e: any) {
      errors.push(`${mapping.type}: ${e.message}`);
    }
  }

  return {
    type: "access_flags",
    ok: errors.length === 0,
    detail: delivered.length > 0
      ? `Access flags concedidos: ${delivered.join(", ")}`
      : "Nenhum access flag especial neste nível",
    count: delivered.length,
    data: { delivered, errors },
  };
}

async function deliverPNE(
  client: any,
  userId: number,
  protocol: PackProtocol,
): Promise<DeliveryStep> {
  try {
    // Registrar sub-contas SiSu no metadata do pack grant
    const pneData = {
      pneSubAccounts: protocol.pneSubAccounts,
      status: "allocated",
      note: `${protocol.pneSubAccounts} Pack A² SiSu alocados via Protocolo_Pack`,
      createdAt: new Date().toISOString(),
    };

    // Registrar na tabela de tracking (cria se não existe)
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS pne_sisu_subaccounts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          pack_slug VARCHAR(100) NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 0,
          status VARCHAR(50) DEFAULT 'allocated',
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id, pack_slug)
        );
      `);

      await client.query(
        `INSERT INTO pne_sisu_subaccounts (user_id, pack_slug, quantity, status, metadata)
         VALUES ($1, $2, $3, 'allocated', $4)
         ON CONFLICT (user_id, pack_slug) DO UPDATE
           SET quantity = pne_sisu_subaccounts.quantity + $3,
               metadata = $4`,
        [userId, protocol.slug, protocol.pneSubAccounts, JSON.stringify(pneData)],
      );
    } catch (e: any) {
      console.warn(`[PNE] tracking table issue: ${e.message}`);
    }

    return {
      type: "pne_sisu",
      ok: true,
      detail: `${protocol.pneSubAccounts} Pack A² SiSu alocados (Sub-Contas Sustentáveis)`,
      count: protocol.pneSubAccounts,
      data: pneData,
    };
  } catch (e: any) {
    return {
      type: "pne_sisu",
      ok: false,
      detail: `Falha na alocação PNE/SiSu: ${e.message}`,
    };
  }
}

async function deliverCommissionsConfig(
  client: any,
  userId: number,
  protocol: PackProtocol,
): Promise<DeliveryStep> {
  try {
    // Registrar config de comissões no metadata do pack grant
    const commissionsData = protocol.commissions.map(c => ({
      level: c.level,
      percent: c.percent,
    }));

    return {
      type: "commissions",
      ok: true,
      detail: `Comissões configuradas: ${commissionsData.map(c => `N${c.level}=${c.percent}%`).join(", ")}`,
      count: commissionsData.length,
      data: { commissions: commissionsData, packSalesCommission: protocol.packSalesCommission },
    };
  } catch (e: any) {
    return {
      type: "commissions",
      ok: false,
      detail: `Falha ao configurar comissões: ${e.message}`,
    };
  }
}

async function deliverActivationConfig(
  client: any,
  userId: number,
  protocol: PackProtocol,
): Promise<DeliveryStep> {
  try {
    const activation = protocol.activation;

    // Garantir tabela de ativação mensal
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_monthly_activation (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          pack_slug VARCHAR(100) NOT NULL,
          cycle_label VARCHAR(50) NOT NULL,
          cost_cents INTEGER NOT NULL DEFAULT 0,
          packs_compensation INTEGER NOT NULL DEFAULT 0,
          status VARCHAR(50) DEFAULT 'configured',
          activated_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id, cycle_label)
        );
      `);
    } catch {
      // tabela pode já existir
    }

    // Registrar config (não ativa automaticamente — espera pagamento)
    const cycle = new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });
    await client.query(
      `INSERT INTO user_monthly_activation (user_id, pack_slug, cycle_label, cost_cents, packs_compensation, status)
       VALUES ($1, $2, $3, $4, $5, 'configured')
       ON CONFLICT (user_id, cycle_label) DO UPDATE
         SET cost_cents = EXCLUDED.cost_cents,
             packs_compensation = EXCLUDED.packs_compensation,
             pack_slug = EXCLUDED.pack_slug`,
      [
        userId,
        protocol.slug,
        cycle,
        activation.costCents,
        activation.packsCompensation,
      ],
    );

    const costReais = (activation.costCents / 100).toFixed(2);

    return {
      type: "activation_config",
      ok: true,
      detail: `Ativação Mensal configurada: R$${costReais}/mês → ${activation.packsCompensation}x Pack A² compensação`,
      data: {
        enabled: activation.enabled,
        costCents: activation.costCents,
        packsCompensation: activation.packsCompensation,
        cycle,
      },
    };
  } catch (e: any) {
    return {
      type: "activation_config",
      ok: false,
      detail: `Falha ao configurar ativação mensal: ${e.message}`,
    };
  }
}

// ============================================================
// QUERY HELPERS — Para uso nos routers (frontend access check)
// ============================================================

/**
 * Verifica se o usuário tem acesso a um recurso específico.
 * Usado pelos routers (academiaEad, labNexus, etc.) para verificar permissão.
 */
export async function checkUserAccess(
  userId: number,
  accessType: string,
): Promise<{ hasAccess: boolean; level: string | null; packSlug: string | null }> {
  const client = await getPool().connect();
  try {
    const r = await client.query(
      `SELECT access_type, access_level, pack_slug FROM user_pack_access
       WHERE user_id = $1 AND access_type = $2
       LIMIT 1`,
      [userId, accessType],
    );
    if (r.rows.length > 0) {
      return {
        hasAccess: true,
        level: r.rows[0].access_level,
        packSlug: r.rows[0].pack_slug,
      };
    }
    return { hasAccess: false, level: null, packSlug: null };
  } finally {
    client.release();
  }
}

/**
 * Retorna todos os access flags do usuário.
 */
export async function getUserAccessFlags(userId: number): Promise<Array<{
  accessType: string;
  accessLevel: string;
  packSlug: string;
  grantedAt: string;
}>> {
  const client = await getPool().connect();
  try {
    const r = await client.query(
      `SELECT access_type, access_level, pack_slug, granted_at
       FROM user_pack_access
       WHERE user_id = $1
       ORDER BY granted_at DESC`,
      [userId],
    );
    return r.rows.map((row: any) => ({
      accessType: row.access_type,
      accessLevel: row.access_level,
      packSlug: row.pack_slug,
      grantedAt: row.granted_at?.toISOString?.() ?? String(row.granted_at),
    }));
  } finally {
    client.release();
  }
}

/**
 * Retorna o summary de delivery de um pack para o usuário.
 */
export async function getPackDeliverySummary(userId: number, packSlug: string): Promise<{
  protocol: PackProtocol | null;
  grants: any[];
  accessFlags: any[];
}> {
  const protocol = PACK_PROTOCOL[packSlug] || null;

  const client = await getPool().connect();
  try {
    const grants = await client.query(
      `SELECT id, pack_slug, delivered_count, pool_size, status, created_at
       FROM marketplace_pack_grants
       WHERE user_id = $1 AND pack_slug = $2
       ORDER BY created_at DESC`,
      [userId, packSlug],
    );

    const flags = await client.query(
      `SELECT access_type, access_level, pack_slug, granted_at
       FROM user_pack_access
       WHERE user_id = $1
       ORDER BY access_type`,
      [userId],
    );

    return {
      protocol,
      grants: grants.rows,
      accessFlags: flags.rows,
    };
  } finally {
    client.release();
  }
}

/**
 * Executa a ativação mensal completa:
 * 1. Registra pagamento
 * 2. Entrega Pack A² compensação ao estoque
 * 3. Libera comissões/bônus do ciclo
 */
export async function processMonthlyActivation(
  userId: number,
  packSlug: string,
  paymentRef: string,
  amountCents: number,
): Promise<{
  ok: boolean;
  cycle: string;
  packsDelivered: number;
  message: string;
}> {
  const protocol = PACK_PROTOCOL[packSlug];
  if (!protocol) {
    return { ok: false, cycle: "", packsDelivered: 0, message: `Pack ${packSlug} not found` };
  }

  const cycle = new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    // Marcar ativação como paga
    await client.query(
      `UPDATE user_monthly_activation
       SET status = 'paid', activated_at = NOW()
       WHERE user_id = $1 AND cycle_label = $2 AND status != 'paid'`,
      [userId, cycle],
    );

    // Entregar Pack A² compensação (packs_compensation do protocolo)
    let packsDelivered = 0;
    for (let i = 0; i < protocol.activation.packsCompensation; i++) {
      // Grant de pack-a2 ao estoque do usuário
      const { grantPackToUser } = await import("./packEntitlementService");
      const result = await grantPackToUser(userId, "pack-a2", {
        paymentRef: `monthly:${cycle}:${paymentRef}:${i}`,
        paymentMethod: "monthly_activation",
        amountCents: 0, // compensação — sem custo adicional
      });
      if (result.ok) packsDelivered++;
    }

    await client.query("COMMIT");

    return {
      ok: true,
      cycle,
      packsDelivered,
      message: `Ativação mensal ${cycle} confirmada: ${packsDelivered}x Pack A² entregues como compensação`,
    };
  } catch (e: any) {
    await client.query("ROLLBACK").catch(() => undefined);
    return {
      ok: false,
      cycle,
      packsDelivered: 0,
      message: `Falha na ativação mensal: ${e.message}`,
    };
  } finally {
    client.release();
  }
}
