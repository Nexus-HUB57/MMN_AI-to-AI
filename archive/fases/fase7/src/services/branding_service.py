"""
Serviço de Gerenciamento de Branding

Autor: Nexus-HUB57
Versão: 1.1.0 - Sprint 2 Branding Engine
"""

from typing import Optional, Dict, Any, List
import logging
import uuid

from ..models.branding import (
    BrandingConfig, BrandingColors, BrandingFonts,
    BrandingLogo, BrandingUpdateRequest, AssetUploadResponse,
    ThemePreset, THEME_PRESETS, ThemeCustomization,
    AssetValidationResult, ThemePresetInfo, ThemePresetColors
)

logger = logging.getLogger(__name__)


THEME_PRESET_INFO: Dict[ThemePreset, ThemePresetInfo] = {
    ThemePreset.MODERN_BLUE: ThemePresetInfo(
        id=ThemePreset.MODERN_BLUE,
        name="Azul Moderno",
        description="Tema profissional com tons de azul vibrante",
        colors=THEME_PRESETS[ThemePreset.MODERN_BLUE]
    ),
    ThemePreset.CORPORATE_GRAY: ThemePresetInfo(
        id=ThemePreset.CORPORATE_GRAY,
        name="Cinza Corporativo",
        description="Visual minimalista e profissional",
        colors=THEME_PRESETS[ThemePreset.CORPORATE_GRAY]
    ),
    ThemePreset.VIBRANT_PURPLE: ThemePresetInfo(
        id=ThemePreset.VIBRANT_PURPLE,
        name="Roxo Vibrante",
        description="Cores criativas e modernas",
        colors=THEME_PRESETS[ThemePreset.VIBRANT_PURPLE]
    ),
    ThemePreset.NATURE_GREEN: ThemePresetInfo(
        id=ThemePreset.NATURE_GREEN,
        name="Verde Natureza",
        description="Visual fresco e sustentável",
        colors=THEME_PRESETS[ThemePreset.NATURE_GREEN]
    ),
    ThemePreset.ELEGANT_BLACK: ThemePresetInfo(
        id=ThemePreset.ELEGANT_BLACK,
        name="Preto Elegante",
        description="Visual luxuoso e sofisticado",
        colors=THEME_PRESETS[ThemePreset.ELEGANT_BLACK]
    ),
    ThemePreset.SUNSET_ORANGE: ThemePresetInfo(
        id=ThemePreset.SUNSET_ORANGE,
        name="Laranja Entardecer",
        description="Energia e vitalidade",
        colors=THEME_PRESETS[ThemePreset.SUNSET_ORANGE]
    ),
    ThemePreset.ROYAL_GOLD: ThemePresetInfo(
        id=ThemePreset.ROYAL_GOLD,
        name="Ouro Real",
        description="Premium e exclusivo",
        colors=THEME_PRESETS[ThemePreset.ROYAL_GOLD]
    ),
    ThemePreset.MINIMAL_WHITE: ThemePresetInfo(
        id=ThemePreset.MINIMAL_WHITE,
        name="Branco Minimalista",
        description="Clean e essencial",
        colors=THEME_PRESETS[ThemePreset.MINIMAL_WHITE]
    ),
}


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

    def create_from_preset(
        self, instance_id: str, preset: ThemePreset
    ) -> BrandingConfig:
        """Cria configuração de branding a partir de preset"""
        preset_colors = THEME_PRESETS.get(preset)
        if not preset_colors:
            raise ValueError(f"Preset não encontrado: {preset}")

        colors = BrandingColors(
            primary=preset_colors.primary,
            secondary=preset_colors.secondary,
            accent=preset_colors.accent,
            background=preset_colors.background,
            text=preset_colors.text
        )

        config = BrandingConfig(
            instance_id=instance_id,
            theme_preset=preset,
            colors=colors,
            fonts=BrandingFonts(),
            logo=BrandingLogo(),
            social_links={}
        )
        self._configs[instance_id] = config
        logger.info(f"Branding criado do preset {preset.value} para instância: {instance_id}")
        return config

    def update_branding(
        self, instance_id: str, data: BrandingUpdateRequest
    ) -> Optional[BrandingConfig]:
        """Atualiza configuração de branding"""
        config = self._configs.get(instance_id)

        # Se tem preset, aplica preset primeiro
        if data.theme_preset:
            config = self.create_from_preset(instance_id, data.theme_preset)
        elif not config:
            config = self.create_branding(instance_id)

        # Atualiza campos específicos
        update_dict = data.dict(exclude_unset=True, exclude_none=True)

        for key, value in update_dict.items():
            if key == 'theme_preset' and value is None:
                continue
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

    def get_preview_html(self, instance_id: str) -> Optional[str]:
        """Gera HTML completo de preview"""
        config = self._configs.get(instance_id)
        if not config:
            return None

        return config.to_preview_html()

    def get_all_presets(self) -> List[ThemePresetInfo]:
        """Retorna lista de todos os presets disponíveis"""
        return list(THEME_PRESET_INFO.values())

    def validate_asset(
        self, file_data: bytes, content_type: str, filename: str
    ) -> AssetValidationResult:
        """Valida asset antes do upload"""
        errors: List[str] = []
        warnings: List[str] = []
        metadata: Dict[str, Any] = {}

        # Valida tipo de conteúdo
        allowed_types = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"]
        if content_type not in allowed_types:
            errors.append(f"Tipo de arquivo não permitido: {content_type}")
            return AssetValidationResult(valid=False, errors=errors)

        # Valida tamanho (5MB max)
        max_size = 5 * 1024 * 1024
        if len(file_data) > max_size:
            errors.append(f"Arquivo muito grande: {len(file_data)} bytes (max: {max_size})")
            return AssetValidationResult(valid=False, errors=errors)

        # Valida tamanho mínimo
        if len(file_data) < 100:
            errors.append("Arquivo muito pequeno ou corrompido")
            return AssetValidationResult(valid=False, errors=errors)

        # Warnings para formatos específicos
        if content_type == "image/svg+xml":
            warnings.append("SVGs devem ser sanitizados para evitar XSS")

        if len(file_data) > 3 * 1024 * 1024:
            warnings.append(f"Arquivo grande ({len(file_data) // (1024*1024)}MB). Considere otimizar.")

        metadata = {
            "size_bytes": len(file_data),
            "content_type": content_type,
            "filename": filename
        }

        return AssetValidationResult(
            valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            metadata=metadata
        )

    def apply_preset(
        self, instance_id: str, preset: ThemePreset
    ) -> Optional[BrandingConfig]:
        """Aplica preset de tema a uma instância"""
        return self.create_from_preset(instance_id, preset)

    def get_preset_info(self, preset: ThemePreset) -> Optional[ThemePresetInfo]:
        """Retorna informações de um preset específico"""
        return THEME_PRESET_INFO.get(preset)