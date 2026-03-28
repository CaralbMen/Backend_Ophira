const express = require('express')
const router = express.Router()
const assetController = require('../controllers/assetController')

// CREAR ACTIVO
router.post('/', assetController.crearActivo)


// VER ACTIVOS (todos, buscar por id, buscar por nombre)
router.get('/', assetController.verActivos)
router.get('/id/:id', assetController.buscarActivoId)
router.get('/nombre/:nombre', assetController.buscarActivoNombre)

//Obtener activos en Front
router.get('/activos', assetController.getActivosFront);
router.get('/activo/:id', assetController.getActivoFront);

// EDITAR Y ELIMINAR
router.delete('/:id', assetController.dropActivo)
router.put('/:id', assetController.editarActivo)

// Datos del dash
router.get('/dashboard', assetController.getDatosDashboard);
module.exports= router;
