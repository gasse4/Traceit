"""Search and image-matching algorithms for TraceIt.

Text uses a hand-written linear search. Image matching combines hand-written
perceptual hashing (pHash) + Hamming Distance with OpenCV ORB features and
DINOv2 / CLIP embeddings for higher accuracy.
"""

import math
import unicodedata

import cv2
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


def crop_to_content(img, background_threshold=245, padding=8):
    """Remove a near-white border so screenshots and originals share a frame."""
    pixels = np.asarray(img.convert("RGB"))
    content = np.any(pixels < background_threshold, axis=2)
    coordinates = np.argwhere(content)
    if coordinates.size == 0:
        return img
    top, left = coordinates.min(axis=0)
    bottom, right = coordinates.max(axis=0) + 1
    return img.crop((
        max(0, left - padding),
        max(0, top - padding),
        min(img.width, right + padding),
        min(img.height, bottom + padding),
    ))


def image_variants(img):
    """Return orientation and mirror variants for robust image matching."""
    variants = []
    for mirrored in (False, True):
        base = img.transpose(Image.Transpose.FLIP_LEFT_RIGHT) if mirrored else img
        for angle in (0, 90, 180, 270):
            variant = base.rotate(angle, expand=True)
            if not any(variant.size == existing.size and np.array_equal(
                np.asarray(variant), np.asarray(existing)
            ) for existing in variants):
                variants.append(variant)
    return variants


def normalize_search_text(value):
    """Normalize Arabic spelling variants while preserving partial matching."""
    text = unicodedata.normalize("NFKC", value or "").strip().lower()
    text = "".join(char for char in text if not unicodedata.combining(char))
    return (
        text.replace("ـ", "")
        .replace("أ", "ا")
        .replace("إ", "ا")
        .replace("آ", "ا")
        .replace("ى", "ي")
        .replace("ؤ", "و")
        .replace("ئ", "ي")
        .replace("ة", "ه")
    )


def linear_search(reports, search_query):
    """Return reports where any text field contains the normalized query.

    Visits every report exactly once -> time O(n), extra space O(k) for matches.
    """
    query = normalize_search_text(search_query)
    if not query:
        return []

    results = []
    for report in reports:
        for field in TEXT_FIELDS:
            if query in normalize_search_text(report.get(field)):
                results.append(report)
                break  # one matching field is enough; move to the next report
    return results


