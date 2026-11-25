use super::models::UserSettings;
use rusqlite::{Connection, OptionalExtension, params};

pub fn load(conn: &Connection) -> Result<Option<UserSettings>, String> {
  conn
    .query_row(
      "SELECT user_name, dark, accent, launch_on_startup, minimize_to_tray,
              native_notifications, sound_enabled, auto_backup, diagnostics,
              first_day_of_week, language
       FROM settings WHERE id = 1",
      [],
      |row| {
        Ok(UserSettings {
          user_name: row.get(0)?,
          dark: row.get::<_, i64>(1)? != 0,
          accent: row.get(2)?,
          launch_on_startup: row.get::<_, i64>(3)? != 0,
          minimize_to_tray: row.get::<_, i64>(4)? != 0,
          native_notifications: row.get::<_, i64>(5)? != 0,
          sound_enabled: row.get::<_, i64>(6)? != 0,
          auto_backup: row.get::<_, i64>(7)? != 0,
          diagnostics: row.get::<_, i64>(8)? != 0,
          first_day_of_week: row.get(9)?,
          language: row.get(10)?,
        })
      },
    )
    .optional()
    .map_err(|e| format!("Error al cargar configuración: {e}"))
}

pub fn save(conn: &Connection, s: &UserSettings) -> Result<(), String> {
  conn
    .execute(
      "INSERT INTO settings (
         id, user_name, dark, accent, launch_on_startup, minimize_to_tray,
         native_notifications, sound_enabled, auto_backup, diagnostics,
         first_day_of_week, language
       ) VALUES (1, ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
       ON CONFLICT(id) DO UPDATE SET
         user_name = excluded.user_name,
         dark = excluded.dark,
         accent = excluded.accent,
         launch_on_startup = excluded.launch_on_startup,
         minimize_to_tray = excluded.minimize_to_tray,
         native_notifications = excluded.native_notifications,
         sound_enabled = excluded.sound_enabled,
         auto_backup = excluded.auto_backup,
         diagnostics = excluded.diagnostics,
         first_day_of_week = excluded.first_day_of_week,
         language = excluded.language",
      params![
        s.user_name,
        s.dark as i64,
        s.accent,
        s.launch_on_startup as i64,
        s.minimize_to_tray as i64,
        s.native_notifications as i64,
        s.sound_enabled as i64,
        s.auto_backup as i64,
        s.diagnostics as i64,
        s.first_day_of_week,
        s.language,
      ],
    )
    .map_err(|e| format!("Error al guardar configuración: {e}"))?;
  Ok(())
}
