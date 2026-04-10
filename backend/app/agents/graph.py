from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.nodes import triage_node, scheduler_node, execution_node, monitor_node

def create_graph():
    workflow = StateGraph(AgentState)

    # Add Nodes
    workflow.add_node("triage", triage_node)
    workflow.add_node("scheduler", scheduler_node)
    workflow.add_node("execution", execution_node)
    workflow.add_node("monitor", monitor_node)

    # Set Entry Point
    workflow.set_entry_point("triage")

    # Add Transitions
    workflow.add_edge("triage", "scheduler")
    
    # Conditional edge from scheduler: if paused, go to END (to wait for worker); else go to execution
    def route_after_scheduler(state: AgentState):
        if state["is_paused"]:
            return END
        return "execution"

    workflow.add_conditional_edges(
        "scheduler",
        route_after_scheduler,
        {
            END: END,
            "execution": "execution"
        }
    )

    workflow.add_edge("execution", "monitor")
    workflow.add_edge("monitor", END)

    return workflow.compile()

# Generate the app
app_graph = create_graph()
