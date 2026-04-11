import uuid
from fastapi import FastAPI, Depends, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from app.db.service import get_session, DBService, engine
from app.db.models import Task, TaskStatus, PriorityLevel
from app.schemas.task import TaskCreate, TaskResponse, CarbonStatus
from app.core.carbon_service import CarbonService, GlobalCarbonRegistry
from app.agents.graph import app_graph
from app.utils.security import verify_signature, generate_signature
from app.utils.reporting import generate_certificate
from app.core.config import settings
from datetime import datetime
import asyncio
from sqlmodel import SQLModel

app = FastAPI(title="Green-Compute API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.core.registry import registry
carbon_service = CarbonService(registry)

async def internal_worker_loop(registry: GlobalCarbonRegistry):
    """Simple background loop that replaces Arq/Redis for local development."""
    while True:
        try:
            print("Internal Worker: Checking and resuming tasks globally...")
            # Fetch all intensities
            intensities = await registry.get_all_intensities()
            
            with Session(engine) as session:
                db = DBService(session)
                statement = select(Task).where(Task.status == TaskStatus.PAUSED)
                paused_tasks = session.exec(statement).all()
                
                for task in paused_tasks:
                    # Check the region this task was assigned to
                    region = task.assigned_region or "UK"
                    provider = registry.providers.get(region)
                    p30 = await provider.get_p30_threshold()
                    current_intensity = intensities.get(region, 200.0)
                    
                    is_overdue = datetime.utcnow() >= task.deadline
                    is_green = current_intensity <= p30
                    
                    if is_green or is_overdue:
                        task.status = TaskStatus.RUNNING
                        session.add(task)
                        session.commit()
                        
                        config = {"configurable": {"thread_id": task.request_id}}
                        await app_graph.ainvoke(None, config=config)
                        db.log_event(task.id, "RESUMED", current_intensity, region=region, message=f"Resumed globally at region: {region}")
            
            await asyncio.sleep(60) # Chick every 1 minute
        except Exception as e:
            print(f"Worker Error: {e}")
            await asyncio.sleep(10)

@app.on_event("startup")
async def on_startup():
    # Initialize DB tables
    SQLModel.metadata.create_all(engine)
    
    # Start internal worker if enabled
    if settings.INTERNAL_WORKER:
        from app.core.registry import registry
        asyncio.create_task(internal_worker_loop(registry))

@app.get("/carbon")
async def get_carbon_status(region: str = Query(default="UK", description="Region code: UK | IN | DE | US")):
    from app.core.registry import registry

    # Validate region
    valid_regions = list(registry.providers.keys())
    if region not in valid_regions:
        raise HTTPException(status_code=400, detail=f"Invalid region '{region}'. Must be one of: {valid_regions}")

    optimization = await registry.get_best_region()
    current = optimization["intensities"][region]
    p30 = await registry.providers[region].get_p30_threshold()

    return {
        "current": current,
        "p30_threshold": p30,
        "is_green": current <= p30,
        "region": region,
        "global_optimization": optimization,
        "forecast_summary": f"Optimal Global Region: {optimization['best_region']} | Viewing: {region}"
    }

import json

@app.post("/tasks", response_model=TaskResponse)
async def submit_task(request: TaskCreate, session: Session = Depends(get_session)):
    db = DBService(session)
    request_id = str(uuid.uuid4())
    
    # Get initial metrics (UK as default baseline)
    uk_provider = carbon_service.registry.providers["UK"]
    current_intensity = await uk_provider.get_current_intensity()
    p30 = await uk_provider.get_p30_threshold()
    
    # Create Task 
    # SQLite requires dict payload to be dumped to a string since JSON schema column type is being mocked
    task_payload_str = json.dumps(request.payload) if isinstance(request.payload, dict) else str(request.payload)

    task = Task(
        request_id=request_id,
        priority=request.priority,
        input_data=task_payload_str,
        status=TaskStatus.QUEUED,
        p30_threshold=p30,
        baseline_emissions=15.0, # Simulated baseline
        signature=generate_signature(request_id)
    )
    db.create_task(task)
    db.log_event(task.id, "SUBMITTED", current_intensity, message="Task queued for processing")
    
    # Launch LangGraph Workflow
    config = {"configurable": {"thread_id": request_id}}
    state_input = {
        "task_id": task.id,
        "request_id": request_id,
        "priority": request.priority,
        "input_data": request.payload,
        "is_urgent": request.priority == "urgent",
        "logs": []
    }
    
    # Execute graph (this might pause at scheduler or shift region)
    final_state = await app_graph.ainvoke(state_input, config=config)
    
    # Update task based on final state
    updated_task = db.get_task(request_id)
    updated_task.assigned_region = final_state.get("assigned_region", "UK")
    updated_task.routing_logic = final_state.get("routing_logic")
    updated_task.regional_intensities_snapshot = json.dumps(final_state.get("regional_intensities", {}))

    if final_state.get("is_paused"):
        updated_task.status = TaskStatus.PAUSED
    elif final_state.get("output"):
        updated_task.status = TaskStatus.COMPLETED
        updated_task.result = json.dumps({"output": final_state["output"]})
        updated_task.completed_at = datetime.utcnow()
        updated_task.execution_region = updated_task.assigned_region
        updated_task.carbon_saved = final_state.get("emissions_saved", 0)
        updated_task.actual_emissions = updated_task.baseline_emissions - updated_task.carbon_saved
    
    session.add(updated_task)
    session.commit()
    session.refresh(updated_task)
    
    # Manually build the response to map ORM field names to the API schema
    return {
        "request_id": updated_task.request_id,
        "status": updated_task.status.value,
        "priority": updated_task.priority.value,
        "current_intensity": current_intensity,
        "p30_threshold": updated_task.p30_threshold,
        "assigned_region": updated_task.assigned_region,
        "input_data": updated_task.input_data,
        "emissions_saved": updated_task.carbon_saved,
        "created_at": updated_task.created_at,
    }

@app.get("/tasks/{request_id}", response_model=TaskResponse)
async def get_task_status(request_id: str, session: Session = Depends(get_session)):
    db = DBService(session)
    task = db.get_task(request_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return {
        "request_id": task.request_id,
        "status": task.status.value,
        "priority": task.priority.value,
        "current_intensity": None,
        "p30_threshold": task.p30_threshold,
        "input_data": task.input_data,
        "emissions_saved": task.carbon_saved,
        "created_at": task.created_at,
    }

@app.get("/tasks", response_model=list[TaskResponse])
async def list_tasks(session: Session = Depends(get_session)):
    """Returns all tasks ordered by most recently created, for frontend state restore on reload."""
    statement = select(Task).order_by(Task.created_at.desc())
    tasks = session.exec(statement).all()
    return [
        {
            "request_id": t.request_id,
            "status": t.status.value,
            "priority": t.priority.value,
            "current_intensity": None,
            "p30_threshold": t.p30_threshold,
            "input_data": t.input_data,
            "emissions_saved": t.carbon_saved,
            "created_at": t.created_at,
        }
        for t in tasks
    ]


@app.get("/verify/{request_id}")
async def verify_task(request_id: str, sig: str, session: Session = Depends(get_session)):
    if not verify_signature(request_id, sig):
        raise HTTPException(status_code=403, detail="Invalid signature")
    
    db = DBService(session)
    task = db.get_task(request_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    return {
        "status": "Verified",
        "task_id": task.request_id,
        "carbon_saved": f"{task.carbon_saved} g",
        "executed_at": task.completed_at,
        "authenticity": "High (Signed by Green-Compute Core)"
    }

@app.get("/certificate/{request_id}")
async def get_pdf_certificate(request_id: str, session: Session = Depends(get_session)):
    db = DBService(session)
    task = db.get_task(request_id)
    if not task or task.status != TaskStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Certificate only available for completed tasks")
    
    task_data = {
        "request_id": task.request_id,
        "status": task.status.value,
        "priority": task.priority.value,
        "intensity_at_execution": task.p30_threshold,   # best proxy available
        "baseline_emissions": task.baseline_emissions,
        "actual_emissions": task.actual_emissions,
        "carbon_saved": task.carbon_saved,
        "signature": task.signature,
    }
    
    pdf_content = generate_certificate(task_data)
    return Response(content=pdf_content, media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename=ESG_Certificate_{request_id}.pdf"
    })
