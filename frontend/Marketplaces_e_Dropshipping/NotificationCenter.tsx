import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Bell, Check, Trash2, Loader2, Package, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';

const NOTIFICATION_TYPES = [
  'new_dropshipping_order',
  'order_confirmation',
  'order_status_update',
  'commission_credited',
  'order_shipped',
  'order_delivered',
] as const;

const NOTIFICATION_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  new_dropshipping_order: {
    icon: <Package className="w-5 h-5" />,
    label: 'Novo Pedido',
    color: 'bg-blue-100 text-blue-800',
  },
  order_confirmation: {
    icon: <CheckCircle2 className="w-5 h-5" />,
    label: 'Confirmação',
    color: 'bg-green-100 text-green-800',
  },
  order_status_update: {
    icon: <AlertCircle className="w-5 h-5" />,
    label: 'Atualização',
    color: 'bg-yellow-100 text-yellow-800',
  },
  commission_credited: {
    icon: <DollarSign className="w-5 h-5" />,
    label: 'Comissão',
    color: 'bg-purple-100 text-purple-800',
  },
  order_shipped: {
    icon: <Package className="w-5 h-5" />,
    label: 'Enviado',
    color: 'bg-orange-100 text-orange-800',
  },
  order_delivered: {
    icon: <CheckCircle2 className="w-5 h-5" />,
    label: 'Entregue',
    color: 'bg-green-100 text-green-800',
  },
};

export default function NotificationCenter() {
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [selectedNotifications, setSelectedNotifications] = useState<Set<number>>(new Set());

  const { data: notifications = [], isLoading, refetch } = trpc.notifications.getMyNotifications.useQuery(
    { limit: 100, type: selectedType },
    { enabled: true }
  );

  const { data: unreadCount = { unreadCount: 0 } } = trpc.notifications.getUnreadCount.useQuery();

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();
  const markMultipleAsReadMutation = trpc.notifications.markMultipleAsRead.useMutation();

  // Auto-refetch unread count
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000); // Refetch every 5 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsReadMutation.mutateAsync({ notificationId });
      await refetch();
      toast.success('Notificação marcada como lida');
    } catch (error) {
      toast.error('Erro ao marcar notificação');
    }
  };

  const handleMarkMultipleAsRead = async () => {
    if (selectedNotifications.size === 0) {
      toast.error('Selecione notificações');
      return;
    }

    try {
      await markMultipleAsReadMutation.mutateAsync({
        notificationIds: Array.from(selectedNotifications),
      });
      setSelectedNotifications(new Set());
      await refetch();
      toast.success('Notificações marcadas como lidas');
    } catch (error) {
      toast.error('Erro ao marcar notificações');
    }
  };

  const toggleNotificationSelection = (notificationId: number) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Central de Notificações</h1>
          <p className="text-slate-600 mt-1">Acompanhe todos os eventos do seu negócio</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{unreadCount.unreadCount}</div>
          <p className="text-sm text-slate-600">não lidas</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="unread" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unread">
            <Bell className="w-4 h-4 mr-2" />
            Não Lidas ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Todas ({notifications.length})
          </TabsTrigger>
        </TabsList>

        {/* Unread Tab */}
        <TabsContent value="unread" className="space-y-4">
          {unreadNotifications.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  {selectedNotifications.size > 0 && (
                    <Button
                      onClick={handleMarkMultipleAsRead}
                      disabled={markMultipleAsReadMutation.isPending}
                      className="gap-2"
                      size="sm"
                    >
                      {markMultipleAsReadMutation.isPending && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      Marcar {selectedNotifications.size} como lida
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </CardContent>
            </Card>
          ) : unreadNotifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-slate-500">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação não lida</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {unreadNotifications.map((notification) => (
                <Card key={notification.id} className="border-l-4 border-l-blue-500 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification.id)}
                        onChange={() => toggleNotificationSelection(notification.id)}
                        className="mt-1"
                      />

                      {/* Icon and Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`p-2 rounded ${NOTIFICATION_CONFIG[notification.type]?.color || 'bg-gray-100'}`}>
                            {NOTIFICATION_CONFIG[notification.type]?.icon || <Bell className="w-5 h-5" />}
                          </div>
                          <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                          <Badge className="bg-blue-100 text-blue-800 text-xs">Novo</Badge>
                        </div>

                        {notification.content && (
                          <p className="text-sm text-slate-600 mt-2">{notification.content}</p>
                        )}

                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markAsReadMutation.isPending}
                          title="Marcar como lida"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* All Tab */}
        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </CardContent>
            </Card>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-slate-500">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* Unread Section */}
              {unreadNotifications.length > 0 && (
                <>
                  <h3 className="font-semibold text-slate-900 text-sm px-2">Não Lidas</h3>
                  {unreadNotifications.map((notification) => (
                    <Card key={notification.id} className="border-l-4 border-l-blue-500 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded ${NOTIFICATION_CONFIG[notification.type]?.color || 'bg-gray-100'}`}>
                            {NOTIFICATION_CONFIG[notification.type]?.icon || <Bell className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                            {notification.content && (
                              <p className="text-sm text-slate-600 mt-1">{notification.content}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-2">
                              {new Date(notification.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}

              {/* Read Section */}
              {readNotifications.length > 0 && (
                <>
                  <h3 className="font-semibold text-slate-900 text-sm px-2 mt-6">Lidas</h3>
                  {readNotifications.map((notification) => (
                    <Card key={notification.id} className="opacity-60">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded ${NOTIFICATION_CONFIG[notification.type]?.color || 'bg-gray-100'}`}>
                            {NOTIFICATION_CONFIG[notification.type]?.icon || <Bell className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                            {notification.content && (
                              <p className="text-sm text-slate-600 mt-1">{notification.content}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-2">
                              {new Date(notification.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
