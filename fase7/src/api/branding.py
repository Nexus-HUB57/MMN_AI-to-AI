"""
Rotas de Branding

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from fastapi import APIRouter, Request, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse

from ..models.branding import (
    BrandingConfig, BrandingUpdateRequest, AssetUploadResponse
)
from ..services.branding_service import BrandingService
from ..middleware.rate_limit import rate_limit, RateLimits

router = APIRouter(prefix="/branding", tags=["Branding"])

def get_branding_service(request: Request) -> BrandingService:
    """Dependency para obter branding service"""
    return request.app.state.branding_service


@router.get("/{instance_id}")
async def get_branding(
    request: Request,
    instance_id: str
):
    """Obtém configuração de branding da instância"""
    service = get_branding_service(request)

    config = service.get_branding(instance_id)
    if not config:
        # Cria configuração padrão
        config = service.create_branding(instance_id)

    return config


@router.put("/{instance_id}")
@rate_limit(*RateLimits.UPDATE_BRANDING)
async def update_branding(
    request: Request,
    instance_id: str,
    data: BrandingUpdateRequest
):
    """Atualiza configuração de branding"""
    service = get_branding_service(request)

    # Valida cores se fornecidas
    if data.colors:
        colors_dict = data.colors.dict() if hasattr(data.colors, 'dict') else data.colors
        if not service.validate_colors(colors_dict):
            raise HTTPException(status_code=400, detail="Cores inválidas")

    config = service.update_branding(instance_id, data)
    return config


@router.post("/{instance_id}/assets")
async def upload_asset(
    request: Request,
    instance_id: str,
    file: UploadFile = File(...),
    asset_type: str = "logo_primary"
):
    """Faz upload de asset (logo, favicon, etc)"""
    service = get_branding_service(request)

    # Valida tipo de arquivo
    allowed_types = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=415, detail="Tipo de arquivo não permitido")

    # Lê conteúdo do arquivo
    content = await file.read()

    # Limita tamanho (5MB)
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Arquivo muito grande")

    response = service.upload_asset(
        instance_id=instance_id,
        file_data=content,
        file_type=asset_type,
        filename=file.filename
    )

    return response


@router.get("/{instance_id}/preview")
async def get_brand_preview(
    request: Request,
    instance_id: str
):
    """Gera preview do branding"""
    service = get_branding_service(request)

    preview = service.get_brand_preview(instance_id)
    if not preview:
        raise HTTPException(status_code=404, detail="Branding não encontrado")

    return preview


@router.get("/{instance_id}/css")
async def get_brand_css(
    request: Request,
    instance_id: str
):
    """Retorna CSS customizado do branding"""
    service = get_branding_service(request)

    css = service.generate_css(instance_id)
    if not css:
        raise HTTPException(status_code=404, detail="Branding não encontrado")

    return JSONResponse(
        content={"css": css},
        headers={"Content-Type": "text/css"}
    )