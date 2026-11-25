mod commands;
mod db;

use db::DbState;
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
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

      Ok(())
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
    ])
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
