import { Link } from "wouter";
import {
  benchmarkLinks,
  heavyLegacyAssets,
  legacyAdminGroups,
  legacyRetirementMetrics,
  migrationTargets,
  retirementChecklist,
} from "../data/legacy-fusion-data";

export default function LegacyReview() {
  return (
    <main className="page-shell">
      <div className="topbar">
        <div>
          <span className="pill">Legacy Benchmark</span>
          <h1>Revisão de referência do legado</h1>
          <p className="lead compact">
            Benchmark funcional do Marketing 11.0 para orientar a modernização do MMN AI-to-AI.
          </p>
        </div>
        <div className="cta-row compact-actions">
          <Link href="/" className="btn btn-secondary">
            Início
          </Link>
          <Link href="/dashboard" className="btn btn-secondary">
            Backoffice atual
          </Link>
        </div>
      </div>

      <section className="grid">
        <article className="panel full-width">
          <h2>Referências analisadas</h2>
          <div className="reference-grid">
            {benchmarkLinks.map((item) => (
              <a key={item.href} className="reference-card" href={item.href} target="_blank" rel="noreferrer">
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </a>
            ))}
          </div>
        </article>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Leituras principais do legado</h2>
          <ul className="feature-list">
            <li>O site público vende autonomia financeira, implantação rápida e operação sem dependência técnica.</li>
            <li>O painel do cliente concentra autenticação, cadastro e recuperação de acesso em uma única experiência simples.</li>
            <li>O painel administrativo prioriza densidade funcional: rede, pagamentos, relatórios, CMS, layouts e materiais.</li>
            <li>O legado já sugere quatro domínios fortes para migração: aquisição, backoffice, financeiro e conteúdo.</li>
          </ul>
        </article>

        <article className="panel">
          <h2>Direção de modernização</h2>
          <ul className="feature-list">
            <li>Manter a completude operacional do legado, mas com hierarquia visual limpa e menos atrito cognitivo.</li>
            <li>Transformar menus extensos em hubs por contexto: Operação, Receita, Conteúdo, Configuração e IA.</li>
            <li>Dar protagonismo ao Agent Monitor como diferencial de produto em vez de tratá-lo como recurso lateral.</li>
            <li>Separar claramente o que é benchmark legado do que já é evolução nativa do MMN AI-to-AI.</li>
          </ul>
        </article>
      </section>

      <section className="grid">
        <article className="panel full-width">
          <h2>Mapa funcional do administrador legado</h2>
          <div className="reference-grid four-col">
            {legacyAdminGroups.map((group) => (
              <div key={group.title} className="reference-card">
                <strong>{group.title}</strong>
                <div className="chip-wrap">
                  {group.items.map((item) => (
                    <span key={item} className="module-chip">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid">
        <article className="panel full-width">
          <h2>Metas de migração imediata</h2>
          <div className="reference-grid two-col">
            {migrationTargets.map((item) => (
              <div key={item.title} className="reference-card">
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Métricas para aposentadoria do diretório legacy/</h2>
          <div className="reference-grid two-col">
            {legacyRetirementMetrics.map((item) => (
              <div key={item.label} className="reference-card">
                <strong>{item.label}</strong>
                <span>{item.value}</span>
                <span>{item.note}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <h2>Checklist de desligamento do legado</h2>
          <ul className="feature-list">
            {retirementChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid">
        <article className="panel full-width">
          <h2>Ativos mais pesados já catalogados</h2>
          <div className="reference-grid two-col">
            {heavyLegacyAssets.map((asset) => (
              <div key={asset.path} className="reference-card">
                <strong>{asset.path}</strong>
                <span>{asset.size}</span>
                <span>{asset.reason}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
