import os
import json
import logging
import urllib.request
import jwt
from jwt import PyJWK
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

logger = logging.getLogger(__name__)
security = HTTPBearer()

_jwks_cache = None


def _fetch_jwks():
    supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
    if not supabase_url:
        return None
    url = f"{supabase_url}/auth/v1/.well-known/jwks.json"
    with urllib.request.urlopen(url, timeout=10) as resp:
        return json.loads(resp.read())


def _get_signing_key(token: str):
    global _jwks_cache

    header = jwt.get_unverified_header(token)
    token_kid = header.get("kid", "").lower()

    if _jwks_cache is None:
        _jwks_cache = _fetch_jwks()

    if not _jwks_cache:
        return None

    # Case-insensitive kid matching
    for key_data in _jwks_cache.get("keys", []):
        if key_data.get("kid", "").lower() == token_kid:
            return PyJWK(key_data)

    # Cache may be stale — refresh once and retry
    _jwks_cache = _fetch_jwks()
    for key_data in (_jwks_cache or {}).get("keys", []):
        if key_data.get("kid", "").lower() == token_kid:
            return PyJWK(key_data)

    return None


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    try:
        signing_key = _get_signing_key(token)
    except Exception as e:
        logger.error("JWKS fetch error: %s: %s", type(e).__name__, e)
        signing_key = None

    if signing_key is None:
        supabase_url = os.getenv("SUPABASE_URL", "")
        if not supabase_url:
            # Local dev — skip verification
            return {"sub": "dev"}
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No matching signing key")

    try:
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256", "HS256"],
            options={"verify_aud": False},
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError as e:
        logger.error("Token decode error: %s: %s", type(e).__name__, e)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
