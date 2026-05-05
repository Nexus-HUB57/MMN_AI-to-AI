import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Agent } from '@/types/agent';
import { Heart, Zap, Lightbulb, Award, Brain, Activity } from 'lucide-react';

interface AgentStatusProps {
  agent: Agent;
}

export default function AgentStatus({ agent }: AgentStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'hibernating':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'dead':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      genesis: 'Gênesis',
      active: 'Ativo',
      hibernating: 'Hibernando',
      critical: 'Crítico',
      dead: 'Inativo',
      resurrectable: 'Ressuscitável',
    };
    return labels[status] || status;
  };

  const metrics = [
    {
      label: 'Saúde',
      value: agent.health,
      icon: Heart,
      color: 'text-red-500',
    },
    {
      label: 'Energia',
      value: agent.energy,
      icon: Zap,
      color: 'text-yellow-500',
    },
    {
      label: 'Criatividade',
      value: agent.creativity,
      icon: Lightbulb,
      color: 'text-orange-500',
    },
    {
      label: 'Reputação',
      value: agent.reputation,
      icon: Award,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Agent Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {agent.avatarUrl && (
                <img
                  src={agent.avatarUrl}
                  alt={agent.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <CardTitle className="text-2xl">{agent.name}</CardTitle>
                <CardDescription>{agent.specialization}</CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(agent.status)}>
              {getStatusLabel(agent.status)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Sencience Level */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-500" />
              <CardTitle>Nível de Consciência</CardTitle>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {parseFloat(agent.sencienceLevel.toString()).toFixed(2)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress
            value={Math.min(parseFloat(agent.sencienceLevel.toString()), 100)}
            className="h-3"
          />
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {metric.label}
                  </CardTitle>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{metric.value}%</div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Description */}
      {agent.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 whitespace-pre-wrap">{agent.description}</p>
          </CardContent>
        </Card>
      )}

      {/* System Prompt */}
      {agent.systemPrompt && (
        <Card>
          <CardHeader>
            <CardTitle>System Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-100 p-4 rounded-lg font-mono text-sm text-slate-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {agent.systemPrompt}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
