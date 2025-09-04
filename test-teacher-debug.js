import { isTeacherSearchQuery, findTeacherByName, formatTeacherInfo } from './src/nlp/teacherSearch.js';

console.log('=== PROBANDO TEACHER SEARCH ===');
console.log('¿Es consulta de docente "Alain Perez"?', isTeacherSearchQuery('Alain Perez'));
console.log('¿Es consulta de docente "Sergio Suarez"?', isTeacherSearchQuery('Sergio Suarez'));
console.log('¿Es consulta de docente "materias"?', isTeacherSearchQuery('materias'));

// Datos de ejemplo de docentes
const sampleTeacherData = `
DOCENTE	Correo Institucional	Formación Académica	Areas de Conocimiento	Experiencia Profesional	CvLAC
Alain Perez Gutierrez	alain.perez@uts.edu.co	Ingeniero de Sistemas, Especialista en Redes	Programación, Bases de Datos, Redes	5 años en desarrollo de software	https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001234567
Sergio Suarez Martinez	sergio.suarez@uts.edu.co	Ingeniero Industrial, Magister en Gerencia	Gestión de Proyectos, Calidad	8 años en consultoría	https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0007654321
`;

console.log('\n=== PROBANDO BÚSQUEDA ===');
const teacher1 = findTeacherByName('Alain Perez', sampleTeacherData);
console.log('Resultado Alain Perez:', teacher1 ? 'ENCONTRADO' : 'NO ENCONTRADO');
if (teacher1) {
  console.log('Información:', teacher1);
  console.log('Formato:', formatTeacherInfo(teacher1));
}

const teacher2 = findTeacherByName('Sergio Suarez', sampleTeacherData);
console.log('Resultado Sergio Suarez:', teacher2 ? 'ENCONTRADO' : 'NO ENCONTRADO');
if (teacher2) {
  console.log('Información:', teacher2);
}
