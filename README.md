# JurisMind — AI Legal Document Analysis

A full rebuild of the original Streamlit app as a proper two-part application:

- **`backend/`** — FastAPI service that does all the real work (PDF extraction,
  chunking, embeddings + FAISS retrieval, Groq-powered summarization, keyword
  risk detection, chat). Same logic as the original `app.py`, exposed as a
  JSON API instead of being wired directly into a UI.
- **`frontend/`** — A React + Vite + Tailwind single-page app with real
  multi-page navigation (Upload, Summary, Risk assessment, Ask the document,
  Reports), a glassmorphic UI, and a floating animated background.

## 1. Run the backend

```bash
cd backend
conda create --name jurismindrebuit
conda activate jurismindrebuilt  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env             # then paste in your real GROQ_API_KEY

uvicorn main:app --reload --port 8000
```

The API will be live at `http://127.0.0.1:8000` (docs at `/docs`).

## 2. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. In dev mode, Vite proxies any request to
`/api/*` straight to `http://127.0.0.1:8000`, so no extra config is needed —
just make sure the backend is running first.

## 3. Build for production

```bash
cd frontend
npm run build
```

This outputs static files to `frontend/dist/`. Serve them with any static
host (nginx, Vercel, Netlify, etc.), and set `VITE_API_BASE_URL` at build
time to point at your deployed backend's `/api` path, e.g.:

```bash
VITE_API_BASE_URL=https://your-api.example.com/api npm run build
```

## What changed from the original

- **Backend/frontend split** — `app.py`'s logic now lives in
  `backend/main.py` as clean REST endpoints (`/api/documents/upload`,
  `/api/documents/{id}/chat`, `/api/documents/{id}/risks/chart`,
  `/api/documents/{id}/summary/download`, `/api/documents/{id}/email`).
  Streamlit's `st.session_state` is replaced by an in-memory `SESSIONS` dict
  keyed by a `session_id` returned on upload.
- **Real multi-page navigation** — `react-router-dom` replaces Streamlit's
  single-scroll page, with a persistent sidebar rail. Pages other than
  Upload are locked (with a lock icon) until a document has been processed.
- **Visual design** — a "midnight chambers" palette (deep ink-navy, brass/gold
  accent, sapphire secondary), Fraunces for display type and Inter for body
  text, glass panels (`backdrop-blur` + soft borders) over a fixed layer of
  slow-drifting animated gradient blobs, plus a faint document-grid texture.
- **Risk chart** — rendered live in the browser with Recharts (so it's
  interactive), with a separate backend endpoint that renders a matplotlib
  PNG on demand for the "Download chart" button, matching the original's
  export behavior.

## Notes

- The email endpoint (`POST /api/documents/{id}/email`) is still a
  placeholder, exactly as it was in the original app — wire up a real
  provider (SendGrid, SES, SMTP) when you're ready.
- The first request after starting the backend will be slow while
  `sentence-transformers` loads the `all-MiniLM-L6-v2` model — this is
  normal and matches the original app's startup cost.
