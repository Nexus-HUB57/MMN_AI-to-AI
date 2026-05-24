"""
Rotas de Domínios

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from fastapi import APIRouter, Request, HTTPException

from ..models.domain import (
    DomainAlias, DomainCreateRequest, DomainVerifyResponse
)
from ..services.domain_service import DomainService
from ..middleware.rate_limit import rate_limit, RateLimits

router = APIRouter(prefix="/domains", tags=["Domínios"])

def get_domain_service(request: Request) -> DomainService:
    """Dependency para obter domain service"""
    return request.app.state.domain_service


@router.get("/{instance_id}")
async def list_domains(
    request: Request,
    instance_id: str
):
    """Lista domínios da instância"""
    service = get_domain_service(request)

    domains = service.get_domains(instance_id)
    return {"data": domains}


@router.post("/{instance_id}")
@rate_limit(*RateLimits.ADD_DOMAIN)
async def add_domain(
    request: Request,
    instance_id: str,
    data: DomainCreateRequest
):
    """Adiciona domínio à instância"""
    service = get_domain_service(request)

    # Valida formato do domínio
    if not service.validate_domain_format(data.domain):
        raise HTTPException(status_code=400, detail="Domínio inválido")

    try:
        domain = service.add_domain(instance_id, data)
        return domain
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.delete("/{instance_id}/{domain_id}")
async def remove_domain(
    request: Request,
    instance_id: str,
    domain_id: str
):
    """Remove domínio"""
    service = get_domain_service(request)

    success = service.remove_domain(instance_id, domain_id)
    if not success:
        raise HTTPException(status_code=404, detail="Domínio não encontrado")

    return {"message": "Domínio removido"}


@router.get("/{instance_id}/{domain_id}/verify")
@rate_limit(*RateLimits.VERIFY_DOMAIN)
async def verify_domain(
    request: Request,
    instance_id: str,
    domain_id: str
):
    """Verifica configuração DNS do domínio"""
    service = get_domain_service(request)

    response = service.verify_domain(instance_id, domain_id)
    if not response:
        raise HTTPException(status_code=404, detail="Domínio não encontrado")

    return response


@router.get("/{instance_id}/{domain_id}/dns-check")
async def check_dns(
    request: Request,
    instance_id: str,
    domain_id: str
):
    """Verifica propagação DNS"""
    service = get_domain_service(request)

    # Primeiro obtém o domínio
    domains = service.get_domains(instance_id)
    domain = next((d for d in domains if d.id == domain_id), None)

    if not domain:
        raise HTTPException(status_code=404, detail="Domínio não encontrado")

    return service.check_dns_propagation(domain.domain)


@router.get("/{instance_id}/{domain_id}/instructions")
async def get_verification_instructions(
    request: Request,
    instance_id: str,
    domain_id: str
):
    """Retorna instruções de verificação DNS"""
    service = get_domain_service(request)

    domains = service.get_domains(instance_id)
    domain = next((d for d in domains if d.id == domain_id), None)

    if not domain:
        raise HTTPException(status_code=404, detail="Domínio não encontrado")

    instructions = service.get_verification_instructions(domain.domain)
    return {"instructions": instructions}


@router.get("/{instance_id}/{domain_id}/ssl")
async def get_ssl_status(
    request: Request,
    instance_id: str,
    domain_id: str
):
    """Obtém status do certificado SSL"""
    service = get_domain_service(request)

    domains = service.get_domains(instance_id)
    domain = next((d for d in domains if d.id == domain_id), None)

    if not domain:
        raise HTTPException(status_code=404, detail="Domínio não encontrado")

    return service.get_ssl_certificate_status(domain.domain)