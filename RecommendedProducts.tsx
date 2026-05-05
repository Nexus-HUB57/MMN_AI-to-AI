import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

export default function RecommendedProducts() {
  const [recommendation, setRecommendation] = useState<"buy" | "hold" | "sell" | "avoid">("buy");

  const trendingQuery = trpc.marketplaces.getTrendingProducts.useQuery({
    days: 7,
    limit: 20,
  });

  const recommendedQuery = trpc.marketplaces.getRecommendedProducts.useQuery({
    limit: 20,
    minTrendingScore: 60,
  });

  const byRecommendationQuery = trpc.marketplaces.getProductsByRecommendation.useQuery({
    recommendation,
    limit: 20,
  });

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiada!");
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "buy":
        return "bg-green-100 text-green-800";
      case "hold":
        return "bg-yellow-100 text-yellow-800";
      case "sell":
        return "bg-orange-100 text-orange-800";
      case "avoid":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMarketplaceIcon = (marketplace: string) => {
    switch (marketplace) {
      case "mercado_libre":
        return "🟡";
      case "shopee":
        return "🔴";
      case "hotmart":
        return "🟠";
      default:
        return "📦";
    }
  };

  const ProductCard = ({ product }: { product: any }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gray-200 overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.productName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {getMarketplaceIcon(product.marketplace)}
          </div>
        )}
      </div>

      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm line-clamp-2">{product.productName}</h3>
            <span className="text-lg">{getMarketplaceIcon(product.marketplace)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">R$ {(product.price / 100).toFixed(2)}</span>
            <Badge variant="outline">{product.marketplace.replace("_", " ")}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <p className="font-semibold">Avaliação</p>
              <p>⭐ {(product.rating / 20).toFixed(1)}</p>
            </div>
            <div>
              <p className="font-semibold">Vendas</p>
              <p>{product.sales}</p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs font-semibold text-green-600">Comissão: {product.commissionPercentage}%</p>
          </div>

          {product.productUrl && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 mt-2"
              onClick={() => handleCopyUrl(product.productUrl)}
            >
              <Copy className="w-3 h-3" />
              Copiar Link
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Produtos Recomendados</h1>
        <p className="text-gray-600 mt-2">Descubra os melhores produtos para promover baseado em análise de tendências</p>
      </div>

      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trending">Em Tendência</TabsTrigger>
          <TabsTrigger value="recommended">Recomendados</TabsTrigger>
          <TabsTrigger value="by-recommendation">Por Recomendação</TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-4">
          {trendingQuery.isLoading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                <p className="mt-2 text-gray-600">Carregando produtos...</p>
              </CardContent>
            </Card>
          ) : trendingQuery.data && trendingQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingQuery.data.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">Nenhum produto em tendência encontrado</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommended" className="space-y-4">
          {recommendedQuery.isLoading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                <p className="mt-2 text-gray-600">Carregando produtos...</p>
              </CardContent>
            </Card>
          ) : recommendedQuery.data && recommendedQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedQuery.data.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">Nenhum produto recomendado encontrado</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="by-recommendation" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={recommendation === "buy" ? "default" : "outline"}
              onClick={() => setRecommendation("buy")}
              className="bg-green-600 hover:bg-green-700"
            >
              Comprar
            </Button>
            <Button
              variant={recommendation === "hold" ? "default" : "outline"}
              onClick={() => setRecommendation("hold")}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Manter
            </Button>
            <Button
              variant={recommendation === "sell" ? "default" : "outline"}
              onClick={() => setRecommendation("sell")}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Vender
            </Button>
            <Button
              variant={recommendation === "avoid" ? "default" : "outline"}
              onClick={() => setRecommendation("avoid")}
              className="bg-red-600 hover:bg-red-700"
            >
              Evitar
            </Button>
          </div>

          {byRecommendationQuery.isLoading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                <p className="mt-2 text-gray-600">Carregando produtos...</p>
              </CardContent>
            </Card>
          ) : byRecommendationQuery.data && byRecommendationQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {byRecommendationQuery.data.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">Nenhum produto com essa recomendação</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
