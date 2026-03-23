const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimientoController');

router.get('/',movimientoController.VerMovimiento)

router.get('/:id',movimientoController.BuscarMoviminetoID)

router.post('/',movimientoController,movimientoController.CrearMovimiento)