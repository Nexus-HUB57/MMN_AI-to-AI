import { useState } from 'react';
import { Agent, RecommendedProduct } from '@/types/agent';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, ExternalLink, ShoppingBag } from 'lucide-react';

interface RecommendedProductsProps {
  agent: Agent;
}

export default function RecommendedProducts({ agent }: RecommendedProductsProps) {
  const [formData, setFormData] = useState({
    productName: '',
    productUrl: '',
    affiliateLink: '',
    relevanceScore: '85',
    marketplace: 'mercado-livre',
    price: '',
    commission: '',
    description: '',
    imageUrl: '',
  });

  const { data: products = [], refetch } = trpc.agents.getRecommendedProducts.useQuery(undefined, {
    enabled: !!agent,
  });

  const createMutation = trpc.agents.createRecommendedProduct.useMutation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productName.trim() || !formData.affiliateLink.trim()) {
      toast.error('Por favor, preencha os campos obrigatórios');
      return;
    }

    try {
      await createMutation.mutateAsync({
        productName: formData.productName,
        productUrl: formData.productUrl,
        affiliateLink: formData.affiliateLink,
        relevanceScore: parseFloat(formData.relevanceScore),
        marketplace: formData.marketplace,
        price: formData.price ? parseFloat(formData.price) : undefined,
        commission: formData.commission ? parseFloat(formData.commission) : undefined,
        description: formData.description || undefined,
        imageUrl: formData.imageUrl || undefined,
      });

      setFormData({
        productName: '',
        productUrl: '',
        affiliateLink: '',
        relevanceScore: '85',
        marketplace: 'mercado-livre',
        price: '',
        commission: '',
        description: '',
        imageUrl: '',
      });

      await refetch();
      toast.success('Produto adicionado com sucesso');
    } catch (error) {
      toast.error('Erro ao adicionar produto');
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Add Product Form */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Produto Recomendado</CardTitle>
          <CardDescription>
            Adicione produtos para recomendar aos seus clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Product Name */}
              <div>
                <Label htmlFor="productName">Nome do Produto *</Label>
                <Input
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  placeholder="Ex: Notebook XYZ"
                  className="mt-1"
                />
              </div>

              {/* Marketplace */}
              <div>
                <Label htmlFor="marketplace">Marketplace</Label>
                <Input
                  id="marketplace"
                  name="marketplace"
                  value={formData.marketplace}
                  onChange={handleInputChange}
                  placeholder="Ex: mercado-livre"
                  className="mt-1"
                />
              </div>
            </div>

            {/* URLs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productUrl">URL do Produto</Label>
                <Input
                  id="productUrl"
                  name="productUrl"
                  value={formData.productUrl}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="affiliateLink">Link de Afiliado *</Label>
                <Input
                  id="affiliateLink"
                  name="affiliateLink"
                  value={formData.affiliateLink}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
            </div>

            {/* Scores and Prices */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="relevanceScore">Score de Relevância (0-100)</Label>
                <Input
                  id="relevanceScore"
                  name="relevanceScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.relevanceScore}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="price">Preço</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="commission">Comissão (%)</Label>
                <Input
                  id="commission"
                  name="commission"
                  type="number"
                  step="0.01"
                  value={formData.commission}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva o produto..."
                rows={3}
                className="mt-1 resize-none"
              />
            </div>

            {/* Image URL */}
            <div>
              <Label htmlFor="imageUrl">URL da Imagem</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://..."
                className="mt-1"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full gap-2"
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Adicionar Produto
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Recomendados</CardTitle>
          <CardDescription>Produtos que seu agente está recomendando</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum produto recomendado ainda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border border-slate-200 rounded-lg p-4 space-y-3"
                >
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.productName}
                      className="w-full h-32 object-cover rounded"
                    />
                  )}

                  <div>
                    <h3 className="font-semibold text-slate-900">{product.productName}</h3>
                    <p className="text-sm text-slate-600 mt-1">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={getRelevanceColor(parseFloat(product.relevanceScore.toString()))}>
                      Score: {product.relevanceScore}
                    </Badge>
                    <Badge variant="outline">{product.marketplace}</Badge>
                  </div>

                  {product.price && (
                    <div className="text-sm">
                      <span className="text-slate-600">Preço: </span>
                      <span className="font-semibold">R$ {parseFloat(product.price.toString()).toFixed(2)}</span>
                    </div>
                  )}

                  {product.commission && (
                    <div className="text-sm">
                      <span className="text-slate-600">Comissão: </span>
                      <span className="font-semibold">{product.commission}%</span>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => window.open(product.affiliateLink, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visitar Link de Afiliado
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
