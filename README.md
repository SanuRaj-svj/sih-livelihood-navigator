# Livelihood Navigator

Livelihood Navigator is a full-stack platform for skill discovery, career guidance, and livelihood enablement in India. It combines a React frontend, a Node.js + Express backend, and a Python AI service for multilingual assistance, recommendation logic, and vector-based knowledge retrieval.

## Project overview

This repository includes three main parts:

- Frontend: React + Vite application for the public-facing portal and dashboard
- Backend: Express API with MongoDB for user, profile, enrollment, certificate, and scheme management
- AI service: FastAPI app for recommendation, eligibility assessment, RAG, and multilingual interview support

## Key features

- Beneficiary profile onboarding with voice and form input
- Multilingual interface and speech support for Hindi, Bhojpuri, Magahi, Bundeli, and other supported languages
- AI-driven recommendation engine for courses, occupations, and opportunities
- MongoDB-backed persistence for users, training data, and outcomes
- Certificate issuance flow with admin approval
- Government scheme integration and program tracking
- Vector database / RAG knowledge search for livelihood guidance
- Officer dashboard and recommendation workflows

## Repository structure

```text
.
├── backend/                 # Node.js + Express API
├── frontend/                # React + Vite app
├── Livelihood-Assistant/    # Python FastAPI AI service
├── docs/                    # Project docs and API references
├── data/                    # Demo / seed / evaluation data
├── start-all.ps1            # Helper script to start the stack
├── .gitignore
├── README.md                # Project overview
└── package.json             # Not required at repo root; each service has its own package config
```

## Architecture

```text
User Browser
    ↓
Frontend (React/Vite)
    ↓
Backend API (Express + MongoDB)
    ↓
AI Service (FastAPI + RAG + recommendation engine)
```

## Default ports

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- AI service: http://localhost:8000
- AI docs: http://127.0.0.1:8000/docs

## Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB running locally or via Atlas
- npm / pip

## Quick start

### 1. Start the backend

```bash
cd backend
npm install
npm run dev
```

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Start the AI service

```bash
cd "Livelihood-Assistant"
python -m venv .venv
# Windows
.\.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
python scripts/run_dev.py
```

You can also run the AI server directly with Uvicorn:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

## Environment notes

- Backend uses environment variables from the local `.env` file. Configure MongoDB and service URLs before running.
- The AI service uses `.env` values such as model keys and vector database settings.
- Ensure the MongoDB vector index exists for knowledge retrieval if you want the RAG endpoints to work fully.

## Main workflows

- User sign-up / login
- Beneficiary profile creation
- Training and occupation recommendations
- Enrollment management
- Certificate approval and issuance
- Government schemes and opportunities
- AI-based livelihood guidance and RAG answers

## Useful commands

### Backend

```bash
cd backend
npm run dev
npm run seed
npm run seed:admin
npm run test
```

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run preview
```

### AI service

```bash
cd "Livelihood-Assistant"
pytest -q
python scripts/run_evaluation.py
```

## Notes

This project is designed for demo and prototype deployment as part of a hackathon/innovation workflow. Some AI features depend on configured external providers or local vector search setup.

## License

This project is intended for internal/demo use and is distributed under the repository’s current licensing arrangement.
