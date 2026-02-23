import json
import hmac
import hashlib
from fastapi import APIRouter, HTTPException, Request, Header
from pydantic import BaseModel
import httpx

from app.config import settings
from app.services.token_service import TokenService

router = APIRouter()

class CheckoutRequest(BaseModel):
    product_id: str
    device_id: str
    success_url: str
    cancel_url: str | None = None

class CheckoutResponse(BaseModel):
    checkout_url: str

@router.post("/checkout")
async def create_checkout(request: CheckoutRequest) -> CheckoutResponse:
    """Create a Creem checkout session."""
    
    if not settings.creem_api_key:
        raise HTTPException(status_code=500, detail="Payment not configured")
    
    # Parse product IDs
    try:
        product_ids = json.loads(settings.creem_product_ids)
    except:
        product_ids = {}
    
    creem_product_id = product_ids.get(request.product_id)
    if not creem_product_id:
        raise HTTPException(status_code=400, detail=f"Invalid product: {request.product_id}")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.creem.io/v1/checkouts",
            headers={
                "Authorization": f"Bearer {settings.creem_api_key}",
                "Content-Type": "application/json"
            },
            json={
                "product_id": creem_product_id,
                "success_url": request.success_url,
                "cancel_url": request.cancel_url or request.success_url,
                "metadata": {
                    "device_id": request.device_id,
                    "tool": settings.tool_name
                }
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to create checkout")
        
        data = response.json()
        return CheckoutResponse(checkout_url=data.get("checkout_url", ""))

@router.post("/webhook")
async def handle_webhook(
    request: Request,
    x_creem_signature: str = Header(None, alias="X-Creem-Signature")
):
    """Handle Creem webhook for payment completion."""
    
    body = await request.body()
    
    # Verify signature
    if settings.creem_webhook_secret and x_creem_signature:
        expected = hmac.new(
            settings.creem_webhook_secret.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(expected, x_creem_signature):
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    data = await request.json()
    event_type = data.get("type")
    
    if event_type == "checkout.completed":
        checkout = data.get("data", {})
        metadata = checkout.get("metadata", {})
        device_id = metadata.get("device_id")
        product_id = checkout.get("product_id")
        
        if device_id:
            # Map product to tokens
            tokens_map = {
                "starter": 50,
                "pro": 150,
                "unlimited": 9999
            }
            
            # Find product tier from product_ids
            product_ids = json.loads(settings.creem_product_ids) if settings.creem_product_ids else {}
            tier = None
            for k, v in product_ids.items():
                if v == product_id:
                    tier = k
                    break
            
            tokens = tokens_map.get(tier, 50)
            
            # Add tokens
            token_service = TokenService()
            await token_service.add_tokens(device_id, tokens)
    
    return {"status": "ok"}
