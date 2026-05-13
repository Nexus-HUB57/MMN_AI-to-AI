import React from 'react';
import { useCommissions } from '../hooks/useCommissions';

export const CommissionChart: React.FC = () => {
  const { commissions, isLoading, error } = useCommissions();

  if (isLoading) return <div>Carregando comissões...</div>;
  if (error) return <div>Erro ao carregar comissões: {error.message}</div>;

  // Lógica para renderizar um gráfico de comissões (placeholder)
  return (
    <div className="commission-chart">
      <h3>Gráfico de Comissões</h3>
      {commissions && commissions.length > 0 ? (
        <ul>
          {commissions.map(commission => (
            <li key={commission.id}>
              {commission.date}: {commission.amount} ({commission.status})
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma comissão encontrada.</p>
      )}
    </div>
  );
};
