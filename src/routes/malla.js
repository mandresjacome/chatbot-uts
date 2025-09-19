import { Router } from 'express';
import { logger } from '../utils/logger.js';

const router = Router();

// Importar datos de malla curricular
let mallaCurricular = null;

async function loadMallaData() {
  try {
    const mallaModule = await import('../data/mallaCurricular.js');
    mallaCurricular = mallaModule.default || mallaModule.mallaCurricular;
    logger.info('MALLA', 'Datos de malla curricular cargados exitosamente');
  } catch (error) {
    logger.error('MALLA', 'Error importando datos de malla curricular', error);
    mallaCurricular = null;
  }
}

// Cargar datos al inicializar el módulo
loadMallaData();

/**
 * Endpoint para obtener toda la malla curricular (programa completo 10 niveles)
 */
router.get('/malla-curricular', (req, res) => {
  try {
    logger.info('MALLA', 'Solicitando malla curricular completa');
    
    if (!mallaCurricular || !mallaCurricular.programa_completo) {
      return res.status(500).json({
        success: false,
        error: 'Datos de malla curricular no disponibles'
      });
    }

    res.json({
      success: true,
      data: mallaCurricular.programa_completo,
      timestamp: new Date().toISOString()
    });

    logger.info('MALLA', 'Malla curricular enviada exitosamente');
  } catch (error) {
    logger.error('MALLA', 'Error enviando malla curricular', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Endpoint para obtener información de un programa específico
 */
router.get('/malla-curricular/:programa', (req, res) => {
  try {
    const { programa } = req.params;
    
    logger.info('MALLA', `Solicitando programa: ${programa}`);
    
    if (!mallaCurricular || !mallaCurricular[programa]) {
      return res.status(404).json({
        success: false,
        error: `Programa ${programa} no encontrado`
      });
    }

    res.json({
      success: true,
      data: mallaCurricular[programa],
      programa: programa,
      timestamp: new Date().toISOString()
    });

    logger.info('MALLA', `Programa ${programa} enviado exitosamente`);
  } catch (error) {
    logger.error('MALLA', `Error enviando programa ${req.params.programa}`, error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Endpoint para obtener información de un nivel específico
 */
router.get('/malla-curricular/:programa/:nivel', (req, res) => {
  try {
    const { programa, nivel } = req.params;
    
    logger.info('MALLA', `Solicitando ${programa} nivel ${nivel}`);
    
    if (!mallaCurricular || !mallaCurricular[programa]) {
      return res.status(404).json({
        success: false,
        error: `Programa ${programa} no encontrado`
      });
    }

    const programaData = mallaCurricular[programa];
    const nivelData = programaData.niveles?.[nivel];

    if (!nivelData) {
      return res.status(404).json({
        success: false,
        error: `Nivel ${nivel} no encontrado en ${programa}`
      });
    }

    res.json({
      success: true,
      data: {
        programa: programaData.nombre,
        nivel: parseInt(nivel),
        ...nivelData
      },
      timestamp: new Date().toISOString()
    });

    logger.info('MALLA', `${programa} nivel ${nivel} enviado exitosamente`);
  } catch (error) {
    logger.error('MALLA', `Error enviando nivel ${req.params.nivel} de ${req.params.programa}`, error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Endpoint para buscar materias por nombre o código
 */
router.get('/malla-curricular/buscar/:termino', (req, res) => {
  try {
    const { termino } = req.params;
    const { programa } = req.query; // Filtro opcional por programa
    
    logger.info('MALLA', `Buscando: "${termino}" ${programa ? `en ${programa}` : 'en todos los programas'}`);
    
    if (!mallaCurricular) {
      return res.status(500).json({
        success: false,
        error: 'Datos de malla curricular no disponibles'
      });
    }

    const resultados = [];
    const terminoBusqueda = termino.toLowerCase();

    // Buscar en los programas especificados o en todos
    const programasABuscar = programa ? [programa] : Object.keys(mallaCurricular);

    programasABuscar.forEach(prog => {
      const programaData = mallaCurricular[prog];
      if (!programaData?.niveles) return;

      Object.entries(programaData.niveles).forEach(([nivelNum, nivelData]) => {
        if (!nivelData.materias) return;

        nivelData.materias.forEach(materia => {
          const nombreMateria = materia.nombre?.toLowerCase() || '';
          const codigoMateria = materia.codigo?.toLowerCase() || '';

          if (nombreMateria.includes(terminoBusqueda) || 
              codigoMateria.includes(terminoBusqueda)) {
            resultados.push({
              programa: prog,
              programaNombre: programaData.nombre,
              nivel: parseInt(nivelNum),
              nivelNombre: nivelData.nombre,
              materia: materia
            });
          }
        });
      });
    });

    res.json({
      success: true,
      data: resultados,
      termino: termino,
      programa: programa || 'todos',
      total: resultados.length,
      timestamp: new Date().toISOString()
    });

    logger.info('MALLA', `Búsqueda completada: ${resultados.length} resultados para "${termino}"`);
  } catch (error) {
    logger.error('MALLA', `Error en búsqueda: "${req.params.termino}"`, error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * Endpoint para obtener estadísticas de la malla
 */
router.get('/malla-curricular/estadisticas/resumen', (req, res) => {
  try {
    logger.info('MALLA', 'Solicitando estadísticas de malla curricular');
    
    if (!mallaCurricular) {
      return res.status(500).json({
        success: false,
        error: 'Datos de malla curricular no disponibles'
      });
    }

    const estadisticas = {};

    Object.entries(mallaCurricular).forEach(([programa, data]) => {
      const niveles = Object.keys(data.niveles || {});
      const totalMaterias = niveles.reduce((total, nivel) => {
        return total + (data.niveles[nivel].materias?.length || 0);
      }, 0);

      const totalCreditos = niveles.reduce((total, nivel) => {
        const creditosNivel = data.niveles[nivel].materias?.reduce((subtotal, materia) => {
          return subtotal + (materia.creditos || 0);
        }, 0) || 0;
        return total + creditosNivel;
      }, 0);

      estadisticas[programa] = {
        nombre: data.nombre,
        duracion: data.duracion,
        niveles: niveles.length,
        totalMaterias: totalMaterias,
        totalCreditos: totalCreditos,
        creditosPorNivel: data.creditos_total ? Math.round(data.creditos_total / niveles.length) : 0
      };
    });

    res.json({
      success: true,
      data: estadisticas,
      timestamp: new Date().toISOString()
    });

    logger.info('MALLA', 'Estadísticas enviadas exitosamente');
  } catch (error) {
    logger.error('MALLA', 'Error enviando estadísticas', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;