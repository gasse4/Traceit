# TraceIt – Project Plan (خطة المشروع)
> Version 1.0  |  Oct 17, 2026
> Source of truth: TraceIt project.pdf (project plan & technical proposal)
> Status: PLAN ONLY – no code has been written yet. Consult this plan before every action.

---

## 0. Directives للماليل (Agent Directives)
These rules override any ad-hoc decision while working on TraceIt:

1. **No action without checking the requirements + this plan.** Before creating, editing, or deleting any file, re-read § 2 (Goals), § 3 (Scope), § 5 (Tech Stack), § 6 (DB), § 7 (Algorithms), § 8 (Architecture), § 11 (Implementation Plan).
2. **This file is the reference.** `PLAN.md` (this file) governs architecture and decisions. `DESIGN.md` governs UI/visual decisions. Do not contradict either.
3. **Never override or clobber existing code when a conflict/bug appears.** Apply the smallest targeted fix consistent with the plan; preserve user work. If a bug cannot be fixed minimally, ask the user first.
4. **Clean as you go.** Remove unused imports, dead code, leftover logs, and stray files; keep the codebase minimal and readable.
5. **No deprecated packages.** Before importing a dependency, verify it is actively maintained and current (research with `websearch`/`grep` if uncertain). Prefer the maintained branch given in § 5.
6. **Keep the two academic algorithms implemented by hand and traceable** – `Linear Search` (text) and `pHash + Hamming Distance` (images). Do not replace them with AI/ML or library "magic" search.
7. **Never claim a match is a certainty.** Always surface the "verification of ownership must be done manually" notice.
8. **MVP only.** Do not add auth, real-time notifications, cloud storage, native mobile, or CI beyond what § 3.2 excludes.
9. **Hebrew-free/RTL ready.** UI must follow `DESIGN.md` (Inter + Readex Pro/Cairo Arabic fallback, logical CSS properties, RTL support).
10. **Test end-to-end before declaring done.** Follow § 12 test cases.

---

## 1. Project Identity
- **Name:** TraceIt — "Find What Matters" / "نظام ذكي للبحث عن المفقودات داخل الحرم الجامعي"
- **Purpose:** Simple intelligent system helping university students search for lost items (earphones, keys, bags, wallets) inside the university campus.
- **Approach:** Combine text search with visual image comparison for an effective search experience.
- **Academic goal:** Implement two clear, explainable algorithms — `Linear Search` for text and `Hamming Distance` for visual comparison — with a React frontend and a simple Python backend.
- **MVP Version:** 1.0
- **Languages:** UI bilingual (Arabic primary/RTL + English), code/comments in English (Arabic marks allowed in UI and markdown).

---

## 2. Goals & Objectives
1. Build a working local-first MVP in accordance with the PDF.
2. Provide a text search (`name`, `description`, `location`, `color`) matching using `Linear Search`.
3. Provide an image search comparing a user-supplied image against registered reports using `pHash + Hamming Distance`.
4. Allow users to report an item as **lost** or **found** with optional image upload.
5. Display results with similarity percentages when searching by image.
6. Clearly communicate that matches are *probable* and ownership is verified **manually** before handover.
7. Keep code simple, well-commented, runnable locally without internet dependency.

---

## 3. Scope
### 3.1 In Scope (MVP — must have)
- Report an item as lost (إبلاغ عن مفقود) with fields: name, description, location, color, optional image
- Report an item as found (إبلاغ عن موجود) with the same fields
- Text search by name / description / location / color via `Linear Search`
- Image search by uploading an image, computing its `pHash`, comparing against stored report images via `Hamming Distance`
- Show results with similarity % for image search
- Disclaimer: results are probable, manual verification required

### 3.2 Out of Scope (MVP — must not add)
- Authentication / authorization / user accounts
- Real-time push notifications
- Cloud storage for images
- AI/ML heavy models (object detection, face recognition)
- Advanced filters, pagination beyond simple lists
- Native mobile app (web responsive is fine)
- Payment, messaging, claim workflows with audit beyond UI notice

---

## 4. Requirements

### 4.1 Functional Requirements (FR)
- **FR1:** System allows adding a new "lost" report.
- **FR2:** System allows adding a new "found" report.
- **FR3:** On image upload, `pHash` is computed and stored with the report.
- **FR4:** Text search is implemented with `Linear Search` over all reports.
- **FR5:** On an image search upload, `pHash` is computed and compared to all stored image hashes.
- **FR6:** Similarity is computed from `Hamming Distance`.
- **FR7:** Results are returned with similarity information when applicable, sorted descending by similarity.

