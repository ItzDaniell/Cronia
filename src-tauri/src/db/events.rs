use super::models::CalendarEvent;
use rusqlite::{Connection, params};

pub fn load_all(conn: &Connection) -> Result<Vec<CalendarEvent>, String> {
  let mut stmt = conn
    .prepare(
      "SELECT id, day, date, title, event_type, color, time
       FROM calendar_events ORDER BY date ASC, day ASC, time ASC, id ASC",
    )
    .map_err(|e| format!("Error al preparar consulta de eventos: {e}"))?;

  let rows = stmt
    .query_map([], |row| {
      Ok(CalendarEvent {
        id: row.get(0)?,
        day: row.get(1)?,
        date: row.get(2)?,
        title: row.get(3)?,
        event_type: row.get(4)?,
        color: row.get(5)?,
        time: row.get(6)?,
      })
    })
    .map_err(|e| format!("Error al leer eventos: {e}"))?;

  rows
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| format!("Error al deserializar eventos: {e}"))
}

pub fn upsert(conn: &Connection, ev: &CalendarEvent) -> Result<(), String> {
  conn
    .execute(
      "INSERT INTO calendar_events (id, day, date, title, event_type, color, time)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
       ON CONFLICT(id) DO UPDATE SET
         day = excluded.day,
         date = excluded.date,
         title = excluded.title,
         event_type = excluded.event_type,
         color = excluded.color,
         time = excluded.time",
      params![ev.id, ev.day, ev.date, ev.title, ev.event_type, ev.color, ev.time],
    )
    .map_err(|e| format!("Error al guardar evento: {e}"))?;
  Ok(())
}

pub fn delete(conn: &Connection, id: i64) -> Result<(), String> {
  conn
    .execute("DELETE FROM calendar_events WHERE id = ?1", params![id])
    .map_err(|e| format!("Error al eliminar evento: {e}"))?;
  Ok(())
}
