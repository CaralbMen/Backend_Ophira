const express = require('express');
const router = express.Router();
const userController= require('../controllers/userController');

router.post('/registrar', userController.crearUsuario);
//router.post('/login', userController.login);
router.get('/', userController.obtenerUsuarios);
router.get('/:id', userController.obtenerUsuario);
router.put('/:id', userController.modificarUsuario);
router.delete('/:id', userController.eliminarUsuario);

module.exports= router;