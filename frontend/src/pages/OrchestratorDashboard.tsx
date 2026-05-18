import { useState } from "react";
import { Link } from "wouter";
import AgentMonitor from "../components/AgentMonitor";
import { trpc } from "../lib/trpc";

export default function OrchestratorDashboard() {
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalPriority, setGoalPriority] = useState<"low" | "medium" | "high">("medium");
  const [isCreating, setIsCreating] = useState(false);

  const queueStatus = trpc.orchestration.getQueueStatus.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const goalHistory = trpc.orchestration.getGoalHistory.useQuery();

  const createGoalMutation = trpc.orchestration.createGoal.useMutation({
    onSuccess: () => {
      setGoalTitle("");
      setGoalDescription("");
      setIsCreating(false);
      // Invalidate queries to refresh data
      queueStatus.refetch();
      goalHistory.refetch();
    },
  });

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle || !goalDescription) return;

    setIsCreating(true);
    createGoalMutation.mutate({
      title: goalTitle,
      description: goalDescription,
      priority: goalPriority,
    });
  };

  return (
    <main className="page-shell">
      <div className="topbar">
        <h1>🎭 Orquestrador de Agentes</h1>
        <Link href="/" className="btn btn-secondary">
          Voltar ao Início
        </Link>
      </div>

      {/* Status Overview */}
      <section className="grid">
        <article className="panel">
          <h2>📊 Status das Filas</h2>
          {queueStatus.isLoading ? (
            <p>Carregando status das filas...</p>
          ) : queueStatus.error ? (
            <p className="error">Erro: {queueStatus.error.message}</p>
          ) : queueStatus.data ? (
            <div className="queue-grid">
              <div className="queue-card content">
                <h3>📝 Content Generation</h3>
                <dl className="kv-list">
                  <div><dt>Pendente</dt><dd>{queueStatus.data.queues.content_generation.pending}</dd></div>
                  <div><dt>Ativo</dt><dd>{queueStatus.data.queues.content_generation.active}</dd></div>
                  <div><dt>Concluído</dt><dd>{queueStatus.data.queues.content_generation.completed}</dd></div>
                  <div><dt>Falhou</dt><dd className="error-count">{queueStatus.data.queues.content_generation.failed}</dd></div>
                </dl>
              </div>

              <div className="queue-card marketplace">
                <h3>🛒 Marketplace Sync</h3>
                <dl className="kv-list">
                  <div><dt>Pendente</dt><dd>{queueStatus.data.queues.marketplace_sync.pending}</dd></div>
                  <div><dt>Ativo</dt><dd>{queueStatus.data.queues.marketplace_sync.active}</dd></div>
                  <div><dt>Concluído</dt><dd>{queueStatus.data.queues.marketplace_sync.completed}</dd></div>
                  <div><dt>Falhou</dt><dd className="error-count">{queueStatus.data.queues.marketplace_sync.failed}</dd></div>
                </dl>
              </div>

              <div className="queue-card order">
                <h3>📦 Order Processing</h3>
                <dl className="kv-list">
                  <div><dt>Pendente</dt><dd>{queueStatus.data.queues.order_processing.pending}</dd></div>
                  <div><dt>Ativo</dt><dd>{queueStatus.data.queues.order_processing.active}</dd></div>
                  <div><dt>Concluído</dt><dd>{queueStatus.data.queues.order_processing.completed}</dd></div>
                  <div><dt>Falhou</dt><dd className="error-count">{queueStatus.data.queues.order_processing.failed}</dd></div>
                </dl>
              </div>

              <div className="queue-card commission">
                <h3>💰 Commission Processing</h3>
                <dl className="kv-list">
                  <div><dt>Pendente</dt><dd>{queueStatus.data.queues.commission_processing.pending}</dd></div>
                  <div><dt>Ativo</dt><dd>{queueStatus.data.queues.commission_processing.active}</dd></div>
                  <div><dt>Concluído</dt><dd>{queueStatus.data.queues.commission_processing.completed}</dd></div>
                  <div><dt>Falhou</dt><dd className="error-count">{queueStatus.data.queues.commission_processing.failed}</dd></div>
                </dl>
              </div>
            </div>
          ) : null}
          <p className="timestamp">Última atualização: {queueStatus.data?.timestamp}</p>
        </article>
      </section>

      {/* Create Goal */}
      <section className="grid">
        <article className="panel full-width">
          <h2>🎯 Criar Nova Meta</h2>
          {!isCreating ? (
            <button
              className="btn btn-primary"
              onClick={() => setIsCreating(true)}
            >
              + Nova Meta de Alto Nível
            </button>
          ) : (
            <form onSubmit={handleCreateGoal} className="goal-form">
              <div className="form-group">
                <label htmlFor="title">Título da Meta</label>
                <input
                  id="title"
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="Ex: Aumentar vendas em 20%"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Descrição</label>
                <textarea
                  id="description"
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="Descreva a meta em detalhes..."
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="priority">Prioridade</label>
                <select
                  id="priority"
                  value={goalPriority}
                  onChange={(e) => setGoalPriority(e.target.value as "low" | "medium" | "high")}
                >
                  <option value="low">🟢 Baixa</option>
                  <option value="medium">🟡 Média</option>
                  <option value="high">🔴 Alta</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={createGoalMutation.isPending}>
                  {createGoalMutation.isPending ? "Criando..." : "Criar Meta"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreating(false)}>
                  Cancelar
                </button>
              </div>

              {createGoalMutation.isError && (
                <p className="error">Erro ao criar meta: {createGoalMutation.error.message}</p>
              )}
            </form>
          )}
        </article>
      </section>

      {/* Goal History */}
      <section className="grid">
        <article className="panel full-width">
          <h2>📜 Histórico de Metas</h2>
          {goalHistory.isLoading ? (
            <p>Carregando histórico...</p>
          ) : goalHistory.data && goalHistory.data.length > 0 ? (
            <div className="goal-list">
              {goalHistory.data.map((goal) => (
                <div key={goal.id} className={`goal-card ${goal.status}`}>
                  <div className="goal-header">
                    <h3>{goal.title}</h3>
                    <span className={`status-badge ${goal.status}`}>
                      {goal.status === "pending" ? "⏳ Pendente" :
                       goal.status === "executing" ? "⚙️ Executando" :
                       goal.status === "completed" ? "✅ Concluído" :
                       goal.status === "failed" ? "❌ Falhou" : goal.status}
                    </span>
                  </div>
                  <p className="goal-description">{goal.description}</p>
                  <div className="goal-meta">
                    <span>Prioridade: {goal.priority}</span>
                    <span>Criado: {new Date(goal.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Nenhuma meta criada ainda.</p>
          )}
        </article>
      </section>

      <AgentMonitor />

      {/* Quick Stats */}
      <section className="grid">
        <article className="panel">
          <h2>⚡ Ações Rápidas</h2>
          <div className="quick-actions">
            <Link href="/dashboard" className="btn btn-secondary">
              Ver Dashboard
            </Link>
            <Link href="/content-hub" className="btn btn-secondary">
              AI Content Hub
            </Link>
            <button
              className="btn btn-secondary"
              onClick={() => queueStatus.refetch()}
            >
              🔄 Atualizar Status
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}