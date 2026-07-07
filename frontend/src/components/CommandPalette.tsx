// D12 COMMAND_PALETTE — busca global (Ctrl/Cmd + K)
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

interface CmdItem {
  id: string;
  title: string;
  hint?: string;
  icon: string;
  href: string;
  keywords?: string;
}

const COMMANDS: CmdItem[] = [
  { id: "dash", title: "Dashboard", hint: "Painel principal do Afiliado", icon: "📊", href: "/dashboard", keywords: "home painel inicio" },
  { id: "mkt", title: "Marketplace Nexus", hint: "Comprar ebooks, packs e ativação", icon: "🛒", href: "/marketplaces", keywords: "loja comprar packs ebooks pix" },
  { id: "estq", title: "Meu Estoque", hint: "Itens comprados e biblioteca", icon: "📦", href: "/estoque", keywords: "library biblioteca produtos meus" },
  { id: "loja", title: "Minha Loja", hint: "Vitrine afiliada pública", icon: "🏪", href: "/minha-loja", keywords: "vitrine loja showroom" },
  { id: "ativ", title: "Ativação Mensal", hint: "Gerar Pix da assinatura", icon: "⚡", href: "/marketplaces?focus=monthly-activation", keywords: "ativacao pagar pix mensal" },
  { id: "acad", title: "AcademIA", hint: "Cursos, vídeos e apostilas", icon: "🎓", href: "/academia/ead/curso", keywords: "ensino aula universidade" },
  { id: "agnt", title: "Agente IA", hint: "Skills, sincronização e orquestração", icon: "🤖", href: "/dashboard", keywords: "agente skills ia bot" },
  { id: "cmsr", title: "Comissões", hint: "Histórico de comissões pagas", icon: "💰", href: "/dashboard", keywords: "comissoes ganhos rendimentos" },
  { id: "pix", title: "Pix · Checkout", hint: "Checkout integrado Mercado Pago", icon: "💳", href: "/pix/checkout", keywords: "pagamento mercado pago" },
  { id: "hist", title: "Pix · Histórico", hint: "Histórico de pagamentos Pix", icon: "📜", href: "/pix/history", keywords: "historico pagamento pix" },
  { id: "perfil", title: "Perfil & Configurações", hint: "Conta, segurança e preferências", icon: "⚙️", href: "/profile", keywords: "config perfil settings ajustes" },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((v) => !v);
        setQ("");
        setCursor(0);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return COMMANDS;
    return COMMANDS.filter((c) => {
      const hay = (c.title + " " + (c.hint || "") + " " + (c.keywords || "")).toLowerCase();
      return hay.includes(term);
    });
  }, [q]);

  useEffect(() => { setCursor(0); }, [q]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Abrir busca global (Ctrl/Cmd + K)"
        className="ux-focus fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-quantum-cyan/35 bg-obsidian-900/85 px-4 py-2 text-[12px] font-medium text-slate-200 shadow-lg backdrop-blur transition hover:border-quantum-cyan/70 hover:text-white"
      >
        <span aria-hidden>🔎</span>
        Buscar
        <kbd className="ml-1 rounded border border-white/15 bg-black/40 px-1.5 py-0.5 text-[10px] text-slate-300">⌘K</kbd>
      </button>
    );
  }

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    // Suporte para query string e mesma página com hash
    if (href.startsWith("/")) {
      const [path, query] = href.split("?");
      setLocation(path + (query ? "?" + query : ""));
      // wouter não preserva ?: forçar window se necessário
      if (query || href.includes("#")) {
        window.location.href = href;
      }
    } else {
      window.location.href = href;
    }
  };

  const onKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const it = filtered[cursor]; if (it) go(it.href); }
  };

  return (
    <>
      <div className="ux-cmd-backdrop" onClick={() => setOpen(false)} />
      <div className="ux-cmd-panel ux-glass-strong">
        <div className="border-b border-white/10 px-4 py-3 flex items-center gap-3">
          <span className="text-quantum-cyan">🔎</span>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyNav}
            placeholder="Pesquisar página, atalho ou ação…"
            className="ux-focus flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 outline-none text-sm"
          />
          <kbd className="rounded border border-white/15 bg-black/40 px-1.5 py-0.5 text-[10px] text-slate-400">ESC</kbd>
        </div>
        <ul className="ux-scroll max-h-[50vh] overflow-y-auto py-2">
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-slate-500">
              Nenhum resultado para "{q}"
            </li>
          )}
          {filtered.map((c, i) => (
            <li key={c.id}>
              <button
                onMouseEnter={() => setCursor(i)}
                onClick={() => go(c.href)}
                className={
                  "w-full text-left px-4 py-2.5 flex items-center gap-3 transition " +
                  (i === cursor ? "bg-white/10" : "hover:bg-white/5")
                }
              >
                <span className="text-xl">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-100">{c.title}</div>
                  {c.hint && (
                    <div className="text-[11px] text-slate-400 truncate">{c.hint}</div>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-widest text-slate-500">
                  abrir ↵
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-white/10 px-4 py-2 flex items-center justify-between text-[10px] text-slate-500">
          <span>↑↓ navegar · ↵ selecionar · ESC fechar</span>
          <span>Ctrl/Cmd + K · OneVerso Hub</span>
        </div>
      </div>
    </>
  );
}
