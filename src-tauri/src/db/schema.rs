use rusqlite::Connection;

pub fn init(conn: &Connection) -> Result<(), String> {
  conn
    .execute_batch(
      "
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS app_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

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

      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        project TEXT NOT NULL,
        due TEXT NOT NULL,
        start TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        category TEXT NOT NULL,
        estimate TEXT NOT NULL,
        subtasks TEXT NOT NULL,
        done INTEGER NOT NULL,
        color TEXT NOT NULL
      );

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

      CREATE TABLE IF NOT EXISTS calendar_events (
        id INTEGER PRIMARY KEY,
        day INTEGER NOT NULL,
        title TEXT NOT NULL,
        event_type TEXT NOT NULL,
        color TEXT NOT NULL,
        time TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        before TEXT NOT NULL,
        color TEXT NOT NULL,
        enabled INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS focus_sessions (
        id INTEGER PRIMARY KEY,
        task_title TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        completed_at TEXT NOT NULL,
        completion_rate INTEGER NOT NULL,
        color TEXT NOT NULL
      );
      ",
    )
    .map_err(|e| format!("Error al inicializar el esquema SQLite: {e}"))
}
