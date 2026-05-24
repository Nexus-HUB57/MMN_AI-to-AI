import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function OAuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string;
    state?: string;
    error?: string;
    sessionToken?: string;
    user?: string;
  }>();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (params.sessionToken) {
          await Auth.setSessionToken(params.sessionToken);

          if (params.user) {
            try {
              const userJson =
                typeof atob !== "undefined"
                  ? atob(params.user)
                  : Buffer.from(params.user, "base64").toString("utf-8");
              const userData = JSON.parse(userJson);
              await Auth.setUserInfo({
                id: userData.id,
                openId: userData.openId,
                name: userData.name,
                email: userData.email,
                loginMethod: userData.loginMethod,
                lastSignedIn: new Date(userData.lastSignedIn || Date.now()),
              });
            } catch {
              // noop: token already persisted
            }
          }

          setStatus("success");
          setTimeout(() => router.replace("/(tabs)"), 1000);
          return;
        }

        let url: string | null = null;

        if (params.code || params.state || params.error) {
          const urlParams = new URLSearchParams();
          if (params.code) urlParams.set("code", params.code);
          if (params.state) urlParams.set("state", params.state);
          if (params.error) urlParams.set("error", params.error);
          url = `?${urlParams.toString()}`;
        } else {
          url = await Linking.getInitialURL();
        }

        const error =
          params.error ||
          (url ? new URL(url, "http://dummy").searchParams.get("error") : null);
        if (error) {
          setStatus("error");
          setErrorMessage(error);
          return;
        }

        let code: string | null = params.code ?? null;
        let state: string | null = params.state ?? null;
        let sessionToken: string | null = null;

        if ((!code || !state) && url) {
          try {
            const urlObj = new URL(url, "http://dummy");
            code = urlObj.searchParams.get("code");
            state = urlObj.searchParams.get("state");
            sessionToken = urlObj.searchParams.get("sessionToken");
          } catch {
            // noop
          }
        }

        if (sessionToken) {
          await Auth.setSessionToken(sessionToken);
          setStatus("success");
          setTimeout(() => router.replace("/(tabs)"), 1000);
          return;
        }

        if (!code || !state) {
          setStatus("error");
          setErrorMessage("Missing code or state parameter");
          return;
        }

        const result = await Api.exchangeOAuthCode(code, state);
        if (!result.sessionToken) {
          setStatus("error");
          setErrorMessage("No session token received");
          return;
        }

        await Auth.setSessionToken(result.sessionToken);
        if (result.user) {
          await Auth.setUserInfo({
            id: result.user.id,
            openId: result.user.openId,
            name: result.user.name,
            email: result.user.email,
            loginMethod: result.user.loginMethod,
            lastSignedIn: new Date(result.user.lastSignedIn || Date.now()),
          });
        }

        setStatus("success");
        setTimeout(() => router.replace("/(tabs)"), 1000);
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to complete authentication",
        );
      }
    };

    handleCallback();
  }, [
    params.code,
    params.error,
    params.sessionToken,
    params.state,
    params.user,
    router,
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        {status === "processing" && (
          <>
            <ActivityIndicator size="large" color="#0a7ea4" />
            <Text style={styles.body}>Completando autenticação...</Text>
          </>
        )}

        {status === "success" && (
          <>
            <Text style={styles.title}>Autenticação concluída</Text>
            <Text style={styles.body}>Redirecionando...</Text>
          </>
        )}

        {status === "error" && (
          <>
            <Text style={[styles.title, styles.errorTitle]}>
              Falha na autenticação
            </Text>
            <Text style={styles.body}>
              {errorMessage ?? "Tente novamente."}
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#11181c",
    textAlign: "center",
  },
  errorTitle: {
    color: "#ef4444",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: "#687076",
    textAlign: "center",
  },
});
