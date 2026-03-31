const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimientoController');

// VER TODOS
router.get('/', movimientoController.verMovimiento)

// FILTROS
router.get('/tipo/:tipo', movimientoController.verMovimientoPorTipo)
router.get('/activo/:id', movimientoController.verMovimientoPorActivo)
router.get('/usuario/:id', movimientoController.verMovimientoPorUsuario)
router.get('/:id/detalle', movimientoController.verDetalleMovimiento)

// BUSCAR POR ID
router.get('/:id', movimientoController.buscarMovimientoID)

// CREAR
router.post('/', movimientoController.crearMovimiento)

// ELIMINAR
router.delete('/:id', movimientoController.dropMovimiento)

// EDITAR
router.put('/:id', movimientoController.editarMovimiento)

module.exports = router;