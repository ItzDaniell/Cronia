use crate::db::{self, DbState, models::FocusSession};
use tauri::State;

#[tauri::command]
pub fn upsert_focus_session(
  state: State<'_, DbState>,
  session: FocusSession,
) -> Result<(), String> {
  let conn = state
    .conn
    .lock()
    .map_err(|_| "Error al adquirir bloqueo de la base de datos".to_string())?;
  db::sessions::upsert(&conn, &session)
}
