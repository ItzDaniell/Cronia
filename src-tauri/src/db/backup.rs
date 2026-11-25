use super::models::BackupInfo;
use rusqlite::{Connection, backup::Backup, params};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

fn sanitize_file_name(name: &str) -> Result<String, String> {
  if name.is_empty()
    || !name.ends_with(".db")
    || name.contains('/')
    || name.contains('\\')
    || name.contains("..")
  {
    return Err("Nombre de copia de seguridad inválido".into());
  }
  Ok(name.to_string())
}

fn unix_secs(time: SystemTime) -> u64 {
  time
    .duration_since(UNIX_EPOCH)
    .map(|d| d.as_secs())
    .unwrap_or(0)
}

fn format_timestamp(secs: u64) -> String {
  // Simple readable UTC timestamp key without extra chrono dependency
  format!("{secs}")
}

pub fn create_backup(conn: &Connection, backups_dir: &Path) -> Result<BackupInfo, String> {
  fs::create_dir_all(backups_dir)
    .map_err(|e| format!("No se pudo crear la carpeta de respaldos: {e}"))?;

  let ts = unix_secs(SystemTime::now());
  let file_name = format!("cronia-backup-{ts}.db");
  let target_path: PathBuf = backups_dir.join(&file_name);

  if target_path.exists() {
    let _ = fs::remove_file(&target_path);
  }

  let target_str = target_path
    .to_str()
    .ok_or_else(|| "Ruta de respaldo inválida".to_string())?;

  conn
    .execute("VACUUM INTO ?1", params![target_str])
    .map_err(|e| format!("Error al generar copia de seguridad SQLite: {e}"))?;

  let meta = fs::metadata(&target_path)
    .map_err(|e| format!("No se pudo leer metadatos del respaldo: {e}"))?;

  Ok(BackupInfo {
    file_name,
    path: target_str.to_string(),
    size_bytes: meta.len(),
    created_at: format_timestamp(ts),
  })
}

pub fn list_backups(backups_dir: &Path) -> Result<Vec<BackupInfo>, String> {
  if !backups_dir.exists() {
    return Ok(Vec::new());
  }

  let mut items = Vec::new();
  let entries = fs::read_dir(backups_dir)
    .map_err(|e| format!("No se pudo listar la carpeta de respaldos: {e}"))?;

  for entry in entries.flatten() {
    let path = entry.path();
    if path.extension().and_then(|s| s.to_str()) != Some("db") {
      continue;
    }
    let Some(file_name) = path.file_name().and_then(|s| s.to_str()) else {
      continue;
    };
    let Ok(meta) = entry.metadata() else {
      continue;
    };
    let modified = meta.modified().map(unix_secs).unwrap_or(0);
    items.push(BackupInfo {
      file_name: file_name.to_string(),
      path: path.to_string_lossy().to_string(),
      size_bytes: meta.len(),
      created_at: format_timestamp(modified),
    });
  }

  items.sort_by(|a, b| b.file_name.cmp(&a.file_name));
  Ok(items)
}

pub fn restore_backup(
  dst_conn: &mut Connection,
  backups_dir: &Path,
  file_name: &str,
) -> Result<(), String> {
  let clean_name = sanitize_file_name(file_name)?;
  let src_path = backups_dir.join(&clean_name);

  if !src_path.exists() {
    return Err("La copia de seguridad seleccionada no existe".into());
  }

  let src_conn = Connection::open(&src_path)
    .map_err(|e| format!("No se pudo abrir la copia de seguridad: {e}"))?;

  {
    let backup = Backup::new(&src_conn, dst_conn)
      .map_err(|e| format!("Error al inicializar restauración SQLite: {e}"))?;
    backup
      .run_to_completion(100, Duration::from_millis(5), None)
      .map_err(|e| format!("Error al restaurar base de datos: {e}"))?;
  }

  // Asegurar que cualquier respaldo antiguo pase por las migraciones actuales
  super::schema::init(dst_conn)?;
  Ok(())
}
