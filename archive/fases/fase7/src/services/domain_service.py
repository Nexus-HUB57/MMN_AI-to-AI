"""
Serviço de Gerenciamento de Domínios Customizados

Autor: Nexus-HUB57
Versão: 1.1.0 - Sprint 3 Domain Management
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
import uuid
import re

from ..models.domain import (
    DomainAlias, DomainType, VerificationStatus,
    DomainCreateRequest, DomainVerifyResponse,
    SSLStatus, DNSRecord, DNSPropagationStatus, ReverseProxyConfig
)

logger = logging.getLogger(__name__)


class DomainService:
    """Serviço para gerenciamento completo de domínios customizados"""

    def __init__(self):
        self._domains: Dict[str, DomainAlias] = {}  # keyed by domain string

    def add_domain(
        self, instance_id: str, data: DomainCreateRequest
    ) -> DomainAlias:
        """Adiciona domínio à instância"""
        # Verifica se domínio já existe
        domain_lower = data.domain.lower()
        if self._domains.get(domain_lower):
            raise ValueError(f"Domínio '{data.domain}' já está cadastrado")

        domain = DomainAlias(
            id=str(uuid.uuid4()),
            instance_id=instance_id,
            domain=domain_lower,
            domain_type=DomainType(data.type),
            ssl_enabled=data.ssl_enabled,
            verification_status=VerificationStatus.PENDING,
            dns_records={
                "cname": f"{uuid.uuid4().hex[:8]}.cname.mmn-ai-to-ai.com",
                "txt": f"txt-verification-{uuid.uuid4().hex[:8]}"
            }
        )

        self._domains[domain_lower] = domain
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

    def get_domain_by_id(self, domain_id: str) -> Optional[DomainAlias]:
        """Obtém domínio por ID"""
        for domain in self._domains.values():
            if domain.id == domain_id:
                return domain
        return None

    def remove_domain(self, instance_id: str, domain_id: str) -> bool:
        """Remove domínio"""
        for domain_str, domain in self._domains.items():
            if domain.id == domain_id and domain.instance_id == instance_id:
                del self._domains[domain_str]
                logger.info(f"Domínio removido: {domain_str}")
                return True
        return False

    def verify_domain(self, instance_id: str, domain_id: str) -> Optional[DomainVerifyResponse]:
        """Inicia verificação de DNS do domínio"""
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
                "cname": domain_obj.verification_status == VerificationStatus.VERIFIED,
                "txt": domain_obj.verification_status == VerificationStatus.VERIFIED
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

        certificate_status = "pending"
        if domain_obj.verification_status == VerificationStatus.VERIFIED:
            if domain_obj.ssl_enabled:
                certificate_status = "valid"
            else:
                certificate_status = "disabled"

        return {
            "domain": domain,
            "ssl_enabled": domain_obj.ssl_enabled,
            "certificate_status": certificate_status,
            "expires_at": None,  # Would be from Let's Encrypt
            "issuer": "Let's Encrypt",
            "auto_renew": True
        }

    def get_verification_instructions(self, domain: str) -> str:
        """Gera instruções de verificação DNS detalhadas"""
        domain_obj = self._domains.get(domain.lower())
        if not domain_obj:
            return "Domínio não encontrado"

        instructions = f"""
Para verificar o domínio {domain}, siga estas etapas:

1. Acesse o painel de controle do seu provedor de domínio
   (GoDaddy, Namecheap, Cloudflare, Hostinger, etc)

2. Encontre a seção de gerenciamento de DNS ou "Zone Records"

3. Adicione o seguinte registro CNAME:

   ┌─────────────────────────────────────────────────────┐
   │ Tipo: CNAME                                         │
   │ Host/Nome: (deixe vazio, @, ou seu subdomínio)      │
   │ Aponta para: {domain_obj.dns_records.get('cname', 'N/A'):<35} │
   │ TTL: 3600 (ou Automático)                            │
   └─────────────────────────────────────────────────────┘

4. (Opcional) Adicione um registro TXT para verificação adicional:

   ┌─────────────────────────────────────────────────────┐
   │ Tipo: TXT                                            │
   │ Host/Nome: @                                         │
   │ Valor: {domain_obj.dns_records.get('txt', 'N/A'):<45} │
   │ TTL: 3600                                            │
   └─────────────────────────────────────────────────────┘

