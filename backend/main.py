import os
import re
from fastapi import FastAPI, Request
from fastapi.responses import Response
from routers import predict, chat, report

app = FastAPI(title="CuraWise.AI API")

_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
_explicit_origins = [o.strip() for o in _origins_env.split(",") if o.strip()]

# Also allow any Vercel preview deployment for this project
_VERCEL_PREVIEW_RE = re.compile(r"^https://curawise[\w-]*\.vercel\.app$")


def _is_allowed_origin(origin: str) -> bool:
    if origin in _explicit_origins:
        return True
    if _VERCEL_PREVIEW_RE.match(origin):
        return True
    return False


@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin", "")
    if request.method == "OPTIONS" and origin:
        response = Response(status_code=204)
        if _is_allowed_origin(origin):
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Vary"] = "Origin"
        return response

    response = await call_next(request)
    if origin and _is_allowed_origin(origin):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Vary"] = "Origin"
    return response

app.include_router(predict.router, prefix="/api")
app.include_router(chat.router, prefix="/api/chat")
app.include_router(report.router, prefix="/api/report")


@app.get("/")
def health_check():
    return {"status": "ok", "app": "CuraWise.AI"}
