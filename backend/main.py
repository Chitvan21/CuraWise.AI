import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import predict, chat, report

app = FastAPI(title="CuraWise.AI API")

_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, prefix="/api")
app.include_router(chat.router, prefix="/api/chat")
app.include_router(report.router, prefix="/api/report")


@app.get("/")
def health_check():
    return {"status": "ok", "app": "CuraWise.AI"}
