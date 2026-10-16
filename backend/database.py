"""Database layer for TraceIt: SQLite CRUD for reports."""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "traceit.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create the reports table if it does not already exist."""
    conn = get_connection()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                location TEXT,
                color TEXT,
                image_path TEXT,
                image_phash TEXT,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()
    finally:
        conn.close()


def add_report(report):
    """Insert a new report. Returns the new report id."""
    conn = get_connection()
    try:
        cur = conn.execute(
            """
            INSERT INTO reports
            (type, name, description, location, color, image_path, image_phash, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
            """,
            (
                report["type"],
                report["name"],
                report["description"],
                report["location"],
                report["color"],
                report.get("image_path"),
                report.get("image_phash"),
            ),
        )
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()


def get_all_active_reports():
    """Return all active reports as a list of dict-like rows."""
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM reports WHERE status = 'active' ORDER BY created_at DESC"
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def get_report_by_id(report_id):
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM reports WHERE id = ?", (report_id,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def mark_resolved(report_id):
    conn = get_connection()
    try:
        conn.execute("UPDATE reports SET status = 'resolved' WHERE id = ?", (report_id,))
        conn.commit()
    finally:
        conn.close()
