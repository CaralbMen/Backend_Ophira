const express = require('express');
const router = express.Router();
const estadoActivoController = require('../controllers/estadoActivoController');

router.get('/', estadoActivoController.getEstadosActivos);
router.post('/', estadoActivoController.crearEstadoActivo);
router.put('/:id', estadoActivoController.editarEstadoActivo);
router.delete('/:id', estadoActivoController.eliminarEstadoActivo);

module.exports = router;