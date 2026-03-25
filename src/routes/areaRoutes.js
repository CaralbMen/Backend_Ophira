const express = require('express');
const router = express.Router();
const areaController = require('../controllers/areaController');

router.get('/', areaController.getAreas);
router.post('/', areaController.crearArea);
router.delete('/:nombre_area', areaController.eliminarArea);

module.exports= router;