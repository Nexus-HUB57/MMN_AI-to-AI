import { useState } from 'react';
import { Agent } from '@/types/agent';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';

interface AgentConfigurationProps {
  agent: Agent;
}

export default function AgentConfiguration({ agent }: AgentConfigurationProps) {
  const [formData, setFormData] = useState({
    name: agent.name || '',
    specialization: agent.specialization || '',
    description: agent.description || '',
    systemPrompt: agent.systemPrompt || '',
    avatarUrl: agent.avatarUrl || '',
  });

  const [isUploading, setIsUploading] = useState(false);
  const updateMutation = trpc.agents.updateAgent.useMutation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      // In a real app, you would upload to your storage service
      // For now, we'll create a data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData((prev) => ({ ...prev, avatarUrl: dataUrl }));
        toast.success('Avatar carregado com sucesso');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Erro ao carregar avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        name: formData.name,
        specialization: formData.specialization,
        description: formData.description,
        systemPrompt: formData.systemPrompt,
        avatarUrl: formData.avatarUrl,
      });
      toast.success('Configurações do agente atualizadas com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar configurações');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle>Avatar do Agente</CardTitle>
            <CardDescription>Carregue uma imagem para representar seu agente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {formData.avatarUrl && (
                <img
                  src={formData.avatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 transition">
                    <div className="text-center">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm font-medium text-slate-600">
                        Clique para carregar ou arraste uma imagem
                      </p>
                    </div>
                  </div>
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Configure o nome e especialização do seu agente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Agente</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex: Agente de Marketing"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="specialization">Especialização</Label>
              <Input
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                placeholder="Ex: Marketing Digital, E-commerce, etc."
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
            <CardDescription>Descreva o propósito e capacidades do seu agente</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Descreva o seu agente..."
              rows={4}
              className="resize-none"
            />
          </CardContent>
        </Card>

        {/* System Prompt */}
        <Card>
          <CardHeader>
            <CardTitle>System Prompt</CardTitle>
            <CardDescription>
              Defina as instruções base para o comportamento do seu agente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              name="systemPrompt"
              value={formData.systemPrompt}
              onChange={handleInputChange}
              placeholder="Você é um agente especializado em..."
              rows={6}
              className="resize-none font-mono text-sm"
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="gap-2"
          >
            {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Salvar Configurações
          </Button>
        </div>
      </form>
    </div>
  );
}
