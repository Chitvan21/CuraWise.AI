from pydantic import BaseModel


class SymptomRequest(BaseModel):
    symptoms: list[str]


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    model: str = "llama3-70b-8192"
    max_tokens: int = 1024


class ReportRequest(BaseModel):
    name: str
    age: int
    disease: str
    description: str
    precautions: list[str]
    workout: list[str]
    diets: list[str]
    medications: list[str]


class PredictResponse(BaseModel):
    disease: str
    confidence: float
    description: str
    precautions: list[str]
    workout: list[str]
    diets: list[str]
    medications: list[str]
