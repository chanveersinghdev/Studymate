# StudyMate — Ollama Cloud Edition

Personalized AI study partner with contextual learning actions.

## AI provider

This version uses **Ollama Cloud** by default. The default configurable model is `gpt-oss:120b`.

## Setup

### 1. Backend

```powershell
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
```

Open `backend/.env` and add your Ollama Cloud API key:

```env
AI_PROVIDER=ollama_cloud
OLLAMA_HOST=https://ollama.com
OLLAMA_API_KEY=YOUR_KEY_HERE
OLLAMA_MODEL=gpt-oss:120b
```

Then:

```powershell
uvicorn app.main:app --reload --port 8000
```

Check:

```text
http://127.0.0.1:8000/api/health
```

### 2. Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Included

- Rounded Claude-inspired chat UI
- Hover and message animations
- Dark/light mode
- Responsive layout
- Context-aware study actions
- Learning-phase detection
- Ollama Cloud API integration
- Configurable model
- Server-side API key handling
- Fallback UI when no key is configured

## Security

Never commit `backend/.env`. It contains your private API key.

The React frontend does not contain the Ollama key. Requests go through FastAPI.

## Planned modules

PDF/RAG, verified PYQs, web sources, books/resources, quiz generation, persistent learning history, progress dashboard, image questions, and streaming responses.
