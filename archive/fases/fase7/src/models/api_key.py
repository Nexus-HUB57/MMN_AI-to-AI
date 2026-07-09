"""
Modelos de API Keys

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum
from .base import UUIDModel

class ApiKeyType(str, Enum):
    """Tipos de API Key"""
    PARTNER = "partner"  # Gerenciar instâncias próprias
    ADMIN = "admin"      # Acesso total à plataforma
    INSTANCE = "instance"  # Operações dentro de uma instância

class ApiKey(BaseModel):
    """Modelo de API Key"""
    id: str
    instance_id: Optional[str] = None
    key_prefix: str = Field(..., description="Prefixo da key (ex: wl_live_)")
    key_type: ApiKeyType
    permissions: List[str] = Field(default_factory=list)
    rate_limit: int = Field(1000, description="Rate limit por hora")
    last_used_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    revoked_at: Optional[datetime] = None
    is_active: bool = True

    class Config:
        use_enum_values = True

    @property
    def is_expired(self) -> bool:
        """Verifica se a key está expirada"""
        if self.expires_at is None:
            return False
        return datetime.utcnow() > self.expires_at

    @property
    def is_revoked(self) -> bool:
        """Verifica se a key foi revocada"""
        return self.revoked_at is not None

    @property
    def is_valid(self) -> bool:
        """Verifica se a key é válida"""
        return self.is_active and not self.is_expired and not self.is_revoked

class ApiKeyCreateRequest(BaseModel):
    """Request para criar API Key"""
    instance_id: Optional[str] = None
    key_type: ApiKeyType
    permissions: Optional[List[str]] = None
    rate_limit: Optional[int] = Field(None, ge=100, le=100000)
    expires_in_days: Optional[int] = Field(None, ge=1, le=365)

    @validator('key_type')
    def validate_type(cls, v):
        """Valida tipo de key"""
        valid_types = ['partner', 'admin', 'instance']
        if v not in valid_types:
            raise ValueError(f"Tipo inválido. Opções: {valid_types}")
        return v

class ApiKeyResponse(BaseModel):
    """Response com dados da API Key (inclui key secreta apenas na criação)"""
    id: str
    key_prefix: str
    key: Optional[str] = Field(None, description="Chave completa (apenas na criação)")
    key_type: str
    permissions: List[str]
    rate_limit: int
    expires_at: Optional[datetime]
    created_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class ApiKeyListResponse(BaseModel):
    """Response com lista de API Keys (sem a chave secreta)"""
    data: List[ApiKeyResponse]
    total: int