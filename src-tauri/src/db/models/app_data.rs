use super::{CalendarEvent, FocusSession, Project, Reminder, Task, UserSettings};
use serde::{Deserialize, Serialize};

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
