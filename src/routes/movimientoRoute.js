const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimientoController');

router.get('/verMovi',movimientoController.VerMovimiento)