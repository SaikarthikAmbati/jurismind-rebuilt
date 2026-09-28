# JurisMind — AI Legal Document Analysis Platform

A modern, full-stack application for intelligent legal document analysis powered by AI. JurisMind extracts actionable insights from PDF documents through advanced NLP, semantic search, and risk detection—transforming raw legal text into structured, comprehensible information.

## Overview

JurisMind is a production-ready rebuild of a Streamlit prototype, architected as a proper two-part application with a dedicated REST API backend and a responsive React frontend. The system leverages cutting-edge NLP models, vector embeddings, and LLM integration to provide lawyers, compliance officers, and legal teams with powerful document intelligence capabilities.

**Key Capabilities:**
- 📄 **PDF Analysis** — Extract and process text from multi-page legal documents
- 🔍 **Semantic Search** — Query documents using natural language with FAISS vector retrieval
- ⚠️ **Risk Detection** — Automatically identify compliance, financial, and operational risks
- 💬 **Conversational Interface** — Ask questions about your documents and get instant answers
- 📊 **Visual Insights** — Interactive risk charts and downloadable reports
- ✉️ **Export & Sharing** — Generate summaries and email capabilities

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     React SPA Frontend                       │
│  (Vite + React Router + Tailwind + Framer Motion)          │
│  - Upload Page                                              │
│  - Summary Dashboard                                        │
│  - Risk Assessment (Interactive Charts)                     │
│  - Document Q&A                                             │
│  - Reports & Export                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/JSON (Proxy in dev)
                       │ CORS-enabled
┌──────────────────────▼──────────────────────────────────────┐
│                  FastAPI Backend Service                    │
│  - PDF Text Extraction (PyPDF2)                            │
│  - Text Chunking & Preprocessing                           │
│  - Semantic Embeddings (Sentence Transformers)             │
│  - Vector Similarity Search (FAISS)                        │
│  - LLM Integration (Groq API)                              │
│  - Session Management (In-Memory)                          │
│  - Risk Analysis Engine                                    │
│  - Report Generation (Matplotlib)                          │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- **Framework:** FastAPI (modern, fast, production-ready)
- **Server:** Uvicorn with async support
- **PDF Processing:** PyPDF2 (text extraction)
- **NLP & Embeddings:** Sentence Transformers (`all-MiniLM-L6-v2` model)
- **Vector Database:** FAISS (Facebook AI Similarity Search)
- **LLM:** Groq API (fast inference with open-source models)
- **Data Viz:** Matplotlib (for downloadable charts)
- **Configuration:** Python-dotenv for environment management

**Frontend:**
- **Framework:** React 18 with hooks
- **Build Tool:** Vite (lightning-fast dev server & builds)
- **Routing:** React Router v7 (multi-page navigation)
- **Styling:** Tailwind CSS (utility-first design)
- **Animations:** Framer Motion (smooth, performance-optimized animations)
- **HTTP Client:** Axios
- **Charts:** Recharts (interactive, React-native visualizations)
- **Icons:** Lucide React

## Project Structure

```
jurismind-rebuilt/
├── backend/
│   ├── main.py                 # FastAPI application & core logic
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example            # Environment template
│   └── jurismindbuild2/        # Utility modules
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main app component
│   │   ├── pages/              # Route components (Upload, Summary, etc.)
│   │   ├── components/         # Reusable UI components
│   │   └── styles/             # Custom CSS & animations
│   ├── public/                 # Static assets
│   ├── index.html              # HTML entry point
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind customization
│   ├── package.json            # NPM dependencies
│   └── dist/                   # Production build output
└── README.md
```

## API Endpoints

The backend exposes a comprehensive REST API for document management and analysis:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/documents/upload` | Upload PDF and extract text |
| `GET` | `/api/documents/{id}` | Retrieve document metadata & summary |
| `POST` | `/api/documents/{id}/chat` | Query document with natural language |
| `GET` | `/api/documents/{id}/risks/chart` | Download risk analysis chart (PNG) |
| `GET` | `/api/documents/{id}/summary/download` | Retrieve full summary |
| `POST` | `/api/documents/{id}/email` | Email summary & report |
| `GET` | `/docs` | Interactive API documentation (Swagger UI) |

### Session Management

Documents are tracked via `session_id` returned on upload. The backend maintains an in-memory `SESSIONS` dictionary with:
- Extracted text chunks
- FAISS vector index
- Document summary
- Risk categorization
- Chat history
- Word count

## Getting Started

### Prerequisites

- **Python 3.10+** (for backend)
- **Node.js 18+** (for frontend)
- **Groq API Key** (get one free at [console.groq.com](https://console.groq.com))
- **Conda** (optional, recommended for Python environment management)

### Backend Setup

```bash
cd backend

# Create isolated Python environment
conda create --name jurismind python=3.10
conda activate jurismind
# Or use venv: python -m venv venv && source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

**Running the backend:**
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at:
- 🔗 Application: `http://127.0.0.1:8000`
- 📖 API Docs: `http://127.0.0.1:8000/docs` (interactive Swagger UI)
- 🔧 ReDoc: `http://127.0.0.1:8000/redoc` (alternative documentation)

**Note:** The first request after starting the backend will be slower (~30-60s) as the `sentence-transformers` model loads into memory. This is a one-time cost.

