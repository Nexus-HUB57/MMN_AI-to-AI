import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";

interface Affiliate {
  id: string;
  name: string;
  level: number;
  commission: number;
  expanded?: boolean;
  children?: Affiliate[];
}

export default function NetworkScreen() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([
    {
      id: "1",
      name: "Você",
      level: 0,
      commission: 1250.50,
      expanded: true,
      children: [
        {
          id: "2",
          name: "Afiliado A",
          level: 1,
          commission: 450.00,
          expanded: false,
          children: [
            { id: "4", name: "Sub-afiliado A1", level: 2, commission: 150.00 },
            { id: "5", name: "Sub-afiliado A2", level: 2, commission: 200.00 },
          ],
        },
        {
          id: "3",
          name: "Afiliado B",
          level: 1,
          commission: 300.00,
          expanded: false,
          children: [
            { id: "6", name: "Sub-afiliado B1", level: 2, commission: 100.00 },
          ],
        },
      ],
    },
  ]);

  const toggleExpand = (id: string) => {
    const updateAffiliates = (items: Affiliate[]): Affiliate[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, expanded: !item.expanded };
        }
        if (item.children) {
          return { ...item, children: updateAffiliates(item.children) };
        }
        return item;
      });
    };
    setAffiliates(updateAffiliates(affiliates));
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
                    {affiliate.expanded ? "▼" : "▶"}
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
        {affiliate.expanded && affiliate.children && renderAffiliateTree(affiliate.children, depth + 1)}
      </View>
    ));
  };

  const totalDirects = affiliates[0]?.children?.length || 0;
  const totalIndirects = (affiliates[0]?.children || []).reduce(
    (sum, child) => sum + (child.children?.length || 0),
    0
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
            {renderAffiliateTree(affiliates)}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
