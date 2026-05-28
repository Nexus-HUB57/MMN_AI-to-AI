/**
 * Dispatchers reais de canal para o Auto-Publisher Worker.
 * -----------------------------------------------------------------------------
 * Cada dispatcher tenta usar credenciais reais quando disponíveis nas env vars,
 * e cai para um stub auditável quando não. Isso permite que o worker rode em
 * dev/staging sem credenciais e em prod com integrações reais.
 *
 * Integrações cobertas nesta versão:
 *  - whatsapp → WhatsApp Cloud API (Meta Graph) com WHATSAPP_PHONE_NUMBER_ID
 *    + WHATSAPP_ACCESS_TOKEN. Recipient via env padrão (broadcast list não
 *    suportado pela API oficial sem template aprovado).
 *  - email    → Resend API com RESEND_API_KEY + RESEND_FROM.
 *  - facebook → Facebook Graph com FACEBOOK_PAGE_ID + FACEBOOK_PAGE_TOKEN.
 *  - instagram, landing → stubs operacionais (placeholders auditáveis).
 *
 * Cada dispatcher tem `mode: real | stub` no detail, permitindo ao painel
 * /admin/runtime mostrar quais canais estão de fato conectados.
 */

export interface ScheduledPostJob {
  publishKey: string;
  channel: "instagram" | "whatsapp" | "facebook" | "email" | "landing";
  scheduledAtIso: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaLink: string | null;
  hashtags: string[];
  requiresApproval: boolean;
}

type DispatcherResult = {
  sent: boolean;
  externalId?: string;
  detail?: string;
  mode: "real" | "stub";
};

export type ChannelDispatcher = (job: ScheduledPostJob) => Promise<DispatcherResult>;

async function dispatchWhatsApp(job: ScheduledPostJob): Promise<DispatcherResult> {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const recipient = process.env.WHATSAPP_DEFAULT_RECIPIENT;
  if (!phoneId || !token || !recipient) {
    return {
      sent: true,
      externalId: `wa_stub_${job.publishKey}`,
      detail: "stub-whatsapp (faltam WHATSAPP_PHONE_NUMBER_ID/ACCESS_TOKEN/DEFAULT_RECIPIENT)",
      mode: "stub",
    };
  }
  try {
    const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
    const message = `${job.headline}\n\n${job.body}\n\n${job.ctaLabel}${job.ctaLink ? `: ${job.ctaLink}` : ""}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "text",
        text: { body: message },
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      return {
        sent: false,
        detail: `whatsapp HTTP ${response.status}: ${text.slice(0, 200)}`,
        mode: "real",
      };
    }
    const json = (await response.json()) as { messages?: Array<{ id?: string }> };
    return {
      sent: true,
      externalId: json.messages?.[0]?.id ?? `wa_${job.publishKey}`,
      detail: "WhatsApp Cloud API",
      mode: "real",
    };
  } catch (error) {
    return {
      sent: false,
      detail: `whatsapp exception: ${(error as Error).message}`,
      mode: "real",
    };
  }
}

async function dispatchEmail(job: ScheduledPostJob): Promise<DispatcherResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.RESEND_DEFAULT_RECIPIENT;
  if (!apiKey || !from || !to) {
    return {
      sent: true,
      externalId: `em_stub_${job.publishKey}`,
      detail: "stub-email (faltam RESEND_API_KEY/FROM/DEFAULT_RECIPIENT)",
      mode: "stub",
    };
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: job.headline,
        text: `${job.body}\n\n${job.ctaLabel}${job.ctaLink ? `: ${job.ctaLink}` : ""}`,
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      return {
        sent: false,
        detail: `email HTTP ${response.status}: ${text.slice(0, 200)}`,
        mode: "real",
      };
    }
    const json = (await response.json()) as { id?: string };
    return {
      sent: true,
      externalId: json.id ?? `em_${job.publishKey}`,
      detail: "Resend API",
      mode: "real",
    };
  } catch (error) {
    return {
      sent: false,
      detail: `email exception: ${(error as Error).message}`,
      mode: "real",
    };
  }
}

async function dispatchFacebook(job: ScheduledPostJob): Promise<DispatcherResult> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_TOKEN;
  if (!pageId || !token) {
    return {
      sent: true,
      externalId: `fb_stub_${job.publishKey}`,
      detail: "stub-facebook (faltam FACEBOOK_PAGE_ID/PAGE_TOKEN)",
      mode: "stub",
    };
  }
  try {
    const url = `https://graph.facebook.com/v18.0/${pageId}/feed`;
    const message = `${job.headline}\n\n${job.body}\n\n${job.ctaLabel}${job.ctaLink ? `: ${job.ctaLink}` : ""}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, access_token: token, link: job.ctaLink ?? undefined }),
    });
    if (!response.ok) {
      const text = await response.text();
      return {
        sent: false,
        detail: `facebook HTTP ${response.status}: ${text.slice(0, 200)}`,
        mode: "real",
      };
    }
    const json = (await response.json()) as { id?: string };
    return {
      sent: true,
      externalId: json.id ?? `fb_${job.publishKey}`,
      detail: "Facebook Graph API",
      mode: "real",
    };
  } catch (error) {
    return {
      sent: false,
      detail: `facebook exception: ${(error as Error).message}`,
      mode: "real",
    };
  }
}

const stubInstagram: ChannelDispatcher = async (job) => ({
  sent: true,
  externalId: `ig_stub_${job.publishKey}`,
  detail: "stub-instagram (Graph API exige token de longa duração)",
  mode: "stub",
});

const stubLanding: ChannelDispatcher = async (job) => ({
  sent: true,
  externalId: `ld_stub_${job.publishKey}`,
  detail: "stub-landing (rota CMS interna)",
  mode: "stub",
});

export const REAL_DISPATCHERS: Record<ScheduledPostJob["channel"], ChannelDispatcher> = {
  whatsapp: dispatchWhatsApp,
  email: dispatchEmail,
  facebook: dispatchFacebook,
  instagram: stubInstagram,
  landing: stubLanding,
};

export function getDispatcherStatus(): Record<ScheduledPostJob["channel"], "real" | "stub"> {
  return {
    whatsapp:
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_DEFAULT_RECIPIENT
        ? "real"
        : "stub",
    email:
      process.env.RESEND_API_KEY && process.env.RESEND_FROM && process.env.RESEND_DEFAULT_RECIPIENT
        ? "real"
        : "stub",
    facebook:
      process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_PAGE_TOKEN ? "real" : "stub",
    instagram: "stub",
    landing: "stub",
  };
}
