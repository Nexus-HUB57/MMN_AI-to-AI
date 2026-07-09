"""
Serviço de Gerenciamento de Webhooks

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from typing import List, Optional, Dict, Any, Callable
from datetime import datetime
import logging
import asyncio
import aiohttp
import json
import hashlib
import hmac
import time

from ..models.webhook import (
    Webhook, WebhookEvent, WebhookCreateRequest,
    WebhookLog, WebhookDeliveryPayload, WebhookTestResponse
)

logger = logging.getLogger(__name__)

class WebhookService:
    """Serviço para gerenciamento de webhooks"""

    def __init__(self, config=None):
        self.config = config
        self._webhooks: Dict[str, Webhook] = {}
        self._logs: List[WebhookLog] = []
        self._handlers: Dict[str, List[Callable]] = {}

    def create_webhook(
        self, instance_id: str, data: WebhookCreateRequest
    ) -> Webhook:
        """Cria novo webhook"""
        import uuid

        webhook = Webhook(
            id=str(uuid.uuid4()),
            instance_id=instance_id,
            url=data.url,
            events=[WebhookEvent(e) for e in data.events],
            secret_hash=self._hash_secret(data.secret) if data.secret else None,
            is_active=True
        )

        self._webhooks[webhook.id] = webhook
        logger.info(f"Webhook criado: {webhook.id} para {webhook.url}")

        return webhook

    def get_webhooks(self, instance_id: str) -> List[Webhook]:
        """Lista webhooks de uma instância"""
        return [
            w for w in self._webhooks.values()
            if w.instance_id == instance_id and w.is_active
        ]

    def get_webhook(self, webhook_id: str) -> Optional[Webhook]:
        """Obtém webhook específico"""
        return self._webhooks.get(webhook_id)

    def delete_webhook(self, webhook_id: str) -> bool:
        """Remove webhook"""
        if webhook_id in self._webhooks:
            self._webhooks[webhook_id].is_active = False
            logger.info(f"Webhook desativado: {webhook_id}")
            return True
        return False

    def register_handler(self, event: str, handler: Callable):
        """Registra handler para evento"""
        if event not in self._handlers:
            self._handlers[event] = []
        self._handlers[event].append(handler)

    async def trigger_event(
        self, instance_id: str, event: str, data: Dict[str, Any]
    ):
        """Dispara evento para todos os webhooks interessados"""
        webhooks = self.get_webhooks(instance_id)
        matching_webhooks = [w for w in webhooks if w.should_trigger(event)]

        if not matching_webhooks:
            logger.debug(f"Nenhum webhook registrado para evento: {event}")
            return

        payload = WebhookDeliveryPayload(
            event_type=event,
            instance_id=instance_id,
            data=data
        )

        tasks = [
            self._send_webhook(webhook, payload)
            for webhook in matching_webhooks
        ]

        await asyncio.gather(*tasks, return_exceptions=True)

    async def _send_webhook(self, webhook: Webhook, payload: WebhookDeliveryPayload):
        """Envia webhook para endpoint"""
        log = WebhookLog(
            webhook_id=webhook.id,
            event_type=payload.event_type,
            payload=payload.data
        )

        try:
            # Gera assinatura se houver segredo
            if webhook.secret_hash:
                payload.signature = payload.sign(webhook.secret_hash)

            headers = {
                "Content-Type": "application/json",
                "User-Agent": "MMN-WhiteLabel-Webhook/1.0"
            }
            if payload.signature:
                headers["X-Webhook-Signature"] = payload.signature

            start_time = time.time()

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    webhook.url,
                    json=payload.dict(),
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    response_time = int((time.time() - start_time) * 1000)
                    log.response_status = response.status
                    log.response_body = await response.text()
                    log.delivered_at = datetime.utcnow()

                    if response.status >= 200 and response.status < 300:
                        logger.info(f"Webhook entregue: {webhook.id}")
                    else:
                        log.error = f"HTTP {response.status}"
                        logger.warning(f"Webhook falhou: {webhook.id} - {response.status}")

        except Exception as e:
            log.error = str(e)
            log.attempt_count += 1
            logger.error(f"Erro ao enviar webhook: {webhook.id} - {e}")

        finally:
            self._logs.append(log)

    async def test_webhook(
        self, webhook_id: str, event: str = "test.event"
    ) -> WebhookTestResponse:
        """Testa webhook com evento de teste"""
        webhook = self._webhooks.get(webhook_id)
        if not webhook:
            return WebhookTestResponse(
                success=False,
                error="Webhook não encontrado"
            )

        test_payload = WebhookDeliveryPayload(
            event_type=event,
            instance_id=webhook.instance_id,
            data={
                "test": True,
                "message": "Este é um webhook de teste",
                "timestamp": datetime.utcnow().isoformat()
            }
        )

        try:
            start_time = time.time()

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    webhook.url,
                    json=test_payload.dict(),
                    headers={"Content-Type": "application/json"},
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    response_time = int((time.time() - start_time) * 1000)

                    return WebhookTestResponse(
                        success=200 <= response.status < 300,
                        status_code=response.status,
                        response_time_ms=response_time
                    )

        except Exception as e:
            return WebhookTestResponse(
                success=False,
                error=str(e)
            )

    def get_logs(
        self, webhook_id: str, limit: int = 100
    ) -> List[WebhookLog]:
        """Obtém logs de um webhook"""
        return [
            log for log in self._logs
            if log.webhook_id == webhook_id
        ][:limit]

    def _hash_secret(self, secret: str) -> str:
        """Gera hash do segredo"""
        return hashlib.sha256(secret.encode()).hexdigest()

    def get_webhook_stats(self, webhook_id: str) -> Dict[str, Any]:
        """Obtém estatísticas de um webhook"""
        logs = self.get_logs(webhook_id)

        total = len(logs)
        successful = sum(1 for log in logs if 200 <= (log.response_status or 0) < 300)
        failed = total - successful

        return {
            "webhook_id": webhook_id,
            "total_deliveries": total,
            "successful": successful,
            "failed": failed,
            "success_rate": (successful / total * 100) if total > 0 else 0,
            "last_delivery": logs[0].delivered_at.isoformat() if logs else None
        }