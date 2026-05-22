import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useMemo, useState } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

type NetworkNode = {
  id: string;
  userId: number;
  sponsorId: number;
  level: number;
  children?: NetworkNode[];
};

function normalizeNode(item: any): NetworkNode {
  return {
    id: String(item.id ?? `${item.userId}-${item.sponsorId}`),
    userId: Number(item.userId ?? 0),
    sponsorId: Number(item.sponsorId ?? 0),
    level: Number(item.level ?? 1),
    children: [],
  };
}

export default function NetworkScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);

  const { data: profile } = trpc.mmn.getProfile.useQuery();
  const {
    data: directReferrals = [],
    isLoading: isLoadingDirects,
    refetch: refetchDirects,
  } = trpc.mmn.getDirectReferrals.useQuery();
  const {
    data: networkData = [],
    isLoading: isLoadingNetwork,
    refetch: refetchNetwork,
  } = trpc.mmn.getNetworkTree.useQuery();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchDirects(), refetchNetwork()]);
    setRefreshing(false);
  };

  const affiliates = useMemo(() => {
    const nodes = networkData.map(normalizeNode);
    const byUser = new Map<number, NetworkNode>();

    nodes.forEach((node) => byUser.set(node.userId, { ...node, children: [] }));

    const roots: NetworkNode[] = [];

    byUser.forEach((node) => {
      const parent = byUser.get(node.sponsorId);
      if (parent) {
        parent.children = [...(parent.children ?? []), node];
      } else if (node.level === 1) {
        roots.push(node);
      }
    });

    return roots.sort((a, b) => a.userId - b.userId);
  }, [networkData]);

  const filterAffiliates = (
    items: NetworkNode[],
    query: string,
  ): NetworkNode[] => {
    if (!query) return items;

    return items
      .map((item) => {
        const filteredChildren = item.children
          ? filterAffiliates(item.children, query)
          : [];
        const label = `Afiliado #${item.userId}`.toLowerCase();
        const matches = label.includes(query.toLowerCase());
        if (matches || filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean) as NetworkNode[];
  };

  const filteredData = filterAffiliates(affiliates, searchQuery);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderAffiliateTree = (items: NetworkNode[], depth = 0) => {
    return items.map((affiliate) => (
      <View key={affiliate.id}>
        <TouchableOpacity
          className="bg-surface rounded-lg p-3 border border-border mb-2 active:opacity-70"
          style={{ marginLeft: depth * 16 }}
          onPress={() =>
            affiliate.children &&
            affiliate.children.length > 0 &&
            toggleExpand(affiliate.id)
          }
        >
          <View className="flex-row justify-between items-center gap-3">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                {affiliate.children && affiliate.children.length > 0 && (
                  <Text className="text-foreground font-bold">
                    {expandedIds[affiliate.id] || searchQuery ? "▼" : "▶"}
                  </Text>
                )}
                <View>
                  <Text className="text-sm font-semibold text-foreground">
                    Afiliado #{affiliate.userId}
                  </Text>
                  <Text className="text-xs text-muted mt-1">
                    Patrocinador #{affiliate.sponsorId} · Nível{" "}
                    {affiliate.level}
                  </Text>
                </View>
              </View>
            </View>
            <View className="bg-primary/10 rounded-lg px-3 py-2">
              <Text className="text-xs text-primary font-semibold">
                L{affiliate.level}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {(expandedIds[affiliate.id] || searchQuery) &&
        affiliate.children &&
        affiliate.children.length > 0
          ? renderAffiliateTree(affiliate.children, depth + 1)
          : null}
      </View>
    ));
  };

  const totalDirects = directReferrals.length;
  const totalNetwork = networkData.length;
  const deepestLevel = networkData.reduce(
    (max: number, item: any) => Math.max(max, Number(item.level ?? 0)),
    0,
  );
  const isLoading = isLoadingDirects || isLoadingNetwork;

  if (isLoading) {
    return (
      <ScreenContainer className="p-4 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Carregando rede...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="gap-4 pb-6">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Rede</Text>
            <Text className="text-sm text-muted">
              Estrutura derivada do grafo real de patrocinadores
            </Text>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
              <Text className="text-xs text-muted">Diretos</Text>
              <Text className="text-2xl font-bold text-primary mt-1">
                {totalDirects}
              </Text>
            </View>
            <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
              <Text className="text-xs text-muted">Rede Total</Text>
              <Text className="text-2xl font-bold text-primary mt-1">
                {totalNetwork}
              </Text>
            </View>
            <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
              <Text className="text-xs text-muted">Profundidade</Text>
              <Text className="text-2xl font-bold text-primary mt-1">
                {deepestLevel}
              </Text>
            </View>
          </View>

          <TouchableOpacity className="bg-primary rounded-lg py-3 px-4 active:opacity-80">
            <Text className="text-white font-semibold text-center">
              {profile?.affiliateCode
                ? `Código ${profile.affiliateCode}`
                : "Compartilhar Link"}
            </Text>
          </TouchableOpacity>

          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">
              Estrutura de Rede
            </Text>
            <View className="bg-surface rounded-lg px-3 py-2 border border-border flex-row items-center">
              <TextInput
                placeholder="Buscar afiliado..."
                placeholderTextColor="#999"
                className="flex-1 text-foreground py-1"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery !== "" && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Text className="text-muted text-xs font-bold px-2">
                    Limpar
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {filteredData.length > 0 ? (
              renderAffiliateTree(filteredData)
            ) : (
              <View className="py-8 items-center">
                <Text className="text-muted">Nenhum afiliado encontrado.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
