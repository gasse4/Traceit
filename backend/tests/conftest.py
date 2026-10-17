"""Shared test setup: every test gets its own empty database and upload folder."""

import io
import os
import sys
import tempfile

import pytest
from PIL import Image, ImageDraw

# Point the app at a throwaway uploads folder *before* it is imported.
UPLOADS = tempfile.mkdtemp(prefix="traceit-uploads-")
os.environ["TRACEIT_UPLOADS"] = UPLOADS
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import database  # noqa: E402
from app import app  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(database, "DB_PATH", str(tmp_path / "test.db"))
    for name in os.listdir(UPLOADS):
        os.remove(os.path.join(UPLOADS, name))
    with TestClient(app) as c:  # runs startup -> init_db()
        yield c


@pytest.fixture
def uploads():
    return UPLOADS


# ---------- Sample images ----------

def circle(size=200):
    im = Image.new("RGB", (size, size), "white")
    ImageDraw.Draw(im).ellipse((size * 0.2, size * 0.2, size * 0.8, size * 0.8), fill="black")
    return im


def stripes():
    im = Image.new("RGB", (200, 200), "white")
    d = ImageDraw.Draw(im)
    for i in range(0, 200, 20):
        d.rectangle((i, 0, i + 10, 200), fill="blue")
    return im


def gradient():
    im = Image.new("RGB", (256, 128))
    im.putdata([(x, y * 2, (x + y) % 256) for y in range(128) for x in range(256)])
    return im


def to_bytes(img, fmt="PNG", **save_args):
    buf = io.BytesIO()
    img.save(buf, fmt, **save_args)
    return buf.getvalue()