5. Aguarde a propagação:
   - Tipicamente: 5-30 minutos
   - Mínimo: 1 hora
   - Máximo: 48 horas (em casos raros)

6. Após configurar, clique em "Verificar Domínio" para confirmar.

⏱️ Dica: Você pode verificar o status em "Verificação DNS" a qualquer momento.
        """.strip()

        return instructions

    def get_dns_records_for_domain(self, domain: DomainAlias) -> List[DNSRecord]:
        """Retorna lista de registros DNS necessários para o domínio"""
        verification_id = domain.dns_records.get('cname', '').split('.')[0]

        records = [
            DNSRecord(
                type="CNAME",
                name=domain.domain.split('.')[0],  # Subdomain
                value=domain.dns_records.get('cname', 'N/A'),
                ttl=3600
            ),
            DNSRecord(
                type="TXT",
                name="@",
                value=f"txt-verification-{verification_id}",
                ttl=3600
            )
        ]

        return records

    def get_proxy_config(self, domain: DomainAlias) -> Dict[str, Any]:
        """Retorna configuração de proxy reverso"""
        return {
            "enabled": True,
            "ssl_enabled": domain.ssl_enabled,
            "ssl_provider": "lets_encrypt",
            "ssl_auto_renew": True,
            "redirect_https": True,
            "cache_enabled": False,
            "cdn_enabled": False,
            "proxy_target": f"internal-{domain.instance_id}.mmn-ai-to-ai.com",
            "proxy_rules": {
                "websocket": True,
                "http2": True,
                "compression": True
            }
        }

    def get_domain_preview(self, domain: DomainAlias) -> Dict[str, Any]:
        """Gera preview da configuração do domínio"""
        ssl_status = self.get_ssl_certificate_status(domain.domain)
        dns_records = self.get_dns_records_for_domain(domain)
        proxy_config = self.get_proxy_config(domain)

        return {
            "domain": {
                "id": domain.id,
                "name": domain.domain,
                "type": domain.domain_type.value,
                "status": domain.verification_status.value,
                "verified_at": domain.verified_at.isoformat() if domain.verified_at else None
            },
            "ssl": ssl_status,
            "dns_records": [
                {
                    "type": r.type,
                    "name": r.name,
                    "value": r.value,
                    "ttl": r.ttl
                } for r in dns_records
            ],
            "proxy": proxy_config,
            "next_steps": self._get_next_steps(domain)
        }

    def _get_next_steps(self, domain: DomainAlias) -> List[str]:
        """Retorna próximos passos baseados no status do domínio"""
        if domain.verification_status == VerificationStatus.PENDING:
            return [
                "Configure os registros DNS no seu provedor de domínio",
                "Aguarde a propagação DNS (5-30 minutos)",
                "Clique em 'Verificar Domínio' quando estiver pronto"
            ]
        elif domain.verification_status == VerificationStatus.VERIFYING:
            return [
                "Aguarde a conclusão da verificação",
                "Você receberá uma notificação quando concluída"
            ]
        elif domain.verification_status == VerificationStatus.VERIFIED:
            steps = ["Domínio verificado com sucesso!"]
            if domain.ssl_enabled:
                steps.append("Certificado SSL será provisionado automaticamente")
                steps.append("Seu domínio estará pronto em breve")
            return steps
        else:  # FAILED
            return [
                "A verificação falhou",
                "Verifique se os registros DNS estão corretos",
                "Tente novamente em alguns minutos"
            ]

    def get_all_pending_verifications(self) -> List[DomainAlias]:
        """Retorna todos os domínios pendentes de verificação"""
        return [
            d for d in self._domains.values()
            if d.verification_status in [
                VerificationStatus.PENDING,
                VerificationStatus.VERIFYING
            ]
        ]

    def get_domains_by_status(self, status: VerificationStatus) -> List[DomainAlias]:
        """Retorna domínios filtrados por status"""
        return [
            d for d in self._domains.values()
            if d.verification_status == status
        ]