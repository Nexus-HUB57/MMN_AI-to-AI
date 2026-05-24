"""
Serviço de Gerenciamento de Instâncias

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from ..models.instance import (
    Instance, InstanceCreate, InstanceUpdate, InstanceStatus
)
from ..models.plan import Plan
from ..config import Config

logger = logging.getLogger(__name__)

class InstanceService:
    """Serviço para gerenciamento de instâncias White-Label"""

    def __init__(self, config: Config):
        self.config = config
        self._instances: Dict[str, Instance] = {}  # Em memória para demo

    def create_instance(self, data: InstanceCreate) -> Instance:
        """Cria uma nova instância"""
        logger.info(f"Criando instância para brand: {data.brand_name}")

        # Verifica se slug já existe
        if self._instances.get(data.brand_slug):
            raise ValueError(f"Brand slug '{data.brand_slug}' já existe")

        # Cria instância
        instance = Instance(
            instance_id=Instance.generate_instance_id(),
            brand_name=data.brand_name,
            brand_slug=data.brand_slug,
            plan=data.plan,
            status=InstanceStatus.PROVISIONING,
            country=data.country,
            timezone=data.timezone,
            currency=data.currency,
            metadata={
                "admin_email": data.admin_email,
                "admin_name": data.admin_name
            }
        )

        # Armazena
        self._instances[instance.brand_slug] = instance

        logger.info(f"Instância criada: {instance.instance_id}")
        return instance

    def get_instance(self, instance_id: str) -> Optional[Instance]:
        """Obtém instância por ID"""
        for instance in self._instances.values():
            if instance.instance_id == instance_id:
                return instance
        return None

    def get_instance_by_slug(self, brand_slug: str) -> Optional[Instance]:
        """Obtém instância por slug"""
        return self._instances.get(brand_slug)

    def list_instances(
        self,
        status: Optional[str] = None,
        plan: Optional[str] = None,
        page: int = 1,
        limit: int = 20
    ) -> Dict[str, Any]:
        """Lista instâncias com filtros e paginação"""
        instances = list(self._instances.values())

        # Filtros
        if status:
            instances = [i for i in instances if i.status == status]
        if plan:
            instances = [i for i in instances if i.plan == plan]

        # Paginação
        total = len(instances)
        start = (page - 1) * limit
        end = start + limit
        paginated = instances[start:end]

        return {
            "data": paginated,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        }

    def update_instance(
        self, instance_id: str, data: InstanceUpdate
    ) -> Optional[Instance]:
        """Atualiza instância"""
        instance = self.get_instance(instance_id)
        if not instance:
            return None

        # Atualiza campos fornecidos
        update_data = data.dict(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                setattr(instance, key, value)

        instance.update_timestamp()
        return instance

    def suspend_instance(self, instance_id: str) -> Optional[Instance]:
        """Suspende instância"""
        instance = self.get_instance(instance_id)
        if not instance:
            return None

        instance.status = InstanceStatus.SUSPENDED
        instance.suspended_at = datetime.utcnow()
        instance.update_timestamp()

        logger.info(f"Instância suspensa: {instance_id}")
        return instance

    def activate_instance(self, instance_id: str) -> Optional[Instance]:
        """Ativa instância"""
        instance = self.get_instance(instance_id)
        if not instance:
            return None

        instance.status = InstanceStatus.ACTIVE
        instance.activated_at = datetime.utcnow()
        instance.suspended_at = None
        instance.update_timestamp()

        logger.info(f"Instância ativada: {instance_id}")
        return instance

    def cancel_instance(self, instance_id: str) -> Optional[Instance]:
        """Cancela instância"""
        instance = self.get_instance(instance_id)
        if not instance:
            return None

        instance.status = InstanceStatus.CANCELLED
        instance.update_timestamp()

        logger.info(f"Instância cancelada: {instance_id}")
        return instance

    def get_instance_metrics(self, instance_id: str) -> Optional[Dict[str, Any]]:
        """Obtém métricas da instância"""
        instance = self.get_instance(instance_id)
        if not instance:
            return None

        # Métricas simuladas
        return {
            "instance_id": instance_id,
            "brand_name": instance.brand_name,
            "period": "30d",
            "metrics": {
                "total_users": 1520,
                "active_users": 1280,
                "new_users": 145,
                "gmv": 245000.00,
                "commission_paid": 24500.00,
                "conversion_rate": 3.2
            },
            "trends": {
                "users_growth": "+12%",
                "gmv_growth": "+8%",
                "conversion_growth": "+0.5%"
            }
        }

    def validate_plan_limit(self, plan: str, feature: str) -> bool:
        """Valida se plano suporta feature"""
        plan_config = {
            "starter": {"users": 1000, "domains": 1},
            "professional": {"users": 10000, "domains": 3},
            "enterprise": {"users": -1, "domains": -1}
        }

        if plan not in plan_config:
            return False

        limit = plan_config[plan].get(feature, 0)
        return limit != 0