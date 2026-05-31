import { useState } from 'react';
import { Agent, GeneratedImage } from '@/types/agent';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Download, Copy, ImagePlus } from 'lucide-react';

interface ImageGeneratorProps {
  agent: Agent;
}

export default function ImageGenerator({ agent }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);

  const { data: images = [], refetch } = trpc.agents.getGeneratedImages.useQuery(undefined, {
    enabled: !!agent,
  });

  const createImageMutation = trpc.agents.createGeneratedImage.useMutation();

  const handleSaveImage = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor, descreva a imagem');
      return;
    }

    if (!imageUrl.trim()) {
      toast.error('Por favor, informe a URL da imagem');
      return;
    }

    setIsSaving(true);
    try {
      const newImage: GeneratedImage = {
        id: Date.now(),
        agentId: agent.agentId,
        prompt,
        imageUrl,
        storageKey: null,
        createdAt: new Date(),
      };

      setGeneratedImage(newImage);

      await createImageMutation.mutateAsync({
        prompt,
        imageUrl,
        storageKey: undefined,
      });

      await refetch();
      toast.success('Imagem salva na galeria do agente');
    } catch (error) {
      toast.error('Erro ao salvar imagem');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async (targetUrl: string) => {
    try {
      const response = await fetch(targetUrl);
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImagePlus className="w-5 h-5" />
            Registrar Imagem do Agente
          </CardTitle>
          <CardDescription>
            Enquanto a geração visual nativa do backend é finalizada, você já pode salvar na galeria imagens geradas externamente com seu prompt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prompt">Descrição / Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Ex: Uma peça promocional moderna para ${agent.specialization}`}
              rows={4}
              className="mt-1 resize-none"
            />
          </div>

          <div>
            <Label htmlFor="imageUrl">URL da Imagem</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemplo.com/imagem-gerada.png"
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleSaveImage}
            disabled={isSaving || !prompt.trim() || !imageUrl.trim()}
            className="w-full gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSaving ? 'Salvando...' : 'Salvar Imagem na Galeria'}
          </Button>
        </CardContent>
      </Card>

      {generatedImage && (
        <Card>
          <CardHeader>
            <CardTitle>Pré-visualização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <img
              src={generatedImage.imageUrl}
              alt={generatedImage.prompt}
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

      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Galeria de Imagens</CardTitle>
            <CardDescription>Histórico persistido das imagens do agente</CardDescription>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado atual da feature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>✓ Removido o placeholder automático que simulava geração visual</p>
          <p>✓ Mantida a persistência real da galeria via <code>agents.createGeneratedImage</code></p>
          <p>✓ Fluxo agora registra apenas imagens reais fornecidas pelo usuário</p>
        </CardContent>
      </Card>
    </div>
  );
}
