use super::models::FocusSession;
use rusqlite::{Connection, params};

pub fn load_all(conn: &Connection) -> Result<Vec<FocusSession>, String> {
  let mut stmt = conn
    .prepare(
      "SELECT id, task_id, task_title, duration_minutes, date, completed_at, completion_rate, color
       FROM focus_sessions ORDER BY id DESC",
    )
    .map_err(|e| format!("Error al preparar consulta de sesiones: {e}"))?;

  let rows = stmt
    .query_map([], |row| {
      Ok(FocusSession {
        id: row.get(0)?,
        task_id: row.get(1)?,
        task_title: row.get(2)?,
        duration_minutes: row.get(3)?,
        date: row.get(4)?,
        completed_at: row.get(5)?,
        completion_rate: row.get(6)?,
        color: row.get(7)?,
      })
    })
    .map_err(|e| format!("Error al leer sesiones: {e}"))?;

  rows
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| format!("Error al deserializar sesiones: {e}"))
}

pub fn upsert(conn: &Connection, s: &FocusSession) -> Result<(), String> {
  conn
    .execute(
      "INSERT INTO focus_sessions (
         id, task_id, task_title, duration_minutes, date, completed_at, completion_rate, color
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
       ON CONFLICT(id) DO UPDATE SET
         task_id = excluded.task_id,
         task_title = excluded.task_title,
         duration_minutes = excluded.duration_minutes,
         date = excluded.date,
         completed_at = excluded.completed_at,
         completion_rate = excluded.completion_rate,
         color = excluded.color",
      params![
        s.id,
        s.task_id,
        s.task_title,
        s.duration_minutes,
        s.date,
        s.completed_at,
        s.completion_rate,
        s.color,
      ],
    )
    .map_err(|e| format!("Error al guardar sesión de enfoque: {e}"))?;
  Ok(())
}
