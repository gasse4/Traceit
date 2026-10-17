# TraceIt — Find What Matters

نظام ذكي للبحث عن المفقودات داخل الحرم الجامعي.

## Idea
TraceIt helps students report and search for lost/found items on campus using
text search (Linear Search) and image comparison (pHash + Hamming Distance).

## Tech Stack
- Frontend: React.js (Vite)
- Backend: Python + FastAPI (served by Uvicorn)
- Image processing: Pillow + NumPy (pHash implemented by hand, no ImageHash/SciPy)
- Database: SQLite
- Algorithms: Linear Search, pHash + Hamming Distance

## How it works
- Report an item as `lost` or `found` (optional image).
- Text search scans all reports one-by-one with `Linear Search`.
- Image search computes a `pHash` of the uploaded image and compares it to stored
  hashes using `Hamming Distance`, returning a similarity percentage.
- Results are **probable**. Ownership must be verified manually before handover.

## Run locally

### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Backend runs on http://localhost:5000 — interactive API docs at http://localhost:5000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

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
    ├── algorithms.py
    ├── database.py
    ├── uploads/
    └── requirements.txt
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
- pHash depends on lighting and capture angle; observed and explained in the academic write-up.
- This is an MVP (no auth, no cloud storage, no AI models).