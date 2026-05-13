import React from 'react';

export const PerformanceReport: React.FC = () => {
  // Mock de dados de relatório de performance
  const reportData = {
    totalSales: 15000.00,
    totalCommissions: 3000.00,
    activeAffiliates: 50,
    conversionRate: '5%',
  };

  return (
    <div className="performance-report">
      <h3>Relatório de Performance</h3>
      <ul>
        <li>Vendas Totais: R$ {reportData.totalSales.toFixed(2)}</li>
        <li>Comissões Totais: R$ {reportData.totalCommissions.toFixed(2)}</li>
        <li>Afiliados Ativos: {reportData.activeAffiliates}</li>
        <li>Taxa de Conversão: {reportData.conversionRate}</li>
      </ul>
    </div>
  );
};
