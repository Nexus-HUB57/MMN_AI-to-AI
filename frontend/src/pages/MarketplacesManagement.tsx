import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function MarketplacesManagement() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [marketplace, setMarketplace] = useState<"mercado_libre" | "shopee" | "hotmart">("mercado_libre");
  const [accountName, setAccountName] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [apiKey, setApiKey] = useState("");

  const accountsQuery = trpc.marketplaces.getMarketplaceAccounts.useQuery();
  const connectMutation = trpc.marketplaces.connectMarketplace.useMutation();
  const disconnectMutation = trpc.marketplaces.disconnectMarketplace.useMutation();
  const syncMutation = trpc.marketplaces.syncProducts.useMutation();

  const handleConnect = async () => {
    if (!accountName || !accessToken) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setIsConnecting(true);
    try {
      await connectMutation.mutateAsync({
        marketplace,
        accountName,
        accessToken,
        refreshToken: refreshToken || undefined,
        apiKey: apiKey || undefined,
      });

      toast.success("Marketplace conectado com sucesso!");
      setAccountName("");
      setAccessToken("");
      setRefreshToken("");
      setApiKey("");
      accountsQuery.refetch();
    } catch (error) {
      toast.error("Erro ao conectar marketplace");
      console.error(error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (accountId: number) => {
    try {
      await disconnectMutation.mutateAsync({ accountId });
      toast.success("Marketplace desconectado");
      accountsQuery.refetch();
    } catch (error) {
      toast.error("Erro ao desconectar marketplace");
      console.error(error);
    }
  };

  const handleSync = async (accountId: number) => {
    try {
      await syncMutation.mutateAsync({ accountId });
      toast.success("Sincronização iniciada");
      accountsQuery.refetch();
    } catch (error) {
      toast.error("Erro ao sincronizar produtos");
      console.error(error);
    }
  };

  const getMarketplaceIcon = (mp: string) => {
    switch (mp) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "syncing":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Marketplaces</h1>
          <p className="text-gray-600 mt-2">Conecte suas contas de marketplace para sincronizar produtos</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Conectar Marketplace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Conectar Novo Marketplace</DialogTitle>
              <DialogDescription>Adicione uma nova conta de marketplace para sincronizar produtos</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Marketplace</Label>
                <Select value={marketplace} onValueChange={(value: any) => setMarketplace(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mercado_libre">Mercado Libre</SelectItem>
                    <SelectItem value="shopee">Shopee</SelectItem>
                    <SelectItem value="hotmart">Hotmart</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Nome da Conta</Label>
                <Input
                  placeholder="Ex: Minha Loja ML"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>

              <div>
                <Label>Access Token *</Label>
                <Input
                  placeholder="Cole seu token de acesso"
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
              </div>

              <div>
                <Label>Refresh Token (opcional)</Label>
                <Input
                  placeholder="Refresh token"
                  type="password"
                  value={refreshToken}
                  onChange={(e) => setRefreshToken(e.target.value)}
                />
              </div>

              <div>
                <Label>API Key (opcional)</Label>
                <Input
                  placeholder="Sua API Key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  "Conectar"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {accountsQuery.isLoading ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            <p className="mt-2 text-gray-600">Carregando contas...</p>
          </CardContent>
        </Card>
      ) : accountsQuery.data && accountsQuery.data.length > 0 ? (
        <div className="grid gap-4">
          {accountsQuery.data.map((account: any) => (
            <Card key={account.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getMarketplaceIcon(account.marketplace)}</span>
                    <div>
                      <CardTitle className="text-lg">{account.accountName}</CardTitle>
                      <CardDescription>{account.marketplace.replace("_", " ").toUpperCase()}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(account.syncStatus)}>{account.syncStatus}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold">{account.isActive ? "Ativo" : "Inativo"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Última Sincronização</p>
                    <p className="font-semibold">
                      {account.lastSyncAt
                        ? new Date(account.lastSyncAt).toLocaleDateString("pt-BR")
                        : "Nunca"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSync(account.id)}
                    disabled={syncMutation.isPending}
                    className="gap-2"
                  >
                    {syncMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Sincronizar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDisconnect(account.id)}
                    disabled={disconnectMutation.isPending}
                    className="gap-2"
                  >
                    {disconnectMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Desconectar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Nenhum marketplace conectado</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Conectar Primeiro Marketplace
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
