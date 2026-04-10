from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Green-Compute"
    DATABASE_URL: str = "sqlite:///./greencompute.db"
    REDIS_URL: str = "redis://localhost:6379"
    GOOGLE_API_KEY: str = ""
    SECRET_KEY: str = "supersecretkey"
    
    # Grid Simulation
    SIMULATE_GRID: bool = True
    MOCK_INTENSITY: float = 120.0
    
    # Run worker inside FastAPI (Local Mode)
    INTERNAL_WORKER: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
