# TraceIt — Find What Matters

نظام ذكي للبحث عن المفقودات داخل الحرم الجامعي.

## Idea
TraceIt helps students report and search for lost/found items on campus using
text search (Linear Search) and multi-signal image comparison.

## Tech Stack
- Frontend: React.js (Vite)
- Backend: Python + FastAPI (served by Uvicorn)
- Image processing: Pillow + NumPy (pHash/dHash implemented by hand) + OpenCV ORB
- Database: SQLite
- Algorithms: Linear Search, pHash, dHash, color signature, Hamming Distance, ORB

## How it works
- Report an item as `lost` or `found` (optional image).
- Text search scans all reports one-by-one with `Linear Search`.
- Image search combines `pHash` for overall structure, `dHash` for edges, a
  compact color signature, and OpenCV `ORB` local-feature matching.
- The final score is conservative: the hash signals provide the base score and
  ORB contributes when local features are available. It is a visual confidence
  score, not proof of ownership.
- Results are **probable**. Ownership must be verified manually before handover.

## Run locally

### 1. Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate             # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --host 127.0.0.1 --port 5000
```
Backend runs on http://localhost:5000 — interactive API docs at http://localhost:5000/docs

### 2. Frontend
Open a second terminal:

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```
Frontend runs on http://localhost:5173

Open http://localhost:5173/ in the browser.

### Start from an empty database

This removes reports and resets report IDs without changing the schema:

```bash
cd backend
python - <<'PY'
import sqlite3

with sqlite3.connect("traceit.db") as conn:
    conn.execute("DELETE FROM reports")
    conn.execute("DELETE FROM sqlite_sequence WHERE name = 'reports'")
PY
```

Uploaded image files are kept in `backend/uploads/`. Remove only the files in
that directory if you also want to clear stored images.

## Project structure
```
TraceIt/
├── frontend/
│   └── src/
│       ├── App.jsx          # layout + routes
│       ├── api.js           # all backend calls
│       ├── index.css        # design tokens (change the theme here)
│       ├── pages/           # Home, ReportForm, SearchPage
│       └── components/      # ReportCard, ImagePicker, Feedback, Icons
└── backend/
    ├── app.py
    ├── algorithms.py            # text search and image matching
    ├── database.py
    ├── uploads/
    └── requirements.txt         # includes OpenCV for ORB
```

## Tests
Both suites use a throwaway database and uploads folder — your real data is never touched.

```bash
# Backend: algorithms + every API endpoint (pytest)
cd backend
pip install -r requirements-dev.txt
python -m pytest -q

# Frontend: real browser (desktop + mobile) against the real backend (Playwright)
cd frontend
npx playwright install chromium   # first time only
npm run test:e2e
```

## Configuration
| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5000` | Backend port |
| `TRACEIT_DB` | `backend/traceit.db` | SQLite file path |
| `TRACEIT_CORS_ORIGINS` | `*` | Comma-separated allowed origins |
| `VITE_API_BASE` (frontend) | `http://localhost:5000` | Backend URL used by the UI |

## Notes
- ORB needs visible edges/keypoints; plain backgrounds or very smooth objects
  may produce few local matches.
- This is an MVP (no auth, no cloud storage, no ownership verification workflow).