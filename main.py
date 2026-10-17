"""Repository-level entry point for platforms that run FastAPI from the root."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "backend"))

from app import app

__all__ = ["app"]
