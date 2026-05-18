import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ExternalLink, Copy, TrendingUp, Loader2, Star, Zap, ShoppingCart } from 'lucide-react';

const MARKETPLACE_CATEGORIES = [
  { id: 'all', label: 'Todos', icon: '📦' },
  { id: 'mercado_libre', label: 'Mercado Livre', icon: '🔵' },
  { id: 'shopee', label: 'Shopee', icon: '🔴' },
  { id: 'hotmart', label: 'Hotmart', icon: '💜' },
] as const;

type MarketplaceCategory = typeof MARKETPLACE_CATEGORIES[number]['id'];

export default function TrendingProducts() {
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory>('all');

  const { data: trendingProducts = [], isLoading } = trpc.marketplaces.getTrendingProducts.useQuery(
    {
      days: 7,
      limit: 20,
    },
    { enabled: true }
  );

  // Filter products by marketplace if a specific one is selected
  const filteredProducts = selectedCategory === 'all'
    ? trendingProducts
    : trendingProducts.filter(p => p.marketplace === selectedCategory);

  const handleCopyLink = (productUrl: string | undefined, productName: string) => {
    if (productUrl) {
      navigator.clipboard.writeText(productUrl);
      toast.success(`Link de ${productName} copiado!`);
    } else {
      toast.error('URL do produto não disponível');
    }
  };

  const getMarketplaceIcon = (marketplace: string) => {
    const cat = MARKETPLACE_CATEGORIES.find(c => c.id === marketplace);
    return cat?.icon || '📦';
  };

  const getMarketplaceName = (marketplace: string) => {
    const cat = MARKETPLACE_CATEGORIES.find(c => c.id === marketplace);
    return cat?.label || marketplace;
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
      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as MarketplaceCategory)}>
        <TabsList className="grid w-full grid-cols-4">
          {MARKETPLACE_CATEGORIES.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </CardContent>
            </Card>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-slate-500">
                <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum produto em tendência no momento</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product, index) => (
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
                            alt={product.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 line-clamp-2">
                          {product.productName}
                        </h3>

                        {/* Marketplace Badge */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            <span className="mr-1">{getMarketplaceIcon(product.marketplace)}</span>
                            {getMarketplaceName(product.marketplace)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            {product.sales} vendas
                          </Badge>
                        </div>

                        {/* Price and Rating */}
                        <div className="flex items-center justify-between mt-3 text-sm">
                          <div className="space-x-3">
                            <span className="text-slate-600 font-medium">
                              R$ {product.price.toFixed(2)}
                            </span>
                            <span className="text-slate-600">
                              <Star className="w-4 h-4 inline fill-yellow-400 text-yellow-400" />
                              {product.rating?.toFixed(1) || '0.0'}
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
                          onClick={() => handleCopyLink(product.productUrl, product.productName)}
                          title="Copiar link"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            toast.success('Link de afiliado copiado! Use o link para promover este produto.');
                            navigator.clipboard.writeText(product.productUrl || `https://marketplace.com/product/${product.id}`);
                          }}
                          title="Gerar link de afiliado"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>Dica:</strong> Os produtos em tendência têm maior demanda e potencial de conversão.
            Use os links de afiliado para promover produtos e earn commission on every sale.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}