### 4.2 Non-Functional Requirements (NFR)
- **NFR1:** Simple, easy to explain academically.
- **NFR2:** Runs fully locally (frontend + backend + database) without internet (except for installs).
- **NFR3:** Clean, responsive UI.
- **NFR4:** Clear, organized, well-commented code.
- **NFR5:** Directly runnable via Flask + React.

---

## 5. Tech Stack (from PDF)
| Layer | Technology | Notes |
|---|---|---|
| Frontend | React.js (Vite recommended) | UI, image upload, results rendering |
| Backend / API | Python + Flask | REST API, runs algorithms, returns data |
| Image Processing | Pillow + ImageHash | Read images, compute pHash |
| Database | SQLite | Store reports, image paths, pHash values |
| Text Search | Linear Search (manual) | O(n) scan over reports |
| Image Matching | pHash + Hamming Distance | Lightweight, fast, academic-friendly |

### 5.1 Dependencies
Backend (`backend/requirements.txt`):
- `Flask` (current stable 3.x)
- `flask-cors`
- `Pillow`
- `ImageHash`
- `numpy` (only if needed)

Frontend:
- Vite + React
- `react-router-dom`
- `axios` (or native `fetch`)
- Tailwind CSS (recommended, aligned with `DESIGN.md` tokens) — or plain CSS with the tokens

> Always use current, non-deprecated APIs. Flask 3.x patterns, React 18+ function components + hooks, Vite 5+.

---

## 6. Database Schema
Single table `reports` to keep the MVP simple.

| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER (PK, AUTOINCREMENT) | Unique report id |
| `type` | TEXT | `lost` or `found` |
| `name` | TEXT | Short label (e.g., "سماعة أذن") |
| `description` | TEXT | Detailed description |
| `location` | TEXT | Where it was lost/found |
| `color` | TEXT | Item color |
| `image_path` | TEXT (nullable) | Relative path under `uploads/` |
| `image_phash` | TEXT (nullable) | String form of `pHash` |
| `status` | TEXT (DEFAULT `'active'`) | `active` / `resolved` |
| `created_at` | DATETIME (DEFAULT CURRENT_TIMESTAMP) | Report creation timestamp |

Notes:
- Unified single table (avoid joins).
- `image_phash` may be NULL if no image was provided.
- Search only considers `status = 'active'`.

---

## 7. Algorithms

### 7.1 Linear Search (text)
**Goal:** partial string match (contains, case-insensitive) on `name`, `description`, `location`, `color`.

Steps:
1. Receive all active reports from DB.
2. Normalize query to lowercase, trim.
3. Loop through each report; test each of the four fields.
4. If any field contains the query, append to results.
5. Return results.

Time: `O(n)` where n = number of reports. Space: `O(k)` (matches).

Conceptual code (reference):
```python
def linear_search(reports, search_query):
    results = []
    q = (search_query or "").lower().strip()
    if not q:
        return []
    for report in reports:
        if (q in report["name"].lower() or
            q in report["description"].lower() or
            q in report["location"].lower() or
            q in report["color"].lower()):
            results.append(report)
    return results
```

### 7.2 pHash + Hamming Distance (image)
**Goal:** find visually closest registered images.

Steps:
1. On **report creation** with image: open via Pillow, compute `imagehash.phash(image)`, store as `str` in `image_phash`.
2. On **image search**: receive image, compute its pHash.
3. Compare query pHash against every stored (non-null) report pHash using `Hamming Distance` (number of differing bits).
4. `similarity = 100 - (distance / hash_length * 100)` — pHash length is 64 bits.
5. Return results sorted descending by similarity; recommend a display threshold scheme:
   - High confidence ≥ 85% → emerald
   - Medium (50–84%) → amber
   - Low (< 50%) or unscored → slate

`Hamming Distance` definition: number of bit positions at which two hashes of equal length differ.

Reference:
```
Image A: 101101001101
Image B: 101101001001
Hamming Distance = 1   → similarity ≈ 91.67%
```

Important notes:
- pHash is somewhat sensitive to lighting/angle; expected in this MVP and presented as an *observation* in the academic write-up.
- Similarity is an estimate, not a confirmation.
- Always show the "manual verification" notice.

---

