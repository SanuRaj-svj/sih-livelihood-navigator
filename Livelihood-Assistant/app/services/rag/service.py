"""Grounded retrieval-augmented generation orchestration."""

from dataclasses import dataclass

from app.services.rag.providers import EmbeddingProvider, GenerationProvider
from app.services.rag.vector_store import MongoVectorStore, RetrievedChunk
from app.services.rag.conversation_store import ConversationStore


@dataclass(frozen=True)
class RagAnswer:
    """Answer plus the evidence used to produce it."""

    conversation_id: str | None
    answer: str
    sources: list[RetrievedChunk]
    model: str


class RagService:
    """Retrieve relevant knowledge, then ask the LLM to answer only from it."""

    def __init__(
        self,
        vector_store: MongoVectorStore,
        embedding_provider: EmbeddingProvider,
        generation_provider: GenerationProvider,
        model: str,
        conversation_store: ConversationStore | None = None,
    ):
        self._vector_store = vector_store
        self._embeddings = embedding_provider
        self._generation = generation_provider
        self._conversations = conversation_store
        self._model = model

    async def answer(
        self,
        question: str,
        top_k: int | None = None,
        language: str = "en",
        conversation_id: str | None = None,
        user_id: str | None = None,
        session_id: str | None = None,
    ) -> RagAnswer:
        query_vector = await self._embeddings.embed(question)
        sources = await self._vector_store.search(query_vector, top_k)
        context = "\n\n".join(
            f"[Source {index + 1} | {chunk.chunk_id}]\n{chunk.text}"
            for index, chunk in enumerate(sources)
        )
        prompt = f"""You are a careful livelihood assistant. Answer the question using only the supplied sources.
If the sources do not contain enough information, say that the information is unavailable.
Do not invent schemes, eligibility rules, jobs, salaries, locations, or course details.
Keep the answer practical and concise. Cite sources inline as [Source 1], [Source 2].
    Answer in the user's requested language ({language}). Do not translate official names, URLs, or source citations unless needed for clarity.

QUESTION:
{question}

SOURCES:
{context or '(No matching sources were found.)'}
"""
        answer = await self._generation.generate(prompt)
        stored_conversation_id = None
        if self._conversations:
            stored_conversation_id = await self._conversations.append(
                question=question,
                answer=answer,
                model=self._model,
                sources=[
                    {"chunk_id": source.chunk_id, "score": source.score, "metadata": source.metadata}
                    for source in sources
                ],
                conversation_id=conversation_id,
                user_id=user_id,
                session_id=session_id,
            )
        return RagAnswer(conversation_id=stored_conversation_id, answer=answer, sources=sources, model=self._model)

    async def history(self, conversation_id: str) -> list[dict]:
        if not self._conversations:
            return []
        return await self._conversations.get_history(conversation_id)
