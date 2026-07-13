import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

type Cmd = { label: string; href: string; group: string; keywords?: string };

const COMMANDS: Cmd[] = [
  { label: "Dashboard", href: "/dashboard", group: "Painel", keywords: "home início" },
  { label: "Marketplace Nexus", href: "/marketplaces", group: "Loja", keywords: "ebooks pack a2 vitrine" },
  { label: "Minha Loja", href: "/minha-loja", group: "Loja", keywords: "loja virtual estoque" },
  { label: "Meu Estoque", href: "/estoque", group: "Loja" },
  { label: "Upgrades", href: "/upgrades", group: "Carreira", keywords: "packs avançar" },
  { label: "Packs Nexus", href: "/packs", group: "Carreira" },
  { label: "Skills Nexus", href: "/skills", group: "Agente IA" },
  { label: "Painel do Agente", href: "/agents", group: "Agente IA", keywords: "ia agente" },
  { label: "Orquestrador", href: "/orchestrator", group: "Agente IA" },
  { label: "Nexus Academ'IA", href: "/academia", group: "Conhecimento", keywords: "cursos webinars playbooks" },
  { label: "Lab Nexus · Chatbot", href: "/academia/lab-nexus", group: "Conhecimento" },
  { label: "Carreira / XP", href: "/career", group: "Carreira" },
  { label: "Comissões", href: "/commissions", group: "Financeiro" },
  { label: "Pagamentos", href: "/payments", group: "Financeiro" },
  { label: "Checkout PIX", href: "/pix/checkout", group: "Financeiro" },
  { label: "Ativar Pack A² · início do afiliado", href: "/pix/checkout?pack=pack-a2", group: "Carreira", keywords: "pack a2 ativação agente onboarding início afiliado" },
  { label: "Histórico PIX", href: "/pix/history", group: "Financeiro" },
  { label: "Rede Binária N.O", href: "/network", group: "Rede" },
  { label: "Sub-Redes (SiSu)", href: "/sisu", group: "Rede" },
  { label: "Hub de Conteúdo", href: "/content-hub", group: "Marketing" },
  { label: "Calendário Social", href: "/content/calendar", group: "Marketing" },
  { label: "Contas Sociais", href: "/social/accounts", group: "Marketing" },
  { label: "Rastreamento de Links", href: "/tracking/links", group: "Marketing" },
  { label: "Configurações de Conta", href: "/profile", group: "Conta" },
  { label: "Nexus Partners Pack · SaaS independente", href: "/subscriptions", group: "Conta", keywords: "partners assinatura start growth enterprise saas complementar" },
  { label: "Conheça a SaaS/PaaS Nexus Partners Pack", href: "/npp", group: "Conta", keywords: "npp landing page saas paas diferenciais pack a2 comparativo pessoa física cnpj afiliado" },
  { label: "Painel Partners · assinantes", href: "/partners", group: "Conta", keywords: "partners dashboard parceiros tiers api chatbot" },
  { label: "Runtime NPP · OpenAPI", href: "/partners", group: "Conta", keywords: "runtime openapi console rollout staging produção secrets gateway" },
];

export default function CommandPalette() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return COMMANDS;
    return COMMANDS.filter((c) =>
      `${c.label} ${c.group} ${c.keywords ?? ""}`.toLowerCase().includes(s),
    );
  }, [q]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-24">
      <div className="absolute inset-0 bg-black/70 backdrop-blur" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busque por uma página, comando ou seção..."
          className="w-full bg-transparent px-4 py-4 text-base text-white outline-none placeholder:text-slate-500"
        />
        <div className="max-h-[420px] overflow-y-auto border-t border-white/10">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">Nada encontrado.</div>
          ) : (
            Object.entries(
              items.reduce<Record<string, Cmd[]>>((acc, it) => {
                (acc[it.group] = acc[it.group] || []).push(it);
                return acc;
              }, {}),
            ).map(([group, list]) => (
              <div key={group} className="px-2 py-2">
                <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {group}
                </p>
                {list.map((cmd) => (
                  <button
                    key={cmd.href}
                    onClick={() => {
                      setOpen(false);
                      setQ("");
                      navigate(cmd.href);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/5"
                  >
                    <span>{cmd.label}</span>
                    <span className="text-[11px] text-slate-500">{cmd.href}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[11px] text-slate-500">
          <span>Pressione <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5">Esc</kbd> para fechar</span>
          <span><kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5">⌘ K</kbd> a qualquer momento</span>
        </div>
      </div>
    </div>
  );
}
