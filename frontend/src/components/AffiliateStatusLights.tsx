import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Bot, Calendar, ShoppingCart, AlertTriangle } from "lucide-react";

/**
 * AffiliateStatusLights (Onda 17)
 * ---------------------------------------------------------------------------
 * Dois "semáforos" visuais para o afiliado saber, em tempo real,
 * se o Agente IA e a Ativação Mensal estão em dia.
 *
 * Regras:
 *  - Agente Ativo (verde) só quando o afiliado adquiriu um Pack (Nexus Partners Pack).
 *    Enquanto não houver pack ativado, o dot é vermelho + CTA "Adquirir Pack".
 *  - Ativação Mensal (verde) só quando existe um pack_activation quitado no ciclo corrente.
 *    Caso contrário, dot vermelho + CTA "Renovar Ativação".
 *
 * Dados: `dashboardStatus.getStatus` (protected) — já retorna:
 *  { agentActive, monthlyActivationPaid, cycleLabel, affiliateLevel, ... }
 *
 * Este componente é *tolerante a falha*: se o endpoint estiver indisponível,
 * exibe o modo "carregando" e nunca quebra o Dashboard.
 */

type StatusRowProps = {
  icon: React.ReactNode;
  label: string;
  status: "active" | "inactive" | "loading";
  hint: string;
  cta?: { href: string; label: string };
};

function StatusDot({ status }: { status: StatusRowProps["status"] }) {
  const cls =
    status === "active"
      ? "bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.65)]"
      : status === "inactive"
      ? "bg-rose-500 shadow-[0_0_12px_2px_rgba(244,63,94,0.65)] animate-pulse"
      : "bg-slate-500 animate-pulse";
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-3 w-3 rounded-full ${cls}`}
    />
  );
}

function StatusRow({ icon, label, status, hint, cta }: StatusRowProps) {
  const textStatus =
    status === "active"
      ? "ATIVO"
      : status === "inactive"
      ? "INATIVO"
      : "VERIFICANDO...";
  const textColor =
    status === "active"
      ? "text-emerald-300"
      : status === "inactive"
      ? "text-rose-300"
      : "text-slate-400";

  return (
    <div className="flex items-center justify-between gap-4 rounded border border-obsidian-700 bg-obsidian-900/40 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="text-slate-400">{icon}</div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            {label}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <StatusDot status={status} />
            <span className={`font-mono text-xs font-bold tracking-wider ${textColor}`}>
              {textStatus}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
        </div>
      </div>
      {status === "inactive" && cta && (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-1 rounded border border-rose-400/50 bg-rose-400/10 px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-rose-200 transition hover:bg-rose-400/20"
        >
          <ShoppingCart size={12} />
          {cta.label}
        </Link>
      )}
    </div>
  );
}

export default function AffiliateStatusLights() {
  const q = (trpc as any).dashboardStatus?.getStatus?.useQuery?.(undefined, {
    refetchInterval: 60_000,
    retry: false,
  });

  const isLoading = !!q?.isLoading;
  const data = q?.data;

  const agentActive: boolean = !!data?.agentActive;
  const monthlyPaid: boolean = !!data?.monthlyActivationPaid;
  const cycleLabel: string = data?.cycleLabel || "";

  const agentStatus: StatusRowProps["status"] = isLoading
    ? "loading"
    : agentActive
    ? "active"
    : "inactive";
  const monthlyStatus: StatusRowProps["status"] = isLoading
    ? "loading"
    : monthlyPaid
    ? "active"
    : "inactive";

  const bothInactive = !isLoading && !agentActive && !monthlyPaid;

  return (
    <section
      aria-label="Status do afiliado"
      className="mt-4 space-y-3 rounded-lg border border-obsidian-700 bg-obsidian-900/30 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-quantum-cyan">
          // NEXUS_STATUS · SINAIS_OPERACIONAIS
        </p>
        {cycleLabel && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Ciclo {cycleLabel}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <StatusRow
          icon={<Bot size={18} />}
          label="Agente IA"
          status={agentStatus}
          hint={
            agentActive
              ? "Seu agente está operando e evoluindo em tempo real."
              : "O Agente é ativado após a aquisição do Pack no Marketplace Nexus."
          }
          cta={{ href: "/marketplaces?focus=pack-a2", label: "Adquirir Pack" }}
        />
        <StatusRow
          icon={<Calendar size={18} />}
          label="Ativação Mensal"
          status={monthlyStatus}
          hint={
            monthlyPaid
              ? "Assinatura mensal em dia. Bônus liberados."
              : "Renove sua ativação mensal para manter comissões e bônus."
          }
          cta={{ href: "/marketplaces?focus=pack-a2", label: "Renovar Ativação" }}
        />
      </div>

      {bothInactive && (
        <div className="mt-2 flex items-start gap-3 rounded border border-amber-400/40 bg-amber-400/5 px-4 py-3 text-[12px] text-amber-100">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-amber-300">
              // AÇÃO NECESSÁRIA
            </p>
            <p className="mt-1">
              Para ativar seu <strong>Agente Nexus</strong> e começar a ganhar
              comissões, adquira seu <strong>Pack A²</strong> (Pack Agente Afiliado)
              no Marketplace Nexus por apenas R$ 10. Sem o Pack A², o Agente
              permanece desligado.
            </p>
            <Link
              href="/marketplaces?focus=pack-a2"
              className="mt-2 inline-flex items-center gap-1 rounded bg-amber-400 px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-obsidian transition hover:bg-amber-300"
            >
              <ShoppingCart size={12} />
              Adquirir Pack A² (R$ 10)
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
