import { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc';

interface CMSPage {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  category: string;
  status: 'draft' | 'published' | 'archived';
  updatedAt?: string | Date | null;
}

interface CMSPagesProps {
  slug?: string;
  adminView?: boolean;
}

export function CMSPages({ slug, adminView = false }: CMSPagesProps) {
  const [page, setPage] = useState<CMSPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: pageData, isLoading } = trpc.cms.getPage.useQuery(
    { slug: slug || '' },
    { enabled: !!slug && !adminView }
  );

  useEffect(() => {
    if (pageData) {
      setPage(pageData);
      setLoading(false);
    } else if (!isLoading && slug) {
      setLoading(false);
    }
  }, [pageData, isLoading, slug]);

  if (adminView) {
    return <CMSAdminPanel />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Página não encontrada</h2>
        <p className="text-gray-600">O conteúdo que você procura não está disponível.</p>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{page.title}</h1>
        {page.metaDescription && (
          <p className="text-xl text-gray-600">{page.metaDescription}</p>
        )}
      </header>

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content || '' }}
      />

      <footer className="mt-8 pt-8 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Categoria: {page.category}</span>
          <span>
            Última atualização: {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString('pt-BR') : 'Não informada'}
          </span>
        </div>
      </footer>
    </article>
  );
}

function CMSAdminPanel() {
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);

  const { data, isLoading } = trpc.cms.list.useQuery({
    page: 1,
    limit: 100,
  });

  useEffect(() => {
    if (data?.pages) {
      setPages(data.pages);
      setLoading(false);
    }
  }, [data]);

  const createMutation = trpc.cms.create.useMutation({
    onSuccess: () => {
      alert('Página criada com sucesso!');
      setEditingPage(null);
    },
  });

  const updateMutation = trpc.cms.update.useMutation({
    onSuccess: () => {
      alert('Página atualizada com sucesso!');
      setEditingPage(null);
    },
  });

  const deleteMutation = trpc.cms.delete.useMutation({
    onSuccess: () => {
      alert('Página deletada com sucesso!');
    },
  });

  const handleCreate = () => {
    setEditingPage({
      id: 0,
      title: '',
      slug: '',
      content: '',
      metaTitle: null,
      metaDescription: null,
      category: 'general',
      status: 'draft',
    });
  };

  const handleSave = (page: Partial<CMSPage>) => {
    if (page.id === 0) {
      createMutation.mutate({
        title: page.title || '',
        slug: page.slug || '',
        content: page.content || '',
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        category: page.category || 'general',
        status: page.status || 'draft',
      });
    } else {
      updateMutation.mutate({
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        category: page.category,
        status: page.status,
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta página?')) {
      deleteMutation.mutate({ id });
    }
  };

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gerenciar Páginas CMS</h2>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Nova Página
        </button>
      </div>

      {editingPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">
              {editingPage.id === 0 ? 'Criar Página' : 'Editar Página'}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave(editingPage);
              }}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Título"
                value={editingPage.title}
                onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Slug (URL)"
                value={editingPage.slug}
                onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <textarea
                placeholder="Conteúdo HTML"
                value={editingPage.content || ''}
                onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg h-64"
              />
              <input
                type="text"
                placeholder="Meta Title"
                value={editingPage.metaTitle || ''}
                onChange={(e) => setEditingPage({ ...editingPage, metaTitle: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                placeholder="Meta Description"
                value={editingPage.metaDescription || ''}
                onChange={(e) => setEditingPage({ ...editingPage, metaDescription: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <select
                value={editingPage.category}
                onChange={(e) => setEditingPage({ ...editingPage, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="general">Geral</option>
                <option value="legal">Legal</option>
                <option value="about">Sobre</option>
                <option value="contact">Contato</option>
              </select>
              <select
                value={editingPage.status}
                onChange={(e) => setEditingPage({ ...editingPage, status: e.target.value as any })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="archived">Arquivado</option>
              </select>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="w-full bg-white rounded-lg overflow-hidden shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left">Título</th>
            <th className="px-4 py-3 text-left">Slug</th>
            <th className="px-4 py-3 text-left">Categoria</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.id} className="border-t">
              <td className="px-4 py-3">{page.title}</td>
              <td className="px-4 py-3">{page.slug}</td>
              <td className="px-4 py-3">{page.category}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs ${
                  page.status === 'published' ? 'bg-green-100 text-green-800' :
                  page.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {page.status === 'published' ? 'Publicado' :
                   page.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => setEditingPage(page)}
                  className="text-blue-600 hover:underline mr-4"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(page.id)}
                  className="text-red-600 hover:underline"
                >
                  Deletar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}