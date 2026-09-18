"""Unit tests for retrieval-augmented generation orchestration."""

import pytest

from app.services.rag.service import RagService
from app.services.rag.vector_store import RetrievedChunk


class FakeEmbeddingProvider:
    async def embed(self, text: str) -> list[float]:
        return [1.0, 0.0]


class FakeGenerationProvider:
    def __init__(self):
        self.prompt = ""

    async def generate(self, prompt: str) -> str:
        self.prompt = prompt
        return "Use the cited training course. [Source 1]"


class FakeVectorStore:
    async def search(self, query_vector: list[float], limit: int | None = None) -> list[RetrievedChunk]:
        assert query_vector == [1.0, 0.0]
        return [RetrievedChunk("CRS-001", "Tailoring course, NSQF level 4.", 0.91, {"domain": "courses"})][:limit]


@pytest.mark.asyncio
async def test_rag_answers_with_retrieved_sources():
    generation = FakeGenerationProvider()
    service = RagService(FakeVectorStore(), FakeEmbeddingProvider(), generation, "test-model")

    result = await service.answer("Which tailoring course is available?", top_k=3)

    assert result.answer.endswith("[Source 1]")
    assert result.sources[0].chunk_id == "CRS-001"
    assert "Tailoring course" in generation.prompt
    assert "only the supplied sources" in generation.prompt
