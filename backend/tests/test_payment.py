import pytest
import json
import hmac
import hashlib
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.services.token_service import _device_tokens

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture(autouse=True)
def clear_tokens():
    """Clear token storage before each test."""
    _device_tokens.clear()
    yield
    _device_tokens.clear()

def test_checkout_not_configured(client):
    """Test checkout when payment not configured."""
    with patch("app.api.v1.payment.settings") as mock_settings:
        mock_settings.creem_api_key = ""
        
        response = client.post(
            "/api/v1/payment/checkout",
            json={
                "product_id": "starter",
                "device_id": "test-device",
                "success_url": "https://example.com/success"
            }
        )
    
    assert response.status_code == 500
    assert "not configured" in response.json()["detail"]

def test_checkout_invalid_product(client):
    """Test checkout with invalid product ID."""
    with patch("app.api.v1.payment.settings") as mock_settings:
        mock_settings.creem_api_key = "test-key"
        mock_settings.creem_product_ids = '{"starter": "prod_123"}'
        
        response = client.post(
            "/api/v1/payment/checkout",
            json={
                "product_id": "invalid_product",
                "device_id": "test-device",
                "success_url": "https://example.com/success"
            }
        )
    
    assert response.status_code == 400
    assert "Invalid product" in response.json()["detail"]

@patch("httpx.AsyncClient")
def test_checkout_success(mock_async_client, client):
    """Test successful checkout creation."""
    # Mock httpx response
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"checkout_url": "https://checkout.creem.io/abc123"}
    
    mock_client_instance = MagicMock()
    mock_client_instance.__aenter__.return_value = mock_client_instance
    mock_client_instance.__aexit__.return_value = None
    mock_client_instance.post.return_value = mock_response
    mock_async_client.return_value = mock_client_instance
    
    with patch("app.api.v1.payment.settings") as mock_settings:
        mock_settings.creem_api_key = "test-key"
        mock_settings.creem_product_ids = '{"starter": "prod_123"}'
        mock_settings.tool_name = "murf-tts"
        
        response = client.post(
            "/api/v1/payment/checkout",
            json={
                "product_id": "starter",
                "device_id": "test-device",
                "success_url": "https://example.com/success"
            }
        )
    
    assert response.status_code == 200
    assert "checkout_url" in response.json()

def test_webhook_checkout_completed(client):
    """Test webhook handling for completed checkout."""
    webhook_payload = {
        "type": "checkout.completed",
        "data": {
            "product_id": "prod_starter",
            "metadata": {
                "device_id": "webhook-device-001"
            }
        }
    }
    
    with patch("app.api.v1.payment.settings") as mock_settings:
        mock_settings.creem_webhook_secret = ""
        mock_settings.creem_product_ids = '{"starter": "prod_starter"}'
        
        response = client.post(
            "/api/v1/payment/webhook",
            json=webhook_payload
        )
    
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_webhook_signature_verification(client):
    """Test webhook signature verification."""
    secret = "test-webhook-secret"
    payload = json.dumps({"type": "test"})
    
    # Calculate correct signature
    signature = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    with patch("app.api.v1.payment.settings") as mock_settings:
        mock_settings.creem_webhook_secret = secret
        mock_settings.creem_product_ids = '{}'
        
        # With correct signature
        response = client.post(
            "/api/v1/payment/webhook",
            content=payload,
            headers={
                "Content-Type": "application/json",
                "X-Creem-Signature": signature
            }
        )
        assert response.status_code == 200
        
        # With wrong signature
        response = client.post(
            "/api/v1/payment/webhook",
            content=payload,
            headers={
                "Content-Type": "application/json",
                "X-Creem-Signature": "wrong-signature"
            }
        )
        assert response.status_code == 401