## 8. Project Architecture (from PDF)
```text
TraceIt/
├── frontend/
│   └── src/
│       ├── App.jsx              # UI, forms, search, results
│       └── api.js               # Backend communication
│
└── backend/
    ├── app.py                   # Flask API entry point
    ├── algorithms.py            # Linear Search + Hamming Distance
    ├── database.py              # CRUD over SQLite
    ├── uploads/                 # Local storage for report images
    └── requirements.txt         # Python dependencies
```

### 8.1 Backend files' responsibilities
| File | Purpose | Key duties |
|---|---|---|
| `app.py` | API entry point | Routes, request handling, orchestrate algorithms + db, return JSON |
| `algorithms.py` | Algorithm logic | `linear_search()`, `calculate_phash()`, `hamming_distance()`, `calculate_similarity()` |
| `database.py` | DB layer | Create tables, add report, get all active reports, get by id |
| `uploads/` | Image folder | Store report images, temp search images |
| `requirements.txt` | Dependencies | Flask, flask-cors, Pillow, ImageHash |

### 8.2 Frontend files' responsibilities
| File | Purpose | Key duties |
|---|---|---|
| `App.jsx` + screens | UI | Home, ReportLost, ReportFound, Search (text/image tabs), Results |
| `api.js` | API layer | `submitLost()`, `submitFound()`, `searchText()`, `searchImage()` via axios/fetch |

> Structure must match the PDF exactly. Extra helper modules are allowed only when clearly justified by the plan.

---

## 9. UI / UX Plan (DESIGN.md governs visuals)
Pages (Arabic primary UI, RTL-ready, supports English):

| Page | Description | UI elements |
|---|---|---|
| Home | Welcome landing | Title, buttons: "إبلاغ عن مفقود", "إبلاغ عن موجود", "البحث" |
| ReportLost | lost report form | name, description, location, color, optional image, submit |
| ReportFound | found report form | same fields, submit |
| Search | Search hub with tabs | "بحث نصي" and "بحث بالصور" |
| TextSearchResults | text results | list of cards |
| ImageSearchResults | image results | list of cards + similarity % |

UI guidelines (from `DESIGN.md`):
- Headline sizes above; semantic color tokens; royal blue primary, cobalt secondary, emerald (≥85%), amber (50–84%), slate (<50%).
- Cards: white surface, 1px `#e2e8f0` border, `rounded-lg` (16px), subtle shadow.
- Match badge: pill, tabular numerals, color by threshold.
- Display the manual-verification disclaimer prominently above results.
- Logical CSS properties for RTL; breakpoints at <768 / 768-1279 / ≥1280.

---

## 10. API Design
Base URL: `http://localhost:5000` (Flask dev, `FLASK_RUN_PORT` adjustable).

| Method | Endpoint | Description | Body/Params |
|---|---|---|---|
| GET | `/` or `/health` | Health check | — |
| POST | `/api/report/lost` | Add a lost report | form-data: name, description, location, color, image(optional) |
| POST | `/api/report/found` | Add a found report | same |
| GET | `/api/reports` | List active reports (diagnostic/view) | — |
| GET | `/api/search/text` | Text search | `?q=...` |
| POST | `/api/search/image` | Image search | form-data: image |

Example — text search response:
```json
{
  "results": [
    { "id": 1, "type": "found", "name": "سماعة أذن",
      "description": "سماعة بيضاء صغيرة", "location": "مكتبة الكلية",
      "color": "أبيض", "image_path": "/uploads/found_1.jpg" }
  ],
  "count": 1
}
```

Example — image search response:
```json
{
  "query_phash": "...",
  "results": [
    { "id": 2, "type": "lost", "name": "سماعة أذن", "...": "...",
      "similarity": 92.5, "hamming_distance": 5 }
  ]
}
```

Conventions: CORS enabled for the Vite dev origin; consistent JSON error shape `{ "error": "..." }`; HTTP status codes (200, 201, 400, 404, 500).

---

## 11. Implementation Plan (step-by-step, with checkboxes)
### Phase 1 — Setup & Structure (Day 1)
- [ ] Create `/home/gasser/Documents/Traceit` tree per § 8: `frontend/`, `backend/`, `backend/uploads/`.
- [ ] Create `backend/requirements.txt` (Flask 3.x, Flask-Cors, Pillow, ImageHash).
- [ ] Set up Python venv in `backend/.venv`.
- [ ] Init React project in `frontend/` via Vite (react template).

### Phase 2 — Database + Algorithms (Day 1–2)
- [ ] `database.py`: `init_db()`, `add_report()`, `get_all_active_reports()`, `get_report_by_id()` (optional but useful).
- [ ] `algorithms.py`: `linear_search()`, `calculate_phash()`, `hamming_distance()`, `calculate_similarity()`.
- [ ] Smoke test: compute pHash on a sample image; compute Hamming distance between two images.

