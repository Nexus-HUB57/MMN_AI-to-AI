import { Link } from "wouter";
import { trpc } from "../lib/trpc";

export default function ContentHub() {
  const bootstrapStatus = trpc.bootstrap.status.useQuery();
  const systemInfo = trpc.system.info.useQuery();

  return (
    <main className="page-shell">
      <div className="topbar">
        <h1>Content Hub Bootstrap</h1>
        <Link href="/" className="btn btn-secondary">
          Voltar
        </Link>
      </div>

      <section className="panel">
        <h2>Modo bootstrap</h2>
        <p>
          Esta tela comprova que o frontend está consumindo o backend bootstrap diretamente por tRPC,
          preparando a reintrodução gradual dos módulos reais do ecossistema MMN AI-to-AI.
        </p>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Probe do bootstrap</h2>
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

        <article className="panel">
          <h2>Notas do runtime</h2>
          {systemInfo.isLoading ? <p>Consultando system.info...</p> : null}
          {systemInfo.error ? <p className="error">{systemInfo.error.message}</p> : null}
          {systemInfo.data ? (
            <ul>
              {systemInfo.data.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}
        </article>
      </section>
    </main>
  );
}
