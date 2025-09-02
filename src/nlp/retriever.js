// Importar Fuse.js para búsqueda difusa (fuzzy search)
import Fuse from 'fuse.js';
// Importar compromise para procesamiento de lenguaje natural
import nlp from 'compromise';
// Importar módulos del sistema de archivos y rutas
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Importar función de normalización de texto
import { normalize } from '../utils/normalize.js';

// Obtener la ruta del archivo actual y directorio para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Construir la ruta al archivo de base de conocimiento
const kbPath = path.join(__dirname, '..', 'data', 'knowledge.json');

// Cargar y parsear la base de conocimiento desde el archivo JSON
const KB = JSON.parse(fs.readFileSync(kbPath, 'utf8'));

// Precalcular campo combinado para búsqueda
KB.forEach(item => {
  item.searchText = normalize(
    `${item.pregunta} ${item.respuesta_texto} ${item.palabras_clave || ''}`
  );
});

// Configurar Fuse.js para búsqueda difusa inteligente
const fuse = new Fuse(KB, {
  includeScore: true,
  threshold: 0.55,        // tolerancia razonable
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    { name: 'pregunta',       weight: 0.45 },
    { name: 'palabras_clave', weight: 0.45 },
    { name: 'searchText',     weight: 0.10 }
  ]
});

/**
 * Recupera los mejores k fragmentos para la pregunta del usuario
 * filtrando por tipo de usuario cuando aplique.
 */
export function retrieveTopK({ query, userType = 'todos', k = 3 }) {
  // Normalizar la consulta para mejorar la búsqueda
  const clean = normalize(query);
  // Entities por si luego quieres usarlas (fechas, lugares, etc.)
  const doc = nlp(query);
  const fechas = doc.match('#Date').text(); // ejemplo leve

  // Realizar búsqueda difusa y procesar resultados
  const results = fuse.search(clean)
    .map(r => ({ ...r.item, _score: r.score }))
    .filter(it => it.tipo_usuario === userType || it.tipo_usuario === 'todos')
    .slice(0, k)
    .map((it, i) => ({
      id: it.id ?? i,
      text: it.respuesta_texto,
      titulo: it.pregunta,
      score: (1 - (it._score ?? 1)).toFixed(2)
    }));

  return { chunks: results, meta: { fechasDetectadas: fechas || null } };
}
