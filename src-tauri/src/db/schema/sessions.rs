use rusqlite::Connection;

pub fn init(conn: &Connection) -> Result<(), String> {
  conn
    .execute_batch(
      "
      CREATE TABLE IF NOT EXISTS focus_sessions (
        id INTEGER PRIMARY KEY,
        task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
        task_title TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        date TEXT NOT NULL DEFAULT '',
        completed_at TEXT NOT NULL,
        completion_rate INTEGER NOT NULL,
        color TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_date ON focus_sessions(date);
      ",
    )
    .map_err(|e| format!("Error al crear tabla focus_sessions: {e}"))
}
