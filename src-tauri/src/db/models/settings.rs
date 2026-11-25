use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct UserSettings {
  pub user_name: String,
  pub dark: bool,
  pub accent: String,
  pub launch_on_startup: bool,
  pub minimize_to_tray: bool,
  pub native_notifications: bool,
  pub sound_enabled: bool,
  pub auto_backup: bool,
  pub diagnostics: bool,
  pub first_day_of_week: String,
  pub language: String,
}
