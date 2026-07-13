"""
API Routes - Arquivo de inicialização

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from .instances import router as instances_router
from .branding import router as branding_router
from .domains import router as domains_router
from .plans import router as plans_router
from .webhooks import router as webhooks_router
from .metrics import router as metrics_router

__all__ = [
    "instances_router",
    "branding_router",
    "domains_router",
    "plans_router",
    "webhooks_router",
    "metrics_router",
]