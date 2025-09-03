// Compat layer para scrapers CJS existentes
import { bootstrapSchema, exec as dalExec, dbEngine } from './index.js';

const isPg = () => dbEngine() === 'pg';

// Traduce placeholders "?" a "$1,$2,..."
function toPgPlaceholders(sql, paramsLen) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`).replace(/datetime\('now'\)/gi, 'CURRENT_TIMESTAMP');
}

export const Database = {
  async connect() {
    await bootstrapSchema();
    return true;
  },

  async run(sql, params = []) {
    if (isPg()) {
      const s = toPgPlaceholders(sql, params.length);
      return dalExec(s, params);
    }
    // SQLite: también normalizamos datetime('now') por coherencia
    const s = sql.replace(/datetime\('now'\)/gi, 'CURRENT_TIMESTAMP');
    return dalExec(s, params);
  }
};

// CommonJS compatibility
export default Database;
