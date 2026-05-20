import { useMemo, useState } from "react";
import { Download, FileText, Plus, RefreshCw, Trash2 } from "lucide-react";
import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const PAGE_SIZE = 20;
type MaterialType = "banner" | "ebook" | "video" | "presentation" | "social_media" | "email_template" | "other";
type MaterialStatus = "draft" | "active" | "archived";

const typeOptions: Array<{ value: MaterialType; label: string }> = [
  { value: "banner", label: "Banner" },
  { value: "ebook", label: "E-book" },
  { value: "video", label: "Vídeo" },
  { value: "presentation", label: "Apresentação" },
  { value: "social_media", label: "Social Media" },
  { value: "email_template", label: "Template de Email" },
  { value: "other", label: "Outro" },
];

const statusMeta: Record<MaterialStatus, { label: string; className: string }> = {
  draft: { label: "Rascunho", className: "bg-amber-100 text-amber-800" },
  active: { label: "Ativo", className: "bg-green-100 text-green-800" },
  archived: { label: "Arquivado", className: "bg-slate-200 text-slate-700" },
};

const typeLabel = Object.fromEntries(typeOptions.map((option) => [option.value, option.label])) as Record<MaterialType, string>;

export default function AdminMaterials() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | MaterialType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | MaterialStatus>("all");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<{ id: number; status: MaterialStatus } | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "banner" as MaterialType,
    category: "promocao",
    url: "",
    status: "draft" as MaterialStatus,
  });

  const materialsQuery = trpc.materials.list.useQuery({
    page,
    limit: PAGE_SIZE,
    search: searchTerm || undefined,
    type: typeFilter === "all" ? undefined : typeFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const statsQuery = trpc.materials.getStats.useQuery();
  const categoriesQuery = trpc.materials.getCategories.useQuery();

  const createMutation = trpc.materials.create.useMutation({
    onSuccess: () => {
      toast.success("Material criado com sucesso");
      materialsQuery.refetch();
      statsQuery.refetch();
      setIsCreating(false);
      setFormData({
        title: "",
        description: "",
        type: "banner",
        category: categoriesQuery.data?.categories?.[0]?.id || "promocao",
        url: "",
        status: "draft",
      });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar material");
    },
  });

  const updateStatusMutation = trpc.materials.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status do material atualizado com sucesso");
      materialsQuery.refetch();
      statsQuery.refetch();
      setSelectedMaterial(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status do material");
    },
  });

  const deleteMutation = trpc.materials.delete.useMutation({
    onSuccess: () => {
      toast.success("Material removido com sucesso");
      materialsQuery.refetch();
      statsQuery.refetch();
      setDeleteTargetId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover material");
    },
  });

  const materials = materialsQuery.data?.materials || [];
  const pagination = materialsQuery.data?.pagination;
  const categories = categoriesQuery.data?.categories || [];

  const visibleSummary = useMemo(
    () => ({
      visible: materials.length,
      downloads: materials.reduce((sum, material) => sum + Number(material.downloads || 0), 0),
      active: materials.filter((material) => material.status === "active").length,
    }),
    [materials]
  );

  const handleCreate = () => {
    if (!formData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    createMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      type: formData.type,
      url: formData.url || undefined,
      categories: formData.category ? [formData.category] : [],
      status: formData.status,
    });
  };

  const handleUpdateStatus = () => {
    if (!selectedMaterial) return;

    updateStatusMutation.mutate({
      id: selectedMaterial.id,
      status: selectedMaterial.status,
    });
  };

  const handleDelete = () => {
    if (!deleteTargetId) return;
    deleteMutation.mutate({ id: deleteTargetId });
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Materiais de marketing</h1>
            <p className="mt-2 text-slate-600">
              Supervisão operacional do acervo de materiais, com filtros, criação rápida e governança de status.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                materialsQuery.refetch();
                statsQuery.refetch();
                categoriesQuery.refetch();
              }}
            >
              <RefreshCw size={16} className="mr-2" />
              Atualizar dados
            </Button>
            <Button size="sm" onClick={() => setIsCreating((current) => !current)}>
              <Plus size={16} className="mr-2" />
              {isCreating ? "Fechar criação" : "Novo material"}
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Materiais totais</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{statsQuery.data?.total ?? 0}</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Downloads acumulados</p>
            <p className="mt-2 text-3xl font-semibold text-blue-700">{statsQuery.data?.totalDownloads ?? 0}</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Ativos no catálogo</p>
            <p className="mt-2 text-3xl font-semibold text-green-700">{statsQuery.data?.byStatus.active ?? 0}</p>
          </Card>
          <Card className="bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Rascunhos</p>
            <p className="mt-2 text-3xl font-semibold text-amber-700">{statsQuery.data?.byStatus.draft ?? 0}</p>
          </Card>
        </section>

        <Card className="bg-white p-5 shadow-sm">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_220px_220px_1fr] xl:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Busca</p>
              <Input
                value={searchTerm}
                onChange={(e) => {
                  setPage(1);
                  setSearchTerm(e.target.value);
                }}
                placeholder="Buscar por título ou categoria"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Tipo</p>
              <Select
                value={typeFilter}
                onValueChange={(value: "all" | MaterialType) => {
                  setPage(1);
                  setTypeFilter(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Status</p>
              <Select
                value={statusFilter}
                onValueChange={(value: "all" | MaterialStatus) => {
                  setPage(1);
                  setStatusFilter(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Na página</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{visibleSummary.visible}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Ativos</p>
                <p className="mt-2 text-2xl font-semibold text-green-700">{visibleSummary.active}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Downloads</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{visibleSummary.downloads}</p>
              </div>
            </div>
          </div>
        </Card>

        {isCreating ? (
          <Card className="bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Cadastro rápido de material</h2>
            <p className="mt-2 text-sm text-slate-500">
              Fluxo inicial para alimentar o catálogo operacional do Backoffice.
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Título</p>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData((current) => ({ ...current, title: e.target.value }))}
                  placeholder="Ex: Banner principal da campanha"
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">URL</p>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData((current) => ({ ...current, url: e.target.value }))}
                  placeholder="https://exemplo.com/material"
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Tipo</p>
                <Select
                  value={formData.type}
                  onValueChange={(value: MaterialType) => setFormData((current) => ({ ...current, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Status inicial</p>
                <Select
                  value={formData.status}
                  onValueChange={(value: MaterialStatus) => setFormData((current) => ({ ...current, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Categoria</p>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((current) => ({ ...current, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="lg:col-span-2">
                <p className="mb-2 text-sm font-medium text-slate-700">Descrição</p>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData((current) => ({ ...current, description: e.target.value }))}
                  placeholder="Resumo operacional do material"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar material"}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
            </div>
          </Card>
        ) : null}

        <Card className="overflow-x-auto bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Catálogo operacional</h2>
            {pagination ? (
              <p className="text-sm text-slate-500">
                Página {pagination.page} de {Math.max(1, pagination.totalPages)}
              </p>
            ) : null}
          </div>

          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-4 py-3 font-semibold text-slate-900">Material</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Tipo</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Categorias</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Downloads</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Criação</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Ações</th>
              </tr>
            </thead>
            <tbody>
              {materialsQuery.isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="px-4 py-4"><Skeleton className="h-4 w-44" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-36" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-36" /></td>
                  </tr>
                ))
              ) : materials.length > 0 ? (
                materials.map((material) => {
                  const materialStatus = material.status as MaterialStatus;
                  return (
                    <tr key={material.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{material.title}</p>
                            <p className="text-sm text-slate-500">
                              {material.url ? material.url : material.createdBy ? `Criado por ${material.createdBy}` : "Sem URL"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {typeLabel[(material.type as MaterialType) || "other"] || material.type}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {material.categories?.length ? (
                            material.categories.map((category: string) => (
                              <Badge key={category} variant="secondary">
                                {category}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">Sem categoria</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusMeta[materialStatus]?.className || "bg-slate-100 text-slate-700"}`}>
                          {statusMeta[materialStatus]?.label || material.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-900">{material.downloads || 0}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {material.createdAt ? new Date(material.createdAt).toLocaleDateString("pt-BR") : "N/A"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedMaterial({ id: material.id, status: materialStatus })}
                          >
                            Status
                          </Button>
                          {material.url ? (
                            <Button variant="outline" size="sm" onClick={() => window.open(material.url, "_blank", "noopener,noreferrer")}>
                              <Download size={14} className="mr-1" />
                              Abrir
                            </Button>
                          ) : null}
                          <Button variant="outline" size="sm" onClick={() => setDeleteTargetId(material.id)}>
                            <Trash2 size={14} className="mr-1" />
                            Remover
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    Nenhum material encontrado para os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {pagination ? `${pagination.total} material(is) no total` : "Sem paginação disponível"}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || materialsQuery.isLoading}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => current + 1)}
                disabled={Boolean(pagination && page >= pagination.totalPages) || materialsQuery.isLoading}
              >
                Próxima
              </Button>
            </div>
          </div>
        </Card>

        {selectedMaterial ? (
          <Card className="bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Atualizar status do material #{selectedMaterial.id}</h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-[280px_auto] lg:items-end">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Novo status</p>
                <Select
                  value={selectedMaterial.status}
                  onValueChange={(value: MaterialStatus) =>
                    setSelectedMaterial((current) => (current ? { ...current, status: value } : current))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleUpdateStatus} disabled={updateStatusMutation.isPending}>
                  {updateStatusMutation.isPending ? "Salvando..." : "Salvar alteração"}
                </Button>
                <Button variant="outline" onClick={() => setSelectedMaterial(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        {deleteTargetId ? (
          <Card className="bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Remover material #{deleteTargetId}</h2>
            <p className="mt-2 text-sm text-slate-500">
              Esta ação remove o item do catálogo administrativo atual.
            </p>
            <div className="mt-5 flex gap-3">
              <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "Removendo..." : "Confirmar remoção"}
              </Button>
              <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
                Cancelar
              </Button>
            </div>
          </Card>
        ) : null}
      </div>
    </AdminDashboardLayout>
  );
}
