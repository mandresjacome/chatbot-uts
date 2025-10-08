// Sistema de logging completo para el chatbot
import { existsSync, mkdirSync, appendFileSync } from 'fs';
import path from 'path';

class Logger {
  constructor() {
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m'
    };
    
    // Crear directorio de logs si no existe
    this.logsDir = path.join(process.cwd(), 'logs');
    if (!existsSync(this.logsDir)) {
      mkdirSync(this.logsDir, { recursive: true });
    }
  }

  _formatTime() {
    const now = new Date();
    return now.toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  _getLogFileName() {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logsDir, `chatbot-${date}.log`);
  }

  _log(level, category, message, data = null) {
    const timestamp = this._formatTime();
    const color = this._getColor(level);
    const emoji = this._getEmoji(level, category);
    
    // Formato compacto para consola (una línea con emojis)
    let consoleMsg = `${color}${emoji} ${message}${this.colors.reset}`;
    
    // Agregar datos importantes en la misma línea si existen
    if (data) {
      const compactData = this._formatCompactData(data);
      if (compactData) {
        consoleMsg += ` ${this.colors.cyan}→ ${compactData}${this.colors.reset}`;
      }
    }
    
    console.log(consoleMsg);
    
    // Formato para archivo (sin colores pero con emojis)
    let fileMsg = `[${timestamp}] ${emoji} ${message}`;
    if (data) {
      fileMsg += ` | ${JSON.stringify(data)}`;
    }
    
    // Escribir al archivo
    try {
      appendFileSync(this._getLogFileName(), fileMsg + '\n');
    } catch (err) {
      console.error('Error escribiendo log:', err);
    }
  }

  _getColor(level) {
    switch (level.toLowerCase()) {
      case 'error': return this.colors.red;
      case 'warn': return this.colors.yellow;
      case 'info': return this.colors.green;
      case 'debug': return this.colors.blue;
      case 'chat': return this.colors.magenta;
      case 'db': return this.colors.cyan;
      case 'startup': return this.colors.bright + this.colors.green;
      default: return this.colors.white;
    }
  }

  _getEmoji(level, category) {
    // Emojis por categoría específica
    if (category === 'CHAT') {
      switch (level) {
        case 'chat': return '💬';
        case 'debug': return '🔍';
        default: return '🤖';
      }
    }
    
    if (category === 'DATABASE' || category === 'DB') return '💾';
    if (category === 'AI') return '🧠';
    if (category === 'RETRIEVER') return '📚';
    if (category === 'ADMIN') return '👨‍💼';
    if (category === 'FEEDBACK') return '⭐';
    if (category === 'HEALTH') return '💚';
    if (category === 'KB') return '📖';
    
    // Emojis por nivel
    switch (level.toLowerCase()) {
      case 'startup': return '🚀';
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'info': return '💡';
      case 'debug': return '🔍';
      default: return '📄';
    }
  }

  _formatCompactData(data) {
    if (!data || typeof data !== 'object') return '';
    
    const important = [];
    
    // Información importante para mostrar en línea
    if (data.sessionId) important.push(`sesión:${data.sessionId.slice(-6)}`);
    if (data.userType) important.push(`${data.userType}`);
    if (data.conversationId) important.push(`#${data.conversationId}`);
    if (data.count !== undefined) important.push(`${data.count} elementos`);
    if (data.totalTimeMs) important.push(`${data.totalTimeMs}ms`);
    if (data.llmTimeMs) important.push(`IA:${data.llmTimeMs}ms`);
    if (data.retrievalTimeMs) important.push(`KB:${data.retrievalTimeMs}ms`);
    if (data.dbTimeMs) important.push(`BD:${data.dbTimeMs}ms`);
    if (data.evidenceCount !== undefined) important.push(`evidencia:${data.evidenceCount}`);
    if (data.responseLength) important.push(`resp:${data.responseLength}chars`);
    if (data.questionLength) important.push(`preg:${data.questionLength}chars`);
    if (data.port) important.push(`puerto:${data.port}`);
    if (data.engine) important.push(`BD:${data.engine}`);
    if (data.feedbackCount !== undefined) important.push(`feedback:${data.feedbackCount}`);
    if (data.useful !== undefined) important.push(data.useful ? '👍' : '👎');
    
    return important.slice(0, 4).join(' | '); // Máximo 4 elementos
  }

  // Logs de inicio del sistema
  startup(message, data = null) {
    this._log('startup', 'SYSTEM', message, data);
  }

  // Logs de información general
  info(category, message, data = null) {
    this._log('info', category, message, data);
  }

  // Logs de conversaciones del chatbot
  chat(action, message, data = null) {
    const shortMsg = this._formatChatMessage(action, message, data);
    this._log('chat', 'CHAT', shortMsg, data);
  }

  _formatChatMessage(action, message, data) {
    if (action === 'Inicio') {
      const userType = data?.userType || 'usuario';
      const question = data?.question || message;
      return `${userType} pregunta: "${question}"`;
    }
    if (action === 'Nueva conversación') {
      const timing = data?.timing || {};
      const total = timing.totalTimeMs || 0;
      const evidence = data?.evidenceCount || 0;
      return `Respuesta completada en ${total}ms con ${evidence} evidencias`;
    }
    return `${action}: ${message}`;
  }

  // Logs de base de datos
  db(action, message, data = null) {
    this._log('db', 'DATABASE', `${action}: ${message}`, data);
  }

  // Logs de debug
  debug(category, message, data = null) {
    this._log('debug', category, message, data);
  }

  // Logs de advertencias
  warn(category, message, data = null) {
    this._log('warn', category, message, data);
  }

  // Logs de errores
  error(category, message, error = null) {
    const errorData = error ? {
      message: error.message,
      stack: error.stack,
      ...(error.cause && { cause: error.cause })
    } : null;
    this._log('error', category, message, errorData);
  }

  // Log especial para el arranque del servidor
  serverStart(port, version = '1.3.1') {
    console.log(`\n${this.colors.green}${this.colors.bright}🚀 CHATBOT UTS v${version} → Puerto ${port} → ${this._formatTime()}${this.colors.reset}\n`);
    this._log('startup', 'SERVER', `Servidor iniciado exitosamente`, { version, port });
  }

  // Log de carga de conocimiento
  knowledgeLoaded(count, source = 'knowledge.json') {
    this.startup(`Base de conocimiento cargada`, { count, source });
  }

  // Log de conexión a base de datos
  dbConnected(engine, details = {}) {
    this.startup(`Base de datos conectada`, { engine, ...details });
  }

  // Log de conversación completa
  conversation(sessionId, userType, question, response, evidence, timing = {}) {
    this.chat('Nueva conversación', '', {
      sessionId,
      userType,
      question: question.substring(0, 50) + (question.length > 50 ? '...' : ''),
      responseLength: response.length,
      evidenceCount: evidence?.length || 0,
      timing
    });
  }

  // Log de operaciones de base de datos
  dbOperation(operation, table, data = {}) {
    this.db(operation, `${table} → ${operation} exitoso`, data);
  }
}

// Exportar instancia singleton
export const logger = new Logger();
export default logger;
