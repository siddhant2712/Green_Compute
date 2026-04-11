import json
from datetime import datetime
from typing import Dict, Any
from app.agents.state import AgentState
from app.core.carbon_service import CarbonService
from app.core.registry import registry
from app.core.llm import get_llm
from langchain_core.messages import HumanMessage, SystemMessage

# Initialize carbon service with centralized Registry
carbon_service = CarbonService(registry)

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
    """Optimizes task placement across global regions, respecting any user-specified region override."""
    if state["is_urgent"]:
        return {
            "is_paused": False, 
            "assigned_region": "UK",
            "routing_logic": "Urgent - bypassed optimization, dispatched to local UK node.",
            "logs": ["Urgent task - Immediate dispatch to local UK node."]
        }

    # Check if user has pinned a specific region
    input_data = state.get("input_data", {})
    if isinstance(input_data, str):
        import json as _json
        try:
            input_data = _json.loads(input_data)
        except Exception:
            input_data = {}

    preferred_region = input_data.get("preferred_region")
    all_intensities = await registry.get_all_intensities()

    if preferred_region and preferred_region in registry.providers:
        # User manually selected a region — honor it, still check if it's green
        chosen_region = preferred_region
        routing_logic = f"Manual Override: User pinned task to {chosen_region} node."
    else:
        # Auto-optimize across all regions
        optimization = await registry.get_best_region()
        chosen_region = optimization["best_region"]
        routing_logic = f"AI Optimized: Chose {chosen_region} ({all_intensities.get(chosen_region, 0):.0f}g) vs UK ({all_intensities.get('UK', 0):.0f}g)."

    should_run, p30 = await carbon_service.should_execute(state["priority"], chosen_region)
    current_intensity = all_intensities.get(chosen_region, 150.0)
    
    if not should_run:
        return {
            "is_paused": True, 
            "assigned_region": chosen_region,
            "p30_threshold": p30,
            "current_intensity": current_intensity,
            "routing_logic": routing_logic,
            "logs": [f"{routing_logic} Grid dirty ({current_intensity:.0f}g > P30 {p30:.0f}g). Pausing."]
        }
        
    return {
        "is_paused": False, 
        "assigned_region": chosen_region,
        "p30_threshold": p30,
        "current_intensity": current_intensity,
        "routing_logic": routing_logic,
        "logs": [routing_logic, f"Grid is green ({current_intensity:.0f}g \u2264 P30 {p30:.0f}g). Executing."]
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
