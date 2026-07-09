"""
Modelos base para herança

Autor: Nexus-HUB57
Versão: 1.0.0
"""

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid

class BaseModel(BaseModel):
    """Modelo base com configurações padrões"""

    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class UUIDModel(BaseModel):
    """Modelo base com ID UUID"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class TimestampedModel(UUIDModel):
    """Modelo base com timestamps de criação e atualização"""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def update_timestamp(self):
        """Atualiza o timestamp de modificação"""
        self.updated_at = datetime.utcnow()

class MetadataModel(BaseModel):
    """Modelo com campo para metadados customizados"""
    metadata: Dict[str, Any] = Field(default_factory=dict)