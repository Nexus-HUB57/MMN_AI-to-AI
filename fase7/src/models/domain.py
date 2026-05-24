"""
Modelos de Domínios Customizados

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, validator, HttpUrl
from enum import Enum
from .base import UUIDModel

class DomainType(str, Enum):
    """Tipo de domínio"""
    PRIMARY = "primary"
    ALIAS = "alias"

class VerificationStatus(str, Enum):
    """Status de verificação do domínio"""
    PENDING = "pending"
    VERIFYING = "verifying"
    VERIFIED = "verified"
    FAILED = "failed"

class DomainAlias(BaseModel):
    """Modelo de domínio customizado"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    instance_id: str
    domain: str = Field(..., description="Domínio completo (ex: plataforma.empresa.com)")
    domain_type: DomainType = DomainType.ALIAS
    ssl_enabled: bool = True
    verification_status: VerificationStatus = VerificationStatus.PENDING
    dns_records: Optional[Dict[str, str]] = None
    verified_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        use_enum_values = True

    @validator('domain')
    def validate_domain(cls, v):
        """Valida formato do domínio"""
        import re
        pattern = r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$'
        if not re.match(pattern, v):
            raise ValueError(f"Domínio inválido: {v}")
        return v.lower()

class DomainCreateRequest(BaseModel):
    """Request para adicionar domínio"""
    domain: str = Field(..., description="Domínio a ser adicionado")
    type: str = Field("alias", description="Tipo: primary ou alias")
    ssl_enabled: bool = Field(True, description="Habilitar SSL automático")

    @validator('type')
    def validate_type(cls, v):
        """Valida tipo de domínio"""
        valid_types = ['primary', 'alias']
        if v not in valid_types:
            raise ValueError(f"Tipo inválido. Opções: {valid_types}")
        return v

class DomainVerifyResponse(BaseModel):
    """Response da verificação de domínio"""
    domain: str
    verification_status: VerificationStatus
    dns_records: Dict[str, str] = Field(
        ...,
        description="Registros DNS necessários para verificação"
    )
    instructions: str = Field(
        ...,
        description="Instruções para configurar DNS"
    )

    @classmethod
    def create_for(cls, domain_alias: DomainAlias) -> 'DomainVerifyResponse':
        """Cria response de verificação"""
        import uuid
        verification_id = str(uuid.uuid4())[:8]
        return cls(
            domain=domain_alias.domain,
            verification_status=domain_alias.verification_status,
            dns_records={
                "cname": f"{verification_id}.cname.mmn-ai-to-ai.com",
                "txt": f"txt-verification-{verification_id}"
            },
            instructions=f"Adicione um registro CNAME apontando para {verification_id}.cname.mmn-ai-to-ai.com"
        )

class DomainListResponse(BaseModel):
    """Response com lista de domínios"""
    data: list
    pagination: Optional[Dict[str, int]] = None

# Import uuid
import uuid