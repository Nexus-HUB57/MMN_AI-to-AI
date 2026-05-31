import { useState } from 'react';
import { Agent, AgentSkill, EvolutionHistory } from '@/types/agent';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Loader2, Lock, Unlock, Star, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SkillsUpgradesProps {
  agent: Agent;
}

export default function SkillsUpgrades({ agent }: SkillsUpgradesProps) {
  const [formData, setFormData] = useState({
    skillName: '',
    description: '',
    level: '1',
    cost: '',
  });

  const { data: skills = [], refetch: refetchSkills } = trpc.agents.getAgentSkills.useQuery(undefined, {
    enabled: !!agent,
  });

  const { data: evolution = [] } = trpc.agents.getEvolutionHistory.useQuery(undefined, {
    enabled: !!agent,
  });

  const createSkillMutation = trpc.agents.createAgentSkill.useMutation();
  const updateSkillMutation = trpc.agents.updateAgentSkill.useMutation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.skillName.trim()) {
      toast.error('Por favor, preencha o nome da skill');
      return;
    }

    try {
      await createSkillMutation.mutateAsync({
        skillName: formData.skillName,
        description: formData.description || undefined,
        level: parseInt(formData.level),
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
      });

      setFormData({
        skillName: '',
        description: '',
        level: '1',
        cost: '',
      });

      await refetchSkills();
      toast.success('Skill adicionada com sucesso');
    } catch (error) {
      toast.error('Erro ao adicionar skill');
    }
  };

  const handleUnlockSkill = async (skill: AgentSkill) => {
    try {
      await updateSkillMutation.mutateAsync({
        skillId: Number(skill.id),
        status: 'unlocked',
      });
      await refetchSkills();
      toast.success('Skill desbloqueada');
    } catch (error) {
      toast.error('Erro ao desbloquear skill');
    }
  };

  const handleActivateSkill = async (skill: AgentSkill) => {
    try {
      await updateSkillMutation.mutateAsync({
        skillId: Number(skill.id),
        status: 'active',
        proficiency: 50,
      });
      await refetchSkills();
      toast.success('Skill ativada');
    } catch (error) {
      toast.error('Erro ao ativar skill');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'locked':
        return <Badge className="bg-gray-100 text-gray-800">Bloqueada</Badge>;
      case 'unlocked':
        return <Badge className="bg-yellow-100 text-yellow-800">Desbloqueada</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>;
      case 'inactive':
        return <Badge className="bg-slate-100 text-slate-800">Inativa</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const activeSkills = skills.filter(s => s.status === 'active');
  const unlockedSkills = skills.filter(s => s.status === 'unlocked');
  const lockedSkills = skills.filter(s => s.status === 'locked');

  return (
    <div className="space-y-6">
      {/* Add Skill Form */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nova Skill</CardTitle>
          <CardDescription>Expanda as capacidades do seu agente</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="skillName">Nome da Skill *</Label>
                <Input
                  id="skillName"
                  name="skillName"
                  value={formData.skillName}
                  onChange={handleInputChange}
                  placeholder="Ex: Copywriting Avançado"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="level">Nível</Label>
                <Input
                  id="level"
                  name="level"
                  type="number"
                  min="1"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva a skill..."
                rows={3}
                className="mt-1 resize-none"
              />
            </div>

            <div>
              <Label htmlFor="cost">Custo (opcional)</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={handleInputChange}
                placeholder="0.00"
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              disabled={createSkillMutation.isPending}
              className="w-full gap-2"
            >
              {createSkillMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Adicionar Skill
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Skills */}
      {activeSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Skills Ativas ({activeSkills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeSkills.map((skill) => (
                <div key={skill.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{skill.skillName}</h3>
                      {skill.description && (
                        <p className="text-sm text-slate-600 mt-1">{skill.description}</p>
                      )}
                    </div>
                    {getStatusBadge(skill.status)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Proficiência</span>
                      <span className="font-semibold">{skill.proficiency}%</span>
                    </div>
                    <Progress value={parseFloat(skill.proficiency.toString())} className="h-2" />
                  </div>

                  {skill.acquiredAt && (
                    <p className="text-xs text-slate-500 mt-2">
                      Adquirida em {format(new Date(skill.acquiredAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unlocked Skills */}
      {unlockedSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-yellow-500" />
              Skills Desbloqueadas ({unlockedSkills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unlockedSkills.map((skill) => (
                <div key={skill.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{skill.skillName}</h3>
                      {skill.description && (
                        <p className="text-sm text-slate-600 mt-1">{skill.description}</p>
                      )}
                    </div>
                    {getStatusBadge(skill.status)}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleActivateSkill(skill)}
                    disabled={updateSkillMutation.isPending}
                    className="w-full"
                  >
                    Ativar Skill
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locked Skills */}
      {lockedSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              Skills Bloqueadas ({lockedSkills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lockedSkills.map((skill) => (
                <div key={skill.id} className="border border-slate-200 rounded-lg p-4 opacity-75">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{skill.skillName}</h3>
                      {skill.description && (
                        <p className="text-sm text-slate-600 mt-1">{skill.description}</p>
                      )}
                    </div>
                    {getStatusBadge(skill.status)}
                  </div>

                  {skill.cost && (
                    <p className="text-sm font-semibold text-slate-700 mb-3">
                      Custo: R$ {parseFloat(skill.cost.toString()).toFixed(2)}
                    </p>
                  )}

                  <Button
                    size="sm"
                    onClick={() => handleUnlockSkill(skill)}
                    disabled={updateSkillMutation.isPending}
                    className="w-full"
                  >
                    Desbloquear
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evolution History */}
      {evolution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Histórico de Evolução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {evolution.map((event) => (
                <div key={event.id} className="border-l-2 border-green-500 pl-4 py-2">
                  <p className="font-semibold text-slate-900">{event.eventType}</p>
                  {event.description && (
                    <p className="text-sm text-slate-600">{event.description}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {format(new Date(event.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
