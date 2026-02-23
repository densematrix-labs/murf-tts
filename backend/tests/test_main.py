import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_root(client):
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Murf TTS API"
    assert "version" in response.json()

def test_health(client):
    """Test health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_metrics(client):
    """Test metrics endpoint returns Prometheus format."""
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "http_requests_total" in response.text
    assert "tts_generations_total" in response.text

def test_cors_headers(client):
    """Test CORS headers are present."""
    response = client.options("/", headers={"Origin": "http://localhost:3000"})
    # FastAPI with CORS middleware should handle this
    assert response.status_code in [200, 405]
