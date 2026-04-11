from pydantic import BaseModel, Field, model_validator
from typing import Optional, Dict, Any
from datetime import datetime

class TaskCreate(BaseModel):
    priority: str = "deferrable"
    payload: Dict[str, Any] = Field(default_factory=lambda: {"prompt": "Default AI task"})

class TaskResponse(BaseModel):
    model_config = {"from_attributes": True}

    request_id: str
    status: str
    priority: str
    current_intensity: Optional[float] = None
    p30_threshold: Optional[float] = None
    # The DB model stores this as `carbon_saved`; we expose it as `emissions_saved`
    emissions_saved: float = 0.0
    created_at: datetime

    @model_validator(mode="before")
    @classmethod
    def map_carbon_saved(cls, data):
        """Map carbon_saved -> emissions_saved when coming from ORM Task object."""
        if hasattr(data, "__dict__"):
            return {
                "request_id": data.request_id,
                "status": data.status.value if hasattr(data.status, "value") else data.status,
                "priority": data.priority.value if hasattr(data.priority, "value") else data.priority,
                "current_intensity": getattr(data, "current_intensity", None),
                "p30_threshold": getattr(data, "p30_threshold", None),
                "emissions_saved": getattr(data, "carbon_saved", 0.0),
                "created_at": data.created_at,
            }
        return data

class CarbonStatus(BaseModel):
    current: float
    p30_threshold: float
    is_green: bool
    forecast_summary: str
