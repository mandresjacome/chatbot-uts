import { db } from './index.js';

// Helpers de promesa para sqlite3
const run = (sql, params=[]) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this); // this.lastID, this.changes
    });
  });

const get = (sql, params=[]) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });

const all = (sql, params=[]) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

// Conversations
export const Conversations = {
  async create({ session_id, pregunta, respuesta, tipo_usuario, knowledge_refs }) {
    const res = await run(
      `INSERT INTO conversations (session_id, pregunta, respuesta, tipo_usuario, knowledge_refs)
       VALUES (?, ?, ?, ?, ?)`,
      [session_id, pregunta, respuesta, tipo_usuario, knowledge_refs || null]
    );
    return res.lastID;
  },
  async totals() {
    const row = await get(`SELECT COUNT(*) as total FROM conversations`);
    return row?.total || 0;
  },
  async last(n=10) {
    return all(
      `SELECT id, session_id, pregunta, substr(respuesta,1,120) AS respuesta_preview, tipo_usuario, created_at
       FROM conversations ORDER BY id DESC LIMIT ?`, [n]
    );
  }
};

// Feedback
export const Feedback = {
  async create({ conversation_id, useful, comment }) {
    const res = await run(
      `INSERT INTO feedback (conversation_id, useful, comment) VALUES (?, ?, ?)`,
      [conversation_id, useful ? 1 : 0, comment || null]
    );
    return res.lastID;
  },
  async stats() {
    const row = await get(
      `SELECT 
          COUNT(*) AS total, 
          SUM(CASE WHEN useful=1 THEN 1 ELSE 0 END) AS positives
       FROM feedback`
    );
    const total = row?.total || 0;
    const positives = row?.positives || 0;
    const satisfaction = total ? Math.round((positives / total) * 100) : 0;
    return { total, positives, satisfaction };
  }
};
