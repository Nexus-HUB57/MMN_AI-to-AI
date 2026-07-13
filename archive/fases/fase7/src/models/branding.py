"""
Modelos de Branding e Customização Visual

Autor: Nexus-HUB57
Versão: 1.1.0 - Sprint 2 Branding Engine
"""

from typing import Optional, Dict, Any, List, Enum
from pydantic import BaseModel, Field, validator
import re


class ThemePreset(str, Enum):
    """Presets de temas predefinidos"""
    MODERN_BLUE = "modern_blue"
    CORPORATE_GRAY = "corporate_gray"
    VIBRANT_PURPLE = "vibrant_purple"
    NATURE_GREEN = "nature_green"
    ELEGANT_BLACK = "elegant_black"
    SUNSET_ORANGE = "sunset_orange"
    ROYAL_GOLD = "royal_gold"
    MINIMAL_WHITE = "minimal_white"


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


class ThemePresetColors(BaseModel):
    """Configurações de cor para presets de tema"""
    primary: str
    secondary: str
    accent: str
    background: str
    text: str


THEME_PRESETS: Dict[ThemePreset, ThemePresetColors] = {
    ThemePreset.MODERN_BLUE: ThemePresetColors(
        primary="#2563EB",
        secondary="#1E40AF",
        accent="#3B82F6",
        background="#FFFFFF",
        text="#1F2937"
    ),
    ThemePreset.CORPORATE_GRAY: ThemePresetColors(
        primary="#374151",
        secondary="#1F2937",
        accent="#6B7280",
        background="#F9FAFB",
        text="#111827"
    ),
    ThemePreset.VIBRANT_PURPLE: ThemePresetColors(
        primary="#7C3AED",
        secondary="#5B21B6",
        accent="#A78BFA",
        background="#FAFAFA",
        text="#1F2937"
    ),
    ThemePreset.NATURE_GREEN: ThemePresetColors(
        primary="#059669",
        secondary="#047857",
        accent="#34D399",
        background="#F0FDF4",
        text="#064E3B"
    ),
    ThemePreset.ELEGANT_BLACK: ThemePresetColors(
        primary="#111827",
        secondary="#000000",
        accent="#6B7280",
        background="#FFFFFF",
        text="#111827"
    ),
    ThemePreset.SUNSET_ORANGE: ThemePresetColors(
        primary="#EA580C",
        secondary="#C2410C",
        accent="#FB923C",
        background="#FFFBEB",
        text="#7C2D12"
    ),
    ThemePreset.ROYAL_GOLD: ThemePresetColors(
        primary="#B45309",
        secondary="#92400E",
        accent="#F59E0B",
        background="#FFFBEB",
        text="#78350F"
    ),
    ThemePreset.MINIMAL_WHITE: ThemePresetColors(
        primary="#000000",
        secondary="#374151",
        accent="#6B7280",
        background="#FFFFFF",
        text="#111827"
    ),
}


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


class ThemeCustomization(BaseModel):
    """Customização avançada de tema"""
    border_radius: str = Field("8px", description="Raio de borda padrão")
    button_style: str = Field("rounded", description="Estilo de botões")
    card_shadow: str = Field("0 1px 3px rgba(0,0,0,0.1)", description="Sombra de cards")
    animation_speed: str = Field("0.3s", description="Velocidade de animações")