### Phase 3 — Backend API (Day 2)
- [ ] `app.py`: Flask + CORS, auto-create `uploads/`, routes for report lost/found, search text/image, list reports.
- [ ] Test endpoints with curl or Postman.
- [ ] Image handling: validate ext (jpg/jpeg/png), store with a unique (uuid/timestamp) name.

### Phase 4 — Frontend UI (Day 2–3)
- [ ] `api.js`: configure base URL and functions.
- [ ] `App.jsx`: router + pages; Navbar.
- [ ] Build Home, ReportLost, ReportFound, Search tabs, results screens.
- [ ] Connect forms to API; render disclaimer.

### Phase 5 — Testing & Cleanup (Day 3)
- [ ] End-to-end scenario tests (§ 12).
- [ ] Verify image storage & pHash computation.
- [ ] Remove console.log, unused imports; comment clearly.
- [ ] Double-check algorithm transparency (linear scan; bit comparison loop, not a black-box).

### Phase 6 — Final Packaging (Day 3–4)
- [ ] Write `README.md` (Arabic) with idea, tech, algorithms short explainer, run steps, structure, screenshots.
- [ ] Final clean run from scratch.

---

## 12. Test Cases
| # | Test | Expected |
|---|---|---|
| 1 | Add lost report w/o image | Saved; appears in text search |
| 2 | Add report w/ image | Image saved, pHash computed & stored |
| 3 | Text search exact match | Matching report returned |
| 4 | Text search partial match | Partially matching reports returned |
| 5 | Image search same item | High similarity (~100%) |
| 6 | Image search different item | Low/divergent similarity |
| 7 | Search no results | Empty results, no errors |
| 8 | File safety | Unsafe names rejected; stored with safe unique name |
| 9 | Linear Search worst case | Iterates all reports deterministically |
| 10 | Disclaimer shown | Notice visible on results views |

---

## 13. Immediate Next Steps (when approved)
1. Create the `TraceIt` folder tree.
2. Build backend: `database.py` → `algorithms.py` → `app.py`, in that order.
3. Introduce `requirements.txt` and a local venv (do not commit `.venv` to git if any).
4. Build frontend with Vite after backend smoke-test.
5. Verify each step against § 5–§ 8 before proceeding.

**Are you ready to begin implementing?** Confirmations needed:
- Frontend styling approach: Tailwind + the tokens from `DESIGN.md`, or plain CSS?
- Python/Node tooling versions available on this machine (`python3 --version`, `node --version`).
- Should I also create a `.gitignore` (venv, node_modules, uploads, *.db)?

---

## 14. Risks & Mitigations
| Risk | Impact | Prob | Mitigation |
|---|---|---|---|
| Large image uploads | Medium | Medium | Use non-resized originals for MVP; Pillow handles gracefully |
| Unsupported extension | Low | Low | Validate allowed ext: `.jpg`, `.jpeg`, `.png` |
| pHash mismatch due to angle/lighting | Medium | Medium | Expected; discuss in academic write-up as observation |
| Wrong image path URL | Low | Low | Build relative URL consistently; serve `uploads/` via Flask `send_from_directory` |
| File name collisions | Low | Low | Use UUID/timestamp in stored filename |
| Deprecated APIs | Low | Low | Verify versions; avoid Flask 2-only patterns |

---

## 15. Success Criteria
- [ ] Text search works via `Linear Search`.
- [ ] Image search works via `pHash + Hamming Distance`.
- [ ] Lost/found reports addable with/without image.
- [ ] Similarity % displayed on image-search results.
- [ ] Manual-verification disclaimer shown.
- [ ] Code is clear, readable, well-commented, and explainable.
- [ ] Structure matches the PDF layout.
- [ ] Runs locally end-to-end without errors.

---

## 16. Verification Checklist Before Any Code Change
Before any new edit, anwer these (internally):
- [ ] Is it in scope (§ 3.1)? Not in excluded (§ 3.2)?
- [ ] Tech matches § 5?
- [ ] DB changes respect § 6 schema?
- [ ] Algorithm changes respect § 7 (manual, transparent)?
- [ ] File placement matches § 8?
- [ ] UI matches `DESIGN.md` + § 9?
- [ ] Will not leave orphans/deprecated code?
- [ ] After change, run § 12 tests + cleanup (Directive 4).
