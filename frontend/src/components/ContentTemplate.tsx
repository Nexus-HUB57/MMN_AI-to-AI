import React, { useState } from 'react';
import { Copy, Plus, Trash2, Edit2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  variables: string[];
  usageCount: number;
  createdAt: string;
}

export const ContentTemplate: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('social-media');
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: 'social-media',
      name: 'Post em Redes Sociais',
      category: 'Social Media',
      description: 'Template para posts em Instagram, Twitter e Facebook',
      content: `🎯 {{title}}

{{description}}

✨ {{benefit}}

#{{hashtag1}} #{{hashtag2}} #{{hashtag3}}

👉 {{cta}}`,
      variables: ['title', 'description', 'benefit', 'hashtag1', 'hashtag2', 'hashtag3', 'cta'],
      usageCount: 45,
      createdAt: '2026-05-01',
    },
    {
      id: 'email-newsletter',
      name: 'Newsletter por Email',
      category: 'Email',
      description: 'Template para newsletters semanais',
      content: `Olá {{name}},

Esta semana temos novidades incríveis para você!

📰 Destaque Principal: {{headline}}

{{content}}

🔗 Leia mais: {{link}}

Até a próxima!
{{signature}}`,
      variables: ['name', 'headline', 'content', 'link', 'signature'],
      usageCount: 23,
      createdAt: '2026-04-28',
    },
    {
      id: 'blog-post',
      name: 'Post de Blog',
      category: 'Blog',
      description: 'Template para artigos de blog',
      content: `# {{title}}

**Publicado em:** {{date}}  
**Autor:** {{author}}

## Introdução
{{introduction}}

## Conteúdo Principal
{{mainContent}}

## Conclusão
{{conclusion}}

---
**Tags:** {{tags}}`,
      variables: ['title', 'date', 'author', 'introduction', 'mainContent', 'conclusion', 'tags'],
      usageCount: 18,
      createdAt: '2026-04-25',
    },
    {
      id: 'product-description',
      name: 'Descrição de Produto',
      category: 'E-commerce',
      description: 'Template para descrições de produtos',
      content: `## {{productName}}

**Preço:** R$ {{price}}

### Descrição
{{description}}

### Características
- {{feature1}}
- {{feature2}}
- {{feature3}}

### Benefícios
✓ {{benefit1}}
✓ {{benefit2}}

**Estoque:** {{stock}} unidades`,
      variables: ['productName', 'price', 'description', 'feature1', 'feature2', 'feature3', 'benefit1', 'benefit2', 'stock'],
      usageCount: 67,
      createdAt: '2026-04-20',
    },
  ]);

  const currentTemplate = templates.find(t => t.id === selectedTemplate);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Template copiado para a área de transferência!');
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    if (selectedTemplate === id) {
      setSelectedTemplate(templates[0]?.id || '');
    }
  };

  return (
    <div className="content-template bg-slate-900 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Copy className="w-5 h-5 text-cyan-400" />
          Templates de Conteúdo
        </h3>
        <button
          onClick={() => setShowNewTemplate(!showNewTemplate)}
          className="flex items-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lista de templates */}
        <div className="lg:col-span-1 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h4 className="text-sm font-semibold text-white mb-3">Templates Disponíveis</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedTemplate === template.id
                    ? 'bg-cyan-600 border border-cyan-500'
                    : 'bg-slate-700 border border-slate-600 hover:bg-slate-600'
                }`}
              >
                <p className="font-medium text-white text-sm">{template.name}</p>
                <p className="text-xs text-gray-400">{template.category}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {template.usageCount} usos
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Detalhes do template */}
        <div className="lg:col-span-2">
          {currentTemplate && (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      {currentTemplate.name}
                    </h4>
                    <p className="text-sm text-gray-400">{currentTemplate.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => deleteTemplate(currentTemplate.id)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Categoria</p>
                    <p className="text-white font-medium">{currentTemplate.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Criado em</p>
                    <p className="text-white font-medium">{currentTemplate.createdAt}</p>
                  </div>
                </div>
              </div>

              {/* Variáveis */}
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h5 className="text-sm font-semibold text-white mb-3">Variáveis</h5>
                <div className="flex flex-wrap gap-2">
                  {currentTemplate.variables.map((variable) => (
                    <span
                      key={variable}
                      className="bg-cyan-900 text-cyan-200 text-xs px-2 py-1 rounded font-mono"
                    >
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              </div>

              {/* Conteúdo do template */}
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h5 className="text-sm font-semibold text-white mb-3">Conteúdo</h5>
                <div className="bg-slate-900 rounded p-3 text-sm text-gray-300 font-mono whitespace-pre-wrap break-words max-h-48 overflow-y-auto border border-slate-700">
                  {currentTemplate.content}
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-3">
                <button
                  onClick={() => copyToClipboard(currentTemplate.content)}
                  className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copiar Template
                </button>
                <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition-colors">
                  Usar Template
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Novo template */}
      {showNewTemplate && (
        <div className="mt-6 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h4 className="text-sm font-semibold text-white mb-4">Criar Novo Template</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nome do template"
              className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm placeholder-gray-500"
            />
            <input
              type="text"
              placeholder="Categoria"
              className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm placeholder-gray-500"
            />
            <textarea
              placeholder="Conteúdo do template (use {{variável}} para placeholders)"
              rows={5}
              className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm placeholder-gray-500 font-mono"
            />
            <div className="flex gap-2">
              <button className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 rounded-lg transition-colors">
                Criar Template
              </button>
              <button
                onClick={() => setShowNewTemplate(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
