import os
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from openai import OpenAI
from prometheus_client import Counter

from app.config import settings
from app.services.token_service import TokenService

router = APIRouter()

tts_generations = Counter(
    "tts_generations_total",
    "TTS generations",
    ["tool", "voice"]
)

# Voice configurations mapped to OpenAI voices
VOICES = {
    "james": {"openai_voice": "onyx", "name": "James", "gender": "male", "accent": "American"},
    "emily": {"openai_voice": "nova", "name": "Emily", "gender": "female", "accent": "American"},
    "oliver": {"openai_voice": "echo", "name": "Oliver", "gender": "male", "accent": "British"},
    "sophia": {"openai_voice": "shimmer", "name": "Sophia", "gender": "female", "accent": "British"},
    "chloe": {"openai_voice": "nova", "name": "Chloe", "gender": "female", "accent": "Australian"},
    "xiaoxue": {"openai_voice": "nova", "name": "小雪", "gender": "female", "accent": "Mandarin"},
    "yunyang": {"openai_voice": "onyx", "name": "云扬", "gender": "male", "accent": "Mandarin"},
    "misaki": {"openai_voice": "shimmer", "name": "美咲", "gender": "female", "accent": "Japanese"},
    "anna": {"openai_voice": "shimmer", "name": "Anna", "gender": "female", "accent": "German"},
    "marie": {"openai_voice": "nova", "name": "Marie", "gender": "female", "accent": "French"},
    "jihyun": {"openai_voice": "nova", "name": "지현", "gender": "female", "accent": "Korean"},
    "carmen": {"openai_voice": "shimmer", "name": "Carmen", "gender": "female", "accent": "Spanish"},
}

class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    voice: str = Field(default="emily")
    speed: float = Field(default=1.0, ge=0.5, le=2.0)
    format: str = Field(default="mp3")

class VoiceInfo(BaseModel):
    id: str
    name: str
    gender: str
    accent: str

@router.get("/voices")
async def list_voices():
    """List all available voices."""
    return [
        VoiceInfo(id=vid, name=v["name"], gender=v["gender"], accent=v["accent"])
        for vid, v in VOICES.items()
    ]

@router.post("/generate")
async def generate_speech(
    request: TTSRequest,
    x_device_id: str = Header(..., alias="X-Device-Id")
):
    """Generate speech from text using TTS API."""
    
    # Validate voice
    if request.voice not in VOICES:
        raise HTTPException(status_code=400, detail=f"Invalid voice. Available: {list(VOICES.keys())}")
    
    # Check token availability
    token_service = TokenService()
    if not await token_service.can_generate(x_device_id):
        raise HTTPException(
            status_code=402,
            detail={"error": "No generations remaining. Please purchase more tokens.", "code": "payment_required"}
        )
    
    # Get OpenAI voice mapping
    voice_config = VOICES[request.voice]
    openai_voice = voice_config["openai_voice"]
    
    # Initialize OpenAI client
    api_key = settings.llm_proxy_key or settings.openai_api_key
    base_url = settings.llm_proxy_url if settings.llm_proxy_key else settings.openai_base_url
    
    if not api_key:
        raise HTTPException(status_code=500, detail="TTS service not configured")
    
    client = OpenAI(api_key=api_key, base_url=base_url)
    
    try:
        # Generate speech
        response = client.audio.speech.create(
            model="tts-1",
            voice=openai_voice,
            input=request.text,
            speed=request.speed,
            response_format=request.format
        )
        
        # Consume token
        await token_service.use_generation(x_device_id)
        
        # Track metric
        tts_generations.labels(tool=settings.tool_name, voice=request.voice).inc()
        
        # Return audio stream
        content_type = "audio/mpeg" if request.format == "mp3" else "audio/wav"
        return StreamingResponse(
            iter([response.content]),
            media_type=content_type,
            headers={"Content-Disposition": f"attachment; filename=murf-tts-audio.{request.format}"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate speech: {str(e)}")
