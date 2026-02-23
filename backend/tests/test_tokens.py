import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.token_service import TokenService, _device_tokens

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture(autouse=True)
def clear_tokens():
    """Clear token storage before each test."""
    _device_tokens.clear()
    yield
    _device_tokens.clear()

def test_get_token_status_new_device(client):
    """Test token status for new device."""
    response = client.get(
        "/api/v1/tokens/status",
        headers={"X-Device-Id": "new-device-001"}
    )
    assert response.status_code == 200
    data = response.json()
    
    assert data["device_id"] == "new-device-001"
    assert data["tokens_remaining"] == 5  # Free daily limit
    assert data["is_premium"] is False
    assert data["daily_free_used"] == 0
    assert data["daily_free_limit"] == 5

def test_get_token_status_missing_header(client):
    """Test token status without device ID."""
    response = client.get("/api/v1/tokens/status")
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_token_service_can_generate():
    """Test can_generate for new device."""
    service = TokenService()
    can = await service.can_generate("test-device-001")
    assert can is True

@pytest.mark.asyncio
async def test_token_service_use_generation():
    """Test using a generation."""
    service = TokenService()
    device_id = "test-device-002"
    
    # Should be able to use
    used = await service.use_generation(device_id)
    assert used is True
    
    # Check status
    status = await service.get_status(device_id)
    assert status["daily_free_used"] == 1
    assert status["tokens_remaining"] == 4

@pytest.mark.asyncio
async def test_token_service_exhaust_free():
    """Test exhausting free daily limit."""
    service = TokenService()
    device_id = "test-device-003"
    
    # Use all free generations
    for _ in range(5):
        used = await service.use_generation(device_id)
        assert used is True
    
    # Should not be able to generate anymore
    can = await service.can_generate(device_id)
    assert can is False
    
    # Try to use should fail
    used = await service.use_generation(device_id)
    assert used is False

@pytest.mark.asyncio
async def test_token_service_add_tokens():
    """Test adding purchased tokens."""
    service = TokenService()
    device_id = "test-device-004"
    
    await service.add_tokens(device_id, 50)
    
    status = await service.get_status(device_id)
    assert status["tokens_remaining"] == 50
    assert status["is_premium"] is True

@pytest.mark.asyncio
async def test_token_service_premium_uses_purchased():
    """Test that premium users use purchased tokens first."""
    service = TokenService()
    device_id = "test-device-005"
    
    # Add purchased tokens
    await service.add_tokens(device_id, 10)
    
    # Use a generation
    used = await service.use_generation(device_id)
    assert used is True
    
    # Check that purchased tokens decreased
    status = await service.get_status(device_id)
    assert status["tokens_remaining"] == 9
    assert status["daily_free_used"] == 0  # Free not touched
