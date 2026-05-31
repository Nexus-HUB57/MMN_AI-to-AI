export const useAffiliates = () => {
  const network = {
    id: "root",
    name: "Você",
    level: 0,
    sales: 0,
    commissions: 0,
    status: "active" as const,
    children: [
      {
        id: "2",
        name: "João Silva",
        level: 1,
        sales: 12,
        commissions: 480,
        status: "active" as const,
      },
      {
        id: "3",
        name: "Maria Souza",
        level: 1,
        sales: 9,
        commissions: 315,
        status: "active" as const,
      },
    ],
  };

  return {
    network,
    isLoading: false,
    error: null,
  };
};
