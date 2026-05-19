import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import AgentConfiguration from '@/components/agents/AgentConfiguration';
import AgentStatus from '@/components/agents/AgentStatus';
import ContentGenerator from '@/components/agents/ContentGenerator';
import PostScheduler from '@/components/agents/PostScheduler';
import RecommendedProducts from '@/components/agents/RecommendedProducts';
import SkillsUpgrades from '@/components/agents/SkillsUpgrades';
import ImageGenerator from '@/components/agents/ImageGenerator';

export default function Agents() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('status');

  const { data: agent, isLoading: agentLoading } = trpc.agents.getAgent.useQuery(
    undefined,
    { enabled: !!user }
  );

  if (authLoading || agentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Você precisa estar autenticado para acessar esta página.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Nenhum Agente Encontrado</CardTitle>
            <CardDescription>Você ainda não possui um agente IA configurado.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Criar Novo Agente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Gerenciamento de Agentes IA
          </h1>
          <p className="text-slate-600">
            Gerencie, monitore e otimize seu agente de IA
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="status">Estado</TabsTrigger>
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="posts">Postagens</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="images">Imagens</TabsTrigger>
          </TabsList>

          {/* Status Tab */}
          <TabsContent value="status" className="space-y-4">
            <AgentStatus agent={agent} />
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-4">
            <AgentConfiguration agent={agent} />
          </TabsContent>

          {/* Content Generator Tab */}
          <TabsContent value="content" className="space-y-4">
            <ContentGenerator agent={agent} />
          </TabsContent>

          {/* Post Scheduler Tab */}
          <TabsContent value="posts" className="space-y-4">
            <PostScheduler agent={agent} />
          </TabsContent>

          {/* Recommended Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <RecommendedProducts agent={agent} />
          </TabsContent>

          {/* Skills & Upgrades Tab */}
          <TabsContent value="skills" className="space-y-4">
            <SkillsUpgrades agent={agent} />
          </TabsContent>

          {/* Image Generator Tab */}
          <TabsContent value="images" className="space-y-4">
            <ImageGenerator agent={agent} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
