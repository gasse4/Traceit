"""FastAPI entry point for TraceIt.

Run:  python app.py            (dev, auto-reload)
      uvicorn app:app          (any ASGI server)
Docs: http://localhost:5000/docs
"""

import io
import os
import uuid
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image, ImageOps, UnidentifiedImageError
from starlette.exceptions import HTTPException as StarletteHTTPException

from algorithms import calculate_phash, image_search, linear_search
from database import add_report, get_active_reports, get_stats, init_db

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.environ.get("TRACEIT_UPLOADS", os.path.join(BASE_DIR, "uploads"))
MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB
MAX_IMAGE_PIXELS = 60_000_000  # ~60 MP: real photos pass, decompression bombs do not
THUMB_SIZE = (600, 600)  # cards load this small copy, not the original
ALLOWED_FORMATS = {"JPEG": "jpg", "PNG": "png"}  # Pillow format -> file extension
CORS_ORIGINS = os.environ.get("TRACEIT_CORS_ORIGINS", "*").split(",")
DISCLAIMER = "Results are probable only. Verify ownership manually before handover."

os.makedirs(UPLOAD_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(_app):
    init_db()
    yield


app = FastAPI(title="TraceIt API", version="1.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_methods=["*"], allow_headers=["*"])
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ---------- Errors: always answer with { "error": "..." } ----------

# Starlette's base class also covers framework errors such as unknown routes (404).
@app.exception_handler(StarletteHTTPException)
async def http_error(_request: Request, exc: StarletteHTTPException):
    return JSONResponse({"error": exc.detail}, status_code=exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_error(_request: Request, exc: RequestValidationError):
    fields = ", ".join(str(e["loc"][-1]) for e in exc.errors())
    return JSONResponse({"error": f"invalid or missing field(s): {fields}"}, status_code=400)


# ---------- Helpers ----------

def read_image(upload: UploadFile):
    """Read an upload, check size and real file type.

    Returns (raw bytes, upright PIL image, file extension).
    """
    data = upload.file.read(MAX_IMAGE_BYTES + 1)
    if not data:
        raise HTTPException(400, "image file is empty")
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(413, "image is larger than 10 MB")
    try:
        img = Image.open(io.BytesIO(data))  # reads the header only
        fmt = img.format
        if fmt not in ALLOWED_FORMATS:
            raise HTTPException(400, "only JPG and PNG images are supported")
        if img.width * img.height > MAX_IMAGE_PIXELS:
            raise HTTPException(400, "image dimensions are too large")
        img.load()  # decode now so corrupt/truncated files fail here, not later
        # Phone photos store rotation in EXIF; apply it so hash and display are upright.
        img = ImageOps.exif_transpose(img)
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError, SyntaxError):
        raise HTTPException(400, "file is not a valid image")
    return data, img, ALLOWED_FORMATS[fmt]


def thumb_path_for(image_path):
    """found_x.png -> found_x_thumb.jpg (works for file names and URL paths)."""
    return os.path.splitext(image_path)[0] + "_thumb.jpg"


def save_thumbnail(img, path):
    """Save a small JPEG copy; transparent areas become white."""
    thumb = img.copy()
    thumb.thumbnail(THUMB_SIZE)
    if thumb.mode in ("RGBA", "LA", "P"):
        thumb = thumb.convert("RGBA")
        background = Image.new("RGB", thumb.size, "white")
        background.paste(thumb, mask=thumb.getchannel("A"))
        thumb = background
    thumb.convert("RGB").save(path, "JPEG", quality=80, optimize=True)


def public(report):
    """Drop internal fields and add the thumbnail URL before sending a report."""
    out = {k: v for k, v in report.items() if k != "image_phash"}
    out["thumb_path"] = thumb_path_for(out["image_path"]) if out["image_path"] else None
    return out


# ---------- Routes ----------
# Routes are plain `def`: FastAPI runs them in a worker thread pool, so blocking
# SQLite and Pillow work never stalls the event loop.

@app.get("/")
@app.get("/health")
def health():
    return {"status": "ok"}


def create_report(report_type, name, description, location, color, image):
    fields = {
        "name": name.strip(),
        "description": description.strip(),
        "location": location.strip(),
        "color": color.strip(),
    }
    missing = [k for k, v in fields.items() if not v]
    if missing:
        raise HTTPException(400, f"required field(s): {', '.join(missing)}")

    image_path = image_phash = None
    if image and image.filename:
        data, img, ext = read_image(image)
        image_phash = calculate_phash(img)
        # Name comes from a UUID, never from the user's filename.
        file_name = f"{report_type}_{uuid.uuid4().hex}.{ext}"
        with open(os.path.join(UPLOAD_DIR, file_name), "wb") as f:
            f.write(data)
        save_thumbnail(img, os.path.join(UPLOAD_DIR, thumb_path_for(file_name)))
        image_path = f"uploads/{file_name}"  # URL path, served by the /uploads mount

    new_id = add_report({"type": report_type, **fields, "image_path": image_path, "image_phash": image_phash})
    return {"id": new_id, "message": "report created"}


@app.post("/api/report/{report_type}", status_code=201)
def report(
    report_type: str,
    name: Annotated[str, Form()],
    description: Annotated[str, Form()] = "",
    location: Annotated[str, Form()] = "",
    color: Annotated[str, Form()] = "",
    image: Annotated[UploadFile | None, File()] = None,
):
    """Add a `lost` or `found` report (multipart form, image optional)."""
    if report_type not in ("lost", "found"):
        raise HTTPException(404, "report type must be 'lost' or 'found'")
    return create_report(report_type, name, description, location, color, image)


@app.get("/api/reports")
def list_reports():
    results = [public(r) for r in get_active_reports()]
    return {"results": results, "count": len(results)}


@app.get("/api/stats")
def stats():
    return get_stats()


@app.get("/api/search/text")
def search_text(q: str = ""):
    results = [public(r) for r in linear_search(get_active_reports(), q)]
    return {"query": q, "results": results, "count": len(results), "disclaimer": DISCLAIMER}


@app.post("/api/search/image")
def search_image(image: Annotated[UploadFile, File()]):
    # The query image is hashed in memory and never written to disk.
    _, img, _ = read_image(image)
    query_hash = calculate_phash(img)
    reports = get_active_reports(with_image_only=True)  # rows without a hash can't match
    results = [public(r) for r in image_search(reports, query_hash)]
    return {"query_phash": query_hash, "results": results, "count": len(results), "disclaimer": DISCLAIMER}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), reload=True)
