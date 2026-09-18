"""MongoDB Atlas Vector Search storage and retrieval."""

from dataclasses import dataclass
import asyncio
from typing import Any, Optional

from pymongo import MongoClient

from app.core.config import Settings, settings
from app.core.exceptions import ProviderConfigurationException, ProviderResponseException


@dataclass(frozen=True)
class RetrievedChunk:
    """A knowledge chunk returned by vector similarity search."""

    chunk_id: str
    text: str
    score: float
    metadata: dict[str, Any]


class MongoVectorStore:
    """Async facade over MongoDB Atlas Vector Search."""

    def __init__(self, config: Settings = settings):
        if not config.MONGODB_URI:
            raise ProviderConfigurationException("MongoDB Vector Search")
        self._config = config
        self._client = MongoClient(config.MONGODB_URI, serverSelectionTimeoutMS=5000)
        self._collection = self._client[config.VECTOR_DB_NAME][config.VECTOR_COLLECTION]

    async def search(self, query_vector: list[float], limit: Optional[int] = None) -> list[RetrievedChunk]:
        return await asyncio.to_thread(self._search, query_vector, limit or self._config.VECTOR_TOP_K)

    def _search(self, query_vector: list[float], limit: int) -> list[RetrievedChunk]:
        pipeline = [
            {
                "$vectorSearch": {
                    "index": self._config.VECTOR_INDEX_NAME,
                    "path": "embedding",
                    "queryVector": query_vector,
                    "numCandidates": max(self._config.VECTOR_NUM_CANDIDATES, limit),
                    "limit": limit,
                }
            },
            {"$project": {"text": 1, "metadata": 1, "score": {"$meta": "vectorSearchScore"}}},
        ]
        try:
            records = list(self._collection.aggregate(pipeline))
        except Exception:
            raise ProviderResponseException("MongoDB Vector Search") from None
        return [
            RetrievedChunk(
                chunk_id=str(record.get("_id", "")),
                text=str(record.get("text", "")),
                score=float(record.get("score", 0.0)),
                metadata=dict(record.get("metadata") or {}),
            )
            for record in records
            if record.get("text")
        ]

    async def upsert(self, chunk_id: str, text: str, embedding: list[float], metadata: dict[str, Any]) -> None:
        await asyncio.to_thread(
            self._collection.replace_one,
            {"_id": chunk_id},
            {"_id": chunk_id, "text": text, "embedding": embedding, "metadata": metadata},
            upsert=True,
        )

    def close(self) -> None:
        self._client.close()
