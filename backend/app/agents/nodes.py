import json
from datetime import datetime
from typing import Dict, Any
from app.agents.state import AgentState
from app.core.carbon_service import CarbonService, UKCarbonProvider
from app.core.llm import get_llm
from langchain_core.messages import HumanMessage, SystemMessage

# Initialize carbon service
carbon_service = CarbonService(UKCarbonProvider())

async def triage_node(state: AgentState) -> Dict[str, Any]:
    """Classifies task as Urgent or Deferrable and sets deadline."""
    llm = get_llm()
    input_text = str(state["input_data"])
    
    prompt = f"""
    Analyze the following AI task and determine its priority:
    Task: {input_text}
    
    Classify as:
    1. Urgent (e.g., real-time user response, security critical)
    2. Deferrable (e.g., batch processing, report generation)
    
    If deferrable, suggest a max delay in hours (1-48).
    
    Return JSON only:
    {{
        "is_urgent": bool,
        "can_defer": bool,
        "max_delay_hours": int,
        "reasoning": str
    }}
    """
    
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    # Parse json safely
    try:
        data = json.loads(response.content.strip("```json").strip("```"))
    except:
        data = {"is_urgent": False, "can_defer": True, "max_delay_hours": 12, "reasoning": "Fallback class"}

    return {
        "is_urgent": data["is_urgent"],
        "can_defer": data["can_defer"],
        "max_delay_hours": data["max_delay_hours"],
        "decision_reasoning": data["reasoning"],
        "logs": [f"Triage complete: Priority={ 'URGENT' if data['is_urgent'] else 'DEFERRABLE' }"]
    }

async def scheduler_node(state: AgentState) -> Dict[str, Any]:
    """Checks carbon intensity against P30 and decides whether to pause."""
    if state["is_urgent"]:
        return {"is_paused": False, "logs": ["Urgent task - Bypassing carbon check."]}

    # Get current intensity and p30
    current_intensity = await carbon_service.provider.get_current_intensity()
    p30 = await carbon_service.provider.get_p30_threshold()
    
    should_run, _ = await carbon_service.should_execute(state["priority"], current_intensity)
    
    if not should_run:
        return {
            "is_paused": True, 
            "p30_threshold": p30,
            "current_intensity": current_intensity,
            "logs": [f"Dirty grid ({current_intensity}g > P30 {p30}g) - Pausing execution."]
        }
        
    return {
        "is_paused": False, 
        "p30_threshold": p30,
        "current_intensity": current_intensity,
        "logs": [f"Green grid ({current_intensity}g <= P30 {p30}g) - Proceeding."]
    }

async def execution_node(state: AgentState) -> Dict[str, Any]:
    """Runs the AI workload and tracks emissions."""
    if state["is_paused"]:
        return {} # Should not be hit if graph logic is correct

    # Simulate AI workload
    # In a real scenario, this would call another LLM or processing function
    llm = get_llm()
    input_text = state["input_data"].get("prompt", "Hello")
    
    # Wrap in CodeCarbon (Simulation mode)
    # For now we'll just mock the emissions value
    response = await llm.ainvoke([HumanMessage(content=input_text)])
    
    return {
        "output": response.content,
        "logs": ["Workload executed successfully."],
        "emissions_saved": 5.2 # Mocked gCO2 saved vs baseline
    }

async def monitor_node(state: AgentState) -> Dict[str, Any]:
    """Finalizes logs and results."""
    return {
        "logs": ["Task finalized and scheduled for reporting."]
    }
