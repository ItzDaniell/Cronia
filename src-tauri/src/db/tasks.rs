use super::models::{RecurrenceRule, Subtask, Task};
use rusqlite::{Connection, params};

fn default_recurrence() -> RecurrenceRule {
  RecurrenceRule {
    frequency: "none".into(),
    interval: 1,
    end_date: None,
  }
}

pub fn load_all(conn: &Connection) -> Result<Vec<Task>, String> {
  let mut stmt = conn
    .prepare(
      "SELECT id, title, description, project_id, project, start_date, due_date, priority, status,
              category, tags_json, subtasks_json, estimated_minutes, recurrence_json,
              color, created_at, updated_at, completed_at, deleted_at
       FROM tasks ORDER BY id DESC",
    )
    .map_err(|e| format!("Error al preparar consulta de tareas: {e}"))?;

  let rows = stmt
    .query_map([], |row| {
      let tags_raw: String = row.get(10)?;
      let subtasks_raw: String = row.get(11)?;
      let recurrence_raw: String = row.get(13)?;

      let tags: Vec<String> = serde_json::from_str(&tags_raw).unwrap_or_default();
      let subtasks: Vec<Subtask> = serde_json::from_str(&subtasks_raw).unwrap_or_default();
      let recurrence: RecurrenceRule =
        serde_json::from_str(&recurrence_raw).unwrap_or_else(|_| default_recurrence());

      Ok(Task {
        id: row.get(0)?,
        title: row.get(1)?,
        description: row.get(2)?,
        project_id: row.get(3)?,
        project: row.get(4)?,
        start_date: row.get(5)?,
        due_date: row.get(6)?,
        priority: row.get(7)?,
        status: row.get(8)?,
        category: row.get(9)?,
        tags,
        subtasks,
        estimated_minutes: row.get(12)?,
        recurrence,
        color: row.get(14)?,
        created_at: row.get(15)?,
        updated_at: row.get(16)?,
        completed_at: row.get(17)?,
        deleted_at: row.get(18)?,
      })
    })
    .map_err(|e| format!("Error al leer tareas: {e}"))?;

  rows
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| format!("Error al deserializar tareas: {e}"))
}

pub fn upsert(conn: &Connection, t: &Task) -> Result<(), String> {
  let tags_json =
    serde_json::to_string(&t.tags).map_err(|e| format!("Error al serializar etiquetas: {e}"))?;
  let subtasks_json = serde_json::to_string(&t.subtasks)
    .map_err(|e| format!("Error al serializar subtareas: {e}"))?;
  let recurrence_json = serde_json::to_string(&t.recurrence)
    .map_err(|e| format!("Error al serializar recurrencia: {e}"))?;

  conn
    .execute(
      "INSERT INTO tasks (
         id, title, description, project_id, project, start_date, due_date, priority, status,
         category, tags_json, subtasks_json, estimated_minutes, recurrence_json,
         color, created_at, updated_at, completed_at, deleted_at
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         description = excluded.description,
         project_id = excluded.project_id,
         project = excluded.project,
         start_date = excluded.start_date,
         due_date = excluded.due_date,
         priority = excluded.priority,
         status = excluded.status,
         category = excluded.category,
         tags_json = excluded.tags_json,
         subtasks_json = excluded.subtasks_json,
         estimated_minutes = excluded.estimated_minutes,
         recurrence_json = excluded.recurrence_json,
         color = excluded.color,
         created_at = excluded.created_at,
         updated_at = excluded.updated_at,
         completed_at = excluded.completed_at,
         deleted_at = excluded.deleted_at",
      params![
        t.id,
        t.title,
        t.description,
        t.project_id,
        t.project,
        t.start_date,
        t.due_date,
        t.priority,
        t.status,
        t.category,
        tags_json,
        subtasks_json,
        t.estimated_minutes,
        recurrence_json,
        t.color,
        t.created_at,
        t.updated_at,
        t.completed_at,
        t.deleted_at,
      ],
    )
    .map_err(|e| format!("Error al guardar tarea: {e}"))?;
  Ok(())
}

pub fn soft_delete(conn: &Connection, id: i64, deleted_at: &str) -> Result<(), String> {
  conn
    .execute(
      "UPDATE tasks SET deleted_at = ?1, updated_at = ?1 WHERE id = ?2",
      params![deleted_at, id],
    )
    .map_err(|e| format!("Error al mover tarea a la papelera: {e}"))?;
  Ok(())
}

pub fn restore(conn: &Connection, id: i64, updated_at: &str) -> Result<(), String> {
  conn
    .execute(
      "UPDATE tasks SET deleted_at = NULL, updated_at = ?1 WHERE id = ?2",
      params![updated_at, id],
    )
    .map_err(|e| format!("Error al restaurar tarea: {e}"))?;
  Ok(())
}

pub fn delete_permanent(conn: &Connection, id: i64) -> Result<(), String> {
  conn
    .execute("DELETE FROM tasks WHERE id = ?1", params![id])
    .map_err(|e| format!("Error al eliminar tarea permanentemente: {e}"))?;
  Ok(())
}
