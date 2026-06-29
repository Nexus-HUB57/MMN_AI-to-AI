/**
 * emailService — envio SMTP com FAILOVER (Titan -> Gmail).
 * Variáveis principais: SMTP_HOST/SMTP_PORT/SMTP_SECURE/SMTP_USER/SMTP_PASS/SMTP_FROM
 * Variáveis fallback Gmail: SMTP_GMAIL_HOST/PORT/SECURE/USER/PASS/FROM
 */
import nodemailer from "nodemailer";

type Provider = { name: string; transport: nodemailer.Transporter; from: string };

let _providers: Provider[] | null = null;

function buildProviders(): Provider[] {
  if (_providers) return _providers;
  _providers = [];

  // Primary (Titan ou outro configurado em SMTP_HOST)
  const pHost = process.env.SMTP_HOST;
  const pUser = process.env.SMTP_USER;
  const pPass = process.env.SMTP_PASS;
  if (pHost && pUser && pPass) {
    _providers.push({
      name: "primary:" + pHost,
      from: process.env.SMTP_FROM || pUser,
      transport: nodemailer.createTransport({
        host: pHost,
        port: Number(process.env.SMTP_PORT || 465),
        secure: String(process.env.SMTP_SECURE || "true") === "true",
        auth: { user: pUser, pass: pPass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 10000,
      }),
    });
  }

  // Fallback Gmail
  const gHost = process.env.SMTP_GMAIL_HOST;
  const gUser = process.env.SMTP_GMAIL_USER;
  const gPass = process.env.SMTP_GMAIL_PASS;
  if (gHost && gUser && gPass) {
    _providers.push({
      name: "fallback:gmail",
      from: process.env.SMTP_GMAIL_FROM || gUser,
      transport: nodemailer.createTransport({
        host: gHost,
        port: Number(process.env.SMTP_GMAIL_PORT || 465),
        secure: String(process.env.SMTP_GMAIL_SECURE || "true") === "true",
        auth: { user: gUser, pass: gPass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 10000,
      }),
    });
  }

  if (_providers.length === 0) {
    console.warn("[email] No SMTP provider configured — emails will be logged only");
  }
  return _providers;
}

export async function sendEmail(opts: { to: string; subject: string; html: string; text?: string }) {
  const providers = buildProviders();
  if (providers.length === 0) {
    console.log("[email:log-only]", JSON.stringify({ to: opts.to, subject: opts.subject }));
    return { ok: true, simulated: true };
  }
  let lastErr: any = null;
  for (const p of providers) {
    try {
      const info = await p.transport.sendMail({
        from: p.from, to: opts.to, subject: opts.subject, text: opts.text, html: opts.html,
      });
      console.log("[email:sent]", p.name, info.messageId);
      return { ok: true, provider: p.name, messageId: info.messageId };
    } catch (e: any) {
      lastErr = e;
      console.warn("[email:failover]", p.name, e?.message || e);
    }
  }
  console.error("[email:all-failed]", lastErr?.message || lastErr);
  console.log("[email:log-only]", JSON.stringify({ to: opts.to, subject: opts.subject }));
  return { ok: false, error: lastErr?.message || "smtp all failed" };
}

export function renderMarketplaceDeliveryEmail(opts: {
  customerName?: string; orderId: string;
  items: Array<{ slug: string; title: string; priceCents: number; htmlUrl?: string; pdfUrl?: string }>;
  totalCents: number;
}) {
  const fmt = (c: number) => `R$ ${(c/100).toFixed(2).replace(".", ",")}`;
  const rows = opts.items.map(i => `
    <tr>
      <td style="padding:8px 6px;border-bottom:1px solid #eee;">${i.title}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #eee;text-align:right;">${fmt(i.priceCents)}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #eee;">
        ${i.pdfUrl ? `<a href="${i.pdfUrl}">PDF</a> ` : ""}
        ${i.htmlUrl ? `<a href="${i.htmlUrl}">Online</a>` : ""}
      </td>
    </tr>`).join("");
  const html = `
  <div style="font-family:Inter,Arial,sans-serif;background:#0b1020;padding:24px;color:#e6eefc;">
    <div style="max-width:560px;margin:0 auto;background:#111733;border-radius:16px;padding:24px;">
      <h2 style="margin:0 0 8px;color:#22d3ee;">Marketplace Nexus · Entrega</h2>
      <p>Olá ${opts.customerName || "afiliado"},</p>
      <p>Sua compra foi confirmada. Abaixo estão os e-books entregues:</p>
      <table style="width:100%;border-collapse:collapse;background:#0d1430;border-radius:10px;overflow:hidden;">
        <thead><tr style="background:#172056;">
          <th style="text-align:left;padding:8px 6px;">Item</th>
          <th style="text-align:right;padding:8px 6px;">Valor</th>
          <th style="text-align:left;padding:8px 6px;">Acesso</th>
        </tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td colspan="3" style="text-align:right;padding:10px 8px;font-weight:bold;color:#22d3ee;">Total ${fmt(opts.totalCents)}</td></tr></tfoot>
      </table>
      <p style="margin-top:16px;">Pedido: <code>${opts.orderId}</code></p>
      <p style="font-size:12px;color:#94a3b8;">Acesse sua biblioteca em https://oneverso.com.br/dashboard</p>
    </div>
  </div>`;
  return { subject: `Marketplace Nexus · Entrega ${opts.orderId}`, html };
}

export function renderPackTicketCreatedEmailAdmin(opts: {
  ticketId: number; userName: string; userId: number; userEmail: string;
  packSlug: string; packName: string; amountCents: number;
}) {
  const fmt = (c: number) => `R$ ${(c/100).toFixed(2).replace(".", ",")}`;
  const html = `
  <div style="font-family:Inter,Arial,sans-serif;background:#0b1020;padding:24px;color:#e6eefc;">
    <div style="max-width:560px;margin:0 auto;background:#111733;border-radius:16px;padding:24px;">
      <h2 style="margin:0 0 8px;color:#f59e0b;">Novo Ticket de Pack · Aguardando Aprovação</h2>
      <p><strong>Ticket #${opts.ticketId}</strong></p>
      <ul>
        <li>Usuário: ${opts.userName} (ID ${opts.userId})</li>
        <li>Email: ${opts.userEmail}</li>
        <li>Pack: ${opts.packName} (${opts.packSlug})</li>
        <li>Valor: ${fmt(opts.amountCents)}</li>
      </ul>
      <p>Acesse <a href="https://oneverso.com.br/admin/pack-tickets" style="color:#22d3ee;">Painel Admin · Pack Tickets</a> para confirmar pagamento e ativar.</p>
    </div>
  </div>`;
  return { subject: `[ADMIN] Pack ${opts.packName} · Ticket #${opts.ticketId}`, html };
}

export function renderPackApprovedEmail(opts: {
  userName: string; packName: string; packSlug: string;
}) {
  const html = `
  <div style="font-family:Inter,Arial,sans-serif;background:#0b1020;padding:24px;color:#e6eefc;">
    <div style="max-width:560px;margin:0 auto;background:#111733;border-radius:16px;padding:24px;">
      <h2 style="margin:0 0 8px;color:#22c55e;">Pack ativado ✓</h2>
      <p>Olá ${opts.userName},</p>
      <p>Seu Pack <strong>${opts.packName}</strong> foi confirmado e ativado em sua conta.</p>
      <p>Acesse <a href="https://oneverso.com.br/dashboard" style="color:#22d3ee;">seu Painel</a> para começar.</p>
    </div>
  </div>`;
  return { subject: `Pack ${opts.packName} ativado`, html };
}

export function renderPackRejectedEmail(opts: {
  userName: string; packName: string; reason?: string;
}) {
  const html = `
  <div style="font-family:Inter,Arial,sans-serif;background:#0b1020;padding:24px;color:#e6eefc;">
    <div style="max-width:560px;margin:0 auto;background:#111733;border-radius:16px;padding:24px;">
      <h2 style="margin:0 0 8px;color:#ef4444;">Solicitação de Pack não confirmada</h2>
      <p>Olá ${opts.userName},</p>
      <p>Sua solicitação do Pack <strong>${opts.packName}</strong> não foi confirmada pelo administrador.</p>
      ${opts.reason ? `<p>Motivo: ${opts.reason}</p>` : ""}
      <p>Caso o pagamento já tenha sido feito, responda este e-mail com o comprovante.</p>
    </div>
  </div>`;
  return { subject: `Pack ${opts.packName} · não confirmado`, html };
}


export function renderPaymentConfirmedEmail(opts: {
  customerName?: string; orderId: string; amountCents: number;
  paymentMethod: string;
  items?: Array<{ slug: string; title: string; priceCents: number; htmlUrl?: string; pdfUrl?: string }>;
}) {
  const fmt = (c: number) => `R$ ${(c/100).toFixed(2).replace(".", ",")}`;
  const rows = (opts.items || []).map(i => `
    <tr>
      <td style="padding:8px 6px;border-bottom:1px solid #1f2a4d;">${i.title}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #1f2a4d;text-align:right;">${fmt(i.priceCents)}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #1f2a4d;">
        ${i.pdfUrl ? `<a href="${i.pdfUrl}" style="color:#22d3ee;">PDF</a> ` : ""}
        ${i.htmlUrl ? `<a href="${i.htmlUrl}" style="color:#22d3ee;">Online</a>` : ""}
      </td>
    </tr>`).join("");
  const itemsBlock = (opts.items && opts.items.length > 0) ? `
      <h3 style="margin:18px 0 6px;color:#cbd5e1;font-size:14px;">Itens do pedido</h3>
      <table style="width:100%;border-collapse:collapse;background:#0d1430;border-radius:10px;overflow:hidden;">
        <thead><tr style="background:#172056;">
          <th style="text-align:left;padding:8px 6px;color:#cbd5e1;">Item</th>
          <th style="text-align:right;padding:8px 6px;color:#cbd5e1;">Valor</th>
          <th style="text-align:left;padding:8px 6px;color:#cbd5e1;">Acesso</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>` : "";
  const html = `
  <div style="font-family:Inter,Arial,sans-serif;background:#0b1020;padding:24px;color:#e6eefc;">
    <div style="max-width:560px;margin:0 auto;background:#111733;border-radius:16px;padding:24px;border:1px solid #1f2a4d;">
      <div style="display:inline-block;background:#10b98115;border:1px solid #10b981;color:#34d399;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">
        ✓ Pagamento Confirmado
      </div>
      <h2 style="margin:14px 0 6px;color:#22d3ee;font-size:20px;">Olá ${opts.customerName || "afiliado"}!</h2>
      <p style="color:#cbd5e1;line-height:1.55;">Recebemos a confirmação do seu pagamento via <strong>${opts.paymentMethod}</strong>.
        Seu pedido foi processado e está disponível em sua conta.</p>
      <div style="background:#0d1430;border-radius:10px;padding:14px;margin:12px 0;border:1px solid #1f2a4d;">
        <p style="margin:0;color:#94a3b8;font-size:12px;">Pedido</p>
        <p style="margin:4px 0 10px;font-family:monospace;color:#22d3ee;font-size:13px;">${opts.orderId}</p>
        <p style="margin:0;color:#94a3b8;font-size:12px;">Valor pago</p>
        <p style="margin:4px 0 0;color:#fff;font-size:22px;font-weight:bold;">${fmt(opts.amountCents)}</p>
      </div>
      ${itemsBlock}
      <p style="margin:18px 0 0;">
        <a href="https://oneverso.com.br/dashboard" style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#8b5cf6);color:#fff;text-decoration:none;padding:11px 22px;border-radius:8px;font-weight:600;">Acessar meu painel</a>
      </p>
      <p style="margin-top:18px;font-size:12px;color:#64748b;">Marketplace Nexus · Nexus Affil'IA'te · Plataforma SaaS</p>
    </div>
  </div>`;
  return { subject: `✓ Pagamento Confirmado · Pedido ${opts.orderId}`, html };
}
