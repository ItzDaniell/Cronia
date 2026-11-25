use super::models::Reminder;
use rusqlite::{Connection, params};

pub fn load_all(conn: &Connection) -> Result<Vec<Reminder>, String> {
  let mut stmt = conn
    .prepare(
      "SELECT id, title, date, time, before, color, enabled
       FROM reminders ORDER BY date ASC, time ASC, id ASC",
    )
    .map_err(|e| format!("Error al preparar consulta de recordatorios: {e}"))?;

  let rows = stmt
    .query_map([], |row| {
      Ok(Reminder {
        id: row.get(0)?,
        title: row.get(1)?,
        date: row.get(2)?,
        time: row.get(3)?,
        before: row.get(4)?,
        color: row.get(5)?,
        enabled: row.get::<_, i64>(6)? != 0,
      })
    })
    .map_err(|e| format!("Error al leer recordatorios: {e}"))?;

  rows
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| format!("Error al deserializar recordatorios: {e}"))
}

pub fn upsert(conn: &Connection, r: &Reminder) -> Result<(), String> {
  conn
    .execute(
      "INSERT INTO reminders (id, title, date, time, before, color, enabled)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         date = excluded.date,
         time = excluded.time,
         before = excluded.before,
         color = excluded.color,
         enabled = excluded.enabled",
      params![
        r.id,
        r.title,
        r.date,
        r.time,
        r.before,
        r.color,
        r.enabled as i64,
      ],
    )
    .map_err(|e| format!("Error al guardar recordatorio: {e}"))?;
  Ok(())
}

pub fn delete(conn: &Connection, id: i64) -> Result<(), String> {
  conn
    .execute("DELETE FROM reminders WHERE id = ?1", params![id])
    .map_err(|e| format!("Error al eliminar recordatorio: {e}"))?;
  Ok(())
}
