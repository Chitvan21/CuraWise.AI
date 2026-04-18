import os
import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

_jwks_client = None


def _get_jwks_client():
    global _jwks_client
    if _jwks_client is None:
        supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
        if supabase_url:
            _jwks_client = PyJWKClient(f"{supabase_url}/auth/v1/.well-known/jwks.json")
    return _jwks_client


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    client = _get_jwks_client()

    if not client:
        # SUPABASE_URL not configured — skip verification in local dev
        return {"sub": "dev"}

    try:
        signing_key = client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256", "HS256"],
            options={"verify_aud": False},
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
