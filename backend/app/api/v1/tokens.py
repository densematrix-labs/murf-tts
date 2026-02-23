from fastapi import APIRouter, Header
from pydantic import BaseModel

from app.services.token_service import TokenService

router = APIRouter()

class TokenStatus(BaseModel):
    device_id: str
    tokens_remaining: int
    is_premium: bool
    daily_free_used: int
    daily_free_limit: int

@router.get("/status")
async def get_token_status(
    x_device_id: str = Header(..., alias="X-Device-Id")
) -> TokenStatus:
    """Get token status for a device."""
    token_service = TokenService()
    status = await token_service.get_status(x_device_id)
    return TokenStatus(**status)
