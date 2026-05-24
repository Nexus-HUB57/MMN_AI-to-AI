"""
Rotas de Branding

Autor: Nexus-HUB57
Versão: 1.1.0 - Sprint 2 Branding Engine
"""

from fastapi import APIRouter, Request, HTTPException, UploadFile, File, Query
from fastapi.responses import JSONResponse, HTMLResponse

from ..models.branding import (
    BrandingConfig, BrandingUpdateRequest, AssetUploadResponse,
    ThemePreset, ThemePresetInfo
)
from ..services.branding_service import BrandingService, THEME_PRESET_INFO
from ..middleware.rate_limit import rate_limit, RateLimits

router = APIRouter(prefix="/branding", tags=["Branding"])

def get_branding_service(request: Request) -> BrandingService:
    """Dependency para obter branding service"""
    return request.app.state.branding_service


@router.get("/presets", response_model=list[ThemePresetInfo])
async def list_presets(request: Request):
    """Lista todos os presets de tema disponíveis"""
    service = get_branding_service(request)
    return service.get_all_presets()


@router.get("/presets/{preset_id}", response_model=ThemePresetInfo)
async def get_preset(
    request: Request,
    preset_id: ThemePreset
):
    """Obtém detalhes de um preset específico"""
    service = get_branding_service(request)
    preset = service.get_preset_info(preset_id)
    if not preset:
        raise HTTPException(status_code=404, detail="Preset não encontrado")
    return preset


@router.post("/{instance_id}/apply-preset/{preset_id}")
async def apply_preset(
    request: Request,
    instance_id: str,
    preset_id: ThemePreset
):
    """Aplica um preset de tema à instância"""
    service = get_branding_service(request)
    config = service.apply_preset(instance_id, preset_id)
    if not config:
        raise HTTPException(status_code=500, detail="Erro ao aplicar preset")
    return config


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

    # Lê conteúdo do arquivo
    content = await file.read()

    # Valida asset
    validation = service.validate_asset(content, file.content_type, file.filename)
    if not validation.valid:
        raise HTTPException(
            status_code=400,
            detail={"errors": validation.errors, "warnings": validation.warnings}
        )

    # Faz upload se válido
    response = service.upload_asset(
        instance_id=instance_id,
        file_data=content,
        file_type=asset_type,
        filename=file.filename
    )

    return {
        **response.dict(),
        "warnings": validation.warnings if validation.warnings else None
    }


@router.post("/{instance_id}/validate-asset")
async def validate_asset(
    request: Request,
    instance_id: str,
    file: UploadFile = File(...)
):
    """Valida um asset sem fazer upload"""
    service = get_branding_service(request)

    content = await file.read()
    validation = service.validate_asset(content, file.content_type, file.filename)

    return validation


@router.get("/{instance_id}/preview")
async def get_brand_preview(
    request: Request,
    instance_id: str
):
    """Gera preview do branding (JSON)"""
    service = get_branding_service(request)

    preview = service.get_brand_preview(instance_id)
    if not preview:
        raise HTTPException(status_code=404, detail="Branding não encontrado")

    return preview


@router.get("/{instance_id}/preview/html", response_class=HTMLResponse)
async def get_brand_preview_html(
    request: Request,
    instance_id: str
):
    """Gera preview do branding em HTML completo"""
    service = get_branding_service(request)

    html = service.get_preview_html(instance_id)
    if not html:
        raise HTTPException(status_code=404, detail="Branding não encontrado")

    return HTMLResponse(content=html)


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