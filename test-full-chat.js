import { answerLLM } from './src/ai/geminiClient.js';

console.log('=== PROBANDO CHATBOT CON BUSQUEDA DE DOCENTES ===');

// Simular datos de docentes como los que estarían en la base de conocimiento
const mockEvidenceChunks = [
  {
    text: `DOCENTE	Correo Institucional	Formación Académica	Areas de Conocimiento	Experiencia Profesional	CvLAC
Alain Perez Gutierrez	alain.perez@uts.edu.co	Ingeniero de Sistemas, Especialista en Redes	Programación, Bases de Datos, Redes	5 años en desarrollo de software	https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001234567
Sergio Suarez Martinez	sergio.suarez@uts.edu.co	Ingeniero Industrial, Magister en Gerencia	Gestión de Proyectos, Calidad	8 años en consultoría	https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0007654321`
  }
];

async function testSearch(query, userType) {
  console.log(`\n--- Probando: "${query}" como ${userType} ---`);
  try {
    const response = await answerLLM({
      question: query,
      evidenceChunks: mockEvidenceChunks,
      userType: userType
    });
    console.log('Respuesta:', response);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Probar diferentes consultas y tipos de usuario
await testSearch('Alain Perez', 'estudiante');
await testSearch('Sergio Suarez', 'docente');
await testSearch('sergio suarez', 'visitante');
await testSearch('alain perez', 'aspirante');
