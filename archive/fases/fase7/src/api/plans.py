"""
Rotas de Planos

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from typing import Dict, Any
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

from ..config import Config, PlanType

router = APIRouter(prefix="/plans", tags=["Planos"])

class PlanResponse(BaseModel):
    """Response de plano"""
    id: str
    name: str
    price_monthly: float | None
    price_yearly: float | None
    features: Dict[str, Any]

class PlansListResponse(BaseModel):
    """Response com lista de planos"""
    plans: list

def config_to_plans(config: Config) -> PlansListResponse:
    """Converte configuração para formato de resposta"""
    plans = []

    plan_names = {
        PlanType.STARTER: "Starter",
        PlanType.PROFESSIONAL: "Professional",
        PlanType.ENTERPRISE: "Enterprise"
    }

    plan_prices_monthly = {
        PlanType.STARTER: 2997.00,
        PlanType.PROFESSIONAL: 7997.00,
        PlanType.ENTERPRISE: None
    }

    plan_prices_yearly = {
        PlanType.STARTER: 28772.00,
        PlanType.PROFESSIONAL: 76772.00,
        PlanType.ENTERPRISE: None
    }

    for plan_type, features in config.plans.items():
        plans.append({
            "id": plan_type.value,
            "name": plan_names.get(plan_type, plan_type.value),
            "price_monthly": plan_prices_monthly.get(plan_type),
            "price_yearly": plan_prices_yearly.get(plan_type),
            "features": {
                "users": features.users,
                "domains": features.domains,
                "api_calls_per_month": features.api_calls_per_month,
                "commission": f"{features.commission_rate * 100:.0f}%",
                "storage_gb": features.storage_gb,
                "bandwidth_gb": features.bandwidth_gb,
                "support": features.support_level,
                "custom_emails": features.custom_emails,
                "sla": features.sla,
                "dedicated_support": features.dedicated_support
            }
        })

    return {"plans": plans}


@router.get("")
async def list_plans(request: Request):
    """Lista todos os planos disponíveis"""
    config: Config = request.app.state.config
    return config_to_plans(config)


@router.get("/{plan_id}")
async def get_plan(
    request: Request,
    plan_id: str
):
    """Obtém detalhes de um plano específico"""
    config: Config = request.app.state.config

    try:
        plan_type = PlanType(plan_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Plano não encontrado")

    plans_data = config_to_plans(config)
    plan = next((p for p in plans_data["plans"] if p["id"] == plan_id), None)

    if not plan:
        raise HTTPException(status_code=404, detail="Plano não encontrado")

    return plan