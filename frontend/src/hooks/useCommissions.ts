type HookCommissionStatus = "pending" | "approved" | "paid";

type HookCommission = {
  id: string;
  amount: number;
  date: string;
  status: HookCommissionStatus;
  source: string;
};

export const useCommissions = () => {
  const commissions: HookCommission[] = [
    {
      id: "1",
      amount: 150.0,
      date: "2026-05-10",
      status: "paid",
      source: "Venda direta · Pack Nexus Start",
    },
    {
      id: "2",
      amount: 75.5,
      date: "2026-05-12",
      status: "pending",
      source: "Indicação ativa · Upgrade de carreira",
    },
    {
      id: "3",
      amount: 98.9,
      date: "2026-05-18",
      status: "approved",
      source: "Marketplace · Skill social-seller",
    },
  ];

  return {
    commissions,
    isLoading: false,
    error: null,
  };
};
