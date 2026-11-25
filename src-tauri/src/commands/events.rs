use crate::db::{self, DbState, models::CalendarEvent};
use tauri::State;

#[tauri::command]
pub fn upsert_event(state: State<'_, DbState>, event: CalendarEvent) -> Result<(), String> {
  let conn = state
    .conn
    .lock()
    .map_err(|_| "Error al adquirir bloqueo de la base de datos".to_string())?;
  db::events::upsert(&conn, &event)
}

#[tauri::command]
pub fn delete_event(state: State<'_, DbState>, id: i64) -> Result<(), String> {
  let conn = state
    .conn
    .lock()
    .map_err(|_| "Error al adquirir bloqueo de la base de datos".to_string())?;
  db::events::delete(&conn, id)
}
