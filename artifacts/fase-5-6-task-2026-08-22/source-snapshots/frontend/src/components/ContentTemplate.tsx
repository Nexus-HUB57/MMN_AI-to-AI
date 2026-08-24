import React, { useState } from 'react';
import { Copy, Edit2, Trash2, Plus, FileText } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  variables: string[];
  createdAt: string;
  usageCount: number;
}

interface ContentTemplateProps {
  templates?: Template[];
  onSelect?: (template: Template) => void;
  onDelete?: (templateId: string) => void;
  onEdit?: (template: Template) => void;
}

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'template-1',
    name: 'Post de Produto',
    category: 'Social Media',
    description: 'Template para posts de promoção de produtos',
    content: '🎯 Novo Produto: {PRODUCT_NAME}\n\n{DESCRIPTION}\n\n💰 Preço: {PRICE}\n🎁 Promoção: {PROMOTION}\n\nLink: {LINK}',
    variables: ['PRODUCT_NAME', 'DESCRIPTION', 'PRICE', 'PROMOTION', 'LINK'],
    createdAt: '2026-05-01',
    usageCount: 12
  },
  {
    id: 'template-2',
    name: 'Newsletter',
    category: 'Email',
    description: 'Template para newsletters semanais',
    content: 'Olá {USER_NAME},\n\nEsta semana temos novidades incríveis:\n\n{MAIN_CONTENT}\n\nAtenciosamente,\n{SENDER_NAME}',
    variables: ['USER_NAME', 'MAIN_CONTENT', 'SENDER_NAME'],
    createdAt: '2026-05-02',
    usageCount: 8
  },
  {
    id: 'template-3',
    name: 'Anúncio de Promoção',
    category: 'Social Media',
    description: 'Template para anúncios de promoção relâmpago',
    content: '⚡ PROMOÇÃO RELÂMPAGO! ⚡\n\n{OFFER}\n\n⏰ Válido até: {DEADLINE}\n\n👉 {CALL_TO_ACTION}',
    variables: ['OFFER', 'DEADLINE', 'CALL_TO_ACTION'],
    createdAt: '2026-05-03',
    usageCount: 5
  },
  {
    id: 'template-4',
    name: 'Conteúdo Educativo',
    category: 'Blog',
    description: 'Template para posts educativos',
    content: '📚 {TITLE}\n\n{INTRODUCTION}\n\n## Principais Pontos\n\n{CONTENT}\n\n## Conclusão\n\n{CONCLUSION}',
    variables: ['TITLE', 'INTRODUCTION', 'CONTENT', 'CONCLUSION'],
    createdAt: '2026-05-04',
    usageCount: 3
  }
];

export const ContentTemplate: React.FC<ContentTemplateProps> = ({
  templates = DEFAULT_TEMPLATES,
  onSelect,
  onDelete,
  onEdit
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('');

  const categories = Array.from(new Set(templates.map(t => t.category)));
  const filteredTemplates = filterCategory
    ? templates.filter(t => t.category === filterCategory)
    : templates;

  const handleSelect = (template: Template) => {
    setSelectedTemplate(template);
    onSelect?.(template);
  };

  const handleCopyContent = () => {
    if (selectedTemplate) {
      navigator.clipboard.writeText(selectedTemplate.content);
      alert('Conteúdo copiado para a área de transferência!');
    }
  };

  return (
    <div className="content-template bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Templates de Conteúdo</h3>
        <button className="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors">
          <Plus className="w-4 h-4" />
          Novo Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-1">
          {/* Category Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Filtrar por Categoria
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded"
            >
              <option value="">Todas as Categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Templates */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                onClick={() => handleSelect(template)}
                className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm">{template.name}</h4>
                    <p className="text-xs text-slate-400">{template.category}</p>
                  </div>
                  <span className="text-xs bg-slate-600 text-slate-200 px-2 py-1 rounded">
                    {template.usageCount}x
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 line-clamp-2">{template.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Template Preview */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">{selectedTemplate.name}</h4>
                <p className="text-sm text-slate-300 mb-3">{selectedTemplate.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-slate-600 text-slate-200 px-2 py-1 rounded">
                    {selectedTemplate.category}
                  </span>
                  <span className="text-xs bg-slate-600 text-slate-200 px-2 py-1 rounded">
                    Criado: {selectedTemplate.createdAt}
                  </span>
                  <span className="text-xs bg-slate-600 text-slate-200 px-2 py-1 rounded">
                    Usado {selectedTemplate.usageCount}x
                  </span>
                </div>
              </div>

              {/* Variables */}
              {selectedTemplate.variables.length > 0 && (
                <div className="bg-slate-700 rounded-lg p-4">
                  <h5 className="font-semibold text-white mb-2">Variáveis Disponíveis</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.variables.map(variable => (
                      <code
                        key={variable}
                        className="text-xs bg-slate-600 text-yellow-300 px-2 py-1 rounded font-mono cursor-pointer hover:bg-slate-500"
                        onClick={() => navigator.clipboard.writeText(`{${variable}}`)}
                        title="Clique para copiar"
                      >
                        {`{${variable}}`}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Preview */}
              <div className="bg-slate-700 rounded-lg p-4">
                <h5 className="font-semibold text-white mb-2">Conteúdo</h5>
                <div className="bg-slate-800 p-3 rounded text-slate-300 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto font-mono">
                  {selectedTemplate.content}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopyContent}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copiar Conteúdo
                </button>
                <button
                  onClick={() => onEdit?.(selectedTemplate)}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => onDelete?.(selectedTemplate.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Deletar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              <p>Selecione um template para visualizar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
