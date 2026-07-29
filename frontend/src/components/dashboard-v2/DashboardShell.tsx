import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  BarChart3,
  BookOpen,
  Bot,
  Calendar,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleUser,
  Command,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Network,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: typeof Home;
  badge?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Operação",
    items: [
      { label: "Visão Geral", href: "/dashboard-v2", icon: Home },
      { label: "Rede", href: "/network", icon: Network },
      { label: "Comissões", href: "/commissions", icon: TrendingUp },
      { label: "Carreira", href: "/career", icon: Sparkles },
    ],
  },
  {
    label: "Agentes & Skills",
    items: [
      { label: "Agentes", href: "/agents", icon: Bot },
      { label: "Skills", href: "/skills", icon: Zap },
      { label: "Orquestrador", href: "/orchestrator", icon: BarChart3 },
    ],
  },
  {
    label: "Marketplace",
    items: [
      { label: "Marketplaces", href: "/marketplaces", icon: ShoppingCart },
      { label: "E-books", href: "/marketplaces/ebooks", icon: BookOpen },
      { label: "Packs", href: "/packs", icon: Package },
      { label: "Estoque", href: "/estoque", icon: Package },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { label: "Pagamentos", href: "/payments", icon: Wallet },
      { label: "Checkout Pix", href: "/pix/checkout", icon: CreditCard },
      { label: "Histórico Pix", href: "/pix/history", icon: Calendar },
    ],
  },
  {
    label: "AcademIA",
    items: [
      { label: "Trilhas", href: "/academia", icon: BookOpen, badge: "novo" },
      { label: "Parceiros", href: "/partners", icon: Users },
    ],
  },
];

const STORAGE_KEY_COLLAPSED = "nexus.dashv2.sidebar.collapsed";
const STORAGE_KEY_OPEN_GROUPS = "nexus.dashv2.sidebar.groups";

function persistBool(key: string, value: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function readBool(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as boolean;
  } catch {
    return fallback;
  }
}

function readGroups(fallback: string[]) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_OPEN_GROUPS);
    if (!raw) return fallback;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as string[]) : fallback;
  } catch {
    return fallback;
  }
}

export type DashboardShellProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  children: ReactNode;
};

