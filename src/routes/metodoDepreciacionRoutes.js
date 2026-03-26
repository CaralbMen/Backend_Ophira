const express = require('express');
const router = express.Router();
const metodoDepreciacionController = require('../controllers/metodoDepreciacionController');

router.get('/', metodoDepreciacionController.getMetodosDepreciacion);
router.post('/', metodoDepreciacionController.crearMetodoDepreciacion);
router.put('/:id', metodoDepreciacionController.editarMetodoDepreciacion);
router.delete('/:id', metodoDepreciacionController.eliminarMetodoDepreciacion);

module.exports = router;