mod commands;
mod db;
mod tray;

use db::DbState;
use std::sync::Mutex;
use tauri::{Manager, WindowEvent};
use tauri_plugin_autostart::MacosLauncher;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_autostart::init(
      MacosLauncher::LaunchAgent,
      None,
    ))
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("No se pudo resolver app_data_dir: {e}"))?;
      let db_path = data_dir.join("cronia.db");
      let backups_dir = data_dir.join("backups");
      let conn = db::open_db(&db_path)?;

      app.manage(DbState {
        conn: Mutex::new(conn),
        backups_dir,
      });

      tray::setup_tray(app.handle())?;

      Ok(())
    })
    .on_window_event(|window, event| {
      if let WindowEvent::CloseRequested { api, .. } = event {
        let should_minimize = window
          .try_state::<DbState>()
          .and_then(|state| state.conn.lock().ok().and_then(|c| db::settings::load(&c).ok().flatten()))
          .map(|s| s.minimize_to_tray)
          .unwrap_or(false);

        if should_minimize {
          api.prevent_close();
          let _ = window.hide();
        }
      }
    })
    .invoke_handler(tauri::generate_handler![
      commands::app::load_app_data,
      commands::app::reset_all_data,
      commands::settings::save_settings,
      commands::tasks::upsert_task,
      commands::tasks::soft_delete_task,
      commands::tasks::restore_task,
      commands::tasks::delete_task,
      commands::projects::upsert_project,
      commands::projects::delete_project,
      commands::events::upsert_event,
      commands::events::delete_event,
      commands::reminders::upsert_reminder,
      commands::reminders::delete_reminder,
      commands::sessions::upsert_focus_session,
      commands::backup::create_backup,
      commands::backup::list_backups,
      commands::backup::restore_backup,
      commands::backup::delete_backup,
      commands::backup::run_auto_backup_if_needed,
      commands::system::send_native_notification,
      commands::system::set_autostart,
      commands::system::get_autostart,
    ])
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
