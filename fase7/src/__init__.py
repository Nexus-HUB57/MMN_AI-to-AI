"""
MMN_AI-to-AI White-Label API
Módulo principal da API REST para gerenciamento de instâncias White-Label

Autor: Nexus-HUB57
Versão: 1.0.0
Data: 2026-05-24
"""

__version__ = "1.0.0"
__author__ = "Nexus-HUB57"

from .api.routes import create_app
from .models.database import Database
from .services.instance_service import InstanceService
from .services.branding_service import BrandingService
from .services.domain_service import DomainService
from .middleware.auth import AuthMiddleware
from .config import Config

__all__ = [
    "create_app",
    "Database",
    "InstanceService",
    "BrandingService",
    "DomainService",
    "AuthMiddleware",
    "Config",
]