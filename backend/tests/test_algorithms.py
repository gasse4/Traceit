"""Unit tests for the two academic algorithms (PLAN.md § 7)."""

import io

import pytest
from PIL import Image

from algorithms import calculate_match_score, calculate_phash, calculate_similarity, crop_to_content, hamming_distance, image_search, linear_search
from conftest import circle, gradient, stripes, to_bytes


def report(i, name="", description="", location="", color="", image_phash=None):
    return {"id": i, "name": name, "description": description, "location": location,
            "color": color, "image_phash": image_phash}


# ---------- Linear Search ----------

class TestLinearSearch:
    reports = [
        report(1, "سماعة أذن", "سماعة بيضاء صغيرة", "مكتبة الكلية", "أبيض"),
        report(2, "Black Keys", "car keys", "Engineering hall", "black"),
        report(3, "Wallet", "leather", "Cafeteria", "Brown"),
    ]

    @pytest.mark.parametrize("q", ["", "   ", None])
    def test_empty_query_returns_nothing(self, q):
        assert linear_search(self.reports, q) == []

    @pytest.mark.parametrize("q, ids", [
        ("سماعة", [1]),            # name (Arabic)
        ("سماعه", [1]),            # common taa marbuta spelling
        ("  سَمَاعَه  ", [1]),     # diacritics and whitespace
        ("بيضاء", [1]),            # description
        ("مكتبة", [1]),            # location
        ("أبيض", [1]),             # color
        ("keys", [2]),             # partial, matches name and description
        ("BLACK", [2]),            # case-insensitive
        ("  wallet  ", [3]),       # trimmed
        ("e", [2, 3]),             # many matches, original order kept
        ("zzz", []),
    ])
    def test_matches(self, q, ids):
        assert [r["id"] for r in linear_search(self.reports, q)] == ids

    def test_report_matching_several_fields_is_returned_once(self):
        assert len(linear_search([report(1, "red", "red", "red", "red")], "red")) == 1

    def test_missing_fields_do_not_crash(self):
        r = {"id": 1, "name": "pen", "description": None, "location": None, "color": None}
        assert linear_search([r], "pen") == [r]

    def test_worst_case_scans_every_report(self):
        many = [report(i, f"item {i}") for i in range(5000)] + [report(5000, "needle")]
        assert [r["id"] for r in linear_search(many, "needle")] == [5000]

    def test_empty_list(self):
        assert linear_search([], "x") == []


# ---------- pHash ----------

class TestPhash:
    def test_crop_to_content_removes_white_border(self):
        cropped = crop_to_content(Image.new("RGB", (100, 100), "white"))
        assert cropped.size == (100, 100)

    # Reference values produced by imagehash.phash (ImageHash 4.3.2) on the same images.
    @pytest.mark.parametrize("make, expected", [
        (circle, "e1979678186561d7"),
        (stripes, "8000000000000000"),
        (gradient, "8837ad2baa2aaa7a"),
    ])
    def test_matches_imagehash_library(self, make, expected):
        assert calculate_phash(make()) == expected

    def test_format_is_16_hex_chars(self):
        h = calculate_phash(gradient())
        assert len(h) == 16 and int(h, 16) >= 0

    def test_deterministic(self):
        assert calculate_phash(circle()) == calculate_phash(circle())

    def test_resized_and_recompressed_copy_is_close(self):
        original = calculate_phash(circle(400))
        copy = Image.open(io.BytesIO(to_bytes(circle(400).resize((150, 150)), "JPEG", quality=60)))
        assert hamming_distance(original, calculate_phash(copy)) <= 6

    def test_different_images_are_far(self):
        assert hamming_distance(calculate_phash(circle()), calculate_phash(stripes())) > 20

    @pytest.mark.parametrize("mode", ["RGB", "RGBA", "L", "LA", "P", "1", "CMYK", "I;16", "I", "F"])
    def test_every_image_mode_works(self, mode):
        assert len(calculate_phash(gradient().convert(mode))) == 16

    @pytest.mark.parametrize("size", [(1, 1), (5, 300), (3000, 7)])
    def test_tiny_and_odd_sizes(self, size):
        assert len(calculate_phash(Image.new("RGB", size, "red"))) == 16


