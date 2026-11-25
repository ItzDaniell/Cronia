use rusqlite::Connection;

pub fn init(conn: &Connection) -> Result<(), String> {
  conn
    .execute_batch(
      "
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        user_name TEXT NOT NULL,
        dark INTEGER NOT NULL,
        accent TEXT NOT NULL,
        launch_on_startup INTEGER NOT NULL,
        minimize_to_tray INTEGER NOT NULL,
        native_notifications INTEGER NOT NULL,
        sound_enabled INTEGER NOT NULL,
        auto_backup INTEGER NOT NULL,
        diagnostics INTEGER NOT NULL,
        first_day_of_week TEXT NOT NULL,
        language TEXT NOT NULL
      );
      ",
    )
    .map_err(|e| format!("Error al crear tabla settings: {e}"))
}
