"""
Rotas de Webhooks

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

from ..models.webhook import (
    Webhook, WebhookCreateRequest, WebhookTestRequest, WebhookTestResponse
)
from ..services.webhook_service import WebhookService
from ..middleware.rate_limit import rate_limit, RateLimits

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

class WebhookListResponse(BaseModel):
    """Response de listagem de webhooks"""
    data: list

def get_webhook_service(request: Request) -> WebhookService:
    """Dependency para obter webhook service"""
    return request.app.state.webhook_service


@router.get("/{instance_id}")
async def list_webhooks(
    request: Request,
    instance_id: str
):
    """Lista webhooks da instância"""
    service = get_webhook_service(request)

    webhooks = service.get_webhooks(instance_id)
    return {"data": webhooks}


@router.post("/{instance_id}")
@rate_limit(*RateLimits.CREATE_WEBHOOK)
async def create_webhook(
    request: Request,
    instance_id: str,
    data: WebhookCreateRequest
):
    """Cria novo webhook"""
    service = get_webhook_service(request)

    webhook = service.create_webhook(instance_id, data)
    return webhook


@router.delete("/{instance_id}/{webhook_id}")
async def delete_webhook(
    request: Request,
    instance_id: str,
    webhook_id: str
):
    """Remove webhook"""
    service = get_webhook_service(request)

    success = service.delete_webhook(webhook_id)
    if not success:
        raise HTTPException(status_code=404, detail="Webhook não encontrado")

    return {"message": "Webhook removido"}


@router.post("/{instance_id}/{webhook_id}/test")
@rate_limit(*RateLimits.TEST_WEBHOOK)
async def test_webhook(
    request: Request,
    instance_id: str,
    webhook_id: str
):
    """Testa webhook com evento de teste"""
    service = get_webhook_service(request)

    result = await service.test_webhook(webhook_id)
    return result


@router.get("/{instance_id}/{webhook_id}/logs")
async def get_webhook_logs(
    request: Request,
    instance_id: str,
    webhook_id: str,
    limit: int = 100
):
    """Obtém logs de entrega do webhook"""
    service = get_webhook_service(request)

    logs = service.get_logs(webhook_id, limit=limit)
    return {"data": logs}


@router.get("/{instance_id}/{webhook_id}/stats")
async def get_webhook_stats(
    request: Request,
    instance_id: str,
    webhook_id: str
):
    """Obtém estatísticas do webhook"""
    service = get_webhook_service(request)

    stats = service.get_webhook_stats(webhook_id)
    return stats