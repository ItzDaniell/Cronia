use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct BackupInfo {
  pub file_name: String,
  pub path: String,
  pub size_bytes: u64,
  pub created_at: String,
}
