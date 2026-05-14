import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";

interface Product {
  id: number;
  title: string;
  price: number;
  commission: number;
  trend: "up" | "down" | "stable";
  marketplace: "mercado-livre" | "shopee" | "hotmart";
  isFavorite: boolean;
}

export default function MarketplaceScreen() {
  const [selectedMarketplace, setSelectedMarketplace] = useState("all");
  const [favorites, setFavorites] = useState<number[]>([]);

  const products: Product[] = [
    {
      id: 1,
      title: "Curso de React Native",
      price: 199.90,
      commission: 59.97,
      trend: "up",
      marketplace: "hotmart",
      isFavorite: false,
    },
    {
      id: 2,
      title: "Produto Eletrônico A",
      price: 299.90,
      commission: 29.99,
      trend: "stable",
      marketplace: "mercado-livre",
      isFavorite: false,
    },
    {
      id: 3,
      title: "Livro Digital",
      price: 49.90,
      commission: 14.97,
      trend: "down",
      marketplace: "shopee",
      isFavorite: false,
    },
    {
      id: 4,
      title: "Produto Eletrônico B",
      price: 450.00,
      commission: 90.00,
      trend: "up",
      marketplace: "mercado-livre",
      isFavorite: false,
    },
  ];

  const filteredProducts = products.filter(
    (p) => selectedMarketplace === "all" || p.marketplace === selectedMarketplace
  );

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "📈";
      case "down":
        return "📉";
      default:
        return "➡️";
    }
  };

  const getMarketplaceLabel = (marketplace: string) => {
    switch (marketplace) {
      case "mercado-livre":
        return "Mercado Livre";
      case "shopee":
        return "Shopee";
      case "hotmart":
        return "Hotmart";
      default:
        return marketplace;
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6 pb-6">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Marketplace</Text>
            <Text className="text-sm text-muted">Explore produtos disponíveis</Text>
          </View>

          {/* Filtro por Marketplace */}
          <View className="gap-3">
            <Text className="text-sm font-medium text-muted">Filtrar por Marketplace</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
              {[
                { id: "all", label: "Todos" },
                { id: "mercado-livre", label: "Mercado Livre" },
                { id: "shopee", label: "Shopee" },
                { id: "hotmart", label: "Hotmart" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setSelectedMarketplace(opt.id)}
                  className={`rounded-full py-2 px-4 active:opacity-70 ${
                    selectedMarketplace === opt.id
                      ? "bg-primary"
                      : "bg-surface border border-border"
                  }`}
                >
                  <Text
                    className={`font-semibold text-sm ${
                      selectedMarketplace === opt.id ? "text-white" : "text-foreground"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Produtos */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Produtos ({filteredProducts.length})
            </Text>

            {filteredProducts.map((product) => (
              <View
                key={product.id}
                className="bg-surface rounded-lg p-4 border border-border gap-3"
              >
                {/* Header do Produto */}
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      {product.title}
                    </Text>
                    <View className="flex-row gap-2 mt-2 items-center">
                      <View className="bg-muted/20 rounded px-2 py-1">
                        <Text className="text-xs text-muted font-medium">
                          {getMarketplaceLabel(product.marketplace)}
                        </Text>
                      </View>
                      <Text className="text-lg">{getTrendIcon(product.trend)}</Text>
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

                {/* Preço e Comissão */}
                <View className="border-t border-border pt-3 gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-muted">Preço</Text>
                    <Text className="text-sm font-bold text-foreground">
                      R$ {product.price.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-muted">Sua Comissão</Text>
                    <Text className="text-sm font-bold text-primary">
                      R$ {product.commission.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Botões */}
                <View className="flex-row gap-2 pt-2">
                  <TouchableOpacity className="flex-1 bg-primary/10 rounded-lg py-2 px-3 active:opacity-70">
                    <Text className="text-primary font-semibold text-center text-sm">
                      Detalhes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 bg-primary rounded-lg py-2 px-3 active:opacity-70">
                    <Text className="text-white font-semibold text-center text-sm">
                      Compartilhar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
