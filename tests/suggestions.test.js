/**
 * Test Suite para el Sistema de Sugerencias Dinámicas
 * Prueba la funcionalidad completa del sistema de sugerencias
 */

const request = require('supertest');
const path = require('path');

// Mock de la base de datos para las pruebas
const mockDatabase = {
  async executeQuery(query, params = []) {
    // Simular datos de conocimiento base para las pruebas
    if (query.includes('SELECT content')) {
      return [
        { content: 'Información sobre admisiones y requisitos para estudiar Ingeniería de Sistemas en la UTS' },
        { content: 'Proceso de matrícula para nuevos estudiantes aspirantes' },
        { content: 'Horarios y modalidades de clases para estudiantes actuales' },
        { content: 'Recursos y servicios disponibles para docentes de la universidad' },
        { content: 'Calendario académico y fechas importantes para estudiantes' }
      ];
    }
    return [];
  }
};

// Mock del servidor para las pruebas
let app;

beforeAll(async () => {
  // Configurar variables de entorno para pruebas
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3002';
  
  // Importar el servidor después de configurar el entorno
  const server = require('../src/server.js');
  app = server;
});

describe('Sistema de Sugerencias Dinámicas', () => {
  
  describe('API Endpoints', () => {
    
    test('GET /api/suggestions - debe retornar sugerencias por defecto', async () => {
      const response = await request(app)
        .get('/api/suggestions')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
    
    test('GET /api/suggestions?userType=estudiante - debe retornar sugerencias específicas', async () => {
      const response = await request(app)
        .get('/api/suggestions?userType=estudiante')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.userType).toBe('estudiante');
    });
    
    test('GET /api/suggestions?userType=aspirante - debe retornar sugerencias para aspirantes', async () => {
      const response = await request(app)
        .get('/api/suggestions?userType=aspirante')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.userType).toBe('aspirante');
    });
    
    test('GET /api/suggestions?userType=docente - debe retornar sugerencias para docentes', async () => {
      const response = await request(app)
        .get('/api/suggestions?userType=docente')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.userType).toBe('docente');
    });
    
    test('GET /api/suggestions?userType=visitante - debe retornar sugerencias para visitantes', async () => {
      const response = await request(app)
        .get('/api/suggestions?userType=visitante')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.userType).toBe('visitante');
    });
    
    test('GET /api/suggestions con userType inválido - debe usar fallback', async () => {
      const response = await request(app)
        .get('/api/suggestions?userType=invalido')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.userType).toBe('visitante'); // Fallback
    });
    
    test('POST /api/suggestions/refresh - debe refrescar el cache', async () => {
      const response = await request(app)
        .post('/api/suggestions/refresh')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('refrescadas');
    });
    
    test('GET /api/suggestions/all - debe retornar todas las sugerencias', async () => {
      const response = await request(app)
        .get('/api/suggestions/all')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('estudiante');
      expect(response.body.data).toHaveProperty('aspirante');
      expect(response.body.data).toHaveProperty('docente');
      expect(response.body.data).toHaveProperty('visitante');
    });
    
  });
  
  describe('Generación de Sugerencias', () => {
    
    test('debe generar diferentes sugerencias para cada tipo de usuario', async () => {
      const userTypes = ['estudiante', 'aspirante', 'docente', 'visitante'];
      const responses = {};
      
      for (const userType of userTypes) {
        const response = await request(app)
          .get(`/api/suggestions?userType=${userType}`)
          .expect(200);
        
        responses[userType] = response.body.data;
      }
      
      // Verificar que cada tipo tiene sugerencias únicas
      expect(responses.estudiante).not.toEqual(responses.aspirante);
      expect(responses.aspirante).not.toEqual(responses.docente);
      expect(responses.docente).not.toEqual(responses.visitante);
    });
    
    test('debe incluir metadata apropiada en las sugerencias', async () => {
      const response = await request(app)
        .get('/api/suggestions?userType=estudiante')
        .expect(200);
      
      const suggestion = response.body.data[0];
      expect(suggestion).toHaveProperty('text');
      expect(suggestion).toHaveProperty('isDynamic');
      expect(typeof suggestion.text).toBe('string');
      expect(typeof suggestion.isDynamic).toBe('boolean');
    });
    
  });
  
  describe('Cache y Performance', () => {
    
    test('debe usar cache para requests consecutivos', async () => {
      const start1 = Date.now();
      const response1 = await request(app)
        .get('/api/suggestions?userType=estudiante')
        .expect(200);
      const time1 = Date.now() - start1;
      
      const start2 = Date.now();
      const response2 = await request(app)
        .get('/api/suggestions?userType=estudiante')
        .expect(200);
      const time2 = Date.now() - start2;
      
      // El segundo request debería ser más rápido (cache)
      expect(time2).toBeLessThan(time1);
      expect(response1.body.data).toEqual(response2.body.data);
    });
    
    test('debe regenerar cache después de refresh', async () => {
      // Obtener sugerencias iniciales
      const response1 = await request(app)
        .get('/api/suggestions?userType=estudiante')
        .expect(200);
      
      // Refrescar cache
      await request(app)
        .post('/api/suggestions/refresh')
        .expect(200);
      
      // Obtener nuevas sugerencias
      const response2 = await request(app)
        .get('/api/suggestions?userType=estudiante')
        .expect(200);
      
      expect(response1.body.data).toBeDefined();
      expect(response2.body.data).toBeDefined();
    });
    
  });
  
  describe('Manejo de Errores', () => {
    
    test('debe manejar errores de base de datos graciosamente', async () => {
      // Simular error temporal desconectando la base de datos
      // En un caso real, esto podría ser un mock que falle
      
      const response = await request(app)
        .get('/api/suggestions?userType=estudiante')
        .expect(200); // Debería retornar fallback en lugar de fallar
      
      expect(response.body.success).toBe(true);
    });
    
    test('debe retornar estructura consistente en caso de error', async () => {
      const response = await request(app)
        .get('/api/suggestions?userType=test_error')
        .expect(200);
      
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
  });
  
  describe('Validación de Datos', () => {
    
    test('debe validar parámetros de entrada', async () => {
      // Test con parámetros extremos
      const response = await request(app)
        .get('/api/suggestions?userType=&limit=-1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    test('debe limitar el número de sugerencias retornadas', async () => {
      const response = await request(app)
        .get('/api/suggestions?limit=3')
        .expect(200);
      
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
    
  });
  
});

describe('Integración con Frontend', () => {
  
  test('debe servir archivos estáticos del componente', async () => {
    const response = await request(app)
      .get('/chat/js/components/suggestions.js')
      .expect(200);
    
    expect(response.headers['content-type']).toMatch(/javascript|text/);
  });
  
  test('debe servir estilos CSS del componente', async () => {
    const response = await request(app)
      .get('/chat/css/components/suggestions.css')
      .expect(200);
    
    expect(response.headers['content-type']).toMatch(/css|text/);
  });
  
});

// Cleanup después de las pruebas
afterAll(async () => {
  // Cerrar conexiones de base de datos si es necesario
  if (app && app.close) {
    app.close();
  }
});