use crate::db::{self, DbState, models::Reminder};
use tauri::State;

#[tauri::command]
pub fn upsert_reminder(state: State<'_, DbState>, reminder: Reminder) -> Result<(), String> {
  let conn = state
    .0
    .lock()
    .map_err(|_| "Error al adquirir bloqueo de la base de datos".to_string())?;
  db::reminders::upsert(&conn, &reminder)
}

#[tauri::command]
pub fn delete_reminder(state: State<'_, DbState>, id: i64) -> Result<(), String> {
  let conn = state
    .0
    .lock()
    .map_err(|_| "Error al adquirir bloqueo de la base de datos".to_string())?;
  db::reminders::delete(&conn, id)
}
