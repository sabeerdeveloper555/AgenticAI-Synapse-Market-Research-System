import sqlite3
import os
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), "synapse.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS reports (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            topic    TEXT NOT NULL,
            content  TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def save_report(topic: str, content: str) -> int:
    conn = get_connection()
    cursor = conn.execute(
        "INSERT INTO reports (topic, content, created_at) VALUES (?, ?, ?)",
        (topic, content, datetime.now(timezone.utc).isoformat()),
    )
    conn.commit()
    report_id = cursor.lastrowid
    conn.close()
    if report_id is None:
        raise RuntimeError("Failed to save report: database did not return an ID.")
    return report_id


def get_all_reports():
    conn = get_connection()
    rows = conn.execute(
        "SELECT id, topic, created_at FROM reports ORDER BY id DESC"
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def delete_all_reports():
    conn = get_connection()
    conn.execute("DELETE FROM reports")
    conn.commit()
    conn.close()


def get_report_by_id(report_id: int):
    conn = get_connection()
    row = conn.execute(
        "SELECT * FROM reports WHERE id = ?", (report_id,)
    ).fetchone()
    conn.close()
    return dict(row) if row else None
