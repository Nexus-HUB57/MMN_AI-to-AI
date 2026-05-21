import React, { useState } from "react";
import { useTRPC } from "../components/trpc-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Smartphone,
  Instagram,
  Facebook,
  Send,
  CheckCircle2,
  XCircle,
  Plus,
  MoreVertical,
  RefreshCw,
  Settings,
  Trash2,
} from "lucide-react";

/**
 * SocialAccounts - Gestão de Contas Sociais
 * Vinculação e configuração de contas WhatsApp, Instagram, Facebook, etc.
 */
export default function SocialAccounts() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("whatsapp");
  const [accountName, setAccountName] = useState("");

  // Query para listar contas sociais
  const { data: accounts, isLoading, refetch } = useQuery({
    queryKey: ["socialAccounts"],
    queryFn: () => trpc.social.listSocialAccounts.query(),
  });

  // Mutation para adicionar conta
  const addAccountMutation = useMutation({
    mutationFn: (data: { platform: string; accountName: string }) =>
      trpc.social.addSocialAccount.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialAccounts"] });
      setShowAddModal(false);
      setAccountName("");
    },
  });

  // Mutation para remover conta
  const removeAccountMutation = useMutation({
    mutationFn: (accountId: number) =>
      trpc.social.removeSocialAccount.mutate({ accountId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialAccounts"] });
    },
  });

  // Mutation para atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: ({
      accountId,
      status,
    }: {
      accountId: number;
      status: string;
    }) =>
      trpc.social.updateSocialAccountStatus.mutate({
        accountId,
        status: status as "active" | "inactive" | "expired" | "error",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socialAccounts"] });
    },
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "whatsapp":
        return <Smartphone className="w-5 h-5" />;
      case "instagram":
        return <Instagram className="w-5 h-5" />;
      case "facebook":
        return <Facebook className="w-5 h-5" />;
      default:
        return <Send className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
            <CheckCircle2 className="w-3 h-3" />
            Ativo
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
            Pausado
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
            <RefreshCw className="w-3 h-3" />
            Expirado
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Erro
          </span>
        );
      default:
        return null;
    }
  };

  const platforms = [
    { id: "whatsapp", name: "WhatsApp", color: "bg-green-500" },
    { id: "instagram", name: "Instagram", color: "bg-pink-500" },
    { id: "facebook", name: "Facebook", color: "bg-blue-600" },
    { id: "telegram", name: "Telegram", color: "bg-blue-500" },
    { id: "twitter", name: "Twitter/X", color: "bg-gray-800" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Contas Sociais
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie suas contas de redes sociais vinculadas ao sistema
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Vincular Conta
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {platforms.map((platform) => {
          const count =
            accounts?.filter((a) => a.platform === platform.id).length || 0;
          return (
            <div
              key={platform.id}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white`}
                  >
                    {getPlatformIcon(platform.id)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {platform.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-700">{count}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-500">Carregando contas...</p>
        </div>
      )}

      {/* Accounts List */}
      {!isLoading && (
        <div className="space-y-4">
          {accounts && accounts.length > 0 ? (
            accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${
                        account.platform === "whatsapp"
                          ? "bg-green-500"
                          : account.platform === "instagram"
                          ? "bg-pink-500"
                          : account.platform === "facebook"
                          ? "bg-blue-600"
                          : "bg-gray-500"
                      }`}
                    >
                      {getPlatformIcon(account.platform)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">
                        {account.platform}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {account.accountName || "Conta não nomeada"}
                      </p>
                      {account.accountId && (
                        <p className="text-xs text-gray-400 font-mono">
                          {account.accountId}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {getStatusBadge(account.status || "inactive")}

                    <div className="flex items-center gap-2">
                      {/* Toggle Status */}
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({
                            accountId: account.id,
                            status:
                              account.status === "active" ? "inactive" : "active",
                          })
                        }
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title={
                          account.status === "active" ? "Pausar conta" : "Ativar conta"
                        }
                      >
                        <Settings className="w-4 h-4" />
                      </button>

                      {/* Remove Account */}
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              "Tem certeza que deseja remover esta conta social?"
                            )
                          ) {
                            removeAccountMutation.mutate(account.id);
                          }
                        }}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover conta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Token Info */}
                {account.accessToken && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      Token de acesso configurado
                      {account.refreshToken && (
                        <>
                          <span className="mx-1">•</span>
                          Refresh token disponível
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Smartphone className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Nenhuma conta vinculada
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Vincule suas contas de redes sociais para automatizar postagens
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Vincular primeira conta
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowAddModal(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Vincular Conta Social
              </h2>

              {/* Platform Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selecione a plataforma
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedPlatform === platform.id
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white mx-auto mb-2`}
                      >
                        {getPlatformIcon(platform.id)}
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {platform.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da conta (opcional)
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Ex: Meu WhatsApp Business"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() =>
                    addAccountMutation.mutate({
                      platform: selectedPlatform,
                      accountName,
                    })
                  }
                  disabled={addAccountMutation.isPending}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {addAccountMutation.isPending ? "Vinculando..." : "Vincular"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}