const express = require('express');
const router = express.Router();
const puestoController = require('../controllers/puestoController');

router.get('/', puestoController.obtenerPuestos);
router.post('/', puestoController.crearPuesto);
router.put('/:id_puesto', puestoController.actualizarPuesto);
router.delete('/:nombre_puesto', puestoController.eliminarPuesto);
module.exports= router;