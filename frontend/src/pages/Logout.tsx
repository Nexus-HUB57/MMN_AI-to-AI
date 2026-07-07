import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { LogOut, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Logout() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation();

  const invalidateRemoteSession = async () => {
    try {
      await Promise.race([
        logoutMutation.mutateAsync(),
        new Promise((_, reject) =>
          window.setTimeout(() => reject(new Error("logout-timeout")), 2000),
        ),
      ]);
    } catch (error) {
      console.warn("Falha ao finalizar sessão remota. Logout local aplicado.", error);
    }
  };

  const handleConfirmLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    void invalidateRemoteSession();
    await logout();
    setTimeout(() => {
      setLocation("/login");
    }, 150);
  };

  const handleCancel = () => {
    setLocation("/");
  };

  // Auto-logout com fallback local
  useEffect(() => {
    const timer = setTimeout(() => {
      void handleConfirmLogout();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        <Card className="border-accent/30 bg-card/50 backdrop-blur-md shadow-2xl">
          <div className="p-8 sm:p-10 text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-cyan to-accent-green/50 flex items-center justify-center">
                <LogOut className="w-8 h-8 text-background" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Confirmar Logout
              </h1>
              <p className="text-text-secondary">
                Voce sera desconectado de sua conta. Tem certeza que deseja continuar?
              </p>
            </div>

            {/* Status Message */}
            {isLoggingOut && (
              <div className="p-3 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
                <p className="text-sm text-accent-cyan">
                  Desconectando... Voce sera redirecionado em breve.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 border-border hover:bg-muted"
                disabled={isLoggingOut}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmLogout}
                className="flex-1 gradient-btn"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Saindo..." : "Sair"}
              </Button>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-text-muted">
                Voce pode fazer login novamente a qualquer momento
              </p>
            </div>
          </div>
        </Card>

        {/* Branding */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-green flex items-center justify-center">
            <Zap className="w-3 h-3 text-background" />
          </div>
          <span className="text-sm font-semibold gradient-text">IOAID · SaaS</span>
        </div>
      </div>
    </div>
  );
}
