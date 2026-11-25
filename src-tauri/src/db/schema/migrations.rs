use rusqlite::Connection;

pub const CURRENT_SCHEMA_VERSION: i64 = 3;

fn get_user_version(conn: &Connection) -> Result<i64, String> {
  conn
    .query_row("PRAGMA user_version", [], |row| row.get(0))
    .map_err(|e| format!("Error al leer PRAGMA user_version: {e}"))
}

fn set_user_version(conn: &Connection, version: i64) -> Result<(), String> {
  conn
    .execute_batch(&format!("PRAGMA user_version = {version};"))
    .map_err(|e| format!("Error al actualizar PRAGMA user_version a {version}: {e}"))
}

fn has_column(conn: &Connection, table: &str, column: &str) -> Result<bool, String> {
  let mut stmt = conn
    .prepare(&format!("PRAGMA table_info({table})"))
    .map_err(|e| format!("Error al inspeccionar columnas de {table}: {e}"))?;
  let cols: Vec<String> = stmt
    .query_map([], |row| row.get::<_, String>(1))
    .map_err(|e| format!("Error al leer columnas de {table}: {e}"))?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| format!("Error al recolectar columnas de {table}: {e}"))?;
  Ok(cols.iter().any(|c| c == column))
}

fn add_column_if_missing(
  conn: &Connection,
  table: &str,
  column: &str,
  definition: &str,
) -> Result<(), String> {
  if !has_column(conn, table, column)? {
    conn
      .execute_batch(&format!("ALTER TABLE {table} ADD COLUMN {column} {definition};"))
      .map_err(|e| format!("Error al añadir columna {table}.{column}: {e}"))?;
  }
  Ok(())
}

/// Ejecuta migraciones incrementales y no destructivas usando PRAGMA user_version.
pub fn run(conn: &Connection) -> Result<(), String> {
  let version = get_user_version(conn)?;

  if version < 2 {
    // Asegurar columnas v2 de tasks sin perder datos existentes
    add_column_if_missing(conn, "tasks", "start_date", "TEXT")?;
    add_column_if_missing(conn, "tasks", "due_date", "TEXT")?;
    add_column_if_missing(conn, "tasks", "tags_json", "TEXT NOT NULL DEFAULT '[]'")?;
    add_column_if_missing(conn, "tasks", "subtasks_json", "TEXT NOT NULL DEFAULT '[]'")?;
    add_column_if_missing(conn, "tasks", "estimated_minutes", "INTEGER NOT NULL DEFAULT 30")?;
    add_column_if_missing(
      conn,
      "tasks",
      "recurrence_json",
      "TEXT NOT NULL DEFAULT '{\"frequency\":\"none\",\"interval\":1,\"endDate\":null}'",
    )?;
    add_column_if_missing(conn, "tasks", "created_at", "TEXT NOT NULL DEFAULT ''")?;
    add_column_if_missing(conn, "tasks", "updated_at", "TEXT NOT NULL DEFAULT ''")?;
    add_column_if_missing(conn, "tasks", "completed_at", "TEXT")?;
    add_column_if_missing(conn, "tasks", "deleted_at", "TEXT")?;
    set_user_version(conn, 2)?;
  }

  if version < 3 {
    // v3: relaciones project_id / task_id, fechas completas en eventos y sesiones, e índices
    add_column_if_missing(conn, "tasks", "project_id", "INTEGER")?;
    add_column_if_missing(conn, "calendar_events", "date", "TEXT NOT NULL DEFAULT ''")?;
    add_column_if_missing(conn, "focus_sessions", "task_id", "INTEGER")?;
    add_column_if_missing(conn, "focus_sessions", "date", "TEXT NOT NULL DEFAULT ''")?;

    conn
      .execute_batch(
        "
        CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks(deleted_at);
        CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
        CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
        CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
        CREATE INDEX IF NOT EXISTS idx_events_date ON calendar_events(date);
        CREATE INDEX IF NOT EXISTS idx_reminders_enabled_date ON reminders(enabled, date);
        CREATE INDEX IF NOT EXISTS idx_sessions_date ON focus_sessions(date);
        ",
      )
      .map_err(|e| format!("Error al crear índices de migración v3: {e}"))?;

    set_user_version(conn, CURRENT_SCHEMA_VERSION)?;
  }

  Ok(())
}
