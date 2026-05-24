"""
Modelos de Branding e Customização Visual

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, validator
import re

class BrandingColors(BaseModel):
    """Cores do branding"""
    primary: str = Field("#2563EB", description="Cor primária")
    secondary: str = Field("#1E40AF", description="Cor secundária")
    accent: str = Field("#F59E0B", description="Cor de destaque")
    background: str = Field("#FFFFFF", description="Cor de fundo")
    text: str = Field("#1F2937", description="Cor do texto")
    muted: str = Field("#9CA3AF", description="Cor secundária de texto")
    border: str = Field("#E5E7EB", description="Cor de bordas")
    success: str = Field("#10B981", description="Cor de sucesso")
    error: str = Field("#EF4444", description="Cor de erro")
    warning: str = Field("#F59E0B", description="Cor de aviso")

    @validator('*')
    def validate_hex_color(cls, v):
        """Valida formato de cor hexadecimal"""
        if v and not re.match(r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', v):
            raise ValueError(f"Cor inválida: {v}. Use formato hexadecimal (#RRGGBB)")
        return v

class BrandingFonts(BaseModel):
    """Fontes do branding"""
    primary: str = Field("Inter, system-ui, sans-serif", description="Fonte primária")
    headings: str = Field("Poppins, system-ui, sans-serif", description="Fonte para títulos")
    mono: str = Field("JetBrains Mono, monospace", description="Fonte monoespaçada")

    @validator('*')
    def validate_font_family(cls, v):
        """Valida formato de font-family"""
        if not v or len(v) < 3:
            raise ValueError("Font family inválida")
        return v

class BrandingLogo(BaseModel):
    """Configurações de logo"""
    primary_url: Optional[str] = None
    secondary_url: Optional[str] = None
    favicon_url: Optional[str] = None
    og_image_url: Optional[str] = None

class BrandingEmail(BaseModel):
    """Configurações de e-mail transacional"""
    sender_name: str = Field(..., description="Nome do remetente")
    sender_email: str = Field(..., description="Email do remetente")
    reply_to: Optional[str] = Field(None, description="Email para replies")
    template_header_url: Optional[str] = None
    template_footer_url: Optional[str] = None

class BrandingLandingPages(BaseModel):
    """Templates de landing pages disponíveis"""
    template: str = Field("launch", description="Template ativo")
    available_templates: List[str] = Field(
        default_factory=lambda: ["launch", "capture", "webinar", "product", "membership"]
    )
    sections: List[str] = Field(
        default_factory=lambda: ["hero", "features", "testimonials", "pricing", "faq", "cta"]
    )

class BrandingConfig(BaseModel):
    """Configuração completa de branding"""
    instance_id: str
    colors: BrandingColors = Field(default_factory=BrandingColors)
    fonts: BrandingFonts = Field(default_factory=BrandingFonts)
    logo: BrandingLogo = Field(default_factory=BrandingLogo)
    email: Optional[BrandingEmail] = None
    landing_pages: BrandingLandingPages = Field(default_factory=BrandingLandingPages)
    social_links: Optional[Dict[str, str]] = Field(default_factory=dict)

    def to_css_variables(self) -> str:
        """Converte cores para variáveis CSS"""
        return f"""
        :root {{
            --color-primary: {self.colors.primary};
            --color-secondary: {self.colors.secondary};
            --color-accent: {self.colors.accent};
            --color-background: {self.colors.background};
            --color-text: {self.colors.text};
            --color-muted: {self.colors.muted};
            --color-border: {self.colors.border};
            --color-success: {self.colors.success};
            --color-error: {self.colors.error};
            --color-warning: {self.colors.warning};

            --font-primary: {self.fonts.primary};
            --font-headings: {self.fonts.headings};
            --font-mono: {self.fonts.mono};
        }}
        """

    def to_html_style(self) -> str:
        """Converte configurações para tag style HTML"""
        return f"""
        <style>
        {self.to_css_variables()}
        body {{
            font-family: var(--font-primary);
            color: var(--color-text);
            background-color: var(--color-background);
        }}
        h1, h2, h3, h4, h5, h6 {{
            font-family: var(--font-headings);
        }}
        </style>
        """

class BrandingUpdateRequest(BaseModel):
    """Request para atualização de branding"""
    colors: Optional[BrandingColors] = None
    fonts: Optional[BrandingFonts] = None
    logo: Optional[BrandingLogo] = None
    social_links: Optional[Dict[str, str]] = None

class AssetUploadResponse(BaseModel):
    """Response após upload de asset"""
    asset_id: str
    url: str
    type: str
    filename: str
    size: int
    content_type: str