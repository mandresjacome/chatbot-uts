// CommonJS adapter for Database module
async function loadDatabase() {
  const module = await import('../db/database.js');
  return module.default || module.Database;
}

module.exports = loadDatabase;
