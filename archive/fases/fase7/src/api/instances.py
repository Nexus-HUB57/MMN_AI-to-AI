"""
Rotas de Instâncias

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from typing import Optional
from fastapi import APIRouter, Depends, Request, HTTPException, status
from fastapi.responses import JSONResponse

from ..models.instance import (
    Instance, InstanceCreate, InstanceUpdate, InstanceStatus
)
from ..services.instance_service import InstanceService
from ..middleware.auth import require_auth
from ..middleware.rate_limit import rate_limit, RateLimits

router = APIRouter(prefix="/instances", tags=["Instâncias"])

def get_instance_service(request: Request) -> InstanceService:
    """Dependency para obter instance service"""
    return request.app.state.instance_service


@router.post("", response_model=Instance, status_code=status.HTTP_201_CREATED)
@rate_limit(*RateLimits.CREATE_INSTANCE)
async def create_instance(
    request: Request,
    data: InstanceCreate
):
    """Cria uma nova instância White-Label"""
    service = get_instance_service(request)

    try:
        instance = service.create_instance(data)
        return instance
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("")
async def list_instances(
    request: Request,
    status: Optional[str] = None,
    plan: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    """Lista instâncias com filtros e paginação"""
    service = get_instance_service(request)

    result = service.list_instances(
        status=status,
        plan=plan,
        page=page,
        limit=min(limit, 100)
    )

    return result


@router.get("/{instance_id}")
async def get_instance(
    request: Request,
    instance_id: str
):
    """Obtém instância por ID"""
    service = get_instance_service(request)

    instance = service.get_instance(instance_id)
    if not instance:
        raise HTTPException(status_code=404, detail="Instância não encontrada")

    return instance


@router.patch("/{instance_id}")
async def update_instance(
    request: Request,
    instance_id: str,
    data: InstanceUpdate
):
    """Atualiza instância"""
    service = get_instance_service(request)

    instance = service.update_instance(instance_id, data)
    if not instance:
        raise HTTPException(status_code=404, detail="Instância não encontrada")

    return instance


@router.post("/{instance_id}/suspend")
async def suspend_instance(
    request: Request,
    instance_id: str
):
    """Suspende instância"""
    service = get_instance_service(request)

    instance = service.suspend_instance(instance_id)
    if not instance:
        raise HTTPException(status_code=404, detail="Instância não encontrada")

    return {"message": "Instância suspensa", "instance": instance}


@router.post("/{instance_id}/activate")
async def activate_instance(
    request: Request,
    instance_id: str
):
    """Ativa instância"""
    service = get_instance_service(request)

    instance = service.activate_instance(instance_id)
    if not instance:
        raise HTTPException(status_code=404, detail="Instância não encontrada")

    return {"message": "Instância ativada", "instance": instance}


@router.delete("/{instance_id}")
async def cancel_instance(
    request: Request,
    instance_id: str
):
    """Cancela instância"""
    service = get_instance_service(request)

    instance = service.cancel_instance(instance_id)
    if not instance:
        raise HTTPException(status_code=404, detail="Instância não encontrada")

    return {"message": "Instância cancelada", "instance": instance}