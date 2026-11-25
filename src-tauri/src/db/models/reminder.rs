use serde::{Deserialize, Serialize};

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
