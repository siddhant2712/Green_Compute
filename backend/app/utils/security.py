import hmac
import hashlib
from app.core.config import settings

def generate_signature(task_id: str) -> str:
    """Generates a secure HMAC-SHA256 signature for a task ID."""
    return hmac.new(
        settings.SECRET_KEY.encode(),
        task_id.encode(),
        hashlib.sha256
    ).hexdigest()

def verify_signature(task_id: str, signature: str) -> bool:
    """Verifies the HMAC-SHA256 signature for a task ID."""
    expected = generate_signature(task_id)
    return hmac.compare_digest(expected, signature)
