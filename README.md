# Murf TTS - Free Murf.ai Alternative

Professional AI Voice Generator with studio-quality text-to-speech.

## Features
- 🎙️ Multiple AI voices (male/female, various accents)
- 🌍 Multi-language support
- 🎚️ Voice customization (speed, pitch, tone)
- 📥 Download as MP3/WAV
- 💰 Free tier available

## Tech Stack
- Frontend: React + Vite + TypeScript
- Backend: Python FastAPI
- AI: LLM Proxy TTS APIs

## Development
```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend  
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
```

## Deployment
```bash
docker compose up -d
```

