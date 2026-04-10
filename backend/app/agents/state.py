from typing import TypedDict, Annotated, List, Dict, Optional, Any
from datetime import datetime
import operator

class AgentState(TypedDict):
    # Core Task Info
    task_id: int
    request_id: str
    priority: str
    input_data: Dict[str, Any]
    
    # Decisions & Metadata
    is_urgent: bool
    can_defer: bool
    max_delay_hours: int
    p30_threshold: float
    current_intensity: float
    
    # Execution State
    is_paused: bool
    retry_count: int
    decision_reasoning: str
    
    # Results
    output: Optional[str]
    emissions_saved: float
    
    # Event Logs (Annotated with operator.add to append logs)
    logs: Annotated[List[str], operator.add]
