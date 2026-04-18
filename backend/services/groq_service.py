from typing import Generator
from dotenv import load_dotenv
from groq import Groq
import os

load_dotenv()

MEDICAL_SYSTEM_PROMPT = """You are CuraWise AI, a medical assistant. Answer directly and concisely.
Do NOT think out loud or show your reasoning. Do NOT narrate what you are doing.
Just respond to the patient directly with helpful medical information.
Use clear formatting with headers and bullet points. Always advise consulting a doctor."""

_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def stream_chat(messages: list[dict], model: str, max_tokens: int) -> Generator[str, None, None]:
    all_messages = [
        {"role": "system", "content": MEDICAL_SYSTEM_PROMPT},
        *messages,
    ]
    stream = _client.chat.completions.create(
        model=model,
        messages=all_messages,
        max_tokens=1024,
        stream=True,
        temperature=0.7,
        **({"reasoning_effort": "none"} if "qwen" in model else {}),
    )
    for chunk in stream:
        content = chunk.choices[0].delta.content
        if content is not None:
            yield content
