import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

from app.api.v1 import tts, tokens, payment

TOOL_NAME = os.getenv("TOOL_NAME", "murf-tts")

# Prometheus metrics
http_requests = Counter(
    "http_requests_total",
    "HTTP requests",
    ["tool", "endpoint", "method", "status"]
)
http_duration = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration",
    ["tool", "endpoint"]
)
tts_generations = Counter(
    "tts_generations_total",
    "TTS generations",
    ["tool", "voice"]
)
page_views = Counter(
    "page_views_total",
    "Page views",
    ["tool", "page"]
)

BOT_PATTERNS = ["Googlebot", "bingbot", "Baiduspider", "YandexBot", "DuckDuckBot"]
crawler_visits = Counter(
    "crawler_visits_total",
    "Crawler visits",
    ["tool", "bot"]
)

app = FastAPI(
    title="Murf TTS API",
    description="Professional AI Voice Generator - Murf.ai Alternative",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request tracking middleware
@app.middleware("http")
async def track_requests(request: Request, call_next):
    import time
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    
    endpoint = request.url.path
    http_requests.labels(
        tool=TOOL_NAME,
        endpoint=endpoint,
        method=request.method,
        status=response.status_code
    ).inc()
    http_duration.labels(tool=TOOL_NAME, endpoint=endpoint).observe(duration)
    
    # Track crawlers
    ua = request.headers.get("user-agent", "")
    for bot in BOT_PATTERNS:
        if bot.lower() in ua.lower():
            crawler_visits.labels(tool=TOOL_NAME, bot=bot).inc()
            break
    
    return response

# Include routers
app.include_router(tts.router, prefix="/api/v1/tts", tags=["TTS"])
app.include_router(tokens.router, prefix="/api/v1/tokens", tags=["Tokens"])
app.include_router(payment.router, prefix="/api/v1/payment", tags=["Payment"])

@app.get("/")
async def root():
    return {"message": "Murf TTS API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
