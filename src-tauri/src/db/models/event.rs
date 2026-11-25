use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct CalendarEvent {
  pub id: i64,
  pub day: i64,
  #[serde(default)]
  pub date: String,
  pub title: String,
  #[serde(rename = "type")]
  pub event_type: String,
  pub color: String,
  pub time: String,
}
