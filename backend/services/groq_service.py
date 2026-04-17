from typing import Generator
from dotenv import load_dotenv
from groq import Groq
import os

load_dotenv()

MEDICAL_SYSTEM_PROMPT = (
    "You are CuraWise AI, a knowledgeable medical assistant. "
    "Provide helpful, accurate health information. "
    "Always remind users to consult a qualified doctor for diagnosis and treatment. "
    "Be empathetic and clear."
)

_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def stream_chat(messages: list[dict], model: str, max_tokens: int) -> Generator[str, None, None]:
    all_messages = [{"role": "system", "content": MEDICAL_SYSTEM_PROMPT}] + messages
    stream = _client.chat.completions.create(
        model=model,
        messages=all_messages,
        max_tokens=max_tokens,
        stream=True,
    )
    for chunk in stream:
        content = chunk.choices[0].delta.content
        if content:
            yield content
