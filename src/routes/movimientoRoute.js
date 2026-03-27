const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimientoController');
const { editarEstadoActivo } = require('../controllers/estadoActivoController');

router.get('/',movimientoController.verMovimiento)

router.get('/:id',movimientoController.buscarMoviminetoID)

router.post('/',movimientoController,movimientoController.crearMovimiento)

router.delete('/:id',movimientoController,movimientoController.dropMovimiento)

router.put('/',movimientoController,editarEstadoActivo)