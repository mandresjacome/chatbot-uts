// src/db/index.js
// Soporta SQLite (dev) y PostgreSQL (prod) sin cambiar controladores

import fs from 'fs';
import sqlite3 from 'sqlite3';
import pg from 'pg';

const isPg = !!process.env.DATABASE_URL;
let engine = isPg ? 'pg' : 'sqlite';

let sqliteDb = null;
let pgPool = null;

if (engine === 'pg') {
  const { Pool } = pg;
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Render PG requiere SSL
  });
} else {
  // SQLite por defecto (dev)
  const dbPath = process.env.DB_SQLITE_PATH || './src/db/database.db';
  const exists = fs.existsSync(dbPath);
  sqlite3.verbose();
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('SQLite open error:', err.message);
  });
  if (!exists) console.log('SQLite DB creada en', dbPath);
}

// ------- Helpers unificados -------

// Ejecuta INSERT/UPDATE/DELETE; puede devolver el id insertado si hay RETURNING
export async function exec(sql, params = []) {
  if (engine === 'pg') {
    const res = await pgPool.query(sql, params);
    // Si el INSERT trae RETURNING id, devuélvelo
    if (res?.rows?.[0]?.id !== undefined) return { insertId: res.rows[0].id };
    return { affected: res.rowCount ?? 0 };
  }
  // sqlite
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ insertId: this.lastID, affected: this.changes });
    });
  });
}

// Devuelve una sola fila
export async function queryOne(sql, params = []) {
  if (engine === 'pg') {
    const res = await pgPool.query(sql, params);
    return res.rows?.[0] ?? null;
  }
  return new Promise((resolve, reject) => {
    sqliteDb.get(sql, params, (err, row) => (err ? reject(err) : resolve(row || null)));
  });
}

// Devuelve varias filas
export async function queryAll(sql, params = []) {
  if (engine === 'pg') {
    const res = await pgPool.query(sql, params);
    return res.rows ?? [];
  }
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows || [])));
  });
}

export function dbEngine() { return engine; }

// ------- Bootstrap de esquema (create tables if not exists) -------
export async function bootstrapSchema() {
  if (engine === 'pg') {
    const sql = `
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      session_id TEXT NOT NULL,
      pregunta   TEXT NOT NULL,
      respuesta  TEXT NOT NULL,
      tipo_usuario TEXT,
      knowledge_refs TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      useful BOOLEAN NOT NULL,
      comment TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS knowledge_base (
      id SERIAL PRIMARY KEY,
      pregunta TEXT NOT NULL,
      respuesta_texto TEXT,
      tipo_usuario TEXT NOT NULL DEFAULT 'todos',
      recurso_url TEXT,
      tipo_recurso TEXT,
      nombre_recurso TEXT,
      palabras_clave TEXT,
      activo BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`;
    await exec(sql);
    console.log('✅ Esquema PostgreSQL verificado');
    return;
  }

  // SQLite - ejecutar cada CREATE TABLE por separado
  await exec('PRAGMA foreign_keys = ON;');
  
  await exec(`CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    pregunta   TEXT NOT NULL,
    respuesta  TEXT NOT NULL,
    tipo_usuario TEXT,
    knowledge_refs TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`);
  
  await exec(`CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    useful  INTEGER NOT NULL CHECK (useful IN (0,1)),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
  );`);
  
  await exec(`CREATE TABLE IF NOT EXISTS knowledge_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pregunta TEXT NOT NULL,
    respuesta_texto TEXT,
    tipo_usuario TEXT NOT NULL DEFAULT 'todos',
    recurso_url TEXT,
    tipo_recurso TEXT,
    nombre_recurso TEXT,
    palabras_clave TEXT,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`);
  console.log('✅ Esquema SQLite verificado');
}
