from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class TaskCreate(BaseModel):
    priority: str = "deferrable"
    payload: Dict[str, Any] = Field(default_factory=lambda: {"prompt": "Default AI task"})

class TaskResponse(BaseModel):
    request_id: str
    status: str
    priority: str
    current_intensity: Optional[float]
    p30_threshold: Optional[float]
    emissions_saved: float
    created_at: datetime
    
class CarbonStatus(BaseModel):
    current: float
    p30_threshold: float
    is_green: bool
    forecast_summary: str
