import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ExternalLink, Copy, TrendingUp, Loader2, Star, Zap } from 'lucide-react';

const MARKETPLACES = ['Mercado Livre', 'Shopee', 'Hotmart'] as const;

type Marketplace = typeof MARKETPLACES[number];

export default function TrendingProducts() {
  const [selectedMarketplace, setSelectedMarketplace] = useState<Marketplace>('Mercado Livre');

  const { data: trendingProducts = [], isLoading } = trpc.marketplaces.getTrendingProducts.useQuery(
    {
      marketplace: selectedMarketplace,
      limit: 20,
    },
    { enabled: true }
  );

  const handleCopyLink = (url: string, productName: string) => {
    navigator.clipboard.writeText(url);
    toast.success(`Link de ${productName} copiado!`);
  };

  const getDemandColor = (level: string | null | undefined) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompetitionColor = (level: string | null | undefined) => {
    switch (level) {
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMarketplaceIcon = (marketplace: string) => {
    switch (marketplace) {
      case 'Mercado Livre':
        return '🔵';
      case 'Shopee':
        return '🔴';
      case 'Hotmart':
        return '💜';
      default:
        return '📦';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Produtos em Tendência</CardTitle>
              <CardDescription>
                Veja quais produtos estão em alta nos principais marketplaces
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Marketplace Tabs */}
      <Tabs value={selectedMarketplace} onValueChange={(value) => setSelectedMarketplace(value as Marketplace)}>
        <TabsList className="grid w-full grid-cols-3">
          {MARKETPLACES.map((marketplace) => (
            <TabsTrigger key={marketplace} value={marketplace}>
              <span className="mr-2">{getMarketplaceIcon(marketplace)}</span>
              {marketplace}
            </TabsTrigger>
          ))}
        </TabsList>

        {MARKETPLACES.map((marketplace) => (
          <TabsContent key={marketplace} value={marketplace} className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </CardContent>
              </Card>
            ) : trendingProducts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-slate-500">
                  <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum produto em tendência no momento</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {trendingProducts.map((product, index) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Ranking Badge */}
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center">
                            #{index + 1}
                          </div>
                        </div>

                        {/* Product Image */}
                        {product.imageUrl && (
                          <div className="w-20 h-20 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 line-clamp-2">
                            {product.title}
                          </h3>

                          {/* Metrics */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              <Zap className="w-3 h-3 mr-1" />
                              Score: {product.trendingScore}
                            </Badge>
                            <Badge className={`text-xs ${getDemandColor(product.demandLevel)}`}>
                              Demanda: {product.demandLevel}
                            </Badge>
                            <Badge className={`text-xs ${getCompetitionColor(product.competitionLevel)}`}>
                              Concorrência: {product.competitionLevel}
                            </Badge>
                          </div>

                          {/* Price and Rating */}
                          <div className="flex items-center justify-between mt-3 text-sm">
                            <div className="space-x-3">
                              <span className="text-slate-600">
                                R$ {product.price.toFixed(2)}
                              </span>
                              <span className="text-slate-600">
                                <Star className="w-4 h-4 inline fill-yellow-400 text-yellow-400" />
                                {product.rating}
                              </span>
                              <span className="text-slate-600">
                                {product.sales} vendas
                              </span>
                            </div>
                            <span className="font-semibold text-green-600">
                              {product.commissionPercentage}% comissão
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(product.url, product.title)}
                            title="Copiar link"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => window.open(product.url, '_blank')}
                            title="Abrir produto"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>💡 Dica:</strong> Os produtos em tendência têm maior demanda e potencial de conversão. 
            Foque em produtos com alta demanda e baixa concorrência para maximizar seus ganhos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
