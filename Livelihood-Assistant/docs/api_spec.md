## Operational health

The Node API exposes `GET /api/health`. It reports the API, MongoDB, and Python AI service states. A `200` response means the Node API and MongoDB are ready; `503` means the API is running but a required dependency is unavailable.

The frontend origin is configured with the backend `CORS_ORIGINS` environment variable as a comma-separated list. Production also requires `JWT_SECRET`.

# API Specification (V1)

Base URL: `http://127.0.0.1:8000/v1`

## RAG and Vector Search Setup

The AI service uses MongoDB Atlas Vector Search for persistent knowledge chunks. Configure `MONGODB_URI`, `GEMINI_API_KEY`, `VECTOR_DB_NAME`, `VECTOR_COLLECTION`, and `VECTOR_INDEX_NAME` in the Python service environment.

Create an Atlas vector search index on the `knowledge_chunks` collection with this definition:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    }
  ]
}
```

After the index is ready, populate it with:

```bash
python scripts/index_knowledge.py
```

The indexer includes the Python seed records plus MongoDB reference collections for
NSQF courses, training centres, and government schemes. User accounts, beneficiary
profiles, enrollments, and other transactional records are not indexed.

The grounded question endpoint is `POST /v1/knowledge/ask`. Send the user's language
code with the question so retrieved English sources can be answered in Hindi or another
supported language. It returns the answer, source chunk IDs, similarity scores, and metadata. If no chunks are retrieved, the response marks `grounded` as `false`.

RAG exchanges are persisted in MongoDB collection `rag_conversations`. Pass an optional `conversation_id` to continue a conversation, plus `user_id` or `session_id` for correlation. Read a conversation with `GET /v1/knowledge/history/{conversation_id}`. Knowledge chunks remain in `knowledge_chunks`; conversation history is stored separately.

---

### 1. Health Check
- **Endpoint**: `GET /v1/health`
- **Description**: Returns system operational status and registered subsystems.
- **Sample Response (200 OK)**:
```json
{
  "status": "healthy",
  "app_name": "Livelihood-Assistant-AI",
  "version": "0.1.0",
  "environment": "development",
  "services": {
    "api": "online",
    "ai_extractor": "registered",
    "speech_transcriber": "registered",
    "skill_matcher": "registered",
    "recommendation_engine": "registered",
    "market_demand": "registered",
    "roadmap_generator": "registered"
  }
}
```

---

### 2. Profile Extraction
- **Endpoint**: `POST /v1/profile/extract`
- **Description**: Extracts canonical `BeneficiaryProfile` and raw conversational skill phrases from input text/transcript.
- **Request Body**:
```json
{
  "raw_text": "Mera naam Rajesh hai, 10th pass hoon, Varanasi mein electrician ka thoda kaam jaanta hoon.",
  "language": "hi",
  "source": "voice_interview"
}
```

---

### 3. Profile Validation
- **Endpoint**: `POST /v1/profile/validate`
- **Description**: Evaluates candidate eligibility against PM-AJAY criteria, strictly returning `UNKNOWN` when criteria cannot be verified.
- **Request Body**:
```json
{
  "profile": {
    "beneficiary_id": "BEN-2026-001",
    "age": 22,
    "gender": "male",
    "community": "SC",
    "education_level": "secondary_10th",
    "location": {
      "state": "Uttar Pradesh",
      "district": "Varanasi"
    },
    "traditional_skills": ["electrical wiring"]
  },
  "scheme": "PM-AJAY"
}
```

---

### 4. Skilling & Livelihood Recommendations
- **Endpoint**: `POST /v1/recommendations`
- **Description**: Generates canonical `Recommendation` records with multidimensional score breakdown (`skill_match_score`, `local_demand_score`, `eligibility_score`, `preference_alignment_score`) and skill gaps.
- **Request Body**:
```json
{
  "profile": {
    "beneficiary_id": "BEN-2026-001",
    "community": "SC",
    "education_level": "secondary_10th",
    "traditional_skills": ["electrician helper"]
  },
  "target_sector": "Green Jobs",
  "preferred_pathway": "skill_training",
  "max_recommendations": 5
}
```

---

### 5. Speech Transcription
- **Endpoint**: `POST /v1/speech/transcribe`
- **Description**: Accepts audio payloads (base64 or URL) and produces localized transcripts.
- **Request Body**:
```json
{
  "audio_content_base64": "<base64_encoded_audio>",
  "language_code": "hi",
  "audio_format": "wav"
}
```

---

### 6. Opportunity Parsing
- **Endpoint**: `POST /v1/opportunities/parse`
- **Description**: Parses unstructured public notices into canonical `Opportunity` models with lifecycle states (`REPORTED`, `VERIFIED`, `ACTIVE`, `EXPIRED`, `FILLED`).
- **Request Body**:
```json
{
  "raw_content": "Notice: Free NSQF Level 4 Solar Technician training under PM-AJAY for SC youth with stipend.",
  "scheme_context": "PM-AJAY"
}
```

---

### 7. Regional Market Demand
- **Endpoint**: `POST /v1/market/demand`
- **Description**: Queries regional and district skill market demand trends.
- **Request Body**:
```json
{
  "state": "Uttar Pradesh",
  "district": "Varanasi"
}
```

---

### 8. Career Roadmap Generation
- **Endpoint**: `POST /v1/roadmap`
- **Description**: Generates a canonical `Roadmap` with ordered `RoadmapStep` items, prerequisites, duration, and skill gaps.
- **Request Body**:
```json
{
  "profile": {
    "beneficiary_id": "BEN-2026-001",
    "community": "SC",
    "traditional_skills": ["basic electrical wiring"]
  },
  "target_occupation_id": "OCC-SOL-001",
  "target_pathway": "skill_training",
  "timeframe_months": 6
}
```
