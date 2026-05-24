import { Link } from "wouter";
import { trpc } from "../lib/trpc";

export default function Dashboard() {
  const health = trpc.system.health.useQuery();
  const systemInfo = trpc.system.info.useQuery();
  const currentUser = trpc.auth.me.useQuery();

  return (
    <main className="page-shell">
      <div className="topbar">
        <div>
          <span className="pill">Backoffice</span>
          <h1>Dashboard operacional</h1>
          <p className="lead compact">
            Vista do backoffice com foco em saúde do sistema e módulos de operação.
          </p>
        </div>
        <div className="cta-row compact-actions">
          <Link href="/" className="btn btn-secondary">
            Início
          </Link>
          <Link href="/orchestrator" className="btn btn-primary">
            Agent Monitor
          </Link>
        </div>
      </div>

      <section className="grid stats-grid">
        <article className="panel stat-panel">
          <h2>Healthcheck</h2>
          {health.isLoading ? <p>Consultando system.health...</p> : null}
          {health.error ? <p className="error">{health.error.message}</p> : null}
          {health.data ? (
            <>
              <p className="stat-value">{health.data.ok ? "Online" : "Indisponível"}</p>
              <p className="stat-meta">{health.data.service}</p>
              <p className="stat-caption">Modo: {health.data.mode}</p>
            </>
          ) : null}
        </article>

        <article className="panel stat-panel">
          <h2>Runtime</h2>
          {systemInfo.data ? (
            <>
              <p className="stat-value">{systemInfo.data.runtime}</p>
              <p className="stat-meta">Banco: {systemInfo.data.database}</p>
              <p className="stat-caption">Redis: {systemInfo.data.redis}</p>
            </>
          ) : systemInfo.error ? (
            <p className="error">{systemInfo.error.message}</p>
          ) : (
            <p>Consultando system.info...</p>
          )}
        </article>

        <article className="panel stat-panel">
          <h2>Usuário autenticado</h2>
          {currentUser.isLoading ? <p>Consultando auth.me...</p> : null}
          {currentUser.error ? <p className="error">{currentUser.error.message}</p> : null}
          {currentUser.data ? (
            <>
              <p className="stat-value">{String(currentUser.data.id)}</p>
              <p className="stat-meta">Role: {currentUser.data.role}</p>
              <p className="stat-caption">Contexto carregado com tRPC</p>
            </>
          ) : (
            !currentUser.isLoading && <p className="stat-caption">Nenhum usuário autenticado.</p>
          )}
        </article>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Módulos operacionais</h2>
          <div className="quick-actions">
            <Link href="/agents" className="btn btn-secondary">Agentes IA</Link>
            <Link href="/content-hub" className="btn btn-secondary">Content Hub</Link>
            <Link href="/commissions" className="btn btn-secondary">Comissões</Link>
            <Link href="/marketplaces" className="btn btn-secondary">Marketplaces</Link>
            <Link href="/packs" className="btn btn-secondary">Pacotes</Link>
            <Link href="/logs" className="btn btn-secondary">Logs</Link>
          </div>
        </article>

        <article className="panel">
          <h2>Prioridades de evolução</h2>
          <ul className="feature-list">
            <li>Expor módulos de rede, pagamentos e materiais com navegação previsível.</li>
            <li>Usar o agentic layer para monitorar campanhas e qualidade de execução.</li>
            <li>Separar claramente a experiência do associado e do administrador.</li>
            <li>Adicionar observabilidade operacional em tempo real.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
