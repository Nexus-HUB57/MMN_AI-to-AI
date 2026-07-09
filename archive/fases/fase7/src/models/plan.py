"""
Modelo de Planos e Features

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from decimal import Decimal

class PlanFeatures(BaseModel):
    """Features disponíveis em um plano"""
    users: int = Field(..., description="Número máximo de usuários (-1 para ilimitado)")
    domains: int = Field(..., description="Número máximo de domínios customizados")
    api_calls_per_month: int = Field(..., description="Chamadas de API por mês")
    commission_rate: float = Field(..., ge=0, le=1, description="Taxa de comissão (0.05 = 5%)")
    storage_gb: int = Field(..., description="Armazenamento em GB")
    bandwidth_gb: int = Field(..., description="Bandwidth em GB")
    support_level: str = Field(..., description="Nível de suporte (email, priority, dedicated)")
    custom_emails: bool = Field(False, description="Emails com domínio próprio")
    dedicated_support: bool = Field(False, description="Suporte dedicado")
    sla: str = Field("99%", description="SLA de disponibilidade")
    white_label_subdomains: int = Field(1, description="Número de subdomínios customizados")
    analytics_advanced: bool = Field(False, description="Analytics avançado")
    api_rate_limit: int = Field(1000, description="Rate limit por minuto")

class Plan(BaseModel):
    """Modelo de plano"""
    id: str
    name: str
    price_monthly: Optional[float] = None
    price_yearly: Optional[float] = None
    is_active: bool = True
    features: PlanFeatures

    def get_feature(self, feature_name: str) -> Any:
        """Obtém valor de uma feature específica"""
        return getattr(self.features, feature_name, None)

    def has_feature(self, feature_name: str) -> bool:
        """Verifica se possui uma feature"""
        return hasattr(self.features, feature_name)

    def is_unlimited(self, feature_name: str) -> bool:
        """Verifica se feature é ilimitada"""
        value = self.get_feature(feature_name)
        return value == -1 if value is not None else False

class PlanResponse(BaseModel):
    """Response com lista de planos"""
    plans: List[Plan]

    @classmethod
    def from_config(cls, plans_config: Dict):
        """Cria response a partir de configuração"""
        plans = []
        for plan_id, features in plans_config.items():
            plan = Plan(
                id=plan_id,
                name=plan_id.replace('_', ' ').title(),
                price_monthly=features.get("price_monthly"),
                price_yearly=features.get("price_yearly"),
                features=PlanFeatures(**features.get("features", {}))
            )
            plans.append(plan)
        return cls(plans=plans)