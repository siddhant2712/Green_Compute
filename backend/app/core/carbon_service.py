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
    FALLBACK_INTENSITY = 150.0
    FALLBACK_P30 = 120.0

    def __init__(self):
        self._cache_p30: Optional[float] = None
        self._cache_expiry: Optional[datetime] = None

    async def get_current_intensity(self) -> float:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.BASE_URL}/intensity")
                data = response.json()
                if "data" in data and len(data["data"]) > 0:
                    intensity_data = data["data"][0]["intensity"]
                    return float(intensity_data.get("actual") or intensity_data.get("forecast") or self.FALLBACK_INTENSITY)
                return self.FALLBACK_INTENSITY
        except Exception as e:
            print(f"UK Carbon API offline, using fallback: {e}")
            return self.FALLBACK_INTENSITY

    async def get_forecast(self, hours: int = 48) -> List[CarbonIntensityData]:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
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
            print(f"UK Forecast API offline, using fallback: {e}")
            return []

    async def get_p30_threshold(self) -> float:
        # Return cached value if still valid
        if self._cache_p30 and self._cache_expiry and datetime.utcnow() < self._cache_expiry:
            return self._cache_p30

        forecast = await self.get_forecast()
        if not forecast:
            # Use cached value if we have one, else fallback
            return self._cache_p30 if self._cache_p30 else self.FALLBACK_P30
            
        intensities = [f.intensity for f in forecast]
        p30 = float(np.percentile(intensities, 30))
        
        self._cache_p30 = p30
        self._cache_expiry = datetime.utcnow() + timedelta(minutes=30)
        return p30

class SimulatedRegionalProvider(BaseCarbonProvider):
    """
    Simulates regional intensity using a sine wave based on time-of-day.
    Base Intensity + Variation * sin(2*pi * (hour + offset) / 24)
    """
    def __init__(self, name: str, base: float, variation: float, hour_offset: int):
        self.name = name
        self.base = base
        self.variation = variation
        self.hour_offset = hour_offset

    async def get_current_intensity(self) -> float:
        hour = datetime.utcnow().hour
        # Simple cyclic model: peak at certain times, low at others
        val = self.base + self.variation * np.sin(2 * np.pi * (hour + self.hour_offset) / 24)
        return float(max(10, val))

    async def get_forecast(self, hours: int = 48) -> List[CarbonIntensityData]:
        # Generate a simulated forecast
        forecast = []
        now = datetime.utcnow()
        for i in range(hours):
            ts = now + timedelta(hours=i)
            hour = ts.hour
            val = self.base + self.variation * np.sin(2 * np.pi * (hour + self.hour_offset) / 24)
            forecast.append(CarbonIntensityData(intensity=float(max(10, val)), timestamp=ts, forecast=True))
        return forecast

    async def get_p30_threshold(self) -> float:
        forecast = await self.get_forecast()
        intensities = [f.intensity for f in forecast]
        return float(np.percentile(intensities, 30))

class GlobalCarbonRegistry:
    def __init__(self):
        self.providers = {
            "UK": UKCarbonProvider(),
            "IN": SimulatedRegionalProvider("India", base=450, variation=150, hour_offset=5), # High base, solar dependent
            "DE": SimulatedRegionalProvider("Germany", base=250, variation=100, hour_offset=1), # Mixed renewables
            "US": SimulatedRegionalProvider("USA-West", base=200, variation=80, hour_offset=-8) # Low base, high hydro/solar
        }
        # Latency penalties in ms equivalent carbon (Simulated)
        self.latency_penalties = {
            "UK": 0,
            "IN": 40,
            "DE": 15,
            "US": 60
        }

    async def get_all_intensities(self) -> Dict[str, float]:
        res = {}
        for region, provider in self.providers.items():
            res[region] = await provider.get_current_intensity()
        return res

    async def get_best_region(self) -> Dict[str, Any]:
        """
        Calculates the best region based on Carbon + Latency Penalty
        """
        intensities = await self.get_all_intensities()
        scores = {}
        for region, intensity in intensities.items():
            scores[region] = intensity + self.latency_penalties.get(region, 0)
        
        best_region = min(scores, key=scores.get)
        return {
            "best_region": best_region,
            "intensities": intensities,
            "scores": scores,
            "is_uk_best": best_region == "UK"
        }

class CarbonService:
    def __init__(self, registry: GlobalCarbonRegistry):
        self.registry = registry

    async def should_execute(self, priority: str, region: str = "UK") -> (bool, float):
        provider = self.registry.providers.get(region, self.registry.providers["UK"])
        p30 = await provider.get_p30_threshold()
        
        if priority == "urgent":
            return True, p30
            
        current_intensity = await provider.get_current_intensity()
        return current_intensity <= p30, p30
