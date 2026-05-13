import { trpc } from '../lib/trpc';

export const useCommissions = () => {
  // Exemplo de uso do tRPC para buscar comissões
  // const commissionsQuery = trpc.getCommissions.useQuery();
  
  // Mock de dados enquanto o tRPC não está totalmente configurado
  const data = [
    { id: '1', amount: 150.00, date: '2026-05-10', status: 'paid' },
    { id: '2', amount: 75.50, date: '2026-05-12', status: 'pending' },
  ];

  return {
    commissions: data,
    isLoading: false,
    error: null,
  };
};
