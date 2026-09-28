import os
import tempfile
import time
import uuid as uuid_pkg

import faiss
import matplotlib
import numpy as np

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import PyPDF2
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from groq import APIError, Groq
from pydantic import BaseModel
from PyPDF2.errors import PdfReadError
from sentence_transformers import SentenceTransformer

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

groq_api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=groq_api_key) if groq_api_key else None
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
embedding_model = None

app = FastAPI(title="JurisMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are an AI assistant specialized in summarizing legal documents. Your task is to extract key points, risks, obligations,
 and important clauses from PDF documents. Summarize the document in a structured format, ensuring clarity and conciseness. Highlight critical
 information relevant to legal professionals, including compliance risks, contractual terms, and liabilities. Maintain a professional and neutral tone.
 If the document contains multiple sections, provide a section-wise summary. Avoid unnecessary details and focus on essential insights."""

RISK_KEYWORDS = {
    "Compliance Risks": ["compliance", "regulation", "legal requirement"],
    "Financial Risks": ["financial loss", "penalty", "liability"],
    "Operational Risks": ["operational failure", "breach", "disruption"],
}


class Session:
    def __init__(self, filename: str):
        self.filename = filename
        self.text_chunks: list[str] = []
        self.faiss_index: faiss.IndexFlatL2 | None = None
        self.summary = ""
        self.risks: dict[str, int] = {}
        self.chat_history: list[dict[str, str]] = []
        self.word_count = 0


SESSIONS: dict[str, Session] = {}


class ChatRequest(BaseModel):
    message: str


class EmailRequest(BaseModel):
    email: str


def extract_text_from_pdf(file_obj) -> str:
    reader = PyPDF2.PdfReader(file_obj)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text


def split_text_into_chunks(text, chunk_size=1000):
    return [text[i : i + chunk_size] for i in range(0, len(text), chunk_size)]


def generate_embeddings(chunks):
    return get_embedding_model().encode(chunks)


def get_embedding_model():
    """Load the model only when an upload or chat request actually needs it."""
    global embedding_model
    if embedding_model is None:
        try:
            embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as exc:
            raise HTTPException(
                status_code=503,
                detail="The document analysis model is unavailable. Please try again later.",
            ) from exc
    return embedding_model


def build_faiss_index(embeddings):
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)  # type: ignore[call-arg]
    return index


def retrieve_relevant_chunks(query, index, chunks, k=3):
    query_embedding = get_embedding_model().encode([query])
    # FAISS pads requests larger than the index with -1. Limit the request so
    # a short document never produces duplicate/invalid context chunks.
    k = min(k, len(chunks))
    if k == 0:
        return []
    _, indices = index.search(query_embedding, k)
    return [chunks[i] for i in indices[0]]


def detect_risks(text: str) -> dict[str, int]:
    lowered = text.lower()
    return {
        category: sum(1 for kw in keywords if kw in lowered)
        for category, keywords in RISK_KEYWORDS.items()
    }


def get_groq_response(input_text: str, max_retries: int = 3) -> str:
    if client is None:
        return "Analysis is unavailable because GROQ_API_KEY is not configured on the server."

    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": input_text},
                ],
                temperature=1,
                max_tokens=1024,
                top_p=1,
                stream=False,
                stop=None,
            )
            return response.choices[0].message.content or ""
        except APIError as e:
            if "429" in str(e) and attempt < max_retries - 1:
                time.sleep(2)
                continue
            return f"Sorry, I'm currently experiencing issues. Please try again. Error: {e!r}"
    return "Sorry, something went wrong."


def get_session(session_id: str) -> Session:
    session = SESSIONS.get(session_id)
    if not session:
        raise HTTPException(
            status_code=404, detail="Session not found. Upload a document first."
        )
    return session


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)) -> dict:  # noqa: B008
    if not file.filename:
        raise HTTPException(status_code=400, detail="Please upload a PDF document.")

    if "/" in file.filename or "\\" in file.filename:
        raise HTTPException(status_code=400, detail="Invalid filename.")

    if file.content_type != "application/pdf" and not file.filename.lower().endswith(
        ".pdf"
    ):
        raise HTTPException(status_code=400, detail="Please upload a PDF document.")

    try:
        text = extract_text_from_pdf(file.file)
    except PdfReadError as e:
        raise HTTPException(
            status_code=422, detail=f"Could not read the PDF file: {e}"
        ) from e
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Error processing PDF: {e}") from e

    if not text.strip():
        raise HTTPException(
            status_code=422, detail="No extractable text was found in this PDF."
        )

    session_id = str(uuid_pkg.uuid4())
    session = Session(filename=file.filename)
    session.text_chunks = split_text_into_chunks(text)
    session.word_count = len(text.split())

    embeddings = generate_embeddings(session.text_chunks)
    session.faiss_index = build_faiss_index(np.array(embeddings))

    session.summary = get_groq_response(
        f"{SYSTEM_PROMPT}\nPlease summarize this legal document:\n{text}"
    )
    session.risks = detect_risks(text)
    session.chat_history.append(
        {"role": "user", "content": f"Uploaded {file.filename} for analysis"}
    )
    session.chat_history.append({"role": "assistant", "content": session.summary})

    SESSIONS[session_id] = session

    return {
        "session_id": session_id,
        "filename": session.filename,
        "summary": session.summary,
        "risks": session.risks,
        "chunk_count": len(session.text_chunks),
        "word_count": session.word_count,
    }


@app.get("/api/documents/{session_id}")
async def get_document(session_id: str) -> dict:
    session = get_session(session_id)
    return {
        "session_id": session_id,
        "filename": session.filename,
        "summary": session.summary,
        "risks": session.risks,
        "chunk_count": len(session.text_chunks),
        "word_count": session.word_count,
        "chat_history": session.chat_history,
    }


@app.post("/api/documents/{session_id}/chat")
async def chat(session_id: str, req: ChatRequest) -> dict:
    session = get_session(session_id)
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    if session.faiss_index is not None:
        relevant_chunks = retrieve_relevant_chunks(
            req.message, session.faiss_index, session.text_chunks
        )
        context = "\n".join(relevant_chunks)
        response = get_groq_response(
            f"{SYSTEM_PROMPT}\nContext:\n{context}\nQuestion: {req.message}"
        )
    else:
        response = get_groq_response(req.message)

    session.chat_history.append({"role": "user", "content": req.message})
    session.chat_history.append({"role": "assistant", "content": response})

    return {"response": response, "chat_history": session.chat_history}


@app.get("/api/documents/{session_id}/summary/download")
async def download_summary(session_id: str, background_tasks: BackgroundTasks):
    session = get_session(session_id)
    if not session.summary:
        raise HTTPException(status_code=404, detail="No summary available yet.")

    tmp_path = ""
    try:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as tmp:
            tmp_path = tmp.name
            tmp.write(session.summary)
        background_tasks.add_task(os.remove, tmp_path)
        return FileResponse(tmp_path, filename="summary.txt", media_type="text/plain")
    except Exception as e:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise HTTPException(status_code=500, detail="Could not create summary file.") from e


@app.get("/api/documents/{session_id}/risks/chart")
async def download_risk_chart(session_id: str, background_tasks: BackgroundTasks):
    session = get_session(session_id)
    if not session.risks or all(v == 0 for v in session.risks.values()):
        raise HTTPException(status_code=404, detail="No risks detected to chart.")

    fig, ax = plt.subplots(figsize=(5, 5))
    colors = ["#C9A667", "#5D7FE8", "#4FAE7E"]
    ax.pie(
        list(session.risks.values()),
        labels=list(session.risks.keys()),
        autopct="%1.1f%%",
        startangle=90,
        colors=colors[: len(session.risks)],
        textprops={"color": "#1A1F2E"},
    )
    ax.axis("equal")

    tmp_path = ""
    try:
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp_path = tmp.name
        fig.savefig(tmp_path, transparent=True, bbox_inches="tight")
        plt.close(fig)
        background_tasks.add_task(os.remove, tmp_path)
        return FileResponse(tmp_path, filename="risk_distribution.png", media_type="image/png")
    except Exception as e:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise HTTPException(status_code=500, detail="Could not create chart file.") from e


@app.post("/api/documents/{session_id}/email")
async def send_email(session_id: str, req: EmailRequest) -> dict:
    get_session(session_id)
    # Placeholder: wire up an email provider (SendGrid, SES, SMTP) here.
    return {"status": "queued", "email": req.email}


@app.delete("/api/documents/{session_id}")
async def clear_session(session_id: str) -> dict:
    SESSIONS.pop(session_id, None)
    return {"status": "cleared"}
