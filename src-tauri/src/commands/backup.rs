use crate::db::{
  self, DbState,
  models::{AppData, BackupInfo, UserSettings},
};
use tauri::State;

#[tauri::command]
pub fn create_backup(state: State<'_, DbState>) -> Result<BackupInfo, String> {
  let conn = state
    .conn
    .lock()
    .map_err(|_| "Error al adquirir bloqueo de la base de datos".to_string())?;
  db::backup::create_backup(&conn, &state.backups_dir)
}

#[tauri::command]
pub fn list_backups(state: State<'_, DbState>) -> Result<Vec<BackupInfo>, String> {
  db::backup::list_backups(&state.backups_dir)
}

#[tauri::command]
pub fn restore_backup(
  state: State<'_, DbState>,
  file_name: String,
  fallback_settings: UserSettings,
) -> Result<AppData, String> {
  let mut conn = state
    .conn
    .lock()
    .map_err(|_| "Error al adquirir bloqueo de la base de datos".to_string())?;
  db::backup::restore_backup(&mut conn, &state.backups_dir, &file_name)?;
  db::load_all_data(&conn, &fallback_settings)
}

#[tauri::command]
pub fn delete_backup(state: State<'_, DbState>, file_name: String) -> Result<(), String> {
  db::backup::delete_backup(&state.backups_dir, &file_name)
}

#[tauri::command]
pub fn run_auto_backup_if_needed(state: State<'_, DbState>) -> Result<Option<BackupInfo>, String> {
  let conn = state
    .conn
    .lock()
    .map_err(|_| "Error al adquirir bloqueo de la base de datos".to_string())?;
  db::backup::maybe_auto_backup(&conn, &state.backups_dir, 7)
}
