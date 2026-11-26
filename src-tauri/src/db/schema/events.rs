use rusqlite::Connection;

pub fn init(conn: &Connection) -> Result<(), String> {
  conn
    .execute_batch(
      "
      CREATE TABLE IF NOT EXISTS calendar_events (
        id INTEGER PRIMARY KEY,
        day INTEGER NOT NULL,
        date TEXT NOT NULL DEFAULT '',
        title TEXT NOT NULL,
        event_type TEXT NOT NULL,
        color TEXT NOT NULL,
        time TEXT NOT NULL
      );
      ",
    )
    .map_err(|e| format!("Error al crear tabla calendar_events: {e}"))
}
