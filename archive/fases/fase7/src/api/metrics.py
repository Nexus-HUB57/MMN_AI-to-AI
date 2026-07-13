"""
Rotas de Métricas

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from typing import Optional
from fastapi import APIRouter, Request, HTTPException, Query

from ..services.instance_service import InstanceService

router = APIRouter(prefix="/metrics", tags=["Métricas"])

def get_instance_service(request: Request) -> InstanceService:
    """Dependency para obter instance service"""
    return request.app.state.instance_service


@router.get("/{instance_id}")
async def get_instance_metrics(
    request: Request,
    instance_id: str,
    period: str = Query("30d", description="Período (7d, 30d, 90d)")
):
    """Obtém métricas da instância"""
    service = get_instance_service(request)

    metrics = service.get_instance_metrics(instance_id)
    if not metrics:
        raise HTTPException(status_code=404, detail="Instância não encontrada")

    metrics["period"] = period
    return metrics


@router.get("/{instance_id}/users")
async def get_user_metrics(
    request: Request,
    instance_id: str
):
    """Obtém métricas de usuários"""
    service = get_instance_service(request)

    if not service.get_instance(instance_id):
        raise HTTPException(status_code=404, detail="Instância não encontrada")

    # Métricas simuladas
    return {
        "total": 1520,
        "active": 1280,
        "inactive": 240,
        "new_30d": 145,
        "growth_rate": 12.5
    }


@router.get("/{instance_id}/revenue")
async def get_revenue_metrics(
    request: Request,
    instance_id: str
):
    """Obtém métricas de receita"""
    service = get_instance_service(request)

    if not service.get_instance(instance_id):
        raise HTTPException(status_code=404, detail="Instância não encontrada")

    return {
        "gmv": 245000.00,
        "commissions_paid": 24500.00,
        "pending_commissions": 3200.00,
        "currency": "BRL"
    }


@router.get("/{instance_id}/network")
async def get_network_metrics(
    request: Request,
    instance_id: str
):
    """Obtém métricas da rede"""
    service = get_instance_service(request)

    if not service.get_instance(instance_id):
        raise HTTPException(status_code=404, detail="Instância não encontrada")

    return {
        "total_partners": 1520,
        "active_partners": 850,
        "top_performers": 25,
        "average_depth": 4.2,
        "conversion_rate": 3.2
    }