import { Link } from "wouter";
import { trpc } from "../lib/trpc";

export default function Home() {
  const systemInfo = trpc.system.info.useQuery();
  const bootstrapStatus = trpc.bootstrap.status.useQuery();

  return (
    <main className="page-shell">
      <section className="hero-card">
        <span className="pill">Bootstrap técnico ativo</span>
        <h1>MMN AI-to-AI</h1>
        <p className="lead">
          O monorepo foi estabilizado com um frontend Vite e um backend Express+tRPC,
          criando uma base executável para a reintrodução gradual dos módulos reais.
        </p>

        <div className="cta-row">
          <Link href="/dashboard" className="btn btn-primary">
            Abrir dashboard bootstrap
          </Link>
          <Link href="/content-hub" className="btn btn-secondary">
            Abrir content hub bootstrap
          </Link>
        </div>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Estado do backend via tRPC</h2>
          {systemInfo.isLoading ? <p>Consultando system.info...</p> : null}
          {systemInfo.error ? <p className="error">{systemInfo.error.message}</p> : null}
          {systemInfo.data ? (
            <dl className="kv-list">
              <div><dt>runtime</dt><dd>{systemInfo.data.runtime}</dd></div>
              <div><dt>database</dt><dd>{systemInfo.data.database}</dd></div>
              <div><dt>redis</dt><dd>{systemInfo.data.redis}</dd></div>
              <div><dt>mode</dt><dd>{systemInfo.data.mode}</dd></div>
            </dl>
          ) : null}
        </article>

        <article className="panel">
          <h2>Status do bootstrap</h2>
          {bootstrapStatus.isLoading ? <p>Consultando bootstrap.status...</p> : null}
          {bootstrapStatus.error ? <p className="error">{bootstrapStatus.error.message}</p> : null}
          {bootstrapStatus.data ? (
            <dl className="kv-list">
              <div><dt>frontend</dt><dd>{bootstrapStatus.data.frontend}</dd></div>
              <div><dt>backend</dt><dd>{bootstrapStatus.data.backend}</dd></div>
              <div><dt>genkit</dt><dd>{bootstrapStatus.data.genkit}</dd></div>
            </dl>
          ) : null}
        </article>
      </section>
    </main>
  );
}
