"""Database layer for TraceIt: SQLite storage for reports."""

import os
import sqlite3
from contextlib import contextmanager

DB_PATH = os.environ.get(
    "TRACEIT_DB",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "traceit.db"),
)


@contextmanager
def get_connection():
    """Open a connection, commit on success, always close."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    """Create the reports table if it does not already exist."""
    with get_connection() as conn:
        # WAL lets reads continue while a report is being written.
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
                name TEXT NOT NULL,
                description TEXT,
                location TEXT,
                color TEXT,
                image_path TEXT,
                image_phash TEXT,
                image_dhash TEXT,
                image_color_hash TEXT,
                image_embedding BLOB,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        columns = {row[1] for row in conn.execute("PRAGMA table_info(reports)")}
        for column, definition in (
            ("image_dhash", "TEXT"),
            ("image_color_hash", "TEXT"),
            ("image_embedding", "BLOB"),
        ):
            if column not in columns:
                conn.execute(f"ALTER TABLE reports ADD COLUMN {column} {definition}")


def add_report(report):
    """Insert a new report and return its id."""
    with get_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO reports
            (type, name, description, location, color, image_path, image_phash, image_dhash, image_color_hash, image_embedding)
            VALUES (:type, :name, :description, :location, :color, :image_path, :image_phash, :image_dhash, :image_color_hash, :image_embedding)
            """,
            report,
        )
        return cur.lastrowid


def get_active_reports(with_image_only=False):
    """Return active reports, newest first, as plain dicts.

    with_image_only=True skips reports that have no stored pHash (for image search).
    """
    sql = "SELECT * FROM reports WHERE status = 'active'"
    if with_image_only:
        sql += " AND image_phash IS NOT NULL"
    with get_connection() as conn:
        rows = conn.execute(sql + " ORDER BY id DESC").fetchall()
    return [dict(r) for r in rows]


def get_stats():
    """Count reports by type in a single pass over the table."""
    with get_connection() as conn:
        row = conn.execute(
            """
            SELECT
                COUNT(*)                                        AS total_reports,
                COALESCE(SUM(type = 'lost'), 0)                 AS lost_reports,
                COALESCE(SUM(type = 'found'), 0)                AS found_reports,
                COALESCE(SUM(image_path IS NOT NULL), 0)        AS with_image
            FROM reports WHERE status = 'active'
            """
        ).fetchone()
    return dict(row)
