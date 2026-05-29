import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useThemeContext } from "@/lib/theme-provider";
import { trpc } from "@/lib/trpc";

export default function ProfileScreen() {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useThemeContext();
  const { user, logout, loading: isLoadingAuth } = useAuth();
  const { data: affiliateProfile, isLoading: isLoadingAffiliate } =
    trpc.mmn.getProfile.useQuery();

  const [notifications, setNotifications] = useState(true);

  const handleCopyLink = () => {
    if (affiliateProfile?.affiliateCode) {
      alert("Link de indicação copiado para a área de transferência!");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const isLoading = isLoadingAuth || isLoadingAffiliate;
  const darkMode = colorScheme === "dark";

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6 pb-6">
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Perfil</Text>
            <Text className="text-sm text-muted">
              Gerencie suas informações e preferências
            </Text>
          </View>

          <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
            <View className="items-center gap-2">
              <View className="w-16 h-16 bg-primary rounded-full items-center justify-center">
                <Text className="text-2xl font-bold text-white">
                  {typeof user?.name === 'string' && user.name.length > 0
                    ? user.name.charAt(0).toUpperCase()
                    : "?"}
                </Text>
              </View>
              {isLoading ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text className="text-xl font-bold text-foreground">
                  {typeof user?.name === 'string' ? user.name : "Usuário"}
                </Text>
              )}
            </View>

            <View className="gap-3 border-t border-border pt-4">
              <View>
                <Text className="text-xs font-medium text-muted mb-1">
                  Email
                </Text>
                {isLoading ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text className="text-sm text-foreground">
                    {typeof user?.email === 'string' ? user.email : "N/A"}
                  </Text>
                )}
              </View>
              <View>
                <Text className="text-xs font-medium text-muted mb-1">
                  Código de Afiliado
                </Text>
                {isLoading ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text className="text-sm text-foreground font-mono">
                    {affiliateProfile?.affiliateCode || "N/A"}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity className="bg-primary rounded-lg py-3 px-4 active:opacity-80">
              <Text className="text-white font-semibold text-center">
                Editar Perfil
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <Text className="text-sm font-medium text-muted">
              Link de Indicação
            </Text>
            <View className="bg-background rounded-lg p-3 border border-border">
              {isLoading ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text className="text-xs text-foreground font-mono">
                  {affiliateProfile?.affiliateCode
                    ? `https://mmn.ai/ref/${affiliateProfile.affiliateCode}`
                    : "N/A"}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={handleCopyLink}
              className="bg-primary/10 rounded-lg py-2 px-4 active:opacity-70"
            >
              <Text className="text-primary font-semibold text-center text-sm">
                Copiar Link
              </Text>
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Preferências
            </Text>

            <View className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground">
                  Notificações
                </Text>
                <Text className="text-xs text-muted mt-1">
                  Receber alertas de comissões
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#ccc", true: "#0a7ea4" }}
              />
            </View>

            <View className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground">
                  Tema Escuro
                </Text>
                <Text className="text-xs text-muted mt-1">
                  Alternar entre claro e escuro
                </Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={(enabled) =>
                  setColorScheme(enabled ? "dark" : "light")
                }
                trackColor={{ false: "#ccc", true: "#0a7ea4" }}
              />
            </View>
          </View>

          <View className="gap-3">
            <TouchableOpacity className="bg-surface rounded-lg py-3 px-4 border border-border active:opacity-70">
              <Text className="text-foreground font-semibold text-center">
                Sobre o App
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-surface rounded-lg py-3 px-4 border border-border active:opacity-70">
              <Text className="text-foreground font-semibold text-center">
                Termos de Uso
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              className="bg-error/10 rounded-lg py-3 px-4 active:opacity-70"
            >
              <Text className="text-error font-semibold text-center">
                Fazer Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
