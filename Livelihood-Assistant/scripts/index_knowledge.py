"""Index canonical seed records into MongoDB Atlas Vector Search.

Run from Livelihood-Assistant after configuring MONGODB_URI and GEMINI_API_KEY:
    python scripts/index_knowledge.py
"""

import asyncio
import json
from pathlib import Path

from pymongo import MongoClient

from app.core.config import settings
from app.services.rag.providers import GeminiEmbeddingProvider
from app.services.rag.vector_store import MongoVectorStore


async def main() -> None:
    embedding_provider = GeminiEmbeddingProvider(settings)
    vector_store = MongoVectorStore(settings)
    seed_dir = Path(settings.SEED_DATA_DIR)
    files = ("skills.json", "occupations.json", "courses.json", "opportunities.json")
    indexed = 0
    try:
        for filename in files:
            records = json.loads((seed_dir / filename).read_text(encoding="utf-8"))
            if not isinstance(records, list):
                raise ValueError(f"Expected a JSON list in {filename}")
            domain = filename.removesuffix(".json")
            for record in records:
                identifier = next((record.get(key) for key in ("skill_id", "occupation_id", "course_id", "opportunity_id") if record.get(key)), None)
                if not identifier:
                    raise ValueError(f"Missing canonical identifier in {filename}")
                text = json.dumps(record, ensure_ascii=False, sort_keys=True)
                embedding = await embedding_provider.embed(text)
                await vector_store.upsert(str(identifier), text, embedding, {"domain": domain, "source_file": filename})
                indexed += 1
                print(f"Indexed {domain}/{identifier}")

        if settings.MONGODB_URI:
            mongo_client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
            try:
                database = mongo_client[settings.VECTOR_DB_NAME]
                mongo_sources = (
                    ("nsqf_courses", "nsqfcourses"),
                    ("training_centres", "trainingcenters"),
                    ("government_schemes", "governmentschemes"),
                )
                for domain, collection_name in mongo_sources:
                    for record in database[collection_name].find({}):
                        identifier = str(record.pop("_id"))
                        text = json.dumps(record, ensure_ascii=False, sort_keys=True, default=str)
                        embedding = await embedding_provider.embed(text)
                        await vector_store.upsert(identifier, text, embedding, {"domain": domain, "source": "mongodb"})
                        indexed += 1
                        print(f"Indexed {domain}/{identifier}")
            finally:
                mongo_client.close()
    finally:
        vector_store.close()
    print(f"Indexed {indexed} knowledge chunks")


if __name__ == "__main__":
    asyncio.run(main())
