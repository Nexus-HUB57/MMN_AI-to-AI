import React, { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';

interface ExportData {
  id: string;
  date: string;
  type: 'commission' | 'sale' | 'affiliate';
  amount?: number;
  description: string;
}

export const DataExport: React.FC = () => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Mock de dados para exportação
  const mockData: ExportData[] = [
    {
      id: '1',
      date: '2026-05-13',
      type: 'commission',
      amount: 500.00,
      description: 'Comissão de vendas - Produto A',
    },
    {
      id: '2',
      date: '2026-05-12',
      type: 'sale',
      amount: 1200.00,
      description: 'Venda direta - Cliente Premium',
    },
    {
      id: '3',
      date: '2026-05-11',
      type: 'affiliate',
      amount: 350.00,
      description: 'Comissão de afiliado - João Silva',
    },
    {
      id: '4',
      date: '2026-05-10',
      type: 'commission',
      amount: 450.00,
      description: 'Comissão de vendas - Produto B',
    },
  ];

  const exportToCSV = () => {
    setIsExporting(true);
    
    // Preparar dados para CSV
    const headers = ['ID', 'Data', 'Tipo', 'Valor', 'Descrição'];
    const rows = mockData.map(item => [
      item.id,
      item.date,
      item.type,
      item.amount?.toFixed(2) || 'N/A',
      item.description,
    ]);

    // Criar conteúdo CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    // Criar blob e download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExporting(false);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const exportToPDF = () => {
    setIsExporting(true);
    
    // Simular exportação para PDF
    // Em produção, usar biblioteca como jsPDF ou pdfkit
    const pdfContent = `
DATA DE EXPORTAÇÃO: ${new Date().toLocaleDateString('pt-BR')}

RELATÓRIO DE DADOS
==================

${mockData.map((item, index) => `
${index + 1}. ${item.description}
   Data: ${item.date}
   Tipo: ${item.type}
   Valor: R$ ${item.amount?.toFixed(2) || 'N/A'}
`).join('\n')}

Total de registros: ${mockData.length}
    `;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `export_${new Date().toISOString().split('T')[0]}.pdf`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExporting(false);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV();
    } else {
      exportToPDF();
    }
  };

  return (
    <div className="data-export bg-slate-900 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-400" />
          Exportar Dados
        </h3>
      </div>

      <div className="space-y-4">
        {/* Seleção de formato */}
        <div className="bg-slate-800 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Formato de Exportação
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setExportFormat('csv')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                exportFormat === 'csv'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              <Table className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => setExportFormat('pdf')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                exportFormat === 'pdf'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>

        {/* Prévia de dados */}
        <div className="bg-slate-800 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Dados a Exportar ({mockData.length} registros)
          </label>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-sm text-gray-300">
              <thead className="sticky top-0 bg-slate-700">
                <tr>
                  <th className="text-left px-2 py-2">Data</th>
                  <th className="text-left px-2 py-2">Tipo</th>
                  <th className="text-right px-2 py-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                {mockData.map((item) => (
                  <tr key={item.id} className="border-t border-slate-700">
                    <td className="px-2 py-2">{item.date}</td>
                    <td className="px-2 py-2 capitalize">{item.type}</td>
                    <td className="px-2 py-2 text-right">
                      {item.amount ? `R$ ${item.amount.toFixed(2)}` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botão de exportação */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
            isExporting
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exportando...' : `Exportar como ${exportFormat.toUpperCase()}`}
        </button>

        {/* Mensagem de sucesso */}
        {exportSuccess && (
          <div className="bg-green-900 border border-green-700 rounded-lg p-3 text-green-200 text-sm">
            ✓ Arquivo exportado com sucesso!
          </div>
        )}
      </div>
    </div>
  );
};
