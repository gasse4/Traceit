"""Core algorithms for TraceIt.

Two hand-written, academically traceable algorithms:
  1. Linear Search for text matching.
  2. pHash + Hamming Distance for visual (image) matching.
"""

from PIL import Image
import imagehash


def linear_search(reports, search_query):
    """Return reports where any of name/description/location/color contains query.

    Case-insensitive. Time complexity: O(n).
    """
    results = []
    query = (search_query or "").strip().lower()
    if not query:
        return results
    for report in reports:
        haystacks = [
            (report.get("name") or "").lower(),
            (report.get("description") or "").lower(),
            (report.get("location") or "").lower(),
            (report.get("color") or "").lower(),
        ]
        if any(query in field for field in haystacks):
            results.append(report)
    return results


def calculate_phash(image_path):
    """Compute and return the pHash of an image as a string."""
    img = Image.open(image_path)
    # Convert to a representation PIL can load consistently.
    img = img.convert("RGB")
    return str(imagehash.phash(img))


def hamming_distance(hash1, hash2):
    """Number of bit positions that differ between two equal-length hash strings.

    Compares character-by-character (imagehash returns a hex string). Each hex
    character represents 4 bits, so we count differing bits within each pair.
    """
    if not hash1 or not hash2:
        return None
    scale = min(len(hash1), len(hash2))
    # bit-level comparison on the canonical binary forms
    dist = 0
    for c1, c2 in zip(hash1, hash2):
        # convert hex char -> int; xor; count set bits
        try:
            b1 = int(c1, 16)
            b2 = int(c2, 16)
        except ValueError:
            dist += 1 if c1 != c2 else 0
            continue
        dist += bin(b1 ^ b2).count("1")
    return dist


def _hash_bit_length(h):
    # Each hex char = 4 bits.
    return len(h) * 4


def calculate_similarity(hash1, hash2):
    """Return similarity % (0-100) derived from Hamming Distance."""
    d = hamming_distance(hash1, hash2)
    if d is None:
        return None
    length = _hash_bit_length(hash1)
    if length == 0:
        return 0.0
    similarity = 100.0 - (d / length * 100.0)
    return round(similarity, 2)


def image_search(reports, query_hash, min_results=None):
    """Sort reports that have a stored pHash by similarity to query_hash.

    Returns list of dicts with extra keys 'hamming_distance' and 'similarity'.
    """
    scored = []
    for report in reports:
        stored = report.get("image_phash")
        if not stored:
            continue
        d = hamming_distance(query_hash, stored)
        if d is None:
            continue
        sim = calculate_similarity(query_hash, stored)
        item = dict(report)
        item["hamming_distance"] = d
        item["similarity"] = sim
        scored.append(item)
    scored.sort(key=lambda r: r["hamming_distance"])
    return scored
