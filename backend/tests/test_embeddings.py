"""Unit tests for embedding helpers that need no model weights."""

import numpy as np
import pytest

from embeddings import (
    dino_similarity,
    embedding_from_bytes,
    embedding_similarity,
)


def vec(*values):
    return np.asarray(values, dtype=np.float32).tobytes()


class TestEmbeddingSimilarity:
    def test_identical_vectors_are_100(self):
        v = vec(1.0, 0.0, 0.0)
        assert embedding_similarity(v, v) == 100.0

    def test_opposite_vectors_are_minus_100(self):
        assert embedding_similarity(vec(1.0, 0.0), vec(-1.0, 0.0)) == -100.0

    def test_orthogonal_vectors_are_0(self):
        assert embedding_similarity(vec(1.0, 0.0), vec(0.0, 1.0)) == 0.0

    @pytest.mark.parametrize("a, b", [
        (None, vec(1.0)), (vec(1.0), None), (b"", vec(1.0)),
        (vec(1.0, 0.0), vec(1.0)),  # different dimensions
    ])
    def test_missing_or_mismatched_returns_none(self, a, b):
        assert embedding_similarity(a, b) is None

    def test_dino_similarity_is_the_same_math(self):
        a, b = vec(0.6, 0.8), vec(0.6, 0.8)
        assert dino_similarity(a, b) == embedding_similarity(a, b) == 100.0

    def test_embedding_from_bytes_copies_or_none(self):
        assert embedding_from_bytes(b"abc") == b"abc"
        assert embedding_from_bytes(None) is None
