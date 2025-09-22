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
        htd_total: 27,
        hti_total: 30,
        creditos: 19,
        materias: [
          { 
            codigo: "A", 
            color: "Amarillo", 
            nombre: "Cálculo Diferencial",
            linea_formacion: "amarillo_matematicas",
            prerequisitos: [],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "A", 
            color: "Amarillo", 
            nombre: "Álgebra Superior",
            linea_formacion: "amarillo_matematicas", 
            prerequisitos: [],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Pensamiento Algorítmico",
            linea_formacion: "naranja_programacion",
            prerequisitos: [], 
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Matemáticas Discretas",
            linea_formacion: "morado_datos",
            prerequisitos: [],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Herramientas Digitales",
            linea_formacion: "azul_sistemas",
            prerequisitos: [],
            htd: 2, 
            hti: 4, 
            creditos: 2 
          },
          { 
            codigo: "D", 
            color: "Rosa", 
            nombre: "Cultura Física",
            linea_formacion: "rosa_electivas",
            prerequisitos: [],
            htd: 2, 
            hti: 1, 
            creditos: 1 
          },
          { 
            codigo: "D", 
            color: "Rosa", 
            nombre: "Procesos de Lectura y Escritura",
            linea_formacion: "celeste_humanidades",
            prerequisitos: [],
            htd: 2, 
            hti: 4, 
            creditos: 3 
          }
        ]
      },
      2: {
        nivel_romano: "II",
        nombre: "Segundo Nivel",
        tipo: "Tecnológico", 
        htd_total: 26,
        hti_total: 34,
        creditos: 20,
        materias: [
          { 
            codigo: "A", 
            color: "Amarillo", 
            nombre: "Cálculo Integral",
            linea_formacion: "amarillo_matematicas",
            prerequisitos: ["calculo_diferencial"],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "A", 
            color: "Amarillo", 
            nombre: "Mecánica",
            linea_formacion: "amarillo_matematicas",
            prerequisitos: ["algebra_superior"],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Fundamentos de POO",
            linea_formacion: "naranja_programacion",
            prerequisitos: ["pensamiento_algoritmico"],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Diseño de Bases de Datos",
            linea_formacion: "morado_datos", 
            prerequisitos: ["matematicas_discretas"],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Sistemas Digitales",
            linea_formacion: "azul_sistemas",
            prerequisitos: ["matematicas_discretas"], 
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Estructura de Computadores",
            linea_formacion: "azul_sistemas",
            prerequisitos: ["herramientas_digitales"], 
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "A", 
            color: "Rosa", 
            nombre: "Optativa I",
            linea_formacion: "rosa_electivas",
            prerequisitos: [],
            htd: 2, 
            hti: 4, 
            creditos: 2 
          }
        ]
      },
      3: {
        nivel_romano: "III",
        nombre: "Tercer Nivel",
        tipo: "Tecnológico",
        htd_total: 26,
        hti_total: 34,
        creditos: 20,
        materias: [
          { 
            codigo: "A", 
            color: "Amarillo", 
            nombre: "Electromagnetismo",
            linea_formacion: "amarillo_matematicas",
            prerequisitos: ["calculo_integral", "mecanica"],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "A", 
            color: "Verde", 
            nombre: "Planeación de Sistemas Informáticos",
            linea_formacion: "mostaza_investigacion",
            prerequisitos: ["fundamentos_poo"],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "A", 
            color: "Verde", 
            nombre: "Programación Orientada a Objetos",
            linea_formacion: "naranja_programacion",
            prerequisitos: ["fundamentos_poo"],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Motores de Bases de Datos",
            linea_formacion: "morado_datos",
            prerequisitos: ["diseño_bases_datos"],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Programación de Dispositivos",
            linea_formacion: "azul_sistemas",
            prerequisitos: ["sistemas_digitales"],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Sistemas Operativos",
            linea_formacion: "azul_sistemas",
            prerequisitos: ["estructura_computadores"],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "A", 
            color: "Rosa", 
            nombre: "Epistemología",
            linea_formacion: "mostaza_investigacion",
            prerequisitos: [],
            htd: 2, 
            hti: 4, 
            creditos: 2 
          }
        ]
      },
      4: {
        nivel_romano: "IV",
        nombre: "Cuarto Nivel",
        tipo: "Tecnológico",
        htd_total: 25,
        hti_total: 20,
        creditos: 15,
        materias: [
          { 
            codigo: "D", 
            color: "Amarillo", 
            nombre: "Laboratorio de Física",
            linea_formacion: "amarillo_matematicas",
            prerequisitos: ["electromagnetismo"],
            htd: 3, 
            hti: 0, 
            creditos: 1 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Estructura de Datos",
            linea_formacion: "mostaza_investigacion",
            prerequisitos: ["programacion_orientada_objetos"],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "A", 
            color: "Verde", 
            nombre: "Programación Web",
            linea_formacion: "naranja_programacion",
            prerequisitos: ["programacion_orientada_objetos", "motores_bases_datos"],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Redes",
            linea_formacion: "azul_sistemas",
            prerequisitos: ["sistemas_operativos"],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Inglés I",
            linea_formacion: "celeste_humanidades",
            prerequisitos: [],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Electiva de Profundización I",
            linea_formacion: "verde_electivas_profundizacion",
            prerequisitos: [],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "A", 
            color: "Rosa", 
            nombre: "Optativa II",
            linea_formacion: "rosa_electivas",
            prerequisitos: [],
            htd: 2, 
            hti: 4, 
            creditos: 2 
          }
        ]
      },
      5: {
        nivel_romano: "V",
        nombre: "Quinto Nivel",
        tipo: "Tecnológico",
        htd_total: 24,
        hti_total: 24,
        creditos: 16,
        materias: [
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Aplicaciones Móviles",
            linea_formacion: "naranja_programacion",
            prerequisitos: ["programacion_web"],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          },
          { 
            codigo: "A", 
            color: "Verde", 
            nombre: "Programación en Java",
            linea_formacion: "naranja_programacion",
            prerequisitos: ["programacion_web"],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "A", 
            color: "Verde", 
            nombre: "Metodología de la Investigación I",
            linea_formacion: "mostaza_investigacion",
            prerequisitos: [],
            htd: 2, 
            hti: 4, 
            creditos: 2 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Administración de Servicios",
            linea_formacion: "azul_sistemas",
            prerequisitos: ["redes"],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Inglés II",
            linea_formacion: "celeste_humanidades",
            prerequisitos: ["ingles_i"],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Electiva de Profundización II",
            linea_formacion: "verde_electivas_profundizacion",
            prerequisitos: [],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          },
          { 
            codigo: "A", 
            color: "Rosa", 
            nombre: "Ética",
            linea_formacion: "rosa_electivas",
            prerequisitos: [],
            htd: 2, 
            hti: 4, 
            creditos: 2 
          }
        ]
      },
      6: {
        nivel_romano: "VI",
        nombre: "Sexto Nivel", 
        tipo: "Tecnológico",
        htd_total: 26,
        hti_total: 28,
        creditos: 18,
        materias: [
          { 
            codigo: "A", 
            color: "Verde", 
            nombre: "Introducción a la Ingeniería",
            linea_formacion: "mostaza_investigacion",
            prerequisitos: [],
            htd: 2, 
            hti: 4, 
            creditos: 2 
          },
          { 
            codigo: "A", 
            color: "Verde", 
            nombre: "Selección y Evaluación de Tecnología",
            linea_formacion: "mostaza_investigacion",
            prerequisitos: [],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          },
          { 
            codigo: "A", 
            color: "Amarillo", 
            nombre: "Cálculo Multivariable",
            linea_formacion: "amarillo_matematicas",
            prerequisitos: [],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "A", 
            color: "Verde", 
            nombre: "Desarrollo de Aplicaciones Empresariales",
            linea_formacion: "naranja_programacion",
            prerequisitos: ["programacion_java"],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "A", 
            color: "Verde", 
            nombre: "Nuevas Tecnologías de Desarrollo",
            linea_formacion: "naranja_programacion",
            prerequisitos: ["programacion_java"],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Seguridad de las Tecnologías de la Información",
            linea_formacion: "azul_sistemas",
            prerequisitos: ["administracion_servicios"],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Electiva de Profundización III",
            linea_formacion: "verde_electivas_profundizacion",
            prerequisitos: [],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          }
        ]
      },
      7: {
        nivel_romano: "VII",
        nombre: "Séptimo Nivel",
        tipo: "Universitario", 
        htd_total: 22,
        hti_total: 38,
        creditos: 20,
        materias: [
          { 
            codigo: "A", 
            color: "Amarillo", 
            nombre: "Álgebra Lineal",
            linea_formacion: "amarillo_matematicas",
            prerequisitos: [],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "A", 
            color: "Amarillo", 
            nombre: "Ecuaciones Diferenciales",
            linea_formacion: "amarillo_matematicas",
            prerequisitos: [],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "A", 
            color: "Amarillo", 
            nombre: "Estadística para Ingenieros",
            linea_formacion: "amarillo_matematicas",
            prerequisitos: [],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "A", 
            color: "Verde", 
            nombre: "Ingeniería del Software",
            linea_formacion: "mostaza_investigacion",
            prerequisitos: [],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "A", 
            color: "Verde", 
            nombre: "Gestión y Gobierno de TI",
            linea_formacion: "azul_sistemas",
            prerequisitos: [],
            htd: 2, 
            hti: 8, 
            creditos: 2
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Inglés III",
            linea_formacion: "celeste_humanidades",
            prerequisitos: [],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          }
        ]
      },
      8: {
        nivel_romano: "VIII", 
        nombre: "Octavo Nivel",
        tipo: "Universitario",
        htd_total: 26,
        hti_total: 28,
        creditos: 18,
        materias: [
          { 
            codigo: "B", 
            color: "Amarillo", 
            nombre: "Análisis Numérico",
            linea_formacion: "amarillo_matematicas",
            prerequisitos: ["ecuaciones_diferenciales"],
            htd: 4, 
            hti: 2, 
            creditos: 4 
          },
          { 
            codigo: "A", 
            color: "Verde", 
            nombre: "Autómatas y Lenguajes Formales",
            linea_formacion: "amarillo_pastel_algoritmos",
            prerequisitos: [],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Investigación de Operaciones",
            linea_formacion: "azul_sistemas",
            prerequisitos: [],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          },
          { 
            codigo: "A", 
            color: "Verde", 
            nombre: "Arquitectura de Software",
            linea_formacion: "mostaza_investigacion",
            prerequisitos: ["ingenieria_software"],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Inglés IV",
            linea_formacion: "celeste_humanidades",
            prerequisitos: ["ingles_iii"],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Electiva de Profundización IV",
            linea_formacion: "verde_electivas_profundizacion",
            prerequisitos: [],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          },
          { 
            codigo: "A", 
            color: "Rosa", 
            nombre: "Optativa III",
            linea_formacion: "rosa_electivas",
            prerequisitos: [],
            htd: 2, 
            hti: 4, 
            creditos: 2 
          }
        ]
      },
      9: {
        nivel_romano: "IX",
        nombre: "Noveno Nivel", 
        tipo: "Universitario",
        htd_total: 24,
        hti_total: 30,
        creditos: 18,
        materias: [
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Compiladores",
            linea_formacion: "amarillo_pastel_algoritmos",
            prerequisitos: ["automatas_lenguajes_formales"],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          },
          { 
            codigo: "A", 
            color: "Verde", 
            nombre: "Simulación Digital",
            linea_formacion: "amarillo_pastel_algoritmos",
            prerequisitos: ["automatas_lenguajes_formales"],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "A", 
            color: "Verde", 
            nombre: "Calidad de Software",
            linea_formacion: "mostaza_investigacion",
            prerequisitos: ["gestion_gobierno_ti"],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Minería de Datos",
            linea_formacion: "morado_datos",
            prerequisitos: [],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          },
          { 
            codigo: "A", 
            color: "Verde", 
            nombre: "Metodología de la Investigación II",
            linea_formacion: "mostaza_investigacion",
            prerequisitos: [],
            htd: 2, 
            hti: 4, 
            creditos: 2 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Electiva de Profundización V",
            linea_formacion: "verde_electivas_profundizacion",
            prerequisitos: [],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          },
          { 
            codigo: "A", 
            color: "Rosa", 
            nombre: "Emprendimiento",
            linea_formacion: "rosa_electivas",
            prerequisitos: [],
            htd: 2, 
            hti: 4, 
            creditos: 2 
          }
        ]
      },
      10: {
        nivel_romano: "X",
        nombre: "Décimo Nivel",
        tipo: "Universitario",
        htd_total: 24,
        hti_total: 24,
        creditos: 16,
        materias: [
          { 
            codigo: "A", 
            color: "Verde", 
            nombre: "Dinámica de Sistemas",
            linea_formacion: "amarillo_pastel_algoritmos",
            prerequisitos: ["simulacion_digital"],
            htd: 4, 
            hti: 8, 
            creditos: 4 
          },
          { 
            codigo: "A", 
            color: "Verde", 
            nombre: "Ética y Legislación Informática",
            linea_formacion: "azul_sistemas",
            prerequisitos: [],
            htd: 2, 
            hti: 4, 
            creditos: 2 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Gestión de Proyectos de Software",
            linea_formacion: "azul_sistemas",
            prerequisitos: ["calidad_software"],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Patrones de Software",
            linea_formacion: "mostaza_investigacion",
            prerequisitos: [],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          },
          { 
            codigo: "A", 
            color: "Verde", 
            nombre: "Análisis de Datos a Gran Escala",
            linea_formacion: "morado_datos",
            prerequisitos: ["mineria_datos"],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          },
          { 
            codigo: "B", 
            color: "Verde", 
            nombre: "Electiva de Profundización VI",
            linea_formacion: "verde_electivas_profundizacion",
            prerequisitos: [],
            htd: 4, 
            hti: 2, 
            creditos: 2 
          },
          { 
            codigo: "A", 
            color: "Rosa", 
            nombre: "Optativa IV",
            linea_formacion: "rosa_electivas",
            prerequisitos: [],
            htd: 2, 
            hti: 4, 
            creditos: 2 
          }
        ]
      }
    }
  }
};

export default mallaCurricular;