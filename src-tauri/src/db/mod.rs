pub mod events;
pub mod models;
pub mod projects;
pub mod reminders;
pub mod schema;
pub mod sessions;
pub mod settings;
pub mod tasks;

use models::AppData;
use rusqlite::{Connection, OptionalExtension};
use std::path::Path;
use std::sync::Mutex;

pub struct DbState(pub Mutex<Connection>);

pub fn open_db(path: &Path) -> Result<Connection, String> {
  if let Some(parent) = path.parent() {
    std::fs::create_dir_all(parent)
      .map_err(|e| format!("No se pudo crear el directorio de datos: {e}"))?;
  }
  let conn = Connection::open(path)
    .map_err(|e| format!("No se pudo abrir la base de datos SQLite: {e}"))?;
  schema::init(&conn)?;
  Ok(conn)
}

fn is_initialized(conn: &Connection) -> Result<bool, String> {
  let value: Option<String> = conn
    .query_row(
      "SELECT value FROM app_meta WHERE key = 'initialized'",
      [],
      |row| row.get(0),
    )
    .optional()
    .map_err(|e| format!("Error al consultar metadatos: {e}"))?;
  Ok(value.as_deref() == Some("1"))
}

pub fn replace_all_data(conn: &mut Connection, data: &AppData) -> Result<(), String> {
  let tx = conn
    .transaction()
    .map_err(|e| format!("Error al iniciar transacción: {e}"))?;

  tx.execute_batch(
    "
    DELETE FROM tasks;
    DELETE FROM projects;
    DELETE FROM calendar_events;
    DELETE FROM reminders;
    DELETE FROM focus_sessions;
    DELETE FROM settings;
    ",
  )
  .map_err(|e| format!("Error al limpiar tablas: {e}"))?;

  settings::save(&tx, &data.settings)?;

  for task in &data.tasks {
    tasks::upsert(&tx, task)?;
  }
  for project in &data.projects {
    projects::upsert(&tx, project)?;
  }
  for event in &data.events {
    events::upsert(&tx, event)?;
  }
  for reminder in &data.reminders {
    reminders::upsert(&tx, reminder)?;
  }
  for session in &data.sessions {
    sessions::upsert(&tx, session)?;
  }

  tx.execute(
    "INSERT INTO app_meta (key, value) VALUES ('initialized', '1')
     ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [],
  )
  .map_err(|e| format!("Error al guardar estado de inicialización: {e}"))?;

  tx.commit()
    .map_err(|e| format!("Error al confirmar transacción: {e}"))
}

pub fn load_or_seed(conn: &mut Connection, defaults: &AppData) -> Result<AppData, String> {
  if !is_initialized(conn)? {
    replace_all_data(conn, defaults)?;
  }

  Ok(AppData {
    settings: settings::load(conn)?.unwrap_or_else(|| defaults.settings.clone()),
    tasks: tasks::load_all(conn)?,
    projects: projects::load_all(conn)?,
    events: events::load_all(conn)?,
    reminders: reminders::load_all(conn)?,
    sessions: sessions::load_all(conn)?,
  })
}

#[cfg(test)]
mod tests {
  use super::*;
  use models::{CalendarEvent, FocusSession, Project, Reminder, Task, UserSettings};

  fn sample_data() -> AppData {
    AppData {
      settings: UserSettings {
        user_name: "Daniel".into(),
        dark: true,
        accent: "violet".into(),
        launch_on_startup: true,
        minimize_to_tray: false,
        native_notifications: true,
        sound_enabled: true,
        auto_backup: true,
        diagnostics: false,
        first_day_of_week: "Lunes".into(),
        language: "Español".into(),
      },
      tasks: vec![Task {
        id: 1,
        title: "Probar SQLite".into(),
        description: "Test CRUD".into(),
        project: "Cronia".into(),
        due: "Hoy".into(),
        start: "Hoy".into(),
        priority: "Alta".into(),
        status: "Pendiente".into(),
        category: "Desarrollo".into(),
        estimate: "30 min".into(),
        subtasks: "0/1".into(),
        done: false,
        color: "violet".into(),
      }],
      projects: vec![Project {
        id: 1,
        name: "Cronia".into(),
        desc: "App local".into(),
        color: "violet".into(),
        done: 1,
        total: 5,
        date: "Sin fecha".into(),
        archived: false,
      }],
      events: vec![CalendarEvent {
        id: 1,
        day: 15,
        title: "Sprint".into(),
        event_type: "Trabajo".into(),
        color: "blue".into(),
        time: "10:00".into(),
      }],
      reminders: vec![Reminder {
        id: 1,
        title: "Revisar DB".into(),
        date: "2026-11-24".into(),
        time: "09:00".into(),
        before: "15 minutos antes".into(),
        color: "orange".into(),
        enabled: true,
      }],
      sessions: vec![FocusSession {
        id: 1,
        task_title: "Probar SQLite".into(),
        duration_minutes: 25,
        completed_at: "10:00".into(),
        completion_rate: 100,
        color: "violet".into(),
      }],
    }
  }

  #[test]
  fn seed_crud_and_reset_work() {
    let mut conn = Connection::open_in_memory().unwrap();
    schema::init(&conn).unwrap();

    let defaults = sample_data();
    let loaded = load_or_seed(&mut conn, &defaults).unwrap();
    assert_eq!(loaded, defaults);

    tasks::delete(&conn, 1).unwrap();
    let after_delete = load_or_seed(&mut conn, &defaults).unwrap();
    assert!(after_delete.tasks.is_empty());

    let mut updated_settings = defaults.settings.clone();
    updated_settings.dark = false;
    updated_settings.user_name = "CroniaUser".into();
    settings::save(&conn, &updated_settings).unwrap();

    let mut ev = defaults.events[0].clone();
    ev.title = "Sprint actualizado".into();
    events::upsert(&conn, &ev).unwrap();
    reminders::delete(&conn, 1).unwrap();

    let after_edits = load_or_seed(&mut conn, &defaults).unwrap();
    assert_eq!(after_edits.settings.user_name, "CroniaUser");
    assert!(!after_edits.settings.dark);
    assert_eq!(after_edits.events[0].title, "Sprint actualizado");
    assert!(after_edits.reminders.is_empty());

    replace_all_data(&mut conn, &defaults).unwrap();
    let after_reset = load_or_seed(&mut conn, &defaults).unwrap();
    assert_eq!(after_reset, defaults);
  }
}
