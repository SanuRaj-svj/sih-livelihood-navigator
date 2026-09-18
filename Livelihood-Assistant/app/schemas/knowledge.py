"""RAG knowledge question contracts."""

from typing import Any
from pydantic import BaseModel, Field, field_validator
from app.schemas.language import normalize_language_code


class KnowledgeAskRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=2000)
    language: str = Field(default="en", min_length=2, max_length=8)
    top_k: int = Field(default=5, ge=1, le=20)
    conversation_id: str | None = Field(default=None, min_length=1, max_length=100)
    user_id: str | None = Field(default=None, min_length=1, max_length=100)
    session_id: str | None = Field(default=None, min_length=1, max_length=100)

    @field_validator("language")
    @classmethod
    def validate_language(cls, value: str) -> str:
        return normalize_language_code(value)

class KnowledgeSource(BaseModel):
    chunk_id: str
    score: float = Field(ge=0.0)
    metadata: dict[str, Any] = Field(default_factory=dict)


class KnowledgeAskResponse(BaseModel):
    conversation_id: str
    answer: str
    sources: list[KnowledgeSource] = Field(default_factory=list)
    model: str
    grounded: bool


class ConversationExchange(BaseModel):
    exchange_id: str
    conversation_id: str
    user_id: str | None = None
    session_id: str | None = None
    question: str
    answer: str
    model: str
    grounded: bool
    sources: list[KnowledgeSource] = Field(default_factory=list)
    created_at: str


class ConversationHistoryResponse(BaseModel):
    conversation_id: str
    exchanges: list[ConversationExchange] = Field(default_factory=list)
