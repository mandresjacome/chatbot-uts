// Datos de la Malla Curricular UTS - Pensum 2019
// Programa de Ingeniería de Sistemas con dos niveles de formación
// Basado en el documento oficial: Gráfica 5. Malla Curricular del programa incluyendo los dos niveles de formación

const mallaCurricular = {
  programa_completo: {
    nombre: "Ingeniería de Sistemas",
    descripcion: "Programa completo con nivel tecnológico (I-VI) y universitario (VII-X)",
    duracion_total: "10 semestres",
    creditos_total: 160,
    nivel_tecnologico: {
      nombre: "Nivel Tecnológico",
      niveles: "I - VI",
      duracion: "6 semestres", 
      titulo: "Tecnología en Desarrollo de Sistemas Informáticos"
    },
    nivel_universitario: {
      nombre: "Nivel Universitario", 
      niveles: "VII - X",
      duracion: "4 semestres",
      titulo: "Ingeniería de Sistemas"
    },
    niveles: {
      1: {
        nivel_romano: "I",
        nombre: "Primer Nivel",
        tipo: "Tecnológico",
        creditos: 16,
        materias: [
          { codigo: "A", nombre: "Cálculo Diferencial", creditos: 4 },
          { codigo: "A", nombre: "Álgebra Superior", creditos: 4 },
          { codigo: "A", nombre: "Cultura Física", creditos: 2 },
          { codigo: "A", nombre: "Comunicación y Lectura Crítica y Escritura", creditos: 3 },
          { codigo: "OPTA I", nombre: "Optativa I", creditos: 3 }
        ]
      },
      2: {
        nivel_romano: "II",
        nombre: "Segundo Nivel",
        tipo: "Tecnológico", 
        creditos: 16,
        materias: [
          { codigo: "A", nombre: "Cálculo Integral", creditos: 4 },
          { codigo: "A", nombre: "Mecánica", creditos: 4 },
          { codigo: "B", nombre: "Pensamiento Lógico", creditos: 2 },
          { codigo: "B", nombre: "Fundamentos de Programación", creditos: 3 },
          { codigo: "B", nombre: "Sistemas Digitales", creditos: 3 }
        ]
      },
      3: {
        nivel_romano: "III",
        nombre: "Tercer Nivel",
        tipo: "Tecnológico",
        creditos: 16,
        materias: [
          { codigo: "A", nombre: "Electromagnetismo", creditos: 3 },
          { codigo: "A", nombre: "Laboratorio de Física", creditos: 1 },
          { codigo: "B", nombre: "Aplicación de Métodos Numéricos", creditos: 3 },
          { codigo: "B", nombre: "Estructura de Datos", creditos: 3 },
          { codigo: "B", nombre: "Aplicaciones Móviles", creditos: 3 },
          { codigo: "B", nombre: "Redes", creditos: 3 }
        ]
      },
      4: {
        nivel_romano: "IV",
        nombre: "Cuarto Nivel",
        tipo: "Tecnológico",
        creditos: 16,
        materias: [
          { codigo: "B", nombre: "Programación Orientada a Objetos", creditos: 3 },
          { codigo: "B", nombre: "Programación Web", creditos: 3 },
          { codigo: "B", nombre: "Programación en Java", creditos: 3 },
          { codigo: "A", nombre: "Nuevas Tecnologías Aplicadas", creditos: 3 },
          { codigo: "A", nombre: "Inglés Técnico", creditos: 2 },
          { codigo: "B", nombre: "Electiva de Profundización I", creditos: 2 }
        ]
      },
      5: {
        nivel_romano: "V",
        nombre: "Quinto Nivel",
        tipo: "Tecnológico",
        creditos: 16,
        materias: [
          { codigo: "B", nombre: "Administración de Bases de Datos", creditos: 3 },
          { codigo: "B", nombre: "Metodología de la Investigación", creditos: 2 },
          { codigo: "A", nombre: "Ingeniería del Software", creditos: 3 },
          { codigo: "A", nombre: "Auditoría de la Información", creditos: 2 },
          { codigo: "A", nombre: "Gestión y Gobierno de TI", creditos: 3 },
          { codigo: "B", nombre: "Electiva de Profundización II", creditos: 2 },
          { codigo: "B", nombre: "Inglés B1", creditos: 1 }
        ]
      },
      6: {
        nivel_romano: "VI",
        nombre: "Sexto Nivel", 
        tipo: "Tecnológico",
        creditos: 16,
        materias: [
          { codigo: "B", nombre: "Arquitectura y Patrones de Software", creditos: 3 },
          { codigo: "B", nombre: "Calidad de Software", creditos: 3 },
          { codigo: "A", nombre: "Gerencia de Datos", creditos: 3 },
          { codigo: "A", nombre: "Análisis de Datos a Partir de Metodología de Investigación", creditos: 3 },
          { codigo: "B", nombre: "Electiva de Profundización III", creditos: 2 },
          { codigo: "B", nombre: "Inglés B2", creditos: 2 }
        ]
      },
      7: {
        nivel_romano: "VII",
        nombre: "Séptimo Nivel",
        tipo: "Universitario", 
        creditos: 16,
        materias: [
          { codigo: "A", nombre: "Introducción a la Ingeniería", creditos: 2 },
          { codigo: "B", nombre: "Metodología y Evaluación de la Tecnología", creditos: 3 },
          { codigo: "A", nombre: "Cálculo Multivariable", creditos: 4 },
          { codigo: "A", nombre: "Álgebra Lineal", creditos: 3 },
          { codigo: "A", nombre: "Análisis Numérico", creditos: 4 }
        ]
      },
      8: {
        nivel_romano: "VIII", 
        nombre: "Octavo Nivel",
        tipo: "Universitario",
        creditos: 16,
        materias: [
          { codigo: "A", nombre: "Investigación de Operaciones", creditos: 4 },
          { codigo: "A", nombre: "Configuraciones", creditos: 2 },
          { codigo: "A", nombre: "Simulación Digital", creditos: 3 },
          { codigo: "A", nombre: "Arquitectura de Arquitectura", creditos: 3 },
          { codigo: "B", nombre: "Ética y Legislación Profesional", creditos: 2 },
          { codigo: "B", nombre: "Electiva de Profundización IV", creditos: 2 }
        ]
      },
      9: {
        nivel_romano: "IX",
        nombre: "Noveno Nivel", 
        tipo: "Universitario",
        creditos: 16,
        materias: [
          { codigo: "A", nombre: "Gerencia de Datos", creditos: 3 },
          { codigo: "A", nombre: "Metodología de la Investigación", creditos: 3 },
          { codigo: "B", nombre: "Electiva de Profundización V", creditos: 2 },
          { codigo: "A", nombre: "Optativa III", creditos: 4 },
          { codigo: "A", nombre: "Optativa IV", creditos: 4 }
        ]
      },
      10: {
        nivel_romano: "X",
        nombre: "Décimo Nivel",
        tipo: "Universitario",
        creditos: 16,
        materias: [
          { codigo: "B", nombre: "Electiva de Profundización VI", creditos: 2 },
          { codigo: "A", nombre: "Emprendimiento", creditos: 3 },
          { codigo: "A", nombre: "Optativa V", creditos: 4 },
          { codigo: "A", nombre: "Optativa VI", creditos: 4 },
          { codigo: "A", nombre: "Optativa VII", creditos: 3 }
        ]
      }
    }
  }
};

export default mallaCurricular;