pub mod backup;
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
use std::path::{Path, PathBuf};
use std::sync::Mutex;

pub struct DbState {
  pub conn: Mutex<Connection>,
  pub backups_dir: PathBuf,
}

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

  // Borrado respetando orden de claves foráneas
  tx.execute_batch(
    "
    DELETE FROM focus_sessions;
    DELETE FROM tasks;
    DELETE FROM projects;
    DELETE FROM calendar_events;
    DELETE FROM reminders;
    DELETE FROM settings;
    ",
  )
  .map_err(|e| format!("Error al limpiar tablas: {e}"))?;

  settings::save(&tx, &data.settings)?;

  // Inserción respetando claves foráneas: projects -> tasks -> focus_sessions
  for project in &data.projects {
    projects::upsert(&tx, project)?;
  }
  for task in &data.tasks {
    tasks::upsert(&tx, task)?;
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

pub fn load_all_data(conn: &Connection, fallback_settings: &models::UserSettings) -> Result<AppData, String> {
  Ok(AppData {
    settings: settings::load(conn)?.unwrap_or_else(|| fallback_settings.clone()),
    tasks: tasks::load_all(conn)?,
    projects: projects::load_all(conn)?,
    events: events::load_all(conn)?,
    reminders: reminders::load_all(conn)?,
    sessions: sessions::load_all(conn)?,
  })
}

pub fn load_or_seed(conn: &mut Connection, defaults: &AppData) -> Result<AppData, String> {
  if !is_initialized(conn)? {
    replace_all_data(conn, defaults)?;
  }
  load_all_data(conn, &defaults.settings)
}

#[cfg(test)]
mod tests {
  use super::*;
  use models::{
    CalendarEvent, FocusSession, Project, RecurrenceRule, Reminder, Subtask, Task, UserSettings,
  };

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
      tasks: vec![Task {
        id: 1,
        title: "Probar SQLite".into(),
        description: "Test CRUD con subtareas, etiquetas y recurrencia".into(),
        project_id: Some(1),
        project: "Cronia".into(),
        start_date: Some("2026-11-24".into()),
        due_date: Some("2026-11-25".into()),
        priority: "High".into(),
        status: "Pending".into(),
        category: "Desarrollo".into(),
        tags: vec!["sqlite".into(), "backend".into()],
        subtasks: vec![Subtask {
          id: "st-1".into(),
          title: "Crear tabla".into(),
          completed: true,
        }],
        estimated_minutes: 45,
        recurrence: RecurrenceRule {
          frequency: "weekly".into(),
          interval: 1,
          end_date: None,
        },
        color: "violet".into(),
        created_at: "2026-11-24T10:00:00Z".into(),
        updated_at: "2026-11-24T10:00:00Z".into(),
        completed_at: None,
        deleted_at: None,
      }],
      events: vec![CalendarEvent {
        id: 1,
        day: 24,
        date: "2026-11-24".into(),
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
        task_id: Some(1),
        task_title: "Probar SQLite".into(),
        duration_minutes: 25,
        date: "2026-11-24".into(),
        completed_at: "10:00".into(),
        completion_rate: 100,
        color: "violet".into(),
      }],
    }
  }

  #[test]
  fn seed_crud_fk_project_delete_and_reset_work() {
    let mut conn = Connection::open_in_memory().unwrap();
    schema::init(&conn).unwrap();

    let defaults = sample_data();
    let loaded = load_or_seed(&mut conn, &defaults).unwrap();
    assert_eq!(loaded, defaults);

    // Deleting a project detaches linked tasks cleanly without deleting them
    projects::delete(&mut conn, 1).unwrap();
    let after_proj_del = load_or_seed(&mut conn, &defaults).unwrap();
    assert!(after_proj_del.projects.is_empty());
    assert_eq!(after_proj_del.tasks[0].project_id, None);
    assert_eq!(after_proj_del.tasks[0].project, "Sin proyecto");

    // Soft delete + restore + permanent delete
    tasks::soft_delete(&conn, 1, "2026-11-24T12:00:00Z").unwrap();
    assert_eq!(
      tasks::load_all(&conn).unwrap()[0].deleted_at.as_deref(),
      Some("2026-11-24T12:00:00Z")
    );
    tasks::restore(&conn, 1, "2026-11-24T12:05:00Z").unwrap();
    assert!(tasks::load_all(&conn).unwrap()[0].deleted_at.is_none());
    tasks::delete_permanent(&conn, 1).unwrap();
    assert!(tasks::load_all(&conn).unwrap().is_empty());

    // Reset restores defaults cleanly
    replace_all_data(&mut conn, &defaults).unwrap();
    let after_reset = load_or_seed(&mut conn, &defaults).unwrap();
    assert_eq!(after_reset, defaults);
  }

  #[test]
  fn backup_and_restore_roundtrip_works() {
    let temp_dir = std::env::temp_dir().join(format!(
      "cronia-db-test-{}",
      std::process::id()
    ));
    let _ = std::fs::remove_dir_all(&temp_dir);
    let db_path = temp_dir.join("cronia.db");
    let backups_dir = temp_dir.join("backups");

    let mut conn = open_db(&db_path).unwrap();
    let defaults = sample_data();
    load_or_seed(&mut conn, &defaults).unwrap();

    let info = backup::create_backup(&conn, &backups_dir).unwrap();
    assert!(info.size_bytes > 0);
    assert_eq!(backup::list_backups(&backups_dir).unwrap().len(), 1);

    // Mutate DB after backup
    tasks::delete_permanent(&conn, 1).unwrap();
    assert!(tasks::load_all(&conn).unwrap().is_empty());

    // Restore backup and verify task is back
    backup::restore_backup(&mut conn, &backups_dir, &info.file_name).unwrap();
    let restored = load_all_data(&conn, &defaults.settings).unwrap();
    assert_eq!(restored.tasks.len(), 1);
    assert_eq!(restored.tasks[0].title, "Probar SQLite");

    drop(conn);
    let _ = std::fs::remove_dir_all(&temp_dir);
  }

  #[test]
  fn migrates_legacy_v2_database_without_project_id_or_dates() {
    let conn = Connection::open_in_memory().unwrap();
    // Simular un cronia.db previo (sin project_id en tasks ni date en events/sessions)
    conn
      .execute_batch(
        "
        CREATE TABLE tasks (
          id INTEGER PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          project TEXT NOT NULL,
          priority TEXT NOT NULL,
          status TEXT NOT NULL,
          category TEXT NOT NULL,
          color TEXT NOT NULL
        );
        CREATE TABLE calendar_events (
          id INTEGER PRIMARY KEY,
          day INTEGER NOT NULL,
          title TEXT NOT NULL,
          event_type TEXT NOT NULL,
          color TEXT NOT NULL,
          time TEXT NOT NULL
        );
        CREATE TABLE focus_sessions (
          id INTEGER PRIMARY KEY,
          task_title TEXT NOT NULL,
          duration_minutes INTEGER NOT NULL,
          completed_at TEXT NOT NULL,
          completion_rate INTEGER NOT NULL,
          color TEXT NOT NULL
        );
        ",
      )
      .unwrap();

    // Debe migrar columnas y crear todos los índices sin error
    schema::init(&conn).unwrap();
    assert!(tasks::load_all(&conn).unwrap().is_empty());
    assert!(events::load_all(&conn).unwrap().is_empty());
    assert!(sessions::load_all(&conn).unwrap().is_empty());
  }
}
