import React, { useState } from 'react';
import { Download, FileText, FileJson } from 'lucide-react';

interface DataExportProps {
  data: any[];
  filename?: string;
  title?: string;
}

export const DataExport: React.FC<DataExportProps> = ({
  data,
  filename = 'export',
  title = 'Exportar Dados'
}) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  // Get all available columns from data
  const getAllColumns = (): string[] => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  };

  const columns = getAllColumns();

  // Toggle column selection
  const toggleColumn = (column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  // Select/Deselect all columns
  const toggleAllColumns = () => {
    if (selectedColumns.length === columns.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(columns);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const columnsToExport = selectedColumns.length > 0 ? selectedColumns : columns;
    
    // Create CSV header
    const header = columnsToExport.join(',');
    
    // Create CSV rows
    const rows = data.map(row =>
      columnsToExport.map(col => {
        const value = row[col];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );

    const csv = [header, ...rows].join('\n');
    downloadFile(csv, `${filename}.csv`, 'text/csv');
  };

  // Export to JSON
  const exportToJSON = () => {
    const columnsToExport = selectedColumns.length > 0 ? selectedColumns : columns;
    
    const jsonData = data.map(row => {
      const obj: any = {};
      columnsToExport.forEach(col => {
        obj[col] = row[col];
      });
      return obj;
    });

    const json = JSON.stringify(jsonData, null, 2);
    downloadFile(json, `${filename}.json`, 'application/json');
  };

  // Download file helper
  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV();
    } else {
      exportToJSON();
    }
  };

  return (
    <div className="data-export bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      {data.length === 0 ? (
        <p className="text-slate-400">Nenhum dado disponível para exportar.</p>
      ) : (
        <>
          {/* Format Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Formato de Exportação
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                  className="w-4 h-4"
                />
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">CSV</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                  className="w-4 h-4"
                />
                <FileJson className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">JSON</span>
              </label>
            </div>
          </div>

          {/* Column Selection */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Selecionar Colunas
              </label>
              <button
                onClick={toggleAllColumns}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                {selectedColumns.length === columns.length ? 'Desselecionar Tudo' : 'Selecionar Tudo'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-slate-700 p-3 rounded">
              {columns.map(col => (
                <label key={col} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(col)}
                    onChange={() => toggleColumn(col)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-300">{col}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar como {exportFormat.toUpperCase()}
          </button>

          {/* Info */}
          <p className="text-xs text-slate-400 mt-2">
            Total de registros: {data.length}
          </p>
        </>
      )}
    </div>
  );
};
