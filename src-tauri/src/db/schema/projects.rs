use rusqlite::Connection;

pub fn init(conn: &Connection) -> Result<(), String> {
  conn
    .execute_batch(
      "
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        desc TEXT NOT NULL,
        color TEXT NOT NULL,
        done INTEGER NOT NULL,
        total INTEGER NOT NULL,
        date TEXT NOT NULL,
        archived INTEGER NOT NULL
      );
      ",
    )
    .map_err(|e| format!("Error al crear tabla projects: {e}"))
}
