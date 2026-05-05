import { useState } from 'react';
import { Agent, GeneratedImage } from '@/types/agent';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Download, Copy, Wand2 } from 'lucide-react';

interface ImageGeneratorProps {
  agent: Agent;
}

export default function ImageGenerator({ agent }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);

  const { data: images = [], refetch } = trpc.agents.getGeneratedImages.useQuery(undefined, {
    enabled: !!agent,
  });

  const createImageMutation = trpc.agents.createGeneratedImage.useMutation();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor, insira um prompt para gerar a imagem');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate image generation - in production, this would call your image generation service
      // For now, we'll use a placeholder image service
      const mockImageUrl = `https://via.placeholder.com/512x512?text=${encodeURIComponent(prompt.substring(0, 20))}`;

      const newImage: GeneratedImage = {
        id: Date.now(),
        agentId: agent.agentId,
        prompt,
        imageUrl: mockImageUrl,
        storageKey: null,
        createdAt: new Date(),
      };

      setGeneratedImage(newImage);

      // Save to database
      await createImageMutation.mutateAsync({
        prompt,
        imageUrl: mockImageUrl,
        storageKey: undefined,
      });

      await refetch();
      toast.success('Imagem gerada com sucesso');
    } catch (error) {
      toast.error('Erro ao gerar imagem');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agent-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Imagem baixada com sucesso');
    } catch (error) {
      toast.error('Erro ao baixar imagem');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiada para a área de transferência');
  };

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Gerar Imagem com IA
          </CardTitle>
          <CardDescription>
            Crie imagens personalizadas para seu conteúdo usando inteligência artificial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prompt">Descrição da Imagem</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Ex: Uma imagem moderna de um agente de IA trabalhando com ${agent.specialization}`}
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
            {isGenerating ? 'Gerando Imagem...' : 'Gerar Imagem'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Image Preview */}
      {generatedImage && (
        <Card>
          <CardHeader>
            <CardTitle>Imagem Gerada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <img
              src={generatedImage.imageUrl}
              alt="Generated"
              className="w-full rounded-lg max-h-96 object-cover"
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => handleDownload(generatedImage.imageUrl)}
              >
                <Download className="w-4 h-4" />
                Baixar
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => handleCopyUrl(generatedImage.imageUrl)}
              >
                <Copy className="w-4 h-4" />
                Copiar URL
              </Button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-sm text-slate-600 font-mono break-all">{generatedImage.imageUrl}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Images Gallery */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Galeria de Imagens Geradas</CardTitle>
            <CardDescription>Imagens geradas anteriormente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="space-y-2">
                  <img
                    src={image.imageUrl}
                    alt={image.prompt}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <p className="text-sm text-slate-600 line-clamp-2">{image.prompt}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                      onClick={() => handleDownload(image.imageUrl)}
                    >
                      <Download className="w-3 h-3" />
                      Baixar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                      onClick={() => handleCopyUrl(image.imageUrl)}
                    >
                      <Copy className="w-3 h-3" />
                      URL
                    </Button>
                  </div>
                </div>
              ))}
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
          <p>✓ Seja descritivo e específico sobre o que deseja</p>
          <p>✓ Inclua detalhes de estilo, cores e composição</p>
          <p>✓ Mencione o contexto ou tema da imagem</p>
          <p>✓ Use palavras-chave relevantes para melhor resultado</p>
        </CardContent>
      </Card>
    </div>
  );
}
