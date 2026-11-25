use crate::db::{self, DbState, models::UserSettings};
use tauri::State;

#[tauri::command]
pub fn save_settings(state: State<'_, DbState>, settings: UserSettings) -> Result<(), String> {
  let conn = state
    .0
    .lock()
    .map_err(|_| "Error al adquirir bloqueo de la base de datos".to_string())?;
  db::settings::save(&conn, &settings)
}
