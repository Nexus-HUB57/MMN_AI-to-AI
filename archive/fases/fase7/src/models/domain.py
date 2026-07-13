"""
Modelos de Domínios Customizados

Autor: Nexus-HUB57
Versão: 1.1.0 - Sprint 3 Domain Management
"""

import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, validator
from enum import Enum

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
    data: List[DomainAlias]
    pagination: Optional[Dict[str, int]] = None


class SSLStatus(BaseModel):
    """Status do certificado SSL"""
    domain: str
    ssl_enabled: bool
    certificate_status: str = Field(..., description="pending, valid, expired, error")
    issuer: Optional[str] = Field(None, description="Let's Encrypt, etc")
    expires_at: Optional[datetime] = None
    auto_renew: bool = True


class DNSRecord(BaseModel):
    """Registro DNS para verificação"""
    type: str = Field(..., description="A, CNAME, TXT, etc")
    name: str = Field(..., description="Nome do host")
    value: str = Field(..., description="Valor do registro")
    ttl: Optional[int] = Field(3600, description="Time to live em segundos")


class DNSPropagationStatus(BaseModel):
    """Status de propagação DNS"""
    domain: str
    records: List[DNSRecord]
    propagated: bool
    checked_at: datetime = Field(default_factory=datetime.utcnow)
    propagation_time: Optional[str] = None  # "propagated", "pending", "delayed"


class DomainConfigResponse(BaseModel):
    """Configuração completa do domínio"""
    domain: DomainAlias
    ssl: SSLStatus
    dns_records: List[DNSRecord]
    proxy_config: Optional[Dict[str, Any]] = None


class ReverseProxyConfig(BaseModel):
    """Configuração de proxy reverso"""
    enabled: bool = True
    ssl_enabled: bool = True
    ssl_provider: str = Field("lets_encrypt", description="lets_encrypt, cloudflare, custom")
    ssl_auto_renew: bool = True
    redirect_https: bool = True
    cache_enabled: bool = False
    cdn_enabled: bool = False