def calculate_phash(img):
    """Compute the 64-bit perceptual hash (pHash) of a PIL image as 16 hex chars.

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


def calculate_dhash(img):
    """Compute a 64-bit difference hash that captures local edges."""
    small = img.convert("L").resize((9, 8), Image.Resampling.LANCZOS)
    pixels = np.asarray(small, dtype=np.int16)
    bits = pixels[:, 1:] > pixels[:, :-1]
    value = 0
    for bit in bits.flatten():
        value = (value << 1) | int(bit)
    return f"{value:016x}"


def calculate_color_hash(img):
    """Store a compact quantized average color (4 bits per RGB channel)."""
    average = np.asarray(img.convert("RGB").resize((1, 1), Image.Resampling.BOX), dtype=np.uint8)[0, 0]
    return "".join(f"{int(channel) // 16:x}" for channel in average)


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


def calculate_orb_similarity(query_img, candidate_img):
    """Compare geometrically consistent local ORB features.

    A ratio-test match alone can be a coincidental descriptor match. Keeping
    only RANSAC inliers makes the score reflect one shared image transform.
    """
    def descriptors(img):
        pixels = np.asarray(img.convert("RGB"))
        gray = cv2.cvtColor(pixels, cv2.COLOR_RGB2GRAY)
        return cv2.ORB_create(nfeatures=500).detectAndCompute(gray, None)

    query_keypoints, query_descriptors = descriptors(query_img)
    candidate_keypoints, candidate_descriptors = descriptors(candidate_img)
    if query_descriptors is None or candidate_descriptors is None:
        return 0.0

    matches = cv2.BFMatcher(cv2.NORM_HAMMING).knnMatch(
        query_descriptors, candidate_descriptors, k=2
    )
    good_matches = [
        first for first, second in matches
        if second is not None and first.distance < 0.75 * second.distance
    ]
    if len(good_matches) < 4:
        return 0.0

    source = np.float32([query_keypoints[m.queryIdx].pt for m in good_matches])
    target = np.float32([candidate_keypoints[m.trainIdx].pt for m in good_matches])
    _, inlier_mask = cv2.findHomography(source, target, cv2.RANSAC, 5.0)
    if inlier_mask is None:
        return 0.0

    inliers = int(inlier_mask.ravel().sum())
    denominator = max(1, min(len(query_keypoints), len(candidate_keypoints)))
    return round(min(100.0, inliers / denominator * 100.0), 2)


def calculate_match_score(phash_distance, dhash_distance=None, color_distance=None):
    """Return a conservative confidence score instead of a linear percentage.

    A Hamming distance of 32 is not a 50% match: it means half of a hash is
    different. Exponential decay makes moderate differences fall quickly and
    requires the independent image signals to agree.
    """
    if phash_distance is None:
        return 0.0

    def confidence(distance, scale):
        if distance is None:
            return None
        return math.exp(-distance / scale)

    scores = [
        (confidence(phash_distance, 12), 0.60),
        (confidence(dhash_distance, 12), 0.30),
        (confidence(color_distance, 3), 0.10),
    ]
    available = [(score, weight) for score, weight in scores if score is not None]
    total_weight = sum(weight for _, weight in available)
    return round(100 * sum(score * weight for score, weight in available) / total_weight, 2)


def image_search(
    reports,
    query_hash,
    query_dhash=None,
    query_color_hash=None,
    query_alternates=None,
):
    """Score every report with a stored pHash against the query image.

    Results include the legacy pHash fields plus the combined ``match_score``
    used by the frontend.
    """
    bit_length = len(query_hash) * 4
    scored = []
    for report in reports:
        candidates = [(query_hash, query_dhash, query_color_hash)]
        if query_alternates:
            candidates.extend(query_alternates)
        if report.get("image_hash_variants") and report.get("query_hash_variants"):
            candidates.extend([
                (query_values[0], query_values[1], query_values[2], report_values)
                for query_values in report["query_hash_variants"]
                for report_values in [report["image_hash_variants"]]
            ])
        best = None
        for index, candidate in enumerate(candidates):
            candidate_hash, candidate_dhash, candidate_color_hash = candidate[:3]
            if len(candidate) == 4:
                report_candidates = candidate[3]
                for report_hash, report_dhash, report_color_hash in report_candidates:
                    candidate_distance = hamming_distance(candidate_hash, report_hash)
                    if candidate_distance is None:
                        continue
                    candidate_edge = hamming_distance(candidate_dhash, report_dhash)
                    candidate_color = hamming_distance(candidate_color_hash, report_color_hash)
                    candidate_score = calculate_match_score(candidate_distance, candidate_edge, candidate_color)
                    if best is None or candidate_score > best[0]:
                        best = (candidate_score, candidate_distance, candidate_edge, candidate_color)
                continue
            candidate_report_hash = report.get("image_phash") if index == 0 else report.get("image_phash_original")
            report_dhash = report.get("image_dhash") if index == 0 else report.get("image_dhash_original")
            report_color_hash = report.get("image_color_hash") if index == 0 else report.get("image_color_hash_original")
            candidate_distance = hamming_distance(candidate_hash, candidate_report_hash)
            if candidate_distance is None:
                continue
            candidate_edge = (
                hamming_distance(candidate_dhash, report_dhash)
                if candidate_dhash and report_dhash else None
            )
            candidate_color = (
                hamming_distance(candidate_color_hash, report_color_hash)
                if candidate_color_hash and report_color_hash else None
            )
            candidate_score = calculate_match_score(candidate_distance, candidate_edge, candidate_color)
            if best is None or candidate_score > best[0]:
                best = (candidate_score, candidate_distance, candidate_edge, candidate_color)
        if best is None:
            continue
        base_score, distance, edge_distance, color_distance = best
        match_score = base_score
        orb_similarity = report.get("orb_similarity")
        if orb_similarity is not None and orb_similarity > base_score:
            match_score = round(base_score * 0.70 + orb_similarity * 0.30, 2)
        clip_score = report.get("clip_similarity")
        # CLIP recognizes semantic categories (e.g. "earbuds"), not identity.
        # It may refine a structurally plausible match, but must not rescue a
        # candidate whose hashes disagree strongly.
        if clip_score is not None and base_score >= 50:
            match_score = round(match_score * 0.45 + clip_score * 0.55, 2)
        dino_score = report.get("dino_similarity")
        # DINOv2 tracks the depicted instance, so it rescues matches the
        # hashes cannot see (same item re-photographed, mirrored, rescaled).
        if dino_score is not None:
            match_score = max(match_score, dino_score)
        scored.append({
            **report,
            "hamming_distance": distance,
            "similarity": calculate_similarity(distance, bit_length),
            "visual_similarity": match_score,
            "match_score": match_score,
            "orb_similarity": orb_similarity,
            "dino_similarity": dino_score,
            "edge_distance": edge_distance,
        })
    scored.sort(key=lambda r: (-r["match_score"], r["hamming_distance"]))
    return scored