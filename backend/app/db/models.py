from datetime import datetime, timedelta
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship, JSON
from enum import Enum

class TaskStatus(str, Enum):
    QUEUED = "queued"
    PAUSED = "paused"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class PriorityLevel(str, Enum):
    URGENT = "urgent"
    DEFERRABLE = "deferrable"

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    request_id: str = Field(index=True, unique=True)
    status: TaskStatus = Field(default=TaskStatus.QUEUED)
    priority: PriorityLevel = Field(default=PriorityLevel.DEFERRABLE)
    
    # Task Payload
    input_data: str = Field(sa_column=Field(JSON))
    result: Optional[str] = Field(default=None, sa_column=Field(JSON))
    
    # Carbon Metrics
    p30_threshold: float = Field(default=0.0)
    baseline_emissions: float = Field(default=0.0)  # gCO2 if run immediately
    actual_emissions: float = Field(default=0.0)    # gCO2 actual
    carbon_saved: float = Field(default=0.0)
    
    # Timing
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    deadline: datetime = Field(default_factory=lambda: datetime.utcnow() + timedelta(hours=24))
    
    # Verification
    signature: Optional[str] = Field(default=None)
    
    events: List["TaskEvent"] = Relationship(back_populates="task")

class TaskEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="task.id")
    event_type: str  # PAUSED, RESUMED, COMPLETED, etc.
    intensity: float # Carbon intensity at this event
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    message: Optional[str] = Field(default=None)
    
    task: "Task" = Relationship(back_populates="events")

class CarbonHistory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(index=True)
    intensity: float
    region: str = Field(default="UK")
