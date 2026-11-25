use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Subtask {
  pub id: String,
  pub title: String,
  pub completed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct RecurrenceRule {
  pub frequency: String,
  pub interval: i64,
  pub end_date: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Task {
  pub id: i64,
  pub title: String,
  pub description: String,
  #[serde(default)]
  pub project_id: Option<i64>,
  pub project: String,
  pub start_date: Option<String>,
  pub due_date: Option<String>,
  pub priority: String,
  pub status: String,
  pub category: String,
  pub tags: Vec<String>,
  pub subtasks: Vec<Subtask>,
  pub estimated_minutes: i64,
  pub recurrence: RecurrenceRule,
  pub color: String,
  pub created_at: String,
  pub updated_at: String,
  pub completed_at: Option<String>,
  pub deleted_at: Option<String>,
}
