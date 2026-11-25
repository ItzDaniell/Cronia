pub mod app_meta;
pub mod events;
pub mod migrations;
pub mod projects;
pub mod reminders;
pub mod sessions;
pub mod settings;
pub mod tasks;

use rusqlite::Connection;

pub fn init(conn: &Connection) -> Result<(), String> {
  conn
    .execute_batch(
      "
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      ",
    )
    .map_err(|e| format!("Error al configurar PRAGMAs SQLite: {e}"))?;

  // Orden respetando claves foráneas: projects antes de tasks, tasks antes de focus_sessions
  app_meta::init(conn)?;
  settings::init(conn)?;
  projects::init(conn)?;
  tasks::init(conn)?;
  events::init(conn)?;
  reminders::init(conn)?;
  sessions::init(conn)?;

  migrations::run(conn)?;

  Ok(())
}
