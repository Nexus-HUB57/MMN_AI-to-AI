import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Loader2, Package, Eye } from 'lucide-react';
import { useLocation } from 'wouter';

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'] as const;

export default function DropshippingOrders() {
  const [, navigate] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [formData, setFormData] = useState({
    productId: '',
    customerName: '',
    customerEmail: '',
    shippingAddress: '',
    quantity: '1',
  });

  const { data: orders = [], isLoading, refetch } = trpc.dropshipping.getMyOrders.useQuery(
    { limit: 50, status: selectedStatus as any },
    { enabled: true }
  );

  const registerOrderMutation = trpc.dropshipping.registerOrder.useMutation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId || !formData.customerName || !formData.customerEmail || !formData.shippingAddress) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      await registerOrderMutation.mutateAsync({
        productId: parseInt(formData.productId),
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        shippingAddress: formData.shippingAddress,
        quantity: parseInt(formData.quantity),
      });

      setFormData({
        productId: '',
        customerName: '',
        customerEmail: '',
        shippingAddress: '',
        quantity: '1',
      });
      setShowForm(false);
      await refetch();
      toast.success('Pedido registrado com sucesso!');
    } catch (error) {
      toast.error('Erro ao registrar pedido');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pedidos de Dropshipping</h1>
          <p className="text-slate-600 mt-1">Gerencie seus pedidos e acompanhe o status</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Pedido
        </Button>
      </div>

      {/* New Order Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Novo Pedido</CardTitle>
            <CardDescription>Preencha os dados do pedido de dropshipping</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product ID */}
                <div>
                  <Label htmlFor="productId">ID do Produto *</Label>
                  <Input
                    id="productId"
                    name="productId"
                    type="number"
                    value={formData.productId}
                    onChange={handleInputChange}
                    placeholder="Ex: 123"
                    className="mt-1"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <Label htmlFor="customerName">Nome do Cliente *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Ex: João Silva"
                  className="mt-1"
                />
              </div>

              {/* Customer Email */}
              <div>
                <Label htmlFor="customerEmail">Email do Cliente *</Label>
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  placeholder="Ex: joao@example.com"
                  className="mt-1"
                />
              </div>

              {/* Shipping Address */}
              <div>
                <Label htmlFor="shippingAddress">Endereço de Entrega *</Label>
                <Textarea
                  id="shippingAddress"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  placeholder="Rua, número, complemento, cidade, estado, CEP"
                  rows={3}
                  className="mt-1 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={registerOrderMutation.isPending}
                  className="flex-1 gap-2"
                >
                  {registerOrderMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Registrar Pedido
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedStatus === undefined ? 'default' : 'outline'}
              onClick={() => setSelectedStatus(undefined)}
              size="sm"
            >
              Todos
            </Button>
            {ORDER_STATUSES.map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                onClick={() => setSelectedStatus(status)}
                size="sm"
              >
                {getStatusLabel(status)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Meus Pedidos</CardTitle>
          <CardDescription>
            {orders.length} pedido{orders.length !== 1 ? 's' : ''} encontrado{orders.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum pedido encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">
                          Pedido #{order.id}
                        </h3>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Cliente:</span>
                          <p className="font-medium text-slate-900">{order.customerName}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Email:</span>
                          <p className="font-medium text-slate-900 truncate">{order.customerEmail}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Valor:</span>
                          <p className="font-medium text-slate-900">R$ {order.amount.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Comissão:</span>
                          <p className="font-medium text-green-600">R$ {order.commissionAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-slate-600">
                        <p>Criado em: {new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/order-tracking/${order.id}`)}
                      className="gap-2 flex-shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                      Rastrear
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