export default function DashboardShell({
  title,
  subtitle,
  actions,
  breadcrumbs,
  children,
}: DashboardShellProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(() => readBool(STORAGE_KEY_COLLAPSED, false));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(() =>
    readGroups(NAV_GROUPS.map((g) => g.label))
  );
  const [commandOpen, setCommandOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => persistBool(STORAGE_KEY_COLLAPSED, collapsed), [collapsed]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY_OPEN_GROUPS, JSON.stringify(openGroups));
    }
  }, [openGroups]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isCmdK) {
        event.preventDefault();
        setCommandOpen((prev) => !prev);
      }
      if (event.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const flatNav = useMemo(() => NAV_GROUPS.flatMap((g) => g.items), []);
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flatNav.slice(0, 8);
    return flatNav.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 8);
  }, [flatNav, query]);

  const isActive = (href: string) => location === href || location.startsWith(href + "/");
  const userName = user?.name || "Afiliado";
  const userEmail = user?.email || "";
  const userInitial = (userName || "N")[0]?.toUpperCase() ?? "N";

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );

  const renderNav = (compact: boolean) => (
    <nav className="flex flex-col gap-1 px-2">
      {NAV_GROUPS.map((group) => {
        const isOpen = openGroups.includes(group.label);
        return (
          <div key={group.label} className="mt-3 first:mt-0">
            {!compact && (
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 hover:text-slate-300 transition"
              >
                <span>{group.label}</span>
                <ChevronRight
                  className={cn(
                    "h-3 w-3 transition-transform",
                    isOpen ? "rotate-90" : "rotate-0"
                  )}
                />
              </button>
            )}
            {(compact || isOpen) &&
              group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                      active
                        ? "bg-cyan-500/10 text-cyan-100 shadow-[inset_2px_0_0_0_rgba(34,211,238,0.9)]"
                        : "text-slate-300/85 hover:bg-white/5 hover:text-white"
                    )}
                    title={compact ? item.label : undefined}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active ? "text-cyan-300" : "text-slate-400 group-hover:text-slate-200"
                      )}
                    />
                    {!compact && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-cyan-200">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.06),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.05),transparent_50%)] bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      {/* Sidebar desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-white/5 bg-slate-950/80 backdrop-blur-md transition-[width] duration-200 md:flex md:flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-3">
          <Link href="/dashboard-v2" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400/25 to-sky-500/20 ring-1 ring-cyan-400/40">
              <Sparkles className="h-4 w-4 text-cyan-200" />
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-cyan-300">Nexus</p>
                <p className="text-sm font-semibold text-white">Affil’IA’te</p>
              </div>
            )}
          </Link>
          <button
            type="button"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            onClick={() => setCollapsed((prev) => !prev)}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3">{renderNav(collapsed)}</div>

        <div className="border-t border-white/5 p-3">
          {!collapsed ? (
            <div className="rounded-xl border border-white/5 bg-white/5 p-3">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-slate-950">
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{userName}</p>
                  <p className="truncate text-[11px] text-slate-400">{userEmail}</p>
                </div>
                <button
                  type="button"
                  aria-label="Sair"
                  onClick={() => logout()}
                  className="rounded-md p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => logout()}
              className="mx-auto grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-white/10 bg-slate-950 shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-white/5 px-3">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400/25 to-sky-500/20 ring-1 ring-cyan-400/40">
                  <Sparkles className="h-4 w-4 text-cyan-200" />
                </div>
                <p className="text-sm font-semibold text-white">Nexus Affil’IA’te</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3">{renderNav(false)}</div>
          </aside>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className={cn("transition-[margin]", collapsed ? "md:ml-16" : "md:ml-64")}>
        <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/85 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-4 md:px-6">
            <button
              type="button"
              className="rounded-md p-2 text-slate-300 hover:bg-white/5 hover:text-white md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-left text-sm text-slate-400 transition hover:border-cyan-400/40 hover:text-slate-200 md:flex"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 truncate">Buscar módulo, agente, comissão…</span>
              <span className="ml-2 rounded-md border border-white/10 bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                Ctrl K
              </span>
            </button>

            <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
              {actions}
              <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 md:flex">
                <CircleUser className="h-4 w-4 text-slate-300" />
                <span className="text-sm text-slate-200">{userName}</span>
              </div>
              <button
                type="button"
                onClick={() => setLocation("/settings")}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
                aria-label="Configurações"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
          {(breadcrumbs?.length || title) && (
            <div className="mx-auto max-w-[1500px] px-4 pb-4 md:px-6">
              {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="mb-2 flex flex-wrap items-center gap-1 text-xs text-slate-400">
                  {breadcrumbs.map((crumb, idx) => (
                    <span key={`${crumb.label}-${idx}`} className="flex items-center gap-1">
                      {crumb.href ? (
                        <Link href={crumb.href} className="hover:text-cyan-300">
                          {crumb.label}
                        </Link>
                      ) : (
                        <span>{crumb.label}</span>
                      )}
                      {idx < breadcrumbs.length - 1 && (
                        <ChevronRight className="h-3 w-3 text-slate-600" />
                      )}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h1 className="text-xl font-semibold text-white md:text-2xl">{title}</h1>
                  {subtitle && (
                    <p className="mt-1 max-w-2xl text-sm text-slate-400">{subtitle}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>

      {/* Command palette */}
      {commandOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-950/70 px-4 pt-24 backdrop-blur">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
              <Command className="h-4 w-4 text-cyan-300" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar rota, módulo, ação…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCommandOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-white/5 hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredResults.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-slate-500">
                  Nenhum resultado para “{query}”.
                </p>
              ) : (
                filteredResults.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => {
                        setCommandOpen(false);
                        setQuery("");
                        setLocation(item.href);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5"
                    >
                      <Icon className="h-4 w-4 text-cyan-300" />
                      <span className="flex-1">{item.label}</span>
                      <span className="text-[11px] text-slate-500">{item.href}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
