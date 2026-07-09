"""
Modelos de Webhooks

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, AnyStr
from pydantic import BaseModel, Field, validator, HttpUrl
from enum import Enum
from .base import UUIDModel

class WebhookEvent(str, Enum):
    """Eventos disponíveis para webhooks"""
    # Instância
    INSTANCE_CREATED = "instance.created"
    INSTANCE_ACTIVATED = "instance.activated"
    INSTANCE_SUSPENDED = "instance.suspended"
    INSTANCE_CANCELLED = "instance.cancelled"

    # Usuário
    USER_SIGNUP = "user.signup"
    USER_ACTIVATION = "user.activation"
    USER_LOGIN = "user.login"
    USER_LOGOUT = "user.logout"

    # Comissão
    COMMISSION_CREDITED = "commission.credited"
    COMMISSION_PAID = "commission.paid"

    # Pedido
    ORDER_COMPLETED = "order.completed"
    ORDER_CANCELLED = "order.cancelled"

    # Rede
    RANK_UPGRADED = "rank.upgraded"

    # Billing
    PLAN_UPGRADED = "plan.upgraded"
    PLAN_DOWNGRADED = "plan.downgraded"
    PAYMENT_SUCCESS = "payment.success"
    PAYMENT_FAILED = "payment.failed"

class Webhook(BaseModel):
    """Modelo de Webhook"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    instance_id: str
    url: str = Field(..., description="URL do endpoint")
    events: List[WebhookEvent] = Field(..., description="Eventos a serem disparados")
    secret_hash: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_triggered_at: Optional[datetime] = None
    failure_count: int = 0

    class Config:
        use_enum_values = True

    def should_trigger(self, event: str) -> bool:
        """Verifica se deve disparar para este evento"""
        return event in self.events and self.is_active

class WebhookCreateRequest(BaseModel):
    """Request para criar webhook"""
    url: str = Field(..., description="URL do endpoint do webhook")
    events: List[str] = Field(..., description="Lista de eventos")
    secret: Optional[str] = Field(None, description="Segredo para assinatura")

    @validator('url')
    def validate_url(cls, v):
        """Valida URL"""
        import re
        pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        if not re.match(pattern, v):
            raise ValueError("URL inválida")
        return v

    @validator('events')
    def validate_events(cls, v):
        """Valida eventos"""
        valid_events = [e.value for e in WebhookEvent]
        for event in v:
            if event not in valid_events:
                raise ValueError(f"Evento inválido: {event}")
        return v

class WebhookLog(BaseModel):
    """Log de execução de webhook"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    webhook_id: str
    event_type: str
    payload: Dict[str, Any]
    response_status: Optional[int] = None
    response_body: Optional[str] = None
    attempt_count: int = 1
    delivered_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    error: Optional[str] = None

class WebhookDeliveryPayload(BaseModel):
    """Payload enviado para o webhook"""
    event_type: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    instance_id: str
    data: Dict[str, Any]
    signature: Optional[str] = None

    def sign(self, secret: str) -> str:
        """Gera assinatura HMAC do payload"""
        import hmac
        import hashlib
        import json

        payload_str = json.dumps(self.data, sort_keys=True)
        signature = hmac.new(
            secret.encode(),
            payload_str.encode(),
            hashlib.sha256
        ).hexdigest()
        return f"sha256={signature}"

class WebhookTestRequest(BaseModel):
    """Request para testar webhook"""
    event: str = Field(..., description="Evento de teste")

class WebhookTestResponse(BaseModel):
    """Response do teste de webhook"""
    success: bool
    status_code: Optional[int] = None
    response_time_ms: Optional[int] = None
    error: Optional[str] = None

# Import uuid
import uuid