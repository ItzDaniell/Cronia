use crate::db::{self, DbState, models::Task};
use tauri::State;

#[tauri::command]
pub fn upsert_task(state: State<'_, DbState>, task: Task) -> Result<(), String> {
  let conn = state
    .0
    .lock()
    .map_err(|_| "Error al adquirir bloqueo de la base de datos".to_string())?;
  db::tasks::upsert(&conn, &task)
}

#[tauri::command]
pub fn delete_task(state: State<'_, DbState>, id: i64) -> Result<(), String> {
  let conn = state
    .0
    .lock()
    .map_err(|_| "Error al adquirir bloqueo de la base de datos".to_string())?;
  db::tasks::delete(&conn, id)
}
