import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  PlayCircle,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  EAD_SECTIONS,
  LEVEL_LABELS,
  REPO_BLOB,
  applyLessonOverride,
  buildLessonOverrideMap,
  type ContentType,
  type EADLesson,
  type EADLessonOverride,
  type LevelSlug,
} from "@/lib/academia-ead";

type PublishFilter = "all" | "published" | "hidden";

type CatalogRow = (EADLesson & {
  sectionSlug: ContentType;
  sectionTitle: string;
  isPublished: boolean;
  isFeatured: boolean;
  notes?: string;
  sortOrder?: number;
}) & {
  override?: EADLessonOverride;
};

const sectionLabel: Record<ContentType, string> = {
  curso: "Cursos",
  treinamento: "Treinamentos",
  webinar: "Webinars",
  playbook: "Playbooks",
  lab: "Lab Nexus",
  lib: "Lib Nexus",
};

const emptyForm = {
  lessonId: "",
  sectionSlug: "curso" as ContentType,
  title: "",
  subtitle: "",
  duration: "",
  description: "",
  level: "fundamental" as LevelSlug,
  videoUrl: "",
  pdfUrl: "",
  isPublished: true,
  isFeatured: false,
  sortOrder: "",
  notes: "",
};

export default function AdminAcademia() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sectionFilter, setSectionFilter] = useState<"all" | ContentType>("all");
  const [publishFilter, setPublishFilter] = useState<PublishFilter>("all");
  const [editingLesson, setEditingLesson] = useState<CatalogRow | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const overridesQuery = trpc.academiaEad.listOverrides.useQuery({});
  const statsQuery = trpc.academiaEad.getStats.useQuery();

  const upsertMutation = trpc.academiaEad.upsertOverride.useMutation({
    onSuccess: () => {
      toast.success("Configuração da aula salva com sucesso");
      overridesQuery.refetch();
      statsQuery.refetch();
      setEditingLesson(null);
    },
    onError: (error) => {
      toast.error(error.message || "Falha ao salvar configuração da aula");
    },
  });

  const deleteMutation = trpc.academiaEad.deleteOverride.useMutation({
    onSuccess: () => {
      toast.success("Override removido. A aula voltou ao padrão do catálogo.");
      overridesQuery.refetch();
      statsQuery.refetch();
      setEditingLesson(null);
    },
    onError: (error) => {
      toast.error(error.message || "Falha ao remover override");
    },
  });

  const catalog = useMemo(() => {
    const overrideMap = buildLessonOverrideMap(overridesQuery.data?.items);

    return EAD_SECTIONS.flatMap((section) =>
      section.lessons.map((lesson) => {
        const override = overrideMap.get(lesson.id);
        const merged = applyLessonOverride(lesson, override);

        return {
          ...merged,
          sectionSlug: section.slug,
          sectionTitle: section.title,
          override,
        } satisfies CatalogRow;
      }),
    );
  }, [overridesQuery.data?.items]);

  const filteredCatalog = useMemo(() => {
    return catalog.filter((lesson) => {
      const matchesSearch =
        !searchTerm.trim() ||
        `${lesson.title} ${lesson.subtitle || ""} ${lesson.sectionTitle} ${lesson.tags.join(" ")}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesSection = sectionFilter === "all" || lesson.sectionSlug === sectionFilter;
      const matchesPublish =
        publishFilter === "all" ||
        (publishFilter === "published" ? lesson.isPublished : !lesson.isPublished);

      return matchesSearch && matchesSection && matchesPublish;
    });
  }, [catalog, publishFilter, searchTerm, sectionFilter]);

  useEffect(() => {
    if (!editingLesson) {
      setFormData(emptyForm);
      return;
    }

    setFormData({
      lessonId: editingLesson.id,
      sectionSlug: editingLesson.sectionSlug,
      title: editingLesson.override?.title || "",
      subtitle: editingLesson.override?.subtitle || "",
      duration: editingLesson.override?.duration || "",
      description: editingLesson.override?.description || "",
      level: editingLesson.override?.level || editingLesson.level,
      videoUrl: editingLesson.videoUrl || "",
      pdfUrl: editingLesson.pdfUrl || "",
      isPublished: editingLesson.isPublished,
      isFeatured: editingLesson.isFeatured,
      sortOrder: editingLesson.sortOrder !== undefined ? String(editingLesson.sortOrder) : "",
      notes: editingLesson.notes || "",
    });
  }, [editingLesson]);

  const handleSave = () => {
    if (!editingLesson) return;

    upsertMutation.mutate({
      lessonId: editingLesson.id,
      sectionSlug: formData.sectionSlug,
      title: formData.title.trim() || undefined,
      subtitle: formData.subtitle.trim() || undefined,
      duration: formData.duration.trim() || undefined,
      description: formData.description.trim() || undefined,
      level: formData.level,
      videoUrl: formData.videoUrl.trim(),
      pdfUrl: formData.pdfUrl.trim(),
      isPublished: formData.isPublished,
      isFeatured: formData.isFeatured,
      sortOrder: formData.sortOrder.trim() ? Number(formData.sortOrder) : undefined,
      notes: formData.notes.trim() || undefined,
    });
  };

  const handleResetOverride = () => {
    if (!editingLesson) return;
    deleteMutation.mutate({ lessonId: editingLesson.id });
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Academ'IA · Gestão EAD</h1>
            <p className="mt-2 text-slate-600">
              Painel operacional para publicar vídeo aulas, apostilas PDF e controlar visibilidade das trilhas da Nexus Academ'IA.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                overridesQuery.refetch();
                statsQuery.refetch();
              }}
            >
              <RefreshCw size={16} className="mr-2" />
              Atualizar
            </Button>
            <a href="/academia" target="_blank" rel="noreferrer">
              <Button size="sm">
                <ExternalLink size={16} className="mr-2" />
                Ver hub ao vivo
              </Button>
            </a>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {statsQuery.isLoading
            ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-xl" />)
            : [
                { label: "Overrides ativos", value: statsQuery.data?.total ?? 0, tone: "text-slate-900" },
                { label: "Publicadas", value: statsQuery.data?.published ?? 0, tone: "text-green-700" },
                { label: "Com vídeo", value: statsQuery.data?.withVideo ?? 0, tone: "text-cyan-700" },
                { label: "Com PDF", value: statsQuery.data?.withPdf ?? 0, tone: "text-amber-700" },
                { label: "Em destaque", value: statsQuery.data?.featured ?? 0, tone: "text-fuchsia-700" },
              ].map((item) => (
                <Card key={item.label} className="bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className={`mt-2 text-3xl font-semibold ${item.tone}`}>{item.value}</p>
                </Card>
              ))}
        </section>

        <Card className="bg-white p-5 shadow-sm">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_240px_220px]">
            <div>
              <Label>Buscar aula</Label>
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Título, seção ou tag"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Seção</Label>
              <Select value={sectionFilter} onValueChange={(value: "all" | ContentType) => setSectionFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as seções" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as seções</SelectItem>
                  {Object.entries(sectionLabel).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Publicação</Label>
              <Select value={publishFilter} onValueChange={(value: PublishFilter) => setPublishFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="published">Publicados</SelectItem>
                  <SelectItem value="hidden">Ocultos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aula</TableHead>
                  <TableHead>Seção</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Recursos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overridesQuery.isLoading
                  ? Array.from({ length: 8 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={6}>
                          <Skeleton className="h-12 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : filteredCatalog.map((lesson) => (
                      <TableRow key={lesson.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-slate-900">{lesson.title}</p>
                            <p className="text-xs text-slate-500">{lesson.subtitle || lesson.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{sectionLabel[lesson.sectionSlug]}</Badge>
                        </TableCell>
                        <TableCell>{LEVEL_LABELS[lesson.level]}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Badge className={lesson.videoUrl ? "bg-cyan-100 text-cyan-800" : "bg-slate-100 text-slate-600"}>
                              <PlayCircle className="mr-1 h-3 w-3" />
                              Vídeo
                            </Badge>
                            <Badge className={lesson.pdfUrl ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}>
                              <FileText className="mr-1 h-3 w-3" />
                              PDF
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={lesson.isPublished ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}>
                              {lesson.isPublished ? <Eye className="mr-1 h-3 w-3" /> : <EyeOff className="mr-1 h-3 w-3" />}
                              {lesson.isPublished ? "Publicado" : "Oculto"}
                            </Badge>
                            {lesson.isFeatured && (
                              <Badge className="bg-fuchsia-100 text-fuchsia-800">
                                <Sparkles className="mr-1 h-3 w-3" /> Destaque
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => setEditingLesson(lesson)}>
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Dialog open={Boolean(editingLesson)} onOpenChange={(open) => !open && setEditingLesson(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-cyan-600" />
                Configurar aula EAD
              </DialogTitle>
              <DialogDescription>
                Ajuste publicação, URLs de vídeo/PDF e metadados sem alterar o catálogo base do repositório.
              </DialogDescription>
            </DialogHeader>

            {editingLesson && (
              <div className="space-y-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{editingLesson.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {editingLesson.id} · {editingLesson.sectionTitle}
                  </p>
                  {editingLesson.mdPath && (
                    <a
                      href={`${REPO_BLOB}/${editingLesson.mdPath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-700 hover:underline"
                    >
                      <BookOpen className="h-3 w-3" /> abrir material base
                    </a>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Título customizado</Label>
                    <Input value={formData.title} onChange={(e) => setFormData((current) => ({ ...current, title: e.target.value }))} className="mt-2" />
                  </div>
                  <div>
                    <Label>Subtítulo customizado</Label>
                    <Input value={formData.subtitle} onChange={(e) => setFormData((current) => ({ ...current, subtitle: e.target.value }))} className="mt-2" />
                  </div>
                  <div>
                    <Label>Duração</Label>
                    <Input value={formData.duration} onChange={(e) => setFormData((current) => ({ ...current, duration: e.target.value }))} className="mt-2" placeholder="Ex.: 25min" />
                  </div>
                  <div>
                    <Label>Nível</Label>
                    <Select value={formData.level} onValueChange={(value: LevelSlug) => setFormData((current) => ({ ...current, level: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fundamental">Fundamental</SelectItem>
                        <SelectItem value="agente">Agente</SelectItem>
                        <SelectItem value="master">Master</SelectItem>
                        <SelectItem value="elite">Elite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>URL da vídeo aula</Label>
                    <Input value={formData.videoUrl} onChange={(e) => setFormData((current) => ({ ...current, videoUrl: e.target.value }))} className="mt-2" placeholder="https://..." />
                  </div>
                  <div>
                    <Label>URL do PDF</Label>
                    <Input value={formData.pdfUrl} onChange={(e) => setFormData((current) => ({ ...current, pdfUrl: e.target.value }))} className="mt-2" placeholder="https://..." />
                  </div>
                  <div>
                    <Label>Seção</Label>
                    <Select value={formData.sectionSlug} onValueChange={(value: ContentType) => setFormData((current) => ({ ...current, sectionSlug: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seção" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(sectionLabel).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ordem customizada</Label>
                    <Input value={formData.sortOrder} onChange={(e) => setFormData((current) => ({ ...current, sortOrder: e.target.value }))} className="mt-2" placeholder="Ex.: 10" />
                  </div>
                </div>

                <div>
                  <Label>Descrição customizada</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData((current) => ({ ...current, description: e.target.value }))} className="mt-2 min-h-[110px]" />
                </div>

                <div>
                  <Label>Notas internas</Label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData((current) => ({ ...current, notes: e.target.value }))} className="mt-2 min-h-[100px]" placeholder="Ex.: PDF aprovado, aguardando thumbnail, aula revisada..." />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setFormData((current) => ({ ...current, isPublished: !current.isPublished }))}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      formData.isPublished
                        ? "border-green-200 bg-green-50 text-green-800"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    <p className="font-semibold">Publicação</p>
                    <p className="mt-1 text-sm">{formData.isPublished ? "Aula visível no hub" : "Aula oculta para os usuários"}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((current) => ({ ...current, isFeatured: !current.isFeatured }))}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      formData.isFeatured
                        ? "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    <p className="font-semibold">Destaque</p>
                    <p className="mt-1 text-sm">{formData.isFeatured ? "Marcada para destaque" : "Sem destaque especial"}</p>
                  </button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button variant="outline" onClick={handleResetOverride} disabled={deleteMutation.isPending}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Resetar override
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditingLesson(null)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={upsertMutation.isPending}>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar configuração
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}
