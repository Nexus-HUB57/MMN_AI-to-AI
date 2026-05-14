import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from "react-native";
import { useState, useMemo } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

interface Affiliate {
  id: string;
  name: string;
  level: number;
  commission: number;
  expanded?: boolean;
  children?: Affiliate[];
}

export default function NetworkScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const { data: networkData, isLoading, refetch } = trpc.mmn.getNetworkTree.useQuery({});
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const affiliates = useMemo(() => {
    if (!networkData) return [];
    // Transformar dados do backend para o formato da árvore se necessário
    // Por enquanto assumimos que o backend retorna o formato esperado ou compatível
    return networkData as any as Affiliate[];
  }, [networkData]);

  const filterAffiliates = (items: Affiliate[], query: string): Affiliate[] => {
    if (!query) return items;
    return items
      .map((item) => {
        const filteredChildren = item.children ? filterAffiliates(item.children, query) : [];
        const matches = item.name.toLowerCase().includes(query.toLowerCase());
        if (matches || filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }
        return null;
      })
      .filter((item): item is Affiliate => item !== null);
  };

  const filteredData = filterAffiliates(affiliates, searchQuery);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderAffiliateTree = (items: Affiliate[], depth = 0) => {
    return items.map((affiliate) => (
      <View key={affiliate.id}>
        <TouchableOpacity
          className="bg-surface rounded-lg p-3 border border-border mb-2 active:opacity-70"
          style={{ marginLeft: depth * 16 }}
          onPress={() => affiliate.children && toggleExpand(affiliate.id)}
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                {affiliate.children && affiliate.children.length > 0 && (
                  <Text className="text-foreground font-bold">
                    {(expandedIds[affiliate.id] || searchQuery) ? "▼" : "▶"}
                  </Text>
                )}
                <View>
                  <Text className="text-sm font-semibold text-foreground">{affiliate.name}</Text>
                  <Text className="text-xs text-muted mt-1">Nível {affiliate.level}</Text>
                </View>
              </View>
            </View>
            <Text className="text-sm font-bold text-primary">R$ {affiliate.commission.toFixed(2)}</Text>
          </View>
        </TouchableOpacity>
        {((expandedIds[affiliate.id] || searchQuery) && affiliate.children) && renderAffiliateTree(affiliate.children, depth + 1)}     </View>
    ));
  };

  const totalDirects = affiliates[0]?.children?.length || 0;
  const totalIndirects = (affiliates[0]?.children || []).reduce(
    (sum, child) => sum + (child.children?.length || 0),
    0
  );

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="gap-4 pb-6">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Rede</Text>
            <Text className="text-sm text-muted">Visualize sua rede de afiliados</Text>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
              <Text className="text-xs text-muted">Diretos</Text>
              <Text className="text-2xl font-bold text-primary mt-1">{totalDirects}</Text>
            </View>
            <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
              <Text className="text-xs text-muted">Indiretos</Text>
              <Text className="text-2xl font-bold text-primary mt-1">{totalIndirects}</Text>
            </View>
          </View>

          <TouchableOpacity className="bg-primary rounded-lg py-3 px-4 active:opacity-80">
            <Text className="text-white font-semibold text-center">Compartilhar Link</Text>
          </TouchableOpacity>

          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Estrutura de Rede</Text>
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
                  <Text className="text-muted text-xs font-bold px-2">Limpar</Text>
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
