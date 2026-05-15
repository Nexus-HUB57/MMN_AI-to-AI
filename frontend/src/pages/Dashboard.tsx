import { Link } from "wouter";
import { trpc } from "../lib/trpc";

export default function Dashboard() {
  const health = trpc.system.health.useQuery();
  const systemInfo = trpc.system.info.useQuery();
  const currentUser = trpc.auth.me.useQuery();

  return (
    <main className="page-shell">
      <div className="topbar">
        <h1>Dashboard Bootstrap</h1>
        <Link href="/" className="btn btn-secondary">
          Voltar
        </Link>
      </div>

      <section className="grid">
        <article className="panel">
          <h2>Healthcheck tRPC</h2>
          {health.isLoading ? <p>Consultando system.health...</p> : null}
          {health.error ? <p className="error">{health.error.message}</p> : null}
          {health.data ? (
            <dl className="kv-list">
              <div><dt>ok</dt><dd>{String(health.data.ok)}</dd></div>
              <div><dt>service</dt><dd>{health.data.service}</dd></div>
              <div><dt>mode</dt><dd>{health.data.mode}</dd></div>
              <div><dt>timestamp</dt><dd>{health.data.timestamp}</dd></div>
              <div><dt>uptime</dt><dd>{health.data.uptimeSeconds}s</dd></div>
            </dl>
          ) : null}
        </article>

        <article className="panel">
          <h2>Informações do runtime</h2>
          {systemInfo.isLoading ? <p>Consultando system.info...</p> : null}
          {systemInfo.error ? <p className="error">{systemInfo.error.message}</p> : null}
          {systemInfo.data ? (
            <dl className="kv-list">
              <div><dt>name</dt><dd>{systemInfo.data.name}</dd></div>
              <div><dt>runtime</dt><dd>{systemInfo.data.runtime}</dd></div>
              <div><dt>database</dt><dd>{systemInfo.data.database}</dd></div>
              <div><dt>redis</dt><dd>{systemInfo.data.redis}</dd></div>
            </dl>
          ) : null}
        </article>

        <article className="panel">
          <h2>Contexto autenticado</h2>
          {currentUser.isLoading ? <p>Consultando auth.me...</p> : null}
          {currentUser.error ? <p className="error">{currentUser.error.message}</p> : null}
          {currentUser.data ? (
            <dl className="kv-list">
              <div><dt>id</dt><dd>{String(currentUser.data.id)}</dd></div>
              <div><dt>role</dt><dd>{currentUser.data.role}</dd></div>
            </dl>
          ) : (
            !currentUser.isLoading && <p>Nenhum usuário autenticado no contexto bootstrap.</p>
          )}
        </article>
      </section>
    </main>
  );
}
