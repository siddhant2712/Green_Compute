import asyncio
import httpx
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"

async def run_benchmark():
    async with httpx.AsyncClient() as client:
        print("=== Green-Compute Benchmarking System ===")
        
        # 1. Baseline: Urgent Tasks (Immediate Execution)
        print("\n[SCENARIO A] Running 5 Baseline Tasks (Immediate)...")
        baseline_results = []
        for i in range(5):
            response = await client.post(f"{BASE_URL}/tasks", json={
                "priority": "urgent",
                "payload": {"prompt": f"Baseline task {i}"}
            })
            baseline_results.append(response.json())
            
        # 2. Optimized: Deferrable Tasks (P30 Scheduling)
        print("\n[SCENARIO B] Running 5 Optimized Tasks (Adaptive Threshold)...")
        optimized_results = []
        for i in range(5):
            response = await client.post(f"{BASE_URL}/tasks", json={
                "priority": "deferrable",
                "payload": {"prompt": f"Optimized task {i}"}
            })
            optimized_results.append(response.json())

        # 3. Analyze Results
        total_baseline = sum([r['baseline_emissions'] for r in baseline_results])
        total_optimized = sum([r['baseline_emissions'] - r['emissions_saved'] for r in optimized_results])
        total_saved = sum([r['emissions_saved'] for r in optimized_results])
        
        print("\n" + "="*40)
        print("BENCHMARK RESULTS")
        print("="*40)
        print(f"Total Tasks: 10")
        print(f"Baseline Emissions (A): {total_baseline:.2f} gCO2")
        print(f"Optimized Emissions (B): {total_optimized:.2f} gCO2")
        print(f"Total Carbon Saved: {total_saved:.2f} gCO2")
        print(f"Carbon Reduction Efficiency: {(total_saved/total_baseline)*100:.1f}%")
        print("="*40)

if __name__ == "__main__":
    asyncio.run(run_benchmark())
