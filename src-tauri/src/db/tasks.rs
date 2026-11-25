use super::models::Task;
use rusqlite::{Connection, params};

pub fn load_all(conn: &Connection) -> Result<Vec<Task>, String> {
  let mut stmt = conn
    .prepare(
      "SELECT id, title, description, project, due, start, priority, status,
              category, estimate, subtasks, done, color
       FROM tasks ORDER BY id DESC",
    )
    .map_err(|e| format!("Error al preparar consulta de tareas: {e}"))?;

  let rows = stmt
    .query_map([], |row| {
      Ok(Task {
        id: row.get(0)?,
        title: row.get(1)?,
        description: row.get(2)?,
        project: row.get(3)?,
        due: row.get(4)?,
        start: row.get(5)?,
        priority: row.get(6)?,
        status: row.get(7)?,
        category: row.get(8)?,
        estimate: row.get(9)?,
        subtasks: row.get(10)?,
        done: row.get::<_, i64>(11)? != 0,
        color: row.get(12)?,
      })
    })
    .map_err(|e| format!("Error al leer tareas: {e}"))?;

  rows
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| format!("Error al deserializar tareas: {e}"))
}

pub fn upsert(conn: &Connection, t: &Task) -> Result<(), String> {
  conn
    .execute(
      "INSERT INTO tasks (
         id, title, description, project, due, start, priority, status,
         category, estimate, subtasks, done, color
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         description = excluded.description,
         project = excluded.project,
         due = excluded.due,
         start = excluded.start,
         priority = excluded.priority,
         status = excluded.status,
         category = excluded.category,
         estimate = excluded.estimate,
         subtasks = excluded.subtasks,
         done = excluded.done,
         color = excluded.color",
      params![
        t.id,
        t.title,
        t.description,
        t.project,
        t.due,
        t.start,
        t.priority,
        t.status,
        t.category,
        t.estimate,
        t.subtasks,
        t.done as i64,
        t.color,
      ],
    )
    .map_err(|e| format!("Error al guardar tarea: {e}"))?;
  Ok(())
}

pub fn delete(conn: &Connection, id: i64) -> Result<(), String> {
  conn
    .execute("DELETE FROM tasks WHERE id = ?1", params![id])
    .map_err(|e| format!("Error al eliminar tarea: {e}"))?;
  Ok(())
}
