"""
Serviço de Gerenciamento de Domínios

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
import uuid
import re

from ..models.domain import (
    DomainAlias, DomainType, VerificationStatus,
    DomainCreateRequest, DomainVerifyResponse
)

logger = logging.getLogger(__name__)

class DomainService:
    """Serviço para gerenciamento de domínios customizados"""

    def __init__(self):
        self._domains: Dict[str, DomainAlias] = {}  # keyed by domain

    def add_domain(
        self, instance_id: str, data: DomainCreateRequest
    ) -> DomainAlias:
        """Adiciona domínio à instância"""
        # Verifica se domínio já existe
        if self._domains.get(data.domain):
            raise ValueError(f"Domínio '{data.domain}' já está cadastrado")

        domain = DomainAlias(
            id=str(uuid.uuid4()),
            instance_id=instance_id,
            domain=data.domain.lower(),
            domain_type=DomainType(data.type),
            ssl_enabled=data.ssl_enabled,
            verification_status=VerificationStatus.PENDING,
            dns_records={
                "cname": f"{uuid.uuid4().hex[:8]}.cname.mmn-ai-to-ai.com",
                "txt": f"txt-verification-{uuid.uuid4().hex[:8]}"
            }
        )

        self._domains[data.domain.lower()] = domain
        logger.info(f"Domínio adicionado: {data.domain} para instância {instance_id}")

        return domain

    def get_domains(self, instance_id: str) -> List[DomainAlias]:
        """Lista domínios de uma instância"""
        return [
            d for d in self._domains.values()
            if d.instance_id == instance_id
        ]

    def get_domain(self, domain: str) -> Optional[DomainAlias]:
        """Obtém domínio específico"""
        return self._domains.get(domain.lower())

    def remove_domain(self, instance_id: str, domain_id: str) -> bool:
        """Remove domínio"""
        for domain_str, domain in self._domains.items():
            if domain.id == domain_id and domain.instance_id == instance_id:
                del self._domains[domain_str]
                logger.info(f"Domínio removido: {domain_str}")
                return True
        return False

    def verify_domain(self, instance_id: str, domain_id: str) -> Optional[DomainVerifyResponse]:
        """Verifica configuração de DNS do domínio"""
        for domain in self._domains.values():
            if domain.id == domain_id and domain.instance_id == instance_id:
                # Simula verificação
                domain.verification_status = VerificationStatus.VERIFYING
                return DomainVerifyResponse.create_for(domain)

        return None

    def check_dns_propagation(self, domain: str) -> Dict[str, Any]:
        """Verifica propagação dos registros DNS"""
        domain_obj = self._domains.get(domain.lower())
        if not domain_obj:
            return {"error": "Domínio não encontrado"}

        # Simula verificação de DNS
        return {
            "domain": domain,
            "status": domain_obj.verification_status.value,
            "dns_records": domain_obj.dns_records,
            "checked_at": datetime.utcnow().isoformat(),
            "propagation": {
                "cname": True,
                "txt": True
            }
        }

    def confirm_verification(self, domain_id: str) -> Optional[DomainAlias]:
        """Confirma verificação bem-sucedida do domínio"""
        for domain in self._domains.values():
            if domain.id == domain_id:
                domain.verification_status = VerificationStatus.VERIFIED
                domain.verified_at = datetime.utcnow()
                logger.info(f"Domínio verificado: {domain.domain}")
                return domain

        return None

    def fail_verification(self, domain_id: str, reason: str) -> Optional[DomainAlias]:
        """Marca verificação como falhada"""
        for domain in self._domains.values():
            if domain.id == domain_id:
                domain.verification_status = VerificationStatus.FAILED
                logger.warning(f"Verificação falhou para {domain.domain}: {reason}")
                return domain

        return None

    def validate_domain_format(self, domain: str) -> bool:
        """Valida formato do domínio"""
        pattern = r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$'
        return bool(re.match(pattern, domain.lower()))

    def get_ssl_certificate_status(self, domain: str) -> Dict[str, Any]:
        """Obtém status do certificado SSL"""
        domain_obj = self._domains.get(domain.lower())
        if not domain_obj:
            return {"error": "Domínio não encontrado"}

        return {
            "domain": domain,
            "ssl_enabled": domain_obj.ssl_enabled,
            "certificate_status": "valid" if domain_obj.verification_status == VerificationStatus.VERIFIED else "pending",
            "expires_at": None,  # Would be from Let's Encrypt
            "issuer": "Let's Encrypt"
        }

    def get_verification_instructions(self, domain: str) -> str:
        """Gera instruções de verificação DNS"""
        domain_obj = self._domains.get(domain.lower())
        if not domain_obj:
            return "Domínio não encontrado"

        instructions = f"""
Para verificar o domínio {domain}, siga estas etapas:

1. Acesse o painel de controle do seu provedor de domínio
2. Encontre a seção de gerenciamento de DNS
3. Adicione o seguinte registro CNAME:

   Tipo: CNAME
   Host: (deixe vazio ou @)
   Aponta para: {domain_obj.dns_records.get('cname', 'N/A')}

4. Aguarde a propagação (pode levar de alguns minutos a 48 horas)

Após configurar, clique em "Verificar" para confirmar.
        """.strip()

        return instructions