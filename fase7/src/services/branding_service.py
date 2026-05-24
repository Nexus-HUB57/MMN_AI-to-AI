"""
Serviço de Gerenciamento de Branding

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from typing import Optional, Dict, Any
import logging

from ..models.branding import (
    BrandingConfig, BrandingColors, BrandingFonts,
    BrandingLogo, BrandingUpdateRequest, AssetUploadResponse
)

logger = logging.getLogger(__name__)

class BrandingService:
    """Serviço para gerenciamento de branding"""

    def __init__(self):
        self._configs: Dict[str, BrandingConfig] = {}

    def get_branding(self, instance_id: str) -> Optional[BrandingConfig]:
        """Obtém configuração de branding"""
        return self._configs.get(instance_id)

    def create_branding(self, instance_id: str) -> BrandingConfig:
        """Cria configuração de branding padrão"""
        config = BrandingConfig(
            instance_id=instance_id,
            colors=BrandingColors(),
            fonts=BrandingFonts(),
            logo=BrandingLogo(),
            social_links={}
        )
        self._configs[instance_id] = config
        return config

    def update_branding(
        self, instance_id: str, data: BrandingUpdateRequest
    ) -> Optional[BrandingConfig]:
        """Atualiza configuração de branding"""
        config = self._configs.get(instance_id)
        if not config:
            config = self.create_branding(instance_id)

        update_data = data.dict(exclude_unset=True)

        for key, value in update_data.items():
            if value is not None:
                setattr(config, key, value)

        self._configs[instance_id] = config
        logger.info(f"Branding atualizado para instância: {instance_id}")

        return config

    def update_colors(
        self, instance_id: str, colors: Dict[str, str]
    ) -> Optional[BrandingConfig]:
        """Atualiza apenas cores"""
        config = self._configs.get(instance_id)
        if not config:
            return None

        # Atualiza cores específicas
        for color_name, color_value in colors.items():
            if hasattr(config.colors, color_name):
                setattr(config.colors, color_name, color_value)

        self._configs[instance_id] = config
        return config

    def upload_asset(
        self, instance_id: str, file_data: bytes, file_type: str, filename: str
    ) -> AssetUploadResponse:
        """Faz upload de asset (logo, favicon, etc)"""
        import uuid

        asset_id = str(uuid.uuid4())
        url = f"https://cdn.mmn-ai-to-ai.com/instances/{instance_id}/assets/{filename}"

        response = AssetUploadResponse(
            asset_id=asset_id,
            url=url,
            type=file_type,
            filename=filename,
            size=len(file_data),
            content_type="image/png"
        )

        logger.info(f"Asset upload: {filename} ({len(file_data)} bytes) para {instance_id}")
        return response

    def generate_css(self, instance_id: str) -> Optional[str]:
        """Gera CSS customizado"""
        config = self._configs.get(instance_id)
        if not config:
            return None

        return config.to_css_variables()

    def generate_html_style(self, instance_id: str) -> Optional[str]:
        """Gera tag style HTML"""
        config = self._configs.get(instance_id)
        if not config:
            return None

        return config.to_html_style()

    def validate_colors(self, colors: Dict[str, str]) -> bool:
        """Valida formato de cores"""
        import re
        hex_pattern = r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'

        for color_name, color_value in colors.items():
            if not re.match(hex_pattern, color_value):
                logger.warning(f"Cor inválida: {color_name} = {color_value}")
                return False

        return True

    def get_brand_preview(self, instance_id: str) -> Optional[Dict[str, Any]]:
        """Gera preview do branding"""
        config = self._configs.get(instance_id)
        if not config:
            return None

        return {
            "instance_id": instance_id,
            "primary_color": config.colors.primary,
            "secondary_color": config.colors.secondary,
            "accent_color": config.colors.accent,
            "preview_css": config.to_css_variables(),
            "logo_url": config.logo.primary_url,
            "fonts": {
                "primary": config.fonts.primary,
                "headings": config.fonts.headings
            }
        }