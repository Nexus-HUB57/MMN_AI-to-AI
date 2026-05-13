import React from 'react';

export const SalesHistory: React.FC = () => {
  // Mock de dados de histórico de vendas
  const sales = [
    { id: 's1', product: 'Produto A', amount: 250.00, date: '2026-05-01' },
    { id: 's2', product: 'Produto B', amount: 120.00, date: '2026-05-05' },
    { id: 's3', product: 'Produto C', amount: 300.00, date: '2026-05-08' },
  ];

  return (
    <div className="sales-history">
      <h3>Histórico de Vendas</h3>
      {sales && sales.length > 0 ? (
        <ul>
          {sales.map(sale => (
            <li key={sale.id}>
              {sale.date}: {sale.product} - R$ {sale.amount.toFixed(2)}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum histórico de vendas encontrado.</p>
      )}
    </div>
  );
};
