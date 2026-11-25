use serde::{Deserialize, Serialize};

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
