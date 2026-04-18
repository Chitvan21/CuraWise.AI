import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from models.schemas import ChatRequest
from services import groq_service

router = APIRouter()


@router.post("")
def chat(body: ChatRequest):
    messages = [{"role": m.role, "content": m.content} for m in body.messages]

    def generate():
        for chunk in groq_service.stream_chat(messages, body.model, body.max_tokens):
            if chunk is not None:
                yield f"data: {json.dumps(chunk)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
