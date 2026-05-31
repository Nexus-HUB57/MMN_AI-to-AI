import { useState } from 'react';
import { Agent } from '@/types/agent';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Copy } from 'lucide-react';

interface ContentGeneratorProps {
  agent: Agent;
}

type ContentType = 'text' | 'image' | 'video';
type UiPlatform = 'whatsapp' | 'instagram' | 'facebook' | 'twitter' | 'linkedin';
type BackendPlatform = 'whatsapp' | 'instagram' | 'facebook';
type Tone = 'professional' | 'casual' | 'persuasive' | 'humorous';

const platformRouteMap: Record<UiPlatform, BackendPlatform> = {
  whatsapp: 'whatsapp',
  instagram: 'instagram',
  facebook: 'facebook',
  twitter: 'facebook',
  linkedin: 'facebook',
};

const toneByPlatform: Record<UiPlatform, Tone> = {
  whatsapp: 'casual',
  instagram: 'casual',
  facebook: 'persuasive',
  twitter: 'humorous',
  linkedin: 'professional',
};

export default function ContentGenerator({ agent }: ContentGeneratorProps) {
  const [contentType, setContentType] = useState<ContentType>('text');
  const [platform, setPlatform] = useState<UiPlatform>('instagram');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');

  const generateTextMutation = trpc.content.generateText.useMutation();
  const createContentMutation = trpc.agents.createGeneratedContent.useMutation();

  const buildTopic = () => {
    const cleanPrompt = prompt.trim();

    if (contentType === 'image') {
      return `Crie um briefing de imagem promocional para ${platform}. Contexto do agente: ${agent.specialization}. Pedido: ${cleanPrompt}`;
    }

    if (contentType === 'video') {
      return `Crie um roteiro curto de vídeo promocional para ${platform}, com gancho, desenvolvimento e CTA. Contexto do agente: ${agent.specialization}. Pedido: ${cleanPrompt}`;
    }

    return cleanPrompt;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor, insira um prompt');
      return;
    }

    try {
      const result = await generateTextMutation.mutateAsync({
        platform: platformRouteMap[platform],
        topic: buildTopic(),
        tone: toneByPlatform[platform],
        maxLength: contentType === 'video' ? 560 : 320,
      });

      setGeneratedContent(result.content);

      await createContentMutation.mutateAsync({
        contentType,
        prompt,
        content: result.content,
        platform,
      });

      toast.success(
        contentType === 'text'
          ? 'Conteúdo gerado com sucesso'
          : contentType === 'image'
            ? 'Briefing visual gerado com sucesso'
            : 'Roteiro de vídeo gerado com sucesso',
      );
    } catch (error) {
      toast.error('Erro ao gerar conteúdo');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Conteúdo copiado para a área de transferência');
  };

  const isGenerating = generateTextMutation.isPending || createContentMutation.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerar Conteúdo</CardTitle>
          <CardDescription>
            Usa o backend real de geração para criar texto, briefing visual ou roteiro curto para suas plataformas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tipo de Conteúdo</Label>
            <Select value={contentType} onValueChange={(value: ContentType) => setContentType(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="image">Briefing de imagem</SelectItem>
                <SelectItem value="video">Roteiro de vídeo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Plataforma de Destino</Label>
            <Select value={platform} onValueChange={(value: UiPlatform) => setPlatform(value)}>
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

          <div>
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Ex: Crie um ${contentType === 'text' ? 'post' : contentType === 'image' ? 'conceito visual' : 'roteiro'} sobre ${agent.specialization}`}
              rows={4}
              className="mt-1 resize-none"
            />
          </div>

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

      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {contentType === 'text'
                    ? 'Conteúdo Gerado'
                    : contentType === 'image'
                      ? 'Briefing Visual Gerado'
                      : 'Roteiro Gerado'}
                </CardTitle>
                <CardDescription>
                  Revise, edite e use o resultado no seu fluxo de publicação.
                </CardDescription>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como o gerador está funcionando agora</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>✓ Texto usa a rota real <code>content.generateText</code></p>
          <p>✓ Briefing de imagem gera uma descrição visual reutilizável</p>
          <p>✓ Roteiro de vídeo gera uma estrutura curta com CTA</p>
          <p>✓ Todo resultado continua sendo persistido no domínio do agente</p>
        </CardContent>
      </Card>
    </div>
  );
}
