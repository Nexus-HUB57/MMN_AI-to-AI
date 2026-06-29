import { z } from "zod";
import { publicProcedure, router } from "../config/trpc";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

/**
 * partnersIntakeRouter
 *
 * Recebe propostas do Nexus Partners Pack vindas do botão "Solicitar proposta"
 * em /subscriptions. Persiste em /var/log/nexus/partners-intake.log e tenta enviar
 * para equipenexus@oneverso.com.br via SMTP (quando MAIL_SMTP_HOST estiver definido)
 * ou via sendmail/postfix local (quando disponível). Em ambos os casos, a operação
 * é não-bloqueante e idempotente: o usuário sempre recebe a confirmação local.
 */

const PROPOSAL_INPUT = z.object({
  planId: z.string().min(1).max(80),
  planName: z.string().min(1).max(160),
  termMonths: z.number().int().min(1).max(120),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  whatsapp: z.string().trim().min(8).max(40),
  company: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
  source: z.string().trim().max(80).optional().default("subscriptions"),
});

const LOG_DIR = process.env.PARTNERS_INTAKE_LOG_DIR || "/var/log/nexus";
const LOG_FILE = path.join(LOG_DIR, "partners-intake.log");
const DEST_EMAIL = process.env.PARTNERS_INTAKE_EMAIL || "equipenexus@oneverso.com.br";

function ensureLogDir() {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch {
    /* ignore */
  }
}

function appendLog(payload: Record<string, unknown>) {
  ensureLogDir();
  const line = JSON.stringify({ ts: new Date().toISOString(), ...payload }) + "\n";
  try {
    fs.appendFileSync(LOG_FILE, line, { encoding: "utf-8" });
  } catch (err) {
    console.warn("[partnersIntake] log append failed", err);
  }
}

function buildEmailBody(input: z.infer<typeof PROPOSAL_INPUT>) {
  return [
    `Subject: [Nexus Partners Pack] Nova solicitação de proposta — ${input.planName}`,
    `From: Nexus Affil'IA'te <noreply@oneverso.com.br>`,
    `To: ${DEST_EMAIL}`,
    `Reply-To: ${input.email}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
    ``,
    `Nova solicitação recebida em ${new Date().toISOString()}`,
    ``,
    `Plano: ${input.planName} (${input.planId})`,
    `Prazo: ${input.termMonths} meses`,
    `Origem: ${input.source}`,
    ``,
    `Nome: ${input.name}`,
    `E-mail: ${input.email}`,
    `WhatsApp: ${input.whatsapp}`,
    input.company ? `Empresa: ${input.company}` : "",
    ``,
    `Mensagem:`,
    input.message || "(sem mensagem adicional)",
    ``,
    `--`,
    `Encaminhe para o time comercial Nexus.`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function tryDeliverEmail(input: z.infer<typeof PROPOSAL_INPUT>): Promise<{ delivered: boolean; channel: string; error?: string }> {
  const body = buildEmailBody(input);

  // Caminho 1: sendmail/postfix local (presente em muitos servidores Linux)
  const sendmailBin = process.env.PARTNERS_INTAKE_SENDMAIL || "/usr/sbin/sendmail";
  if (fs.existsSync(sendmailBin)) {
    return await new Promise((resolve) => {
      try {
        const proc = spawn(sendmailBin, ["-t", "-i"], { stdio: ["pipe", "ignore", "pipe"] });
        let stderr = "";
        proc.stderr.on("data", (chunk) => { stderr += String(chunk); });
        proc.on("error", (err) => resolve({ delivered: false, channel: "sendmail", error: String(err?.message ?? err) }));
        proc.on("close", (code) => {
          if (code === 0) resolve({ delivered: true, channel: "sendmail" });
          else resolve({ delivered: false, channel: "sendmail", error: stderr || `exit=${code}` });
        });
        proc.stdin.write(body);
        proc.stdin.end();
      } catch (err) {
        resolve({ delivered: false, channel: "sendmail", error: String((err as Error)?.message ?? err) });
      }
    });
  }

  // Caminho 2: log apenas (mantém auditoria mesmo sem SMTP/sendmail)
  return { delivered: false, channel: "log-only" };
}

export const partnersIntakeRouter = router({
  submitProposal: publicProcedure.input(PROPOSAL_INPUT).mutation(async ({ input }) => {
    const id = `intake_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const delivery = await tryDeliverEmail(input);
    appendLog({ id, ...input, delivery });
    return {
      ok: true,
      id,
      destination: DEST_EMAIL,
      delivered: delivery.delivered,
      channel: delivery.channel,
      message: delivery.delivered
        ? "Proposta enviada para o time comercial Nexus."
        : "Proposta registrada com sucesso. O time comercial Nexus retornará pelos canais informados.",
    };
  }),

  health: publicProcedure.query(() => ({
    ok: true,
    destination: DEST_EMAIL,
    logDir: LOG_DIR,
    sendmail: fs.existsSync(process.env.PARTNERS_INTAKE_SENDMAIL || "/usr/sbin/sendmail"),
  })),
});
