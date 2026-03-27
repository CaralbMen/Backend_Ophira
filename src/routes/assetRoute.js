const express = require('express')
const router = express.Router()
const assetController = require('../controllers/assetController')

// CREAR ACTIVO
router.post('/', assetController.crearActivo)


// VER ACTIVOS (todos, buscar por id, buscar por nombre)
router.get('/', assetController.verActivos)
router.get('/id/:id', assetController.buscarActivoId)
router.get('/nombre/:nombre', assetController.buscarActivoNombre)

//Obtener activos en
router.get('/activos', assetController.getActivosFront);

// EDITAR Y ELIMINAR
router.delete('/:id', assetController.dropActivo)
router.put('/:id', assetController.editarActivo)

module.exports= router;
