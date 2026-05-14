import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Por favor, preencha todos os campos.");
      return;
    }
    
    setLoading(true);
    // Simular login
    setTimeout(() => {
      setLoading(false);
      router.replace("/(tabs)");
    }, 1500);
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mb-4">
              <Text className="text-white text-4xl font-bold">M</Text>
            </View>
            <Text className="text-2xl font-bold text-foreground">MMN AI-to-AI</Text>
            <Text className="text-muted mt-2 text-center">
              Entre para gerenciar sua rede e seu agente IA
            </Text>
          </View>

          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">Email</Text>
              <TextInput
                className="bg-surface border border-border rounded-xl p-4 text-foreground"
                placeholder="seu@email.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">Senha</Text>
              <TextInput
                className="bg-surface border border-border rounded-xl p-4 text-foreground"
                placeholder="••••••••"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity className="items-end">
              <Text className="text-primary text-sm font-medium">Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className={`bg-primary rounded-xl p-4 mt-2 items-center ${loading ? "opacity-70" : "active:opacity-80"}`}
            >
              <Text className="text-white font-bold text-lg">
                {loading ? "Entrando..." : "Entrar"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-4 gap-1">
              <Text className="text-muted">Não tem uma conta?</Text>
              <TouchableOpacity>
                <Text className="text-primary font-bold">Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