# ---------- Hamming Distance & similarity ----------

class TestHamming:
    def test_identical(self):
        assert hamming_distance("ffff0000ffff0000", "ffff0000ffff0000") == 0

    def test_one_bit(self):
        assert hamming_distance("0000000000000000", "0000000000000001") == 1

    def test_all_bits(self):
        assert hamming_distance("0000000000000000", "ffffffffffffffff") == 64

    def test_counts_bits_not_characters(self):
        assert hamming_distance("0", "f") == 4  # one hex char = 4 differing bits
        assert hamming_distance("a", "5") == 4  # 1010 vs 0101

    def test_matches_xor_popcount(self):
        a, b = "e1979678186561d7", "8837ad2baa2aaa7a"
        assert hamming_distance(a, b) == bin(int(a, 16) ^ int(b, 16)).count("1")

    def test_symmetric(self):
        assert hamming_distance("e1979678186561d7", "0123456789abcdef") == hamming_distance("0123456789abcdef", "e1979678186561d7")

    def test_uppercase_hex(self):
        assert hamming_distance("FFFF", "ffff") == 0

    @pytest.mark.parametrize("a, b", [(None, "ff"), ("ff", None), ("", ""), ("ff", "fff")])
    def test_invalid_input_returns_none(self, a, b):
        assert hamming_distance(a, b) is None

    @pytest.mark.parametrize("distance, expected", [(0, 100.0), (64, 0.0), (32, 50.0), (5, 92.19), (1, 98.44)])
    def test_similarity(self, distance, expected):
        assert calculate_similarity(distance, 64) == expected

    def test_plan_example_12_bits(self):
        # PLAN.md § 7.2: 12-bit hashes with distance 1 -> ~91.67 %
        assert calculate_similarity(1, 12) == 91.67

    def test_similarity_zero_length(self):
        assert calculate_similarity(0, 0) == 0.0

    def test_match_score_is_conservative_for_different_images(self):
        assert calculate_match_score(32, 32, 8) < 10

    def test_match_score_is_perfect_for_identical_images(self):
        assert calculate_match_score(0, 0, 0) == 100.0


class TestImageSearch:
    def test_sorted_by_similarity_and_skips_missing_hash(self):
        reports = [
            report(1, image_phash="ffffffffffffffff"),
            report(2, image_phash=None),
            report(3, image_phash="0000000000000000"),
            report(4, image_phash="000000000000000f"),
        ]
        out = image_search(reports, "0000000000000000")
        assert [r["id"] for r in out] == [3, 4, 1]
        assert [r["similarity"] for r in out] == [100.0, 93.75, 0.0]
        assert [r["hamming_distance"] for r in out] == [0, 4, 64]

    def test_does_not_modify_input(self):
        reports = [report(1, image_phash="0000000000000000")]
        image_search(reports, "0000000000000000")
        assert "similarity" not in reports[0]

    def test_no_reports(self):
        assert image_search([], "0000000000000000") == []

    def test_dino_embedding_rescues_a_match_the_hashes_miss(self):
        # A different photo of the same item: hashes disagree, DINOv2 agrees.
        reports = [report(1, image_phash="ffffffffffffffff")]
        reports[0]["dino_similarity"] = 91.5
        [out] = image_search(reports, "0000000000000000")
        assert out["match_score"] == 91.5
        assert out["dino_similarity"] == 91.5

    def test_low_dino_score_never_lowers_a_hash_match(self):
        reports = [report(1, image_phash="0000000000000000")]
        reports[0]["dino_similarity"] = 12.0
        [out] = image_search(reports, "0000000000000000")
        assert out["match_score"] == 100.0

    def test_missing_dino_score_is_tolerated(self):
        [out] = image_search([report(1, image_phash="0000000000000000")], "0000000000000000")
        assert out["match_score"] == 100.0
        assert out["dino_similarity"] is None
