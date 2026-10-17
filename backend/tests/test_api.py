"""End-to-end API tests (PLAN.md § 10 endpoints, § 12 test cases)."""

import io
import os
import sqlite3
from concurrent.futures import ThreadPoolExecutor

import pytest
from PIL import Image

import app as app_module
import database
from algorithms import calculate_phash
from conftest import circle, gradient, stripes, to_bytes

FIELDS = {"name": "سماعة أذن", "description": "سماعة بيضاء صغيرة", "location": "مكتبة الكلية", "color": "أبيض"}


def create(client, type_="lost", image=None, filename="photo.png", **overrides):
    data = {**FIELDS, **overrides}
    files = {"image": (filename, image, "image/png")} if image is not None else None
    return client.post(f"/api/report/{type_}", data=data, files=files)


def search_image(client, image, filename="q.png"):
    return client.post("/api/search/image", files={"image": (filename, image, "image/png")})


# ---------- Health & basics ----------

@pytest.mark.parametrize("path", ["/", "/health"])
def test_health(client, path):
    assert client.get(path).json() == {"status": "ok"}


def test_docs_available(client):
    assert client.get("/docs").status_code == 200


def test_cors_header(client):
    r = client.get("/api/stats", headers={"Origin": "http://localhost:5173"})
    assert r.headers["access-control-allow-origin"] == "*"


def test_cors_preflight_for_upload(client):
    r = client.options("/api/report/lost", headers={
        "Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST"})
    assert r.status_code == 200


def test_unknown_route_uses_error_shape(client):
    r = client.get("/api/nope")
    assert r.status_code == 404 and "error" in r.json()


# ---------- Creating reports (TC1, TC2, TC8) ----------

@pytest.mark.parametrize("type_", ["lost", "found"])
def test_create_without_image(client, type_):
    r = create(client, type_)
    assert r.status_code == 201
    assert r.json() == {"id": 1, "message": "report created"}

    [item] = client.get("/api/reports").json()["results"]
    assert item["type"] == type_
    assert item["name"] == FIELDS["name"]
    assert item["status"] == "active"
    assert item["image_path"] is None and item["thumb_path"] is None
    assert "image_phash" not in item  # internal field never leaves the server
    assert item["created_at"]


def test_values_are_trimmed(client):
    create(client, name="  pen  ", color=" red ")
    item = client.get("/api/reports").json()["results"][0]
    assert (item["name"], item["color"]) == ("pen", "red")


def test_unknown_report_type(client):
    r = create(client, "stolen")
    assert r.status_code == 404
    assert r.json() == {"error": "report type must be 'lost' or 'found'"}


def test_missing_name_field(client):
    r = client.post("/api/report/lost", data={"description": "x", "location": "x", "color": "x"})
    assert r.status_code == 400 and "name" in r.json()["error"]


def test_no_body(client):
    assert client.post("/api/report/lost").status_code == 400


@pytest.mark.parametrize("field", ["name", "description", "location", "color"])
def test_blank_required_field(client, field):
    r = create(client, **{field: "   "})
    assert r.status_code == 400
    assert field in r.json()["error"]
    assert client.get("/api/reports").json()["count"] == 0


def test_create_with_png_image(client, uploads):
    r = create(client, "found", to_bytes(circle(1200)))
    assert r.status_code == 201

    item = client.get("/api/reports").json()["results"][0]
    assert item["image_path"].startswith("uploads/found_") and item["image_path"].endswith(".png")
    assert item["thumb_path"] == item["image_path"][:-4] + "_thumb.jpg"

    # Original and thumbnail exist on disk and are served over HTTP.
    assert sorted(os.listdir(uploads)) == sorted(os.path.basename(p) for p in (item["image_path"], item["thumb_path"]))
    original = client.get("/" + item["image_path"])
    thumb = client.get("/" + item["thumb_path"])
    assert original.status_code == thumb.status_code == 200
    assert original.content == to_bytes(circle(1200))
    t = Image.open(io.BytesIO(thumb.content))
    assert t.format == "JPEG" and max(t.size) == 600
    assert len(thumb.content) < len(original.content)

    # pHash was stored.
    with sqlite3.connect(database.DB_PATH) as conn:
        (phash,) = conn.execute("SELECT image_phash FROM reports").fetchone()
    assert phash == calculate_phash(circle(1200))


def test_create_with_jpeg_image(client):
    r = create(client, "lost", to_bytes(gradient(), "JPEG"), filename="p.jpeg")
    assert r.status_code == 201
    assert client.get("/api/reports").json()["results"][0]["image_path"].endswith(".jpg")


