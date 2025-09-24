#!/usr/bin/env node

/**
 * Script de Validación Rápida del Sistema de Sugerencias
 * Valida que todas las funcionalidades estén operativas
 */

import fetch from 'node-fetch';
import { logger } from '../src/utils/logger.js';

const BASE_URL = 'http://localhost:3001';

async function validateSuggestionsSystem() {
  console.log('🔍 Iniciando validación del sistema de sugerencias...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Tests de la API
  const tests = [
    {
      name: 'API de sugerencias para estudiantes',
      url: `${BASE_URL}/api/suggestions?userType=estudiante`,
      validate: (data) => data.success && data.data.suggestions.length > 0
    },
    {
      name: 'API de sugerencias para aspirantes',
      url: `${BASE_URL}/api/suggestions?userType=aspirante`,
      validate: (data) => data.success && data.data.suggestions.length > 0
    },
    {
      name: 'API de sugerencias para docentes',
      url: `${BASE_URL}/api/suggestions?userType=docente`,
      validate: (data) => data.success && data.data.suggestions.length > 0
    },
    {
      name: 'API de sugerencias generales',
      url: `${BASE_URL}/api/suggestions?userType=todos`,
      validate: (data) => data.success && data.data.suggestions.length > 0
    },
    {
      name: 'API de todas las sugerencias',
      url: `${BASE_URL}/api/suggestions/all`,
      validate: (data) => data.success && data.data.totalSuggestions > 0
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`⏳ Probando: ${test.name}`);
      
      const response = await fetch(test.url);
      const data = await response.json();
      
      if (response.ok && test.validate(data)) {
        console.log(`✅ ${test.name} - PASÓ`);
        console.log(`   → ${data.data.totalSuggestions || data.data.suggestions?.length || 0} sugerencias generadas\n`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - FALLÓ`);
        console.log(`   → Status: ${response.status}, Success: ${data.success}\n`);
        failed++;
      }
      
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR`);
      console.log(`   → ${error.message}\n`);
      failed++;
    }
  }
  
  // Test del frontend
  try {
    console.log('⏳ Probando acceso al frontend del chat');
    const response = await fetch(`${BASE_URL}/chat`);
    
    if (response.ok) {
      console.log('✅ Frontend del chat - ACCESIBLE');
      passed++;
    } else {
      console.log('❌ Frontend del chat - NO ACCESIBLE');
      failed++;
    }
  } catch (error) {
    console.log('❌ Frontend del chat - ERROR');
    console.log(`   → ${error.message}`);
    failed++;
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 RESUMEN DE VALIDACIÓN');
  console.log(`${'='.repeat(50)}`);
  console.log(`✅ Pruebas exitosas: ${passed}`);
  console.log(`❌ Pruebas fallidas: ${failed}`);
  console.log(`📈 Tasa de éxito: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log(`\n🎉 ¡Todos los tests pasaron! Sistema completamente funcional.`);
  } else {
    console.log(`\n⚠️  Hay ${failed} problemas que requieren atención.`);
  }
  
  console.log('\n🔗 URLs para pruebas manuales:');
  console.log(`   • Chat: ${BASE_URL}/chat`);
  console.log(`   • API Aspirantes: ${BASE_URL}/api/suggestions?userType=aspirante`);
  console.log(`   • API Estudiantes: ${BASE_URL}/api/suggestions?userType=estudiante`);
  console.log(`   • API Docentes: ${BASE_URL}/api/suggestions?userType=docente`);
  console.log(`   • API Todas: ${BASE_URL}/api/suggestions/all`);
  
  return failed === 0;
}

// Validar calidad de las sugerencias
async function validateSuggestionQuality() {
  console.log('\n🔍 Validando calidad de las sugerencias...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/suggestions?userType=aspirante`);
    const data = await response.json();
    
    if (data.success && data.data.suggestions) {
      const suggestions = data.data.suggestions;
      
      console.log(`📝 Analizando ${suggestions.length} sugerencias para aspirantes:`);
      
      const qualityChecks = {
        notEmpty: suggestions.every(s => s.question && s.question.trim().length > 0),
        hasCategory: suggestions.every(s => s.category),
        hasConfidence: suggestions.every(s => typeof s.confidence === 'number'),
        properFormat: suggestions.every(s => s.question.endsWith('?')),
        relevantContent: suggestions.some(s => 
          s.question.toLowerCase().includes('aspirante') ||
          s.question.toLowerCase().includes('admision') ||
          s.question.toLowerCase().includes('inscripc')
        )
      };
      
      console.log(`   ✓ No vacías: ${qualityChecks.notEmpty ? '✅' : '❌'}`);
      console.log(`   ✓ Tienen categoría: ${qualityChecks.hasCategory ? '✅' : '❌'}`);
      console.log(`   ✓ Tienen confianza: ${qualityChecks.hasConfidence ? '✅' : '❌'}`);
      console.log(`   ✓ Formato de pregunta: ${qualityChecks.properFormat ? '✅' : '❌'}`);
      console.log(`   ✓ Contenido relevante: ${qualityChecks.relevantContent ? '✅' : '❌'}`);
      
      // Mostrar ejemplos
      console.log('\n📋 Ejemplos de sugerencias generadas:');
      suggestions.slice(0, 3).forEach((s, i) => {
        console.log(`   ${i + 1}. "${s.question}" (confianza: ${s.confidence.toFixed(2)})`);
      });
      
    } else {
      console.log('❌ No se pudieron obtener sugerencias para validar calidad');
    }
    
  } catch (error) {
    console.log(`❌ Error validando calidad: ${error.message}`);
  }
}

// Ejecutar validación
async function main() {
  const isSystemOk = await validateSuggestionsSystem();
  
  if (isSystemOk) {
    await validateSuggestionQuality();
  }
  
  process.exit(isSystemOk ? 0 : 1);
}

main().catch(console.error);