import { trpc } from '../lib/trpc';

export const useAffiliates = () => {
  // Exemplo de uso do tRPC para buscar rede de afiliados
  // const affiliatesQuery = trpc.getAffiliateNetwork.useQuery();
  
  // Mock de dados da rede
  const network = {
    id: 'root',
    name: 'Você',
    children: [
      { id: '2', name: 'João Silva', level: 1 },
      { id: '3', name: 'Maria Souza', level: 1 },
    ],
  };

  return {
    network,
    isLoading: false,
    error: null,
  };
};
