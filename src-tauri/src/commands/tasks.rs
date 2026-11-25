use crate::db::{self, DbState, models::Task};
use tauri::State;

#[tauri::command]
pub fn upsert_task(state: State<'_, DbState>, task: Task) -> Result<(), String> {
  let conn = state
    .conn
    .lock()
    .map_err(|_| "Error al adquirir bloqueo de la base de datos".to_string())?;
  db::tasks::upsert(&conn, &task)
}

#[tauri::command]
pub fn soft_delete_task(
  state: State<'_, DbState>,
  id: i64,
  deleted_at: String,
) -> Result<(), String> {
  let conn = state
    .conn
    .lock()
    .map_err(|_| "Error al adquirir bloqueo de la base de datos".to_string())?;
  db::tasks::soft_delete(&conn, id, &deleted_at)
}

#[tauri::command]
pub fn restore_task(
  state: State<'_, DbState>,
  id: i64,
  updated_at: String,
) -> Result<(), String> {
  let conn = state
    .conn
    .lock()
    .map_err(|_| "Error al adquirir bloqueo de la base de datos".to_string())?;
  db::tasks::restore(&conn, id, &updated_at)
}

#[tauri::command]
pub fn delete_task(state: State<'_, DbState>, id: i64) -> Result<(), String> {
  let conn = state
    .conn
    .lock()
    .map_err(|_| "Error al adquirir bloqueo de la base de datos".to_string())?;
  db::tasks::delete_permanent(&conn, id)
}
