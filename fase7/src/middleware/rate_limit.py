"""
Middleware de Rate Limiting

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from typing import Dict, Tuple, Optional
from datetime import datetime, timedelta
from functools import wraps
import logging
import hashlib

logger = logging.getLogger(__name__)

class RateLimitStore:
    """Armazenamento em memória para rate limiting"""

    def __init__(self):
        self._store: Dict[str, Dict] = {}

    def check_rate_limit(
        self, key: str, limit: int, window_seconds: int
    ) -> Tuple[bool, int, int]:
        """
        Verifica rate limit para uma key

        Returns:
            (is_allowed, remaining, reset_time)
        """
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=window_seconds)

        if key not in self._store:
            self._store[key] = {"count": 0, "window_start": now}

        record = self._store[key]

        # Reset se janela passou
        if record["window_start"] < window_start:
            record["count"] = 0
            record["window_start"] = now

        remaining = max(0, limit - record["count"])
        reset_time = int((record["window_start"] + timedelta(seconds=window_seconds) - now).total_seconds())

        if record["count"] >= limit:
            logger.warning(f"Rate limit excedido: {key}")
            return False, 0, max(0, reset_time)

        record["count"] += 1
        return True, remaining - 1, max(0, reset_time)

    def cleanup(self):
        """Limpa registros antigos"""
        now = datetime.utcnow()
        max_age = timedelta(hours=24)
        keys_to_remove = []

        for key, record in self._store.items():
            if now - record["window_start"] > max_age:
                keys_to_remove.append(key)

        for key in keys_to_remove:
            del self._store[key]


class RateLimitMiddleware:
    """Middleware para rate limiting"""

    def __init__(self, default_limit: int = 1000, window_seconds: int = 3600):
        self.default_limit = default_limit
        self.window_seconds = window_seconds
        self.store = RateLimitStore()

    def get_client_key(self, request) -> str:
        """Gera key única para o cliente"""
        # Tenta usar API Key se disponível
        api_key = getattr(request.state, 'api_key', None)
        if api_key:
            return f"apikey:{api_key.id}"

        # Fallback para IP
        client_ip = request.client.host if request.client else "unknown"
        return f"ip:{client_ip}"

    async def check(self, request, limit: Optional[int] = None) -> Tuple[bool, Dict]:
        """Verifica rate limit para requisição"""
        key = self.get_client_key(request)
        limit = limit or self.default_limit

        is_allowed, remaining, reset_time = self.store.check_rate_limit(
            key, limit, self.window_seconds
        )

        headers = {
            "X-RateLimit-Limit": str(limit),
            "X-RateLimit-Remaining": str(remaining),
            "X-RateLimit-Reset": str(reset_time)
        }

        return is_allowed, headers


# Instância global
rate_limiter = RateLimitMiddleware()

def rate_limit(limit: int, window_seconds: int = 60):
    """
    Decorator para aplicar rate limit a endpoints

    Usage:
        @rate_limit(limit=10, window_seconds=60)
        async def create_instance(request):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(request, *args, **kwargs):
            is_allowed, headers = await rate_limiter.check(request, limit)

            if not is_allowed:
                from starlette.responses import JSONResponse
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": "RATE_LIMIT_EXCEEDED",
                        "message": "Limite de requisições excedido",
                        "retry_after": headers["X-RateLimit-Reset"]
                    },
                    headers=headers
                )

            result = await func(request, *args, **kwargs)

            # Adiciona headers de rate limit à resposta
            if hasattr(result, 'headers'):
                for key, value in headers.items():
                    result.headers[key] = value

            return result

        return wrapper
    return decorator


# Rate limits específicos por endpoint
class RateLimits:
    """Rate limits para endpoints específicos"""

    # Instâncias
    CREATE_INSTANCE = (10, 60)  # 10 por minuto
    LIST_INSTANCES = (100, 60)  # 100 por minuto
    GET_INSTANCE = (100, 60)

    # Branding
    UPDATE_BRANDING = (20, 60)  # 20 por minuto

    # Domínios
    ADD_DOMAIN = (10, 60)
    VERIFY_DOMAIN = (20, 60)

    # API Keys
    CREATE_KEY = (10, 60)

    # Webhooks
    CREATE_WEBHOOK = (10, 60)
    TEST_WEBHOOK = (5, 60)