def test_small_image_thumbnail_not_upscaled(client):
    create(client, image=to_bytes(circle(100)))
    item = client.get("/api/reports").json()["results"][0]
    assert Image.open(io.BytesIO(client.get("/" + item["thumb_path"]).content)).size == (100, 100)


def test_extension_comes_from_content_not_filename(client):
    # A real JPEG uploaded as "photo.png" is stored as .jpg.
    create(client, image=to_bytes(gradient(), "JPEG"), filename="photo.png")
    assert client.get("/api/reports").json()["results"][0]["image_path"].endswith(".jpg")


def test_unsafe_filename_is_ignored(client, uploads):
    r = create(client, image=to_bytes(circle()), filename="../../../etc/evil.png")
    assert r.status_code == 201
    names = os.listdir(uploads)
    assert len(names) == 2 and all(n.startswith("lost_") for n in names)
    assert "evil" not in client.get("/api/reports").json()["results"][0]["image_path"]


def test_exif_rotated_photo_thumbnail_is_upright(client):
    img = Image.new("RGB", (400, 200), "white")
    exif = img.getexif()
    exif[0x0112] = 6  # "rotate 90° clockwise to display"
    create(client, image=to_bytes(img, "JPEG", exif=exif))
    item = client.get("/api/reports").json()["results"][0]
    assert Image.open(io.BytesIO(client.get("/" + item["thumb_path"]).content)).size == (200, 400)


def test_transparent_png_thumbnail_has_white_background(client):
    img = Image.new("RGBA", (50, 50), (0, 0, 0, 0))
    create(client, image=to_bytes(img))
    item = client.get("/api/reports").json()["results"][0]
    thumb = Image.open(io.BytesIO(client.get("/" + item["thumb_path"]).content)).convert("RGB")
    assert all(c > 240 for c in thumb.getpixel((0, 0)))


@pytest.mark.parametrize("mode", ["L", "LA", "P", "1", "I;16", "RGBA", "CMYK"])
def test_unusual_image_modes(client, mode):
    fmt = "JPEG" if mode == "CMYK" else "PNG"
    assert create(client, image=to_bytes(gradient().convert(mode), fmt)).status_code == 201


@pytest.mark.parametrize("payload, error", [
    (b"", "image file is empty"),
    (b"definitely not an image", "file is not a valid image"),
    (to_bytes(circle())[:300], "file is not a valid image"),               # truncated PNG
    (to_bytes(circle(), "GIF"), "only JPG and PNG images are supported"),
    (to_bytes(circle(), "WEBP"), "only JPG and PNG images are supported"),
    (to_bytes(circle(), "BMP"), "only JPG and PNG images are supported"),
    (to_bytes(Image.new("L", (10000, 7000))), "image dimensions are too large"),  # tiny file, huge pixels
])
def test_bad_images_rejected_cleanly(client, uploads, payload, error):
    r = create(client, image=payload)
    assert r.status_code == 400
    assert r.json() == {"error": error}
    assert os.listdir(uploads) == []
    assert client.get("/api/reports").json()["count"] == 0  # nothing half-saved


def test_image_over_10mb_rejected(client):
    r = create(client, image=b"\x89PNG" + b"0" * (10 * 1024 * 1024))
    assert r.status_code == 413
    assert r.json() == {"error": "image is larger than 10 MB"}


def test_image_exactly_at_limit_is_size_ok(client, monkeypatch):
    monkeypatch.setattr(app_module, "MAX_IMAGE_BYTES", len(to_bytes(circle())))
    assert create(client, image=to_bytes(circle())).status_code == 201


def test_concurrent_creates(client):
    with ThreadPoolExecutor(8) as pool:
        results = list(pool.map(lambda i: create(client, name=f"item {i}"), range(40)))
    assert all(r.status_code == 201 for r in results)
    assert len({r.json()["id"] for r in results}) == 40
    assert client.get("/api/reports").json()["count"] == 40


# ---------- Listing & stats ----------

def test_list_newest_first(client):
    for n in ("a", "b", "c"):
        create(client, name=n)
    assert [r["name"] for r in client.get("/api/reports").json()["results"]] == ["c", "b", "a"]


def test_stats(client):
    assert client.get("/api/stats").json() == {"total_reports": 0, "lost_reports": 0, "found_reports": 0, "with_image": 0}
    create(client, "lost")
    create(client, "lost", to_bytes(circle()))
    create(client, "found", to_bytes(stripes()))
    assert client.get("/api/stats").json() == {"total_reports": 3, "lost_reports": 2, "found_reports": 1, "with_image": 2}


