use tauri::AppHandle;
use tauri_plugin_autostart::ManagerExt;
use tauri_plugin_notification::NotificationExt;

#[tauri::command]
pub fn send_native_notification(
  app: AppHandle,
  title: String,
  body: String,
) -> Result<(), String> {
  app
    .notification()
    .builder()
    .title(title)
    .body(body)
    .show()
    .map_err(|e| format!("No se pudo mostrar la notificación nativa: {e}"))
}

#[tauri::command]
pub fn set_autostart(app: AppHandle, enabled: bool) -> Result<(), String> {
  let manager = app.autolaunch();
  if enabled {
    manager
      .enable()
      .map_err(|e| format!("No se pudo activar el inicio automático: {e}"))
  } else {
    manager
      .disable()
      .map_err(|e| format!("No se pudo desactivar el inicio automático: {e}"))
  }
}

#[tauri::command]
pub fn get_autostart(app: AppHandle) -> Result<bool, String> {
  app
    .autolaunch()
    .is_enabled()
    .map_err(|e| format!("No se pudo consultar el inicio automático: {e}"))
}
