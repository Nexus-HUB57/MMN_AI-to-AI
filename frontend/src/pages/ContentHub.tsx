/**
 * IA Content Hub - Glassmorphism Futurista
 * Design: Interface para geração de conteúdo com IA
 * Componentes: Form inputs com glow, preview cards, tabs para diferentes tipos de conteúdo
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Sparkles, Copy, RefreshCw, Download, Share2, Zap, 
  Image as ImageIcon, Video, FileText, Loader2, CheckCircle 
} from "lucide-react";
import { toast } from "sonner";

type ContentType = "text" | "image" | "video";
type Platform = "instagram" | "tiktok" | "twitter" | "linkedin" | "blog";

export default function ContentHub() {
  const [contentType, setContentType] = useState<ContentType>("text");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("generator");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor, insira um prompt");
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockContent = `✨ Conteúdo Gerado para ${platform.toUpperCase()}\n\n${prompt}\n\n🚀 Otimizado para máxima conversão\n#IA #Marketing #${platform}`;
      setGeneratedContent(mockContent);
      toast.success("Conteúdo gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar conteúdo");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success("Conteúdo copiado!");
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `conteudo-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Arquivo baixado!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-cyan-500/20 bg-slate-950/40 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white font-mono">IA Content Hub</h1>
              <p className="text-slate-400 text-sm">Gere conteúdo otimizado com IA</p>
            </div>
          </div>
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 px-4 py-2">
            <Zap className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-cyan-500/20 rounded-lg p-1 mb-8">
            <TabsTrigger 
              value="generator"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-slate-950 rounded-md transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Gerador
            </TabsTrigger>
            <TabsTrigger 
              value="library"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-slate-950 rounded-md transition-all"
            >
              <FileText className="w-4 h-4 mr-2" />
              Biblioteca
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-slate-950 rounded-md transition-all"
            >
              <Zap className="w-4 h-4 mr-2" />
              Análise
            </TabsTrigger>
          </TabsList>

          {/* Generator Tab */}
          <TabsContent value="generator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Section */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass rounded-2xl p-6 border-cyan-500/20 space-y-6">
                  <div>
                    <label className="text-white font-semibold mb-3 block font-mono">Tipo de Conteúdo</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { type: "text" as ContentType, icon: FileText, label: "Texto" },
                        { type: "image" as ContentType, icon: ImageIcon, label: "Imagem" },
                        { type: "video" as ContentType, icon: Video, label: "Vídeo" },
                      ].map((item) => (
                        <button
                          key={item.type}
                          onClick={() => setContentType(item.type)}
                          className={`p-3 rounded-lg border transition-all ${
                            contentType === item.type
                              ? "bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-cyan-500/50"
                              : "bg-slate-900/30 border-cyan-500/10 hover:border-cyan-500/30"
                          }`}
                        >
                          <item.icon className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                          <p className="text-xs text-white font-semibold">{item.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-white font-semibold mb-3 block font-mono">Plataforma</label>
                    <Select value={platform} onValueChange={(value) => setPlatform(value as Platform)}>
                      <SelectTrigger className="bg-slate-900/50 border-cyan-500/20 text-white hover:border-cyan-500/50 transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-cyan-500/20">
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="twitter">Twitter/X</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="blog">Blog</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-white font-semibold mb-3 block font-mono">Seu Prompt</label>
                    <Textarea
                      placeholder="Descreva o conteúdo que deseja gerar..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="bg-slate-900/50 border-cyan-500/20 text-white placeholder:text-slate-500 min-h-[150px] resize-none hover:border-cyan-500/50 transition-all"
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-slate-950 font-semibold glow-cyan transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Gerar Conteúdo
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Preview Section */}
              <div className="lg:col-span-2">
                <div className="glass rounded-2xl p-6 border-cyan-500/20 min-h-[400px] flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white font-mono">Preview</h3>
                    {generatedContent && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopy}
                          className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copiar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleDownload}
                          className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Baixar
                        </Button>
                      </div>
                    )}
                  </div>

                  {generatedContent ? (
                    <div className="flex-1 bg-slate-900/30 rounded-lg p-4 border border-cyan-500/10 overflow-auto">
                      <p className="text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                        {generatedContent}
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <Sparkles className="w-12 h-12 text-cyan-500/30 mx-auto mb-4" />
                        <p className="text-slate-400 font-mono">
                          Seu conteúdo gerado aparecerá aqui
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="glass rounded-2xl p-6 border-cyan-500/20 hover:border-cyan-500/50 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Instagram</Badge>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-white font-semibold mb-3 line-clamp-2">
                    Post sobre promoção de produtos...
                  </p>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                    Conteúdo gerado há 2 dias com alta taxa de engajamento
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-slate-950 font-semibold">
                      Usar
                    </Button>
                    <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Conteúdo Gerado", value: "247", icon: FileText },
                { label: "Taxa de Engajamento", value: "8.4%", icon: Zap },
                { label: "Conversões", value: "1.234", icon: CheckCircle },
              ].map((stat, idx) => (
                <div key={idx} className="glass rounded-2xl p-6 border-cyan-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-slate-400 font-mono">{stat.label}</p>
                    <stat.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <p className="text-3xl font-bold text-white font-mono">{stat.value}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
