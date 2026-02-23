import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def device_id():
    return "test-device-tts-001"

def test_list_voices(client):
    """Test listing available voices."""
    response = client.get("/api/v1/tts/voices")
    assert response.status_code == 200
    voices = response.json()
    assert len(voices) >= 10
    
    # Check voice structure
    for voice in voices:
        assert "id" in voice
        assert "name" in voice
        assert "gender" in voice
        assert "accent" in voice

def test_generate_missing_device_id(client):
    """Test generation without device ID."""
    response = client.post(
        "/api/v1/tts/generate",
        json={"text": "Hello world", "voice": "emily"}
    )
    assert response.status_code == 422  # Missing header

def test_generate_invalid_voice(client, device_id):
    """Test generation with invalid voice."""
    response = client.post(
        "/api/v1/tts/generate",
        json={"text": "Hello world", "voice": "invalid_voice"},
        headers={"X-Device-Id": device_id}
    )
    assert response.status_code == 400
    assert "Invalid voice" in response.json()["detail"]

def test_generate_empty_text(client, device_id):
    """Test generation with empty text."""
    response = client.post(
        "/api/v1/tts/generate",
        json={"text": "", "voice": "emily"},
        headers={"X-Device-Id": device_id}
    )
    assert response.status_code == 422  # Validation error

def test_generate_text_too_long(client, device_id):
    """Test generation with text exceeding limit."""
    long_text = "a" * 5001
    response = client.post(
        "/api/v1/tts/generate",
        json={"text": long_text, "voice": "emily"},
        headers={"X-Device-Id": device_id}
    )
    assert response.status_code == 422

def test_generate_speed_out_of_range(client, device_id):
    """Test generation with invalid speed."""
    response = client.post(
        "/api/v1/tts/generate",
        json={"text": "Hello", "voice": "emily", "speed": 3.0},
        headers={"X-Device-Id": device_id}
    )
    assert response.status_code == 422

@patch("app.api.v1.tts.OpenAI")
def test_generate_success(mock_openai, client, device_id):
    """Test successful TTS generation."""
    # Mock OpenAI response
    mock_response = MagicMock()
    mock_response.content = b"fake audio content"
    mock_client = MagicMock()
    mock_client.audio.speech.create.return_value = mock_response
    mock_openai.return_value = mock_client
    
    # Patch settings
    with patch("app.api.v1.tts.settings") as mock_settings:
        mock_settings.llm_proxy_key = "test-key"
        mock_settings.llm_proxy_url = "https://test.api"
        mock_settings.tool_name = "murf-tts"
        
        response = client.post(
            "/api/v1/tts/generate",
            json={"text": "Hello world", "voice": "emily", "speed": 1.0},
            headers={"X-Device-Id": device_id}
        )
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/mpeg"
    assert b"fake audio content" in response.content

@patch("app.api.v1.tts.settings")
def test_generate_no_api_key(mock_settings, client, device_id):
    """Test generation when API key not configured."""
    mock_settings.llm_proxy_key = ""
    mock_settings.openai_api_key = ""
    
    response = client.post(
        "/api/v1/tts/generate",
        json={"text": "Hello", "voice": "emily"},
        headers={"X-Device-Id": device_id}
    )
    assert response.status_code == 500
    assert "not configured" in response.json()["detail"]

def test_error_detail_format_string(client, device_id):
    """Test that error details are properly formatted strings."""
    response = client.post(
        "/api/v1/tts/generate",
        json={"text": "Hello", "voice": "invalid"},
        headers={"X-Device-Id": device_id}
    )
    assert response.status_code == 400
    detail = response.json()["detail"]
    assert isinstance(detail, str), f"detail should be string: {detail}"

def test_error_detail_format_payment_required(client):
    """Test 402 error detail format."""
    # Exhaust free tokens first
    exhausted_device = "exhausted-device-001"
    
    with patch("app.api.v1.tts.TokenService") as mock_service:
        mock_instance = MagicMock()
        mock_instance.can_generate.return_value = False
        mock_service.return_value = mock_instance
        
        response = client.post(
            "/api/v1/tts/generate",
            json={"text": "Hello", "voice": "emily"},
            headers={"X-Device-Id": exhausted_device}
        )
    
    assert response.status_code == 402
    detail = response.json()["detail"]
    
    # Detail should be object with error field
    if isinstance(detail, dict):
        assert "error" in detail or "message" in detail, \
            f"Object detail must have 'error' or 'message': {detail}"
    else:
        assert isinstance(detail, str), f"detail must be string or object: {detail}"
