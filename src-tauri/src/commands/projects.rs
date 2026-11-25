use crate::db::{self, DbState, models::Project};
use tauri::State;

#[tauri::command]
pub fn upsert_project(state: State<'_, DbState>, project: Project) -> Result<(), String> {
  let conn = state
    .conn
    .lock()
    .map_err(|_| "Error al adquirir bloqueo de la base de datos".to_string())?;
  db::projects::upsert(&conn, &project)
}

#[tauri::command]
pub fn delete_project(state: State<'_, DbState>, id: i64) -> Result<(), String> {
  let mut conn = state
    .conn
    .lock()
    .map_err(|_| "Error al adquirir bloqueo de la base de datos".to_string())?;
  db::projects::delete(&mut conn, id)
}
