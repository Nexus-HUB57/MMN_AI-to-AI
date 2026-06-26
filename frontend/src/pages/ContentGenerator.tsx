import { useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Agent } from '@/types/agent';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bot, Copy, Loader2, Sparkles } from 'lucide-react';

interface ContentGeneratorProps {
  agent?: Agent;
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

  const agentsQuery = trpc.agents.get.useQuery(undefined, {
    retry: false,
    staleTime: 1000 * 60,
  });

  const effectiveAgent = useMemo<Agent>(() => {
    const candidate = (agent ?? (agentsQuery.data as Agent | undefined)) as Agent | undefined;
    return candidate ?? {
      id: 'default-content-agent',
      agentId: 'default-content-agent',
      name: 'Nexus Content Core',
      specialization: 'copy, campanhas, roteiros e briefs visuais para afiliados',
      description: 'Agente padrão do Hub de Conteúdo',
      status: 'operational',
    };
  }, [agent, agentsQuery.data]);

  const generateTextMutation = trpc.content.generateText.useMutation();
  const createContentMutation = trpc.agents.createGeneratedContent.useMutation();

  const buildTopic = () => {
    const cleanPrompt = prompt.trim();
    if (contentType === 'image') {
      return `Crie um briefing visual premium para ${platform}. Contexto do agente: ${effectiveAgent.specialization}. Pedido: ${cleanPrompt}`;
    }
    if (contentType === 'video') {
      return `Crie um roteiro curto para ${platform}, com gancho, desenvolvimento e CTA. Contexto do agente: ${effectiveAgent.specialization}. Pedido: ${cleanPrompt}`;
    }
    return cleanPrompt;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Insira um prompt para gerar o conteúdo.');
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
      toast.success('Conteúdo gerado com sucesso.');
    } catch {
      toast.error('Erro ao gerar conteúdo.');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent);
    toast.success('Conteúdo copiado.');
  };

  const isGenerating = generateTextMutation.isPending || createContentMutation.isPending;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <Badge className="border border-quantum-cyan/30 bg-quantum-cyan/10 text-quantum-cyan">Hub de Conteúdo</Badge>
              <h1 className="text-3xl font-bold text-white md:text-4xl">Gerador de conteúdo IA</h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                Gere textos, briefs visuais e roteiros curtos para campanhas, marketplace, WhatsApp e redes sociais sem depender de uma prop externa de agente.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <div className="flex items-center gap-2 text-white"><Bot className="h-4 w-4 text-quantum-cyan" /> {effectiveAgent.name}</div>
              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">{effectiveAgent.specialization}</p>
            </div>
          </div>
        </section>

        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Montar peça</CardTitle>
            <CardDescription className="text-slate-400">
              O backend gera o texto base e salva o resultado no domínio do agente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Tipo de conteúdo</Label>
                <Select value={contentType} onValueChange={(value: ContentType) => setContentType(value)}>
                  <SelectTrigger className="mt-1 border-white/10 bg-background text-white">
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
                <Label>Plataforma</Label>
                <Select value={platform} onValueChange={(value: UiPlatform) => setPlatform(value)}>
                  <SelectTrigger className="mt-1 border-white/10 bg-background text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="twitter">Twitter / X</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="prompt">Briefing</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Ex.: crie um ${contentType === 'text' ? 'post' : contentType === 'image' ? 'conceito visual' : 'roteiro'} sobre ${effectiveAgent.specialization}`}
                rows={5}
                className="mt-1 resize-none border-white/10 bg-background text-white"
              />
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full gap-2">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isGenerating ? 'Gerando...' : 'Gerar conteúdo'}
            </Button>
          </CardContent>
        </Card>

        {generatedContent && (
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-white">Resultado</CardTitle>
                  <CardDescription className="text-slate-400">Revise e publique no fluxo comercial.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10">
                  <Copy className="h-4 w-4" /> Copiar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-4 whitespace-pre-wrap text-sm leading-6 text-slate-200">
                {generatedContent}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
