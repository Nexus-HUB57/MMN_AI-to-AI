"""
Modelos de dados para o sistema White-Label

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from .base import BaseModel, UUIDModel, TimestampedModel
from .instance import Instance, InstanceStatus, InstanceCreate, InstanceUpdate
from .plan import Plan, PlanFeatures
from .branding import BrandingConfig, BrandingColors, BrandingFonts, BrandingLogo
from .domain import DomainAlias, DomainType, VerificationStatus
from .api_key import ApiKey, ApiKeyType
from .webhook import Webhook, WebhookEvent

__all__ = [
    "BaseModel",
    "UUIDModel",
    "TimestampedModel",
    "Instance",
    "InstanceStatus",
    "InstanceCreate",
    "InstanceUpdate",
    "Plan",
    "PlanFeatures",
    "BrandingConfig",
    "BrandingColors",
    "BrandingFonts",
    "BrandingLogo",
    "DomainAlias",
    "DomainType",
    "VerificationStatus",
    "ApiKey",
    "ApiKeyType",
    "Webhook",
    "WebhookEvent",
]