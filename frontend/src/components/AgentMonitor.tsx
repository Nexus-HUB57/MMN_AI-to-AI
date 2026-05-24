import { useEffect, useMemo, useState } from "react";
import { trpc } from "../lib/trpc";

export default function AgentMonitor() {
  const [goal, setGoal] = useState("Gerar pipeline de leads qualificados");
  const [audience, setAudience] = useState("afiliados em onboarding");
  const [offer, setOffer] = useState("sequência com CTA para diagnóstico gratuito");
  const [channel, setChannel] = useState<"instagram" | "whatsapp">("instagram");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [memoryQuery, setMemoryQuery] = useState("");

  const monitor = trpc.agentic.getMonitor.useQuery({ limit: 5 }, { refetchInterval: 15000 });
  const utils = trpc.useUtils();

  const sessionDetail = trpc.agentic.getSession.useQuery(
    { sessionId: selectedSessionId || "" },
    { enabled: Boolean(selectedSessionId), refetchInterval: 15000 },
  );

  const memorySearch = trpc.agentic.searchMemories.useQuery(
    {
      query: memoryQuery,
      sessionId: selectedSessionId || undefined,
      limit: 6,
    },
    {
      enabled: memoryQuery.trim().length >= 2,
    },
  );

  useEffect(() => {
    const recentSessions = monitor.data?.sessions || [];
    if (!recentSessions.length) return;

    const stillExists = recentSessions.some((session) => session.id === selectedSessionId);
    if (!selectedSessionId || !stillExists) {
      setSelectedSessionId(recentSessions[0].id);
    }
  }, [monitor.data?.sessions, selectedSessionId]);

  const launchCampaign = trpc.agentic.launchCampaign.useMutation({
    onSuccess: async (result) => {
      setSelectedSessionId(result.session.id);
      await Promise.all([
        utils.agentic.getMonitor.invalidate(),
        utils.agentic.listSessions.invalidate(),
        utils.agentic.getSession.invalidate(),
        utils.agentic.searchMemories.invalidate(),
      ]);
    },
  });

  const latestSession = useMemo(() => {
    return sessionDetail.data || monitor.data?.sessions?.[0] || null;
  }, [monitor.data, sessionDetail.data]);

  const checkpointTotal = sessionDetail.data
    ? sessionDetail.data.checkpointsList.length
    : latestSession?.checkpoints || 0;

  const handleLaunch = (event: React.FormEvent) => {
    event.preventDefault();
    launchCampaign.mutate({ goal, audience, offer, channel });
  };

  return (
    <section className="grid">
      <article className="panel full-width">
        <div className="agentic-header">
          <div>
            <span className="pill">Agentic Layer</span>
            <h2>Agent Monitor</h2>
            <p className="lead compact">
              Monitor em tempo real da camada agentic com graph de marketing, queue runtime,
              audit trail, memória vetorial, checkpoints operacionais e judge de qualidade.
            </p>
          </div>
          <button className="btn btn-secondary" onClick={() => monitor.refetch()}>
            Atualizar monitor
          </button>
        </div>

        <div className="grid monitor-grid">
          <div className="monitor-card">
            <h3>Fila runtime</h3>
            {monitor.data ? (
              <dl className="kv-list compact-kv">
                <div><dt>queued</dt><dd>{monitor.data.queue.queued}</dd></div>
                <div><dt>running</dt><dd>{monitor.data.queue.running}</dd></div>
                <div><dt>completed</dt><dd>{monitor.data.queue.completed}</dd></div>
                <div><dt>failed</dt><dd>{monitor.data.queue.failed}</dd></div>
              </dl>
            ) : (
              <p>Carregando fila...</p>
            )}
          </div>

          <div className="monitor-card">
            <h3>Readiness</h3>
            {monitor.data ? (
              <ul className="feature-list slim">
                <li>Judge: {monitor.data.readiness.judge}</li>
                <li>Memory: {monitor.data.readiness.memory}</li>
                <li>Audit: {monitor.data.readiness.audit}</li>
                <li>Storage: {monitor.data.readiness.storage}</li>
                <li>Canais: {monitor.data.readiness.channels.join(", ")}</li>
              </ul>
            ) : (
              <p>Carregando readiness...</p>
            )}
          </div>

          <div className="monitor-card">
            <h3>Tools registradas</h3>
            {monitor.data ? (
              <ul className="feature-list slim">
                {monitor.data.tools.map((tool) => (
                  <li key={`${tool.channel}-${tool.name}`}>
                    <strong>{tool.channel}</strong> → {tool.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Carregando tools...</p>
            )}
          </div>
        </div>

        <form onSubmit={handleLaunch} className="goal-form monitor-form">
          <div className="form-group">
            <label htmlFor="agentic-goal">Goal</label>
            <input id="agentic-goal" value={goal} onChange={(event) => setGoal(event.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="agentic-audience">Audience</label>
            <input id="agentic-audience" value={audience} onChange={(event) => setAudience(event.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="agentic-offer">Offer</label>
            <input id="agentic-offer" value={offer} onChange={(event) => setOffer(event.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="agentic-channel">Channel</label>
            <select id="agentic-channel" value={channel} onChange={(event) => setChannel(event.target.value as "instagram" | "whatsapp")}>
              <option value="instagram">Instagram</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={launchCampaign.isPending}>
              {launchCampaign.isPending ? "Executando camada agentic..." : "Executar marketingOrchestrator"}
            </button>
          </div>
          {launchCampaign.isError ? <p className="error">{launchCampaign.error.message}</p> : null}
        </form>

        <div className="grid monitor-grid">
          <div className="monitor-card">
            <h3>Sessões recentes</h3>
            {monitor.data?.sessions?.length ? (
              <div className="goal-list compact-list">
                {monitor.data.sessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    className={`goal-card ${session.status}`}
                    onClick={() => setSelectedSessionId(session.id)}
                  >
                    <div className="goal-header">
                      <h3>{session.goal}</h3>
                      <span className={`status-badge ${session.status}`}>{session.status}</span>
                    </div>
                    <p className="goal-description">{session.audience} • {session.offer}</p>
                    <div className="goal-meta">
                      <span>{session.channel}</span>
                      <span>score {session.qualityScore}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p>Nenhuma sessão agentic executada ainda.</p>
            )}
          </div>

          <div className="monitor-card">
            <h3>Busca de memória</h3>
            <div className="form-group">
              <label htmlFor="memory-search">Consulta</label>
              <input
                id="memory-search"
                value={memoryQuery}
                onChange={(event) => setMemoryQuery(event.target.value)}
                placeholder="ex: onboarding, CTA, score alto"
              />
            </div>
            {memoryQuery.trim().length < 2 ? (
              <p>Digite pelo menos 2 caracteres para consultar a memória vetorial.</p>
            ) : memorySearch.isLoading ? (
              <p>Buscando memórias...</p>
            ) : memorySearch.data?.length ? (
              <ul className="feature-list slim">
                {memorySearch.data.map((memory) => (
                  <li key={memory.id}>
                    <strong>{memory.memoryType}</strong>
                    {typeof memory.similarity === "number" ? ` • similaridade ${memory.similarity.toFixed(2)}` : ""}
                    <br />
                    <span>{memory.content}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhuma memória relevante encontrada.</p>
            )}
          </div>

          <div className="monitor-card">
            <h3>Ações auditadas</h3>
            {monitor.data?.recentActions?.length ? (
              <ul className="feature-list slim">
                {monitor.data.recentActions.slice(0, 6).map((action) => (
                  <li key={action.id}>
                    <strong>{action.actionKey}</strong> • {action.toolName} • {action.status}
                    {typeof action.score === "number" ? ` • score ${action.score}` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Sem ações auditadas.</p>
            )}
          </div>

          <div className="monitor-card">
            <h3>Memórias recentes</h3>
            {monitor.data?.recentMemories?.length ? (
              <ul className="feature-list slim">
                {monitor.data.recentMemories.slice(0, 6).map((memory) => (
                  <li key={memory.id}>
                    <strong>{memory.memoryType}</strong> • {memory.tags.join(", ") || "sem tags"}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Sem memórias vetoriais registradas.</p>
            )}
          </div>

          <div className="monitor-card">
            <h3>Checkpoints recentes</h3>
            {monitor.data?.recentCheckpoints?.length ? (
              <ul className="feature-list slim">
                {monitor.data.recentCheckpoints.slice(0, 6).map((checkpoint) => (
                  <li key={checkpoint.id}>
                    <strong>{checkpoint.reason}</strong> • {new Date(checkpoint.createdAt).toLocaleTimeString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Sem checkpoints persistidos.</p>
            )}
          </div>

          <div className="monitor-card">
            <h3>Queue jobs recentes</h3>
            {monitor.data?.recentQueueJobs?.length ? (
              <ul className="feature-list slim">
                {monitor.data.recentQueueJobs.slice(0, 6).map((job) => (
                  <li key={job.id}>
                    <strong>{job.type}</strong> • {job.status}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Sem jobs agentic registrados.</p>
            )}
          </div>
        </div>

        {latestSession ? (
          <div className="panel inset-panel">
            <h3>Detalhe da sessão</h3>
            <p><strong>ID:</strong> {latestSession.id}</p>
            <p><strong>Status:</strong> {latestSession.status}</p>
            <p><strong>Canal:</strong> {latestSession.channel}</p>
            <p><strong>Resumo:</strong> {latestSession.summary || "sem resumo"}</p>
            <p><strong>Score:</strong> {latestSession.qualityScore}</p>
            <p><strong>Checkpoints:</strong> {checkpointTotal}</p>
            <p><strong>Plano:</strong> {latestSession.plan.join(" → ")}</p>

            {latestSession.latestDraft ? (
              <>
                <p><strong>{latestSession.latestDraft.headline}</strong></p>
                <p>{latestSession.latestDraft.body}</p>
                <p><strong>CTA:</strong> {latestSession.latestDraft.cta}</p>
                {latestSession.latestDraft.hashtags?.length ? (
                  <p><strong>Hashtags:</strong> {latestSession.latestDraft.hashtags.join(" ")}</p>
                ) : null}
              </>
            ) : null}

            {sessionDetail.data ? (
              <div className="grid monitor-grid">
                <div className="monitor-card">
                  <h3>Timeline de ações</h3>
                  {sessionDetail.data.actions.length ? (
                    <ul className="feature-list slim">
                      {sessionDetail.data.actions.map((action) => (
                        <li key={action.id}>
                          <strong>{action.actionKey}</strong> • {action.status}
                          {typeof action.score === "number" ? ` • score ${action.score}` : ""}
                          {action.outputSummary ? <><br />{action.outputSummary}</> : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Sem ações detalhadas.</p>
                  )}
                </div>

                <div className="monitor-card">
                  <h3>Checkpoints da sessão</h3>
                  {sessionDetail.data.checkpointsList.length ? (
                    <ul className="feature-list slim">
                      {sessionDetail.data.checkpointsList.map((checkpoint) => (
                        <li key={checkpoint.id}>
                          <strong>{checkpoint.reason}</strong> • {new Date(checkpoint.createdAt).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Sem checkpoints na sessão.</p>
                  )}
                </div>

                <div className="monitor-card">
                  <h3>Queue jobs da sessão</h3>
                  {sessionDetail.data.queueJobs.length ? (
                    <ul className="feature-list slim">
                      {sessionDetail.data.queueJobs.map((job) => (
                        <li key={job.id}>
                          <strong>{job.type}</strong> • {job.status}
                          {job.error ? <><br />{job.error}</> : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Sem jobs na sessão.</p>
                  )}
                </div>
              </div>
            ) : selectedSessionId ? (
              <p>Carregando detalhe completo da sessão...</p>
            ) : null}
          </div>
        ) : null}
      </article>
    </section>
  );
}
