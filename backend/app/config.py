import os
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    tool_name: str = "murf-tts"
    
    # LLM Proxy
    llm_proxy_url: str = "https://llm-proxy.densematrix.ai/v1"
    llm_proxy_key: str = ""
    
    # OpenAI fallback
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    
    # Database
    database_url: str = "sqlite+aiosqlite:///./app.db"
    
    # Creem Payment
    creem_api_key: str = ""
    creem_webhook_secret: str = ""
    creem_product_ids: str = "{}"
    
    # Free tier
    free_generations_per_day: int = 5
    
    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
