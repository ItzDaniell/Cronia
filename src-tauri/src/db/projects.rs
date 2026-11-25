use super::models::Project;
use rusqlite::{Connection, params};

pub fn load_all(conn: &Connection) -> Result<Vec<Project>, String> {
  let mut stmt = conn
    .prepare(
      "SELECT id, name, desc, color, done, total, date, archived
       FROM projects ORDER BY id ASC",
    )
    .map_err(|e| format!("Error al preparar consulta de proyectos: {e}"))?;

  let rows = stmt
    .query_map([], |row| {
      Ok(Project {
        id: row.get(0)?,
        name: row.get(1)?,
        desc: row.get(2)?,
        color: row.get(3)?,
        done: row.get(4)?,
        total: row.get(5)?,
        date: row.get(6)?,
        archived: row.get::<_, i64>(7)? != 0,
      })
    })
    .map_err(|e| format!("Error al leer proyectos: {e}"))?;

  rows
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| format!("Error al deserializar proyectos: {e}"))
}

pub fn upsert(conn: &Connection, p: &Project) -> Result<(), String> {
  conn
    .execute(
      "INSERT INTO projects (id, name, desc, color, done, total, date, archived)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         desc = excluded.desc,
         color = excluded.color,
         done = excluded.done,
         total = excluded.total,
         date = excluded.date,
         archived = excluded.archived",
      params![
        p.id,
        p.name,
        p.desc,
        p.color,
        p.done,
        p.total,
        p.date,
        p.archived as i64,
      ],
    )
    .map_err(|e| format!("Error al guardar proyecto: {e}"))?;
  Ok(())
}

pub fn delete(conn: &mut Connection, id: i64) -> Result<(), String> {
  let tx = conn
    .transaction()
    .map_err(|e| format!("Error al iniciar transacción de borrado de proyecto: {e}"))?;

  tx.execute(
    "UPDATE tasks SET project_id = NULL, project = 'Sin proyecto' WHERE project_id = ?1",
    params![id],
  )
  .map_err(|e| format!("Error al desvincular tareas del proyecto: {e}"))?;

  tx.execute("DELETE FROM projects WHERE id = ?1", params![id])
    .map_err(|e| format!("Error al eliminar proyecto: {e}"))?;

  tx.commit()
    .map_err(|e| format!("Error al confirmar borrado de proyecto: {e}"))
}
