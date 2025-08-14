const express = require('express');
const router = express.Router();
const trabajadoresService = require('../services/trabajadoresService');

// Endpoint para obtener trabajadores activos para planilla
router.get('/api/trabajadores/planilla', async (req, res) => {
  try {
    console.log('Solicitud para obtener trabajadores para planilla');
    const trabajadores = await trabajadoresService.obtenerTrabajadoresParaPlanilla();
    res.json(trabajadores);
  } catch (error) {
    console.error('Error en endpoint trabajadores/planilla:', error);
    res.status(500).json({ 
      error: 'Error al obtener trabajadores para planilla', 
      mensaje: error.message 
    });
  }
});

// Endpoint para obtener trabajadores agrupados por área
router.get('/api/trabajadores/por-area', async (req, res) => {
  try {
    console.log('Solicitud para obtener trabajadores por área');
    const trabajadoresPorArea = await trabajadoresService.obtenerTrabajadoresPorArea();
    res.json(trabajadoresPorArea);
  } catch (error) {
    console.error('Error en endpoint trabajadores/por-area:', error);
    res.status(500).json({ 
      error: 'Error al obtener trabajadores por área', 
      mensaje: error.message 
    });
  }
});

module.exports = router;