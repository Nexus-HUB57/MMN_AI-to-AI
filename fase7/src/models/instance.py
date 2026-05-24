"""
Modelo de Instância White-Label

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import Field, validator, HttpUrl
from enum import Enum
from .base import UUIDModel, TimestampedModel, MetadataModel

class InstanceStatus(str, Enum):
    """Status de uma instância"""
    PROVISIONING = "provisioning"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    CANCELLED = "cancelled"

class InstanceCreate(BaseModel):
    """Schema para criação de instância"""
    brand_name: str = Field(..., min_length=2, max_length=255, description="Nome da marca")
    brand_slug: Optional[str] = Field(None, max_length=100, description="Slug da marca (URL-friendly)")
    plan: str = Field(..., description="Tipo do plano (starter, professional, enterprise)")
    admin_email: str = Field(..., description="Email do administrador")
    admin_name: str = Field(..., description="Nome do administrador")
    country: Optional[str] = Field("BR", max_length=3, description="Código do país")
    timezone: Optional[str] = Field("America/Sao_Paulo", description="Fuso horário")
    currency: Optional[str] = Field("BRL", max_length=3, description="Moeda")

    @validator('brand_slug', always=True)
    def generate_slug(cls, v, values):
        """Gera slug automaticamente se não fornecido"""
        if v is None and 'brand_name' in values:
            import re
            slug = values['brand_name'].lower().strip()
            slug = re.sub(r'[^\w\s-]', '', slug)
            slug = re.sub(r'[-\s]+', '-', slug)
            return slug[:100]
        return v

    @validator('plan')
    def validate_plan(cls, v):
        """Valida tipo de plano"""
        valid_plans = ['starter', 'professional', 'enterprise']
        if v not in valid_plans:
            raise ValueError(f"Plano inválido. Opções: {valid_plans}")
        return v

class InstanceUpdate(BaseModel):
    """Schema para atualização de instância"""
    brand_name: Optional[str] = Field(None, min_length=2, max_length=255)
    plan: Optional[str] = Field(None, description="Novo plano")
    timezone: Optional[str] = Field(None)
    currency: Optional[str] = Field(None, max_length=3)

    @validator('plan')
    def validate_plan(cls, v):
        """Valida tipo de plano"""
        if v is not None:
            valid_plans = ['starter', 'professional', 'enterprise']
            if v not in valid_plans:
                raise ValueError(f"Plano inválido. Opções: {valid_plans}")
        return v

class Instance(UUIDModel, TimestampedModel, MetadataModel):
    """Modelo de instância White-Label"""
    instance_id: str = Field(..., description="ID único da instância (ex: inst_abc123)")
    brand_name: str
    brand_slug: str
    plan: str
    status: InstanceStatus = InstanceStatus.PROVISIONING
    admin_user_id: Optional[str] = None
    country: str = "BR"
    timezone: str = "America/Sao_Paulo"
    currency: str = "BRL"
    custom_domain: Optional[str] = None
    dashboard_url: Optional[str] = None
    api_endpoint: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    activated_at: Optional[datetime] = None
    suspended_at: Optional[datetime] = None

    class Config:
        use_enum_values = True

    def to_dict(self) -> Dict[str, Any]:
        """Converte para dicionário"""
        return {
            "instance_id": self.instance_id,
            "brand_name": self.brand_name,
            "brand_slug": self.brand_slug,
            "plan": self.plan,
            "status": self.status,
            "country": self.country,
            "timezone": self.timezone,
            "currency": self.currency,
            "custom_domain": self.custom_domain,
            "dashboard_url": self.dashboard_url,
            "api_endpoint": self.api_endpoint,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "activated_at": self.activated_at.isoformat() if self.activated_at else None,
            "suspended_at": self.suspended_at.isoformat() if self.suspended_at else None
        }

    @classmethod
    def generate_instance_id(cls) -> str:
        """Gera um ID único para instância"""
        import random
        import string
        suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=12))
        return f"inst_{suffix}"

    def get_urls(self, base_url: str = "https://admin.mmn-ai-to-ai.com") -> Dict[str, str]:
        """Gera URLs da instância"""
        slug = self.brand_slug
        return {
            "dashboard": f"https://admin.{slug}.mmn-ai-to-ai.com",
            "api": f"https://api.{slug}.mmn-ai-to-ai.com/v1",
            "app": f"https://app.{slug}.mmn-ai-to-ai.com"
        }

class InstanceListResponse(BaseModel):
    """Response para listagem de instâncias"""
    data: List[Instance]
    pagination: Dict[str, int] = Field(..., description="Informações de paginação")

    class Pagination(BaseModel):
        page: int
        limit: int
        total: int
        pages: int