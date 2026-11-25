use crate::db::{self, DbState, models::AppData};
use tauri::State;

#[tauri::command]
pub fn load_app_data(state: State<'_, DbState>, defaults: AppData) -> Result<AppData, String> {
  let mut conn = state
    .0
    .lock()
    .map_err(|_| "Error al adquirir bloqueo de la base de datos".to_string())?;
  db::load_or_seed(&mut conn, &defaults)
}

#[tauri::command]
pub fn reset_all_data(state: State<'_, DbState>, defaults: AppData) -> Result<AppData, String> {
  let mut conn = state
    .0
    .lock()
    .map_err(|_| "Error al adquirir bloqueo de la base de datos".to_string())?;
  db::replace_all_data(&mut conn, &defaults)?;
  db::load_or_seed(&mut conn, &defaults)
}
