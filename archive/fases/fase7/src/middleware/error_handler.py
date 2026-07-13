"""
Middleware de Tratamento de Erros

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from typing import Optional, Dict, Any
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from fastapi import Request, status
from fastapi.responses import JSONResponse as FastAPIJSONResponse
import logging
import traceback

logger = logging.getLogger(__name__)

class APIError(Exception):
    """Exceção base para erros da API"""

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: Optional[Dict[str, Any]] = None
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)

class APIErrorCodes:
    """Códigos de erro da API"""

    # Erros gerais
    VALIDATION_ERROR = ("VALIDATION_ERROR", 400)
    INVALID_REQUEST = ("INVALID_REQUEST", 400)
    NOT_FOUND = ("NOT_FOUND", 404)
    CONFLICT = ("CONFLICT", 409)
    FORBIDDEN = ("FORBIDDEN", 403)
    UNAUTHORIZED = ("UNAUTHORIZED", 401)
    RATE_LIMIT_EXCEEDED = ("RATE_LIMIT_EXCEEDED", 429)
    INTERNAL_ERROR = ("INTERNAL_ERROR", 500)
    SERVICE_UNAVAILABLE = ("SERVICE_UNAVAILABLE", 503)

    # Erros específicos
    INSTANCE_NOT_FOUND = ("INSTANCE_NOT_FOUND", 404)
    INSTANCE_ALREADY_EXISTS = ("INSTANCE_ALREADY_EXISTS", 409)
    INSTANCE_SUSPENDED = ("INSTANCE_SUSPENDED", 403)

    DOMAIN_ALREADY_EXISTS = ("DOMAIN_ALREADY_EXISTS", 409)
    DOMAIN_NOT_VERIFIED = ("DOMAIN_NOT_VERIFIED", 422)
    DOMAIN_INVALID_FORMAT = ("DOMAIN_INVALID_FORMAT", 400)

    API_KEY_INVALID = ("API_KEY_INVALID", 401)
    API_KEY_EXPIRED = ("API_KEY_EXPIRED", 401)
    API_KEY_REVOKED = ("API_KEY_REVOKED", 401)

    PLAN_NOT_FOUND = ("PLAN_NOT_FOUND", 404)
    PLAN_NOT_ALLOWED = ("PLAN_NOT_ALLOWED", 403)

    WEBHOOK_NOT_FOUND = ("WEBHOOK_NOT_FOUND", 404)
    WEBHOOK_DELIVERY_FAILED = ("WEBHOOK_DELIVERY_FAILED", 500)

    ASSET_TOO_LARGE = ("ASSET_TOO_LARGE", 413)
    ASSET_TYPE_NOT_ALLOWED = ("ASSET_TYPE_NOT_ALLOWED", 415)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Middleware para tratamento centralizado de erros"""

    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response

        except APIError as e:
            logger.warning(f"API Error: {e.code} - {e.message}")
            return self._create_error_response(e)

        except ValidationError as e:
            logger.warning(f"Validation Error: {e}")
            return self._create_error_response(
                APIError(
                    code="VALIDATION_ERROR",
                    message=str(e),
                    status_code=400
                )
            )

        except Exception as e:
            logger.error(f"Unexpected error: {e}", exc_info=True)
            return self._create_error_response(
                APIError(
                    code="INTERNAL_ERROR",
                    message="Erro interno do servidor",
                    status_code=500,
                    details={"type": type(e).__name__}
                )
            )

    def _create_error_response(self, error: APIError) -> JSONResponse:
        """Cria resposta de erro padronizada"""
        content = {
            "error": error.code,
            "message": error.message
        }

        if error.details:
            content["details"] = error.details

        return JSONResponse(
            status_code=error.status_code,
            content=content
        )


class ValidationError(Exception):
    """Erro de validação de dados"""
    pass


async def api_error_handler(request: Request, exc: APIError) -> FastAPIJSONResponse:
    """Handler para APIError em FastAPI"""
    return FastAPIJSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.code,
            "message": exc.message,
            "details": exc.details
        }
    )


def raise_not_found(resource: str, identifier: str):
    """Helper para gerar erro 404"""
    raise APIError(
        code=f"{resource.upper()}_NOT_FOUND",
        message=f"{resource} não encontrado: {identifier}",
        status_code=404
    )


def raise_conflict(resource: str, identifier: str):
    """Helper para gerar erro 409"""
    raise APIError(
        code=f"{resource.upper()}_ALREADY_EXISTS",
        message=f"{resource} já existe: {identifier}",
        status_code=409
    )


def raise_validation_error(field: str, message: str):
    """Helper para gerar erro de validação"""
    raise APIError(
        code="VALIDATION_ERROR",
        message=f"Erro de validação: {field}",
        status_code=400,
        details={field: message}
    )