const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

router.get('/', categoriaController.getCategorias);
router.post('/', categoriaController.crearCategoria);
router.put('/:id', categoriaController.editarCategoria);
router.delete('/:id', categoriaController.eliminarCategoria);

module.exports = router;