use rusqlite::Connection;

pub fn init(conn: &Connection) -> Result<(), String> {
  conn
    .execute_batch(
      "
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
        project TEXT NOT NULL,
        start_date TEXT,
        due_date TEXT,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        category TEXT NOT NULL,
        tags_json TEXT NOT NULL DEFAULT '[]',
        subtasks_json TEXT NOT NULL DEFAULT '[]',
        estimated_minutes INTEGER NOT NULL DEFAULT 30,
        recurrence_json TEXT NOT NULL DEFAULT '{\"frequency\":\"none\",\"interval\":1,\"endDate\":null}',
        color TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL DEFAULT '',
        completed_at TEXT,
        deleted_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks(deleted_at);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
      ",
    )
    .map_err(|e| format!("Error al crear tabla tasks: {e}"))
}
