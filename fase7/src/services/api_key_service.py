"""
Serviço de Gerenciamento de API Keys

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging
import hashlib
import secrets
import uuid

from ..models.api_key import (
    ApiKey, ApiKeyType, ApiKeyCreateRequest, ApiKeyResponse
)

logger = logging.getLogger(__name__)

class ApiKeyService:
    """Serviço para gerenciamento de API Keys"""

    def __init__(self):
        self._keys: Dict[str, ApiKey] = {}  # key_id -> ApiKey
        self._key_lookup: Dict[str, str] = {}  # key_hash -> key_id

    def create_key(self, data: ApiKeyCreateRequest) -> ApiKeyResponse:
        """Cria nova API Key"""
        # Gera key única
        key_id = str(uuid.uuid4())
        key = secrets.token_urlsafe(32)
        key_prefix = self._get_prefix_for_type(data.key_type)
        full_key = f"{key_prefix}_{key}"

        # Hash da key para armazenamento
        key_hash = self._hash_key(full_key)

        # Calcula expiração
        expires_at = None
        if data.expires_in_days:
            expires_at = datetime.utcnow() + timedelta(days=data.expires_in_days)

        api_key = ApiKey(
            id=key_id,
            instance_id=data.instance_id,
            key_prefix=key_prefix,
            key_type=data.key_type,
            permissions=data.permissions or [],
            rate_limit=data.rate_limit or 1000,
            expires_at=expires_at,
            created_at=datetime.utcnow()
        )

        self._keys[key_id] = api_key
        self._key_lookup[key_hash] = key_id

        logger.info(f"API Key criada: {key_id}")

        return ApiKeyResponse(
            id=key_id,
            key_prefix=key_prefix,
            key=full_key,  # Apenas na criação
            key_type=api_key.key_type,
            permissions=api_key.permissions,
            rate_limit=api_key.rate_limit,
            expires_at=api_key.expires_at,
            created_at=api_key.created_at
        )

    def validate_key(self, api_key: str) -> Optional[ApiKey]:
        """Valida API Key e retorna o modelo se válida"""
        # Extrai prefixo (não utilizado na validação real)
        parts = api_key.split('_')
        if len(parts) < 2:
            return None

        # Hash da key fornecida
        key_hash = self._hash_key(api_key)

        # Busca key
        key_id = self._key_lookup.get(key_hash)
        if not key_id:
            logger.warning(f"API Key não encontrada: {api_key[:20]}...")
            return None

        key = self._keys.get(key_id)
        if not key:
            return None

        # Verifica se é válida
        if not key.is_valid:
            logger.warning(f"API Key inválida ou expirada: {key_id}")
            return None

        # Atualiza último uso
        key.last_used_at = datetime.utcnow()

        return key

    def get_key(self, key_id: str) -> Optional[ApiKey]:
        """Obtém API Key por ID (sem a chave secreta)"""
        return self._keys.get(key_id)

    def list_keys(
        self, instance_id: Optional[str] = None, include_expired: bool = False
    ) -> List[ApiKey]:
        """Lista API Keys"""
        keys = list(self._keys.values())

        # Filtra por instância
        if instance_id:
            keys = [k for k in keys if k.instance_id == instance_id]

        # Filtra expiradas se necessário
        if not include_expired:
            keys = [k for k in keys if k.is_valid]

        return keys

    def revoke_key(self, key_id: str) -> bool:
        """Revoga API Key"""
        key = self._keys.get(key_id)
        if not key:
            return False

        key.revoked_at = datetime.utcnow()
        key.is_active = False
        logger.info(f"API Key revocada: {key_id}")

        return True

    def update_key(
        self, key_id: str,
        permissions: Optional[List[str]] = None,
        rate_limit: Optional[int] = None
    ) -> Optional[ApiKey]:
        """Atualiza API Key"""
        key = self._keys.get(key_id)
        if not key:
            return None

        if permissions is not None:
            key.permissions = permissions
        if rate_limit is not None:
            key.rate_limit = rate_limit

        return key

    def get_key_permissions(self, api_key: str) -> List[str]:
        """Obtém permissões de uma key"""
        key = self.validate_key(api_key)
        return key.permissions if key else []

    def has_permission(self, api_key: str, permission: str) -> bool:
        """Verifica se key tem permissão específica"""
        permissions = self.get_key_permissions(api_key)
        return permission in permissions

    def _hash_key(self, key: str) -> str:
        """Gera hash SHA256 da key"""
        return hashlib.sha256(key.encode()).hexdigest()

    def _get_prefix_for_type(self, key_type: str) -> str:
        """Obtém prefixo baseado no tipo de key"""
        prefixes = {
            "partner": "wl_partner",
            "admin": "wl_admin",
            "instance": "wl_inst"
        }
        return prefixes.get(key_type, "wl_live")

    def get_usage_stats(self, key_id: str) -> Dict[str, Any]:
        """Obtém estatísticas de uso de uma key"""
        key = self._keys.get(key_id)
        if not key:
            return {"error": "Key não encontrada"}

        return {
            "key_id": key_id,
            "key_type": key.key_type,
            "instance_id": key.instance_id,
            "created_at": key.created_at.isoformat(),
            "last_used_at": key.last_used_at.isoformat() if key.last_used_at else None,
            "is_valid": key.is_valid,
            "rate_limit": key.rate_limit,
            "expires_at": key.expires_at.isoformat() if key.expires_at else None
        }