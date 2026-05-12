import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function GoalCreation() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [createdGoal, setCreatedGoal] = useState<Record<string, unknown> | null>(null);

  const createGoal = trpc.orchestration.createGoal.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLoading(true);

    try {
      const result = await createGoal.mutateAsync({
        title,
        description,
        priority,
      });

      setCreatedGoal(result);
      toast.success('Meta criada e orquestração iniciada!');

      // Limpar formulário
      setTitle('');
      setDescription('');
      setPriority('medium');

      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => setCreatedGoal(null), 5000);
    } catch (error) {
      toast.error(`Erro ao criar meta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Criar Nova Meta</h1>
          <p className="text-slate-400">Defina uma meta de alto nível e deixe o orquestrador decompô-la em subtarefas</p>
        </div>

        {/* Form Card */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Dados da Meta</CardTitle>
            <CardDescription>Preencha os detalhes da sua meta de marketing</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Título da Meta
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Lançar campanha para Produto X no Instagram"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Descrição
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva em detalhes o que você quer alcançar com esta meta..."
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 min-h-32"
                  disabled={isLoading}
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Prioridade
                </label>
                <Select value={priority} onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')} disabled={isLoading}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="low" className="text-white">Baixa</SelectItem>
                    <SelectItem value="medium" className="text-white">Média</SelectItem>
                    <SelectItem value="high" className="text-white">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando meta...
                  </>
                ) : (
                  'Criar Meta e Iniciar Orquestração'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Success Message */}
        {createdGoal && (
          <Card className="bg-green-900 border-green-700">
            <CardHeader>
              <CardTitle className="text-green-100 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Meta Criada com Sucesso!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-green-100">
              <p className="mb-2">
                <strong>ID da Meta:</strong> {String(createdGoal.goalId)}
              </p>
              <p>
                <strong>Mensagem:</strong> {String(createdGoal.message)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Como Funciona</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-3 text-sm">
              <p>
                <strong>1. Você define:</strong> Uma meta de alto nível (ex: "Aumentar vendas em 10%")
              </p>
              <p>
                <strong>2. O sistema:</strong> Usa IA para decompor em subtarefas operacionais
              </p>
              <p>
                <strong>3. Execução:</strong> Subtarefas são despachadas para workers autônomos
              </p>
              <p>
                <strong>4. Monitoramento:</strong> Você acompanha o progresso em tempo real
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Exemplos de Metas</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-3 text-sm">
              <p>
                • Lançar campanha para novo produto no Instagram
              </p>
              <p>
                • Sincronizar produtos de todos os marketplaces
              </p>
              <p>
                • Processar comissões de vendas do mês
              </p>
              <p>
                • Gerar sequência de e-mails para leads
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
