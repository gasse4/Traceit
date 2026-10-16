"""Flask API entry point for TraceIt."""

import os
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

from database import init_db, add_report, get_all_active_reports, get_connection
from algorithms import calculate_phash, linear_search, image_search

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def save_image(file_storage):
    """Save an uploaded image with a safe unique name.

    Returns (relative_path, phash, None) on success or (None, None, error_str).
    """
    if not file_storage or not file_storage.filename:
        return None, None, "no file"
    if not allowed_file(file_storage.filename):
        return None, None, "unsupported extension"
    safe = secure_filename(file_storage.filename)
    ext = safe.rsplit(".", 1)[1].lower() if "." in safe else "jpg"
    new_name = f"report_{uuid.uuid4().hex}.{ext}"
    full_path = os.path.join(UPLOAD_DIR, new_name)
    file_storage.save(full_path)
    phash = calculate_phash(full_path)
    return f"uploads/{new_name}", phash, None


app = Flask(__name__)
CORS(app)
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/report/lost", methods=["POST"])
def report_lost():
    return create_report("lost")


@app.route("/api/report/found", methods=["POST"])
def report_found():
    return create_report("found")


def create_report(report_type):
    form = request.form
    name = (form.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400

    image = request.files.get("image")
    image_path = None
    image_phash = None
    if image and image.filename:
        image_path, image_phash, err = save_image(image)
        if err:
            return jsonify({"error": err}), 400

    report = {
        "type": report_type,
        "name": name,
        "description": form.get("description", "") or "",
        "location": form.get("location", "") or "",
        "color": form.get("color", "") or "",
        "image_path": image_path,
        "image_phash": image_phash,
    }
    new_id = add_report(report)
    return jsonify({"id": new_id, "message": "report created"}), 201


@app.route("/api/reports", methods=["GET"])
def list_reports():
    return jsonify({"results": get_all_active_reports()})


@app.route("/api/stats", methods=["GET"])
def stats():
    conn = get_connection()
    try:
        total = conn.execute("SELECT COUNT(*) FROM reports").fetchone()[0]
        active = conn.execute("SELECT COUNT(*) FROM reports WHERE status = 'active'").fetchone()[0]
        resolved = conn.execute("SELECT COUNT(*) FROM reports WHERE status = 'resolved'").fetchone()[0]
        with_image = conn.execute("SELECT COUNT(*) FROM reports WHERE image_path IS NOT NULL").fetchone()[0]
        # Match percentage: ratio of resolved to total (or 0 if none)
        match_pct = round((resolved / total * 100) if total else 0)
    finally:
        conn.close()
    return jsonify({
        "total_reports": total,
        "active_reports": active,
        "resolved_reports": resolved,
        "with_image": with_image,
        "match_percentage": match_pct,
    })


@app.route("/api/search/text", methods=["GET"])
def search_text():
    q = request.args.get("q", "")
    reports = get_all_active_reports()
    results = linear_search(reports, q)
    return jsonify({"query": q, "results": results, "count": len(results)})


@app.route("/api/search/image", methods=["POST"])
def search_image():
    image = request.files.get("image")
    if not image or not image.filename:
        return jsonify({"error": "image file is required"}), 400
    if not allowed_file(image.filename):
        return jsonify({"error": "unsupported extension"}), 400

    safe = secure_filename(image.filename)
    ext = safe.rsplit(".", 1)[1].lower() if "." in safe else "jpg"
    temp_name = f"search_{uuid.uuid4().hex}.{ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_name)
    image.save(temp_path)
    try:
        query_hash = calculate_phash(temp_path)
    finally:
        try:
            os.remove(temp_path)
        except OSError:
            pass

    reports = get_all_active_reports()
    results = image_search(reports, query_hash)
    return jsonify(
        {
            "query_phash": query_hash,
            "results": results,
            "count": len(results),
            "disclaimer": "Results are probable only. Verify ownership manually before handover.",
        }
    )


@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_DIR, filename)


# initialize schema
init_db()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
