import sqlite3 from 'sqlite3';
import fs from 'fs';

const dbPath = process.env.DB_SQLITE_PATH || './src/db/database.db';
const exists = fs.existsSync(dbPath);

// Conectar (modo verbose para logs en dev)
sqlite3.verbose();
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('❌ Error abriendo SQLite:', err.message);
});

// Crear tablas la primera vez
export function bootstrapSchema() {
  console.log('🔧 Inicializando esquema de base de datos...');

  const schemaSQL = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    pregunta   TEXT NOT NULL,
    respuesta  TEXT NOT NULL,
    tipo_usuario TEXT,
    knowledge_refs TEXT,             -- títulos o IDs referenciados
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    useful  INTEGER NOT NULL CHECK (useful IN (0,1)),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
  );
  `;

  db.serialize(() => {
    db.exec(schemaSQL, (err) => {
      if (err) {
        console.error('❌ Error creando esquema SQLite:', err.message);
      } else {
        console.log('✅ Esquema SQLite inicializado');
      }
    });
  });
}
