import abc
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import httpx
import numpy as np
from pydantic import BaseModel

class CarbonIntensityData(BaseModel):
    intensity: float
    timestamp: datetime
    forecast: bool = False

class BaseCarbonProvider(abc.ABC):
    @abc.abstractmethod
    async def get_current_intensity(self) -> float:
        pass

    @abc.abstractmethod
    async def get_forecast(self, hours: int = 48) -> List[CarbonIntensityData]:
        pass

    @abc.abstractmethod
    async def get_p30_threshold(self) -> float:
        pass

class UKCarbonProvider(BaseCarbonProvider):
    BASE_URL = "https://api.carbonintensity.org.uk"

    def __init__(self):
        self._cache_p30: Optional[float] = None
        self._cache_expiry: Optional[datetime] = None

    async def get_current_intensity(self) -> float:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.BASE_URL}/intensity")
                data = response.json()
                if "data" in data and len(data["data"]) > 0:
                    intensity_data = data["data"][0]["intensity"]
                    return float(intensity_data.get("actual") or intensity_data.get("forecast") or 100.0)
                return 100.0
        except Exception as e:
            print(f"Carbon API Error (current): {e}")
            return 100.0 # Default fallback

    async def get_forecast(self, hours: int = 48) -> List[CarbonIntensityData]:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Use a simpler relative endpoint for 24h forecast
                response = await client.get(f"{self.BASE_URL}/intensity/1/48")
                data = response.json()
                
                forecast_data = []
                if "data" in data:
                    for item in data["data"]:
                        forecast_data.append(CarbonIntensityData(
                            intensity=float(item["intensity"]["forecast"]),
                            timestamp=datetime.fromisoformat(item["from"].replace("Z", "")),
                            forecast=True
                        ))
                return forecast_data
        except Exception as e:
            print(f"Carbon API Error (forecast): {e}")
            return []

    async def get_p30_threshold(self) -> float:
        if self._cache_p30 and self._cache_expiry and datetime.utcnow() < self._cache_expiry:
            return self._cache_p30

        forecast = await self.get_forecast()
        if not forecast:
            return 100.0 # Fallback
            
        intensities = [f.intensity for f in forecast]
        p30 = float(np.percentile(intensities, 30))
        
        self._cache_p30 = p30
        self._cache_expiry = datetime.utcnow() + timedelta(minutes=30)
        return p30

class CarbonService:
    def __init__(self, provider: BaseCarbonProvider):
        self.provider = provider

    async def should_execute(self, priority: str, current_intensity: Optional[float] = None) -> (bool, float):
        """
        Returns (should_run, p30_value)
        """
        p30 = await self.provider.get_p30_threshold()
        
        if priority == "urgent":
            return True, p30
            
        if current_intensity is None:
            current_intensity = await self.provider.get_current_intensity()
            
        return current_intensity <= p30, p30
