import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Package, CheckCircle2, Clock, AlertCircle, Truck, Home } from 'lucide-react';

const STATUS_ORDER = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'] as const;

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  pending: { icon: <Clock className="w-6 h-6" />, label: 'Pendente', color: 'text-yellow-600' },
  confirmed: { icon: <CheckCircle2 className="w-6 h-6" />, label: 'Confirmado', color: 'text-blue-600' },
  shipped: { icon: <Truck className="w-6 h-6" />, label: 'Enviado', color: 'text-purple-600' },
  delivered: { icon: <Home className="w-6 h-6" />, label: 'Entregue', color: 'text-green-600' },
  cancelled: { icon: <AlertCircle className="w-6 h-6" />, label: 'Cancelado', color: 'text-red-600' },
  refunded: { icon: <AlertCircle className="w-6 h-6" />, label: 'Reembolsado', color: 'text-orange-600' },
};

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const [, navigate] = useLocation();

  const { data: order, isLoading } = trpc.dropshipping.getOrderDetails.useQuery(
    { orderId: parseInt(orderId || '0') },
    { enabled: !!orderId }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/dropshipping')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Card>
          <CardContent className="text-center py-12 text-slate-500">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Pedido não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(order.status as any);
  const completedStatuses = STATUS_ORDER.slice(0, currentStatusIndex + 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/dropshipping')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Rastreamento do Pedido</h1>
          <p className="text-slate-600">Pedido #{order.id} - {order.externalOrderId}</p>
        </div>
      </div>

      {/* Current Status Card */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className={`${STATUS_CONFIG[order.status].color}`}>
              {STATUS_CONFIG[order.status].icon}
            </div>
            <div>
              <p className="text-sm text-slate-600">Status Atual</p>
              <h2 className="text-2xl font-bold text-slate-900">
                {STATUS_CONFIG[order.status].label}
              </h2>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Atualizações</CardTitle>
          <CardDescription>Acompanhe todas as mudanças de status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {STATUS_ORDER.map((status, index) => {
              const isCompleted = completedStatuses.includes(status);
              const isCurrent = status === order.status;
              const historyEntry = order.statusHistory?.find(h => h.newStatus === status);

              return (
                <div key={status} className="flex gap-4">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-green-100 text-green-700'
                          : isCurrent
                          ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        STATUS_CONFIG[status].icon
                      )}
                    </div>
                    {index < STATUS_ORDER.length - 1 && (
                      <div
                        className={`w-1 h-12 ${
                          isCompleted ? 'bg-green-300' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>

                  {/* Status Info */}
                  <div className="pb-6">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {STATUS_CONFIG[status].label}
                      </h3>
                      {isCurrent && (
                        <Badge className="bg-blue-100 text-blue-800">Atual</Badge>
                      )}
                      {isCompleted && !isCurrent && (
                        <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                      )}
                    </div>
                    {historyEntry && (
                      <p className="text-sm text-slate-600 mt-1">
                        {new Date(historyEntry.changedAt).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Nome</p>
              <p className="font-semibold text-slate-900">{order.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Email</p>
              <p className="font-semibold text-slate-900">{order.customerEmail}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Endereço de Entrega</p>
              <p className="font-semibold text-slate-900 whitespace-pre-wrap">
                {order.shippingAddress}
              </p>
            </div>
            {order.trackingNumber && (
              <div>
                <p className="text-sm text-slate-600">Número de Rastreamento</p>
                <p className="font-semibold text-slate-900">{order.trackingNumber}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.product ? (
              <>
                {order.product.imageUrl && (
                  <div className="w-full h-32 bg-slate-100 rounded overflow-hidden">
                    <img
                      src={order.product.imageUrl}
                      alt={order.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-600">Produto</p>
                  <p className="font-semibold text-slate-900">{order.product.title}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Preço</p>
                  <p className="font-semibold text-slate-900">R$ {order.product.price.toFixed(2)}</p>
                </div>
              </>
            ) : (
              <p className="text-slate-500">Produto não disponível</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-slate-600">Valor do Pedido:</span>
              <span className="font-semibold text-slate-900">R$ {order.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-slate-600">Comissão:</span>
              <span className="font-semibold text-green-600">R$ {order.commissionAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Marketplace:</span>
              <Badge variant="outline">{order.marketplace}</Badge>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <span className="text-slate-600">Data de Criação:</span>
              <span className="font-semibold text-slate-900">
                {new Date(order.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
