"""Lazy image embeddings for instance-level visual matching.

CLIP captures *semantic* similarity ("both are earbuds") and is used as a
refinement signal. DINOv2 captures *instance* similarity ("the same earbuds")
and is the primary embedding signal for finding an item from a different
photo of the same object.
"""

import os
from functools import lru_cache

import numpy as np
from PIL import Image

MODEL_NAME = os.environ.get("TRACEIT_CLIP_MODEL", "openai/clip-vit-base-patch32")
DINO_MODEL_NAME = os.environ.get("TRACEIT_DINO_MODEL", "facebook/dinov2-small")
DINO_INPUT_SIZE = 224
# ImageNet statistics, what DINOv2 was trained with.
DINO_MEAN = (0.485, 0.456, 0.406)
DINO_STD = (0.229, 0.224, 0.225)


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


@lru_cache(maxsize=1)
def _dino_model():
    try:
        from transformers import AutoModel
    except ImportError as exc:
        raise RuntimeError(
            "DINO dependencies are missing; install backend/requirements.txt"
        ) from exc
    return AutoModel.from_pretrained(DINO_MODEL_NAME)


def _env_flag(name):
    return os.environ.get(name, "1").lower() not in {"0", "false", "no"}


def clip_enabled():
    return _env_flag("TRACEIT_CLIP_ENABLED")


def dino_enabled():
    return _env_flag("TRACEIT_DINO_ENABLED")


def _extract_features(outputs):
    """Handle raw tensors and transformers model-output objects alike."""
    if isinstance(outputs, (tuple, list)):
        outputs = outputs[0]
    if hasattr(outputs, "ndim"):  # torch.Tensor or np.ndarray
        return outputs
    for attr in ("image_embeds", "pooler_output", "last_hidden_state"):
        value = getattr(outputs, attr, None)
        if value is not None and hasattr(value, "ndim"):
            return value
    raise RuntimeError("model returned no tensor features")


def _normalize(vector):
    import torch

    if isinstance(vector, np.ndarray):
        vector = torch.from_numpy(vector)
    vector = vector / vector.norm(dim=-1, keepdim=True).clamp_min(1e-12)
    return vector


def calculate_clip_embedding(img):
    """Create a normalized CLIP image vector as compact SQLite-safe bytes."""
    if not clip_enabled():
        return None
    processor, model = _model()
    import torch

    inputs = processor(images=img.convert("RGB"), return_tensors="pt")
    with torch.no_grad():
        outputs = _extract_features(model.get_image_features(**inputs))
    vector = _normalize(outputs)
    return vector.squeeze(0).cpu().numpy().astype(np.float32).tobytes()


def calculate_dino_embedding(img):
    """Create a normalized DINOv2 CLS-token vector as SQLite-safe bytes.

    DINOv2 is self-supervised on images alone, so its features track the
    depicted *instance* (shape, texture, parts) rather than the label,
    which is what matching two photos of the same object requires.
    """
    if not dino_enabled():
        return None
    model = _dino_model()
    import torch

    resized = img.convert("RGB").resize(
        (DINO_INPUT_SIZE, DINO_INPUT_SIZE), Image.Resampling.BICUBIC
    )
    pixels = np.asarray(resized, dtype=np.float32) / 255.0
    pixels = (pixels - DINO_MEAN) / DINO_STD
    inputs = torch.from_numpy(pixels).permute(2, 0, 1).unsqueeze(0)
    with torch.no_grad():
        hidden = model(pixel_values=inputs).last_hidden_state  # (1, tokens, dim)
        cls_token = hidden[:, 0]
    vector = _normalize(cls_token)
    return vector.squeeze(0).cpu().numpy().astype(np.float32).tobytes()


def embedding_similarity(query_embedding, candidate_embedding):
    """Return cosine similarity of two unit vectors as a 0-100 score."""
    if not query_embedding or not candidate_embedding:
        return None
    query = np.frombuffer(query_embedding, dtype=np.float32)
    candidate = np.frombuffer(candidate_embedding, dtype=np.float32)
    if query.size == 0 or query.size != candidate.size:
        return None
    return round(float(np.dot(query, candidate) * 100), 2)


def clip_similarity(query_embedding, candidate_embedding):
    """Cosine similarity for CLIP embeddings (0-100)."""
    return embedding_similarity(query_embedding, candidate_embedding)


def dino_similarity(query_embedding, candidate_embedding):
    """Cosine similarity for DINOv2 embeddings (0-100)."""
    return embedding_similarity(query_embedding, candidate_embedding)


def embedding_from_bytes(value):
    return bytes(value) if value is not None else None