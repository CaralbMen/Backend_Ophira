const express = require('express')
const router = express.Router()
const assetController = require('../controllers/assetController')
const authMiddleware = require('../middlewares/authMiddleware')

// CREAR ACTIVO
router.post('/', assetController.crearActivo)


// VER ACTIVOS (todos, buscar por id, buscar por nombre)
router.get('/', assetController.verActivos)
router.get('/id/:id', assetController.buscarActivoId)
router.get('/nombre/:nombre', assetController.buscarActivoNombre)
router.get('/aula/:aula', assetController.buscarActivoAula)
router.get('/activosUser', authMiddleware, assetController.verActivosDelUser)

//Obtener activos en Front
router.get('/activos', assetController.getActivosFront);
router.get('/activo/:id', assetController.getActivoFront);

// EDITAR Y ELIMINAR
router.delete('/:id', assetController.dropActivo)
router.put('/:id', assetController.editarActivo)
router.post('/cambiarAula', assetController.cambiarAula)

// Datos del dash
router.get('/dashboard', assetController.getDatosDashboard);
// Dtos para el reporte
router.get('/reporte', assetController.getDatosReporte);
router.get('/movimientos', assetController.getUltimosMovimientosActivo);

module.exports= router;
