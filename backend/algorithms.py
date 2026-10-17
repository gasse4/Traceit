"""Core algorithms for TraceIt.

Two hand-written, academically traceable algorithms:
  1. Linear Search for text matching.
  2. pHash + Hamming Distance for visual (image) matching.
"""

import math

import numpy as np
from PIL import Image

TEXT_FIELDS = ("name", "description", "location", "color")

# pHash works on a 32x32 grayscale image and keeps the 8x8 lowest frequencies -> 64 bits.
PHASH_IMG_SIZE = 32
PHASH_HASH_SIZE = 8

# Rows of the DCT-II basis we need: C[k, n] = cos(pi * (2n + 1) * k / (2N)), k < 8.
# Built once at import; constant scale factors are dropped since they don't change the median test.
_n = np.arange(PHASH_IMG_SIZE)
_k = np.arange(PHASH_HASH_SIZE)[:, None]
DCT_BASIS = np.cos(math.pi * (2 * _n + 1) * _k / (2 * PHASH_IMG_SIZE))


def linear_search(reports, search_query):
    """Return reports where any text field contains the query (case-insensitive).

    Visits every report exactly once -> time O(n), extra space O(k) for matches.
    """
    query = (search_query or "").strip().lower()
    if not query:
        return []

    results = []
    for report in reports:
        for field in TEXT_FIELDS:
            if query in (report.get(field) or "").lower():
                results.append(report)
                break  # one matching field is enough; move to the next report
    return results


def calculate_phash(img):
    """Compute the 64-bit perceptual hash (pHash) of a PIL image as 16 hex characters.

    1. Shrink to 32x32 grayscale (drops detail and color, keeps overall structure).
    2. 2D DCT, keeping only the top-left 8x8 block (the lowest frequencies).
    3. Each bit = 1 if that coefficient is above the block's median, else 0.
    """
    small = img.convert("L").resize((PHASH_IMG_SIZE, PHASH_IMG_SIZE), Image.Resampling.LANCZOS)
    pixels = np.asarray(small, dtype=np.float64)

    low_freq = DCT_BASIS @ pixels @ DCT_BASIS.T  # 8x8 = DCT along rows, then columns
    low_freq = low_freq.round(6)  # drop float noise so exact zeros compare as equal
    bits = (low_freq > np.median(low_freq)).flatten()

    value = 0
    for bit in bits:
        value = (value << 1) | int(bit)
    return f"{value:016x}"


def hamming_distance(hash1, hash2):
    """Count the bit positions that differ between two equal-length hex hashes.

    Each hex character holds 4 bits: XOR the two characters, then count the 1s.
    """
    if not hash1 or not hash2 or len(hash1) != len(hash2):
        return None

    distance = 0
    for c1, c2 in zip(hash1, hash2):
        distance += (int(c1, 16) ^ int(c2, 16)).bit_count()
    return distance


def calculate_similarity(distance, bit_length):
    """Convert a Hamming distance into a similarity percentage (0-100)."""
    if not bit_length:
        return 0.0
    return round(100.0 - (distance / bit_length * 100.0), 2)


def image_search(reports, query_hash):
    """Score every report that has a stored pHash against query_hash.

    Returns copies of the reports with 'hamming_distance' and 'similarity',
    sorted from most to least similar.
    """
    bit_length = len(query_hash) * 4
    scored = []
    for report in reports:
        distance = hamming_distance(query_hash, report.get("image_phash"))
        if distance is None:
            continue
        scored.append({
            **report,
            "hamming_distance": distance,
            "similarity": calculate_similarity(distance, bit_length),
        })
    scored.sort(key=lambda r: r["hamming_distance"])
    return scored
