"""
Configurações da API White-Label

Autor: Nexus-HUB57
Versão: 1.0.0
"""

import os
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from enum import Enum

class PlanType(Enum):
    """Tipos de plano disponíveis"""
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"

@dataclass
class PlanFeatures:
    """Features de um plano"""
    users: int
    domains: int
    api_calls_per_month: int
    commission_rate: float
    storage_gb: int
    bandwidth_gb: int
    support_level: str
    custom_emails: bool
    dedicated_support: bool = False
    sla: str = "99%"

@dataclass
class Config:
    """Configuração principal da API"""

    # Ambiente
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"

    # API
    api_version: str = "v1"
    api_base_url: str = os.getenv("API_BASE_URL", "https://api.mmn-ai-to-ai.com")
    api_prefix: str = f"/{api_version}"

    # Banco de dados
    db_host: str = os.getenv("DB_HOST", "localhost")
    db_port: int = int(os.getenv("DB_PORT", "5432"))
    db_name: str = os.getenv("DB_NAME", "mmn_whitelabel")
    db_user: str = os.getenv("DB_USER", "postgres")
    db_password: str = os.getenv("DB_PASSWORD", "postgres")

    # CORS
    cors_origins: List[str] = field(default_factory=lambda: ["*"])
    cors_methods: List[str] = field(default_factory=lambda: ["GET", "POST", "PUT", "PATCH", "DELETE"])
    cors_headers: List[str] = field(default_factory=lambda: ["*"])

    # Rate Limiting
    rate_limit_default: int = 1000  # requisições por hora
    rate_limit_instances_post: int = 10  # por minuto
    rate_limit_instances_get: int = 100  # por minuto
    rate_limit_branding: int = 20  # por minuto

    # JWT
    jwt_secret: str = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
    jwt_algorithm: str = "HS256"
    jwt_expiry_hours: int = 24

    # Armazenamento
    storage_provider: str = os.getenv("STORAGE_PROVIDER", "s3")
    storage_bucket: str = os.getenv("STORAGE_BUCKET", "mmn-whitelabel-assets")
    storage_cdn_url: str = os.getenv("STORAGE_CDN_URL", "https://cdn.mmn-ai-to-ai.com")

    # E-mail
    email_provider: str = os.getenv("EMAIL_PROVIDER", "ses")
    email_from_name: str = "MMN AI-to-AI"
    email_from_address: str = os.getenv("EMAIL_FROM", "noreply@mmn-ai-to-ai.com")

    # Planos disponíveis
    plans: Dict[PlanType, PlanFeatures] = field(default_factory=lambda: {
        PlanType.STARTER: PlanFeatures(
            users=1000,
            domains=1,
            api_calls_per_month=100000,
            commission_rate=0.05,
            storage_gb=10,
            bandwidth_gb=100,
            support_level="email",
            custom_emails=False
        ),
        PlanType.PROFESSIONAL: PlanFeatures(
            users=10000,
            domains=3,
            api_calls_per_month=1000000,
            commission_rate=0.10,
            storage_gb=50,
            bandwidth_gb=500,
            support_level="priority",
            custom_emails=True
        ),
        PlanType.ENTERPRISE: PlanFeatures(
            users=-1,  # ilimitado
            domains=-1,  # ilimitado
            api_calls_per_month=-1,  # ilimitado
            commission_rate=0.15,
            storage_gb=-1,  # ilimitado
            bandwidth_gb=-1,  # ilimitado
            support_level="dedicated",
            custom_emails=True,
            dedicated_support=True,
            sla="99.99%"
        )
    })

    # Webhooks
    webhook_retries: int = 3
    webhook_retry_delay: int = 60  # segundos

    # Logging
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    @property
    def database_url(self) -> str:
        """URL de conexão com o banco de dados"""
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    @property
    def is_production(self) -> bool:
        """Verifica se está em produção"""
        return self.environment == "production"

    def get_plan_features(self, plan_type: PlanType) -> PlanFeatures:
        """Obtém as features de um plano"""
        return self.plans.get(plan_type)

    def get_plan_price(self, plan_type: PlanType, billing_cycle: str = "monthly") -> Optional[float]:
        """Obtém o preço de um plano"""
        prices = {
            PlanType.STARTER: {"monthly": 2997.00, "yearly": 28772.00},
            PlanType.PROFESSIONAL: {"monthly": 7997.00, "yearly": 76772.00},
            PlanType.ENTERPRISE: {"monthly": None, "yearly": None}
        }
        return prices.get(plan_type, {}).get(billing_cycle)


# Instância global de configuração
config = Config()