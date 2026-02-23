from datetime import date
from typing import Dict, Any

from app.config import settings

# In-memory storage (replace with DB in production)
_device_tokens: Dict[str, Dict[str, Any]] = {}

class TokenService:
    def __init__(self):
        self.free_limit = settings.free_generations_per_day
    
    def _get_device_data(self, device_id: str) -> Dict[str, Any]:
        today = str(date.today())
        
        if device_id not in _device_tokens:
            _device_tokens[device_id] = {
                "purchased_tokens": 0,
                "daily_used": {},
                "is_premium": False
            }
        
        data = _device_tokens[device_id]
        
        # Reset daily counter if new day
        if today not in data["daily_used"]:
            data["daily_used"] = {today: 0}
        
        return data
    
    async def can_generate(self, device_id: str) -> bool:
        data = self._get_device_data(device_id)
        today = str(date.today())
        
        # Check purchased tokens first
        if data["purchased_tokens"] > 0:
            return True
        
        # Check daily free limit
        daily_used = data["daily_used"].get(today, 0)
        return daily_used < self.free_limit
    
    async def use_generation(self, device_id: str) -> bool:
        data = self._get_device_data(device_id)
        today = str(date.today())
        
        # Use purchased tokens first
        if data["purchased_tokens"] > 0:
            data["purchased_tokens"] -= 1
            return True
        
        # Use daily free
        daily_used = data["daily_used"].get(today, 0)
        if daily_used < self.free_limit:
            data["daily_used"][today] = daily_used + 1
            return True
        
        return False
    
    async def add_tokens(self, device_id: str, amount: int):
        data = self._get_device_data(device_id)
        data["purchased_tokens"] += amount
        data["is_premium"] = True
    
    async def get_status(self, device_id: str) -> Dict[str, Any]:
        data = self._get_device_data(device_id)
        today = str(date.today())
        daily_used = data["daily_used"].get(today, 0)
        
        tokens_remaining = data["purchased_tokens"]
        if tokens_remaining == 0:
            tokens_remaining = max(0, self.free_limit - daily_used)
        
        return {
            "device_id": device_id,
            "tokens_remaining": tokens_remaining,
            "is_premium": data["is_premium"],
            "daily_free_used": daily_used,
            "daily_free_limit": self.free_limit
        }
