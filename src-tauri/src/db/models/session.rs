use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct FocusSession {
  pub id: i64,
  #[serde(default)]
  pub task_id: Option<i64>,
  pub task_title: String,
  pub duration_minutes: i64,
  #[serde(default)]
  pub date: String,
  pub completed_at: String,
  pub completion_rate: i64,
  pub color: String,
}
