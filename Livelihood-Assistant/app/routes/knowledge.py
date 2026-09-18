"""Retrieval-augmented knowledge routes."""

from functools import lru_cache

from fastapi import APIRouter, Depends, status

from app.core.config import settings
from app.schemas.knowledge import (
    ConversationHistoryResponse,
    ConversationExchange,
    KnowledgeAskRequest,
    KnowledgeAskResponse,
    KnowledgeSource,
)
from app.services.rag.conversation_store import ConversationStore
from app.services.rag.providers import GeminiEmbeddingProvider, GeminiGenerationProvider
from app.services.rag.service import RagService
from app.services.rag.vector_store import MongoVectorStore

router = APIRouter(prefix="/knowledge", tags=["Knowledge RAG"])


@lru_cache(maxsize=1)
def get_rag_service() -> RagService:
    """Create one process-scoped RAG service and its MongoDB client."""
    return RagService(
        vector_store=MongoVectorStore(settings),
        embedding_provider=GeminiEmbeddingProvider(settings),
        generation_provider=GeminiGenerationProvider(settings),
        conversation_store=ConversationStore(settings),
        model=settings.GEMINI_MODEL,
    )


@router.post(
    "/ask",
    response_model=KnowledgeAskResponse,
    status_code=status.HTTP_200_OK,
    summary="Answer a livelihood question using retrieved canonical knowledge",
)
async def ask_knowledge(
    request: KnowledgeAskRequest,
    service: RagService = Depends(get_rag_service),
) -> KnowledgeAskResponse:
    result = await service.answer(
        request.question,
        request.top_k,
                request.language,
        request.conversation_id,
        request.user_id,
        request.session_id,
    )
    conversation_id = result.conversation_id or request.conversation_id or ""
    return KnowledgeAskResponse(
        conversation_id=conversation_id,
        answer=result.answer,
        sources=[
            KnowledgeSource(chunk_id=source.chunk_id, score=source.score, metadata=source.metadata)
            for source in result.sources
        ],
        model=result.model,
        grounded=bool(result.sources),
    )


@router.get(
    "/history/{conversation_id}",
    response_model=ConversationHistoryResponse,
    summary="Read persisted RAG conversation history",
)
async def get_knowledge_history(
    conversation_id: str,
    service: RagService = Depends(get_rag_service),
) -> ConversationHistoryResponse:
    records = await service.history(conversation_id)
    return ConversationHistoryResponse(
        conversation_id=conversation_id,
        exchanges=[
            ConversationExchange(
                **{key: value for key, value in record.items() if key != "sources"},
                sources=[KnowledgeSource(**source) for source in record.get("sources", [])],
            )
            for record in records
        ],
    )
