"""
Middleware de Autenticação

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from typing import Optional, List, Callable, Any
from functools import wraps
import logging

from ..services.api_key_service import ApiKeyService

logger = logging.getLogger(__name__)

class AuthMiddleware:
    """Middleware para autenticação via API Key"""

    def __init__(self, api_key_service: ApiKeyService):
        self.api_key_service = api_key_service

    def authenticate(self, request) -> Optional[Any]:
        """
        Autentica requisição e retorna API Key se válida

        Args:
            request: Objeto de requisição

        Returns:
            ApiKey se autenticada, None caso contrário
        """
        # Extrai API Key do header
        auth_header = request.headers.get('Authorization', '')

        if not auth_header:
            logger.debug("Header Authorization não encontrado")
            return None

        # Parse Bearer token
        parts = auth_header.split(' ')
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            logger.debug("Formato de Authorization inválido")
            return None

        api_key = parts[1]

        # Valida key
        validated_key = self.api_key_service.validate_key(api_key)
        if not validated_key:
            logger.warning(f"API Key inválida")
            return None

        return validated_key

def require_auth(permissions: Optional[List[str]] = None):
    """
    Decorator para exigir autenticação

    Args:
        permissions: Lista de permissões necessárias (opcional)
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(request, *args, **kwargs):
            # Em contexto FastAPI/Starlette, extrair serviço do app state
            api_key_service = request.app.state.api_key_service

            auth_middleware = AuthMiddleware(api_key_service)
            api_key = auth_middleware.authenticate(request)

            if not api_key:
                from starlette.responses import JSONResponse
                return JSONResponse(
                    status_code=401,
                    content={"error": "UNAUTHORIZED", "message": "API Key inválida ou não fornecida"}
                )

            # Verifica permissões se especificadas
            if permissions:
                missing = [p for p in permissions if p not in api_key.permissions]
                if missing:
                    logger.warning(f"Permissões insuficientes: {missing}")
                    from starlette.responses import JSONResponse
                    return JSONResponse(
                        status_code=403,
                        content={"error": "FORBIDDEN", "message": f"Permissões necessárias: {missing}"}
                    )

            # Adiciona api_key ao request
            request.state.api_key = api_key

            return await func(request, *args, **kwargs)

        return wrapper
    return decorator

def require_permission(permission: str):
    """Decorator para exigir permissão específica"""
    return require_auth(permissions=[permission])

class CurrentUser:
    """Helper para obter usuário atual da requisição"""

    @staticmethod
    def get(request) -> Any:
        """Obtém API Key do request"""
        return getattr(request.state, 'api_key', None)

    @staticmethod
    def get_instance_id(request) -> Optional[str]:
        """Obtém instance_id do usuário atual"""
        api_key = CurrentUser.get(request)
        return api_key.instance_id if api_key else None

    @staticmethod
    def is_admin(request) -> bool:
        """Verifica se é admin"""
        api_key = CurrentUser.get(request)
        return api_key.key_type == 'admin' if api_key else False