"""Provider boundaries for embeddings and grounded language generation."""

from abc import ABC, abstractmethod
import asyncio
import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.core.config import Settings, settings
from app.core.exceptions import ProviderConfigurationException, ProviderResponseException


class EmbeddingProvider(ABC):
    """Create vectors for documents and user questions."""

    @abstractmethod
    async def embed(self, text: str) -> list[float]:
        """Return one embedding vector."""


class GenerationProvider(ABC):
    """Generate an answer from a grounded prompt."""

    @abstractmethod
    async def generate(self, prompt: str) -> str:
        """Return generated text."""


class GeminiEmbeddingProvider(EmbeddingProvider):
    """Gemini embedding REST adapter."""

    def __init__(self, config: Settings = settings):
        self._api_key = config.GEMINI_API_KEY
        self._model = config.GEMINI_EMBEDDING_MODEL
        self._timeout = config.GEMINI_TIMEOUT_SECONDS

    async def embed(self, text: str) -> list[float]:
        if not self._api_key:
            raise ProviderConfigurationException("Gemini embeddings")
        return await asyncio.to_thread(self._request, text)

    def _request(self, text: str) -> list[float]:
        body = json.dumps({
            "model": f"models/{self._model}",
            "content": {"parts": [{"text": text}]},
            "outputDimensionality": settings.GEMINI_EMBEDDING_DIMENSIONS,
        }).encode("utf-8")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self._model}:embedContent?key={self._api_key}"
        request = Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
        try:
            with urlopen(request, timeout=self._timeout) as response:  # nosec B310 - fixed Google endpoint
                payload = json.loads(response.read().decode("utf-8"))
            values = payload["embedding"]["values"]
        except (HTTPError, URLError, TimeoutError, KeyError, TypeError, json.JSONDecodeError, OSError):
            raise ProviderResponseException("Gemini embeddings") from None
        if not isinstance(values, list) or not values or not all(isinstance(value, (int, float)) for value in values):
            raise ProviderResponseException("Gemini embeddings")
        return [float(value) for value in values]


class GeminiGenerationProvider(GenerationProvider):
    """Gemini text generation adapter for prompts containing retrieved context."""

    def __init__(self, config: Settings = settings):
        self._api_key = config.GEMINI_API_KEY
        self._model = config.GEMINI_MODEL
        self._timeout = config.GEMINI_TIMEOUT_SECONDS

    async def generate(self, prompt: str) -> str:
        if not self._api_key:
            raise ProviderConfigurationException("Gemini generation")
        return await asyncio.to_thread(self._request, prompt)

    def _request(self, prompt: str) -> str:
        body = json.dumps({
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2},
        }).encode("utf-8")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self._model}:generateContent?key={self._api_key}"
        request = Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
        try:
            with urlopen(request, timeout=self._timeout) as response:  # nosec B310 - fixed Google endpoint
                payload: dict[str, Any] = json.loads(response.read().decode("utf-8"))
            text = payload["candidates"][0]["content"]["parts"][0]["text"]
        except (HTTPError, URLError, TimeoutError, KeyError, IndexError, TypeError, json.JSONDecodeError, OSError):
            raise ProviderResponseException("Gemini generation") from None
        if not isinstance(text, str) or not text.strip():
            raise ProviderResponseException("Gemini generation")
        return text.strip()
