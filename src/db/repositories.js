// src/db/repositories.js
import { exec, queryOne, queryAll, dbEngine } from './index.js';

const isPg = dbEngine() === 'pg';

export const Conversations = {
  async create({ session_id, pregunta, respuesta, tipo_usuario, knowledge_refs }) {
    if (isPg) {
      const res = await exec(
        `INSERT INTO conversations (session_id, pregunta, respuesta, tipo_usuario, knowledge_refs)
         VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [session_id, pregunta, respuesta, tipo_usuario, knowledge_refs || null]
      );
      return res.insertId;
    } else {
      const res = await exec(
        `INSERT INTO conversations (session_id, pregunta, respuesta, tipo_usuario, knowledge_refs)
         VALUES (?,?,?,?,?)`,
        [session_id, pregunta, respuesta, tipo_usuario, knowledge_refs || null]
      );
      return res.insertId;
    }
  },

  async getHistoryBySession(session_id, limit = 5) {
    return queryAll(
      `SELECT pregunta, respuesta, created_at
       FROM conversations
       WHERE session_id = ${isPg ? '$1' : '?'}
       ORDER BY id ASC
       LIMIT ${isPg ? '$2' : '?'}`,
      [session_id, limit]
    );
  },

  async totals() {
    const row = await queryOne(`SELECT COUNT(*) AS total FROM conversations`);
    // PG devuelve string en COUNT(); SQLite número. Normalizamos:
    return Number(row?.total ?? 0);
  },

  async last(n = 10) {
    return queryAll(
      `SELECT id, tipo_usuario as user_id, pregunta as question, 
              substr(respuesta,1,120) AS response_text, 
              tipo_usuario, created_at
       FROM conversations
       ORDER BY id DESC
       LIMIT ${isPg ? '$1' : '?'};`,
      [n]
    );
  },

  async getByUserType(userType, limit = 10) {
    return queryAll(
      `SELECT pregunta as user_message, respuesta, created_at, session_id
       FROM conversations
       WHERE tipo_usuario = ${isPg ? '$1' : '?'}
       ORDER BY id DESC
       LIMIT ${isPg ? '$2' : '?'}`,
      [userType, limit]
    );
  },
};

export const Feedback = {
  async create({ conversation_id, useful, comment }) {
    if (isPg) {
      const res = await exec(
        `INSERT INTO feedback (conversation_id, useful, comment)
         VALUES ($1,$2,$3) RETURNING id`,
        [conversation_id, !!useful, comment || null]
      );
      return res.insertId;
    } else {
      const res = await exec(
        `INSERT INTO feedback (conversation_id, useful, comment) VALUES (?,?,?)`,
        [conversation_id, useful ? 1 : 0, comment || null]
      );
      return res.insertId;
    }
  },

  async stats() {
    const rows = await queryAll(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN useful ${isPg ? 'IS TRUE' : '= 1'} THEN 1 ELSE 0 END) AS positives
      FROM feedback
    `);
    const row = rows?.[0] || {};
    const total = Number(row.total || 0);
    const positives = Number(row.positives || 0);
    const negatives = total - positives;
    const satisfaction = total ? Math.round((positives / total) * 100) : 0;
    return { total, positive: positives, negative: negatives, satisfactionRate: satisfaction };
  },

  async list() {
    const query = `
      SELECT 
        f.id,
        f.conversation_id,
        f.useful,
        f.comment,
        f.created_at,
        c.pregunta as question,
        c.respuesta as response,
        c.tipo_usuario as user_id
      FROM feedback f
      LEFT JOIN conversations c ON f.conversation_id = c.id
      ORDER BY f.created_at DESC
      LIMIT 100
    `;
    return queryAll(query);
  },
};