class BrandingConfig(BaseModel):
    """Configuração completa de branding"""
    instance_id: str
    theme_preset: Optional[ThemePreset] = Field(None, description="Preset de tema")
    colors: BrandingColors = Field(default_factory=BrandingColors)
    fonts: BrandingFonts = Field(default_factory=BrandingFonts)
    logo: BrandingLogo = Field(default_factory=BrandingLogo)
    email: Optional[BrandingEmail] = None
    landing_pages: BrandingLandingPages = Field(default_factory=BrandingLandingPages)
    social_links: Optional[Dict[str, str]] = Field(default_factory=dict)
    theme_customization: ThemeCustomization = Field(default_factory=ThemeCustomization)

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

            --radius-default: {self.theme_customization.border_radius};
            --shadow-card: {self.theme_customization.card_shadow};
            --transition-speed: {self.theme_customization.animation_speed};
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
        .btn-primary {{
            background-color: var(--color-primary);
            border-radius: var(--radius-default);
            transition: all var(--transition-speed);
        }}
        .card {{
            border-radius: var(--radius-default);
            box-shadow: var(--shadow-card);
        }}
        </style>
        """

    def to_preview_html(self) -> str:
        """Gera HTML completo de preview do branding"""
        logo_html = ""
        if self.logo.primary_url:
            logo_html = f'<img src="{self.logo.primary_url}" alt="Logo" class="preview-logo">'
        elif self.logo.favicon_url:
            logo_html = f'<img src="{self.logo.favicon_url}" alt="Logo" class="preview-logo">'
        else:
            logo_html = '<div class="preview-logo-placeholder">Logo Placeholder</div>'

        return f"""
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview - {self.instance_id}</title>
    <link href="https://fonts.googleapis.com/css2?family={self.fonts.headings.split(',')[0].strip()}&family={self.fonts.primary.split(',')[0].strip()}&display=swap" rel="stylesheet">
    <style>
        {self.to_html_style()}

        * {{ box-sizing: border-box; margin: 0; padding: 0; }}

        body {{
            min-height: 100vh;
            padding: 2rem;
        }}

        .preview-container {{
            max-width: 800px;
            margin: 0 auto;
        }}

        .preview-header {{
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: var(--color-background);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-default);
            margin-bottom: 2rem;
        }}

        .preview-logo {{
            max-height: 48px;
            max-width: 150px;
            object-fit: contain;
        }}

        .preview-logo-placeholder {{
            padding: 0.75rem 1.5rem;
            background: var(--color-primary);
            color: white;
            border-radius: var(--radius-default);
            font-weight: 600;
        }}

        .btn {{
            display: inline-block;
            padding: 0.75rem 1.5rem;
            border-radius: var(--radius-default);
            font-weight: 500;
            cursor: pointer;
            transition: all var(--transition-speed);
            border: none;
        }}

        .btn-primary {{
            background-color: var(--color-primary);
            color: white;
        }}

        .btn-primary:hover {{
            filter: brightness(1.1);
            transform: translateY(-2px);
        }}

        .btn-secondary {{
            background-color: transparent;
            color: var(--color-primary);
            border: 2px solid var(--color-primary);
        }}

        .card {{
            padding: 1.5rem;
            background: var(--color-background);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-default);
            margin-bottom: 1rem;
        }}

        .card-accent {{
            border-left: 4px solid var(--color-accent);
        }}

        .badge {{
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 500;
        }}

        .badge-success {{
            background: var(--color-success);
            color: white;
        }}

        .badge-warning {{
            background: var(--color-warning);
            color: white;
        }}

        .input-field {{
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid var(--color-border);
            border-radius: var(--radius-default);
            font-size: 1rem;
            transition: border-color var(--transition-speed);
        }}

        .input-field:focus {{
            outline: none;
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }}

        .color-swatches {{
            display: flex;
            gap: 0.5rem;
            margin: 1rem 0;
        }}

        .color-swatch {{
            width: 40px;
            height: 40px;
            border-radius: var(--radius-default);
            border: 1px solid var(--color-border);
        }}

        .section-title {{
            color: var(--color-primary);
            margin-bottom: 1rem;
        }}
    </style>
</head>
<body>
    <div class="preview-container">
        <div class="preview-header">
            {logo_html}
            <span style="margin-left: auto; color: var(--color-muted);">Preview do Branding</span>
        </div>

        <h1 style="font-family: var(--font-headings); color: var(--color-text); margin-bottom: 1rem;">
            Título de Exemplo
        </h1>

        <p style="color: var(--color-muted); margin-bottom: 2rem;">
            Este é um exemplo de parágrafo com o texto configurado no seu branding.
            Demonstra como os diferentes elementos aparecem com suas cores e fontes.
        </p>

        <div class="color-swatches">
            <div class="color-swatch" style="background-color: {self.colors.primary};" title="Primary"></div>
            <div class="color-swatch" style="background-color: {self.colors.secondary};" title="Secondary"></div>
            <div class="color-swatch" style="background-color: {self.colors.accent};" title="Accent"></div>
            <div class="color-swatch" style="background-color: {self.colors.background};" title="Background"></div>
            <div class="color-swatch" style="background-color: {self.colors.text};" title="Text"></div>
        </div>

        <h3 class="section-title">Botões</h3>
        <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
            <button class="btn btn-primary">Botão Primário</button>
            <button class="btn btn-secondary">Botão Secundário</button>
        </div>

        <h3 class="section-title">Cards</h3>
        <div class="card card-accent">
            <h4 style="color: var(--color-text); margin-bottom: 0.5rem;">Card com Destaque</h4>
            <p style="color: var(--color-muted);">Este card demonstra o estilo de borda e sombras do seu tema.</p>
        </div>

        <div class="card">
            <span class="badge badge-success">Sucesso</span>
            <span class="badge badge-warning" style="margin-left: 0.5rem;">Aviso</span>
        </div>

        <h3 class="section-title">Formulário</h3>
        <div class="card">
            <input type="text" class="input-field" placeholder="Campo de exemplo" style="margin-bottom: 1rem;">
            <button class="btn btn-primary" style="width: 100%;">Enviar</button>
        </div>

        <footer style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--color-border); color: var(--color-muted); text-align: center;">
            Powered by MMN_AI-to-AI White-Label
        </footer>
    </div>
</body>
</html>
        """


class BrandingUpdateRequest(BaseModel):
    """Request para atualização de branding"""
    colors: Optional[BrandingColors] = None
    fonts: Optional[BrandingFonts] = None
    logo: Optional[BrandingLogo] = None
    social_links: Optional[Dict[str, str]] = None
    theme_preset: Optional[ThemePreset] = None
    theme_customization: Optional[ThemeCustomization] = None


class AssetUploadResponse(BaseModel):
    """Response após upload de asset"""
    asset_id: str
    url: str
    type: str
    filename: str
    size: int
    content_type: str


class AssetValidationResult(BaseModel):
    """Resultado da validação de asset"""
    valid: bool
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = None


class ThemePresetInfo(BaseModel):
    """Informações de um preset de tema"""
    id: ThemePreset
    name: str
    description: str
    colors: ThemePresetColors