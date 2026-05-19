import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Zap, CheckCircle, Lock } from "lucide-react";
import { toast } from "sonner";

export default function UpgradesManagement() {
  const { user, loading: authLoading } = useAuth();
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);

  // Get available upgrades
  const { data: availableUpgrades, isLoading: availableLoading } = trpc.upgrades.listAvailable.useQuery();

  // Get active upgrades
  const { data: activeUpgrades, isLoading: activeLoading, refetch: refetchActive } = trpc.upgrades.listActive.useQuery(undefined, {
    enabled: !!user,
  });

  // Activate upgrade mutation
  const { mutate: activateUpgrade } = trpc.upgrades.activateUpgrade.useMutation({
    onSuccess: () => {
      toast.success("Upgrade activated successfully");
      refetchActive();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to activate upgrade");
    },
    onSettled: () => {
      setActivatingId(null);
    },
  });

  // Deactivate upgrade mutation
  const { mutate: deactivateUpgrade } = trpc.upgrades.deactivateUpgrade.useMutation({
    onSuccess: () => {
      toast.success("Upgrade deactivated successfully");
      refetchActive();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to deactivate upgrade");
    },
    onSettled: () => {
      setDeactivatingId(null);
    },
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to manage upgrades.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isActive = (upgradeId: number) => {
    return activeUpgrades?.some((au) => au.upgradeId === upgradeId);
  };

  const categoryColors: Record<string, string> = {
    copywriting: "bg-purple-100 text-purple-800",
    sentiment: "bg-blue-100 text-blue-800",
    automation: "bg-green-100 text-green-800",
    marketplace: "bg-orange-100 text-orange-800",
    prediction: "bg-pink-100 text-pink-800",
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Upgrades Management</h1>
        <p className="text-gray-600">Manage your AI agent upgrades and features</p>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">Available Upgrades</TabsTrigger>
          <TabsTrigger value="active">Active Upgrades</TabsTrigger>
        </TabsList>

        {/* Available Upgrades Tab */}
        <TabsContent value="available" className="space-y-4">
          {availableLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : availableUpgrades && availableUpgrades.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableUpgrades.map((upgrade) => (
                <Card key={upgrade.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{upgrade.name}</CardTitle>
                        <CardDescription className="mt-1">{upgrade.description}</CardDescription>
                      </div>
                      <Badge className={categoryColors[upgrade.category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800"}>
                        {upgrade.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="text-2xl font-bold">R$ {(upgrade.price / 100).toFixed(2)}</p>
                    </div>

                    {isActive(upgrade.id) ? (
                      <Button disabled className="w-full">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Active
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setActivatingId(upgrade.id);
                          activateUpgrade({ upgradeId: upgrade.id });
                        }}
                        disabled={activatingId === upgrade.id}
                        className="w-full"
                      >
                        {activatingId === upgrade.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Activating...
                          </>
                        ) : (
                          <>
                            <Zap className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Lock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-600">No upgrades available at this time</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Active Upgrades Tab */}
        <TabsContent value="active" className="space-y-4">
          {activeLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : activeUpgrades && activeUpgrades.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeUpgrades.map((agentUpgrade) => (
                <Card key={agentUpgrade.id} className="flex flex-col border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{agentUpgrade.upgrade.name}</CardTitle>
                        <CardDescription className="mt-1">{agentUpgrade.upgrade.description}</CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <Badge className={categoryColors[agentUpgrade.upgrade.category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800"}>
                        {agentUpgrade.upgrade.category}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Activated</p>
                      <p className="text-sm">{new Date(agentUpgrade.activatedAt).toLocaleDateString()}</p>
                    </div>

                    {agentUpgrade.expiresAt && (
                      <div>
                        <p className="text-sm text-gray-600">Expires</p>
                        <p className="text-sm">{new Date(agentUpgrade.expiresAt).toLocaleDateString()}</p>
                      </div>
                    )}

                    <Button
                      variant="destructive"
                      onClick={() => {
                        setDeactivatingId(agentUpgrade.id);
                        deactivateUpgrade({ agentUpgradeId: agentUpgrade.id });
                      }}
                      disabled={deactivatingId === agentUpgrade.id}
                      className="w-full"
                    >
                      {deactivatingId === agentUpgrade.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deactivating...
                        </>
                      ) : (
                        "Deactivate"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-600">No active upgrades. Activate one from the Available Upgrades tab.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
