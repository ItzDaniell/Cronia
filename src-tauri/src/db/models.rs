use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Task {
  pub id: i64,
  pub title: String,
  pub description: String,
  pub project: String,
  pub due: String,
  pub start: String,
  pub priority: String,
  pub status: String,
  pub category: String,
  pub estimate: String,
  pub subtasks: String,
  pub done: bool,
  pub color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Project {
  pub id: i64,
  pub name: String,
  pub desc: String,
  pub color: String,
  pub done: i64,
  pub total: i64,
  pub date: String,
  pub archived: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct CalendarEvent {
  pub id: i64,
  pub day: i64,
  pub title: String,
  #[serde(rename = "type")]
  pub event_type: String,
  pub color: String,
  pub time: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Reminder {
  pub id: i64,
  pub title: String,
  pub date: String,
  pub time: String,
  pub before: String,
  pub color: String,
  pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct FocusSession {
  pub id: i64,
  pub task_title: String,
  pub duration_minutes: i64,
  pub completed_at: String,
  pub completion_rate: i64,
  pub color: String,
}

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

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct AppData {
  pub settings: UserSettings,
  pub tasks: Vec<Task>,
  pub projects: Vec<Project>,
  pub events: Vec<CalendarEvent>,
  pub reminders: Vec<Reminder>,
  pub sessions: Vec<FocusSession>,
}