def set_resolved(report_id):
    with sqlite3.connect(database.DB_PATH) as conn:
        conn.execute("UPDATE reports SET status = 'resolved' WHERE id = ?", (report_id,))


def test_resolved_reports_hidden_everywhere(client):
    create(client, name="keys", image=to_bytes(circle()))
    set_resolved(1)
    assert client.get("/api/reports").json()["count"] == 0
    assert client.get("/api/stats").json()["total_reports"] == 0
    assert client.get("/api/search/text", params={"q": "keys"}).json()["count"] == 0
    assert search_image(client, to_bytes(circle())).json()["count"] == 0


# ---------- Text search (TC3, TC4, TC7, TC10) ----------

def test_text_search(client):
    create(client, name="سماعة أذن", description="بيضاء", location="مكتبة الكلية", color="أبيض")
    create(client, "found", name="Black Keys", description="car keys", location="Engineering", color="black")

    def ids(q):
        return [r["id"] for r in client.get("/api/search/text", params={"q": q}).json()["results"]]

    assert ids("سماعة أذن") == [1]   # exact
    assert ids("سماعه") == [1]       # common Arabic spelling variant
    assert ids("مكتب") == [1]        # partial
    assert ids("KEYS") == [2]        # case-insensitive
    assert ids("e") == [2]           # 'e' only in English report
    assert ids("zzz") == []          # no results


def test_text_search_response_shape(client):
    create(client, name="pen")
    body = client.get("/api/search/text", params={"q": "pen"}).json()
    assert body["query"] == "pen" and body["count"] == 1
    assert "manually" in body["disclaimer"]
    assert "image_phash" not in body["results"][0]


@pytest.mark.parametrize("params", [{}, {"q": ""}, {"q": "   "}])
def test_text_search_empty_query(client, params):
    create(client)
    r = client.get("/api/search/text", params=params)
    assert r.status_code == 200 and r.json()["count"] == 0


def test_text_search_special_characters(client):
    create(client, name="100% cotton bag_1")
    for q in ("%", "_", "100%", "'", '"', "؟"):
        assert client.get("/api/search/text", params={"q": q}).status_code == 200
    assert client.get("/api/search/text", params={"q": "%"}).json()["count"] == 1


# ---------- Image search (TC5, TC6, TC10) ----------

def test_image_search_ranks_same_item_first(client):
    create(client, "found", to_bytes(circle()), name="circle")
    create(client, "found", to_bytes(stripes()), name="stripes")
    create(client, "lost", name="no image")

    # Same object, different size and JPEG compression.
    query = to_bytes(circle(500).resize((180, 180)), "JPEG", quality=70)
    body = search_image(client, query, "q.jpg").json()

    assert body["query_phash"] and len(body["query_phash"]) == 16
    assert [r["name"] for r in body["results"]] == ["circle", "stripes"]   # no-image report excluded
    best, other = body["results"]
    assert best["similarity"] >= 90
    assert other["similarity"] < 60
    assert best["similarity"] == round(100 - best["hamming_distance"] / 64 * 100, 2)
    assert "manually" in body["disclaimer"]
    assert "image_phash" not in best
    assert best["thumb_path"].endswith("_thumb.jpg")


def test_image_search_identical_image_is_100(client):
    create(client, image=to_bytes(gradient()))
    assert search_image(client, to_bytes(gradient())).json()["results"][0]["similarity"] == 100.0


def test_image_search_no_images_stored(client):
    create(client)
    body = search_image(client, to_bytes(circle())).json()
    assert body["count"] == 0 and body["results"] == []


def test_image_search_does_not_store_query(client, uploads):
    search_image(client, to_bytes(circle()))
    assert os.listdir(uploads) == []


def test_image_search_requires_image(client):
    r = client.post("/api/search/image")
    assert r.status_code == 400 and "image" in r.json()["error"]


@pytest.mark.parametrize("payload", [b"", b"nope", to_bytes(circle(), "GIF")])
def test_image_search_bad_image(client, payload):
    r = search_image(client, payload)
    assert r.status_code == 400 and "error" in r.json()


# ---------- Static files ----------

@pytest.mark.parametrize("path", ["/uploads/../app.py", "/uploads/%2e%2e/app.py", "/uploads/missing.png"])
def test_uploads_cannot_escape_or_404(client, path):
    r = client.get(path)
    assert r.status_code == 404
    assert b"FastAPI" not in r.content