### Frontend Setup

In a separate terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

**Development Proxy:** In dev mode, Vite automatically proxies `/api/*` requests to `http://127.0.0.1:8000`, so no manual API configuration is needed.

### Production Build

```bash
cd frontend
VITE_API_BASE_URL=https://your-api.example.com/api npm run build
```

This generates optimized static files in `frontend/dist/` ready for deployment.

**Deployment Options:**
- Static hosting: Netlify, Vercel, AWS S3 + CloudFront
- Container: Docker with Nginx
- Traditional: Any web server (Apache, Nginx)

## Features in Detail

### Document Upload & Processing

1. User uploads a PDF through the frontend
2. Backend extracts text using PyPDF2
3. Text is split into semantic chunks (1000 chars each)
4. Sentence Transformers generates embeddings for each chunk
5. FAISS builds a vector index for fast similarity search
6. Initial summary is generated using Groq LLM

### Intelligent Q&A

- Supports conversational queries about document content
- Uses semantic search to find relevant chunks
- LLM generates context-aware responses based on retrieved sections
- Full chat history maintained per session

### Risk Analysis

Automatically detects and categorizes risks:

| Category | Keywords |
|----------|----------|
| **Compliance Risks** | compliance, regulation, legal requirement |
| **Financial Risks** | financial loss, penalty, liability |
| **Operational Risks** | operational failure, breach, disruption |

Risks are visualized as interactive bar charts in the frontend and downloadable as PNG charts via the backend.

### Design System

**Visual Identity:**
- **Color Palette:** Deep ink-navy, brass/gold accents, sapphire secondary (midnight chambers aesthetic)
- **Typography:** Fraunces for display/headings, Inter for body text
- **Components:** Glassmorphic panels with `backdrop-blur`, soft borders
- **Background:** Animated gradient blobs with fixed document-grid texture
- **Animations:** Smooth transitions and micro-interactions via Framer Motion

## Configuration

### Environment Variables

**Backend (.env):**
```env
GROQ_API_KEY=your-api-key-here
GROQ_MODEL=openai/gpt-oss-20b  # Default LLM model
```

**Frontend (build-time):**
```bash
VITE_API_BASE_URL=http://localhost:8000/api  # Dev (default)
VITE_API_BASE_URL=https://api.example.com/api  # Production
```

## Key Differences from Original Streamlit Version

| Aspect | Original | JurisMind Rebuilt |
|--------|----------|------------------|
| **Architecture** | Single Streamlit app | Separate API + SPA |
| **State Management** | `st.session_state` | In-memory `SESSIONS` dict with session IDs |
| **Navigation** | Single scrolling page | React Router with persistent sidebar |
| **Charts** | Static matplotlib | Interactive Recharts in browser |
| **Styling** | Default Streamlit theme | Custom glassmorphic design |
| **Scalability** | Limited to single server | REST API suitable for scaling |
| **Deployment** | Streamlit Cloud | Standard web hosting + backend server |

## Known Limitations & Future Work

### Current Limitations

- **Email Integration:** The `/api/documents/{id}/email` endpoint is a placeholder. Wire up SendGrid, AWS SES, or SMTP before going to production.
- **Session Persistence:** Sessions are stored in-memory; they're lost on server restart. For production, integrate Redis or a database.
- **File Size:** Large PDFs (>100MB) may cause memory issues. Consider implementing streaming or chunked uploads.
- **Concurrent Uploads:** No built-in rate limiting or request queuing.

### Recommended Enhancements

1. **Database Integration** — Replace in-memory sessions with PostgreSQL/MongoDB
2. **Caching Layer** — Add Redis for embeddings and frequently accessed data
3. **Authentication** — Implement JWT or OAuth for multi-user scenarios
4. **Async Processing** — Use Celery for long-running analysis jobs
5. **Document History** — Persist uploads and analysis results
6. **Multi-language Support** — Extend to handle documents in multiple languages
7. **Advanced Analytics** — Export detailed reports (HTML, PDF, Excel)
8. **API Rate Limiting** — Protect backend from abuse

## Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'sentence_transformers'`
- **Solution:** Ensure dependencies are installed: `pip install -r requirements.txt`

**Problem:** Groq API errors
- **Solution:** Verify your API key in `.env` is correct and has quota remaining

**Problem:** FAISS indexing fails on large documents
- **Solution:** Reduce chunk size or increase available RAM

**Problem:** Slow first request
- **Solution:** This is normal—the embedding model takes time to load. Subsequent requests are faster.

### Frontend Issues

**Problem:** API requests fail with 403/CORS error
- **Solution:** Ensure backend is running on port 8000 and Vite proxy is configured

**Problem:** Blank page or white screen
- **Solution:** Check browser console for errors; verify `VITE_API_BASE_URL` is set correctly

**Problem:** Charts not rendering
- **Solution:** Verify backend returned risk data; check Recharts version compatibility

## Contributing

Pull requests welcome! Areas of contribution:
- Enhanced risk detection algorithms
- Multi-language support
- Improved UI/UX
- Performance optimizations
- Database integration
- Test suite expansion

## License

This project is provided as-is for educational and commercial use.

## Support & Contact

For issues, feature requests, or questions, open a GitHub issue or contact the maintainer.

---

**Built with ❤️ for legal professionals seeking smarter document intelligence**
