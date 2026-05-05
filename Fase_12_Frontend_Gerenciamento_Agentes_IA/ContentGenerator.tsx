import { useState } from 'react';
import { Agent } from '@/types/agent';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Copy, RefreshCw } from 'lucide-react';

interface ContentGeneratorProps {
  agent: Agent;
}

export default function ContentGenerator({ agent }: ContentGeneratorProps) {
  const [contentType, setContentType] = useState<'text' | 'image' | 'video'>('text');
  const [platform, setPlatform] = useState('instagram');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const createContentMutation = trpc.agents.createGeneratedContent.useMutation();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor, insira um prompt');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate LLM generation - in production, this would call your backend LLM service
      const mockContent = `Conteúdo gerado para ${platform}:\n\n${prompt}\n\n✨ Otimizado para ${agent.specialization}\n\n#${agent.specialization.replace(/\s+/g, '')} #IA #Marketing`;
      
      setGeneratedContent(mockContent);

      // Save to database
      await createContentMutation.mutateAsync({
        contentType,
        prompt,
        content: mockContent,
        platform,
      });

      toast.success('Conteúdo gerado com sucesso');
    } catch (error) {
      toast.error('Erro ao gerar conteúdo');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Conteúdo copiado para a área de transferência');
  };

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      <Card>
        <CardHeader>
          <CardTitle>Gerar Conteúdo</CardTitle>
          <CardDescription>
            Use IA para gerar conteúdo otimizado para suas plataformas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Content Type */}
          <div>
            <Label>Tipo de Conteúdo</Label>
            <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="image">Imagem</SelectItem>
                <SelectItem value="video">Vídeo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Platform */}
          <div>
            <Label>Plataforma de Destino</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="twitter">Twitter/X</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prompt */}
          <div>
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Ex: Crie um post sobre ${agent.specialization} que seja viral e engajador`}
              rows={4}
              className="mt-1 resize-none"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full gap-2"
          >
            {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isGenerating ? 'Gerando...' : 'Gerar Conteúdo'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content Preview */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Conteúdo Gerado</CardTitle>
                <CardDescription>Revise e customize o conteúdo gerado</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 p-4 rounded-lg whitespace-pre-wrap text-sm text-slate-700 max-h-96 overflow-y-auto">
              {generatedContent}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dicas para Melhores Resultados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>✓ Seja específico sobre o tipo de conteúdo que deseja</p>
          <p>✓ Mencione o público-alvo ou tom desejado</p>
          <p>✓ Inclua palavras-chave relevantes para SEO</p>
          <p>✓ Especifique a plataforma para otimização correta</p>
        </CardContent>
      </Card>
    </div>
  );
}
