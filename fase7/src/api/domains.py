"""
Rotas de Domínios Customizados

Autor: Nexus-HUB57
Versão: 1.1.0 - Sprint 3 Domain Management
"""

from fastapi import APIRouter, Request, HTTPException, Depends

from ..models.domain import (
    DomainAlias, DomainCreateRequest, DomainVerifyResponse,
    SSLStatus, DNSRecord, DNSPropagationStatus, DomainConfigResponse,
    ReverseProxyConfig
)
from ..services.domain_service import DomainService
from ..middleware.rate_limit import rate_limit, RateLimits

router = APIRouter(prefix="/domains", tags=["Domínios"])

def get_domain_service(request: Request) -> DomainService:
    """Dependency para obter domain service"""
    return request.app.state.domain_service


@router.get("/{instance_id}", response_model=dict)
async def list_domains(
    request: Request,
    instance_id: str
):
    """Lista todos os domínios de uma instância"""
    service = get_domain_service(request)
    domains = service.get_domains(instance_id)
    return {
        "data": [d.dict() for d in domains],
        "total": len(domains)
    }


@router.post("/{instance_id}", response_model=dict)
@rate_limit(*RateLimits.ADD_DOMAIN)
async def add_domain(
    request: Request,
    instance_id: str,
    data: DomainCreateRequest
):
    """Adiciona novo domínio customizado à instância"""
    service = get_domain_service(request)

    # Valida formato do domínio
    if not service.validate_domain_format(data.domain):
        raise HTTPException(
            status_code=400,
            detail={
                "error": "VALIDATION_ERROR",
                "message": "Formato de domínio inválido",
                "hint": "Use um domínio válido como: plataforma.empresa.com"
            }
        )

    # Verifica se instância existe (via instance service)
    try:
        instance_service = request.app.state.instance_service
        instance = instance_service.get_instance(instance_id)
        if not instance:
            raise HTTPException(status_code=404, detail="Instância não encontrada")
    except AttributeError:
        pass  # Instance service pode não estar disponível

    try:
        domain = service.add_domain(instance_id, data)
        return domain.dict()
    except ValueError as e:
        raise HTTPException(
            status_code=409,
            detail={
                "error": "CONFLICT",
                "message": str(e)
            }
        )


@router.delete("/{instance_id}/{domain_id}")
async def remove_domain(
    request: Request,
    instance_id: str,
    domain_id: str
):
    """Remove domínio da instância"""
    service = get_domain_service(request)

    success = service.remove_domain(instance_id, domain_id)
    if not success:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Domínio não encontrado"
        })

    return {"message": "Domínio removido com sucesso"}


@router.get("/{instance_id}/{domain_id}/verify", response_model=dict)
@rate_limit(*RateLimits.VERIFY_DOMAIN)
async def verify_domain(
    request: Request,
    instance_id: str,
    domain_id: str
):
    """Inicia verificação de configuração DNS do domínio"""
    service = get_domain_service(request)

    response = service.verify_domain(instance_id, domain_id)
    if not response:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Domínio não encontrado"
        })

    return response.dict()


@router.post("/{instance_id}/{domain_id}/confirm-verification")
async def confirm_domain_verification(
    request: Request,
    instance_id: str,
    domain_id: str
):
    """Confirma que a verificação DNS foi concluída com sucesso"""
    service = get_domain_service(request)

    domain = service.confirm_verification(domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Domínio não encontrado"
        })

    return {
        "message": "Domínio verificado com sucesso",
        "domain": domain.dict()
    }


@router.get("/{instance_id}/{domain_id}/dns-check", response_model=dict)
async def check_dns_propagation(
    request: Request,
    instance_id: str,
    domain_id: str
):
    """Verifica propagação dos registros DNS"""
    service = get_domain_service(request)

    # Primeiro obtém o domínio
    domains = service.get_domains(instance_id)
    domain = next((d for d in domains if d.id == domain_id), None)

    if not domain:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Domínio não encontrado"
        })

    return service.check_dns_propagation(domain.domain)


@router.get("/{instance_id}/{domain_id}/instructions")
async def get_verification_instructions(
    request: Request,
    instance_id: str,
    domain_id: str
):
    """Retorna instruções detalhadas para configuração DNS"""
    service = get_domain_service(request)

    domains = service.get_domains(instance_id)
    domain = next((d for d in domains if d.id == domain_id), None)

    if not domain:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Domínio não encontrado"
        })

    instructions = service.get_verification_instructions(domain.domain)
    dns_records = service.get_dns_records_for_domain(domain)

    return {
        "domain": domain.domain,
        "instructions": instructions,
        "dns_records": [r.dict() for r in dns_records]
    }


@router.get("/{instance_id}/{domain_id}/ssl", response_model=dict)
async def get_ssl_status(
    request: Request,
    instance_id: str,
    domain_id: str
):
    """Obtém status do certificado SSL do domínio"""
    service = get_domain_service(request)

    domains = service.get_domains(instance_id)
    domain = next((d for d in domains if d.id == domain_id), None)

    if not domain:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Domínio não encontrado"
        })

    return service.get_ssl_certificate_status(domain.domain)


@router.post("/{instance_id}/{domain_id}/renew-ssl")
async def renew_ssl_certificate(
    request: Request,
    instance_id: str,
    domain_id: str
):
    """Solicita renovação do certificado SSL"""
    service = get_domain_service(request)

    domains = service.get_domains(instance_id)
    domain = next((d for d in domains if d.id == domain_id), None)

    if not domain:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Domínio não encontrado"
        })

    # Verifica se domínio está verificado
    if domain.verification_status.value != "verified":
        raise HTTPException(status_code=400, detail={
            "error": "DOMAIN_NOT_VERIFIED",
            "message": "Domínio precisa estar verificado antes de renovar SSL"
        })

    # Simula solicitação de renovação
    return {
        "message": "Solicitação de renovação SSL enviada",
        "domain": domain.domain,
        "estimated_time": "5-10 minutos"
    }


@router.get("/{instance_id}/{domain_id}/config", response_model=dict)
async def get_domain_config(
    request: Request,
    instance_id: str,
    domain_id: str
):
    """Obtém configuração completa do domínio (DNS, SSL, proxy)"""
    service = get_domain_service(request)

    domains = service.get_domains(instance_id)
    domain = next((d for d in domains if d.id == domain_id), None)

    if not domain:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Domínio não encontrado"
        })

    ssl_status = service.get_ssl_certificate_status(domain.domain)
    dns_records = service.get_dns_records_for_domain(domain)
    proxy_config = service.get_proxy_config(domain)

    return {
        "domain": domain.dict(),
        "ssl": ssl_status,
        "dns_records": [r.dict() for r in dns_records],
        "proxy_config": proxy_config
    }


@router.get("/{instance_id}/{domain_id}/preview")
async def get_domain_preview(
    request: Request,
    instance_id: str,
    domain_id: str
):
    """Gera preview da configuração do domínio"""
    service = get_domain_service(request)

    domains = service.get_domains(instance_id)
    domain = next((d for d in domains if d.id == domain_id), None)

    if not domain:
        raise HTTPException(status_code=404, detail={
            "error": "NOT_FOUND",
            "message": "Domínio não encontrado"
        })

    preview = service.get_domain_preview(domain)
    return preview