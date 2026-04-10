import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.messages import AIMessage
from app.core.config import settings
import json

class MockLLM:
    """Provides safe fallback responses for local testing without API keys."""
    async def ainvoke(self, messages):
        prompt = messages[0].content.lower()
        if "classify" in prompt:
            res = {
                "is_urgent": "urgent" in prompt and "defer" not in prompt,
                "can_defer": "defer" in prompt or "urgent" not in prompt,
                "max_delay_hours": 12,
                "reasoning": "Mocked LLM triage decision based on prompt heuristics."
            }
            return AIMessage(content=f"```json\n{json.dumps(res)}\n```")
        return AIMessage(content="Simulated AI workload complete. [Mock Response]")

def get_llm(model_type: str = "gemini"):
    # If no API key is provided, use the MockLLM to prevent app crashes
    if model_type == "gemini" and not settings.GOOGLE_API_KEY:
        print("WARNING: Using MockLLM because GOOGLE_API_KEY is not set.")
        return MockLLM()

    if model_type == "gemini":
        return ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0
        )
    elif model_type == "openai":
        if not os.getenv("OPENAI_API_KEY"):
             print("WARNING: Using MockLLM because OPENAI_API_KEY is not set.")
             return MockLLM()
        return ChatOpenAI(
            model="gpt-4o",
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0
        )
    
    return MockLLM() # Default fallback
