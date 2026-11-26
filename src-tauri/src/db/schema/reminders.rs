use rusqlite::Connection;

pub fn init(conn: &Connection) -> Result<(), String> {
  conn
    .execute_batch(
      "
      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        before TEXT NOT NULL,
        color TEXT NOT NULL,
        enabled INTEGER NOT NULL
      );
      ",
    )
    .map_err(|e| format!("Error al crear tabla reminders: {e}"))
}
