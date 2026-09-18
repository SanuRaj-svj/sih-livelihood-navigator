"""MongoDB persistence for RAG conversation history."""

import asyncio
from datetime import datetime, timezone
from typing import Any, Optional
from uuid import uuid4

from pymongo import MongoClient

from app.core.config import Settings, settings
from app.core.exceptions import ProviderConfigurationException, ProviderResponseException


class ConversationStore:
    """Stores RAG exchanges separately from the searchable knowledge collection."""

    def __init__(self, config: Settings = settings):
        if not config.MONGODB_URI:
            raise ProviderConfigurationException("MongoDB Conversation History")
        self._client = MongoClient(config.MONGODB_URI, serverSelectionTimeoutMS=5000)
        self._collection = self._client[config.VECTOR_DB_NAME]["rag_conversations"]
        self._collection.create_index([("conversation_id", 1), ("created_at", 1)])
        self._collection.create_index([("user_id", 1), ("created_at", -1)])
        self._collection.create_index([("session_id", 1), ("created_at", -1)])

    async def append(
        self,
        question: str,
        answer: str,
        model: str,
        sources: list[dict[str, Any]],
        conversation_id: Optional[str] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
    ) -> str:
        exchange_id = str(uuid4())
        document = {
            "exchange_id": exchange_id,
            "conversation_id": conversation_id or exchange_id,
            "user_id": user_id,
            "session_id": session_id,
            "question": question,
            "answer": answer,
            "model": model,
            "grounded": bool(sources),
            "sources": sources,
            "created_at": datetime.now(timezone.utc),
        }
        try:
            await asyncio.to_thread(self._collection.insert_one, document)
        except Exception:
            raise ProviderResponseException("MongoDB Conversation History") from None
        return document["conversation_id"]

    async def get_history(
        self,
        conversation_id: str,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        try:
            records = await asyncio.to_thread(
                lambda: list(self._collection.find(
                    {"conversation_id": conversation_id},
                    {"_id": 0},
                ).sort("created_at", 1).limit(limit))
            )
        except Exception:
            raise ProviderResponseException("MongoDB Conversation History") from None
        for record in records:
            if isinstance(record.get("created_at"), datetime):
                record["created_at"] = record["created_at"].isoformat()
        return records

    def close(self) -> None:
        self._client.close()
