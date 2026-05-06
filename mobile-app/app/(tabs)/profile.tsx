import { ScrollView, Text, View, TouchableOpacity, Switch } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";

export default function ProfileScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Dados mockados
  const user = {
    name: "João Silva",
    email: "joao@example.com",
    affiliateCode: "JOAO123456",
    referralLink: "https://mmn.ai/ref/JOAO123456",
  };

  const handleCopyLink = () => {
    // Implementar cópia para clipboard
    alert("Link copiado para a área de transferência!");
  };

  const handleLogout = () => {
    // Implementar logout
    alert("Logout realizado com sucesso!");
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6 pb-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Perfil</Text>
            <Text className="text-sm text-muted">Gerencie suas informações</Text>
          </View>

          {/* Informações do Usuário */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
            <View className="items-center gap-2">
              <View className="w-16 h-16 bg-primary rounded-full items-center justify-center">
                <Text className="text-2xl font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text className="text-xl font-bold text-foreground">{user.name}</Text>
            </View>

            <View className="gap-3 border-t border-border pt-4">
              <View>
                <Text className="text-xs font-medium text-muted mb-1">Email</Text>
                <Text className="text-sm text-foreground">{user.email}</Text>
              </View>
              <View>
                <Text className="text-xs font-medium text-muted mb-1">Código de Afiliado</Text>
                <Text className="text-sm text-foreground font-mono">{user.affiliateCode}</Text>
              </View>
            </View>

            <TouchableOpacity className="bg-primary rounded-lg py-3 px-4 active:opacity-80">
              <Text className="text-white font-semibold text-center">Editar Perfil</Text>
            </TouchableOpacity>
          </View>

          {/* Link de Indicação */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <Text className="text-sm font-medium text-muted">Link de Indicação</Text>
            <View className="bg-background rounded-lg p-3 border border-border">
              <Text className="text-xs text-foreground font-mono break-words">
                {user.referralLink}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCopyLink}
              className="bg-primary/10 rounded-lg py-2 px-4 active:opacity-70"
            >
              <Text className="text-primary font-semibold text-center text-sm">Copiar Link</Text>
            </TouchableOpacity>
          </View>

          {/* Preferências */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Preferências</Text>

            {/* Notificações */}
            <View className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground">Notificações</Text>
                <Text className="text-xs text-muted mt-1">Receber alertas de comissões</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#ccc", true: "#0a7ea4" }}
              />
            </View>

            {/* Tema Escuro */}
            <View className="bg-surface rounded-lg p-4 border border-border flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground">Tema Escuro</Text>
                <Text className="text-xs text-muted mt-1">Alternar entre claro e escuro</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: "#ccc", true: "#0a7ea4" }}
              />
            </View>
          </View>

          {/* Ações */}
          <View className="gap-3">
            <TouchableOpacity className="bg-surface rounded-lg py-3 px-4 border border-border active:opacity-70">
              <Text className="text-foreground font-semibold text-center">Sobre o App</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-surface rounded-lg py-3 px-4 border border-border active:opacity-70">
              <Text className="text-foreground font-semibold text-center">Termos de Uso</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              className="bg-error/10 rounded-lg py-3 px-4 active:opacity-70"
            >
              <Text className="text-error font-semibold text-center">Fazer Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
