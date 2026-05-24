import {
  ActivityIndicator,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useMemo, useState } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

type Product = {
  id: number;
  title: string;
  price: number;
  commissionPercentage: number;
  marketplace: string;
  imageUrl?: string | null;
  url?: string | null;
};

export default function MarketplaceScreen() {
  const colors = useColors();
  const [selectedMarketplace, setSelectedMarketplace] = useState("all");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: trendingProducts = [],
    isLoading,
    refetch,
  } = trpc.mmn.getTrendingProducts.useQuery();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const products = useMemo<Product[]>(
    () =>
      trendingProducts.map((product: any) => ({
        id: Number(product.id),
        title: String(product.title ?? `Produto ${product.id}`),
        price: Number(product.price ?? 0),
        commissionPercentage: Number(product.commissionPercentage ?? 0),
        marketplace: String(product.marketplace ?? "outros"),
        imageUrl: product.imageUrl ?? null,
        url: product.url ?? null,
      })),
    [trendingProducts],
  );

  const marketplaceOptions = useMemo(() => {
    const dynamic = [
      ...new Set(products.map((product) => product.marketplace)),
    ];
    return ["all", ...dynamic];
  }, [products]);

  const filteredProducts = products.filter(
    (product) =>
      selectedMarketplace === "all" ||
      product.marketplace === selectedMarketplace,
  );

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id],
    );
  };

  const getMarketplaceLabel = (marketplace: string) => {
    if (marketplace === "mercado-livre" || marketplace === "mercado_libre")
      return "Mercado Livre";
    if (marketplace === "shopee") return "Shopee";
    if (marketplace === "hotmart") return "Hotmart";
    return marketplace.replace(/-/g, " ");
  };

  const getTrendIcon = (commissionPercentage: number) => {
    if (commissionPercentage >= 25) return "📈";
    if (commissionPercentage <= 10) return "➡️";
    return "⚡";
  };

  const openProduct = async (url?: string | null) => {
    if (!url) return;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const shareProduct = async (product: Product) => {
    await Share.share({
      message: `${product.title}\n${product.url ?? "Link indisponível"}`,
    });
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="gap-6 pb-6">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              Marketplace
            </Text>
            <Text className="text-sm text-muted">
              Produtos em tendência conectados ao backend
            </Text>
          </View>

          <View className="gap-3">
            <Text className="text-sm font-medium text-muted">
              Filtrar por Marketplace
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {marketplaceOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setSelectedMarketplace(option)}
                    className={`rounded-full py-2 px-4 active:opacity-70 ${
                      selectedMarketplace === option
                        ? "bg-primary"
                        : "bg-surface border border-border"
                    }`}
                  >
                    <Text
                      className={`font-semibold text-sm ${selectedMarketplace === option ? "text-white" : "text-foreground"}`}
                    >
                      {option === "all" ? "Todos" : getMarketplaceLabel(option)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Produtos ({filteredProducts.length})
            </Text>

            {isLoading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <View
                  key={product.id}
                  className="bg-surface rounded-lg p-4 border border-border gap-3"
                >
                  <View className="flex-row justify-between items-start gap-3">
                    {product.imageUrl ? (
                      <Image
                        source={{ uri: product.imageUrl }}
                        style={{ width: 80, height: 80, borderRadius: 12 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-20 h-20 rounded-lg bg-border items-center justify-center">
                        <Text className="text-2xl">📦</Text>
                      </View>
                    )}

                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">
                        {product.title}
                      </Text>
                      <View className="flex-row gap-2 mt-2 items-center flex-wrap">
                        <View className="bg-muted/20 rounded px-2 py-1">
                          <Text className="text-xs text-muted font-medium">
                            {getMarketplaceLabel(product.marketplace)}
                          </Text>
                        </View>
                        <Text className="text-lg">
                          {getTrendIcon(product.commissionPercentage)}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => toggleFavorite(product.id)}
                      className="active:opacity-70"
                    >
                      <Text className="text-2xl">
                        {favorites.includes(product.id) ? "❤️" : "🤍"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className="border-t border-border pt-3 gap-2">
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">Preço</Text>
                      <Text className="text-sm font-bold text-foreground">
                        R$ {product.price.toFixed(2)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">Comissão</Text>
                      <Text className="text-sm font-bold text-primary">
                        {product.commissionPercentage}%
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2 pt-2">
                    <TouchableOpacity
                      onPress={() => openProduct(product.url)}
                      className="flex-1 bg-primary/10 rounded-lg py-2 px-3 active:opacity-70"
                    >
                      <Text className="text-primary font-semibold text-center text-sm">
                        Detalhes
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => shareProduct(product)}
                      className="flex-1 bg-primary rounded-lg py-2 px-3 active:opacity-70"
                    >
                      <Text className="text-white font-semibold text-center text-sm">
                        Compartilhar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View className="py-8 items-center bg-surface rounded-xl border border-border">
                <Text className="text-muted">
                  Nenhum produto em tendência disponível no momento.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
