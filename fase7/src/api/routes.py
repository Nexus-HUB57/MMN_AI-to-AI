"""
Main Application

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from .config import Config
from .services import (
    InstanceService, BrandingService, DomainService,
    WebhookService, ApiKeyService
)
from .api import (
    instances_router, branding_router, domains_router,
    plans_router, webhooks_router, metrics_router
)
from .middleware.error_handler import (
    ErrorHandlerMiddleware, api_error_handler, APIError
)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def create_app(config: Config = None) -> FastAPI:
    """Cria e configura a aplicação FastAPI"""

    # Configuração
    if config is None:
        config = Config()

    # Criar app
    app = FastAPI(
        title="MMN AI-to-AI White-Label API",
        description="API REST para gerenciamento de instâncias White-Label",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json"
    )

    # Armazenar estado
    app.state.config = config

    # Inicializar serviços
    instance_service = InstanceService(config)
    branding_service = BrandingService()
    domain_service = DomainService()
    webhook_service = WebhookService(config)
    api_key_service = ApiKeyService()

    app.state.instance_service = instance_service
    app.state.branding_service = branding_service
    app.state.domain_service = domain_service
    app.state.webhook_service = webhook_service
    app.state.api_key_service = api_key_service

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.cors_origins,
        allow_credentials=True,
        allow_methods=config.cors_methods,
        allow_headers=config.cors_headers,
    )

    # Error handler
    app.add_middleware(ErrorHandlerMiddleware)
    app.add_exception_handler(APIError, api_error_handler)

    # Registrar rotas
    app.include_router(instances_router, prefix="/whitelabel")
    app.include_router(branding_router, prefix="/whitelabel")
    app.include_router(domains_router, prefix="/whitelabel/instances")
    app.include_router(plans_router, prefix="/whitelabel")
    app.include_router(webhooks_router, prefix="/whitelabel/instances")
    app.include_router(metrics_router, prefix="/whitelabel/instances")

    # Health check
    @app.get("/health", tags=["Health"])
    async def health_check():
        """Health check endpoint"""
        return {
            "status": "healthy",
            "version": "1.0.0",
            "service": "mmn-whitelabel-api"
        }

    # Root endpoint
    @app.get("/", tags=["Root"])
    async def root():
        """Root endpoint"""
        return {
            "name": "MMN AI-to-AI White-Label API",
            "version": "1.0.0",
            "documentation": "/docs",
            "health": "/health"
        }

    logger.info("Application created successfully")
    return app

# Para uso com uvicorn
app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)