import asyncio
from arq import create_pool
from arq.connections import RedisSettings
from sqlmodel import Session, select
from app.db.service import engine, DBService
from app.db.models import Task, TaskStatus
from app.core.carbon_service import CarbonService, UKCarbonProvider
from app.agents.graph import app_graph
from app.core.config import settings
from datetime import datetime

carbon_service = CarbonService(UKCarbonProvider())

async def check_grid_and_resume(ctx):
    """
    Background job to check grid status and resume paused tasks.
    Runs periodically (e.g., every 5 minutes).
    """
    print("Worker: Checking grid and processing paused tasks...")
    
    current_intensity = await carbon_service.provider.get_current_intensity()
    p30 = await carbon_service.provider.get_p30_threshold()
    
    with Session(engine) as session:
        db = DBService(session)
        statement = select(Task).where(Task.status == TaskStatus.PAUSED)
        paused_tasks = session.exec(statement).all()
        
        for task in paused_tasks:
            # Deadline Safety Check
            is_overdue = datetime.utcnow() >= task.deadline
            
            # Carbon Check
            is_green = current_intensity <= p30
            
            if is_green or is_overdue:
                reason = "Grid is Clean" if is_green else "Deadline reached"
                print(f"Resuming Task {task.id}: {reason}")
                
                # Update DB
                task.status = TaskStatus.RUNNING
                session.add(task)
                session.commit()
                
                # Resume LangGraph thread
                config = {"configurable": {"thread_id": task.request_id}}
                # We resume by calling invoke again with the same thread_id
                # In LangGraph, if it's interrupted, it resumes from where it left off
                await app_graph.ainvoke(None, config=config)
                
                db.log_event(task.id, "RESUMED", current_intensity, message=reason)

async def startup(ctx):
    ctx['redis'] = await create_pool(RedisSettings(host='redis', port=6379))

class WorkerSettings:
    functions = [check_grid_and_resume]
    on_startup = startup
    cron_jobs = [
        # Check every 1 minute for research responsiveness
        dict(coroutine=check_grid_and_resume, minute={0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59})
    ]
    redis_settings = RedisSettings(host='localhost', port=6379) # Default for local dev, overridden by CLI
