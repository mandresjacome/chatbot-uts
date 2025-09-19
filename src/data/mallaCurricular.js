// Datos de la Malla Curricular UTS - Pensum 2019
// Basado en el documento oficial de malla curricular

const mallaCurricular = {
  tecnologia: {
    nombre: "Tecnología en Desarrollo de Sistemas Informáticos",
    duracion: "6 semestres",
    creditos_total: 120,
    niveles: {
      1: {
        nombre: "Primer Nivel",
        creditos: 20,
        materias: [
          { codigo: "TDS101", nombre: "Matemáticas Básicas", creditos: 4 },
          { codigo: "TDS102", nombre: "Introducción a la Programación", creditos: 4 },
          { codigo: "TDS103", nombre: "Física I", creditos: 3 },
          { codigo: "TDS104", nombre: "Comunicación Oral y Escrita", creditos: 3 },
          { codigo: "TDS105", nombre: "Metodología de la Investigación", creditos: 2 },
          { codigo: "TDS106", nombre: "Ética Profesional", creditos: 2 },
          { codigo: "TDS107", nombre: "Cátedra UTS", creditos: 2 }
        ]
      },
      2: {
        nombre: "Segundo Nivel", 
        creditos: 20,
        materias: [
          { codigo: "TDS201", nombre: "Cálculo Diferencial", creditos: 4 },
          { codigo: "TDS202", nombre: "Programación I", creditos: 4 },
          { codigo: "TDS203", nombre: "Física II", creditos: 3 },
          { codigo: "TDS204", nombre: "Inglés I", creditos: 3 },
          { codigo: "TDS205", nombre: "Estadística Descriptiva", creditos: 3 },
          { codigo: "TDS206", nombre: "Constitución Política", creditos: 2 },
          { codigo: "TDS207", nombre: "Emprendimiento", creditos: 1 }
        ]
      },
      3: {
        nombre: "Tercer Nivel",
        creditos: 20,
        materias: [
          { codigo: "TDS301", nombre: "Cálculo Integral", creditos: 4 },
          { codigo: "TDS302", nombre: "Programación II", creditos: 4 },
          { codigo: "TDS303", nombre: "Electromagnetismo", creditos: 3 },
          { codigo: "TDS304", nombre: "Inglés II", creditos: 3 },
          { codigo: "TDS305", nombre: "Estadística Inferencial", creditos: 3 },
          { codigo: "TDS306", nombre: "Economía", creditos: 2 },
          { codigo: "TDS307", nombre: "Electiva I", creditos: 1 }
        ]
      },
      4: {
        nombre: "Cuarto Nivel",
        creditos: 20,
        materias: [
          { codigo: "TDS401", nombre: "Ecuaciones Diferenciales", creditos: 3 },
          { codigo: "TDS402", nombre: "Estructura de Datos", creditos: 4 },
          { codigo: "TDS403", nombre: "Circuitos Eléctricos", creditos: 4 },
          { codigo: "TDS404", nombre: "Base de Datos I", creditos: 4 },
          { codigo: "TDS405", nombre: "Análisis y Diseño de Sistemas", creditos: 3 },
          { codigo: "TDS406", nombre: "Gestión de Proyectos", creditos: 2 }
        ]
      },
      5: {
        nombre: "Quinto Nivel",
        creditos: 20,
        materias: [
          { codigo: "TDS501", nombre: "Métodos Numéricos", creditos: 3 },
          { codigo: "TDS502", nombre: "Algoritmos y Programación", creditos: 4 },
          { codigo: "TDS503", nombre: "Electrónica Digital", creditos: 4 },
          { codigo: "TDS504", nombre: "Base de Datos II", creditos: 4 },
          { codigo: "TDS505", nombre: "Ingeniería de Software", creditos: 3 },
          { codigo: "TDS506", nombre: "Electiva II", creditos: 2 }
        ]
      },
      6: {
        nombre: "Sexto Nivel",
        creditos: 20,
        materias: [
          { codigo: "TDS601", nombre: "Proyecto de Grado I", creditos: 6 },
          { codigo: "TDS602", nombre: "Arquitectura de Software", creditos: 4 },
          { codigo: "TDS603", nombre: "Redes de Computadores", creditos: 4 },
          { codigo: "TDS604", nombre: "Seguridad Informática", creditos: 3 },
          { codigo: "TDS605", nombre: "Práctica Profesional", creditos: 3 }
        ]
      }
    }
  },
  ingenieria: {
    nombre: "Ingeniería de Sistemas",
    duracion: "10 semestres",
    creditos_total: 200,
    niveles: {
      1: {
        nombre: "Primer Nivel",
        creditos: 20,
        materias: [
          { codigo: "ING101", nombre: "Cálculo Diferencial", creditos: 4 },
          { codigo: "ING102", nombre: "Álgebra Lineal", creditos: 3 },
          { codigo: "ING103", nombre: "Química General", creditos: 3 },
          { codigo: "ING104", nombre: "Introducción a la Ingeniería", creditos: 3 },
          { codigo: "ING105", nombre: "Comunicación", creditos: 3 },
          { codigo: "ING106", nombre: "Cátedra UTS", creditos: 2 },
          { codigo: "ING107", nombre: "Deportes", creditos: 2 }
        ]
      },
      2: {
        nombre: "Segundo Nivel",
        creditos: 20,
        materias: [
          { codigo: "ING201", nombre: "Cálculo Integral", creditos: 4 },
          { codigo: "ING202", nombre: "Física I", creditos: 4 },
          { codigo: "ING203", nombre: "Programación I", creditos: 4 },
          { codigo: "ING204", nombre: "Álgebra", creditos: 3 },
          { codigo: "ING205", nombre: "Inglés I", creditos: 3 },
          { codigo: "ING206", nombre: "Humanidades I", creditos: 2 }
        ]
      },
      3: {
        nombre: "Tercer Nivel", 
        creditos: 20,
        materias: [
          { codigo: "ING301", nombre: "Cálculo Multivariable", creditos: 4 },
          { codigo: "ING302", nombre: "Física II", creditos: 4 },
          { codigo: "ING303", nombre: "Programación II", creditos: 4 },
          { codigo: "ING304", nombre: "Matemáticas Discretas", creditos: 3 },
          { codigo: "ING305", nombre: "Inglés II", creditos: 3 },
          { codigo: "ING306", nombre: "Humanidades II", creditos: 2 }
        ]
      },
      4: {
        nombre: "Cuarto Nivel",
        creditos: 20,
        materias: [
          { codigo: "ING401", nombre: "Ecuaciones Diferenciales", creditos: 4 },
          { codigo: "ING402", nombre: "Física III", creditos: 4 },
          { codigo: "ING403", nombre: "Estructura de Datos", creditos: 4 },
          { codigo: "ING404", nombre: "Probabilidad y Estadística", creditos: 3 },
          { codigo: "ING405", nombre: "Economía", creditos: 3 },
          { codigo: "ING406", nombre: "Constitución Política", creditos: 2 }
        ]
      },
      5: {
        nombre: "Quinto Nivel",
        creditos: 20,
        materias: [
          { codigo: "ING501", nombre: "Métodos Numéricos", creditos: 4 },
          { codigo: "ING502", nombre: "Electrónica", creditos: 4 },
          { codigo: "ING503", nombre: "Algoritmos", creditos: 4 },
          { codigo: "ING504", nombre: "Base de Datos I", creditos: 4 },
          { codigo: "ING505", nombre: "Investigación de Operaciones", creditos: 2 },
          { codigo: "ING506", nombre: "Ética Profesional", creditos: 2 }
        ]
      },
      6: {
        nombre: "Sexto Nivel",
        creditos: 20,
        materias: [
          { codigo: "ING601", nombre: "Análisis de Sistemas", creditos: 4 },
          { codigo: "ING602", nombre: "Arquitectura de Computadores", creditos: 4 },
          { codigo: "ING603", nombre: "Programación Orientada a Objetos", creditos: 4 },
          { codigo: "ING604", nombre: "Base de Datos II", creditos: 4 },
          { codigo: "ING605", nombre: "Gestión de Proyectos", creditos: 2 },
          { codigo: "ING606", nombre: "Electiva I", creditos: 2 }
        ]
      },
      7: {
        nombre: "Séptimo Nivel",
        creditos: 20,
        materias: [
          { codigo: "ING701", nombre: "Ingeniería de Software I", creditos: 4 },
          { codigo: "ING702", nombre: "Sistemas Operativos", creditos: 4 },
          { codigo: "ING703", nombre: "Redes de Computadores I", creditos: 4 },
          { codigo: "ING704", nombre: "Inteligencia Artificial", creditos: 4 },
          { codigo: "ING705", nombre: "Emprendimiento", creditos: 2 },
          { codigo: "ING706", nombre: "Electiva II", creditos: 2 }
        ]
      },
      8: {
        nombre: "Octavo Nivel",
        creditos: 20,
        materias: [
          { codigo: "ING801", nombre: "Ingeniería de Software II", creditos: 4 },
          { codigo: "ING802", nombre: "Sistemas Distribuidos", creditos: 4 },
          { codigo: "ING803", nombre: "Redes de Computadores II", creditos: 4 },
          { codigo: "ING804", nombre: "Seguridad Informática", creditos: 4 },
          { codigo: "ING805", nombre: "Electiva III", creditos: 2 },
          { codigo: "ING806", nombre: "Electiva IV", creditos: 2 }
        ]
      },
      9: {
        nombre: "Noveno Nivel",
        creditos: 20,
        materias: [
          { codigo: "ING901", nombre: "Proyecto de Grado I", creditos: 6 },
          { codigo: "ING902", nombre: "Práctica Profesional", creditos: 8 },
          { codigo: "ING903", nombre: "Seminario de Investigación", creditos: 3 },
          { codigo: "ING904", nombre: "Electiva V", creditos: 3 }
        ]
      },
      10: {
        nombre: "Décimo Nivel",
        creditos: 20,
        materias: [
          { codigo: "ING1001", nombre: "Proyecto de Grado II", creditos: 8 },
          { codigo: "ING1002", nombre: "Auditoría de Sistemas", creditos: 4 },
          { codigo: "ING1003", nombre: "Gerencia de Proyectos", creditos: 4 },
          { codigo: "ING1004", nombre: "Electiva VI", creditos: 4 }
        ]
      }
    }
  }
};

export default mallaCurricular;