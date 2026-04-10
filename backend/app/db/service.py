from typing import Optional
from sqlmodel import Session, create_engine, select
from app.db.models import Task, TaskEvent, CarbonHistory
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

def get_session():
    with Session(engine) as session:
        yield session

class DBService:
    def __init__(self, session: Session):
        self.session = session

    def create_task(self, task: Task) -> Task:
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task

    def get_task(self, request_id: str) -> Optional[Task]:
        statement = select(Task).where(Task.request_id == request_id)
        return self.session.exec(statement).first()

    def update_task_status(self, task_id: int, status: str):
        task = self.session.get(Task, task_id)
        if task:
            task.status = status
            self.session.add(task)
            self.session.commit()

    def log_event(self, task_id: int, event_type: str, intensity: float, message: str = None):
        event = TaskEvent(task_id=task_id, event_type=event_type, intensity=intensity, message=message)
        self.session.add(event)
        self.session.commit()
