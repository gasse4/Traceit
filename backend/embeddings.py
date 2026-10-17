"""Lazy CLIP image embeddings for instance-level visual matching."""

import io
import os
from functools import lru_cache

import numpy as np

MODEL_NAME = os.environ.get("TRACEIT_CLIP_MODEL", "openai/clip-vit-base-patch32")


@lru_cache(maxsize=1)
def _model():
    try:
        from transformers import CLIPModel, CLIPProcessor
    except ImportError as exc:
        raise RuntimeError(
            "CLIP dependencies are missing; install backend/requirements.txt"
        ) from exc
    return (
        CLIPProcessor.from_pretrained(MODEL_NAME),
        CLIPModel.from_pretrained(MODEL_NAME),
    )


def clip_enabled():
    return os.environ.get("TRACEIT_CLIP_ENABLED", "1").lower() not in {"0", "false", "no"}


def calculate_clip_embedding(img):
    """Create a normalized CLIP image vector as compact SQLite-safe bytes."""
    if not clip_enabled():
        return None
    processor, model = _model()
    import torch

    inputs = processor(images=img.convert("RGB"), return_tensors="pt")
    with torch.no_grad():
        vector = model.get_image_features(**inputs)
    vector = vector / vector.norm(dim=-1, keepdim=True).clamp_min(1e-12)
    return vector.squeeze(0).cpu().numpy().astype(np.float32).tobytes()


def clip_similarity(query_embedding, candidate_embedding):
    """Return cosine similarity as a 0-100 score."""
    if not query_embedding or not candidate_embedding:
        return None
    query = np.frombuffer(query_embedding, dtype=np.float32)
    candidate = np.frombuffer(candidate_embedding, dtype=np.float32)
    if query.size == 0 or query.size != candidate.size:
        return None
    return round(float(np.dot(query, candidate) * 100), 2)


def embedding_from_bytes(value):
    return bytes(value) if value is not None else None
