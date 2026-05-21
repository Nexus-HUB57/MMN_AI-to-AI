import React, { useState } from "react";
import { useTRPC } from "../components/trpc-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Link2,
  Plus,
  Copy,
  CheckCircle2,
  Eye,
  MousePointer,
  UserPlus,
  ShoppingCart,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  BarChart3,
  TrendingUp,
} from "lucide-react";

/**
 * TrackingLinks - Sistema de Tracking Neural
 * Links de rastreamento para acompanhamento de conversões
 */
export default function TrackingLinks() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [linkName, setLinkName] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [campaign, setCampaign] = useState("");
  const [medium, setMedium] = useState("");

  // Query para listar links de rastreamento
  const { data: trackingLinks, isLoading } = useQuery({
    queryKey: ["trackingLinks"],
    queryFn: () => trpc.social.listTrackingLinks.query(),
  });

  // Query para métricas de conversão
  const { data: conversionMetrics } = useQuery({
    queryKey: ["conversionMetrics"],
    queryFn: () => trpc.social.getConversionMetrics.query(),
  });

  // Mutation para criar link
  const createLinkMutation = useMutation({
    mutationFn: (data: {
      name: string;
      destinationUrl: string;
      campaign?: string;
      medium?: string;
    }) => trpc.social.createTrackingLink.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackingLinks"] });
      setShowCreateModal(false);
      setLinkName("");
      setDestinationUrl("");
      setCampaign("");
      setMedium("");
    },
  });

  // Mutation para deletar link
  const deleteLinkMutation = useMutation({
    mutationFn: (linkId: number) =>
      trpc.social.deleteTrackingLink.mutate({ linkId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackingLinks"] });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getFullTrackingUrl = (shortCode: string) => {
    return `${window.location.origin}/r/${shortCode}`;
  };

  const getMediumLabel = (medium: string) => {
    switch (medium) {
      case "social":
        return "Social";
      case "email":
        return "E-mail";
      case "affiliate":
        return "Afiliado";
      case "influencer":
        return "Influenciador";
      default:
        return medium || "Direto";
    }
  };

  const getMediumColor = (medium: string) => {
    switch (medium) {
      case "social":
        return "bg-pink-100 text-pink-700";
      case "email":
        return "bg-blue-100 text-blue-700";
      case "affiliate":
        return "bg-green-100 text-green-700";
      case "influencer":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Links de Rastreamento
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Crie e gerencie links para rastrear conversões da sua rede
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Criar Link
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Link2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Links</p>
              <p className="text-2xl font-bold text-gray-900">
                {trackingLinks?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Cliques</p>
              <p className="text-2xl font-bold text-gray-900">
                {conversionMetrics?.totalClicks || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MousePointer className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Conversões</p>
              <p className="text-2xl font-bold text-gray-900">
                {conversionMetrics?.totalConversions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-gray-900">
                {conversionMetrics?.conversionRate
                  ? `${conversionMetrics.conversionRate.toFixed(2)}%`
                  : "0%"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-500">Carregando links...</p>
        </div>
      )}

      {/* Links List */}
      {!isLoading && (
        <div className="space-y-4">
          {trackingLinks && trackingLinks.length > 0 ? (
            trackingLinks.map((link) => (
              <div
                key={link.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{link.name}</h3>
                      <p className="text-sm text-gray-500">{link.destinationUrl}</p>
                    </div>
                    {link.campaign && (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getMediumColor(
                          link.medium || ""
                        )}`}
                      >
                        {getMediumLabel(link.campaign)}
                      </span>
                    )}
                  </div>

                  {/* Tracking URL */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-4">
                    <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <code className="text-sm text-gray-700 flex-1 truncate">
                      {getFullTrackingUrl(link.shortCode)}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(getFullTrackingUrl(link.shortCode))
                      }
                      className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Copiar link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                        <Eye className="w-4 h-4" />
                        <span className="text-xs">Cliques</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {link.clicks || 0}
                      </p>
                    </div>
                    <div className="text-center border-l border-gray-100">
                      <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                        <UserPlus className="w-4 h-4" />
                        <span className="text-xs">Cadastros</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {link.conversions || 0}
                      </p>
                    </div>
                    <div className="text-center border-l border-gray-100">
                      <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                        <ShoppingCart className="w-4 h-4" />
                        <span className="text-xs">Vendas</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {link.sales || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Criado em{" "}
                    {new Date(link.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                      title="Ver estatísticas"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm("Tem certeza que deseja deletar este link?")
                        ) {
                          deleteLinkMutation.mutate(link.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                      title="Deletar link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Link2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Nenhum link criado
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Crie links de rastreamento para monitorar suas conversões
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Criar primeiro link
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Link Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Criar Link de Rastreamento
              </h2>

              {/* Link Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do link *
                </label>
                <input
                  type="text"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder="Ex: Post Instagram Campanha Janeiro"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Destination URL */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de destino *
                </label>
                <input
                  type="url"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  placeholder="https://exemplo.com/pagina"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Campaign */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campanha
                </label>
                <input
                  type="text"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  placeholder="Ex: Black Friday 2026"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Medium */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meio
                </label>
                <select
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">Selecione o meio</option>
                  <option value="social">Social</option>
                  <option value="email">E-mail</option>
                  <option value="affiliate">Afiliado</option>
                  <option value="influencer">Influenciador</option>
                  <option value="direct">Direto</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() =>
                    createLinkMutation.mutate({
                      name: linkName,
                      destinationUrl,
                      campaign: campaign || undefined,
                      medium: medium || undefined,
                    })
                  }
                  disabled={
                    !linkName ||
                    !destinationUrl ||
                    createLinkMutation.isPending
                  }
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {createLinkMutation.isPending ? "Criando..." : "Criar Link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}